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

export async function getAIGuidance(project) {
  const res = await axios.post(
    `${API_URL}/innovation/generate-guidance`,
    project,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

export async function sendChatMessage({ project, similarProjects, message }) {
  const res = await axios.post(
    `${API_URL}/innovation/chat`,
    {
      project_title: project.project_title,
      problem_statement: project.problem_statement,
      solution_overview: project.solution_overview,
      industry_category: project.industry_category,
      similar_projects: similarProjects ?? [],
      message,
    },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data; // { reply: "..." }
}

export async function getUserProjects(userId) {
  const res = await axios.get(`${API_URL}/user-projects/${userId}`, {
    headers: getAuthHeaders(),
  });
  return res.data.projects;
}
