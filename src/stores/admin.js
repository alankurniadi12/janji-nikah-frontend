import { defineStore } from "pinia";

import { getApiErrorMessage } from "@/lib/api";
import * as adminService from "@/services/adminService";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    dashboard: null,
    transactions: [],
    currentTransaction: null,
    members: [],
    creditPackages: [],
    themes: [],
    music: [],
    invitations: [],
    auditLogs: [],
    reports: {
      revenue: null,
      credits: null,
      themes: null
    },
    loading: false,
    saving: false,
    error: ""
  }),
  actions: {
    async run(task, fallback) {
      this.loading = true;
      this.error = "";

      try {
        return await task();
      } catch (error) {
        this.error = getApiErrorMessage(error, fallback);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async mutate(task, fallback) {
      this.saving = true;
      this.error = "";

      try {
        return await task();
      } catch (error) {
        this.error = getApiErrorMessage(error, fallback);
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async loadDashboard() {
      this.dashboard = await this.run(() => adminService.getAdminDashboard(), "Dashboard admin belum bisa dimuat.");
    },
    async loadTransactions(status = "") {
      this.transactions = await this.run(() => adminService.getAdminTransactions(status), "Transaksi belum bisa dimuat.");
    },
    async loadTransaction(id) {
      this.currentTransaction = await this.run(() => adminService.getAdminTransaction(id), "Detail transaksi belum bisa dimuat.");
    },
    async approveTransaction(id, adminNote = "") {
      const transaction = await this.mutate(() => adminService.approveTransaction(id, adminNote), "Transaksi belum bisa diapprove.");
      this.transactions = this.transactions.map((item) => (item.id === id ? transaction : item));
      if (this.currentTransaction?.id === id) {
        this.currentTransaction = {
          ...this.currentTransaction,
          ...transaction
        };
      }
      return transaction;
    },
    async rejectTransaction(id, adminNote) {
      const transaction = await this.mutate(() => adminService.rejectTransaction(id, adminNote), "Transaksi belum bisa ditolak.");
      this.transactions = this.transactions.map((item) => (item.id === id ? transaction : item));
      if (this.currentTransaction?.id === id) {
        this.currentTransaction = {
          ...this.currentTransaction,
          ...transaction
        };
      }
      return transaction;
    },
    async loadMembers(params = {}) {
      this.members = await this.run(() => adminService.getAdminMembers(params), "Member belum bisa dimuat.");
    },
    async updateMemberStatus(id, status) {
      const member = await this.mutate(() => adminService.updateMemberStatus(id, status), "Status member belum bisa diubah.");
      this.members = this.members.map((item) => (item.id === id ? member : item));
      return member;
    },
    async adjustMemberCredits(id, payload) {
      const data = await this.mutate(() => adminService.adjustMemberCredits(id, payload), "Kredit member belum bisa diadjust.");
      this.members = this.members.map((item) => (item.id === id ? data.member : item));
      return data;
    },
    async loadCreditPackages() {
      this.creditPackages = await this.run(() => adminService.getAdminCreditPackages(), "Paket kredit belum bisa dimuat.");
    },
    async saveCreditPackage(payload) {
      const item = payload.id
        ? await this.mutate(() => adminService.updateCreditPackage(payload.id, payload), "Paket kredit belum bisa disimpan.")
        : await this.mutate(() => adminService.createCreditPackage(payload), "Paket kredit belum bisa dibuat.");
      this.creditPackages = [item, ...this.creditPackages.filter((row) => row.id !== item.id)];
      return item;
    },
    async setCreditPackageStatus(id, isActive) {
      const item = await this.mutate(() => adminService.setCreditPackageStatus(id, isActive), "Status paket belum bisa diubah.");
      this.creditPackages = this.creditPackages.map((row) => (row.id === id ? item : row));
    },
    async loadThemes() {
      this.themes = await this.run(() => adminService.getAdminThemes(), "Tema belum bisa dimuat.");
    },
    async createTheme(payload) {
      const theme = await this.mutate(() => adminService.createTheme(payload), "Tema belum bisa dibuat.");
      this.themes = [theme, ...this.themes];
    },
    async setThemeStatus(id, isActive) {
      const theme = await this.mutate(() => adminService.setThemeStatus(id, isActive), "Status tema belum bisa diubah.");
      this.themes = this.themes.map((row) => (row.id === id ? theme : row));
    },
    async loadMusic() {
      this.music = await this.run(() => adminService.getAdminMusic(), "Musik belum bisa dimuat.");
    },
    async createMusic(payload) {
      const music = await this.mutate(() => adminService.createMusic(payload), "Musik belum bisa dibuat.");
      this.music = [music, ...this.music];
    },
    async setMusicStatus(id, isActive) {
      const music = await this.mutate(() => adminService.setMusicStatus(id, isActive), "Status musik belum bisa diubah.");
      this.music = this.music.map((row) => (row.id === id ? music : row));
    },
    async loadInvitations(status = "") {
      this.invitations = await this.run(() => adminService.getAdminInvitations(status), "Undangan belum bisa dimuat.");
    },
    async unlockInvitation(id, note = "") {
      const invitation = await this.mutate(() => adminService.unlockInvitation(id, note), "Undangan belum bisa dibuka lock.");
      this.invitations = this.invitations.map((row) => (row.id === id ? invitation : row));
    },
    async loadAuditLogs() {
      this.auditLogs = await this.run(() => adminService.getAuditLogs(), "Audit log belum bisa dimuat.");
    },
    async loadReports(params = {}) {
      const [revenue, credits, themes] = await this.run(
        () => Promise.all([
          adminService.getRevenueReport(params),
          adminService.getCreditReport(params),
          adminService.getThemeReport(params)
        ]),
        "Laporan belum bisa dimuat."
      );
      this.reports = { revenue, credits, themes };
    }
  }
});
