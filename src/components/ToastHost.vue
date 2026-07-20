<script setup>
import { CheckCircle2, X } from "@lucide/vue";

import { useToastStore } from "@/stores/toasts";

const toastStore = useToastStore();
</script>

<template>
  <Teleport to="body">
    <div class="fixed right-4 top-4 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-2 opacity-0"
      >
        <section
          v-for="toast in toastStore.items"
          :key="toast.id"
          class="flex items-start gap-3 rounded-md border bg-white px-4 py-3 shadow-soft"
          :class="toast.tone === 'success' ? 'border-leaf/20 text-leaf' : 'border-rose/20 text-rose'"
          role="status"
        >
          <CheckCircle2 class="mt-0.5 h-5 w-5 shrink-0" />
          <p class="min-w-0 flex-1 text-sm font-semibold leading-6 text-ink">{{ toast.message }}</p>
          <button
            class="focus-ring -mr-1 rounded-md p-1 text-ink/45 hover:bg-ink/5 hover:text-ink"
            type="button"
            aria-label="Tutup pemberitahuan"
            @click="toastStore.dismiss(toast.id)"
          >
            <X class="h-4 w-4" />
          </button>
        </section>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
