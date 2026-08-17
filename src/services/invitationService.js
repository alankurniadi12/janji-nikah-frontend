import api from "@/lib/api";

export async function getInvitations(params = {}) {
  const response = await api.get("/member/invitations", { params });
  return response.data.data;
}

export async function createInvitation(payload = {}) {
  const response = await api.post("/member/invitations", payload);
  return response.data.data.invitation;
}

export async function getInvitation(id) {
  const response = await api.get(`/member/invitations/${id}`);
  return response.data.data.invitation;
}

export async function updateInvitation(id, payload) {
  const response = await api.patch(`/member/invitations/${id}`, payload);
  return response.data.data.invitation;
}

export async function deleteInvitation(id) {
  await api.delete(`/member/invitations/${id}`);
}

export async function previewInvitation(id) {
  const response = await api.post(`/member/invitations/${id}/preview`);
  return response.data.data;
}

export async function publishInvitation(id) {
  const response = await api.post(`/member/invitations/${id}/publish`);
  return response.data.data.invitation;
}

export async function uploadMainPhoto(id, file) {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post(`/member/invitations/${id}/photos/main`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data.data.invitation;
}

export async function uploadCouplePhoto(id, role, file) {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post(`/member/invitations/${id}/photos/couple/${role}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data.data.invitation;
}

export async function uploadGalleryPhoto(id, file) {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post(`/member/invitations/${id}/photos/gallery`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data.data.invitation;
}

export async function uploadLoveStoryPhoto(id, storyIndex, file) {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post(`/member/invitations/${id}/photos/love-story/${storyIndex}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data.data.invitation;
}

export async function deleteGalleryPhoto(id, photoId) {
  const response = await api.delete(`/member/invitations/${id}/photos/gallery/${photoId}`);
  return response.data.data.invitation;
}
