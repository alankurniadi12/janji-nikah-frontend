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
      .catch((refreshError) => {
        setAccessToken("");
        refreshError.isAuthSessionExpired = true;
        throw refreshError;
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
  const guidance = getApiErrorGuidance(error, fallback);
  return guidance.message;
}

export function getApiErrorGuidance(error, fallback = "Terjadi kesalahan. Coba lagi sebentar.") {
  if (isAuthSessionError(error)) {
    return {
      title: "Sesi login berakhir",
      message: "Sesi login kamu sudah berakhir. Masuk ulang, lalu ulangi aksi terakhir dari halaman yang sama.",
      actionLabel: "Masuk Ulang",
      actionTo: buildLoginRedirect()
    };
  }

  if (!error.response) {
    return {
      title: "Koneksi bermasalah",
      message: "Koneksi ke server terputus. Cek internet atau pastikan server Janji Nikah sedang berjalan, lalu coba lagi.",
      actionLabel: "Coba Lagi"
    };
  }

  const status = error.response.status;
  const serverMessage = error.response.data?.message;

  if (status === 400) {
    return {
      title: "Data belum sesuai",
      message: serverMessage || "Periksa kembali data yang diisi, lalu coba lagi."
    };
  }

  if (status === 401) {
    return {
      title: "Perlu login ulang",
      message: "Akses kamu tidak valid. Masuk ulang, lalu ulangi aksi terakhir.",
      actionLabel: "Masuk Ulang",
      actionTo: buildLoginRedirect()
    };
  }

  if (status === 403) {
    return {
      title: "Akses tidak diizinkan",
      message: serverMessage || "Akun tidak punya izin untuk melakukan aksi ini. Hubungi admin jika menurutmu ini keliru."
    };
  }

  if (status === 404) {
    return {
      title: "Data tidak ditemukan",
      message: serverMessage || "Data yang kamu buka tidak ditemukan. Kembali ke daftar, lalu pilih data yang masih tersedia."
    };
  }

  if (status === 409) {
    return {
      title: "Aksi belum bisa dilanjutkan",
      message: serverMessage || "Kondisi data sudah berubah. Muat ulang halaman, lalu cek status terbaru."
    };
  }

  if (status === 413) {
    return {
      title: "File terlalu besar",
      message: "Ukuran file terlalu besar. Kompres gambar atau pilih file lain, lalu upload ulang."
    };
  }

  if (status >= 500) {
    return {
      title: "Server bermasalah",
      message: "Server sedang bermasalah. Tunggu sebentar lalu coba lagi. Jika tetap gagal, hubungi admin."
    };
  }

  return {
    title: "Aksi gagal",
    message: serverMessage || error.message || fallback
  };
}

export function isAuthSessionError(error) {
  const message = error.response?.data?.message || "";
  return Boolean(
    error.isAuthSessionExpired ||
      (error.response?.status === 401 &&
        [
          "Session tidak ditemukan",
          "Sesi login tidak ditemukan",
          "Token tidak valid",
          "Token tidak valid atau sudah kedaluwarsa",
          "Akses membutuhkan token",
          "User tidak ditemukan"
        ].some((pattern) => message.includes(pattern)))
  );
}

function buildLoginRedirect() {
  if (typeof window === "undefined") {
    return "/login";
  }

  const redirect = `${window.location.pathname}${window.location.search}`;
  return `/login?redirect=${encodeURIComponent(redirect)}`;
}

export default api;
