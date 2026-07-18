<script setup>
import { computed } from "vue";

const props = defineProps({
  as: {
    type: String,
    default: "button"
  },
  variant: {
    type: String,
    default: "primary"
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: "button"
  },
  to: {
    type: [String, Object],
    default: null
  }
});

const componentName = computed(() => (props.to ? "RouterLink" : props.as));

const classes = computed(() => [
  "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition",
  props.variant === "primary" && "bg-leaf text-white hover:bg-ink disabled:bg-leaf/60",
  props.variant === "secondary" && "border border-ink/15 bg-white text-ink hover:border-leaf hover:text-leaf",
  props.variant === "ghost" && "text-ink hover:bg-ink/5",
  props.disabled && "cursor-not-allowed opacity-70"
]);
</script>

<template>
  <component :is="componentName" :to="to" :type="to ? undefined : type" :disabled="disabled" :class="classes">
    <slot />
  </component>
</template>
