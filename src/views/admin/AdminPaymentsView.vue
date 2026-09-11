<script setup>
import { computed, reactive, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ChevronLeft, ChevronRight, Loader2, Search } from "@lucide/vue";

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
const status = ref("");
const pageSize = ref(10);
const filters = reactive({
  q: "",
  dateMode: "all",
  date: "",
  month: ""
});
const error = ref("");
const actionDialog = reactive({
  open: false,
  mode: "approve",
  transaction: null,
  error: ""
});

onMounted(load);

const pagination = computed(() => adminStore.transactionPagination);
const statusOptions = computed(() => [
  { value: "", label: "Semua", total: adminStore.transactionSummary.total },
  { value: "waiting_verification", label: "Menunggu verifikasi", total: adminStore.transactionSummary.waiting_verification },
  { value: "waiting_payment", label: "Menunggu bayar", total: adminStore.transactionSummary.waiting_payment },
  { value: "success", label: "Berhasil", total: adminStore.transactionSummary.success },
  { value: "rejected", label: "Ditolak", total: adminStore.transactionSummary.rejected },
  { value: "expired", label: "Expired", total: adminStore.transactionSummary.expired }
]);
const resultStart = computed(() => {
  if (!pagination.value.total) {
    return 0;
  }

  return (pagination.value.page - 1) * pagination.value.limit + 1;
});
const resultEnd = computed(() => Math.min(pagination.value.page * pagination.value.limit, pagination.value.total));
const hasActiveFilters = computed(() =>
  Boolean(status.value || filters.q.trim() || (filters.dateMode === "date" && filters.date) || (filters.dateMode === "month" && filters.month))
);
const emptyMessage = computed(() => (hasActiveFilters.value ? "Transaksi tidak ditemukan untuk filter ini." : "Belum ada transaksi."));

watch(status, () => {
  load(1);
});

watch(pageSize, () => {
  load(1);
});

watch(
  () => [filters.dateMode, filters.date, filters.month],
  () => {
    load(1);
  }
);

function buildTransactionQuery(page = 1) {
  return {
    page,
    limit: pageSize.value,
    status: status.value || undefined,
    q: filters.q.trim() || undefined,
    dateMode: filters.dateMode,
    date: filters.dateMode === "date" ? filters.date || undefined : undefined,
    month: filters.dateMode === "month" ? filters.month || undefined : undefined
  };
}

function load(page = 1) {
  return adminStore.loadTransactions(buildTransactionQuery(page));
}

