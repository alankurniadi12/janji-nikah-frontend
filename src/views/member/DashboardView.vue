<script setup>
import { computed, onMounted } from "vue";
import { Bell, CalendarClock, CreditCard, FilePlus2, Loader2, WalletCards } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import StatCard from "@/components/StatCard.vue";
import { useAuthStore } from "@/stores/auth";
import { useMemberDashboardStore } from "@/stores/memberDashboard";
import { formatCurrency, formatDate, transactionStatusLabel } from "@/utils/formatters";

const auth = useAuthStore();
const memberDashboard = useMemberDashboardStore();

onMounted(async () => {
  await Promise.all([memberDashboard.loadDashboard(), memberDashboard.loadNotifications()]);
});

const dashboard = computed(() => memberDashboard.dashboard);
const latestTransaction = computed(() => dashboard.value?.latestTransaction);
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
