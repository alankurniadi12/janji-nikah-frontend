<script setup>
import { onMounted, ref } from "vue";
import { Loader2 } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import TransactionStatusBadge from "@/components/TransactionStatusBadge.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import { useToastStore } from "@/stores/toasts";
import { assetUrl } from "@/utils/assets";
import { formatCurrency, formatDate } from "@/utils/formatters";

const adminStore = useAdminStore();
const toastStore = useToastStore();
const status = ref("waiting_verification");
const note = ref("");
const error = ref("");

onMounted(load);

function load() {
  adminStore.loadTransactions(status.value);
}

async function approve(transaction) {
  error.value = "";
  try {
    await adminStore.approveTransaction(transaction.id, note.value);
    toastStore.show("Transaksi berhasil diapprove.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Transaksi belum bisa diapprove.");
  }
}

async function reject(transaction) {
  error.value = "";
  try {
    await adminStore.rejectTransaction(transaction.id, note.value);
    toastStore.show("Transaksi berhasil ditolak.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Transaksi belum bisa ditolak.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Pembayaran" title="Verifikasi pembayaran" description="Approve atau tolak transaksi manual setelah cek mutasi dan bukti transfer.">
      <select v-model="status" class="focus-ring h-11 rounded-md border border-ink/15 bg-white px-3 text-sm" @change="load">
        <option value="">Semua status</option>
        <option value="waiting_verification">Menunggu verifikasi</option>
        <option value="waiting_payment">Menunggu pembayaran</option>
        <option value="success">Berhasil</option>
        <option value="rejected">Ditolak</option>
        <option value="expired">Expired</option>
      </select>
    </AdminPageHeader>

    <div class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <label class="block text-sm font-semibold text-ink" for="adminNote">Catatan admin</label>
      <input id="adminNote" v-model.trim="note" class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" placeholder="Wajib untuk reject, optional untuk approve" />
    </div>

    <p v-if="error || adminStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error || adminStore.error }}</p>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat transaksi...</p>
    </div>

    <section v-else class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <div v-if="adminStore.transactions.length" class="divide-y divide-ink/10">
        <article v-for="transaction in adminStore.transactions" :key="transaction.id" class="grid gap-4 p-5 lg:grid-cols-[1fr_160px_160px_220px] lg:items-center">
          <div>
            <p class="font-bold text-ink">{{ transaction.creditAmount }} kredit</p>
            <p class="mt-1 text-sm text-ink/55">{{ formatDate(transaction.createdAt) }}</p>
            <a v-if="transaction.paymentProofUrl" :href="assetUrl(transaction.paymentProofUrl)" target="_blank" class="mt-2 inline-flex text-sm font-semibold text-leaf">Buka bukti transfer</a>
          </div>
          <p class="font-bold text-ink">{{ formatCurrency(transaction.totalAmount) }}</p>
          <TransactionStatusBadge :status="transaction.status" />
          <div class="flex flex-wrap gap-2 lg:justify-end">
            <AppButton type="button" :disabled="adminStore.saving || transaction.status !== 'waiting_verification'" @click="approve(transaction)">Approve</AppButton>
            <AppButton type="button" variant="secondary" :disabled="adminStore.saving || transaction.status !== 'waiting_verification'" @click="reject(transaction)">Tolak</AppButton>
          </div>
        </article>
      </div>
      <p v-else class="p-8 text-center text-sm font-semibold text-ink/55">Belum ada transaksi.</p>
    </section>
  </section>
</template>
