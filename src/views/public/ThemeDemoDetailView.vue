<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { CalendarDays, Check, Copy, Gift, MapPin } from "@lucide/vue";

import { getInvitationTheme, getThemeClass, invitationThemes } from "@/lib/invitationThemes";
import { formatEventDate } from "@/utils/formatters";

const route = useRoute();
const copied = ref(false);

const selectedTheme = computed(() => getInvitationTheme(route.params.themeKey));
const themeClass = computed(() => getThemeClass(selectedTheme.value.key));
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
  <div :class="['invitation-page', themeClass]">
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

    <main>
      <section class="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-4 py-16">
        <div class="absolute inset-0 theme-preview" :class="selectedTheme.previewClass" />
        <div class="theme-cover-overlay absolute inset-0 bg-ink/55" />
        <div class="theme-ornament pointer-events-none absolute inset-x-10 top-10 bottom-10 hidden sm:block" />
        <div class="theme-cover-copy relative z-10 mx-auto max-w-2xl text-center text-white">
          <p class="text-sm font-bold uppercase tracking-widest text-white/75">Undangan pernikahan</p>
          <p class="mt-4 text-sm font-semibold text-white/80">Kepada {{ sampleInvitation.guestName }}</p>
          <h2 class="theme-cover-title mt-5 text-5xl font-bold leading-tight sm:text-6xl">
            {{ sampleInvitation.coupleNames }}
          </h2>
          <p class="mt-5 text-lg text-white/80">{{ formatEventDate(sampleInvitation.events[0].date) }}</p>
          <span class="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 py-2 text-sm font-bold text-ink">
            Preview Tema
          </span>
        </div>
      </section>

      <section>
        <header class="theme-hero relative overflow-hidden px-4 py-20 text-center text-white">
          <div class="absolute inset-0 opacity-25 theme-preview" :class="selectedTheme.previewClass" />
          <div class="theme-hero-copy relative z-10 mx-auto max-w-3xl">
            <p class="text-sm font-bold uppercase tracking-widest text-white/70">The wedding of</p>
            <h2 class="theme-hero-title mt-5 text-5xl font-bold leading-tight sm:text-6xl">
              {{ sampleInvitation.coupleNames }}
            </h2>
            <p class="mt-5 text-sm leading-6 text-white/70">
              Contoh ini memakai data dummy yang sama di semua tema agar perbedaan desain terlihat adil.
            </p>
          </div>
        </header>

        <section class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div class="grid gap-4 md:grid-cols-2">
            <article class="theme-section-panel rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
              <p class="text-sm font-bold uppercase tracking-widest text-gold">Pengantin pria</p>
              <h2 class="mt-3 text-3xl font-bold text-ink">{{ sampleInvitation.groom.fullName }}</h2>
              <p class="mt-3 text-sm leading-6 text-ink/60">{{ sampleInvitation.groom.parentsName }}</p>
            </article>
            <article class="theme-section-panel rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
              <p class="text-sm font-bold uppercase tracking-widest text-gold">Pengantin wanita</p>
              <h2 class="mt-3 text-3xl font-bold text-ink">{{ sampleInvitation.bride.fullName }}</h2>
              <p class="mt-3 text-sm leading-6 text-ink/60">{{ sampleInvitation.bride.parentsName }}</p>
            </article>
          </div>
        </section>

        <section class="bg-white px-4 py-12">
          <div class="mx-auto max-w-5xl">
            <p class="text-center text-sm font-bold uppercase tracking-widest text-gold">Detail acara</p>
            <div class="mt-8 grid gap-4 md:grid-cols-2">
              <article
                v-for="eventItem in sampleInvitation.events"
                :key="eventItem.type"
                class="theme-section-panel rounded-lg border border-ink/10 bg-linen p-6 shadow-soft"
              >
                <div class="flex items-center gap-3 text-leaf">
                  <CalendarDays class="h-5 w-5" />
                  <p class="text-sm font-bold uppercase tracking-widest">{{ eventItem.type }}</p>
                </div>
                <h2 class="mt-4 text-2xl font-bold text-ink">{{ formatEventDate(eventItem.date) }}</h2>
                <p class="mt-2 text-sm font-semibold text-ink/70">{{ eventItem.startTime }} - {{ eventItem.endTime }}</p>
                <div class="mt-4 flex gap-3 text-sm leading-6 text-ink/60">
                  <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                  <p>{{ eventItem.address }}</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <p class="text-center text-sm font-bold uppercase tracking-widest text-gold">Galeri</p>
          <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="index in 3"
              :key="index"
              class="theme-preview aspect-[4/3] rounded-lg shadow-soft"
              :class="selectedTheme.previewClass"
            />
          </div>
        </section>

        <section class="bg-white px-4 py-12">
          <div class="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-linen p-6 text-center shadow-soft">
            <Gift class="mx-auto h-8 w-8 text-rose" />
            <h2 class="mt-4 text-2xl font-bold text-ink">Amplop digital</h2>
            <div class="mt-6 grid gap-3">
              <div
                v-for="method in sampleInvitation.envelope"
                :key="method.accountNumber"
                class="rounded-md border border-ink/10 bg-white p-4"
              >
                <p class="text-sm font-bold text-ink">{{ method.providerName }}</p>
                <p class="mt-1 text-lg font-bold text-leaf">{{ method.accountNumber }}</p>
                <p class="mt-1 text-sm text-ink/55">a.n. {{ method.accountHolder }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="mx-auto max-w-3xl px-4 py-12">
          <h2 class="text-center text-2xl font-bold text-ink">RSVP dan ucapan</h2>
          <div class="mt-8 grid gap-3">
            <article
              v-for="wish in sampleInvitation.wishes"
              :key="wish.name"
              class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft"
            >
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-bold text-ink">{{ wish.name }}</p>
                <span class="rounded-full border border-leaf/20 bg-leaf/10 px-2.5 py-1 text-xs font-bold text-leaf">
                  {{ wish.status }}
                </span>
              </div>
              <p class="mt-2 text-sm leading-6 text-ink/65">{{ wish.message }}</p>
            </article>
          </div>
        </section>

        <footer class="border-t border-ink/10 bg-white px-4 py-6 text-center text-sm text-ink/55">
          Dibuat dengan
          <RouterLink class="font-bold text-leaf hover:text-ink" to="/">Janji Nikah</RouterLink>
        </footer>
      </section>
    </main>
  </div>
</template>
