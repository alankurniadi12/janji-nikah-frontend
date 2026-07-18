<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Loader2, ReceiptText, UploadCloud } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import TransactionStatusBadge from "@/components/TransactionStatusBadge.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useTransactionStore } from "@/stores/transactions";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";

const route = useRoute();
const transactionStore = useTransactionStore();
const selectedFile = ref(null);
const uploadError = ref("");
const uploadSuccess = ref("");

onMounted(() => {
  transactionStore.loadTransaction(route.params.id);
});

const transaction = computed(() => transactionStore.current);
const canUploadProof = computed(() => transaction.value?.status === "waiting_payment");

function chooseFile(event) {
  selectedFile.value = event.target.files?.[0] || null;
  uploadError.value = "";
  uploadSuccess.value = "";
}

async function submitProof() {
  if (!selectedFile.value) {
    uploadError.value = "Pilih file bukti transfer terlebih dahulu.";
    return;
  }

  uploadError.value = "";
  uploadSuccess.value = "";

  try {
    await transactionStore.uploadProof(transaction.value.id, selectedFile.value);
    selectedFile.value = null;
    uploadSuccess.value = "Bukti pembayaran berhasil diunggah dan menunggu verifikasi admin.";
  } catch (requestError) {
    uploadError.value = getApiErrorMessage(requestError, "Bukti pembayaran belum bisa diunggah.");
  }
}
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Detail transaksi</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">Pembayaran kredit</h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Transfer sesuai total bayar. Kode unik membantu admin mencocokkan pembayaran manual.
        </p>
      </div>
      <AppButton to="/app/transactions" variant="secondary">Kembali</AppButton>
    </div>

    <div v-if="transactionStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat detail transaksi...</p>
    </div>

    <p v-else-if="transactionStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ transactionStore.error }}
    </p>

    <div v-else-if="transaction" class="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
      <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
              <ReceiptText class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-ink">{{ transaction.creditAmount }} kredit</h2>
              <p class="text-sm text-ink/55">Dibuat {{ formatDate(transaction.createdAt) }}</p>
            </div>
          </div>
          <TransactionStatusBadge :status="transaction.status" />
        </div>

        <div class="mt-6 grid gap-3 rounded-lg border border-ink/10 bg-linen p-4">
          <div class="flex justify-between gap-4 text-sm">
            <span class="text-ink/55">Harga paket</span>
            <span class="font-semibold text-ink">{{ formatCurrency(transaction.baseAmount) }}</span>
          </div>
          <div class="flex justify-between gap-4 text-sm">
            <span class="text-ink/55">Kode unik</span>
            <span class="font-semibold text-ink">{{ transaction.uniqueCode }}</span>
          </div>
          <div class="border-t border-ink/10 pt-3">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-ink">Total bayar</span>
              <span class="text-2xl font-bold text-leaf">{{ formatCurrency(transaction.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div class="rounded-md border border-ink/10 p-4">
            <p class="text-sm font-bold text-ink">Batas pembayaran</p>
            <p class="mt-1 text-sm text-ink/60">{{ formatDateTime(transaction.expiresAt) }}</p>
          </div>
          <div class="rounded-md border border-ink/10 p-4">
            <p class="text-sm font-bold text-ink">Bukti pembayaran</p>
            <p class="mt-1 text-sm text-ink/60">{{ transaction.paymentProofUrl ? "Sudah diunggah" : "Belum diunggah" }}</p>
          </div>
        </div>

        <p v-if="transaction.adminNote" class="mt-5 rounded-md bg-gold/10 px-3 py-2 text-sm font-semibold text-ink">
          Catatan admin: {{ transaction.adminNote }}
        </p>
      </section>

      <aside class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-rose/10 text-rose">
          <UploadCloud class="h-5 w-5" />
        </div>
        <h2 class="mt-4 text-lg font-bold text-ink">Upload bukti transfer</h2>
        <p class="mt-2 text-sm leading-6 text-ink/60">
          Upload gambar JPG, PNG, atau WebP. Status berubah menjadi menunggu verifikasi setelah bukti terkirim.
        </p>

        <form v-if="canUploadProof" class="mt-5 space-y-4" @submit.prevent="submitProof">
          <label class="block">
            <span class="text-sm font-semibold text-ink">File bukti</span>
            <input
              class="focus-ring mt-2 block w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-mint file:px-3 file:py-2 file:text-sm file:font-semibold file:text-leaf"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="chooseFile"
            />
          </label>

          <p v-if="selectedFile" class="rounded-md bg-linen px-3 py-2 text-sm font-medium text-ink">
            {{ selectedFile.name }}
          </p>
          <p v-if="uploadError" class="rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">{{ uploadError }}</p>
          <p v-if="uploadSuccess" class="rounded-md bg-leaf/10 px-3 py-2 text-sm font-semibold text-leaf">{{ uploadSuccess }}</p>

          <AppButton class="w-full" type="submit" :disabled="transactionStore.uploading">
            <Loader2 v-if="transactionStore.uploading" class="h-4 w-4 animate-spin" />
            Upload Bukti
          </AppButton>
        </form>

        <div v-else class="mt-5 rounded-md border border-ink/10 bg-linen p-4">
          <p class="text-sm font-semibold text-ink">
            Upload bukti hanya tersedia saat status transaksi masih menunggu pembayaran.
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>
