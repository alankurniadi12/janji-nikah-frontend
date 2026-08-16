<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CalendarDays, CheckCircle2, Clock3, Copy, Loader2, MessageSquareText, Users, XCircle } from "@lucide/vue";

import whatsappIconUrl from "@/assets/ic-whatsapp.png";
import { getApiErrorMessage } from "@/lib/api";
import { getPublicHostDashboard } from "@/services/publicInvitationService";
import { useToastStore } from "@/stores/toasts";
import { formatDate } from "@/utils/formatters";

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();
const loading = ref(true);
const error = ref("");
const actionError = ref("");
const dashboard = ref(null);
const activeTab = ref("guests");
const visibleGuestLimit = ref(10);
const visibleWishLimit = ref(10);

const LIST_INCREMENT = 10;

onMounted(loadDashboard);

const invitation = computed(() => dashboard.value?.invitation);
const summary = computed(() => dashboard.value?.summary || {});
const guests = computed(() => dashboard.value?.guests || []);
const wishes = computed(() => dashboard.value?.wishes || []);
const visibleGuests = computed(() => guests.value.slice(0, visibleGuestLimit.value));
const visibleWishes = computed(() => wishes.value.slice(0, visibleWishLimit.value));
const hasMoreGuests = computed(() => visibleGuestLimit.value < guests.value.length);
const hasMoreWishes = computed(() => visibleWishLimit.value < wishes.value.length);
const publicInvitationUrl = computed(() => absoluteLink(`/${route.params.username}/${route.params.slug}`));
const coupleNames = computed(() => {
  const groom = invitation.value?.groom?.fullName || invitation.value?.summary?.groomName || "Pengantin";
  const bride = invitation.value?.bride?.fullName || invitation.value?.summary?.brideName || "Pasangan";
  return `${groom} & ${bride}`;
});

async function loadDashboard() {
  loading.value = true;
  error.value = "";

  try {
    const detail = await getPublicHostDashboard(route.params.username, route.params.slug, route.params.token);
    dashboard.value = detail;

    if (detail.redirectUsername) {
      router.replace({
        name: route.name,
        params: {
          ...route.params,
          username: detail.redirectUsername
        }
      });
    }
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Laporan undangan tidak ditemukan.");
  } finally {
    loading.value = false;
  }
}

function rsvpLabel(status) {
  if (status === "attending") return "Hadir";
  if (status === "not_attending") return "Tidak hadir";
  return "Belum RSVP";
}

function rsvpClass(status) {
  if (status === "attending") return "border-leaf/20 bg-leaf/10 text-leaf";
  if (status === "not_attending") return "border-rose/20 bg-rose/10 text-rose";
  return "border-ink/10 bg-white text-ink/50";
}

function absoluteLink(link) {
  if (!link) {
    return "";
  }

  return new URL(link, window.location.origin).toString();
}

async function copyText(text, message) {
  actionError.value = "";

  if (!text) {
    actionError.value = "Link tamu belum tersedia.";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    toastStore.show(message);
  } catch {
    actionError.value = "Browser belum mengizinkan copy otomatis. Salin teks secara manual dari link yang tampil.";
  }
}

async function copyGuestLink(guest) {
  await copyText(absoluteLink(guest.link), "Link tamu berhasil disalin.");
}

async function copyPublicInvitationLink() {
  await copyText(publicInvitationUrl.value, "Link undangan publik berhasil disalin.");
}

async function copyGuestWhatsapp(guest) {
  const link = absoluteLink(guest.link);

  if (!link) {
    actionError.value = "Link tamu belum tersedia.";
    return;
  }

  const message = `Assalamu'alaikum ${guest.name},\n\nKami mengundang Anda untuk hadir di acara pernikahan ${coupleNames.value}.\n\nBuka undangan:\n${link}`;

  await copyText(message, "Pesan WhatsApp berhasil disalin.");
}

function setActiveTab(tab) {
  activeTab.value = tab;
  actionError.value = "";
}

function loadMoreGuests() {
  visibleGuestLimit.value += LIST_INCREMENT;
}

function loadMoreWishes() {
  visibleWishLimit.value += LIST_INCREMENT;
}
</script>

