import api from "@/lib/api";

export async function getPublicInvitation(username, slug) {
  const response = await api.get(`/public/invitations/${username}/${slug}`);
  return response.data.data;
}
