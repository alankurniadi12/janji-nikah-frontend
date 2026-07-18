<script setup>
import { computed, onMounted } from "vue";
import { ArrowRight, FilePlus2, Loader2, Trash2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import { useInvitationStore } from "@/stores/invitations";
import { formatDate } from "@/utils/formatters";

const invitationStore = useInvitationStore();

onMounted(() => {
  invitationStore.loadInvitations();
});

const draftCount = computed(() =>
  invitationStore.invitations.filter((invitation) => invitation.status === "draft").length
);

async function deleteDraft(invitation) {
  if (invitation.status !== "draft") {
    return;
  }

  await invitationStore.removeDraft(invitation.id);
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
              /{{ invitation.slug }} · Update {{ formatDate(invitation.updatedAt) }}
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
              Tamu
            </RouterLink>
            <button
              v-if="invitation.status === 'draft'"
              class="focus-ring rounded-md p-2 text-rose hover:bg-rose/10"
              type="button"
              aria-label="Hapus draft"
              @click="deleteDraft(invitation)"
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
        <h2 class="mt-4 text-xl font-bold text-ink">Belum ada undangan</h2>
        <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
          Mulai dari draft pertama. Draft dan preview tidak memakai kredit.
        </p>
        <AppButton to="/app/invitations/new" class="mt-5">Buat Undangan</AppButton>
      </div>
    </section>
  </section>
</template>
