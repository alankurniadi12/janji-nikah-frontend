<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CalendarDays, Gift, Loader2, MapPin, Music2 } from "@lucide/vue";

import { getApiErrorMessage } from "@/lib/api";
import { getMusic } from "@/services/catalogService";
import {
  getPublicGuestInvitation,
  markPublicGuestOpened,
  submitPublicRsvp,
  submitPublicWish
} from "@/services/publicGuestService";
import { getPublicInvitation } from "@/services/publicInvitationService";
import { formatEventDate } from "@/utils/formatters";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref("");
const publicData = ref(null);
const music = ref([]);
const opened = ref(false);
const audioRef = ref(null);
const audioPlaying = ref(false);
const submitting = ref(false);
const guestMessage = ref("");
const guestError = ref("");
const wishForm = reactive({
  displayName: "",
  message: ""
});

onMounted(loadInvitation);

const invitation = computed(() => publicData.value?.invitation);
const isActive = computed(() => Boolean(publicData.value?.isActive));
const guest = computed(() => publicData.value?.guest || null);
const rsvp = computed(() => publicData.value?.rsvp || null);
const wishes = computed(() => publicData.value?.wishes || []);
const hasGuestToken = computed(() => Boolean(route.params.token));
const musicItem = computed(() => music.value.find((item) => item.id === invitation.value?.musicId));
const coupleNames = computed(() => {
  const groom = invitation.value?.groom?.fullName || invitation.value?.summary?.groomName || "Pengantin";
  const bride = invitation.value?.bride?.fullName || invitation.value?.summary?.brideName || "Pasangan";
  return `${groom} & ${bride}`;
});

async function loadInvitation() {
  loading.value = true;
  error.value = "";

  try {
    const detailRequest = hasGuestToken.value
      ? getPublicGuestInvitation(route.params.username, route.params.slug, route.params.token)
      : getPublicInvitation(route.params.username, route.params.slug);
    const [detail, activeMusic] = await Promise.all([
      detailRequest,
      getMusic().catch(() => [])
    ]);

    publicData.value = detail;
    music.value = activeMusic;
    wishForm.displayName = detail.guest?.name || "";

    if (detail.redirectUsername) {
      router.replace({
        name: route.name,
        params: {
          ...route.params,
          username: detail.redirectUsername
        },
        query: route.query
      });
    }
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Undangan tidak ditemukan.");
  } finally {
    loading.value = false;
  }
}

async function openInvitation() {
  opened.value = true;

  if (hasGuestToken.value) {
    try {
      publicData.value = await markPublicGuestOpened(route.params.username, route.params.slug, route.params.token);
      wishForm.displayName = publicData.value.guest?.name || "";
    } catch {
      // Opening should not block guests from reading the invitation.
    }
  }

  if (!audioRef.value) {
    return;
  }

  try {
    await audioRef.value.play();
    audioPlaying.value = true;
  } catch {
    audioPlaying.value = false;
  }
}

async function toggleMusic() {
  if (!audioRef.value) {
    return;
  }

  if (audioRef.value.paused) {
    await audioRef.value.play();
    audioPlaying.value = true;
    return;
  }

  audioRef.value.pause();
  audioPlaying.value = false;
}

async function submitRsvp(status) {
  guestError.value = "";
  guestMessage.value = "";
  submitting.value = true;

  try {
    const nextRsvp = await submitPublicRsvp(route.params.username, route.params.slug, route.params.token, status);
    publicData.value = {
      ...publicData.value,
      rsvp: nextRsvp
    };
    guestMessage.value = "RSVP berhasil disimpan.";
  } catch (requestError) {
    guestError.value = getApiErrorMessage(requestError, "RSVP belum bisa disimpan.");
  } finally {
    submitting.value = false;
  }
}

