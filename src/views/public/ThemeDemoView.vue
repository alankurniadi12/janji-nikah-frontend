<script setup>
import { computed, onMounted, ref } from "vue";
import { Loader2 } from "@lucide/vue";

import ThemePreviewCard from "@/components/ThemePreviewCard.vue";
import { getApiErrorMessage } from "@/lib/api";
import { invitationThemes } from "@/lib/invitationThemes";
import { getPublicDemoThemes } from "@/services/catalogService";

const themes = ref([]);
const loading = ref(true);
const error = ref("");

const visibleThemes = computed(() => {
  if (themes.value.length) {
    return themes.value;
  }

  return invitationThemes.map((theme) => ({
    id: theme.key,
    key: theme.key,
    name: theme.name,
    thumbnailUrl: ""
  }));
});

onMounted(loadThemes);

async function loadThemes() {
  loading.value = true;
  error.value = "";

  try {
    themes.value = await getPublicDemoThemes();
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Demo tema belum bisa dimuat.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page-shell">
    <header class="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <RouterLink to="/" class="text-lg font-bold text-ink">Janji Nikah</RouterLink>
      <RouterLink class="focus-ring rounded-md px-3 py-2 text-sm font-semibold text-leaf hover:bg-mint" to="/login">
        Masuk
      </RouterLink>
    </header>
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section class="max-w-3xl">
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Demo tema</p>
        <h1 class="mt-3 text-3xl font-bold text-ink sm:text-4xl">5 tema awal untuk undangan digital yang siap dipakai.</h1>
        <p class="mt-4 leading-7 text-ink/65">
          Semua tema memakai data undangan yang sama. Perbedaannya ada di arah visual, komposisi, warna, dan nuansa membaca tamu.
        </p>
      </section>

      <div v-if="loading" class="mt-8 flex items-center gap-3 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/65">
        <Loader2 class="h-4 w-4 animate-spin text-leaf" />
        Memuat tema...
      </div>
      <p v-else-if="error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error }}</p>

      <section class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ThemePreviewCard
          v-for="theme in visibleThemes"
          :key="theme.id"
          :theme="theme"
        />
      </section>
    </main>
  </div>
</template>
