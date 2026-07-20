<script setup>
import { Loader2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  detail: {
    type: String,
    default: ""
  },
  confirmLabel: {
    type: String,
    default: "Ya, lanjutkan"
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["cancel", "confirm"]);
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 px-4">
      <section class="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <h2 class="text-xl font-bold text-ink">{{ title }}</h2>
        <p class="mt-3 text-sm leading-6 text-ink/65">{{ message }}</p>
        <p v-if="detail" class="mt-4 rounded-md bg-linen p-4 text-sm font-bold text-ink">{{ detail }}</p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton type="button" variant="secondary" :disabled="loading" @click="emit('cancel')">Batal</AppButton>
          <AppButton type="button" :disabled="loading" @click="emit('confirm')">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            {{ confirmLabel }}
          </AppButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>
