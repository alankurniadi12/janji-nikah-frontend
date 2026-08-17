<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Copy, ExternalLink, FilePlus2, Loader2, Sparkles, Trash2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import ThemePreviewCard from "@/components/ThemePreviewCard.vue";
import { invitationThemes } from "@/lib/invitationThemes";
import { useInvitationStore } from "@/stores/invitations";
import { formatCurrency, formatDate } from "@/utils/formatters";

const invitationStore = useInvitationStore();
const draftToDelete = ref(null);
const catalogLinkCopied = ref(false);
const pageSize = ref(10);
let filterTimer = null;
const filters = ref({
  query: "",
  dateMode: "all",
  date: "",
  month: ""
});

onMounted(() => {
  loadInvitationPage(1);
});

onBeforeUnmount(() => {
  clearFilterTimer();
});

const pagination = computed(() => invitationStore.pagination);
const draftCount = computed(() => invitationStore.summary.draft || 0);
const themeShortcuts = computed(() =>
  invitationThemes.slice(0, 3).map((theme) => ({
    id: theme.key,
    key: theme.key,
    name: theme.name,
    thumbnailUrl: ""
  }))
);
const hasActiveFilters = computed(() =>
  Boolean(filters.value.query.trim() || (filters.value.dateMode === "date" && filters.value.date) || (filters.value.dateMode === "month" && filters.value.month))
);
const resultStart = computed(() => {
  if (!pagination.value.total) {
    return 0;
  }

  return (pagination.value.page - 1) * pagination.value.limit + 1;
});
const resultEnd = computed(() => Math.min(pagination.value.page * pagination.value.limit, pagination.value.total));
const draftDeleteDetail = computed(() => {
  if (!draftToDelete.value) {
    return "";
  }

  const title =
    draftToDelete.value.title ||
    `${draftToDelete.value.groom?.fullName || "Pengantin pria"} & ${draftToDelete.value.bride?.fullName || "Pengantin wanita"}`;

  return `${title} · /${draftToDelete.value.slug}`;
});

watch(
  filters,
  () => {
    clearFilterTimer();
    filterTimer = window.setTimeout(() => {
      loadInvitationPage(1);
    }, 350);
  },
  { deep: true }
);

watch(pageSize, () => {
  loadInvitationPage(1);
});

function clearFilterTimer() {
  if (filterTimer) {
    window.clearTimeout(filterTimer);
    filterTimer = null;
  }
}

function buildInvitationQuery(page = 1) {
  return {
    page,
    limit: pageSize.value,
    q: filters.value.query || undefined,
    dateMode: filters.value.dateMode,
    date: filters.value.dateMode === "date" ? filters.value.date || undefined : undefined,
    month: filters.value.dateMode === "month" ? filters.value.month || undefined : undefined
  };
}

function loadInvitationPage(page = 1) {
  return invitationStore.loadInvitations(buildInvitationQuery(page));
}

function requestDeleteDraft(invitation) {
  if (invitation.status !== "draft") {
    return;
  }

  draftToDelete.value = invitation;
}

async function confirmDeleteDraft() {
  if (!draftToDelete.value) {
    return;
  }

  const invitationId = draftToDelete.value.id;
  await invitationStore.removeDraft(invitationId);
  draftToDelete.value = null;
  await loadInvitationPage(pagination.value.page);
}

