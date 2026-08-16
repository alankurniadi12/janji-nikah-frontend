import api from "@/lib/api";

export async function getMemberDashboard() {
  const response = await api.get("/member/dashboard");
  return response.data.data;
}
