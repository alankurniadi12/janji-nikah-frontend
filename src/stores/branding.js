import { defineStore } from "pinia";

import { getApiErrorMessage } from "@/lib/api";
import {
  generateBranding,
  getBrandingProfile,
  uploadBrandingPhoto,
  upsertBrandingProfile
} from "@/services/brandingService";

export const useBrandingStore = defineStore("branding", {
  state: () => ({
    profile: null,
    assets: null,
    loading: false,
    saving: false,
    uploadingPhoto: false,
    generating: false,
    error: ""
  }),
  actions: {
    async loadProfile() {
      this.loading = true;
      this.error = "";

      try {
        this.profile = await getBrandingProfile();
        this.assets = this.profile?.promoAssets || null;
        return this.profile;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Profil branding belum bisa dimuat.");
        return null;
      } finally {
        this.loading = false;
      }
    },
    async saveProfile(payload) {
      this.saving = true;
      this.error = "";

      try {
        this.profile = await upsertBrandingProfile(payload);
        this.assets = this.profile?.promoAssets || this.assets;
        return this.profile;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Profil branding belum bisa disimpan.");
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async uploadPhoto(file) {
      this.uploadingPhoto = true;
      this.error = "";

      try {
        this.profile = await uploadBrandingPhoto(file);
        this.assets = null;
        return this.profile;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Foto promosi belum bisa diunggah.");
        throw error;
      } finally {
        this.uploadingPhoto = false;
      }
    },
    async generate(payload) {
      this.generating = true;
      this.error = "";

      try {
        const data = await generateBranding(payload);
        this.profile = data.branding;
        this.assets = data.assets;
        return data;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Materi branding belum bisa dibuat.");
        throw error;
      } finally {
        this.generating = false;
      }
    }
  }
});
