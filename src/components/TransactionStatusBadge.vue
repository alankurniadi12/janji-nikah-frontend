<script setup>
import { transactionStatusLabel, transactionStatusTone } from "@/utils/formatters";

defineProps({
  status: {
    type: String,
    required: true
  }
});
</script>

<template>
  <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold" :class="transactionStatusTone(status)">
    {{ transactionStatusLabel(status) }}
  </span>
</template>
