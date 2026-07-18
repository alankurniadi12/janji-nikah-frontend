import { defineStore } from "pinia";

import { getApiErrorMessage } from "@/lib/api";
import {
  createTransaction,
  getTransaction,
  getTransactions,
  uploadPaymentProof
} from "@/services/transactionService";

export const useTransactionStore = defineStore("transactions", {
  state: () => ({
    transactions: [],
    current: null,
    loading: false,
    submitting: false,
    uploading: false,
    error: ""
  }),
  actions: {
    async loadTransactions() {
      this.loading = true;
      this.error = "";

      try {
        this.transactions = await getTransactions();
      } catch (error) {
        this.error = getApiErrorMessage(error, "Riwayat transaksi belum bisa dimuat.");
      } finally {
        this.loading = false;
      }
    },
    async loadTransaction(id) {
      this.loading = true;
      this.error = "";

      try {
        this.current = await getTransaction(id);
        return this.current;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Detail transaksi belum bisa dimuat.");
        return null;
      } finally {
        this.loading = false;
      }
    },
    async create(packageId) {
      this.submitting = true;
      this.error = "";

      try {
        const transaction = await createTransaction(packageId);
        this.current = transaction;
        this.transactions = [transaction, ...this.transactions.filter((item) => item.id !== transaction.id)];
        return transaction;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Transaksi belum bisa dibuat.");
        throw error;
      } finally {
        this.submitting = false;
      }
    },
    async uploadProof(id, file) {
      this.uploading = true;
      this.error = "";

      try {
        const transaction = await uploadPaymentProof(id, file);
        this.current = transaction;
        this.transactions = this.transactions.map((item) => (item.id === id ? transaction : item));
        return transaction;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Bukti pembayaran belum bisa diunggah.");
        throw error;
      } finally {
        this.uploading = false;
      }
    }
  }
});
