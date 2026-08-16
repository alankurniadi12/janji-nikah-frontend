import { defineStore } from "pinia";

import { getApiErrorMessage } from "@/lib/api";
import { getMemberDashboard } from "@/services/memberService";

export const useMemberDashboardStore = defineStore("memberDashboard", {
  state: () => ({
    dashboard: null,
    loading: false,
    error: ""
  }),
  actions: {
    async loadDashboard() {
      this.loading = true;
      this.error = "";

      try {
        this.dashboard = await getMemberDashboard();
      } catch (error) {
        this.error = getApiErrorMessage(error, "Dashboard belum bisa dimuat.");
      } finally {
        this.loading = false;
      }
    }
  }
});
