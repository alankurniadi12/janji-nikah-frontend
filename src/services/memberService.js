import api from "@/lib/api";

export async function getMemberDashboard() {
  const response = await api.get("/member/dashboard");
  return response.data.data;
}

export async function getMemberNotifications() {
  const response = await api.get("/member/notifications");
  return response.data.data.notifications;
}

export async function markNotificationRead(id) {
  const response = await api.patch(`/member/notifications/${id}/read`);
  return response.data.data.notification;
}
