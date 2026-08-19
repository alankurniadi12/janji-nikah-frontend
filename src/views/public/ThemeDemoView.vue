<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { Check, Copy, Loader2, Pause, Play } from "@lucide/vue";

import ThemePreviewCard from "@/components/ThemePreviewCard.vue";
import BrandLogo from "@/components/BrandLogo.vue";
import { getApiErrorMessage } from "@/lib/api";
import { invitationThemes } from "@/lib/invitationThemes";
import { getMusic, getPublicDemoThemes } from "@/services/catalogService";
import { assetUrl } from "@/utils/assets";

const themes = ref([]);
const music = ref([]);
const loading = ref(true);
const error = ref("");
const activeTab = ref("themes");
const previewAudio = ref(null);
const playingMusicId = ref("");
const copiedText = ref("");
const musicDurations = reactive({});

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

onMounted(loadCatalog);

onBeforeUnmount(() => {
  stopMusicPreview();
});

watch(activeTab, (tab) => {
  if (tab !== "music") {
    stopMusicPreview();
    return;
  }

  loadMissingMusicDurations();
});

async function loadCatalog() {
  loading.value = true;
  error.value = "";

  try {
    const [themeItems, musicItems] = await Promise.all([getPublicDemoThemes(), getMusic()]);
    themes.value = themeItems;
    music.value = musicItems;
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Katalog belum bisa dimuat.");
  } finally {
    loading.value = false;
  }
}

async function toggleMusicPreview(item) {
  if (!item?.fileUrl || !previewAudio.value) {
    return;
  }

  const audio = previewAudio.value;

  if (playingMusicId.value === item.id && !audio.paused) {
    audio.pause();
    playingMusicId.value = "";
    return;
  }

  audio.pause();
  audio.src = assetUrl(item.fileUrl);
  audio.currentTime = 0;
  playingMusicId.value = item.id;

  try {
    await audio.play();
  } catch {
    playingMusicId.value = "";
  }
}

function stopMusicPreview() {
  if (!previewAudio.value) {
    return;
  }

  previewAudio.value.pause();
  previewAudio.value.currentTime = 0;
  playingMusicId.value = "";
}

function onPreviewEnded() {
  playingMusicId.value = "";
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    copiedText.value = text;
    window.setTimeout(() => {
      if (copiedText.value === text) copiedText.value = "";
    }, 1600);
  } catch {
    copiedText.value = "";
  }
}

function themeCopyText(theme) {
  return `Tema pilihan: ${theme.name}`;
}

function musicCopyText(item) {
  return `Musik pilihan: ${item.title}${item.artist ? ` - ${item.artist}` : ""}`;
}

function formatMusicDuration(duration) {
  const totalSeconds = Number(duration);

  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "Durasi belum tersedia";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function displayMusicDuration(item) {
  if (musicDurations[item.id] === -1) {
    return "Membaca durasi...";
  }

  return formatMusicDuration(musicDurations[item.id] || item.duration);
}

function loadMissingMusicDurations() {
  music.value.forEach((item) => {
    const knownDuration = Number(item.duration || musicDurations[item.id]);

    if (knownDuration > 0 || musicDurations[item.id] === -1 || !item.fileUrl) {
      return;
    }

    musicDurations[item.id] = -1;
    readRemoteAudioDuration(item.fileUrl).then((duration) => {
      musicDurations[item.id] = duration;
    });
  });
}

function readRemoteAudioDuration(fileUrl) {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");

    audio.preload = "metadata";
    audio.src = assetUrl(fileUrl);

    audio.onloadedmetadata = () => {
      resolve(Math.round(audio.duration || 0));
    };
    audio.onerror = () => {
      resolve(0);
    };
  });
}
</script>

