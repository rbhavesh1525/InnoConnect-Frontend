import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Search, Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../Components/CompIndex";
import {
  fetchUsers,
  fetchConversation,
  sendMessage,
  getUserIdFromToken,
  getWebSocketUrl,
} from "../services/messageApi";
import {
  fetchIncomingRequests,
  fetchSentRequests,
  acceptCollaborationRequest,
  rejectCollaborationRequest,
} from "../services/collaborationApi";

function formatMessageTime(createdAt) {
  if (!createdAt) return "";
  return new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const UserChat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState("");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestActionLoading, setRequestActionLoading] = useState({});
  const [lastRequestAction, setLastRequestAction] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const appendMessage = useCallback((userId, msg) => {
    setChat((prev) => {
      const existing = prev[userId] || [];
      if (existing.some((m) => m.id === msg.id)) return prev;

      return {
        ...prev,
        [userId]: [...existing, msg],
      };
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      navigate("/login");
      return;
    }

    setCurrentUserId(userId);

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch {
        setError("Failed to load users. Please try again.");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [navigate]);

  const loadCollaborationRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const [incoming, sent] = await Promise.all([
        fetchIncomingRequests(),
        fetchSentRequests(),
      ]);
      setIncomingRequests(Array.isArray(incoming) ? incoming : []);
      setSentRequests(Array.isArray(sent) ? sent : []);
    } catch {
      setError("Failed to load collaboration requests.");
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    loadCollaborationRequests();
  }, [loadCollaborationRequests]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !currentUserId) return;

    const ws = new WebSocket(getWebSocketUrl());
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event !== "newMessage" || !payload.data) return;

        const msg = payload.data;
        const otherUserId =
          msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;

        appendMessage(otherUserId, msg);
        loadCollaborationRequests();
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {
      setError("Real-time connection lost. Messages may be delayed.");
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setWsConnected(false);
    };
  }, [currentUserId, appendMessage, loadCollaborationRequests]);

  useEffect(() => {
    if (!selectedUser) return;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setError("");
        const messages = await fetchConversation(selectedUser.user_id);
        setChat((prev) => ({
          ...prev,
          [selectedUser.user_id]: messages,
        }));
      } catch {
        setError("Failed to load conversation.");
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [chat, selectedUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser || message.trim() === "" || sending) return;

    const text = message.trim();
    setMessage("");
    setSending(true);

    try {
      const saved = await sendMessage(selectedUser.user_id, text);
      appendMessage(selectedUser.user_id, saved);
    } catch {
      setMessage(text);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    setRequestActionLoading((prev) => ({ ...prev, [requestId]: action }));
    setError("");

    try {
      let response;
      if (action === "accept") {
        response = await acceptCollaborationRequest(requestId);
      } else {
        response = await rejectCollaborationRequest(requestId);
      }

      setIncomingRequests((prev) =>
        prev.filter((req) => req.request_id !== requestId)
      );

      if (response?.notification && selectedUser) {
        appendMessage(selectedUser.user_id, response.notification);
      }

      setLastRequestAction({
        userId: selectedUser?.user_id,
        message:
          action === "accept"
            ? "You accepted this collaboration request."
            : "You declined this collaboration request.",
      });

      await loadCollaborationRequests();
    } catch {
      setError(
        `Failed to ${action} collaboration request. Please try again.`
      );
    } finally {
      setRequestActionLoading((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
    }
  };

  const handleSelectRequest = (request) => {
    const sender = users.find((user) => user.user_id === request.sender_id);
    if (sender) {
      setSelectedUser(sender);
      return;
    }

    setSelectedUser({
      user_id: request.sender_id,
      name: request.sender_name,
      email: request.sender_email,
    });
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMessages = selectedUser ? chat[selectedUser.user_id] || [] : [];

  const selectedUserRequests = selectedUser
    ? incomingRequests.filter((req) => req.sender_id === selectedUser.user_id)
    : [];

  const selectedUserSentRequests = selectedUser
    ? sentRequests.filter((req) => req.receiver_id === selectedUser.user_id)
    : [];

  const renderSentRequestCard = (request) => {
    const statusStyles = {
      pending: {
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        label: "Pending",
        message: `You sent a collaboration request for "${request.project_title}". Waiting for a response.`,
      },
      accepted: {
        badge: "bg-green-100 text-green-800 border-green-200",
        label: "Accepted",
        message: `Your collaboration request for "${request.project_title}" was accepted.`,
      },
      rejected: {
        badge: "bg-gray-100 text-gray-700 border-gray-200",
        label: "Declined",
        message: `Your collaboration request for "${request.project_title}" was declined.`,
      },
    };

    const style = statusStyles[request.status] || statusStyles.pending;

    return (
      <div
        key={request.request_id}
        className="border border-blue-200 bg-blue-50 rounded-xl p-4 mb-3"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2">
            <Handshake size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Collaboration Request Sent
              </p>
              <p className="text-sm text-gray-700 mt-1">{style.message}</p>
            </div>
          </div>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full border shrink-0 ${style.badge}`}
          >
            {style.label}
          </span>
        </div>
      </div>
    );
  };

  const renderRequestCard = (request) => {
    const isLoading = requestActionLoading[request.request_id];

    return (
      <div
        key={request.request_id}
        className="border border-indigo-200 bg-indigo-50 rounded-xl p-4 mb-3"
      >
        <div className="flex items-start gap-2 mb-2">
          <Handshake size={18} className="text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-800">
              Collaboration Request
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">{request.sender_name}</span> wants
              to collaborate on{" "}
              <span className="font-medium">"{request.project_title}"</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => handleRequestAction(request.request_id, "accept")}
            disabled={Boolean(isLoading)}
            className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
          >
            {isLoading === "accept" ? "Accepting..." : "Accept"}
          </button>
          <button
            type="button"
            onClick={() => handleRequestAction(request.request_id, "reject")}
            disabled={Boolean(isLoading)}
            className="flex-1 bg-white text-gray-700 text-sm font-medium py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-60"
          >
            {isLoading === "reject" ? "Declining..." : "Decline"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex justify-center items-center bg-gray-50 py-2 px-4">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md border border-blue-300 shadow-blue-200 flex overflow-hidden h-[calc(100vh-120px)]">
          {/* LEFT PANEL - USER LIST */}
          <div className="w-1/3 border-r border-blue-200 p-4 flex flex-col">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Messages</h2>

            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none px-2 flex-1 text-sm"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-3">{error}</p>
            )}

            {loadingRequests ? (
              <p className="text-gray-500 text-sm mb-3">
                Loading collaboration requests...
              </p>
            ) : incomingRequests.length > 0 ? (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-indigo-700 mb-2">
                  Collaboration Requests ({incomingRequests.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {incomingRequests.map((request) => (
                    <button
                      key={request.request_id}
                      type="button"
                      onClick={() => handleSelectRequest(request)}
                      className={`w-full text-left border rounded-xl p-3 transition ${
                        selectedUser?.user_id === request.sender_id
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-indigo-100 hover:bg-indigo-50"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {request.sender_name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {request.project_title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Loading users...
                </p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No users found.
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.user_id}
                    onClick={() => {
                      setSelectedUser(user);
                      setLastRequestAction(null);
                    }}
                    className={`p-3 rounded-xl mb-2 cursor-pointer transition ${
                      selectedUser?.user_id === user.user_id
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{user.name}</p>
                      {incomingRequests.some(
                        (req) => req.sender_id === user.user_id
                      ) && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          Request
                        </span>
                      )}
                      {sentRequests.some(
                        (req) =>
                          req.receiver_id === user.user_id &&
                          req.status === "pending"
                      ) && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Sent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANEL - CHAT WINDOW */}
          <div className="w-2/3 flex flex-col">
            {selectedUser ? (
              <>
                <div className="border-b border-blue-200 px-5 py-3 flex justify-between items-center bg-blue-50">
                  <h3 className="text-lg font-semibold text-blue-700">
                    {selectedUser.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {wsConnected ? "Connected" : "Connecting..."}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
                  {lastRequestAction?.userId === selectedUser.user_id && (
                    <div className="border border-green-200 bg-green-50 rounded-xl p-4 mb-3">
                      <p className="text-sm font-medium text-green-800">
                        {lastRequestAction.message}
                      </p>
                    </div>
                  )}

                  {selectedUserSentRequests.map((request) =>
                    renderSentRequestCard(request)
                  )}

                  {selectedUserRequests.map((request) =>
                    renderRequestCard(request)
                  )}

                  {loadingMessages ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Loading messages...
                    </p>
                  ) : activeMessages.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No messages yet. Say hello!
                    </p>
                  ) : (
                    activeMessages.map((msg) => {
                      const isMine = msg.sender_id === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          } mb-3`}
                        >
                          <div
                            className={`px-4 py-2 rounded-2xl max-w-sm ${
                              isMine
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            <p>{msg.message}</p>
                            <span
                              className={`text-xs block mt-1 text-right ${
                                isMine ? "text-blue-200" : "text-gray-500"
                              }`}
                            >
                              {formatMessageTime(msg.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="flex items-center border-t border-blue-200 px-4 py-3 bg-white"
                >
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sending}
                    className="flex-1 border border-blue-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="ml-3 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex justify-center items-center text-gray-500">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserChat;
