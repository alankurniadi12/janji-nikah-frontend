<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  CreditCard,
  FilePlus2,
  Loader2,
  PencilLine,
  Send,
  Ticket,
  WalletCards
} from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import StatCard from "@/components/StatCard.vue";
import TransactionStatusBadge from "@/components/TransactionStatusBadge.vue";
import { useAuthStore } from "@/stores/auth";
import { useMemberDashboardStore } from "@/stores/memberDashboard";
import { formatCurrency, formatDate, formatDateTime, transactionStatusLabel } from "@/utils/formatters";

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
const invitations = computed(() => dashboard.value?.invitations || {});
const actions = computed(() => dashboard.value?.actions || {});
const latestTransaction = computed(() => dashboard.value?.latestTransaction);
const pendingTransactions = computed(() => dashboard.value?.pendingTransactions?.items || []);
const pendingTransactionTotal = computed(() => dashboard.value?.pendingTransactions?.total || 0);
const recentInvitations = computed(() => dashboard.value?.recentInvitations || []);
const unreadNotifications = computed(() => dashboard.value?.notifications?.unread || 0);
const waitingPaymentCount = computed(() => pendingTransactions.value.filter((transaction) => transaction.status === "waiting_payment").length);
const waitingVerificationCount = computed(() =>
  pendingTransactions.value.filter((transaction) => transaction.status === "waiting_verification").length
);
const hiddenPendingTransactionCount = computed(() =>
  Math.max(0, pendingTransactionTotal.value - pendingTransactions.value.length)
);
const publishCapacityLabel = computed(() => {
  const creditBalance = dashboard.value?.creditBalance || 0;
  return `${creditBalance} undangan bisa dipublish`;
});
const nextAction = computed(() => {
  if (waitingPaymentCount.value) {
    return {
      title: "Selesaikan pembayaran",
      description: `${waitingPaymentCount.value} transaksi masih menunggu transfer.`,
      to: "/app/transactions",
      label: "Bayar Sekarang",
      tone: "gold",
      icon: Clock3
    };
  }

  if (waitingVerificationCount.value) {
    return {
      title: "Menunggu verifikasi admin",
      description: `${waitingVerificationCount.value} bukti pembayaran sedang dicek.`,
      to: "/app/transactions",
      label: "Cek Transaksi",
      tone: "leaf",
      icon: CheckCircle2
    };
  }

  if (!dashboard.value?.creditBalance) {
    return {
      title: "Kredit belum tersedia",
      description: "Beli kredit dulu sebelum publish undangan klien.",
      to: "/app/credits/buy",
      label: "Beli Kredit",
      tone: "rose",
      icon: CreditCard
    };
  }

  if (!actions.value.canCreateInvitation) {
    return {
      title: "Draft sudah penuh",
      description: `Batas ${actions.value.draftLimit} draft terpakai semua.`,
      to: "/app/invitations",
      label: "Kelola Draft",
      tone: "rose",
      icon: AlertCircle
    };
  }

  if (invitations.value.draft) {
    return {
      title: "Lanjutkan draft",
      description: `${invitations.value.draft} draft bisa diselesaikan sebelum publish.`,
      to: "/app/invitations",
      label: "Buka Draft",
      tone: "leaf",
      icon: PencilLine
    };
  }

  return {
    title: "Siap buat undangan baru",
    description: "Mulai draft baru untuk calon pengantin berikutnya.",
    to: "/app/invitations/new",
    label: "Buat Undangan",
    tone: "leaf",
    icon: FilePlus2
  };
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

function invitationRoute(invitation) {
  if (["active", "locked"].includes(invitation.status)) {
    return { name: "member-invitation-guests", params: { id: invitation.id } };
  }

  return { name: "member-invitation-detail", params: { id: invitation.id } };
}

function invitationActionLabel(invitation) {
  const labels = {
    draft: "Lanjutkan",
    active: "Kelola Tamu",
    locked: "Kelola Tamu",
    expired: "Lihat"
  };

  return labels[invitation.status] || "Buka";
}
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Dashboard member</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">Halo, {{ auth.user?.name }}</h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Ringkasan kerja member: kredit, pembayaran, draft, undangan live, dan update terbaru.
        </p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row">
        <AppButton to="/app/invitations/new" :disabled="dashboard && !actions.canCreateInvitation">
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
      <section class="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
                :class="{
                  'bg-mint text-leaf': nextAction.tone === 'leaf',
                  'bg-gold/10 text-gold': nextAction.tone === 'gold',
                  'bg-rose/10 text-rose': nextAction.tone === 'rose'
                }"
              >
                <component :is="nextAction.icon" class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-bold uppercase tracking-widest text-gold">Langkah berikutnya</p>
                <h2 class="mt-2 text-2xl font-bold text-ink">{{ nextAction.title }}</h2>
                <p class="mt-2 max-w-xl text-sm leading-6 text-ink/60">{{ nextAction.description }}</p>
              </div>
            </div>
            <AppButton :to="nextAction.to">
              {{ nextAction.label }}
              <ArrowRight class="h-4 w-4" />
            </AppButton>
          </div>

          <div class="mt-5 grid gap-3 md:grid-cols-3">
            <div class="rounded-md border border-ink/10 bg-linen/70 p-4">
              <p class="text-xs font-bold uppercase tracking-widest text-ink/40">Kapasitas publish</p>
              <p class="mt-2 text-lg font-bold text-ink">{{ publishCapacityLabel }}</p>
            </div>
            <div class="rounded-md border border-ink/10 bg-linen/70 p-4">
              <p class="text-xs font-bold uppercase tracking-widest text-ink/40">Draft terpakai</p>
              <p class="mt-2 text-lg font-bold text-ink">{{ invitations.draft || 0 }}/{{ actions.draftLimit }}</p>
            </div>
            <div class="rounded-md border border-ink/10 bg-linen/70 p-4">
              <p class="text-xs font-bold uppercase tracking-widest text-ink/40">Notifikasi</p>
              <p class="mt-2 text-lg font-bold text-ink">{{ unreadNotifications }} belum dibaca</p>
            </div>
          </div>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
              <Ticket class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-ink">Ringkasan undangan</h2>
              <p class="text-sm text-ink/55">{{ invitations.total || 0 }} undangan tersimpan.</p>
            </div>
          </div>

          <div class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Live sekarang</span>
              <span class="font-semibold text-ink">{{ invitations.live || 0 }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Aktif editable</span>
              <span class="font-semibold text-ink">{{ invitations.active || 0 }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Terkunci</span>
              <span class="font-semibold text-ink">{{ invitations.locked || 0 }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Akan expired 7 hari</span>
              <span class="font-semibold text-rose">{{ invitations.expiringSoon || 0 }}</span>
            </div>
          </div>
        </article>
      </section>

      <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sisa kredit" :value="dashboard.creditBalance" tone="leaf" />
        <StatCard label="Undangan live" :value="invitations.live || 0" tone="gold" />
        <StatCard label="Draft" :value="invitations.draft || 0" tone="rose" />
        <StatCard label="Transaksi pending" :value="pendingTransactionTotal" tone="ink" />
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

      <section class="mt-6">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-ink">Undangan terbaru</h2>
              <p class="mt-1 text-sm text-ink/55">Draft dan undangan live yang terakhir diperbarui.</p>
            </div>
            <RouterLink class="text-sm font-semibold text-leaf hover:text-ink" to="/app/invitations">Lihat semua</RouterLink>
          </div>

          <div v-if="recentInvitations.length" class="mt-4 divide-y divide-ink/10">
            <div
              v-for="invitation in recentInvitations"
              :key="invitation.id"
              class="grid gap-3 py-4 lg:grid-cols-[1fr_120px_130px] lg:items-center"
            >
              <div class="min-w-0">
                <p class="truncate font-semibold text-ink">
                  {{ invitation.title || `${invitation.groom?.fullName || "-"} & ${invitation.bride?.fullName || "-"}` }}
                </p>
                <p class="mt-1 truncate text-xs text-ink/45">/{{ auth.user?.username }}/{{ invitation.slug }}</p>
                <p class="mt-1 text-xs text-ink/45">Update {{ formatDateTime(invitation.updatedAt) }}</p>
              </div>
              <InvitationStatusBadge :status="invitation.status" />
              <RouterLink
                class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/15 px-3 py-2 text-sm font-bold text-ink transition hover:border-leaf hover:text-leaf"
                :to="invitationRoute(invitation)"
              >
                {{ invitationActionLabel(invitation) }}
              </RouterLink>
            </div>
          </div>

          <div v-else class="mt-5 rounded-md border border-dashed border-ink/20 p-5">
            <p class="text-sm font-semibold text-ink">Belum ada undangan.</p>
            <p class="mt-1 text-sm text-ink/55">Buat draft pertama untuk mulai mengerjakan pesanan klien.</p>
            <AppButton to="/app/invitations/new" class="mt-4">
              <FilePlus2 class="h-4 w-4" />
              Buat Undangan
            </AppButton>
          </div>
        </article>
      </section>

      <section class="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
              <WalletCards class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-ink">Transaksi terakhir</h2>
              <p class="text-sm text-ink/55">Status pembelian kredit terbaru.</p>
            </div>
          </div>

          <RouterLink
            v-if="latestTransaction"
            class="focus-ring mt-5 block rounded-md border border-ink/10 bg-linen p-4 transition hover:border-leaf/40 hover:bg-mint/40"
            :to="{ name: 'member-transaction-detail', params: { id: latestTransaction.id } }"
          >
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
          </RouterLink>

          <div v-else class="mt-5 rounded-md border border-dashed border-ink/20 p-5">
            <p class="text-sm font-semibold text-ink">Belum ada transaksi.</p>
            <p class="mt-1 text-sm text-ink/55">Mulai dari pembelian kredit pertama untuk publish undangan.</p>
          </div>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-rose/10 text-rose">
                <Bell class="h-5 w-5" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-ink">Notifikasi</h2>
                <p class="text-sm text-ink/55">{{ unreadNotifications }} belum dibaca</p>
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
              <Send class="h-5 w-5 text-gold" />
              <p class="mt-3 text-sm font-semibold text-ink">Belum ada notifikasi.</p>
              <p class="mt-1 text-sm text-ink/55">Update transaksi dan undangan akan tampil di sini.</p>
            </div>
          </div>
        </article>
      </section>
    </template>
  </section>
</template>
