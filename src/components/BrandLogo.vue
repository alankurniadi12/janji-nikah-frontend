<script setup>
import { computed } from "vue";

import horizontalDarkPng from "@/assets/brand/logo/dark/janji-nikah-logo-horizontal-dark.png";
import horizontalDarkWebp from "@/assets/brand/logo/dark/janji-nikah-logo-horizontal-dark.webp";
import markDarkPng from "@/assets/brand/logo/dark/janji-nikah-mark-dark.png";
import markDarkWebp from "@/assets/brand/logo/dark/janji-nikah-mark-dark.webp";
import horizontalLightPng from "@/assets/brand/logo/light/janji-nikah-logo-horizontal.png";
import horizontalLightWebp from "@/assets/brand/logo/light/janji-nikah-logo-horizontal.webp";
import markLightPng from "@/assets/brand/logo/light/janji-nikah-mark.png";
import markLightWebp from "@/assets/brand/logo/light/janji-nikah-mark.webp";

const props = defineProps({
  mode: {
    type: String,
    default: "horizontal",
    validator: (value) => ["horizontal", "compact", "mark"].includes(value)
  },
  variant: {
    type: String,
    default: "light",
    validator: (value) => ["light", "dark"].includes(value)
  },
  size: {
    type: String,
    default: "nav",
    validator: (value) => ["compact", "nav", "footer"].includes(value)
  }
});

const usesDarkAsset = computed(() => props.variant === "dark");
const usesMark = computed(() => props.mode !== "horizontal");
const webpSource = computed(() => {
  if (usesMark.value) return usesDarkAsset.value ? markDarkWebp : markLightWebp;
  return usesDarkAsset.value ? horizontalDarkWebp : horizontalLightWebp;
});
const pngSource = computed(() => {
  if (usesMark.value) return usesDarkAsset.value ? markDarkPng : markLightPng;
  return usesDarkAsset.value ? horizontalDarkPng : horizontalLightPng;
});
const intrinsicSize = computed(() => {
  if (props.mode === "horizontal") {
    return usesDarkAsset.value ? { width: 1674, height: 512 } : { width: 1545, height: 463 };
  }

  return usesDarkAsset.value ? { width: 632, height: 523 } : { width: 681, height: 842 };
});
const imageClasses = computed(() => {
  if (props.mode === "mark") {
    return props.size === "footer" ? "h-10 w-auto" : "h-8 w-auto";
  }

  if (props.mode === "compact") {
    return "h-8 w-auto";
  }

  if (props.size === "footer") {
    return "h-10 w-auto";
  }

  if (props.size === "compact") {
    return "h-8 w-auto";
  }

  return "h-8 w-auto lg:h-10";
});
</script>

<template>
  <span class="inline-flex min-w-0 items-center gap-2">
    <picture class="inline-flex shrink-0">
      <source :srcset="webpSource" type="image/webp" />
      <img
        :src="pngSource"
        :alt="mode === 'compact' ? '' : 'Janji Nikah'"
        :class="imageClasses"
        :width="intrinsicSize.width"
        :height="intrinsicSize.height"
        decoding="async"
        class="block max-w-full object-contain"
      />
    </picture>
    <span v-if="mode === 'compact'" class="truncate text-base font-bold tracking-normal" :class="variant === 'dark' ? 'text-white' : 'text-ink'">
      Janji Nikah
    </span>
  </span>
</template>
