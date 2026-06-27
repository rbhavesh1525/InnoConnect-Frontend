import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function sendFundRequest(receiverId, projectId) {
  const res = await axios.post(
    `${API_URL}/fund-request/send`,
    { receiver_id: receiverId, project_id: projectId },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function fetchPendingFundRequestCount() {
  const res = await axios.get(`${API_URL}/fund-request/incoming/count`, {
    headers: getAuthHeaders(),
  });
  return res.data.count;
}

export async function fetchIncomingFundRequests() {
  const res = await axios.get(`${API_URL}/fund-request/incoming`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function fetchSentFundRequests() {
  const res = await axios.get(`${API_URL}/fund-request/sent`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}

export async function acceptFundRequest(requestId) {
  const res = await axios.post(
    `${API_URL}/fund-request/accept/${requestId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function rejectFundRequest(requestId) {
  const res = await axios.post(
    `${API_URL}/fund-request/reject/${requestId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}