async function submitWish() {
  guestError.value = "";
  guestMessage.value = "";
  submitting.value = true;

  try {
    const wish = await submitPublicWish(route.params.username, route.params.slug, route.params.token, {
      displayName: wishForm.displayName,
      message: wishForm.message
    });
    publicData.value = {
      ...publicData.value,
      wishes: [wish, ...wishes.value]
    };
    wishForm.message = "";
    guestMessage.value = "Ucapan berhasil dikirim.";
  } catch (requestError) {
    guestError.value = getApiErrorMessage(requestError, "Ucapan belum bisa dikirim.");
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-linen text-ink">
    <div v-if="loading" class="flex min-h-screen items-center justify-center">
      <div class="flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <Loader2 class="h-5 w-5 animate-spin text-leaf" />
        <p class="text-sm font-semibold text-ink/70">Memuat undangan...</p>
      </div>
    </div>

    <main v-else-if="error" class="flex min-h-screen items-center justify-center px-4">
      <section class="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
        <h1 class="text-2xl font-bold text-ink">Undangan tidak ditemukan</h1>
        <p class="mt-3 text-sm leading-6 text-ink/60">{{ error }}</p>
        <RouterLink class="mt-5 inline-flex rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white" to="/">
          Kembali ke Janji Nikah
        </RouterLink>
      </section>
    </main>

    <main v-else-if="!isActive" class="flex min-h-screen items-center justify-center px-4">
      <section class="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Undangan tidak aktif</p>
        <h1 class="mt-3 text-2xl font-bold text-ink">{{ coupleNames }}</h1>
        <p class="mt-3 text-sm leading-6 text-ink/60">
          Undangan ini sudah expired atau tidak lagi aktif.
        </p>
      </section>
    </main>

    <template v-else>
      <audio
        v-if="musicItem?.fileUrl"
        ref="audioRef"
        :src="musicItem.fileUrl"
        loop
        @play="audioPlaying = true"
        @pause="audioPlaying = false"
      />

      <section v-if="!opened" class="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <img
          v-if="invitation.mainPhotoUrl"
          :src="invitation.mainPhotoUrl"
          alt="Cover undangan"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-ink/55" />
        <div class="relative z-10 mx-auto max-w-2xl text-center text-white">
          <p class="text-sm font-bold uppercase tracking-widest text-white/75">Undangan pernikahan</p>
          <p v-if="guest" class="mt-4 text-sm font-semibold text-white/80">Kepada {{ guest.name }}</p>
          <h1 class="mt-5 text-5xl font-bold leading-tight sm:text-6xl">{{ coupleNames }}</h1>
          <p v-if="invitation.events?.[0]" class="mt-5 text-lg text-white/80">
            {{ formatEventDate(invitation.events[0].date) }}
          </p>
          <button
            class="focus-ring mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-5 py-2 text-sm font-bold text-ink transition hover:bg-mint"
            type="button"
            @click="openInvitation"
          >
            Buka Undangan
          </button>
        </div>
      </section>

      <section v-else>
        <header class="relative overflow-hidden bg-ink px-4 py-20 text-center text-white">
          <img
            v-if="invitation.mainPhotoUrl"
            :src="invitation.mainPhotoUrl"
            alt="Foto utama"
            class="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div class="relative z-10 mx-auto max-w-3xl">
            <p class="text-sm font-bold uppercase tracking-widest text-white/70">The wedding of</p>
            <h1 class="mt-5 text-5xl font-bold leading-tight sm:text-6xl">{{ coupleNames }}</h1>
            <button
              v-if="musicItem?.fileUrl"
              class="focus-ring mt-8 inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20"
              type="button"
              @click="toggleMusic"
            >
              <Music2 class="h-4 w-4" />
              {{ audioPlaying ? "Pause musik" : "Play musik" }}
            </button>
          </div>
        </header>

        <section class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div class="grid gap-4 md:grid-cols-2">
            <article class="rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
              <p class="text-sm font-bold uppercase tracking-widest text-gold">Pengantin pria</p>
              <h2 class="mt-3 text-3xl font-bold text-ink">{{ invitation.groom.fullName }}</h2>
              <p class="mt-3 whitespace-pre-line text-sm leading-6 text-ink/60">{{ invitation.groom.parentsName }}</p>
            </article>
            <article class="rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
              <p class="text-sm font-bold uppercase tracking-widest text-gold">Pengantin wanita</p>
              <h2 class="mt-3 text-3xl font-bold text-ink">{{ invitation.bride.fullName }}</h2>
              <p class="mt-3 whitespace-pre-line text-sm leading-6 text-ink/60">{{ invitation.bride.parentsName }}</p>
            </article>
          </div>
        </section>

        <section class="bg-white px-4 py-12">
          <div class="mx-auto max-w-5xl">
            <p class="text-center text-sm font-bold uppercase tracking-widest text-gold">Detail acara</p>
            <div class="mt-8 grid gap-4 md:grid-cols-2">
              <article v-for="eventItem in invitation.events" :key="`${eventItem.type}-${eventItem.date}`" class="rounded-lg border border-ink/10 bg-linen p-6 shadow-soft">
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
              </article>
            </div>
          </div>
        </section>

        <section v-if="invitation.galleryPhotoUrls?.length" class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <p class="text-center text-sm font-bold uppercase tracking-widest text-gold">Galeri</p>
          <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <img
              v-for="url in invitation.galleryPhotoUrls"
              :key="url"
              :src="url"
              alt="Galeri undangan"
              class="aspect-[4/3] w-full rounded-lg object-cover shadow-soft"
            />
          </div>
        </section>

        <section v-if="invitation.envelope?.isEnabled" class="bg-white px-4 py-12">
          <div class="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-linen p-6 text-center shadow-soft">
            <Gift class="mx-auto h-8 w-8 text-rose" />
            <h2 class="mt-4 text-2xl font-bold text-ink">Amplop digital</h2>
            <div class="mt-6 grid gap-3">
              <div
                v-for="method in invitation.envelope.methods"
                :key="`${method.providerName}-${method.accountNumber}`"
                class="rounded-md border border-ink/10 bg-white p-4"
              >
                <p class="text-sm font-bold text-ink">{{ method.providerName }}</p>
                <p class="mt-1 text-lg font-bold text-leaf">{{ method.accountNumber }}</p>
                <p class="mt-1 text-sm text-ink/55">a.n. {{ method.accountHolder }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="mx-auto max-w-3xl px-4 py-12 text-center">
          <h2 class="text-2xl font-bold text-ink">RSVP dan ucapan</h2>
          <p v-if="!guest" class="mt-3 text-sm leading-6 text-ink/60">
            RSVP dan ucapan tersedia melalui link personal tamu.
          </p>
          <div v-else class="mt-6 space-y-6 text-left">
            <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <p class="text-sm font-bold uppercase tracking-widest text-gold">RSVP</p>
              <h3 class="mt-3 text-xl font-bold text-ink">Konfirmasi kehadiran</h3>
              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  class="focus-ring rounded-md border px-4 py-3 text-sm font-bold transition"
                  :class="rsvp?.status === 'attending' ? 'border-leaf bg-leaf text-white' : 'border-ink/15 bg-white text-ink hover:border-leaf'"
                  type="button"
                  :disabled="submitting"
                  @click="submitRsvp('attending')"
                >
                  Hadir
                </button>
                <button
                  class="focus-ring rounded-md border px-4 py-3 text-sm font-bold transition"
                  :class="rsvp?.status === 'not_attending' ? 'border-rose bg-rose text-white' : 'border-ink/15 bg-white text-ink hover:border-rose'"
                  type="button"
                  :disabled="submitting"
                  @click="submitRsvp('not_attending')"
                >
                  Tidak Hadir
                </button>
              </div>
            </section>

            <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <p class="text-sm font-bold uppercase tracking-widest text-gold">Ucapan</p>
              <form class="mt-4 space-y-4" @submit.prevent="submitWish">
                <label class="block text-sm font-semibold text-ink">
                  Nama
                  <input
                    v-model.trim="wishForm.displayName"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                  />
                </label>
                <label class="block text-sm font-semibold text-ink">
                  Ucapan
                  <textarea
                    v-model.trim="wishForm.message"
                    class="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
                    placeholder="Tulis doa dan ucapan"
                  />
                </label>
                <button
                  class="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink disabled:opacity-60"
                  type="submit"
                  :disabled="submitting"
                >
                  <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
                  Kirim Ucapan
                </button>
              </form>
            </section>

            <p v-if="guestError" class="rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ guestError }}</p>
            <p v-if="guestMessage" class="rounded-md bg-leaf/10 px-4 py-3 text-sm font-semibold text-leaf">{{ guestMessage }}</p>
          </div>
        </section>

        <section v-if="wishes.length" class="bg-white px-4 py-12">
          <div class="mx-auto max-w-3xl">
            <p class="text-center text-sm font-bold uppercase tracking-widest text-gold">Ucapan tamu</p>
            <div class="mt-8 grid gap-3">
              <article v-for="wish in wishes" :key="wish.id" class="rounded-lg border border-ink/10 bg-linen p-5 shadow-soft">
                <p class="font-bold text-ink">{{ wish.displayName }}</p>
                <p class="mt-2 text-sm leading-6 text-ink/65">{{ wish.message }}</p>
              </article>
            </div>
          </div>
        </section>

        <footer class="border-t border-ink/10 bg-white px-4 py-6 text-center text-sm text-ink/55">
          Dibuat dengan
          <RouterLink class="font-bold text-leaf hover:text-ink" to="/">Janji Nikah</RouterLink>
        </footer>
      </section>
    </template>
  </div>
</template>
