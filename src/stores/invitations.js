import { defineStore } from "pinia";

import { getApiErrorMessage } from "@/lib/api";
import {
  createInvitation,
  deleteGalleryPhoto,
  deleteInvitation,
  getInvitation,
  getInvitations,
  previewInvitation,
  updateInvitation,
  uploadGalleryPhoto,
  uploadMainPhoto
} from "@/services/invitationService";

export const useInvitationStore = defineStore("invitations", {
  state: () => ({
    invitations: [],
    current: null,
    preview: null,
    loading: false,
    saving: false,
    uploading: false,
    error: ""
  }),
  actions: {
    async loadInvitations() {
      this.loading = true;
      this.error = "";

      try {
        this.invitations = await getInvitations();
      } catch (error) {
        this.error = getApiErrorMessage(error, "Daftar undangan belum bisa dimuat.");
      } finally {
        this.loading = false;
      }
    },
    async createDraft(payload = {}) {
      this.saving = true;
      this.error = "";

      try {
        const invitation = await createInvitation(payload);
        this.current = invitation;
        this.invitations = [invitation, ...this.invitations.filter((item) => item.id !== invitation.id)];
        return invitation;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Draft undangan belum bisa dibuat.");
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async loadInvitation(id) {
      this.loading = true;
      this.error = "";

      try {
        this.current = await getInvitation(id);
        return this.current;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Detail undangan belum bisa dimuat.");
        return null;
      } finally {
        this.loading = false;
      }
    },
    async saveInvitation(id, payload) {
      this.saving = true;
      this.error = "";

      try {
        const invitation = await updateInvitation(id, payload);
        this.current = invitation;
        this.invitations = this.invitations.map((item) => (item.id === id ? invitation : item));
        return invitation;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Undangan belum bisa disimpan.");
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async removeDraft(id) {
      this.saving = true;
      this.error = "";

      try {
        await deleteInvitation(id);
        this.invitations = this.invitations.filter((item) => item.id !== id);
      } catch (error) {
        this.error = getApiErrorMessage(error, "Draft undangan belum bisa dihapus.");
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async createPreview(id) {
      this.saving = true;
      this.error = "";

      try {
        this.preview = await previewInvitation(id);
        return this.preview;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Preview belum bisa dibuat.");
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async replaceMainPhoto(id, file) {
      this.uploading = true;
      this.error = "";

      try {
        this.current = await uploadMainPhoto(id, file);
        return this.current;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Foto utama belum bisa diunggah.");
        throw error;
      } finally {
        this.uploading = false;
      }
    },
    async addGalleryPhoto(id, file) {
      this.uploading = true;
      this.error = "";

      try {
        this.current = await uploadGalleryPhoto(id, file);
        return this.current;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Foto galeri belum bisa diunggah.");
        throw error;
      } finally {
        this.uploading = false;
      }
    },
    async removeGalleryPhoto(id, photoId) {
      this.uploading = true;
      this.error = "";

      try {
        this.current = await deleteGalleryPhoto(id, photoId);
        return this.current;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Foto galeri belum bisa dihapus.");
        throw error;
      } finally {
        this.uploading = false;
      }
    }
  }
});
