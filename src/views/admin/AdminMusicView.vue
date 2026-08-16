<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Power, PowerOff, Trash2 } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import StatusPill from "@/components/StatusPill.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import { useToastStore } from "@/stores/toasts";
import { assetUrl } from "@/utils/assets";

const adminStore = useAdminStore();
const toastStore = useToastStore();
const form = reactive({ title: "", artist: "", file: null });
const fileInput = ref(null);
const error = ref("");
const deleteDialog = reactive({
  open: false,
  item: null
});

onMounted(() => adminStore.loadMusic());

const deleteDetail = computed(() => {
  if (!deleteDialog.item) {
    return "";
  }

  return `${deleteDialog.item.title}${deleteDialog.item.artist ? ` · ${deleteDialog.item.artist}` : ""}`;
});

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
    Object.assign(form, { title: "", artist: "", file: null });
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

function openDeleteDialog(music) {
  deleteDialog.item = music;
  deleteDialog.open = true;
}

function closeDeleteDialog() {
  deleteDialog.open = false;
  deleteDialog.item = null;
}

async function confirmDelete() {
  if (!deleteDialog.item) {
    return;
  }

  error.value = "";

  try {
    await adminStore.deleteMusic(deleteDialog.item.id);
    closeDeleteDialog();
    toastStore.show("Musik berhasil dihapus.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Musik belum bisa dihapus.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Musik" title="Kelola musik" description="Upload musik MP3 dari admin, lalu aktifkan agar bisa dipilih member di builder." />

    <form class="mt-6 grid gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft lg:grid-cols-[1fr_1fr_1.2fr_150px] lg:items-end" @submit.prevent="upload">
      <label class="grid gap-2 text-sm font-semibold text-ink">
        Judul musik
        <input v-model.trim="form.title" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm font-normal" placeholder="Contoh: Piano Romantis" required />
      </label>
      <label class="grid gap-2 text-sm font-semibold text-ink">
        Penyanyi
        <input v-model.trim="form.artist" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm font-normal" placeholder="Contoh: Tulus" />
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

    <section class="mt-6 grid gap-3">
      <article
        v-for="music in adminStore.music"
        :key="music.id"
        class="grid gap-4 rounded-lg border p-5 shadow-soft transition lg:grid-cols-[1fr_260px_130px_260px] lg:items-center"
        :class="music.isActive ? 'border-leaf/25 bg-leaf/5' : 'border-rose/20 bg-rose/5 opacity-90'"
      >
        <div>
          <p class="font-bold text-ink">{{ music.title }}</p>
          <p class="mt-1 text-sm text-ink/55">{{ music.artist || "Tanpa penyanyi" }}</p>
        </div>
        <div class="grid gap-2">
          <audio v-if="music.fileUrl" class="h-10 w-full" controls preload="none" :src="assetUrl(music.fileUrl)" />
        </div>
        <StatusPill :active="music.isActive" :label="music.isActive ? 'Aktif' : 'Nonaktif'" />
        <div class="flex flex-wrap gap-2 lg:justify-end">
          <AppButton type="button" :variant="music.isActive ? 'secondary' : 'primary'" @click="setMusicStatus(music)">
            <PowerOff v-if="music.isActive" class="h-4 w-4" />
            <Power v-else class="h-4 w-4" />
            {{ music.isActive ? "Nonaktifkan" : "Aktifkan" }}
          </AppButton>
          <AppButton type="button" variant="ghost" @click="openDeleteDialog(music)">
            <Trash2 class="h-4 w-4" />
            Hapus
          </AppButton>
        </div>
      </article>
      <p v-if="!adminStore.loading && !adminStore.music.length" class="rounded-lg border border-ink/10 bg-white p-5 text-sm font-semibold text-ink/60 shadow-soft">Belum ada musik.</p>
    </section>

    <ConfirmDialog
      :open="deleteDialog.open"
      title="Hapus musik?"
      message="Musik akan dihapus dari katalog admin dan pilihan member. Undangan yang memakai musik ini akan dikosongkan pilihan musiknya."
      :detail="deleteDetail"
      confirm-label="Hapus musik"
      :loading="adminStore.saving"
      @cancel="closeDeleteDialog"
      @confirm="confirmDelete"
    />
  </section>
</template>
