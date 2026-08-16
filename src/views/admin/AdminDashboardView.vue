<script setup>
import { computed, onMounted } from "vue";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, CreditCard, Loader2, RefreshCw, Send } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import StatCard from "@/components/StatCard.vue";
import { useAdminStore } from "@/stores/admin";
import { formatCurrency, formatDateTime, transactionStatusLabel, transactionStatusTone } from "@/utils/formatters";

const adminStore = useAdminStore();

onMounted(() => {
  adminStore.loadDashboard();
});

const dashboard = computed(() => adminStore.dashboard || {});
const actionItems = computed(() => dashboard.value.actionItems || {});
const recentPendingTransactions = computed(() => dashboard.value.recentPendingTransactions || []);
const topPackages = computed(() => dashboard.value.insights?.topPackages || []);
const topThemes = computed(() => dashboard.value.insights?.topThemes || []);
const publishUsageRate = computed(() => `${dashboard.value.credits?.usageRateThisMonth || 0}%`);

const actionRows = computed(() => [
  {
    label: "Pembayaran perlu diverifikasi",
    value: actionItems.value.waitingVerification || 0,
    to: "/admin/payments",
    tone: "text-leaf",
    icon: CheckCircle2
  },
  {
    label: "Menunggu transfer member",
    value: actionItems.value.waitingPayment || 0,
    to: "/admin/payments",
    tone: "text-gold",
    icon: Clock3
  },
  {
    label: "Undangan expired <= 7 hari",
    value: actionItems.value.expiringSoonInvitations || 0,
    to: "/admin/invitations",
    tone: "text-rose",
    icon: AlertCircle
  },
  {
    label: "Notifikasi belum dibaca",
    value: actionItems.value.unreadNotifications || 0,
    to: "/admin/audit-logs",
    tone: "text-ink",
    icon: Send
  }
]);
</script>

