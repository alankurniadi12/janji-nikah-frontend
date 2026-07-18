import { defineStore } from "pinia";

import { getApiErrorMessage } from "@/lib/api";
import {
  getMemberDashboard,
  getMemberNotifications,
  markNotificationRead
} from "@/services/memberService";

export const useMemberDashboardStore = defineStore("memberDashboard", {
  state: () => ({
    dashboard: null,
    notifications: [],
    loading: false,
    notificationsLoading: false,
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
    },
    async loadNotifications() {
      this.notificationsLoading = true;

      try {
        this.notifications = await getMemberNotifications();
      } catch (error) {
        this.error = getApiErrorMessage(error, "Notifikasi belum bisa dimuat.");
      } finally {
        this.notificationsLoading = false;
      }
    },
    async readNotification(id) {
      const notification = await markNotificationRead(id);
      this.notifications = this.notifications.map((item) => (item.id === id ? notification : item));

      if (this.dashboard?.notifications?.unread) {
        this.dashboard.notifications.unread = Math.max(0, this.dashboard.notifications.unread - 1);
      }
    }
  }
});
