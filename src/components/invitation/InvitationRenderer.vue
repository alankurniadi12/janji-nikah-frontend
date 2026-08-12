<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { CalendarDays, CalendarPlus, Copy, Gift, Heart, Image, Loader2, MapPin, MessageCircle, Music2 } from "@lucide/vue";

import { getThemeClass } from "@/lib/invitationThemes";
import { assetUrl } from "@/utils/assets";
import { formatEventDate } from "@/utils/formatters";

const props = defineProps({
  invitation: {
    type: Object,
    required: true
  },
  selectedTheme: {
    type: Object,
    required: true
  },
  guest: {
    type: Object,
    default: null
  },
  wishes: {
    type: Array,
    default: () => []
  },
  opened: {
    type: Boolean,
    default: false
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  musicItem: {
    type: Object,
    default: null
  },
  audioPlaying: {
    type: Boolean,
    default: false
  },
  selectedRsvpStatus: {
    type: String,
    default: "attending"
  },
  wishForm: {
    type: Object,
    default: () => ({ displayName: "", message: "" })
  },
  wishMessageLength: {
    type: Number,
    default: 0
  },
  maxWishMessageLength: {
    type: Number,
    default: 150
  },
  isWishMessageTooLong: {
    type: Boolean,
    default: false
  },
  canSubmitWish: {
    type: Boolean,
    default: false
  },
  submitting: {
    type: Boolean,
    default: false
  },
  guestError: {
    type: String,
    default: ""
  },
  guestMessage: {
    type: String,
    default: ""
  },
  editingWishId: {
    type: String,
    default: ""
  }
});

const emit = defineEmits([
  "open",
  "toggle-music",
  "submit-rsvp",
  "submit-wish",
  "update-wish-display-name",
  "update-wish-message",
  "start-edit-wish",
  "cancel-edit-wish"
]);

const rootRef = ref(null);
const now = ref(Date.now());
const copiedEnvelopeKey = ref("");
let revealObserver = null;
let revealFallbackTimer = null;
let countdownTimer = null;

const themeClass = computed(() => getThemeClass(props.selectedTheme.key));
const layoutClass = computed(() => `invitation-layout-${props.selectedTheme.key}`);
const showContent = computed(() => props.opened || props.isDemo);
const showCover = computed(() => !props.opened || props.isDemo);
const showStageNav = computed(() => props.selectedTheme.key === "golden-bloom-stage" && showContent.value);
const coupleNames = computed(() => {
  if (props.invitation.coupleNames) {
    return props.invitation.coupleNames;
  }

  const groom = props.invitation.groom?.fullName || props.invitation.summary?.groomName || "Pengantin";
  const bride = props.invitation.bride?.fullName || props.invitation.summary?.brideName || "Pasangan";
  return `${groom} & ${bride}`;
});
const guestName = computed(() => props.guest?.name || props.invitation.guestName);
const envelopeMethods = computed(() => {
  if (Array.isArray(props.invitation.envelope)) {
    return props.invitation.envelope;
  }

  if (props.invitation.envelope?.isEnabled) {
    return props.invitation.envelope.methods || [];
  }

  return [];
});
const galleryUrls = computed(() => props.invitation.galleryPhotoUrls || []);
const demoGalleryCount = computed(() => (props.isDemo && !galleryUrls.value.length ? 3 : 0));
const loveStoryItems = computed(() =>
  (props.invitation.loveStory || []).filter((item) => item?.title || item?.description)
);
const dressCode = computed(() => props.invitation.dressCode || { enabled: false, note: "", colors: [] });
const showDressCode = computed(() => Boolean(dressCode.value.enabled && dressCode.value.colors?.length));
const quote = computed(() => props.invitation.quote || { enabled: false, text: "", source: "" });
const showQuote = computed(() => Boolean(quote.value.enabled && quote.value.text));
const sortedEvents = computed(() =>
  [...(props.invitation.events || [])].sort((left, right) => eventStartDate(left).getTime() - eventStartDate(right).getTime())
);
const countdownEvent = computed(() => {
  return sortedEvents.value.find((eventItem) => eventStartDate(eventItem).getTime() > now.value) || null;
});
const countdownParts = computed(() => {
  if (!countdownEvent.value) {
    return null;
  }

  const remainingMs = Math.max(0, eventStartDate(countdownEvent.value).getTime() - now.value);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { label: "Hari", value: days },
    { label: "Jam", value: hours },
    { label: "Menit", value: minutes },
    { label: "Detik", value: seconds }
  ];
});

