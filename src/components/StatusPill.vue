<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    required: true
  }
});
</script>

<template>
  <span
    class="inline-flex rounded-full border px-2.5 py-1 text-xs font-bold"
    :class="active ? 'border-leaf/20 bg-leaf/10 text-leaf' : 'border-ink/15 bg-ink/5 text-ink/60'"
  >
    {{ label }}
  </span>
</template>
