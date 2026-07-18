<script setup>
defineProps({
  eyebrow: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
    <div>
      <p class="text-sm font-bold uppercase tracking-widest text-gold">{{ eyebrow }}</p>
      <h1 class="mt-2 text-3xl font-bold text-ink">{{ title }}</h1>
      <p v-if="description" class="mt-2 max-w-2xl leading-7 text-ink/65">{{ description }}</p>
    </div>
    <slot />
  </div>
</template>
