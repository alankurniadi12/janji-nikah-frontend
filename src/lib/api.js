import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  headers: {
    Accept: "application/json"
  }
});

let accessToken = localStorage.getItem("janjiNikah.accessToken") || "";
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token || "";

  if (accessToken) {
    localStorage.setItem("janjiNikah.accessToken", accessToken);
    return;
  }

  localStorage.removeItem("janjiNikah.accessToken");
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest?._retry || originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshPromise ||= api
      .post("/auth/refresh")
      .then((response) => {
        const token = response.data?.data?.accessToken;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });

    const token = await refreshPromise;
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return api(originalRequest);
  }
);

export function getApiErrorMessage(error, fallback = "Terjadi kesalahan. Coba lagi sebentar.") {
  return error.response?.data?.message || error.message || fallback;
}

export default api;