<template>
  <main class="min-h-screen bg-linen px-4 py-8 sm:px-6 lg:px-8">
    <div v-if="loading" class="flex min-h-[70vh] items-center justify-center">
      <div class="flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <Loader2 class="h-5 w-5 animate-spin text-leaf" />
        <p class="text-sm font-semibold text-ink/70">Memuat laporan undangan...</p>
      </div>
    </div>

    <section v-else-if="error" class="mx-auto flex min-h-[70vh] max-w-md items-center">
      <div class="w-full rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Laporan tidak tersedia</p>
        <h1 class="mt-3 text-2xl font-bold text-ink">Akses laporan berakhir</h1>
        <p class="mt-3 text-sm leading-6 text-ink/60">{{ error }}</p>
      </div>
    </section>

    <section v-else-if="!dashboard?.isActive" class="mx-auto flex min-h-[70vh] max-w-md items-center">
      <div class="w-full rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Laporan tidak aktif</p>
        <h1 class="mt-3 text-2xl font-bold text-ink">{{ coupleNames }}</h1>
        <p class="mt-3 text-sm leading-6 text-ink/60">
          Masa aktif laporan mengikuti masa aktif undangan dan sudah berakhir.
        </p>
      </div>
    </section>

    <template v-else>
      <header class="mx-auto max-w-6xl">
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Laporan calon pengantin</p>
        <div class="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 class="text-3xl font-bold text-ink sm:text-4xl">{{ coupleNames }}</h1>
            <p class="mt-2 text-sm text-ink/55">
              Aktif sampai {{ invitation.expiresAt ? formatDate(invitation.expiresAt) : "masa undangan berakhir" }}.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a
              class="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf"
              :href="publicInvitationUrl"
              target="_blank"
              rel="noreferrer"
            >
              Buka undangan publik
            </a>
            <button
              class="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf"
              type="button"
              @click="copyPublicInvitationLink"
            >
              <Copy class="h-4 w-4" />
              Salin link
            </button>
          </div>
        </div>
      </header>

      <section class="mx-auto mt-6 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <article class="rounded-md border border-ink/10 bg-white p-4 shadow-soft">
          <Users class="h-5 w-5 text-leaf" />
          <p class="mt-3 text-2xl font-bold text-ink">{{ summary.totalGuests || 0 }}</p>
          <p class="text-sm text-ink/55">Total tamu</p>
        </article>
        <article class="rounded-md border border-ink/10 bg-white p-4 shadow-soft">
          <CheckCircle2 class="h-5 w-5 text-leaf" />
          <p class="mt-3 text-2xl font-bold text-ink">{{ summary.attending || 0 }}</p>
          <p class="text-sm text-ink/55">Hadir</p>
        </article>
        <article class="rounded-md border border-ink/10 bg-white p-4 shadow-soft">
          <XCircle class="h-5 w-5 text-rose" />
          <p class="mt-3 text-2xl font-bold text-ink">{{ summary.notAttending || 0 }}</p>
          <p class="text-sm text-ink/55">Tidak hadir</p>
        </article>
        <article class="rounded-md border border-ink/10 bg-white p-4 shadow-soft">
          <Clock3 class="h-5 w-5 text-gold" />
          <p class="mt-3 text-2xl font-bold text-ink">{{ summary.pending || 0 }}</p>
          <p class="text-sm text-ink/55">Belum RSVP</p>
        </article>
        <article class="rounded-md border border-ink/10 bg-white p-4 shadow-soft">
          <MessageSquareText class="h-5 w-5 text-leaf" />
          <p class="mt-3 text-2xl font-bold text-ink">{{ summary.wishes || 0 }}</p>
          <p class="text-sm text-ink/55">Ucapan</p>
        </article>
      </section>

      <section class="mx-auto mt-6 max-w-6xl rounded-lg border border-ink/10 bg-white p-4 shadow-soft sm:p-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-bold text-ink">Detail laporan</h2>
            <p class="mt-1 text-sm text-ink/55">Pantau kehadiran dan ucapan tanpa membuat halaman terlalu panjang.</p>
          </div>
          <div class="grid grid-cols-2 rounded-md border border-ink/10 bg-linen p-1">
            <button
              class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded px-3 text-sm font-bold transition"
              :class="activeTab === 'guests' ? 'bg-white text-leaf shadow-sm' : 'text-ink/55 hover:text-ink'"
              type="button"
              @click="setActiveTab('guests')"
            >
              <CalendarDays class="h-4 w-4" />
              Kehadiran
            </button>
            <button
              class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded px-3 text-sm font-bold transition"
              :class="activeTab === 'wishes' ? 'bg-white text-leaf shadow-sm' : 'text-ink/55 hover:text-ink'"
              type="button"
              @click="setActiveTab('wishes')"
            >
              <MessageSquareText class="h-4 w-4" />
              Ucapan
            </button>
          </div>
        </div>

        <p v-if="actionError" class="mt-4 rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">{{ actionError }}</p>

        <div v-if="activeTab === 'guests'" class="mt-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-bold uppercase tracking-widest text-gold">Daftar kehadiran</p>
            <p class="text-xs font-semibold text-ink/45">Menampilkan {{ visibleGuests.length }} dari {{ guests.length }} tamu</p>
          </div>
          <div v-if="guests.length" class="mt-4 divide-y divide-ink/10">
            <div v-for="guest in visibleGuests" :key="guest.id" class="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <div class="min-w-0">
                <p class="font-semibold text-ink">{{ guest.name }}</p>
                <p class="text-xs text-ink/45">{{ guest.openedAt ? `Dibuka ${formatDate(guest.openedAt)}` : "Belum membuka undangan" }}</p>
                <p v-if="guest.link" class="mt-1 break-all text-xs text-ink/45">{{ absoluteLink(guest.link) }}</p>
              </div>
              <span class="inline-flex w-max rounded-full border px-3 py-1 text-xs font-bold" :class="rsvpClass(guest.rsvpStatus)">
                {{ rsvpLabel(guest.rsvpStatus) }}
              </span>
              <div class="flex flex-wrap gap-2 sm:justify-end">
                <button
                  class="focus-ring rounded-md p-2 text-ink/60 hover:bg-mint hover:text-leaf"
                  type="button"
                  title="Salin link"
                  aria-label="Salin link tamu"
                  @click="copyGuestLink(guest)"
                >
                  <Copy class="h-4 w-4" />
                </button>
                <button
                  class="focus-ring rounded-md p-1.5 text-ink/60 hover:bg-mint hover:text-leaf"
                  type="button"
                  title="Salin pesan WhatsApp"
                  aria-label="Salin pesan WhatsApp"
                  @click="copyGuestWhatsapp(guest)"
                >
                  <img :src="whatsappIconUrl" alt="" class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <p v-else class="mt-4 rounded-md border border-dashed border-ink/15 p-5 text-sm font-semibold text-ink/50">
            Belum ada tamu yang ditambahkan.
          </p>
          <button
            v-if="hasMoreGuests"
            class="focus-ring mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink hover:border-leaf hover:text-leaf sm:w-auto"
            type="button"
            @click="loadMoreGuests"
          >
            Muat lagi
          </button>
        </div>

        <div v-else class="mt-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-bold uppercase tracking-widest text-gold">Ucapan tamu</p>
            <p class="text-xs font-semibold text-ink/45">Menampilkan {{ visibleWishes.length }} dari {{ wishes.length }} ucapan</p>
          </div>
          <div v-if="wishes.length" class="mt-4 space-y-3">
            <article v-for="wish in visibleWishes" :key="wish.id" class="rounded-md border border-ink/10 bg-linen p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="font-bold text-ink">{{ wish.displayName }}</p>
                <span class="rounded-full border px-2 py-1 text-xs font-bold" :class="rsvpClass(wish.rsvpStatus)">
                  {{ rsvpLabel(wish.rsvpStatus) }}
                </span>
              </div>
              <p class="mt-3 text-sm leading-6 text-ink/65">{{ wish.message }}</p>
              <p class="mt-3 text-xs text-ink/40">{{ formatDate(wish.createdAt) }}</p>
            </article>
          </div>
          <p v-else class="mt-4 rounded-md border border-dashed border-ink/15 p-5 text-sm font-semibold text-ink/50">
            Belum ada ucapan yang masuk.
          </p>
          <button
            v-if="hasMoreWishes"
            class="focus-ring mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink hover:border-leaf hover:text-leaf sm:w-auto"
            type="button"
            @click="loadMoreWishes"
          >
            Muat lagi
          </button>
        </div>
      </section>
    </template>
  </main>
</template>
