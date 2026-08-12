import api from "@/lib/api";

export async function getPublicInvitation(username, slug, params = {}) {
  const response = await api.get(`/public/invitations/${username}/${slug}`, { params });
  return response.data.data;
}

export async function getPublicHostDashboard(username, slug, token) {
  const response = await api.get(`/public/invitations/${username}/${slug}/host/${token}`, {
    params: { _: Date.now() }
  });
  return response.data.data;
}
