<script setup>
import { computed } from "vue";

import { paymentConfig } from "@/config/payment";

defineProps({
  title: {
    type: String,
    default: "Butuh bantuan pembayaran?"
  },
  description: {
    type: String,
    default: "Hubungi Admin."
  }
});

const supportLinks = computed(() => paymentConfig.supportLinks || []);
const hasSupportLinks = computed(() => supportLinks.value.length > 0);
const hasSupportContact = computed(() => hasSupportLinks.value || paymentConfig.supportContact);
</script>

<template>
  <div v-if="hasSupportContact" class="rounded-lg border border-gold/25 bg-gold/10 p-4">
    <p class="text-sm font-bold text-ink">{{ title }}</p>
    <p class="mt-1 text-sm leading-6 text-ink/60">{{ description }}</p>
    <div v-if="hasSupportLinks" class="mt-4 grid gap-3 sm:grid-cols-2">
      <a
        v-for="link in supportLinks"
        :key="link.key"
        class="focus-ring flex min-h-14 items-center gap-3 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-leaf/30 hover:text-leaf"
        :href="link.href"
        rel="noopener noreferrer"
        target="_blank"
      >
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-mint text-leaf">
          <svg v-if="link.icon === 'instagram'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <rect width="15" height="15" x="4.5" y="4.5" rx="4" stroke="currentColor" stroke-width="2" />
            <circle cx="12" cy="12" r="3.25" stroke="currentColor" stroke-width="2" />
            <circle cx="16.75" cy="7.25" r="1" fill="currentColor" />
          </svg>
          <svg v-else class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.5 8.2V6.7c0-.7.5-.9 1-.9H17V3.2A20 20 0 0 0 14.8 3c-2.2 0-3.7 1.3-3.7 3.8v1.4H8.7v3h2.4V21h3.2v-9.8h2.4l.4-3h-2.6Z" />
          </svg>
        </span>
        <span class="min-w-0">
          <span class="block text-xs uppercase text-ink/45">{{ link.label }}</span>
          <span class="block truncate">{{ link.value }}</span>
        </span>
      </a>
    </div>
    <p v-else class="mt-3 text-sm font-semibold text-ink">{{ paymentConfig.supportContact }}</p>
  </div>
</template>
