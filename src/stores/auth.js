import { defineStore } from "pinia";

import api, { getApiErrorMessage, setAccessToken } from "@/lib/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
    ready: false,
    error: ""
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    isMember: (state) => state.user?.role === "member",
    isAdmin: (state) => state.user?.role === "admin",
    needsOnboarding: (state) => Boolean(state.user?.onboardingRequired || !state.user?.termsAcceptedAt)
  },
  actions: {
    applySession(payload) {
      this.user = payload?.user || null;
      setAccessToken(payload?.accessToken || "");
    },
    async hydrate() {
      if (this.ready || this.loading) {
        return this.user;
      }

      this.loading = true;
      this.error = "";

      try {
        const response = await api.get("/auth/me");
        this.user = response.data.data.user;
        return this.user;
      } catch {
        this.user = null;
        setAccessToken("");
        return null;
      } finally {
        this.ready = true;
        this.loading = false;
      }
    },
    async loginWithGoogle(idToken) {
      this.loading = true;
      this.error = "";

      try {
        const response = await api.post("/auth/google", { idToken });
        this.applySession(response.data.data);
        this.ready = true;
        return this.user;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Login Google gagal.");
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async completeOnboarding(payload) {
      this.loading = true;
      this.error = "";

      try {
        const response = await api.post("/auth/onboarding", payload);
        this.user = response.data.data.user;
        return this.user;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Onboarding gagal disimpan.");
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        await api.post("/auth/logout");
      } finally {
        this.user = null;
        this.ready = true;
        setAccessToken("");
      }
    }
  }
});
