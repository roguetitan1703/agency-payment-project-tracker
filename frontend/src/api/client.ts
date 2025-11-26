import axios, { AxiosInstance } from "axios";

const baseURL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3001/api";

const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // Optionally handle 401/403, refresh logic could be added here
    return Promise.reject(error);
  }
);

export default apiClient;
