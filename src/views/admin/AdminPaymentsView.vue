<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Loader2 } from "@lucide/vue";

import AdminPaymentActionDialog from "@/components/AdminPaymentActionDialog.vue";
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
const router = useRouter();
const status = ref("waiting_verification");
const error = ref("");
const actionDialog = reactive({
  open: false,
  mode: "approve",
  transaction: null,
  error: ""
});

onMounted(load);

function load() {
  adminStore.loadTransactions(status.value);
}

function openDetail(transaction) {
  router.push(`/admin/payments/${transaction.id}`);
}

function openAction(mode, transaction) {
  actionDialog.mode = mode;
  actionDialog.transaction = transaction;
  actionDialog.error = "";
  actionDialog.open = true;
}

function closeAction() {
  actionDialog.open = false;
  actionDialog.transaction = null;
  actionDialog.error = "";
}

async function confirmAction(note) {
  if (!actionDialog.transaction) {
    return;
  }

  error.value = "";
  actionDialog.error = "";

  try {
    if (actionDialog.mode === "reject") {
      await adminStore.rejectTransaction(actionDialog.transaction.id, note);
      toastStore.show("Transaksi berhasil ditolak.");
    } else {
      await adminStore.approveTransaction(actionDialog.transaction.id, note);
      toastStore.show("Transaksi berhasil diapprove.");
    }

    closeAction();
  } catch (requestError) {
    actionDialog.error = getApiErrorMessage(
      requestError,
      actionDialog.mode === "reject" ? "Transaksi belum bisa ditolak." : "Transaksi belum bisa diapprove."
    );
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

    <p v-if="error || adminStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error || adminStore.error }}</p>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat transaksi...</p>
    </div>

    <section v-else class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <div v-if="adminStore.transactions.length" class="divide-y divide-ink/10">
        <article
          v-for="transaction in adminStore.transactions"
          :key="transaction.id"
          class="grid cursor-pointer gap-4 p-5 transition hover:bg-mint/30 lg:grid-cols-[1fr_170px_150px_170px] lg:items-center"
          tabindex="0"
          role="button"
          @click="openDetail(transaction)"
          @keyup.enter="openDetail(transaction)"
        >
          <div>
            <p class="font-bold text-ink">{{ transaction.member?.name || `${transaction.creditAmount} kredit` }}</p>
            <p class="mt-1 text-sm text-ink/55">
              {{ transaction.member?.email || transaction.memberId }} · {{ formatDate(transaction.createdAt) }}
            </p>
            <a
              v-if="transaction.paymentProofUrl"
              :href="assetUrl(transaction.paymentProofUrl)"
              target="_blank"
              class="mt-2 inline-flex text-sm font-semibold text-leaf"
              @click.stop
            >
              Buka bukti transfer
            </a>
          </div>
          <div>
            <p class="font-bold text-ink">{{ formatCurrency(transaction.totalAmount) }}</p>
            <p class="mt-1 text-sm text-ink/55">{{ transaction.creditAmount }} kredit</p>
          </div>
          <TransactionStatusBadge :status="transaction.status" />
          <div class="flex flex-wrap gap-2 lg:justify-end">
            <AppButton type="button" :disabled="adminStore.saving || transaction.status !== 'waiting_verification'" @click.stop="openAction('approve', transaction)">Approve</AppButton>
            <AppButton type="button" variant="secondary" :disabled="adminStore.saving || transaction.status !== 'waiting_verification'" @click.stop="openAction('reject', transaction)">Tolak</AppButton>
          </div>
        </article>
      </div>
      <p v-else class="p-8 text-center text-sm font-semibold text-ink/55">Belum ada transaksi.</p>
    </section>

    <AdminPaymentActionDialog
      :open="actionDialog.open"
      :mode="actionDialog.mode"
      :transaction="actionDialog.transaction"
      :loading="adminStore.saving"
      :error="actionDialog.error"
      @cancel="closeAction"
      @confirm="confirmAction"
    />
  </section>
</template>
