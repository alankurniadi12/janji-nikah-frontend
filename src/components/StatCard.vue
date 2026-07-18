<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  tone: {
    type: String,
    default: "leaf"
  }
});
</script>

<template>
  <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
    <p class="text-sm font-medium text-ink/60">{{ label }}</p>
    <p class="mt-3 text-3xl font-bold text-ink">{{ value }}</p>
    <div
      class="mt-5 h-1.5 rounded-full"
      :class="{
        'bg-leaf': tone === 'leaf',
        'bg-rose': tone === 'rose',
        'bg-gold': tone === 'gold',
        'bg-ink': tone === 'ink'
      }"
    />
  </section>
</template>
