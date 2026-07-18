<script setup>
import { onMounted, reactive, ref } from "vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import StatusPill from "@/components/StatusPill.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";

const adminStore = useAdminStore();
const form = reactive({ title: "", category: "", duration: "", fileUrl: "" });
const error = ref("");
const success = ref("");

onMounted(() => adminStore.loadMusic());

async function create() {
  error.value = "";
  success.value = "";
  try {
    await adminStore.createMusic({ ...form });
    Object.assign(form, { title: "", category: "", duration: "", fileUrl: "" });
    success.value = "Musik berhasil dibuat.";
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Musik belum bisa dibuat.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Musik" title="Kelola musik" description="Musik disediakan admin dan dipilih member dari daftar aktif." />
    <form class="mt-6 grid gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft lg:grid-cols-[1fr_160px_120px_1fr_140px]" @submit.prevent="create">
      <input v-model.trim="form.title" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="Judul musik" required />
      <input v-model.trim="form.category" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="Kategori" />
      <input v-model.trim="form.duration" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="Durasi" />
      <input v-model.trim="form.fileUrl" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="File URL" required />
      <AppButton type="submit" :disabled="adminStore.saving">Buat Musik</AppButton>
    </form>
    <p v-if="error || adminStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error || adminStore.error }}</p>
    <p v-if="success" class="mt-5 rounded-md bg-leaf/10 px-4 py-3 text-sm font-semibold text-leaf">{{ success }}</p>
    <section class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <article v-for="music in adminStore.music" :key="music.id" class="grid gap-4 border-b border-ink/10 p-5 last:border-b-0 md:grid-cols-[1fr_140px_110px_150px] md:items-center">
        <div>
          <p class="font-bold text-ink">{{ music.title }}</p>
          <p class="mt-1 text-sm text-ink/55">{{ music.category || "Tanpa kategori" }} · {{ music.duration || "-" }}</p>
        </div>
        <a :href="music.fileUrl" target="_blank" class="text-sm font-semibold text-leaf">Buka file</a>
        <StatusPill :active="music.isActive" :label="music.isActive ? 'Aktif' : 'Nonaktif'" />
        <AppButton type="button" variant="secondary" @click="adminStore.setMusicStatus(music.id, !music.isActive)">
          {{ music.isActive ? "Nonaktifkan" : "Aktifkan" }}
        </AppButton>
      </article>
    </section>
  </section>
</template>
