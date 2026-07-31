import api from "@/lib/api";

export async function getAdminDashboard() {
  const response = await api.get("/admin/dashboard");
  return response.data.data;
}

export async function getAdminTransactions(status = "") {
  const response = await api.get("/admin/transactions", { params: status ? { status } : {} });
  return response.data.data.transactions;
}

export async function getAdminTransaction(id) {
  const response = await api.get(`/admin/transactions/${id}`);
  return response.data.data.transaction;
}

export async function approveTransaction(id, adminNote = "") {
  const response = await api.post(`/admin/transactions/${id}/approve`, { adminNote });
  return response.data.data.transaction;
}

export async function rejectTransaction(id, adminNote) {
  const response = await api.post(`/admin/transactions/${id}/reject`, { adminNote });
  return response.data.data.transaction;
}

export async function getAdminMembers(params = {}) {
  const response = await api.get("/admin/members", { params });
  return response.data.data.members;
}

export async function getAdminMember(id) {
  const response = await api.get(`/admin/members/${id}`);
  return response.data.data.member;
}

export async function updateMemberStatus(id, status) {
  const response = await api.patch(`/admin/members/${id}/status`, { status });
  return response.data.data.member;
}

export async function adjustMemberCredits(id, payload) {
  const response = await api.post(`/admin/members/${id}/credits/adjust`, payload);
  return response.data.data;
}

export async function getAdminCreditPackages() {
  const response = await api.get("/admin/credit-packages");
  return response.data.data.packages;
}

export async function createCreditPackage(payload) {
  const response = await api.post("/admin/credit-packages", payload);
  return response.data.data.package;
}

export async function updateCreditPackage(id, payload) {
  const response = await api.patch(`/admin/credit-packages/${id}`, payload);
  return response.data.data.package;
}

export async function setCreditPackageStatus(id, isActive) {
  const response = await api.patch(`/admin/credit-packages/${id}/status`, { isActive });
  return response.data.data.package;
}

export async function deleteCreditPackage(id) {
  const response = await api.post(`/admin/credit-packages/${id}/delete`);
  return response.data.data;
}

export async function getAdminThemes() {
  const response = await api.get("/admin/themes");
  return response.data.data.themes;
}

export async function createTheme(payload) {
  const response = await api.post("/admin/themes", payload);
  return response.data.data.theme;
}

export async function setThemeStatus(id, isActive) {
  const response = await api.patch(`/admin/themes/${id}/status`, { isActive });
  return response.data.data.theme;
}

export async function getAdminMusic() {
  const response = await api.get("/admin/music");
  return response.data.data.music;
}

export async function createMusic(payload) {
  const response = await api.post("/admin/music", payload);
  return response.data.data.music;
}

export async function setMusicStatus(id, isActive) {
  const response = await api.patch(`/admin/music/${id}/status`, { isActive });
  return response.data.data.music;
}

export async function getAdminInvitations(status = "") {
  const response = await api.get("/admin/invitations", { params: status ? { status } : {} });
  return response.data.data.invitations;
}

export async function getAdminInvitation(id) {
  const response = await api.get(`/admin/invitations/${id}`);
  return response.data.data.invitation;
}

export async function unlockInvitation(id, note = "") {
  const response = await api.post(`/admin/invitations/${id}/unlock`, { note });
  return response.data.data.invitation;
}

export async function getAuditLogs() {
  const response = await api.get("/admin/audit-logs");
  return response.data.data.auditLogs;
}

export async function getRevenueReport(params = {}) {
  const response = await api.get("/admin/reports/revenue", { params });
  return response.data.data.report;
}

export async function getCreditReport(params = {}) {
  const response = await api.get("/admin/reports/credits", { params });
  return response.data.data.report;
}

export async function getThemeReport(params = {}) {
  const response = await api.get("/admin/reports/themes", { params });
  return response.data.data.report;
}
