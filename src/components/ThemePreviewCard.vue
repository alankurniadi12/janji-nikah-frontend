<script setup>
import { computed } from "vue";

import { assetUrl } from "@/utils/assets";
import { getInvitationTheme } from "@/lib/invitationThemes";

const props = defineProps({
  theme: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const meta = computed(() => getInvitationTheme(props.theme.key));
</script>

<template>
  <div
    class="h-full rounded-md border bg-white p-3 text-left transition"
    :class="selected ? 'border-leaf bg-mint/50' : 'border-ink/10'"
  >
    <div class="theme-preview aspect-[4/3]" :class="meta.previewClass">
      <img
        v-if="theme.thumbnailUrl"
        :src="assetUrl(theme.thumbnailUrl)"
        :alt="theme.name"
        class="relative z-10 h-full w-full object-cover"
      />
      <div class="absolute inset-x-5 bottom-4 z-10 rounded-sm bg-white/88 p-3 shadow-soft">
        <p class="text-xs font-bold uppercase tracking-widest text-gold">{{ meta.category }}</p>
        <p class="mt-1 truncate text-sm font-bold text-ink">{{ theme.name || meta.name }}</p>
      </div>
    </div>
    <div class="mt-3 flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-bold text-ink">{{ theme.name || meta.name }}</p>
        <p class="mt-1 text-xs font-semibold uppercase tracking-widest text-ink/40">{{ theme.key }}</p>
      </div>
      <div class="flex shrink-0 gap-1">
        <span
          v-for="swatch in meta.swatches"
          :key="swatch"
          class="h-4 w-4 rounded-full border border-white shadow"
          :style="{ backgroundColor: swatch }"
        />
      </div>
    </div>
    <p v-if="!compact" class="mt-2 text-sm leading-6 text-ink/60">{{ meta.description }}</p>
  </div>
</template>
