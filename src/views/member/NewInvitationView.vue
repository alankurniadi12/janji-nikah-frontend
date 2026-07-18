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
const form = reactive({
  title: "",
  groomName: "",
  brideName: ""
});

async function createDraft() {
  error.value = "";

  try {
    const invitation = await invitationStore.createDraft({
      title: form.title,
      groom: {
        fullName: form.groomName
      },
      bride: {
        fullName: form.brideName
      }
    });
    router.push({ name: "member-invitation-detail", params: { id: invitation.id } });
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Draft undangan belum bisa dibuat.");
  }
}
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <div class="rounded-lg border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
      <p class="text-sm font-bold uppercase tracking-widest text-gold">Draft baru</p>
      <h1 class="mt-3 text-3xl font-bold text-ink">Buat undangan</h1>
      <p class="mt-3 leading-7 text-ink/65">
        Isi nama awal agar slug otomatis lebih rapi. Detail lengkap bisa dilanjutkan di builder step-by-step.
      </p>

      <form class="mt-8 space-y-5" @submit.prevent="createDraft">
        <div>
          <label class="block text-sm font-semibold text-ink" for="title">Judul undangan</label>
          <input
            id="title"
            v-model.trim="form.title"
            class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
            placeholder="Contoh: Undangan Alya dan Rama"
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-semibold text-ink" for="groomName">Nama pengantin pria</label>
            <input
              id="groomName"
              v-model.trim="form.groomName"
              class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
              placeholder="Rama"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-ink" for="brideName">Nama pengantin wanita</label>
            <input
              id="brideName"
              v-model.trim="form.brideName"
              class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
              placeholder="Alya"
            />
          </div>
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
