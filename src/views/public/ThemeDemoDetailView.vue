<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Check, Copy } from "@lucide/vue";

import InvitationRenderer from "@/components/invitation/InvitationRenderer.vue";
import { demoInvitation } from "@/lib/demoInvitation";
import { getInvitationTheme, invitationThemes } from "@/lib/invitationThemes";

const route = useRoute();
const copied = ref(false);

const selectedTheme = computed(() => getInvitationTheme(route.params.themeKey));

async function copyThemeName() {
  try {
    await navigator.clipboard.writeText(`Tema pilihan: ${selectedTheme.value.name}`);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div>
    <header class="sticky top-0 z-30 border-b border-ink/10 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <RouterLink to="/demo-tema" class="text-sm font-bold text-leaf hover:text-ink">Katalog tema & musik</RouterLink>
          <h1 class="mt-1 text-xl font-bold text-ink">{{ selectedTheme.name }}</h1>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="flex max-w-full gap-2 overflow-x-auto pb-1 sm:pb-0">
            <RouterLink
              v-for="theme in invitationThemes"
              :key="theme.key"
              :to="{ name: 'theme-demo-detail', params: { themeKey: theme.key } }"
              class="focus-ring shrink-0 rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-widest"
              :class="theme.key === selectedTheme.key ? 'border-leaf bg-mint text-leaf' : 'border-ink/10 bg-white text-ink/55 hover:border-leaf hover:text-leaf'"
            >
              {{ theme.name }}
            </RouterLink>
          </div>
          <button
            class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-leaf px-3 py-2 text-sm font-bold text-white hover:bg-ink"
            type="button"
            @click="copyThemeName"
          >
            <Check v-if="copied" class="h-4 w-4" />
            <Copy v-else class="h-4 w-4" />
            {{ copied ? "Nama tema tersalin" : "Salin nama tema" }}
          </button>
        </div>
      </div>
    </header>

    <InvitationRenderer
      :invitation="demoInvitation"
      :selected-theme="selectedTheme"
      :wishes="demoInvitation.wishes"
      opened
      is-demo
    />
  </div>
</template>
