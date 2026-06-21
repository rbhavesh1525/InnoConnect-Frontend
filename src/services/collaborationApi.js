import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function sendCollaborationRequest(receiverId, projectId) {
  const res = await axios.post(
    `${API_URL}/collaboration/send`,
    { receiver_id: receiverId, project_id: projectId },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function fetchIncomingRequests() {
  const res = await axios.get(`${API_URL}/collaboration/incoming`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function fetchSentRequests() {
  const res = await axios.get(`${API_URL}/collaboration/sent`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function acceptCollaborationRequest(requestId) {
  const res = await axios.post(
    `${API_URL}/collaboration/accept/${requestId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function rejectCollaborationRequest(requestId) {
  const res = await axios.post(
    `${API_URL}/collaboration/reject/${requestId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}
