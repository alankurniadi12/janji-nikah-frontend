<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, Loader2, ReceiptText, XCircle } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import TransactionStatusBadge from "@/components/TransactionStatusBadge.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import { useToastStore } from "@/stores/toasts";
import { assetUrl } from "@/utils/assets";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const toastStore = useToastStore();
const note = ref("");
const actionError = ref("");

onMounted(() => {
  adminStore.loadTransaction(route.params.id);
});

const transaction = computed(() => adminStore.currentTransaction);
const canVerify = computed(() => transaction.value?.status === "waiting_verification");
const proofUrl = computed(() => assetUrl(transaction.value?.paymentProofUrl || ""));
const statusMessage = computed(() => {
  const status = transaction.value?.status;

  if (status === "waiting_verification") {
    return {
      icon: AlertCircle,
      tone: "border-gold/25 bg-gold/10",
      title: "Butuh verifikasi admin",
      message: "Cocokkan nominal transfer, kode unik, dan bukti transfer sebelum approve atau tolak."
    };
  }

  if (status === "success") {
    return {
      icon: CheckCircle2,
      tone: "border-leaf/20 bg-leaf/10",
      title: "Pembayaran sudah diapprove",
      message: "Kredit sudah ditambahkan ke saldo member melalui ledger pembelian."
    };
  }

  if (status === "rejected") {
    return {
      icon: XCircle,
      tone: "border-rose/20 bg-rose/10",
      title: "Pembayaran ditolak",
      message: "Transaksi sudah ditolak. Catatan admin menjadi rujukan untuk member."
    };
  }

  return {
    icon: ReceiptText,
    tone: "border-ink/10 bg-white",
    title: "Detail pembayaran",
    message: "Pantau status transaksi dan bukti pembayaran member."
  };
});

async function approve() {
  actionError.value = "";

  try {
    await adminStore.approveTransaction(transaction.value.id, note.value);
    await adminStore.loadTransaction(transaction.value.id);
    toastStore.show("Transaksi berhasil diapprove.");
  } catch (requestError) {
    actionError.value = getApiErrorMessage(requestError, "Transaksi belum bisa diapprove.");
  }
}

