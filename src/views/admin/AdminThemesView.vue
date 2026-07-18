<script setup>
import { onMounted, reactive, ref } from "vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import StatusPill from "@/components/StatusPill.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";

const adminStore = useAdminStore();
const form = reactive({ name: "", key: "", thumbnailUrl: "", isPublicDemo: true });
const error = ref("");
const success = ref("");

onMounted(() => adminStore.loadThemes());

async function create() {
  error.value = "";
  success.value = "";
  try {
    await adminStore.createTheme({ ...form });
    Object.assign(form, { name: "", key: "", thumbnailUrl: "", isPublicDemo: true });
    success.value = "Tema berhasil dibuat.";
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Tema belum bisa dibuat.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Tema" title="Kelola tema" description="Admin hanya mengaktifkan/nonaktifkan tema developer. Tidak ada theme builder di MVP." />
    <form class="mt-6 grid gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft lg:grid-cols-[1fr_160px_1fr_140px]" @submit.prevent="create">
      <input v-model.trim="form.name" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="Nama tema" required />
      <input v-model.trim="form.key" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="Key tema" required />
      <input v-model.trim="form.thumbnailUrl" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="Thumbnail URL" />
      <AppButton type="submit" :disabled="adminStore.saving">Buat Tema</AppButton>
    </form>
    <p v-if="error || adminStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error || adminStore.error }}</p>
    <p v-if="success" class="mt-5 rounded-md bg-leaf/10 px-4 py-3 text-sm font-semibold text-leaf">{{ success }}</p>
    <section class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <article v-for="theme in adminStore.themes" :key="theme.id" class="grid gap-4 border-b border-ink/10 p-5 last:border-b-0 md:grid-cols-[1fr_140px_110px_150px] md:items-center">
        <div>
          <p class="font-bold text-ink">{{ theme.name }}</p>
          <p class="mt-1 text-sm text-ink/55">{{ theme.key }}</p>
        </div>
        <StatusPill :active="theme.isPublicDemo" :label="theme.isPublicDemo ? 'Public demo' : 'Internal'" />
        <StatusPill :active="theme.isActive" :label="theme.isActive ? 'Aktif' : 'Nonaktif'" />
        <AppButton type="button" variant="secondary" @click="adminStore.setThemeStatus(theme.id, !theme.isActive)">
          {{ theme.isActive ? "Nonaktifkan" : "Aktifkan" }}
        </AppButton>
      </article>
    </section>
  </section>
</template>
