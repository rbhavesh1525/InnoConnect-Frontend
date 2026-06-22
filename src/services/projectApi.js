import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function checkSimilarity(project) {
  const res = await axios.post(`${API_URL}/similarity`, project, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data.results;
}

export async function submitProject(project) {
  const res = await axios.post(`${API_URL}/submit-project`, project, {
    headers: getAuthHeaders(),
  });
  return res.data;
}