<template>
  <section>
    <AdminPageHeader
      eyebrow="Dashboard admin"
      title="Operasional Janji Nikah"
      description="Pantau uang masuk, pembayaran manual, penggunaan kredit, dan aktivitas undangan."
    >
      <AppButton type="button" variant="secondary" :disabled="adminStore.loading" @click="adminStore.loadDashboard">
        <RefreshCw class="h-4 w-4" />
        Refresh
      </AppButton>
    </AdminPageHeader>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat dashboard...</p>
    </div>

    <template v-else-if="adminStore.dashboard">
      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Revenue bulan ini" :value="formatCurrency(dashboard.revenue.thisMonth)" tone="leaf" />
        <StatCard label="Estimasi omzet member" :value="formatCurrency(dashboard.revenue.memberServiceTotal || 0)" tone="gold" />
        <StatCard label="Verifikasi pembayaran" :value="dashboard.transactions.waitingVerification" tone="gold" />
        <StatCard label="Kredit dipakai bulan ini" :value="dashboard.credits.usedThisMonth" tone="rose" />
        <StatCard label="Member aktif" :value="dashboard.members.active" tone="ink" />
      </div>

      <section class="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-ink">Butuh tindakan</h2>
              <p class="mt-1 text-sm text-ink/55">{{ actionItems.total || 0 }} item operasional perlu dipantau.</p>
            </div>
            <AppButton to="/admin/payments" variant="secondary">
              Verifikasi
              <ArrowRight class="h-4 w-4" />
            </AppButton>
          </div>

          <div class="mt-5 grid gap-3 md:grid-cols-2">
            <RouterLink
              v-for="item in actionRows"
              :key="item.label"
              :to="item.to"
              class="focus-ring rounded-md border border-ink/10 p-4 transition hover:border-leaf/40 hover:bg-mint/40"
            >
              <div class="flex items-center justify-between gap-3">
                <component :is="item.icon" class="h-5 w-5" :class="item.tone" />
                <span class="text-2xl font-bold text-ink">{{ item.value }}</span>
              </div>
              <p class="mt-3 text-sm font-semibold text-ink/70">{{ item.label }}</p>
            </RouterLink>
          </div>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
              <CreditCard class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-ink">Kesehatan bisnis</h2>
              <p class="text-sm text-ink/55">Performa bulan berjalan.</p>
            </div>
          </div>

          <div class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Revenue 30 hari</span>
              <span class="font-bold text-ink">{{ formatCurrency(dashboard.revenue.last30Days) }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Estimasi omzet member bulan ini</span>
              <span class="font-bold text-leaf">{{ formatCurrency(dashboard.revenue.memberServiceThisMonth || 0) }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Undangan bernilai jasa</span>
              <span class="font-semibold text-ink">{{ dashboard.revenue.memberServicePricedInvitations || 0 }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Kredit terjual</span>
              <span class="font-semibold text-ink">{{ dashboard.credits.soldThisMonth }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Kredit dipakai publish</span>
              <span class="font-semibold text-ink">{{ dashboard.credits.usedThisMonth }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Rasio pemakaian kredit</span>
              <span class="font-semibold text-leaf">{{ publishUsageRate }}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="mt-6 grid gap-6 xl:grid-cols-3">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Member</h2>
          <div class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Total member</span>
              <span class="font-semibold text-ink">{{ dashboard.members.total }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Member baru bulan ini</span>
              <span class="font-semibold text-ink">{{ dashboard.members.newThisMonth }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Punya kredit</span>
              <span class="font-semibold text-ink">{{ dashboard.members.withCredits }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Sudah pernah publish</span>
              <span class="font-semibold text-ink">{{ dashboard.members.withPublishedInvitations }}</span>
            </div>
          </div>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Undangan</h2>
          <div class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Aktif + terkunci</span>
              <span class="font-semibold text-ink">{{ dashboard.invitations.active }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Draft</span>
              <span class="font-semibold text-ink">{{ dashboard.invitations.draft }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Terkunci</span>
              <span class="font-semibold text-ink">{{ dashboard.invitations.locked }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Publish bulan ini</span>
              <span class="font-semibold text-ink">{{ dashboard.invitations.publishedThisMonth }}</span>
            </div>
          </div>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Transaksi</h2>
          <div class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Menunggu pembayaran</span>
              <span class="font-semibold text-ink">{{ dashboard.transactions.waitingPayment }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Menunggu verifikasi</span>
              <span class="font-semibold text-ink">{{ dashboard.transactions.waitingVerification }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Sukses total</span>
              <span class="font-semibold text-ink">{{ dashboard.transactions.success }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Expired bulan ini</span>
              <span class="font-semibold text-ink">{{ dashboard.transactions.expiredThisMonth }}</span>
            </div>
          </div>
        </article>
      </section>

      <section class="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-bold text-ink">Transaksi pending terbaru</h2>
            <RouterLink class="text-sm font-semibold text-leaf hover:text-ink" to="/admin/payments">Lihat semua</RouterLink>
          </div>

          <div v-if="recentPendingTransactions.length" class="mt-4 divide-y divide-ink/10">
            <div
              v-for="transaction in recentPendingTransactions"
              :key="transaction.id"
              class="grid gap-3 py-4 lg:grid-cols-[1fr_130px_150px_140px] lg:items-center"
            >
              <div>
                <p class="font-semibold text-ink">{{ transaction.member?.name || "Member" }}</p>
                <p class="mt-1 text-xs text-ink/45">{{ transaction.member?.email || transaction.memberId }}</p>
              </div>
              <p class="text-sm font-semibold text-ink">{{ transaction.creditAmount }} kredit</p>
              <p class="text-sm font-bold text-ink">{{ formatCurrency(transaction.totalAmount) }}</p>
              <div class="space-y-2">
                <span class="inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold" :class="transactionStatusTone(transaction.status)">
                  {{ transactionStatusLabel(transaction.status) }}
                </span>
                <p class="text-xs text-ink/45">{{ formatDateTime(transaction.expiresAt) }}</p>
              </div>
            </div>
          </div>
          <p v-else class="mt-4 rounded-md bg-linen p-5 text-center text-sm font-semibold text-ink/55">
            Tidak ada transaksi pending saat ini.
          </p>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Insight bulan ini</h2>

          <div class="mt-5">
            <p class="text-sm font-semibold text-ink/60">Paket terlaris</p>
            <div v-if="topPackages.length" class="mt-2 space-y-3">
              <div v-for="item in topPackages" :key="item.packageId || item.creditAmount" class="flex justify-between gap-3 text-sm">
                <span class="font-semibold text-ink">{{ item.name }}</span>
                <span class="text-ink/55">{{ item.transactions }} transaksi</span>
              </div>
            </div>
            <p v-else class="mt-2 text-sm text-ink/45">Belum ada transaksi sukses bulan ini.</p>
          </div>

          <div class="mt-6">
            <p class="text-sm font-semibold text-ink/60">Tema paling dipakai</p>
            <div v-if="topThemes.length" class="mt-2 space-y-3">
              <div v-for="item in topThemes" :key="item.themeId || item.name" class="flex justify-between gap-3 text-sm">
                <span class="font-semibold text-ink">{{ item.name }}</span>
                <span class="text-ink/55">{{ item.published }} publish</span>
              </div>
            </div>
            <p v-else class="mt-2 text-sm text-ink/45">Belum ada undangan publish bulan ini.</p>
          </div>
        </article>
      </section>
    </template>
  </section>
</template>
