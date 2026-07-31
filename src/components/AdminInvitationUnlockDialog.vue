<script setup>
import { computed, ref, watch } from "vue";
import { AlertCircle, Loader2, LockOpen } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { formatDateTime } from "@/utils/formatters";

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  invitation: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["cancel", "confirm"]);
const note = ref("");
const validationError = ref("");
const invitationTitle = computed(() => props.invitation?.title || "Undangan");

watch(
  () => [props.open, props.invitation?.id],
  () => {
    if (props.open) {
      note.value = "";
      validationError.value = "";
    }
  }
);

function confirm() {
  validationError.value = "";

  if (!note.value.trim()) {
    validationError.value = "Catatan unlock wajib diisi.";
    return;
  }

  emit("confirm", note.value.trim());
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open && invitation" class="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 px-4">
      <section class="w-full max-w-lg rounded-lg bg-white p-6 shadow-soft">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gold/20 bg-gold/10 text-gold">
            <LockOpen class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-ink">Unlock undangan?</h2>
            <p class="mt-2 text-sm leading-6 text-ink/65">
              Aksi ini membuka kembali data utama undangan yang sudah terkunci dan akan tercatat di audit log.
            </p>
          </div>
        </div>

        <div class="mt-5 rounded-md bg-linen p-4">
          <div class="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p class="text-ink/50">Undangan</p>
              <p class="mt-1 font-bold text-ink">{{ invitationTitle }}</p>
            </div>
            <div>
              <p class="text-ink/50">Member</p>
              <p class="mt-1 font-bold text-ink">{{ invitation.member?.name || invitation.member?.email || invitation.memberId }}</p>
            </div>
            <div>
              <p class="text-ink/50">Slug</p>
              <p class="mt-1 font-bold text-ink">/{{ invitation.slug }}</p>
            </div>
            <div>
              <p class="text-ink/50">Terkunci</p>
              <p class="mt-1 font-bold text-ink">{{ formatDateTime(invitation.lockedAt) }}</p>
            </div>
          </div>
        </div>

        <label class="mt-5 block text-sm font-semibold text-ink" for="invitationUnlockNote">Catatan unlock</label>
        <textarea
          id="invitationUnlockNote"
          v-model="note"
          class="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          placeholder="Contoh: koreksi alamat acara atas permintaan member setelah verifikasi admin."
        />

        <p v-if="validationError || error" class="mt-3 flex gap-2 rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
          <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
          {{ validationError || error }}
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton type="button" variant="secondary" :disabled="loading" @click="emit('cancel')">Batal</AppButton>
          <AppButton type="button" :disabled="loading" @click="confirm">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            Unlock undangan
          </AppButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>
