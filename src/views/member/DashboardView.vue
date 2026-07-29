<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ArrowRight, Bell, CalendarClock, Clock3, CreditCard, FilePlus2, Loader2, WalletCards } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import StatCard from "@/components/StatCard.vue";
import TransactionStatusBadge from "@/components/TransactionStatusBadge.vue";
import { useAuthStore } from "@/stores/auth";
import { useMemberDashboardStore } from "@/stores/memberDashboard";
import { formatCurrency, formatDate, transactionStatusLabel } from "@/utils/formatters";

const auth = useAuthStore();
const memberDashboard = useMemberDashboardStore();
const currentTime = ref(Date.now());
let timerInterval = null;

onMounted(async () => {
  timerInterval = window.setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
  await Promise.all([memberDashboard.loadDashboard(), memberDashboard.loadNotifications()]);
});

onUnmounted(() => {
  if (timerInterval) {
    window.clearInterval(timerInterval);
  }
});

const dashboard = computed(() => memberDashboard.dashboard);
const latestTransaction = computed(() => dashboard.value?.latestTransaction);
const pendingTransactions = computed(() => dashboard.value?.pendingTransactions?.items || []);
const pendingTransactionTotal = computed(() => dashboard.value?.pendingTransactions?.total || 0);
const hiddenPendingTransactionCount = computed(() =>
  Math.max(0, pendingTransactionTotal.value - pendingTransactions.value.length)
);

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
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Dashboard member</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">Halo, {{ auth.user?.name }}</h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Pantau kredit, draft, undangan aktif, dan transaksi terakhir dari satu tempat.
        </p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row">
        <AppButton to="/app/invitations/new">
          <FilePlus2 class="h-4 w-4" />
          Buat Undangan
        </AppButton>
        <AppButton to="/app/credits/buy" variant="secondary">
          <CreditCard class="h-4 w-4" />
          Beli Kredit
        </AppButton>
      </div>
    </div>

    <div v-if="memberDashboard.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat dashboard...</p>
    </div>

    <p v-else-if="memberDashboard.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ memberDashboard.error }}
    </p>

    <template v-else-if="dashboard">
      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sisa kredit" :value="dashboard.creditBalance" tone="leaf" />
        <StatCard label="Undangan aktif" :value="dashboard.invitations.active" tone="gold" />
        <StatCard label="Draft" :value="dashboard.invitations.draft" tone="rose" />
        <StatCard label="Expired" :value="dashboard.invitations.expired" tone="ink" />
      </div>

      <section
        v-if="pendingTransactions.length"
        class="mt-6 rounded-lg border border-gold/25 bg-white p-5 shadow-soft"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold/10 text-gold">
              <Clock3 class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-ink">Pembayaran belum selesai</h2>
              <p class="mt-1 text-sm leading-6 text-ink/60">
                Ada {{ pendingTransactionTotal }} transaksi yang masih menunggu pembayaran atau verifikasi admin.
              </p>
            </div>
          </div>
          <AppButton to="/app/transactions" variant="secondary">Lihat Semua</AppButton>
        </div>

        <div class="mt-5 grid gap-3 lg:grid-cols-3">
          <RouterLink
            v-for="transaction in pendingTransactions"
            :key="transaction.id"
            :to="{ name: 'member-transaction-detail', params: { id: transaction.id } }"
            class="focus-ring rounded-md border border-ink/10 bg-linen p-4 transition hover:border-gold/40 hover:bg-gold/10"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-ink">{{ transaction.creditAmount }} kredit</p>
                <p class="mt-1 text-xs text-ink/50">Dibuat {{ formatDate(transaction.createdAt) }}</p>
              </div>
              <ArrowRight class="h-4 w-4 shrink-0 text-ink/35" />
            </div>

            <p class="mt-4 text-xl font-bold text-ink">{{ formatCurrency(transaction.totalAmount) }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <TransactionStatusBadge :status="transaction.status" />
              <span
                v-if="paymentTimeLeft(transaction)"
                class="inline-flex items-center gap-1.5 rounded-md border border-gold/20 bg-white px-2.5 py-1 text-xs font-bold text-ink"
              >
                <Clock3 class="h-3.5 w-3.5 text-gold" />
                {{ paymentTimeLeft(transaction).isExpired ? "Waktu habis" : paymentTimeLeft(transaction).label }}
              </span>
              <span v-else class="rounded-md border border-leaf/15 bg-white px-2.5 py-1 text-xs font-bold text-leaf">
                Menunggu admin
              </span>
            </div>
          </RouterLink>
        </div>

        <p v-if="hiddenPendingTransactionCount" class="mt-4 text-sm font-semibold text-ink/60">
          +{{ hiddenPendingTransactionCount }} transaksi waiting lainnya. Buka riwayat transaksi untuk melihat semuanya.
        </p>
      </section>

      <div class="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
              <WalletCards class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-ink">Transaksi terakhir</h2>
              <p class="text-sm text-ink/55">Status pembelian kredit terbaru.</p>
            </div>
          </div>

          <div v-if="latestTransaction" class="mt-5 rounded-md border border-ink/10 bg-linen p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-sm font-semibold text-ink">{{ latestTransaction.creditAmount }} kredit</p>
                <p class="mt-1 text-sm text-ink/55">{{ formatDate(latestTransaction.createdAt) }}</p>
              </div>
              <div class="text-left sm:text-right">
                <p class="font-bold text-ink">{{ formatCurrency(latestTransaction.totalAmount) }}</p>
                <p class="mt-1 text-sm font-semibold text-leaf">{{ transactionStatusLabel(latestTransaction.status) }}</p>
              </div>
            </div>
          </div>

          <div v-else class="mt-5 rounded-md border border-dashed border-ink/20 p-5">
            <p class="text-sm font-semibold text-ink">Belum ada transaksi.</p>
            <p class="mt-1 text-sm text-ink/55">Mulai dari pembelian kredit pertama untuk publish undangan.</p>
          </div>
        </section>

        <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-rose/10 text-rose">
                <Bell class="h-5 w-5" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-ink">Notifikasi</h2>
                <p class="text-sm text-ink/55">{{ dashboard.notifications.unread }} belum dibaca</p>
              </div>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <div
              v-for="notification in memberDashboard.notifications.slice(0, 4)"
              :key="notification.id"
              class="rounded-md border border-ink/10 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-bold text-ink">{{ notification.title }}</p>
                  <p class="mt-1 text-sm leading-6 text-ink/60">{{ notification.message }}</p>
                </div>
                <button
                  v-if="!notification.isRead"
                  class="focus-ring rounded-md px-2 py-1 text-xs font-bold text-leaf hover:bg-mint"
                  type="button"
                  @click="memberDashboard.readNotification(notification.id)"
                >
                  Tandai
                </button>
              </div>
            </div>

            <div v-if="!memberDashboard.notifications.length" class="rounded-md border border-dashed border-ink/20 p-5">
              <CalendarClock class="h-5 w-5 text-gold" />
              <p class="mt-3 text-sm font-semibold text-ink">Belum ada notifikasi.</p>
              <p class="mt-1 text-sm text-ink/55">Update transaksi dan undangan akan tampil di sini.</p>
            </div>
          </div>
        </section>
      </div>

      <section class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 class="text-lg font-bold text-ink">Status draft</h2>
        <p class="mt-2 text-sm leading-6 text-ink/60">
          Member bisa menyimpan maksimal {{ dashboard.actions.draftLimit }} draft. Saat ini ada
          {{ dashboard.invitations.draft }} draft.
        </p>
        <div class="mt-4 h-2 overflow-hidden rounded-full bg-ink/10">
          <div
            class="h-full bg-leaf"
            :style="{ width: `${Math.min(100, (dashboard.invitations.draft / dashboard.actions.draftLimit) * 100)}%` }"
          />
        </div>
        <p v-if="!dashboard.actions.canCreateInvitation" class="mt-3 text-sm font-semibold text-rose">
          Batas draft sudah penuh. Hapus atau publish salah satu draft sebelum membuat undangan baru.
        </p>
      </section>
    </template>
  </section>
</template>
