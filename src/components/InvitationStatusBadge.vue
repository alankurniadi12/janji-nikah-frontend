<script setup>
import { invitationStatusLabel, invitationStatusTone } from "@/utils/formatters";

defineProps({
  status: {
    type: String,
    required: true
  }
});
</script>

<template>
  <span class="inline-flex w-fit shrink-0 items-center justify-self-start rounded-full border px-2.5 py-1 text-xs font-bold" :class="invitationStatusTone(status)">
    {{ invitationStatusLabel(status) }}
  </span>
</template>
