<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ExternalLink, Loader2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import { useInvitationStore } from "@/stores/invitations";
import { assetUrl } from "@/utils/assets";

const invitationStore = useInvitationStore();
const route = useRoute();

onMounted(() => {
  invitationStore.createPreview(route.params.id);
});

const preview = computed(() => invitationStore.preview);
const invitation = computed(() => preview.value?.invitation || invitationStore.current);
const previewUrl = computed(() => preview.value?.previewUrl || "");
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Preview</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">Preview undangan</h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Preview dibuat dari draft saat ini dan tidak memakai kredit.
        </p>
      </div>
      <AppButton
        v-if="invitation"
        :to="{ name: 'member-invitation-detail', params: { id: invitation.id } }"
        variant="secondary"
      >
        Kembali ke Edit Undangan
      </AppButton>
    </div>

    <div v-if="invitationStore.saving" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Membuat preview...</p>
    </div>

    <p v-else-if="invitationStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ invitationStore.error }}
    </p>

    <section v-else-if="preview" class="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-2xl font-bold text-ink">
              {{ invitation.title || `${invitation.groom?.fullName || "Pengantin"} & ${invitation.bride?.fullName || "Pasangan"}` }}
            </h2>
            <p class="mt-2 text-sm text-ink/55">/{{ invitation.slug }}</p>
          </div>
          <InvitationStatusBadge :status="invitation.status" />
        </div>

        <div class="mt-6 overflow-hidden rounded-md border border-ink/10 bg-linen">
          <img
            v-if="invitation.mainPhotoUrl"
            :src="assetUrl(invitation.mainPhotoUrl)"
            alt="Preview foto utama"
            class="aspect-[16/9] w-full object-cover"
          />
          <div v-else class="flex aspect-[16/9] items-center justify-center text-sm font-semibold text-ink/40">
            Foto utama belum diunggah
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div class="rounded-md border border-ink/10 p-4">
            <p class="text-sm font-bold text-ink">Pengantin pria</p>
            <p class="mt-2 text-sm text-ink/60">{{ invitation.groom?.fullName || "-" }}</p>
          </div>
          <div class="rounded-md border border-ink/10 p-4">
            <p class="text-sm font-bold text-ink">Pengantin wanita</p>
            <p class="mt-2 text-sm text-ink/60">{{ invitation.bride?.fullName || "-" }}</p>
          </div>
        </div>
      </div>

      <aside class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 class="text-lg font-bold text-ink">URL preview</h2>
        <p class="mt-2 text-sm leading-6 text-ink/60">
          Link ini akan dirender oleh halaman public invitation pada Phase 6.
        </p>
        <div class="mt-4 rounded-md bg-linen p-3 text-sm font-semibold text-ink break-all">
          {{ previewUrl }}
        </div>
        <a
          class="focus-ring mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
          :href="previewUrl"
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink class="h-4 w-4" />
          Buka URL Preview
        </a>
      </aside>
    </section>
  </section>
</template>
