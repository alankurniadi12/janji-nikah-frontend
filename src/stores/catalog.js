import { defineStore } from "pinia";

import { getApiErrorMessage } from "@/lib/api";
import { getMusic, getThemes } from "@/services/catalogService";

export const useCatalogStore = defineStore("catalog", {
  state: () => ({
    themes: [],
    music: [],
    loading: false,
    error: ""
  }),
  actions: {
    async loadCatalog() {
      this.loading = true;
      this.error = "";

      try {
        const [themes, music] = await Promise.all([getThemes(), getMusic()]);
        this.themes = themes;
        this.music = music;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Tema dan musik belum bisa dimuat.");
      } finally {
        this.loading = false;
      }
    }
  }
});
