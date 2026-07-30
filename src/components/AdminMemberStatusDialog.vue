<script setup>
import { computed } from "vue";
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  member: {
    type: Object,
    default: null
  },
  status: {
    type: String,
    default: "active"
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

const statusLabel = computed(() => {
  const labels = {
    active: "Active",
    suspended: "Suspended",
    blocked: "Blocked"
  };

  return labels[props.status] || props.status;
});
const isActive = computed(() => props.status === "active");
const icon = computed(() => (isActive.value ? CheckCircle2 : ShieldAlert));
const tone = computed(() => (isActive.value ? "border-leaf/20 bg-leaf/10 text-leaf" : "border-rose/20 bg-rose/10 text-rose"));
const message = computed(() => {
  if (props.status === "active") {
    return "Member akan kembali bisa memakai akun sesuai aturan role member.";
  }

  if (props.status === "suspended") {
    return "Member akan dinonaktifkan sementara sampai admin mengaktifkannya kembali.";
  }

  return "Member akan diblokir. Gunakan hanya untuk kasus abuse, fraud, atau pelanggaran serius.";
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open && member" class="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 px-4">
      <section class="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border" :class="tone">
            <component :is="icon" class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-ink">Ubah status member?</h2>
            <p class="mt-2 text-sm leading-6 text-ink/65">{{ message }}</p>
          </div>
        </div>

        <div class="mt-5 rounded-md bg-linen p-4 text-sm">
          <p class="font-bold text-ink">{{ member.name }}</p>
          <p class="mt-1 text-ink/55">{{ member.email }} · @{{ member.username || "-" }}</p>
          <p class="mt-3 font-semibold text-ink">Status baru: {{ statusLabel }}</p>
        </div>

        <p v-if="error" class="mt-3 flex gap-2 rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
          <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
          {{ error }}
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton type="button" variant="secondary" :disabled="loading" @click="emit('cancel')">Batal</AppButton>
          <AppButton type="button" :disabled="loading" @click="emit('confirm')">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            Ubah status
          </AppButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>