function resetFilters() {
  status.value = "";
  filters.q = "";
  filters.dateMode = "all";
  filters.date = "";
  filters.month = "";
  load(1);
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

function paymentMethodLabel(transaction) {
  if (transaction.paymentMethod === "mayar") return "Checkout otomatis";
  if (transaction.paymentMethod === "promo_code") return "Kode promo";
  return "Transfer manual";
}

function paymentMethodTone(transaction) {
  if (transaction.paymentMethod === "mayar") return "border-leaf/20 bg-leaf/10 text-leaf";
  if (transaction.paymentMethod === "promo_code") return "border-gold/25 bg-gold/10 text-gold";
  return "border-ink/10 bg-linen text-ink/60";
}

function canManuallyVerify(transaction) {
  return transaction.paymentMethod === "manual_transfer" && transaction.status === "waiting_verification";
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
    await load(pagination.value.page);
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
    <AdminPageHeader eyebrow="Pembayaran" title="Pantau pembayaran" description="Monitor checkout otomatis, kode promo, dan verifikasi transfer manual dari satu tempat." />

    <section class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div class="grid gap-5">
        <div>
          <p class="text-sm font-semibold text-ink">Status pembayaran</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="option in statusOptions"
              :key="option.value || 'all'"
              type="button"
              :class="[
                'focus-ring rounded-md border px-3 py-2 text-sm font-semibold transition',
                status === option.value
                  ? 'border-leaf bg-mint text-leaf'
                  : 'border-ink/10 bg-white text-ink/65 hover:border-leaf hover:text-leaf'
              ]"
              @click="status = option.value"
            >
              {{ option.label }}
              <span class="ml-1 text-xs text-ink/45">({{ option.total || 0 }})</span>
            </button>
          </div>
        </div>
        <form class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_160px_120px] lg:items-end" @submit.prevent="load(1)">
          <label class="block text-sm font-semibold text-ink">
            Cari transaksi
            <input
              v-model="filters.q"
              class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
              placeholder="Nama, email, username, ID, nominal"
            />
          </label>
          <label class="block text-sm font-semibold text-ink">
            Filter tanggal
            <select v-model="filters.dateMode" class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm">
              <option value="all">Semua tanggal</option>
              <option value="date">Tanggal dibuat</option>
              <option value="month">Bulan dibuat</option>
            </select>
          </label>
          <label v-if="filters.dateMode === 'date'" class="block text-sm font-semibold text-ink">
            Tanggal dibuat
            <input v-model="filters.date" type="date" class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" />
          </label>
          <label v-else-if="filters.dateMode === 'month'" class="block text-sm font-semibold text-ink">
            Bulan dibuat
            <input v-model="filters.month" type="month" class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" />
          </label>
          <div v-else class="hidden lg:block" />
          <label class="block text-sm font-semibold text-ink">
            Per halaman
            <select v-model.number="pageSize" class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </label>
          <div class="flex gap-2">
            <AppButton class="flex-1" type="submit">
              <Search class="h-4 w-4" />
              Cari
            </AppButton>
            <AppButton v-if="hasActiveFilters" class="flex-1" type="button" variant="secondary" @click="resetFilters">
              Reset
            </AppButton>
          </div>
        </form>
      </div>
      <p class="mt-4 border-t border-ink/10 pt-4 text-sm text-ink/55">
        Menampilkan {{ resultStart }}-{{ resultEnd }} dari {{ pagination.total }} transaksi.
      </p>
    </section>

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
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold" :class="paymentMethodTone(transaction)">
                {{ paymentMethodLabel(transaction) }}
              </span>
              <span v-if="transaction.paymentMethod === 'mayar' && transaction.providerStatus" class="text-xs font-semibold text-ink/45">
                Status provider: {{ transaction.providerStatus }}
              </span>
            </div>
            <a
              v-if="transaction.paymentMethod === 'manual_transfer' && transaction.paymentProofUrl"
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
            <template v-if="canManuallyVerify(transaction)">
              <AppButton type="button" :disabled="adminStore.saving" @click.stop="openAction('approve', transaction)">Approve</AppButton>
              <AppButton type="button" variant="secondary" :disabled="adminStore.saving" @click.stop="openAction('reject', transaction)">Tolak</AppButton>
            </template>
            <span v-else class="rounded-md bg-linen px-3 py-2 text-xs font-semibold text-ink/50">
              {{ transaction.paymentMethod === "manual_transfer" ? "Lihat detail" : "Diproses otomatis" }}
            </span>
          </div>
        </article>
      </div>
      <div v-else class="p-8 text-center">
        <p class="text-sm font-semibold text-ink/55">{{ emptyMessage }}</p>
        <AppButton v-if="hasActiveFilters" type="button" variant="secondary" class="mt-4" @click="resetFilters">Lihat Semua</AppButton>
      </div>
    </section>

    <nav
      v-if="!adminStore.loading && pagination.totalPages > 1"
      class="mt-5 flex flex-col gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
      aria-label="Pagination transaksi admin"
    >
      <p class="text-sm font-semibold text-ink/60">
        Halaman {{ pagination.page }} dari {{ pagination.totalPages }}
      </p>
      <div class="flex items-center gap-2">
        <AppButton
          type="button"
          variant="secondary"
          :disabled="!pagination.hasPreviousPage || adminStore.loading"
          @click="load(pagination.page - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
          Sebelumnya
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          :disabled="!pagination.hasNextPage || adminStore.loading"
          @click="load(pagination.page + 1)"
        >
          Berikutnya
          <ChevronRight class="h-4 w-4" />
        </AppButton>
      </div>
    </nav>

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
