import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (creds) => api.post("/api/auth/login", creds),
  register: (data) => api.post("/api/auth/register", data),
};

export const incidents = {
  getIncidents: (location) => api.get("/api/incidents", { params: { location } }),
  createIncident: (data) => api.post("/api/incidents", data),
};

export const accidents = {
  getAccidents: (location) => api.get("/api/accidents", { params: { location } }),
  createAccident: (data) => api.post("/api/accidents", data),
};

export const news = {
  getNews: (location) => api.get("/api/news", { params: { location } }),
  createNews: (data) => api.post("/api/news", data),
};

export const ai = {
  analyzeIncident: (data) => api.post("/api/ai/analyze-incident", data),
  generateAlert: (data) => api.post("/api/ai/generate-alert", data),
  summarizeNews: (data) => api.post("/api/ai/summarize-news", data),
  chat: (message, location) => api.post("/api/ai/chat", { message, location }),
};

export const users = {
  getProfile: () => api.get("/api/users/profile"),
  updateProfile: (data) => api.put("/api/users/profile", data),
  updateBlockchainStatus: (data) => api.patch("/api/users/blockchain-status", data),
};

export default api;
