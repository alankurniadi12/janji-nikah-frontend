<script setup>
import { computed, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { AlertCircle, CalendarClock, ChevronRight, FileCheck2, Loader2, RotateCcw, Search } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import StatCard from "@/components/StatCard.vue";
import { useAdminStore } from "@/stores/admin";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";

const router = useRouter();
const adminStore = useAdminStore();
const filters = reactive({
  q: "",
  status: "",
  memberStatus: ""
});
const summary = computed(() => adminStore.invitationSummary || {});
const liveRate = computed(() => {
  if (!summary.value.total) {
    return "0%";
  }

  return `${Math.round(((summary.value.live || 0) / summary.value.total) * 100)}%`;
});

onMounted(load);

function load() {
  adminStore.loadInvitations(normalizedFilters());
}

function resetFilters() {
  Object.assign(filters, {
    q: "",
    status: "",
    memberStatus: ""
  });
  load();
}

function openInvitation(invitation) {
  router.push({ name: "admin-invitation-detail", params: { id: invitation.id } });
}

function normalizedFilters() {
  return Object.fromEntries(
    Object.entries({
      q: filters.q.trim(),
      status: filters.status,
      memberStatus: filters.memberStatus
    }).filter(([, value]) => value)
  );
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Undangan" title="Inspeksi undangan" description="Lihat semua undangan, buka detail operasional, dan proses aksi sensitif dari halaman detail." />

    <template v-if="adminStore.invitationSummary">
      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total undangan" :value="summary.total || 0" tone="ink" />
        <StatCard label="Undangan live" :value="summary.live || 0" tone="leaf" />
        <StatCard label="Draft" :value="summary.draft || 0" tone="gold" />
        <StatCard label="Nonaktif / expired" :value="summary.inactive || 0" tone="rose" />
        <StatCard label="Estimasi omzet jasa" :value="formatCurrency(summary.serviceRevenue?.serviceTotal || 0)" tone="rose" />
      </div>

      <section class="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
              <FileCheck2 class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-ink">Kondisi undangan</h2>
              <p class="text-sm text-ink/55">Ringkasan status seluruh undangan.</p>
            </div>
          </div>

          <div class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Aktif dan masih editable</span>
              <span class="font-semibold text-ink">{{ summary.active || 0 }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Terkunci tapi masih live</span>
              <span class="font-semibold text-ink">{{ summary.locked || 0 }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Sudah pernah publish</span>
              <span class="font-semibold text-ink">{{ summary.publishedTotal || 0 }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Rasio undangan live</span>
              <span class="font-semibold text-leaf">{{ liveRate }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Harga jasa terisi</span>
              <span class="font-semibold text-ink">{{ summary.serviceRevenue?.pricedInvitations || 0 }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Rata-rata nilai jasa</span>
              <span class="font-semibold text-leaf">{{ formatCurrency(summary.serviceRevenue?.averageServicePrice || 0) }}</span>
            </div>
          </div>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-linen text-gold">
              <CalendarClock class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-ink">Aktivitas publish</h2>
              <p class="text-sm text-ink/55">Pantau publish terbaru dan masa aktif undangan.</p>
            </div>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="rounded-md border border-ink/10 bg-linen/60 p-4">
              <p class="text-xs font-bold uppercase tracking-widest text-ink/40">Publish bulan ini</p>
              <p class="mt-2 text-2xl font-bold text-ink">{{ summary.publishedThisMonth || 0 }}</p>
            </div>
            <div class="rounded-md border border-rose/15 bg-rose/5 p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-bold uppercase tracking-widest text-rose/70">Akan expired dalam 7 hari</p>
                <AlertCircle class="h-4 w-4 text-rose" />
              </div>
              <p class="mt-2 text-2xl font-bold text-ink">{{ summary.expiringSoon || 0 }}</p>
            </div>
          </div>
        </article>
      </section>
    </template>

    <form class="mt-6 grid gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft lg:grid-cols-[minmax(0,1fr)_170px_170px_auto_auto] lg:items-end" @submit.prevent="load">
      <label class="block text-sm font-semibold text-ink">
        Cari undangan/member
        <div class="relative mt-2">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            v-model="filters.q"
            class="focus-ring h-11 w-full rounded-md border border-ink/15 bg-white pl-9 pr-3 text-sm"
            placeholder="Nama pengantin, judul, slug, member"
          />
        </div>
      </label>
      <label class="block text-sm font-semibold text-ink">
        Status undangan
        <select v-model="filters.status" class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm" @change="load">
          <option value="">Semua status</option>
          <option value="draft">Draft</option>
          <option value="active">Aktif</option>
          <option value="locked">Terkunci</option>
          <option value="expired">Expired</option>
        </select>
      </label>
      <label class="block text-sm font-semibold text-ink">
        Status member
        <select v-model="filters.memberStatus" class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm" @change="load">
          <option value="">Semua member</option>
          <option value="active">Aktif</option>
          <option value="suspended">Suspend</option>
          <option value="blocked">Block</option>
        </select>
      </label>
      <button
        class="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-leaf px-4 py-2 text-sm font-bold text-white transition hover:bg-ink disabled:opacity-60"
        type="submit"
        :disabled="adminStore.loading"
      >
        <Loader2 v-if="adminStore.loading" class="h-4 w-4 animate-spin" />
        <Search v-else class="h-4 w-4" />
        Terapkan
      </button>
      <button
        class="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink hover:border-leaf hover:text-leaf"
        type="button"
        :disabled="adminStore.loading"
        @click="resetFilters"
      >
        <RotateCcw class="h-4 w-4" />
        Reset
      </button>
    </form>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat daftar undangan...</p>
    </div>

    <p v-else-if="adminStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ adminStore.error }}
    </p>

    <section v-else class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <article
        v-for="invitation in adminStore.invitations"
        :key="invitation.id"
        class="grid cursor-pointer gap-4 border-b border-ink/10 p-5 transition last:border-b-0 hover:bg-linen/60 lg:grid-cols-[1fr_150px_130px_120px_120px_32px] lg:items-center"
        role="button"
        tabindex="0"
        @click="openInvitation(invitation)"
        @keydown.enter.prevent="openInvitation(invitation)"
        @keydown.space.prevent="openInvitation(invitation)"
      >
        <div class="min-w-0">
          <p class="truncate font-bold text-ink">{{ invitation.title || `${invitation.groom?.fullName || "-"} & ${invitation.bride?.fullName || "-"}` }}</p>
          <p class="mt-1 truncate text-sm text-ink/55">/{{ invitation.member?.username || "member" }}/{{ invitation.slug }}</p>
          <p class="mt-2 text-sm text-ink/55">{{ invitation.member?.name || invitation.member?.email || invitation.memberId }}</p>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-ink/40">Update</p>
          <p class="mt-1 text-sm font-semibold text-ink/65">{{ formatDateTime(invitation.updatedAt) }}</p>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-ink/40">Nilai jasa</p>
          <p class="mt-1 text-sm font-bold text-leaf">{{ formatCurrency(invitation.servicePrice || 0) }}</p>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-ink/40">Acara</p>
          <p class="mt-1 text-sm font-semibold text-ink/65">{{ invitation.events?.length || 0 }} data</p>
          <p v-if="invitation.events?.[0]?.date" class="mt-1 text-xs text-ink/45">{{ formatDate(invitation.events[0].date) }}</p>
        </div>
        <InvitationStatusBadge :status="invitation.status" />
        <ChevronRight class="hidden h-5 w-5 text-ink/30 lg:block" />
      </article>
      <p v-if="!adminStore.invitations.length" class="p-8 text-center text-sm font-semibold text-ink/55">Belum ada undangan.</p>
    </section>
  </section>
</template>
