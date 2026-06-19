import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id ?? null;
  } catch {
    return null;
  }
}

export function getWebSocketUrl() {
  const token = localStorage.getItem("token");
  const wsBase = API_URL.replace(/^http/, "ws");
  return `${wsBase}/ws?token=${token}`;
}

export async function fetchUsers() {
  const res = await axios.get(`${API_URL}/api/auth/`, {
    headers: getAuthHeaders(),
  });
  return res.data.users;
}

export async function fetchConversation(userId) {
  const res = await axios.get(`${API_URL}/messages/${userId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.messages;
}

export async function sendMessage(receiverId, message) {
  const res = await axios.post(
    `${API_URL}/messages/send`,
    { receiver_id: receiverId, message },
    { headers: getAuthHeaders() }
  );
  return res.data.message;
}
