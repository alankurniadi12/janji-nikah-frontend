<script setup>
import { computed, onMounted, ref } from "vue";
import { ArrowRight, ExternalLink, FilePlus2, Loader2, Sparkles, Trash2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import ThemePreviewCard from "@/components/ThemePreviewCard.vue";
import { invitationThemes } from "@/lib/invitationThemes";
import { useInvitationStore } from "@/stores/invitations";
import { formatDate } from "@/utils/formatters";

const invitationStore = useInvitationStore();
const draftToDelete = ref(null);
const filters = ref({
  query: "",
  dateMode: "all",
  date: "",
  month: ""
});

onMounted(() => {
  invitationStore.loadInvitations();
});

const draftCount = computed(() =>
  invitationStore.invitations.filter((invitation) => invitation.status === "draft").length
);
const themeShortcuts = computed(() =>
  invitationThemes.slice(0, 3).map((theme) => ({
    id: theme.key,
    key: theme.key,
    name: theme.name,
    thumbnailUrl: ""
  }))
);
const filteredInvitations = computed(() => {
  const query = filters.value.query.trim().toLowerCase();

  return invitationStore.invitations.filter((invitation) => {
    const searchableText = [
      invitation.title,
      invitation.slug,
      invitation.groom?.fullName,
      invitation.bride?.fullName
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (query && !searchableText.includes(query)) {
      return false;
    }

    if (filters.value.dateMode === "date" && filters.value.date) {
      return toDateInput(invitation.createdAt) === filters.value.date;
    }

    if (filters.value.dateMode === "month" && filters.value.month) {
      return toMonthInput(invitation.createdAt) === filters.value.month;
    }

    return true;
  });
});
const hasActiveFilters = computed(() =>
  Boolean(filters.value.query.trim() || (filters.value.dateMode === "date" && filters.value.date) || (filters.value.dateMode === "month" && filters.value.month))
);
const draftDeleteDetail = computed(() => {
  if (!draftToDelete.value) {
    return "";
  }

  const title =
    draftToDelete.value.title ||
    `${draftToDelete.value.groom?.fullName || "Pengantin pria"} & ${draftToDelete.value.bride?.fullName || "Pengantin wanita"}`;

  return `${title} · /${draftToDelete.value.slug}`;
});

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
}

function resetFilters() {
  filters.value = {
    query: "",
    dateMode: "all",
    date: "",
    month: ""
  };
}

function toDateInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function toMonthInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 7);
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
          <p class="mt-4 text-sm font-bold uppercase tracking-widest text-gold">Katalog tema</p>
          <h2 class="mt-2 text-2xl font-bold text-ink">Tunjukkan contoh tema tanpa membuat draft.</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Buka preview tema siap pakai, salin link, lalu kirim ke calon pengantin untuk bantu proses pilih desain.
          </p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            <AppButton :to="{ name: 'theme-demo' }" variant="secondary">
              <ExternalLink class="h-4 w-4" />
              Buka Katalog Tema
            </AppButton>
            <AppButton :to="{ name: 'theme-demo-detail', params: { themeKey: 'elegant-classic' } }">
              Lihat Preview Utama
            </AppButton>
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
      <p class="mt-3 text-sm text-ink/55">
        Menampilkan {{ filteredInvitations.length }} dari {{ invitationStore.invitations.length }} undangan.
      </p>
    </section>

    <div v-if="invitationStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat undangan...</p>
    </div>

    <p v-else-if="invitationStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ invitationStore.error }}
    </p>

    <section v-else class="mt-8 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <div v-if="filteredInvitations.length" class="divide-y divide-ink/10">
        <div
          v-for="invitation in filteredInvitations"
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
              /{{ invitation.slug }} · Dibuat {{ formatDate(invitation.createdAt) }} · Update {{ formatDate(invitation.updatedAt) }}
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
