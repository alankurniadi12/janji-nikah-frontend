<script setup>
import { onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { ChevronRight, Loader2, RotateCcw, Search } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import { useAdminStore } from "@/stores/admin";
import { formatDate, formatDateTime } from "@/utils/formatters";

const router = useRouter();
const adminStore = useAdminStore();
const filters = reactive({
  q: "",
  status: "",
  memberStatus: ""
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
        class="grid cursor-pointer gap-4 border-b border-ink/10 p-5 transition last:border-b-0 hover:bg-linen/60 lg:grid-cols-[1fr_170px_120px_120px_32px] lg:items-center"
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
