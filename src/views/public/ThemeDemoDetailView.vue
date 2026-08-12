<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Check, Copy } from "@lucide/vue";

import InvitationRenderer from "@/components/invitation/InvitationRenderer.vue";
import { getInvitationTheme, invitationThemes } from "@/lib/invitationThemes";

const route = useRoute();
const copied = ref(false);

const selectedTheme = computed(() => getInvitationTheme(route.params.themeKey));
const demoUrl = computed(() => `${window.location.origin}/demo-tema/${selectedTheme.value.key}`);

const sampleInvitation = {
  coupleNames: "Raka & Amara",
  guestName: "Bapak/Ibu/Saudara/i",
  groom: {
    fullName: "Raka Pradipta",
    parentsName: "Putra dari Bapak Surya Pradipta dan Ibu Melati"
  },
  bride: {
    fullName: "Amara Kirana",
    parentsName: "Putri dari Bapak Bima Kirana dan Ibu Ratih"
  },
  events: [
    {
      type: "Akad",
      date: "2026-10-18T08:00:00.000Z",
      startTime: "08.00",
      endTime: "10.00",
      address: "Masjid Al Ikhlas, Jl. Kenanga No. 12, Jakarta Selatan"
    },
    {
      type: "Resepsi",
      date: "2026-10-18T11:00:00.000Z",
      startTime: "11.00",
      endTime: "14.00",
      address: "Gedung Puspa Kirana, Jl. Melati Raya No. 8, Jakarta Selatan"
    }
  ],
  envelope: [
    {
      providerName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "Amara Kirana"
    }
  ],
  loveStory: [
    {
      title: "Pertama bertemu",
      date: "2021-06-12",
      description: "Pertemuan sederhana setelah acara kampus menjadi awal dari percakapan panjang yang terus berlanjut sampai hari ini."
    },
    {
      title: "Lamaran keluarga",
      date: "2025-12-20",
      description: "Dua keluarga bertemu dalam suasana hangat untuk merestui langkah Raka dan Amara menuju pernikahan."
    }
  ],
  dressCode: {
    enabled: true,
    note: "Kami akan senang jika tamu berkenan memakai warna pastel atau earth tone.",
    colors: ["#f5d7c4", "#d8bfa3", "#8f9f7a"]
  },
  wishes: [
    {
      name: "Dian",
      status: "Hadir",
      message: "Semoga menjadi keluarga yang sakinah, mawaddah, warahmah."
    },
    {
      name: "Nadia",
      status: "Hadir",
      message: "Selamat menempuh hidup baru. Bahagia selalu untuk Raka dan Amara."
    }
  ]
};

async function copyDemoLink() {
  try {
    await navigator.clipboard.writeText(demoUrl.value);
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
          <RouterLink to="/demo-tema" class="text-sm font-bold text-leaf hover:text-ink">Katalog tema</RouterLink>
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
            @click="copyDemoLink"
          >
            <Check v-if="copied" class="h-4 w-4" />
            <Copy v-else class="h-4 w-4" />
            {{ copied ? "Link tersalin" : "Salin link" }}
          </button>
        </div>
      </div>
    </header>

    <InvitationRenderer
      :invitation="sampleInvitation"
      :selected-theme="selectedTheme"
      :wishes="sampleInvitation.wishes"
      opened
      is-demo
    />
  </div>
</template>
