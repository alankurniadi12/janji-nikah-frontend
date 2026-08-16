<script setup>
import { onMounted, ref } from "vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import StatusPill from "@/components/StatusPill.vue";
import ThemePreviewCard from "@/components/ThemePreviewCard.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import { useToastStore } from "@/stores/toasts";

const adminStore = useAdminStore();
const toastStore = useToastStore();
const error = ref("");

onMounted(() => adminStore.loadThemes());

async function setThemeStatus(theme) {
  error.value = "";

  try {
    await adminStore.setThemeStatus(theme.id, !theme.isActive);
    toastStore.show(theme.isActive ? "Tema dinonaktifkan." : "Tema diaktifkan.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Status tema belum bisa diubah.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Tema" title="Kelola tema" description="Aktifkan atau nonaktifkan tema bawaan yang tersedia untuk member." />
    <p v-if="error || adminStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error || adminStore.error }}</p>
    <section class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <article v-for="theme in adminStore.themes" :key="theme.id" class="grid gap-4 border-b border-ink/10 p-5 last:border-b-0 lg:grid-cols-[220px_1fr_140px_110px_150px] lg:items-center">
        <ThemePreviewCard :theme="theme" compact />
        <div>
          <p class="font-bold text-ink">{{ theme.name }}</p>
          <p class="mt-1 text-sm text-ink/55">{{ theme.key }}</p>
        </div>
        <StatusPill :active="theme.isPublicDemo" :label="theme.isPublicDemo ? 'Public demo' : 'Internal'" />
        <StatusPill :active="theme.isActive" :label="theme.isActive ? 'Aktif' : 'Nonaktif'" />
        <AppButton type="button" variant="secondary" @click="setThemeStatus(theme)">
          {{ theme.isActive ? "Nonaktifkan" : "Aktifkan" }}
        </AppButton>
      </article>
    </section>
  </section>
</template>
