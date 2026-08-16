<script setup>
import { onMounted, reactive, ref } from "vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import StatusPill from "@/components/StatusPill.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import { useToastStore } from "@/stores/toasts";
import { assetUrl } from "@/utils/assets";

const adminStore = useAdminStore();
const toastStore = useToastStore();
const form = reactive({ title: "", category: "", duration: "", file: null });
const fileInput = ref(null);
const error = ref("");

onMounted(() => adminStore.loadMusic());

function selectFile(event) {
  const [file] = event.target.files || [];
  form.file = file || null;
}

async function upload() {
  error.value = "";

  if (!form.file) {
    error.value = "File MP3 wajib dipilih.";
    return;
  }

  try {
    await adminStore.uploadMusic({ ...form });
    Object.assign(form, { title: "", category: "", duration: "", file: null });
    if (fileInput.value) fileInput.value.value = "";
    toastStore.show("Musik berhasil diupload.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Musik belum bisa diupload.");
  }
}

async function setMusicStatus(music) {
  error.value = "";

  try {
    await adminStore.setMusicStatus(music.id, !music.isActive);
    toastStore.show(music.isActive ? "Musik dinonaktifkan." : "Musik diaktifkan.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Status musik belum bisa diubah.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Musik" title="Kelola musik" description="Upload musik MP3 dari admin, lalu aktifkan agar bisa dipilih member di builder." />

    <form class="mt-6 grid gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft lg:grid-cols-[1fr_180px_120px_1.2fr_150px] lg:items-end" @submit.prevent="upload">
      <label class="grid gap-2 text-sm font-semibold text-ink">
        Judul musik
        <input v-model.trim="form.title" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm font-normal" placeholder="Contoh: Piano Romantis" required />
      </label>
      <label class="grid gap-2 text-sm font-semibold text-ink">
        Kategori
        <input v-model.trim="form.category" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm font-normal" placeholder="Akad" />
      </label>
      <label class="grid gap-2 text-sm font-semibold text-ink">
        Durasi
        <input v-model.number="form.duration" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm font-normal" min="0" placeholder="Detik" type="number" />
      </label>
      <label class="grid gap-2 text-sm font-semibold text-ink">
        File MP3
        <input ref="fileInput" accept="audio/mpeg,.mp3" class="focus-ring h-11 rounded-md border border-ink/15 px-3 py-2 text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-leaf/10 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-leaf" type="file" required @change="selectFile" />
      </label>
      <AppButton type="submit" :disabled="adminStore.saving">
        {{ adminStore.saving ? "Mengupload..." : "Upload MP3" }}
      </AppButton>
    </form>

    <p v-if="error || adminStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error || adminStore.error }}</p>

    <section class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <article v-for="music in adminStore.music" :key="music.id" class="grid gap-4 border-b border-ink/10 p-5 last:border-b-0 lg:grid-cols-[1fr_260px_110px_150px] lg:items-center">
        <div>
          <p class="font-bold text-ink">{{ music.title }}</p>
          <p class="mt-1 text-sm text-ink/55">{{ music.category || "Tanpa kategori" }} · {{ music.duration || "-" }}</p>
        </div>
        <div class="grid gap-2">
          <audio v-if="music.fileUrl" class="h-10 w-full" controls preload="none" :src="assetUrl(music.fileUrl)" />
          <a :href="assetUrl(music.fileUrl)" target="_blank" class="text-sm font-semibold text-leaf">Buka file</a>
        </div>
        <StatusPill :active="music.isActive" :label="music.isActive ? 'Aktif' : 'Nonaktif'" />
        <AppButton type="button" variant="secondary" @click="setMusicStatus(music)">
          {{ music.isActive ? "Nonaktifkan" : "Aktifkan" }}
        </AppButton>
      </article>
      <p v-if="!adminStore.loading && !adminStore.music.length" class="p-5 text-sm font-semibold text-ink/60">Belum ada musik.</p>
    </section>
  </section>
</template>
