import api from "@/lib/api";

export async function getGuests(invitationId) {
  const response = await api.get(`/member/invitations/${invitationId}/guests`);
  return response.data.data.guests;
}

export async function createGuest(invitationId, name) {
  const response = await api.post(`/member/invitations/${invitationId}/guests`, { name });
  return response.data.data.guest;
}

export async function bulkCreateGuests(invitationId, names) {
  const response = await api.post(`/member/invitations/${invitationId}/guests/bulk`, { names });
  return response.data.data.guests;
}

export async function updateGuest(invitationId, guestId, name) {
  const response = await api.patch(`/member/invitations/${invitationId}/guests/${guestId}`, { name });
  return response.data.data.guest;
}

export async function deleteGuest(invitationId, guestId) {
  await api.delete(`/member/invitations/${invitationId}/guests/${guestId}`);
}

export async function markGuestSent(invitationId, guestId) {
  const response = await api.post(`/member/invitations/${invitationId}/guests/${guestId}/mark-sent`);
  return response.data.data.guest;
}

export async function getGuestWhatsappMessage(invitationId, guestId) {
  const response = await api.get(`/member/invitations/${invitationId}/guests/${guestId}/whatsapp-message`);
  return response.data.data;
}

export async function getWishes(invitationId) {
  const response = await api.get(`/member/invitations/${invitationId}/wishes`);
  return response.data.data.wishes;
}

export async function hideWish(invitationId, wishId) {
  const response = await api.patch(`/member/invitations/${invitationId}/wishes/${wishId}/hide`);
  return response.data.data.wish;
}

export async function deleteWish(invitationId, wishId) {
  await api.delete(`/member/invitations/${invitationId}/wishes/${wishId}`);
}
