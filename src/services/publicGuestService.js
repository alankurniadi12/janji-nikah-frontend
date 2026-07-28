import api from "@/lib/api";

export async function getPublicGuestInvitation(username, slug, token) {
  const response = await api.get(`/public/invitations/${username}/${slug}/guest/${token}`);
  return response.data.data;
}

export async function markPublicGuestOpened(username, slug, token) {
  const response = await api.post(`/public/invitations/${username}/${slug}/guest/${token}/open`);
  return response.data.data;
}

export async function submitPublicRsvp(username, slug, token, status) {
  const response = await api.post(`/public/invitations/${username}/${slug}/guest/${token}/rsvp`, { status });
  return response.data.data.rsvp;
}

export async function submitPublicWish(username, slug, token, payload) {
  const response = await api.post(`/public/invitations/${username}/${slug}/guest/${token}/wishes`, payload);
  return response.data.data.wish;
}

export async function updatePublicWish(username, slug, token, wishId, payload) {
  const response = await api.patch(`/public/invitations/${username}/${slug}/guest/${token}/wishes/${wishId}`, payload);
  return response.data.data.wish;
}
