<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Loader2 } from "@lucide/vue";

import InvitationRenderer from "@/components/invitation/InvitationRenderer.vue";
import { getApiErrorMessage } from "@/lib/api";
import { getInvitationTheme } from "@/lib/invitationThemes";
import { getMusic } from "@/services/catalogService";
import {
  getPublicGuestInvitation,
  markPublicGuestOpened,
  submitPublicRsvp,
  submitPublicWish,
  updatePublicWish
} from "@/services/publicGuestService";
import { getPublicInvitation } from "@/services/publicInvitationService";
import { assetUrl } from "@/utils/assets";

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
const editingWishId = ref("");
const maxWishMessageLength = 150;
const wishForm = reactive({
  displayName: "",
  message: ""
});

onMounted(loadInvitation);

const invitation = computed(() => publicData.value?.invitation);
const isPreview = computed(() => Boolean(publicData.value?.isPreview));
const isActive = computed(() => Boolean(publicData.value?.isActive || publicData.value?.isPreview));
const guest = computed(() => publicData.value?.guest || null);
const rsvp = computed(() => publicData.value?.rsvp || null);
const selectedRsvpStatus = computed(() => rsvp.value?.status || "attending");
const wishes = computed(() => publicData.value?.wishes || []);
const hasGuestToken = computed(() => Boolean(route.params.token));
const musicItem = computed(() => music.value.find((item) => item.id === invitation.value?.musicId));
const selectedTheme = computed(() => getInvitationTheme(invitation.value?.theme?.key || invitation.value?.summary?.themeKey));
const wishMessageLength = computed(() => wishForm.message.length);
const isWishMessageTooLong = computed(() => wishMessageLength.value > maxWishMessageLength);
const canSubmitWish = computed(() =>
  Boolean(wishForm.displayName.trim() && wishForm.message.trim()) &&
  !isWishMessageTooLong.value &&
  !submitting.value
);
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
      : getPublicInvitation(route.params.username, route.params.slug, {
          preview: route.query.preview === "true" ? "true" : undefined
        });
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

  if (isWishMessageTooLong.value) {
    guestError.value = `Ucapan maksimal ${maxWishMessageLength} karakter.`;
    return;
  }

  submitting.value = true;

  try {
    const wasEditing = Boolean(editingWishId.value);
    const payload = {
      displayName: wishForm.displayName,
      message: wishForm.message,
      rsvpStatus: selectedRsvpStatus.value
    };
    const wish = editingWishId.value
      ? await updatePublicWish(route.params.username, route.params.slug, route.params.token, editingWishId.value, payload)
      : await submitPublicWish(route.params.username, route.params.slug, route.params.token, payload);
    const nextRsvp = {
      ...(rsvp.value || {}),
      status: wish.rsvpStatus,
      guestId: guest.value?.id,
      invitationId: invitation.value?.id
    };

    publicData.value = {
      ...publicData.value,
      rsvp: nextRsvp,
      wishes: editingWishId.value
        ? wishes.value.map((item) => (item.id === wish.id ? wish : item))
        : [wish, ...wishes.value]
    };
    editingWishId.value = "";
    wishForm.message = "";
    guestMessage.value = wasEditing ? "Ucapan berhasil diperbarui." : "Ucapan berhasil dikirim.";
  } catch (requestError) {
    guestError.value = getApiErrorMessage(requestError, "Ucapan belum bisa dikirim.");
  } finally {
    submitting.value = false;
  }
}

async function startEditWish(wish) {
  guestError.value = "";
  guestMessage.value = "";
  editingWishId.value = wish.id;
  wishForm.displayName = wish.displayName;
  wishForm.message = wish.message;
  publicData.value = {
    ...publicData.value,
    rsvp: {
      ...(rsvp.value || {}),
      status: wish.rsvpStatus || "attending",
      guestId: guest.value?.id,
      invitationId: invitation.value?.id
    }
  };
  await focusWishForm();
}

function cancelEditWish() {
  editingWishId.value = "";
  wishForm.displayName = guest.value?.name || "";
  wishForm.message = "";
}

async function focusWishForm() {
  await nextTick();
  document.getElementById("public-wish-form")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  window.setTimeout(() => {
    document.getElementById("public-wish-message")?.focus({ preventScroll: true });
  }, 350);
}
</script>

<template>
  <div>
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
        :src="assetUrl(musicItem.fileUrl)"
        loop
        @play="audioPlaying = true"
        @pause="audioPlaying = false"
      />

      <InvitationRenderer
        :invitation="invitation"
        :selected-theme="selectedTheme"
        :guest="guest"
        :wishes="wishes"
        :opened="opened"
        :is-preview="isPreview"
        :music-item="musicItem"
        :audio-playing="audioPlaying"
        :selected-rsvp-status="selectedRsvpStatus"
        :wish-form="wishForm"
        :wish-message-length="wishMessageLength"
        :max-wish-message-length="maxWishMessageLength"
        :is-wish-message-too-long="isWishMessageTooLong"
        :can-submit-wish="canSubmitWish"
        :submitting="submitting"
        :guest-error="guestError"
        :guest-message="guestMessage"
        :editing-wish-id="editingWishId"
        @open="openInvitation"
        @toggle-music="toggleMusic"
        @submit-rsvp="submitRsvp"
        @submit-wish="submitWish"
        @update-wish-display-name="wishForm.displayName = $event.trim()"
        @update-wish-message="wishForm.message = $event"
        @start-edit-wish="startEditWish"
        @cancel-edit-wish="cancelEditWish"
      />
    </template>
  </div>
</template>
