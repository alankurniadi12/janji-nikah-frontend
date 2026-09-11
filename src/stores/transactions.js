import { defineStore } from "pinia";

import { getApiErrorMessage } from "@/lib/api";
import {
  createTransaction,
  getTransaction,
  getTransactions,
  refreshMayarTransaction,
  redeemPromoCode,
  uploadPaymentProof
} from "@/services/transactionService";

export const useTransactionStore = defineStore("transactions", {
  state: () => ({
    transactions: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    },
    summary: {
      total: 0,
      waiting_payment: 0,
      waiting_verification: 0,
      success: 0,
      rejected: 0,
      expired: 0
    },
    current: null,
    loading: false,
    submitting: false,
    uploading: false,
    error: ""
  }),
  actions: {
    async loadTransactions(params = {}) {
      this.loading = true;
      this.error = "";

      try {
        const data = await getTransactions(params);
        this.transactions = data.transactions || [];
        this.pagination = {
          ...this.pagination,
          ...(data.pagination || {})
        };
        this.summary = {
          ...this.summary,
          ...(data.summary || {})
        };
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
    async create(packageId, promoCode = "") {
      this.submitting = true;
      this.error = "";

      try {
        const transaction = await createTransaction(packageId, promoCode);
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
    async redeemPromo(promoCode) {
      this.submitting = true;
      this.error = "";

      try {
        const transaction = await redeemPromoCode(promoCode);
        this.current = transaction;
        this.transactions = [transaction, ...this.transactions.filter((item) => item.id !== transaction.id)];
        return transaction;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Kode promo belum bisa diklaim.");
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
    },
    async refreshMayar(id) {
      this.submitting = true;
      this.error = "";

      try {
        const transaction = await refreshMayarTransaction(id);
        this.current = transaction;
        this.transactions = this.transactions.map((item) => (item.id === id ? transaction : item));
        return transaction;
      } catch (error) {
        this.error = getApiErrorMessage(error, "Status pembayaran Mayar belum bisa dicek.");
        throw error;
      } finally {
        this.submitting = false;
      }
    }
  }
});