function wishName(wish) {
  return wish.displayName || wish.name || "Tamu";
}

function wishStatus(wish) {
  return wish.rsvpStatus || wish.status || "";
}

function wishMessage(wish) {
  return wish.message || "";
}

function rsvpStatusLabel(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "attending" || normalizedStatus === "hadir") {
    return "Hadir";
  }

  if (normalizedStatus === "not_attending" || normalizedStatus === "tidak hadir") {
    return "Tidak hadir";
  }

  return status || "Belum RSVP";
}

function rsvpStatusClass(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "attending" || normalizedStatus === "hadir") {
    return "border-leaf/20 bg-leaf/10 text-leaf";
  }

  if (normalizedStatus === "not_attending" || normalizedStatus === "tidak hadir") {
    return "border-rose/20 bg-rose/10 text-rose";
  }

  return "border-ink/10 bg-white text-ink/50";
}

function eventStartDate(eventItem) {
  const datePart = String(eventItem?.date || "").slice(0, 10);
  const timePart = normalizeTime(eventItem?.startTime) || "00:00";
  const date = new Date(`${datePart}T${timePart}:00`);

  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  const fallbackDate = new Date(eventItem?.date);
  return Number.isNaN(fallbackDate.getTime()) ? new Date(0) : fallbackDate;
}