async function copyCatalogLink() {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/demo-tema`);
    catalogLinkCopied.value = true;
    window.setTimeout(() => {
      catalogLinkCopied.value = false;
    }, 1800);
  } catch {
    catalogLinkCopied.value = false;
  }
}

function resetFilters() {
  filters.value = {
    query: "",
    dateMode: "all",
    date: "",
    month: ""
  };
}
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Undangan saya</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">Kelola draft dan undangan aktif</h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Buat draft maksimal 3, lanjutkan pengisian data, atau buka preview sebelum publish.
        </p>
      </div>
      <AppButton to="/app/invitations/new" :disabled="draftCount >= 3">
        <FilePlus2 class="h-4 w-4" />
        Buat Undangan
      </AppButton>
    </div>

    <p v-if="draftCount >= 3" class="mt-5 rounded-md bg-gold/10 px-4 py-3 text-sm font-semibold text-ink">
      Batas 3 draft sudah penuh. Hapus atau publish salah satu draft sebelum membuat undangan baru.
    </p>

    <section class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div>
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
            <Sparkles class="h-5 w-5" />
          </div>
          <p class="mt-4 text-sm font-bold uppercase tracking-widest text-gold">Katalog tema & musik</p>
          <h2 class="mt-2 text-2xl font-bold text-ink">Tunjukkan contoh tema dan musik tanpa membuat draft.</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Buka katalog siap pakai, salin link, lalu kirim ke calon pengantin untuk bantu proses pilih desain dan musik.
          </p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            <RouterLink
              class="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf"
              :to="{ name: 'theme-demo' }"
              target="_blank"
            >
              <ExternalLink class="h-4 w-4" />
              Buka Katalog
            </RouterLink>
            <button
              class="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
              type="button"
              @click="copyCatalogLink"
            >
              <Check v-if="catalogLinkCopied" class="h-4 w-4" />
              <Copy v-else class="h-4 w-4" />
              {{ catalogLinkCopied ? "Link Tersalin" : "Salin Link Katalog" }}
            </button>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <RouterLink
            v-for="theme in themeShortcuts"
            :key="theme.id"
            class="focus-ring rounded-md transition hover:-translate-y-0.5 hover:shadow-soft"
            :to="{ name: 'theme-demo-detail', params: { themeKey: theme.key } }"
            target="_blank"
          >
            <ThemePreviewCard :theme="theme" compact />
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div class="grid gap-4 lg:grid-cols-[1fr_180px_180px_120px]">
        <label class="block text-sm font-semibold text-ink">
          Cari undangan
          <input
            v-model.trim="filters.query"
            class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
            placeholder="Cari judul, nama pengantin, atau slug"
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
        <div class="flex items-end">
          <AppButton class="w-full" type="button" variant="secondary" :disabled="!hasActiveFilters" @click="resetFilters">
            Reset
          </AppButton>
        </div>
      </div>
      <div class="mt-4 flex flex-col gap-3 border-t border-ink/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-ink/55">
          Menampilkan {{ resultStart }}-{{ resultEnd }} dari {{ pagination.total }} undangan.
        </p>
        <label class="flex items-center gap-2 text-sm font-semibold text-ink">
          Per halaman
          <select v-model.number="pageSize" class="focus-ring h-10 rounded-md border border-ink/15 px-3 text-sm">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </label>
      </div>
    </section>

    <div v-if="invitationStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat undangan...</p>
    </div>

    <p v-else-if="invitationStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ invitationStore.error }}
    </p>

    <section v-else class="mt-8 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <div v-if="invitationStore.invitations.length" class="divide-y divide-ink/10">
        <div
          v-for="invitation in invitationStore.invitations"
          :key="invitation.id"
          class="grid gap-4 px-5 py-4 md:grid-cols-[1fr_120px_150px_150px] md:items-center"
        >
          <RouterLink
            :to="{ name: 'member-invitation-detail', params: { id: invitation.id } }"
            class="focus-ring rounded-md"
          >
            <p class="text-sm font-bold text-ink">
              {{ invitation.title || `${invitation.groom?.fullName || "Pengantin pria"} & ${invitation.bride?.fullName || "Pengantin wanita"}` }}
            </p>
            <p class="mt-1 text-sm text-ink/55">
              /{{ invitation.slug }} · Dibuat {{ formatDate(invitation.createdAt) }} · Nilai jasa {{ formatCurrency(invitation.servicePrice || 0) }}
            </p>
          </RouterLink>
          <InvitationStatusBadge :status="invitation.status" />
          <div class="text-sm text-ink/55">
            {{ invitation.events?.length || 0 }} acara
          </div>
          <div class="flex items-center justify-end gap-2">
            <RouterLink
              class="focus-ring rounded-md px-3 py-2 text-sm font-semibold text-leaf hover:bg-mint"
              :to="{ name: 'member-invitation-guests', params: { id: invitation.id } }"
            >
              Kelola Tamu
            </RouterLink>
            <button
              v-if="invitation.status === 'draft'"
              class="focus-ring rounded-md p-2 text-rose hover:bg-rose/10"
              type="button"
              aria-label="Hapus draft"
              @click="requestDeleteDraft(invitation)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
            <RouterLink
              class="focus-ring rounded-md p-2 text-ink/45 hover:bg-mint hover:text-leaf"
              :to="{ name: 'member-invitation-detail', params: { id: invitation.id } }"
              aria-label="Buka undangan"
            >
              <ArrowRight class="h-4 w-4" />
            </RouterLink>
          </div>
        </div>
      </div>

      <div v-else class="p-8 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-mint text-leaf">
          <FilePlus2 class="h-6 w-6" />
        </div>
        <h2 class="mt-4 text-xl font-bold text-ink">{{ hasActiveFilters ? "Undangan tidak ditemukan" : "Belum ada undangan" }}</h2>
        <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
          {{ hasActiveFilters ? "Coba ubah kata pencarian atau filter tanggal." : "Mulai dari draft pertama. Draft dan preview tidak memakai kredit." }}
        </p>
        <AppButton v-if="hasActiveFilters" type="button" variant="secondary" class="mt-5" @click="resetFilters">Reset Filter</AppButton>
        <AppButton v-else to="/app/invitations/new" class="mt-5">Buat Undangan</AppButton>
      </div>
    </section>

    <nav
      v-if="!invitationStore.loading && pagination.totalPages > 1"
      class="mt-5 flex flex-col gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
      aria-label="Pagination undangan"
    >
      <p class="text-sm font-semibold text-ink/60">
        Halaman {{ pagination.page }} dari {{ pagination.totalPages }}
      </p>
      <div class="flex items-center gap-2">
        <AppButton
          type="button"
          variant="secondary"
          :disabled="!pagination.hasPreviousPage || invitationStore.loading"
          @click="loadInvitationPage(pagination.page - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
          Sebelumnya
        </AppButton>
        <AppButton
          type="button"
          variant="secondary"
          :disabled="!pagination.hasNextPage || invitationStore.loading"
          @click="loadInvitationPage(pagination.page + 1)"
        >
          Berikutnya
          <ChevronRight class="h-4 w-4" />
        </AppButton>
      </div>
    </nav>

    <ConfirmDialog
      :open="Boolean(draftToDelete)"
      title="Hapus undangan?"
      message="Apakah kamu yakin ingin menghapus undangan ini? Draft yang sudah dihapus tidak bisa dikembalikan."
      :detail="draftDeleteDetail"
      confirm-label="Ya, Hapus"
      :loading="invitationStore.saving"
      @cancel="draftToDelete = null"
      @confirm="confirmDeleteDraft"
    />
  </section>
</template>
