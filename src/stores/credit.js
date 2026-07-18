import { defineStore } from "pinia";

import { getApiErrorMessage } from "@/lib/api";
import { getCreditPackages } from "@/services/creditService";

export const useCreditStore = defineStore("credit", {
  state: () => ({
    packages: [],
    loading: false,
    error: ""
  }),
  actions: {
    async loadPackages() {
      this.loading = true;
      this.error = "";

      try {
        this.packages = await getCreditPackages();
      } catch (error) {
        this.error = getApiErrorMessage(error, "Paket kredit belum bisa dimuat.");
      } finally {
        this.loading = false;
      }
    }
  }
});