function eventEndDate(eventItem) {
  const datePart = String(eventItem?.date || "").slice(0, 10);
  const timePart = normalizeTime(eventItem?.endTime);

  if (timePart) {
    const date = new Date(`${datePart}T${timePart}:00`);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date(eventStartDate(eventItem).getTime() + 2 * 60 * 60 * 1000);
}

function normalizeTime(value) {
  const normalized = String(value || "").trim().replace(".", ":");
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return "";
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);

  if (hours > 23 || minutes > 59) {
    return "";
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function eventTypeLabel(type) {
  const labels = {
    akad: "Akad",
    resepsi: "Resepsi"
  };

  return labels[String(type || "").toLowerCase()] || type || "Acara";
}

function calendarDataUri(eventItem) {
  const title = `${eventTypeLabel(eventItem.type)} ${coupleNames.value}`;
  const start = toIcsDate(eventStartDate(eventItem));
  const end = toIcsDate(eventEndDate(eventItem));
  const location = escapeIcsText(eventItem.address || "");
  const description = escapeIcsText(`Undangan pernikahan ${coupleNames.value}`);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Janji Nikah//Invitation//ID",
    "BEGIN:VEVENT",
    `UID:${start}-${slugifyCalendarText(title)}@janjinikah.local`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function calendarFileName(eventItem) {
  return `${slugifyCalendarText(eventTypeLabel(eventItem.type))}-${slugifyCalendarText(coupleNames.value)}.ics`;
}

function toIcsDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function slugifyCalendarText(value) {
  return String(value || "acara")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "acara";
}

function storyDateLabel(value) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatEventDate(value);
  }

  return value;
}

function canEditWish(wish) {
  return Boolean(props.guest?.id && wish.guestId === props.guest.id);
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function copyEnvelopeNumber(method) {
  const text = method.accountNumber || "";

  if (!text) {
    return;
  }

  const key = `${method.providerName}-${method.accountNumber}`;

  try {
    await navigator.clipboard.writeText(text);
    copiedEnvelopeKey.value = key;
    window.setTimeout(() => {
      if (copiedEnvelopeKey.value === key) {
        copiedEnvelopeKey.value = "";
      }
    }, 1800);
  } catch {
    copiedEnvelopeKey.value = "";
  }
}

function disconnectRevealObserver() {
  revealObserver?.disconnect();
  revealObserver = null;
  window.clearTimeout(revealFallbackTimer);
  revealFallbackTimer = null;
}

async function setupRevealObserver() {
  await nextTick();
  disconnectRevealObserver();

  if (!rootRef.value) {
    return;
  }

  const revealItems = rootRef.value.querySelectorAll(".theme-reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
  revealFallbackTimer = window.setTimeout(() => {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }, 900);
}

function startCountdownTimer() {
  window.clearInterval(countdownTimer);
  countdownTimer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
}

onMounted(() => {
  setupRevealObserver();
  startCountdownTimer();
});
onBeforeUnmount(() => {
  disconnectRevealObserver();
  window.clearInterval(countdownTimer);
});
watch(showContent, () => {
  setupRevealObserver();
});
</script>

<template>
  <div ref="rootRef" :class="['invitation-page', themeClass, layoutClass]">
    <section v-if="showCover" class="theme-cover-section relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div
        v-if="isPreview"
        class="absolute left-4 top-4 z-20 rounded-md bg-white/90 px-3 py-2 text-xs font-bold uppercase tracking-widest text-leaf shadow-soft"
      >
        Mode preview
      </div>
      <img
        v-if="invitation.mainPhotoUrl"
        :src="assetUrl(invitation.mainPhotoUrl)"
        alt="Cover undangan"
        class="theme-cover-image absolute inset-0 h-full w-full object-cover"
      />
      <div v-else class="absolute inset-0 theme-preview" :class="selectedTheme.previewClass" />
      <div class="theme-cover-overlay absolute inset-0 bg-ink/55" />
      <div class="theme-ornament pointer-events-none absolute inset-x-10 top-10 bottom-10 hidden sm:block" />
      <div class="theme-cover-copy relative z-10 mx-auto max-w-2xl text-center text-white">
        <p class="theme-kicker text-sm font-bold uppercase tracking-widest text-white/75">Undangan pernikahan</p>
        <p v-if="guestName" class="theme-guest-name mt-4 text-sm font-semibold text-white/80">Kepada {{ guestName }}</p>
        <h1 class="theme-cover-title mt-5 text-5xl font-bold leading-tight sm:text-6xl">{{ coupleNames }}</h1>
        <p v-if="invitation.events?.[0]" class="theme-cover-date mt-5 text-lg text-white/80">
          {{ formatEventDate(invitation.events[0].date) }}
        </p>
        <button
          v-if="!isDemo"
          class="focus-ring theme-open-button mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 py-2 text-sm font-bold text-ink transition hover:bg-mint"
          type="button"
          @click="emit('open')"
        >
          Buka Undangan
        </button>
        <span
          v-else
          class="theme-open-button mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 py-2 text-sm font-bold text-ink"
        >
          Preview Tema
        </span>
      </div>
    </section>

    <section v-if="showContent" class="theme-content-flow">
      <header id="theme-section-opening" class="theme-reveal theme-hero relative overflow-hidden bg-ink px-4 py-20 text-center text-white">
        <img
          v-if="invitation.mainPhotoUrl"
          :src="assetUrl(invitation.mainPhotoUrl)"
          alt="Foto utama"
          class="theme-hero-image absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div v-else class="absolute inset-0 opacity-25 theme-preview" :class="selectedTheme.previewClass" />
        <div class="theme-hero-copy relative z-10 mx-auto max-w-3xl">
          <p class="theme-kicker text-sm font-bold uppercase tracking-widest text-white/70">The wedding of</p>
          <h1 class="theme-hero-title mt-5 text-5xl font-bold leading-tight sm:text-6xl">{{ coupleNames }}</h1>
          <p v-if="isDemo" class="mt-5 text-sm leading-6 text-white/70">
            Contoh ini memakai data dummy yang sama di semua tema agar perbedaan desain terlihat adil.
          </p>
          <button
            v-if="musicItem?.fileUrl"
            class="focus-ring mt-8 inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20"
            type="button"
            @click="emit('toggle-music')"
          >
            <Music2 class="h-4 w-4" />
            {{ audioPlaying ? "Pause musik" : "Play musik" }}
          </button>
        </div>
      </header>

      <section
        v-if="showQuote"
        id="theme-section-quote"
        class="theme-reveal theme-quote-section mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8"
      >
        <div class="theme-section-panel rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
          <p class="text-sm font-bold uppercase tracking-widest text-gold">Quote</p>
          <blockquote class="mx-auto mt-4 max-w-3xl whitespace-pre-line text-lg font-semibold leading-8 text-ink sm:text-xl sm:leading-9">
            {{ quote.text }}
          </blockquote>
          <p v-if="quote.source" class="mt-4 text-sm font-bold text-leaf">{{ quote.source }}</p>
        </div>
      </section>

      <section id="theme-section-couple" class="theme-reveal theme-couple-section mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="theme-couple-grid grid gap-4 md:grid-cols-2">
          <article class="theme-section-panel theme-couple-card rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
            <img
              v-if="invitation.groom?.photoUrl"
              :src="assetUrl(invitation.groom.photoUrl)"
              alt="Foto pengantin pria"
              class="theme-couple-photo"
            />
            <p class="text-sm font-bold uppercase tracking-widest text-gold">Pengantin pria</p>
            <h2 class="mt-3 text-3xl font-bold text-ink">{{ invitation.groom.fullName }}</h2>
            <p class="mt-3 whitespace-pre-line text-sm leading-6 text-ink/60">{{ invitation.groom.parentsName }}</p>
          </article>
          <article class="theme-section-panel theme-couple-card rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
            <img
              v-if="invitation.bride?.photoUrl"
              :src="assetUrl(invitation.bride.photoUrl)"
              alt="Foto pengantin wanita"
              class="theme-couple-photo"
            />
            <p class="text-sm font-bold uppercase tracking-widest text-gold">Pengantin wanita</p>
            <h2 class="mt-3 text-3xl font-bold text-ink">{{ invitation.bride.fullName }}</h2>
            <p class="mt-3 whitespace-pre-line text-sm leading-6 text-ink/60">{{ invitation.bride.parentsName }}</p>
          </article>
        </div>
      </section>

      <section
        v-if="countdownParts"
        id="theme-section-countdown"
        class="theme-reveal theme-countdown-section mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div class="theme-section-panel rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
          <p class="text-sm font-bold uppercase tracking-widest text-gold">Menuju hari bahagia</p>
          <h2 class="mt-4 text-2xl font-bold text-ink">{{ eventTypeLabel(countdownEvent.type) }}</h2>
          <p class="mt-2 text-sm font-semibold text-ink/55">{{ formatEventDate(countdownEvent.date) }}</p>
          <div class="theme-countdown-grid mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div v-for="part in countdownParts" :key="part.label" class="theme-countdown-item rounded-md border border-ink/10 bg-linen p-4">
              <p class="text-3xl font-bold text-ink">{{ String(part.value).padStart(2, "0") }}</p>
              <p class="mt-1 text-xs font-bold uppercase tracking-widest text-ink/45">{{ part.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="theme-section-events" class="theme-reveal theme-events-section bg-white px-4 py-12">
        <div class="mx-auto max-w-5xl">
          <p class="text-center text-sm font-bold uppercase tracking-widest text-gold">Detail acara</p>
          <div class="theme-events-grid mt-8 grid gap-4 md:grid-cols-2">
            <article
              v-for="eventItem in invitation.events"
              :key="`${eventItem.type}-${eventItem.date}`"
              class="theme-section-panel theme-event-card rounded-lg border border-ink/10 bg-linen p-6 shadow-soft"
            >
              <div class="flex items-center gap-3 text-leaf">
                <CalendarDays class="h-5 w-5" />
                <p class="text-sm font-bold uppercase tracking-widest">{{ eventItem.type }}</p>
              </div>
              <h2 class="mt-4 text-2xl font-bold text-ink">{{ formatEventDate(eventItem.date) }}</h2>
              <p class="mt-2 text-sm font-semibold text-ink/70">
                {{ eventItem.startTime }}{{ eventItem.endTime ? ` - ${eventItem.endTime}` : "" }}
              </p>
              <div class="mt-4 flex gap-3 text-sm leading-6 text-ink/60">
                <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                <p>{{ eventItem.address }}</p>
              </div>
              <a
                v-if="eventItem.googleMapsUrl"
                class="mt-5 inline-flex rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf"
                :href="eventItem.googleMapsUrl"
                target="_blank"
                rel="noreferrer"
              >
                Buka Maps
              </a>
              <a
                class="theme-calendar-action ml-2 mt-5 inline-flex items-center gap-2 rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf"
                :href="calendarDataUri(eventItem)"
                :download="calendarFileName(eventItem)"
              >
                <CalendarPlus class="h-4 w-4" />
                Tambah Kalender
              </a>
            </article>
          </div>
        </div>
      </section>

      <section
        v-if="loveStoryItems.length"
        id="theme-section-love-story"
        class="theme-reveal theme-love-story-section mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <p class="text-center text-sm font-bold uppercase tracking-widest text-gold">Cerita cinta</p>
        <div class="theme-love-story-grid mt-8 grid gap-4 md:grid-cols-2">
          <article
            v-for="(item, index) in loveStoryItems"
            :key="`${item.title}-${item.date}-${index}`"
            class="theme-section-panel theme-love-story-card rounded-lg border border-ink/10 bg-white p-6 shadow-soft"
          >
            <img
              v-if="item.photoUrl"
              :src="assetUrl(item.photoUrl)"
              alt="Foto cerita cinta"
              class="theme-love-story-photo mb-5 aspect-[4/3] w-full rounded-md object-cover"
            />
            <p class="text-sm font-bold text-leaf">{{ index + 1 }}</p>
            <h2 class="mt-3 text-2xl font-bold text-ink">{{ item.title }}</h2>
            <p v-if="item.date" class="mt-2 text-sm font-semibold text-gold">{{ storyDateLabel(item.date) }}</p>
            <p class="mt-4 whitespace-pre-line text-sm leading-7 text-ink/65">{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section
        v-if="showDressCode"
        id="theme-section-dress-code"
        class="theme-reveal theme-dress-code-section bg-white px-4 py-12"
      >
        <div class="theme-section-panel mx-auto max-w-3xl rounded-lg border border-ink/10 bg-linen p-6 text-center shadow-soft">
          <p class="text-sm font-bold uppercase tracking-widest text-gold">Dress code</p>
          <h2 class="mt-4 text-2xl font-bold text-ink">Warna yang disarankan</h2>
          <p v-if="dressCode.note" class="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink/65">{{ dressCode.note }}</p>
          <div class="theme-dress-code-swatches mt-6 flex flex-wrap justify-center gap-3">
            <span
              v-for="color in dressCode.colors"
              :key="color"
              class="theme-dress-code-swatch h-12 w-12 rounded-md border border-ink/10 shadow-soft"
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>
      </section>

      <section v-if="galleryUrls.length || demoGalleryCount" id="theme-section-gallery" class="theme-reveal theme-gallery-section mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <p class="text-center text-sm font-bold uppercase tracking-widest text-gold">Galeri</p>
        <div class="theme-gallery-grid mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <img
            v-for="url in galleryUrls"
            :key="url"
            :src="assetUrl(url)"
            alt="Galeri undangan"
            class="theme-gallery-item aspect-[4/3] w-full rounded-lg object-cover shadow-soft"
          />
          <div
            v-for="index in demoGalleryCount"
            :key="`demo-gallery-${index}`"
            class="theme-preview theme-gallery-item aspect-[4/3] rounded-lg shadow-soft"
            :class="selectedTheme.previewClass"
          />
        </div>
      </section>

      <section v-if="envelopeMethods.length" id="theme-section-gift" class="theme-reveal theme-envelope-section bg-white px-4 py-12">
        <div class="theme-section-panel mx-auto max-w-3xl rounded-lg border border-ink/10 bg-linen p-6 text-center shadow-soft">
          <Gift class="mx-auto h-8 w-8 text-rose" />
          <h2 class="mt-4 text-2xl font-bold text-ink">Amplop digital</h2>
          <div class="theme-envelope-grid mt-6 grid gap-3">
            <div
              v-for="method in envelopeMethods"
              :key="`${method.providerName}-${method.accountNumber}`"
              class="theme-envelope-card rounded-md border border-ink/10 bg-white p-4"
            >
              <p class="text-sm font-bold text-ink">{{ method.providerName }}</p>
              <p class="mt-1 text-lg font-bold text-leaf">{{ method.accountNumber }}</p>
              <p class="mt-1 text-sm text-ink/55">a.n. {{ method.accountHolder }}</p>
              <button
                class="focus-ring theme-copy-action mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/15 bg-white px-3 text-sm font-bold text-ink hover:border-leaf hover:text-leaf"
                type="button"
                @click="copyEnvelopeNumber(method)"
              >
                <Copy class="h-4 w-4" />
                {{ copiedEnvelopeKey === `${method.providerName}-${method.accountNumber}` ? "Tersalin" : "Salin Nomor" }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="theme-section-rsvp" class="theme-reveal theme-rsvp-section mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 class="text-2xl font-bold text-ink">RSVP dan ucapan</h2>
        <p v-if="!guest && !isDemo" class="mt-3 text-sm leading-6 text-ink/60">
          RSVP dan ucapan tersedia melalui link personal tamu.
        </p>
        <div v-else-if="!isDemo" class="mt-6 text-left">
          <section id="public-wish-form" class="theme-section-panel rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <p class="text-sm font-bold uppercase tracking-widest text-gold">Konfirmasi tamu</p>
            <h3 class="mt-3 text-xl font-bold text-ink">Kehadiran dan ucapan</h3>
            <p class="mt-2 text-sm leading-6 text-ink/60">
              Pilih konfirmasi kehadiran, lalu tulis ucapan singkat untuk pengantin.
            </p>
            <p class="mt-5 text-sm font-semibold text-ink">Konfirmasi kehadiran</p>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                class="focus-ring rounded-md border px-4 py-3 text-sm font-bold transition"
                :class="selectedRsvpStatus === 'attending' ? 'border-leaf bg-leaf text-white' : 'border-ink/15 bg-white text-ink hover:border-leaf'"
                type="button"
                :disabled="submitting"
                @click="emit('submit-rsvp', 'attending')"
              >
                Hadir
              </button>
              <button
                class="focus-ring rounded-md border px-4 py-3 text-sm font-bold transition"
                :class="selectedRsvpStatus === 'not_attending' ? 'border-rose bg-rose text-white' : 'border-ink/15 bg-white text-ink hover:border-rose'"
                type="button"
                :disabled="submitting"
                @click="emit('submit-rsvp', 'not_attending')"
              >
                Tidak Hadir
              </button>
            </div>

            <div class="my-5 border-t border-ink/10" />
            <p class="text-sm font-semibold text-ink">{{ editingWishId ? "Edit ucapan" : "Ucapan" }}</p>
            <form class="mt-4 space-y-4" @submit.prevent="emit('submit-wish')">
              <label class="block text-sm font-semibold text-ink">
                Nama
                <input
                  id="public-wish-name"
                  :value="wishForm.displayName"
                  class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                  @input="emit('update-wish-display-name', $event.target.value)"
                />
              </label>
              <label class="block text-sm font-semibold text-ink">
                Ucapan
                <textarea
                  id="public-wish-message"
                  :value="wishForm.message"
                  class="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
                  :class="isWishMessageTooLong ? 'border-rose' : ''"
                  :maxlength="maxWishMessageLength"
                  placeholder="Tulis doa dan ucapan"
                  @input="emit('update-wish-message', $event.target.value)"
                />
                <span
                  class="mt-1 flex justify-end text-xs font-semibold"
                  :class="isWishMessageTooLong ? 'text-rose' : 'text-ink/45'"
                >
                  {{ wishMessageLength }}/{{ maxWishMessageLength }}
                </span>
              </label>
              <div class="flex flex-col gap-3 sm:flex-row">
                <button
                  class="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink disabled:opacity-60"
                  type="submit"
                  :disabled="!canSubmitWish"
                >
                  <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
                  {{ editingWishId ? "Simpan Perubahan" : "Kirim Ucapan" }}
                </button>
                <button
                  v-if="editingWishId"
                  class="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf"
                  type="button"
                  :disabled="submitting"
                  @click="emit('cancel-edit-wish')"
                >
                  Batal Edit
                </button>
              </div>
            </form>
          </section>

          <p v-if="guestError" class="mt-4 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ guestError }}</p>
          <p v-if="guestMessage" class="mt-4 rounded-md bg-leaf/10 px-4 py-3 text-sm font-semibold text-leaf">{{ guestMessage }}</p>
        </div>
      </section>

      <section v-if="wishes.length" class="theme-reveal theme-wishes-section bg-white px-4 py-12">
        <div class="mx-auto max-w-3xl">
          <p class="text-center text-sm font-bold uppercase tracking-widest text-gold">Ucapan tamu</p>
          <div class="theme-wishes-grid mt-8 grid gap-3">
            <article v-for="wish in wishes" :key="wish.id || wish.name" class="theme-wish-card rounded-lg border border-ink/10 bg-linen p-5 shadow-soft">
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-bold text-ink">{{ wishName(wish) }}</p>
                <span class="rounded-full border px-2.5 py-1 text-xs font-bold" :class="rsvpStatusClass(wishStatus(wish))">
                  {{ rsvpStatusLabel(wishStatus(wish)) }}
                </span>
              </div>
              <p class="mt-2 text-sm leading-6 text-ink/65">{{ wishMessage(wish) }}</p>
              <button
                v-if="canEditWish(wish)"
                class="focus-ring mt-3 inline-flex rounded-md border border-ink/15 bg-white px-3 py-2 text-xs font-bold text-ink hover:border-leaf hover:text-leaf"
                type="button"
                @click="emit('start-edit-wish', wish)"
              >
                Edit ucapan
              </button>
            </article>
          </div>
        </div>
      </section>

      <footer class="theme-footer border-t border-ink/10 bg-white px-4 py-6 text-center text-sm text-ink/55">
        Dibuat dengan
        <RouterLink class="font-bold text-leaf hover:text-ink" to="/">Janji Nikah</RouterLink>
      </footer>

      <nav
        v-if="showStageNav"
        class="theme-stage-nav"
        aria-label="Navigasi undangan"
      >
        <button type="button" @click="scrollToSection('theme-section-opening')">
          <Heart class="h-4 w-4" />
          Opening
        </button>
        <button type="button" @click="scrollToSection('theme-section-events')">
          <CalendarDays class="h-4 w-4" />
          Acara
        </button>
        <button v-if="galleryUrls.length || demoGalleryCount" type="button" @click="scrollToSection('theme-section-gallery')">
          <Image class="h-4 w-4" />
          Galeri
        </button>
        <button type="button" @click="scrollToSection('theme-section-rsvp')">
          <MessageCircle class="h-4 w-4" />
          RSVP
        </button>
        <button v-if="envelopeMethods.length" type="button" @click="scrollToSection('theme-section-gift')">
          <Gift class="h-4 w-4" />
          Gift
        </button>
      </nav>
    </section>
  </div>
</template>