async function reject() {
  actionError.value = "";

  try {
    await adminStore.rejectTransaction(transaction.value.id, note.value);
    await adminStore.loadTransaction(transaction.value.id);
    toastStore.show("Transaksi berhasil ditolak.");
  } catch (requestError) {
    actionError.value = getApiErrorMessage(requestError, "Transaksi belum bisa ditolak.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader
      eyebrow="Detail pembayaran"
      title="Verifikasi pembayaran member"
      description="Cek paket, nominal transfer, kode unik, member, dan bukti pembayaran sebelum memproses transaksi."
    >
      <AppButton type="button" variant="secondary" @click="router.push('/admin/payments')">
        <ArrowLeft class="h-4 w-4" />
        Kembali
      </AppButton>
    </AdminPageHeader>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat detail pembayaran...</p>
    </div>

    <p v-else-if="adminStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ adminStore.error }}
    </p>

    <div v-else-if="transaction" class="mt-8 space-y-6">
      <section class="rounded-lg border p-5 shadow-soft" :class="statusMessage.tone">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/80 text-ink">
              <component :is="statusMessage.icon" class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-ink">{{ statusMessage.title }}</h2>
              <p class="mt-1 text-sm leading-6 text-ink/65">{{ statusMessage.message }}</p>
            </div>
          </div>
          <TransactionStatusBadge :status="transaction.status" />
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[1fr_360px]">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Rincian pembayaran</h2>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div class="rounded-md bg-linen p-4">
              <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Paket</p>
              <p class="mt-2 text-lg font-bold text-ink">{{ transaction.package?.name || `${transaction.creditAmount} kredit` }}</p>
              <p class="mt-1 text-sm text-ink/55">{{ transaction.creditAmount }} kredit masuk jika approve</p>
            </div>
            <div class="rounded-md bg-linen p-4">
              <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Total bayar</p>
              <p class="mt-2 text-2xl font-bold text-leaf">{{ formatCurrency(transaction.totalAmount) }}</p>
              <p class="mt-1 text-sm text-ink/55">Termasuk kode unik {{ transaction.uniqueCode }}</p>
            </div>
            <div class="rounded-md border border-ink/10 p-4">
              <p class="text-sm text-ink/55">Harga paket</p>
              <p class="mt-1 font-bold text-ink">{{ formatCurrency(transaction.baseAmount) }}</p>
            </div>
            <div class="rounded-md border border-ink/10 p-4">
              <p class="text-sm text-ink/55">Kode unik</p>
              <p class="mt-1 font-bold text-ink">{{ transaction.uniqueCode }}</p>
            </div>
          </div>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Aksi admin</h2>
          <label class="mt-4 block text-sm font-semibold text-ink" for="adminPaymentNote">Catatan admin</label>
          <textarea
            id="adminPaymentNote"
            v-model.trim="note"
            class="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
            placeholder="Wajib untuk tolak, optional untuk approve."
          />
          <p v-if="actionError" class="mt-3 rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">{{ actionError }}</p>
          <div class="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <AppButton type="button" :disabled="adminStore.saving || !canVerify" @click="approve">
              <CheckCircle2 class="h-4 w-4" />
              Approve
            </AppButton>
            <AppButton type="button" variant="secondary" :disabled="adminStore.saving || !canVerify" @click="reject">
              <XCircle class="h-4 w-4" />
              Tolak
            </AppButton>
          </div>
          <p v-if="!canVerify" class="mt-3 text-sm font-semibold text-ink/50">
            Aksi hanya tersedia untuk transaksi menunggu verifikasi.
          </p>
        </article>
      </section>

      <section class="grid gap-6 xl:grid-cols-2">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Member</h2>
          <div class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Nama</span>
              <span class="font-semibold text-ink">{{ transaction.member?.name || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Email</span>
              <span class="font-semibold text-ink">{{ transaction.member?.email || transaction.memberId }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Username</span>
              <span class="font-semibold text-ink">{{ transaction.member?.username || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Saldo kredit saat ini</span>
              <span class="font-semibold text-ink">{{ transaction.member?.creditBalance ?? "-" }}</span>
            </div>
          </div>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Riwayat status</h2>
          <div class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Dibuat</span>
              <span class="font-semibold text-ink">{{ formatDateTime(transaction.createdAt) }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Kedaluwarsa</span>
              <span class="font-semibold text-ink">{{ formatDateTime(transaction.expiresAt) }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Disetujui</span>
              <span class="font-semibold text-ink">{{ formatDateTime(transaction.approvedAt) }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Ditolak</span>
              <span class="font-semibold text-ink">{{ formatDateTime(transaction.rejectedAt) }}</span>
            </div>
          </div>
          <p v-if="transaction.adminNote" class="mt-4 rounded-md bg-linen p-4 text-sm leading-6 text-ink/70">
            {{ transaction.adminNote }}
          </p>
        </article>
      </section>

      <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-ink">Bukti transfer</h2>
          <a
            v-if="proofUrl"
            :href="proofUrl"
            target="_blank"
            rel="noreferrer"
            class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf"
          >
            <ExternalLink class="h-4 w-4" />
            Buka file
          </a>
        </div>
        <div v-if="proofUrl" class="mt-4 overflow-hidden rounded-md border border-ink/10 bg-linen">
          <img :src="proofUrl" alt="Bukti transfer member" class="max-h-[520px] w-full object-contain" />
        </div>
        <p v-else class="mt-4 rounded-md bg-linen p-5 text-center text-sm font-semibold text-ink/55">
          Member belum mengunggah bukti transfer.
        </p>
      </section>
    </div>
  </section>
</template>
