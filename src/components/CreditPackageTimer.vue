<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { Clock3 } from "@lucide/vue";

const props = defineProps({
  endsAt: {
    type: [String, Date],
    default: null
  },
  prefix: {
    type: String,
    default: "Berakhir dalam"
  }
});

const now = ref(Date.now());
let timerId = null;

onMounted(() => {
  timerId = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  window.clearInterval(timerId);
});

const remainingText = computed(() => {
  if (!props.endsAt) {
    return "";
  }

  const diffMs = new Date(props.endsAt).getTime() - now.value;

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return "Waktu habis";
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days} hari ${hours} jam ${minutes} menit`;
  }

  return `${hours}j ${minutes}m ${seconds}d`;
});
</script>

<template>
  <span v-if="remainingText" class="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
    <Clock3 class="h-3.5 w-3.5" />
    {{ prefix }} {{ remainingText }}
  </span>
</template>
