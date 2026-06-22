import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  fetchUnreadCounts,
  markConversationRead as markConversationReadApi,
  getWebSocketUrl,
  getUserIdFromToken,
} from "../services/messageApi";
import { fetchPendingRequestCount } from "../services/collaborationApi";

const WS_RECONNECT_BASE_DELAY = 1000;  // 1s
const WS_RECONNECT_MAX_DELAY  = 30000; // 30s

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [unreadByUser, setUnreadByUser] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  // Stores the latest incoming message so components can react without
  // needing a handler registered at the exact moment the WS event fires.
  const [latestIncomingMessage, setLatestIncomingMessage] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectDelayRef = useRef(WS_RECONNECT_BASE_DELAY);
  const activeConversationRef = useRef(null);
  const messageHandlersRef = useRef(new Set());
  const collaborationHandlersRef = useRef(new Set());

  const applyUnreadCounts = useCallback((counts) => {
    if (!counts) return;
    setUnreadByUser(counts.by_user || {});
    setTotalUnread(counts.total || 0);
  }, []);

  const refreshCounts = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [unread, pending] = await Promise.all([
        fetchUnreadCounts(),
        fetchPendingRequestCount(),
      ]);
      applyUnreadCounts(unread);
      setPendingRequests(pending);
    } catch {
      // counts remain at last known values
    }
  }, [applyUnreadCounts]);

  const setActiveConversation = useCallback((userId) => {
    activeConversationRef.current = userId;
  }, []);

  const markConversationRead = useCallback(
    async (userId) => {
      if (!userId) return;

      try {
        const counts = await markConversationReadApi(userId);
        applyUnreadCounts(counts);
      } catch {
        setUnreadByUser((prev) => {
          const removed = prev[userId] || 0;
          const next = { ...prev };
          delete next[userId];
          setTotalUnread((total) => Math.max(0, total - removed));
          return next;
        });
      }
    },
    [applyUnreadCounts]
  );

  const registerMessageHandler = useCallback((handler) => {
    messageHandlersRef.current.add(handler);
    return () => messageHandlersRef.current.delete(handler);
  }, []);

  const registerCollaborationHandler = useCallback((handler) => {
    collaborationHandlersRef.current.add(handler);
    return () => collaborationHandlersRef.current.delete(handler);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    refreshCounts();
  }, [refreshCounts]);

  // ── WebSocket connection with auto-reconnect ──────────────────────────────
  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem("token");
    const currentUserId = getUserIdFromToken();
    if (!token || !currentUserId) return;

    // Close any existing connection before opening a new one
    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent re-triggering reconnect
      wsRef.current.close();
    }

    const ws = new WebSocket(getWebSocketUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      reconnectDelayRef.current = WS_RECONNECT_BASE_DELAY; // reset backoff
      // Re-fetch counts in case we missed events while disconnected
      refreshCounts();
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.event === "newMessage" && payload.data) {
          // Publish to context state — components react even if their
          // local handler wasn't registered yet (e.g. StrictMode re-mount).
          setLatestIncomingMessage(payload.data);
          messageHandlersRef.current.forEach((handler) => handler(payload.data));

          const uid = getUserIdFromToken();
          const msg = payload.data;

          if (
            uid &&
            msg.receiver_id === uid &&
            activeConversationRef.current === msg.sender_id
          ) {
            markConversationRead(msg.sender_id);
            return;
          }

          if (payload.unread_counts) {
            applyUnreadCounts(payload.unread_counts);
          } else if (uid && msg.receiver_id === uid) {
            setUnreadByUser((prev) => ({
              ...prev,
              [msg.sender_id]: (prev[msg.sender_id] || 0) + 1,
            }));
            setTotalUnread((prev) => prev + 1);
          }
          return;
        }

        if (payload.event === "unreadCountsUpdated" && payload.data) {
          applyUnreadCounts(payload.data);
          return;
        }

        if (payload.event === "newCollaborationRequest") {
          if (typeof payload.pending_count === "number") {
            setPendingRequests(payload.pending_count);
          } else {
            setPendingRequests((prev) => prev + 1);
          }
          collaborationHandlersRef.current.forEach((handler) =>
            handler(payload.data)
          );
          return;
        }

        if (payload.event === "collaborationCountsUpdated") {
          if (typeof payload.pending_count === "number") {
            setPendingRequests(payload.pending_count);
          }
          collaborationHandlersRef.current.forEach((handler) => handler(null));
        }
      } catch {
        // ignore malformed messages
      }
    };

    const scheduleReconnect = () => {
      setWsConnected(false);
      const delay = reconnectDelayRef.current;
      reconnectDelayRef.current = Math.min(delay * 2, WS_RECONNECT_MAX_DELAY);
      reconnectTimerRef.current = setTimeout(() => {
        connectWebSocket();
      }, delay);
    };

    ws.onerror = () => scheduleReconnect();
    ws.onclose = () => scheduleReconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyUnreadCounts, markConversationRead, refreshCounts]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    connectWebSocket();

    return () => {
      // Cleanup: stop reconnect timer and close socket cleanly
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent re-triggering reconnect
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
    };
  }, [connectWebSocket]);

  const value = {
    unreadByUser,
    totalUnread,
    pendingRequests,
    latestIncomingMessage,
    wsConnected,
    refreshCounts,
    applyUnreadCounts,
    markConversationRead,
    setActiveConversation,
    registerMessageHandler,
    registerCollaborationHandler,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