<template>
  <div class="page-shell">
    <header class="mx-auto flex max-w-7xl items-center px-4 py-5 sm:px-6 lg:px-8">
      <RouterLink to="/" class="focus-ring rounded-md"><BrandLogo /></RouterLink>
    </header>
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section class="max-w-3xl">
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Katalog tema & musik</p>
        <h1 class="mt-3 text-3xl font-bold text-ink sm:text-4xl">Lihat contoh tema dan dengarkan musik undangan.</h1>
        <p class="mt-4 leading-7 text-ink/65">
          Calon pengantin bisa melihat referensi desain dan mendengar musik, lalu menyebutkan nama tema dan judul musik yang disukai kepada pembuat undangan.
        </p>
      </section>

      <div class="mt-6 inline-flex rounded-md border border-ink/10 bg-white p-1 shadow-soft">
        <button
          type="button"
          class="focus-ring rounded px-4 py-2 text-sm font-bold transition"
          :class="activeTab === 'themes' ? 'bg-leaf text-white' : 'text-ink/60 hover:bg-mint hover:text-leaf'"
          @click="activeTab = 'themes'"
        >
          Tema Undangan
        </button>
        <button
          type="button"
          class="focus-ring rounded px-4 py-2 text-sm font-bold transition"
          :class="activeTab === 'music' ? 'bg-leaf text-white' : 'text-ink/60 hover:bg-mint hover:text-leaf'"
          @click="activeTab = 'music'"
        >
          Musik Undangan
        </button>
      </div>

      <div v-if="loading" class="mt-8 flex items-center gap-3 rounded-md border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/65">
        <Loader2 class="h-4 w-4 animate-spin text-leaf" />
        Memuat katalog...
      </div>
      <p v-else-if="error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error }}</p>

      <template v-else>
        <section v-if="activeTab === 'themes'" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="theme in visibleThemes" :key="theme.id" class="grid gap-3">
            <RouterLink
              class="focus-ring rounded-md transition hover:-translate-y-0.5 hover:shadow-soft"
              :to="{ name: 'theme-demo-detail', params: { themeKey: theme.key } }"
            >
              <ThemePreviewCard :theme="theme" />
            </RouterLink>
            <button
              type="button"
              class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-3 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf"
              @click="copyText(themeCopyText(theme))"
            >
              <Check v-if="copiedText === themeCopyText(theme)" class="h-4 w-4" />
              <Copy v-else class="h-4 w-4" />
              {{ copiedText === themeCopyText(theme) ? "Tersalin" : "Salin nama tema" }}
            </button>
          </article>
        </section>

        <section v-else class="mt-8 grid gap-3">
          <article
            v-for="item in music"
            :key="item.id"
            class="grid gap-4 rounded-md border border-ink/10 bg-white p-4 shadow-soft md:grid-cols-[1fr_120px_110px_160px] md:items-center"
          >
            <div>
              <p class="font-bold text-ink">{{ item.title }}</p>
              <p class="mt-1 text-sm text-ink/55">{{ item.artist || "Tanpa penyanyi" }}</p>
            </div>
            <p class="text-sm font-semibold text-ink/65">{{ displayMusicDuration(item) }}</p>
            <button
              type="button"
              class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-3 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!item.fileUrl"
              @click="toggleMusicPreview(item)"
            >
              <Pause v-if="playingMusicId === item.id" class="h-4 w-4" />
              <Play v-else class="h-4 w-4" />
              {{ playingMusicId === item.id ? "Pause" : "Play" }}
            </button>
            <button
              type="button"
              class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-leaf px-3 text-sm font-semibold text-white transition hover:bg-ink"
              @click="copyText(musicCopyText(item))"
            >
              <Check v-if="copiedText === musicCopyText(item)" class="h-4 w-4" />
              <Copy v-else class="h-4 w-4" />
              {{ copiedText === musicCopyText(item) ? "Tersalin" : "Salin judul" }}
            </button>
          </article>
          <p v-if="!music.length" class="rounded-md border border-ink/10 bg-white p-5 text-sm font-semibold text-ink/60 shadow-soft">
            Belum ada musik aktif.
          </p>
          <audio ref="previewAudio" class="hidden" preload="none" @ended="onPreviewEnded" />
        </section>
      </template>
    </main>
  </div>
</template>
