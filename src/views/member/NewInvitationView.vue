<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Loader2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useInvitationStore } from "@/stores/invitations";

const router = useRouter();
const invitationStore = useInvitationStore();
const error = ref("");
const missingFields = ref([]);
const form = reactive({
  groomName: "",
  brideName: "",
  servicePrice: ""
});

async function createDraft() {
  error.value = "";
  missingFields.value = [];

  if (!form.groomName.trim()) {
    missingFields.value.push("groomName");
  }

  if (!form.brideName.trim()) {
    missingFields.value.push("brideName");
  }

  if (missingFields.value.length) {
    error.value = "Lengkapi nama pengantin pria dan wanita sebelum membuat draft.";
    return;
  }

  try {
    const invitation = await invitationStore.createDraft({
      title: createInvitationTitle(form.groomName, form.brideName),
      groom: {
        fullName: form.groomName
      },
      bride: {
        fullName: form.brideName
      },
      servicePrice: Number(form.servicePrice || 0)
    });
    router.push({ name: "member-invitation-detail", params: { id: invitation.id } });
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Draft undangan belum bisa dibuat.");
  }
}

function createInvitationTitle(groomName, brideName) {
  const groom = groomName?.trim();
  const bride = brideName?.trim();

  if (groom && bride) {
    return `${groom} & ${bride}`;
  }

  return groom || bride || "Draft undangan";
}

function isMissing(field) {
  return missingFields.value.includes(field);
}

function clearMissing() {
  missingFields.value = [];
  error.value = "";
}
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <div class="rounded-lg border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
      <p class="text-sm font-bold uppercase tracking-widest text-gold">Draft baru</p>
      <h1 class="mt-3 text-3xl font-bold text-ink">Buat undangan</h1>
      <p class="mt-3 leading-7 text-ink/65">
        Isi nama pengantin agar judul dan slug undangan otomatis rapi. Detail lengkap bisa dilanjutkan di halaman edit undangan.
      </p>

      <form class="mt-8 space-y-5" @submit.prevent="createDraft">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-semibold text-ink" for="groomName">Nama pengantin pria</label>
            <input
              id="groomName"
              v-model.trim="form.groomName"
              class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
              :class="isMissing('groomName') ? 'border-rose bg-rose/5' : 'border-ink/15'"
              placeholder="Rama"
              @input="clearMissing"
            />
            <p v-if="isMissing('groomName')" class="mt-1 text-xs font-semibold text-rose">Wajib diisi.</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-ink" for="brideName">Nama pengantin wanita</label>
            <input
              id="brideName"
              v-model.trim="form.brideName"
              class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
              :class="isMissing('brideName') ? 'border-rose bg-rose/5' : 'border-ink/15'"
              placeholder="Alya"
              @input="clearMissing"
            />
            <p v-if="isMissing('brideName')" class="mt-1 text-xs font-semibold text-rose">Wajib diisi.</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-ink" for="servicePrice">Harga jasa undangan</label>
          <input
            id="servicePrice"
            v-model.number="form.servicePrice"
            class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
            type="number"
            min="0"
            step="1000"
            inputmode="numeric"
            placeholder="Contoh: 250000"
          />
          <p class="mt-1 text-xs font-semibold text-ink/45">Optional. Dipakai untuk estimasi omzet jasa di dashboard member.</p>
        </div>

        <p v-if="error || invitationStore.error" class="rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
          {{ error || invitationStore.error }}
        </p>

        <div class="flex flex-col gap-3 sm:flex-row">
          <AppButton type="submit" :disabled="invitationStore.saving">
            <Loader2 v-if="invitationStore.saving" class="h-4 w-4 animate-spin" />
            Buat Draft
          </AppButton>
          <AppButton to="/app/invitations" variant="secondary">Batal</AppButton>
        </div>
      </form>
    </div>
  </section>
</template>
