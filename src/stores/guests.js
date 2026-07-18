import { defineStore } from "pinia";

import { getApiErrorMessage } from "@/lib/api";
import {
  bulkCreateGuests,
  createGuest,
  deleteGuest,
  deleteWish,
  getGuestWhatsappMessage,
  getGuests,
  getWishes,
  hideWish,
  markGuestSent,
  updateGuest
} from "@/services/guestService";

export const useGuestStore = defineStore("guests", {
  state: () => ({
    guests: [],
    wishes: [],
    whatsappMessage: null,
    loading: false,
    saving: false,
    error: ""
  }),
  actions: {
    async loadGuests(invitationId) {
      this.loading = true;
      this.error = "";

      try {
        this.guests = await getGuests(invitationId);
      } catch (error) {
        this.error = getApiErrorMessage(error, "Daftar tamu belum bisa dimuat.");
      } finally {
        this.loading = false;
      }
    },
    async loadWishes(invitationId) {
      this.error = "";

      try {
        this.wishes = await getWishes(invitationId);
      } catch (error) {
        this.error = getApiErrorMessage(error, "Ucapan belum bisa dimuat.");
      }
    },
    async create(invitationId, name) {
      this.saving = true;
      this.error = "";

      try {
        const guest = await createGuest(invitationId, name);
        this.guests = [guest, ...this.guests.filter((item) => item.id !== guest.id)];
        return guest;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Tamu belum bisa ditambahkan.");
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async bulkCreate(invitationId, names) {
      this.saving = true;
      this.error = "";

      try {
        const guests = await bulkCreateGuests(invitationId, names);
        this.guests = [...guests, ...this.guests];
        return guests;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Daftar tamu belum bisa ditambahkan.");
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async update(invitationId, guestId, name) {
      this.saving = true;
      this.error = "";

      try {
        const guest = await updateGuest(invitationId, guestId, name);
        this.guests = this.guests.map((item) => (item.id === guest.id ? guest : item));
        return guest;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Tamu belum bisa diperbarui.");
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async remove(invitationId, guestId) {
      this.saving = true;
      this.error = "";

      try {
        await deleteGuest(invitationId, guestId);
        this.guests = this.guests.filter((item) => item.id !== guestId);
      } catch (error) {
        this.error = getApiErrorMessage(error, "Tamu belum bisa dihapus.");
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async markSent(invitationId, guestId) {
      const guest = await markGuestSent(invitationId, guestId);
      this.guests = this.guests.map((item) => (item.id === guest.id ? guest : item));
      return guest;
    },
    async loadWhatsappMessage(invitationId, guestId) {
      this.whatsappMessage = await getGuestWhatsappMessage(invitationId, guestId);
      return this.whatsappMessage;
    },
    async hideWish(invitationId, wishId) {
      const wish = await hideWish(invitationId, wishId);
      this.wishes = this.wishes.map((item) => (item.id === wish.id ? wish : item));
      return wish;
    },
    async deleteWish(invitationId, wishId) {
      await deleteWish(invitationId, wishId);
      this.wishes = this.wishes.filter((item) => item.id !== wishId);
    }
  }
});
