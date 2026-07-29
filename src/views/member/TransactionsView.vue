<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { ArrowRight, Clock3, Loader2, ReceiptText } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import TransactionStatusBadge from "@/components/TransactionStatusBadge.vue";
import { useTransactionStore } from "@/stores/transactions";
import { formatCurrency, formatDate } from "@/utils/formatters";

const transactionStore = useTransactionStore();
const currentTime = ref(Date.now());
let timerInterval = null;

onMounted(() => {
  transactionStore.loadTransactions();
  timerInterval = window.setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) {
    window.clearInterval(timerInterval);
  }
});

function paymentTimeLeft(transaction) {
  if (transaction.status !== "waiting_payment" || !transaction.expiresAt) {
    return null;
  }

  const totalSeconds = Math.max(0, Math.floor((new Date(transaction.expiresAt).getTime() - currentTime.value) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    isExpired: totalSeconds <= 0
  };
}
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Transaksi</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">Riwayat pembelian kredit</h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Pantau status pembayaran manual, upload bukti transfer, dan cek transaksi yang sudah disetujui admin.
        </p>
      </div>
      <AppButton to="/app/credits/buy">Beli Kredit</AppButton>
    </div>

    <div v-if="transactionStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat transaksi...</p>
    </div>

    <p v-else-if="transactionStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ transactionStore.error }}
    </p>

    <section v-else class="mt-8 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <div v-if="transactionStore.transactions.length" class="divide-y divide-ink/10">
        <RouterLink
          v-for="transaction in transactionStore.transactions"
          :key="transaction.id"
          :to="{ name: 'member-transaction-detail', params: { id: transaction.id } }"
          class="focus-ring grid gap-4 px-5 py-4 transition hover:bg-mint/35 md:grid-cols-[1fr_160px_180px_24px] md:items-center"
        >
          <div>
            <p class="text-sm font-bold text-ink">{{ transaction.creditAmount }} kredit</p>
            <p class="mt-1 text-sm text-ink/55">Dibuat {{ formatDate(transaction.createdAt) }}</p>
          </div>
          <p class="font-bold text-ink">{{ formatCurrency(transaction.totalAmount) }}</p>
          <div class="space-y-2">
            <TransactionStatusBadge :status="transaction.status" />
            <div
              v-if="paymentTimeLeft(transaction)"
              class="inline-flex items-center gap-1.5 rounded-md border border-gold/20 bg-gold/10 px-2.5 py-1 text-xs font-bold text-ink"
            >
              <Clock3 class="h-3.5 w-3.5 text-gold" />
              <span>{{ paymentTimeLeft(transaction).isExpired ? "Waktu habis" : paymentTimeLeft(transaction).label }}</span>
            </div>
          </div>
          <ArrowRight class="hidden h-4 w-4 text-ink/35 md:block" />
        </RouterLink>
      </div>

      <div v-else class="p-8 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-mint text-leaf">
          <ReceiptText class="h-6 w-6" />
        </div>
        <h2 class="mt-4 text-xl font-bold text-ink">Belum ada transaksi</h2>
        <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
          Pilih paket kredit untuk membuat transaksi pertama. Kode unik total bayar akan dibuat otomatis.
        </p>
        <AppButton to="/app/credits/buy" class="mt-5">Beli Kredit</AppButton>
      </div>
    </section>
  </section>
</template>
