import api from "@/lib/api";

export async function getPublicInvitation(username, slug, params = {}) {
  const response = await api.get(`/public/invitations/${username}/${slug}`, { params });
  return response.data.data;
}
