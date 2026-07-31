<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ImagePlus, Loader2, Plus, Trash2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import ThemePreviewCard from "@/components/ThemePreviewCard.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useCatalogStore } from "@/stores/catalog";
import { useInvitationStore } from "@/stores/invitations";
import { useToastStore } from "@/stores/toasts";
import { assetUrl } from "@/utils/assets";
import { formatDate, photoIdFromUrl } from "@/utils/formatters";

const route = useRoute();
const auth = useAuthStore();
const invitationStore = useInvitationStore();
const catalogStore = useCatalogStore();
const toastStore = useToastStore();
const activeStep = ref("couple");
const error = ref("");
const showPublishConfirm = ref(false);
const showCreditEmpty = ref(false);
const savedSnapshot = ref("");
const pendingDelete = ref(null);
const validationErrors = reactive({});

const steps = [
  { key: "couple", label: "Pengantin" },
  { key: "events", label: "Acara" },
  { key: "photos", label: "Foto" },
  { key: "music", label: "Musik" },
  { key: "theme", label: "Tema" },
  { key: "envelope", label: "Amplop" },
  { key: "preview", label: "Preview" }
];

const form = reactive({
  title: "",
  slug: "",
  groom: {
    fullName: "",
    fatherName: "",
    motherName: ""
  },
  bride: {
    fullName: "",
    fatherName: "",
    motherName: ""
  },
  events: [],
  musicEnabled: false,
  themeId: "",
  musicId: "",
  envelope: {
    isEnabled: false,
    methods: []
  }
});

onMounted(async () => {
  const [invitation] = await Promise.all([
    invitationStore.loadInvitation(route.params.id),
    catalogStore.loadCatalog()
  ]);

  if (invitation) {
    syncForm(invitation);
  }
});

const invitation = computed(() => invitationStore.current);
const isMainDataEditable = computed(() =>
  ["draft", "active"].includes(invitation.value?.status)
);
const canAddGallery = computed(() => (invitation.value?.galleryPhotoUrls?.length || 0) < 5);
const publicPath = computed(() => {
  if (!auth.user?.username || !invitation.value?.slug) {
    return "";
  }

  return `/${auth.user.username}/${invitation.value.slug}`;
});
const displayTitle = computed(() => createInvitationTitle(form.groom.fullName, form.bride.fullName));
const currentSnapshot = computed(() => JSON.stringify(buildPayload()));
const hasUnsavedChanges = computed(() => currentSnapshot.value !== savedSnapshot.value);
const saveButtonText = computed(() => {
  if (invitationStore.saving) {
    return "Menyimpan...";
  }

  return hasUnsavedChanges.value ? "Simpan" : "Sudah Tersimpan";
});

watch(currentSnapshot, () => {
  if (Object.keys(validationErrors).length > 0) {
    clearValidationErrors();
    error.value = "";
  }
});

function syncForm(source) {
  form.title = source.title || "";
  form.slug = source.slug || "";
  form.groom.fullName = source.groom?.fullName || "";
  Object.assign(form.groom, splitParentsName(source.groom?.parentsName));
  form.bride.fullName = source.bride?.fullName || "";
  Object.assign(form.bride, splitParentsName(source.bride?.parentsName));
  form.events = (source.events || []).map((event) => ({
    type: event.type || "akad",
    date: toDateInput(event.date),
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    address: event.address || "",
    googleMapsUrl: event.googleMapsUrl || ""
  }));
  form.themeId = source.themeId || "";
  form.musicEnabled = Boolean(source.musicId);
  form.musicId = source.musicId || "";
  form.envelope.isEnabled = Boolean(source.envelope?.isEnabled);
  form.envelope.methods = (source.envelope?.methods || []).map((method) => ({
    type: method.type || "bank",
    providerName: method.providerName || "",
    accountNumber: method.accountNumber || "",
    accountHolder: method.accountHolder || ""
  }));
  savedSnapshot.value = currentSnapshot.value;
}

function toDateInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function addEvent(type = "akad") {
  form.events.push({
    type,
    date: "",
    startTime: "",
    endTime: "",
    address: "",
    googleMapsUrl: ""
  });
}

function removeEvent(index) {
  form.events.splice(index, 1);
}

function requestRemoveEvent(index) {
  pendingDelete.value = {
    type: "event",
    index,
    title: "Hapus acara?",
    message: "Apakah kamu yakin ingin menghapus data acara ini? Data acara akan hilang dari draft setelah undangan disimpan.",
    detail: `Acara ${index + 1}`,
    confirmLabel: "Ya, Hapus Acara"
  };
}

function addEnvelopeMethod() {
  form.envelope.methods.push({
    type: "bank",
    providerName: "",
    accountNumber: "",
    accountHolder: ""
  });
}

function removeEnvelopeMethod(index) {
  form.envelope.methods.splice(index, 1);
}

function requestRemoveEnvelopeMethod(index) {
  pendingDelete.value = {
    type: "envelope",
    index,
    title: "Hapus metode amplop?",
    message: "Apakah kamu yakin ingin menghapus metode amplop digital ini?",
    detail: form.envelope.methods[index]?.providerName || `Metode ${index + 1}`,
    confirmLabel: "Ya, Hapus Metode"
  };
}

function buildPayload() {
  const title = createInvitationTitle(form.groom.fullName, form.bride.fullName);

  return {
    title,
    slug: form.slug,
    groom: {
      fullName: form.groom.fullName,
      parentsName: joinParentsName(form.groom.fatherName, form.groom.motherName)
    },
    bride: {
      fullName: form.bride.fullName,
      parentsName: joinParentsName(form.bride.fatherName, form.bride.motherName)
    },
    events: form.events.map((event) => ({ ...event })),
    themeId: form.themeId || null,
    musicId: form.musicEnabled ? form.musicId || null : null,
    envelope: {
      isEnabled: form.envelope.isEnabled,
      methods: form.envelope.isEnabled ? form.envelope.methods.map((method) => ({ ...method })) : []
    }
  };
}

async function saveInvitation() {
  error.value = "";

  if (!validateStep(activeStep.value)) {
    return false;
  }

  if (!hasUnsavedChanges.value) {
    return true;
  }

  try {
    const updated = await invitationStore.saveInvitation(route.params.id, buildPayload());
    syncForm(updated);
    toastStore.show("Undangan berhasil disimpan.");
    return true;
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Undangan belum bisa disimpan.");
    return false;
  }
}

async function uploadMain(event) {
  await uploadPhoto(event, "main");
}

async function uploadGallery(event) {
  await uploadPhoto(event, "gallery");
}

async function uploadPhoto(event, type) {
  const file = event.target.files?.[0];
  event.target.value = "";

  if (!file) {
    return;
  }

  error.value = "";
  clearValidationErrors();

  try {
    if (type === "main") {
      await invitationStore.replaceMainPhoto(route.params.id, file);
      toastStore.show("Foto utama berhasil diunggah.");
      return;
    }

    await invitationStore.addGalleryPhoto(route.params.id, file);
    toastStore.show("Foto galeri berhasil diunggah.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Foto belum bisa diunggah.");
  }
}

async function removeGallery(url) {
  error.value = "";

  try {
    await invitationStore.removeGalleryPhoto(route.params.id, photoIdFromUrl(url));
    toastStore.show("Foto galeri berhasil dihapus.");
    pendingDelete.value = null;
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Foto galeri belum bisa dihapus.");
  }
}

function requestRemoveGallery(url) {
  pendingDelete.value = {
    type: "gallery",
    url,
    title: "Hapus foto galeri?",
    message: "Apakah kamu yakin ingin menghapus foto ini? Foto yang dihapus tidak bisa dikembalikan.",
    detail: "Foto galeri undangan",
    confirmLabel: "Ya, Hapus Foto"
  };
}

async function confirmDelete() {
  if (!pendingDelete.value) {
    return;
  }

  if (pendingDelete.value.type === "gallery") {
    await removeGallery(pendingDelete.value.url);
    return;
  }

  if (pendingDelete.value.type === "event") {
    removeEvent(pendingDelete.value.index);
    pendingDelete.value = null;
    return;
  }

  if (pendingDelete.value.type === "envelope") {
    removeEnvelopeMethod(pendingDelete.value.index);
    pendingDelete.value = null;
  }
}

async function openPreview() {
  error.value = "";

  if (!validateAllRequired()) {
    return;
  }

  const previewWindow = window.open("about:blank", "_blank");

  if (!previewWindow) {
    error.value = "Browser memblokir tab baru. Izinkan pop-up untuk membuka preview undangan.";
    return;
  }

  previewWindow.opener = null;

  try {
    const saved = await saveInvitation();
    if (!saved) {
      previewWindow.close();
      return;
    }

    const preview = await invitationStore.createPreview(route.params.id);
    if (!preview?.previewUrl) {
      previewWindow.close();
      error.value = "URL preview belum tersedia. Coba lagi sebentar.";
      return;
    }

    previewWindow.location.href = preview.previewUrl;
  } catch (requestError) {
    previewWindow.close();
    error.value = getApiErrorMessage(requestError, "Preview belum bisa dibuka.");
  }
}

function requestPublish() {
  error.value = "";

  if (!validateAllRequired()) {
    return;
  }

  if ((auth.user?.creditBalance || 0) <= 0) {
    showCreditEmpty.value = true;
    return;
  }

  showPublishConfirm.value = true;
}

async function publishDraft() {
  error.value = "";

  const liveWindow = window.open("about:blank", "_blank");

  if (!liveWindow) {
    error.value = "Browser memblokir tab baru. Izinkan pop-up untuk membuka undangan setelah publish.";
    return;
  }

  liveWindow.opener = null;

  try {
    const saved = await saveInvitation();
    if (!saved) {
      liveWindow.close();
      showPublishConfirm.value = false;
      return;
    }

    const published = await invitationStore.publish(route.params.id);
    await auth.hydrate(true);
    syncForm(published);
    showPublishConfirm.value = false;
    liveWindow.location.href = new URL(`/${auth.user.username}/${published.slug}`, window.location.origin).toString();
    toastStore.show("Undangan berhasil dipublish. Link live dibuka di tab baru.");
  } catch (requestError) {
    liveWindow.close();
    const status = requestError.response?.status;

    if (status === 402) {
      showPublishConfirm.value = false;
      showCreditEmpty.value = true;
      return;
    }

    error.value = getApiErrorMessage(requestError, "Undangan belum bisa dipublish.");
  }
}

function createInvitationTitle(groomName, brideName) {
  const groom = groomName?.trim();
  const bride = brideName?.trim();

  if (groom && bride) {
    return `${groom} & ${bride}`;
  }

  return groom || bride || "Draft undangan";
}

function splitParentsName(parentsName = "") {
  const result = { fatherName: "", motherName: "" };

  if (!parentsName) {
    return result;
  }

  const fatherMatch = parentsName.match(/Ayah:\s*([^\n]+)/i);
  const motherMatch = parentsName.match(/Ibu:\s*([^\n]+)/i);

  if (fatherMatch || motherMatch) {
    result.fatherName = fatherMatch?.[1]?.trim() || "";
    result.motherName = motherMatch?.[1]?.trim() || "";
    return result;
  }

  result.fatherName = parentsName;
  return result;
}

function joinParentsName(fatherName, motherName) {
  return [`Ayah: ${fatherName?.trim() || ""}`, `Ibu: ${motherName?.trim() || ""}`].join("\n");
}

function clearValidationErrors() {
  Object.keys(validationErrors).forEach((key) => {
    delete validationErrors[key];
  });
}

function addValidationError(key, message, step) {
  validationErrors[key] = { message, step };
}

function validateStep(step) {
  clearValidationErrors();
  const missing = collectValidationErrors({ onlyStep: step });

  if (missing.length > 0) {
    showValidationSummary(missing);
    return false;
  }

  return true;
}

function validateAllRequired() {
  clearValidationErrors();
  const missing = collectValidationErrors();

  if (missing.length > 0) {
    showValidationSummary(missing);
    return false;
  }

  return true;
}

function collectValidationErrors({ onlyStep = "" } = {}) {
  const missing = [];
  const add = (key, label, step) => {
    if (onlyStep && onlyStep !== step) {
      return;
    }

    missing.push(label);
    addValidationError(key, "Wajib diisi.", step);
  };

  if (!form.groom.fullName?.trim()) add("groom.fullName", "Nama lengkap pengantin pria", "couple");
  if (!form.groom.fatherName?.trim()) add("groom.fatherName", "Nama ayah pengantin pria", "couple");
  if (!form.groom.motherName?.trim()) add("groom.motherName", "Nama ibu pengantin pria", "couple");
  if (!form.bride.fullName?.trim()) add("bride.fullName", "Nama lengkap pengantin wanita", "couple");
  if (!form.bride.fatherName?.trim()) add("bride.fatherName", "Nama ayah pengantin wanita", "couple");
  if (!form.bride.motherName?.trim()) add("bride.motherName", "Nama ibu pengantin wanita", "couple");

  if (!form.events.length) {
    add("events", "Minimal satu acara", "events");
  }

  form.events.forEach((eventItem, index) => {
    const number = index + 1;
    if (!eventItem.type) add(`events.${index}.type`, `Jenis acara ${number}`, "events");
    if (!eventItem.date) add(`events.${index}.date`, `Tanggal acara ${number}`, "events");
    if (!eventItem.startTime) add(`events.${index}.startTime`, `Jam mulai acara ${number}`, "events");
    if (!eventItem.address?.trim()) add(`events.${index}.address`, `Alamat acara ${number}`, "events");
  });

  if (!invitation.value?.mainPhotoUrl) {
    add("mainPhotoUrl", "Foto utama", "photos");
  }

  if (form.envelope.isEnabled && form.envelope.methods.length === 0) {
    add("envelope.methods", "Minimal satu metode amplop digital", "envelope");
  }

  form.envelope.methods.forEach((method, index) => {
    const number = index + 1;
    if (!method.providerName?.trim()) add(`envelope.methods.${index}.providerName`, `Provider amplop ${number}`, "envelope");
    if (!method.accountNumber?.trim()) add(`envelope.methods.${index}.accountNumber`, `Nomor rekening/e-wallet ${number}`, "envelope");
    if (!method.accountHolder?.trim()) add(`envelope.methods.${index}.accountHolder`, `Nama pemilik amplop ${number}`, "envelope");
  });

  return missing;
}

function showValidationSummary(missing) {
  const firstError = Object.values(validationErrors)[0];
  if (firstError?.step) {
    activeStep.value = firstError.step;
  }

  error.value = `Lengkapi data wajib berikut: ${missing.join(", ")}.`;

  nextTick(() => {
    document.querySelector("[data-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function fieldClass(key) {
  return validationErrors[key] ? "border-rose bg-rose/5" : "border-ink/15";
}

function fieldError(key) {
  return validationErrors[key]?.message || "";
}

</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Edit undangan</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">
          {{ displayTitle }}
        </h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Isi data secara bertahap. Simpan draft tidak memakai kredit.
        </p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row">
        <AppButton
          v-if="invitation"
          :to="{ name: 'member-invitation-guests', params: { id: invitation.id } }"
        >
          Kelola Tamu
        </AppButton>
        <AppButton
          :disabled="invitationStore.saving || !isMainDataEditable || !hasUnsavedChanges"
          :variant="hasUnsavedChanges ? 'primary' : 'secondary'"
          @click="saveInvitation"
        >
          <Loader2 v-if="invitationStore.saving" class="h-4 w-4 animate-spin" />
          {{ saveButtonText }}
        </AppButton>
      </div>
    </div>

    <div v-if="invitationStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat data undangan...</p>
    </div>

    <p v-else-if="invitationStore.error && !invitation" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ invitationStore.error }}
    </p>

    <template v-else-if="invitation">
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <InvitationStatusBadge :status="invitation.status" />
        <span class="text-sm text-ink/55">/{{ form.slug }}</span>
        <span v-if="invitation.updatedAt" class="text-sm text-ink/55">Update {{ formatDate(invitation.updatedAt) }}</span>
      </div>

      <p v-if="!isMainDataEditable" class="mt-5 rounded-md bg-gold/10 px-4 py-3 text-sm font-semibold text-ink">
        Data utama undangan tidak bisa diedit pada status ini.
      </p>

      <nav class="mt-6 flex gap-2 overflow-x-auto rounded-lg border border-ink/10 bg-white p-2 shadow-soft">
        <button
          v-for="step in steps"
          :key="step.key"
          type="button"
          class="focus-ring min-w-max rounded-md px-3 py-2 text-sm font-bold transition"
          :class="activeStep === step.key ? 'bg-leaf text-white' : 'text-ink/60 hover:bg-mint hover:text-ink'"
          @click="activeStep = step.key"
        >
          {{ step.label }}
        </button>
      </nav>

      <p v-if="error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error }}</p>

      <form class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft" @submit.prevent="saveInvitation">
        <section v-if="activeStep === 'couple'" class="space-y-5">
          <p class="rounded-md bg-linen px-4 py-3 text-sm font-semibold text-ink/70">
            Judul undangan otomatis mengikuti nama pengantin: {{ displayTitle }}.
          </p>
          <div class="grid gap-5 md:grid-cols-2">
            <div class="rounded-md border border-ink/10 p-4">
              <h2 class="font-bold text-ink">Pengantin pria</h2>
              <label class="mt-4 block text-sm font-semibold text-ink" for="groomName">Nama lengkap</label>
              <input
                id="groomName"
                v-model.trim="form.groom.fullName"
                class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                :class="fieldClass('groom.fullName')"
                :data-invalid="Boolean(fieldError('groom.fullName'))"
                :disabled="!isMainDataEditable"
              />
              <p v-if="fieldError('groom.fullName')" class="mt-1 text-xs font-semibold text-rose">{{ fieldError("groom.fullName") }}</p>
              <label class="mt-4 block text-sm font-semibold text-ink" for="groomFather">Nama ayah</label>
              <input
                id="groomFather"
                v-model.trim="form.groom.fatherName"
                class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                :class="fieldClass('groom.fatherName')"
                :data-invalid="Boolean(fieldError('groom.fatherName'))"
                :disabled="!isMainDataEditable"
              />
              <p v-if="fieldError('groom.fatherName')" class="mt-1 text-xs font-semibold text-rose">{{ fieldError("groom.fatherName") }}</p>
              <label class="mt-4 block text-sm font-semibold text-ink" for="groomMother">Nama ibu</label>
              <input
                id="groomMother"
                v-model.trim="form.groom.motherName"
                class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                :class="fieldClass('groom.motherName')"
                :data-invalid="Boolean(fieldError('groom.motherName'))"
                :disabled="!isMainDataEditable"
              />
              <p v-if="fieldError('groom.motherName')" class="mt-1 text-xs font-semibold text-rose">{{ fieldError("groom.motherName") }}</p>
            </div>
            <div class="rounded-md border border-ink/10 p-4">
              <h2 class="font-bold text-ink">Pengantin wanita</h2>
              <label class="mt-4 block text-sm font-semibold text-ink" for="brideName">Nama lengkap</label>
              <input
                id="brideName"
                v-model.trim="form.bride.fullName"
                class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                :class="fieldClass('bride.fullName')"
                :data-invalid="Boolean(fieldError('bride.fullName'))"
                :disabled="!isMainDataEditable"
              />
              <p v-if="fieldError('bride.fullName')" class="mt-1 text-xs font-semibold text-rose">{{ fieldError("bride.fullName") }}</p>
              <label class="mt-4 block text-sm font-semibold text-ink" for="brideFather">Nama ayah</label>
              <input
                id="brideFather"
                v-model.trim="form.bride.fatherName"
                class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                :class="fieldClass('bride.fatherName')"
                :data-invalid="Boolean(fieldError('bride.fatherName'))"
                :disabled="!isMainDataEditable"
              />
              <p v-if="fieldError('bride.fatherName')" class="mt-1 text-xs font-semibold text-rose">{{ fieldError("bride.fatherName") }}</p>
              <label class="mt-4 block text-sm font-semibold text-ink" for="brideMother">Nama ibu</label>
              <input
                id="brideMother"
                v-model.trim="form.bride.motherName"
                class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                :class="fieldClass('bride.motherName')"
                :data-invalid="Boolean(fieldError('bride.motherName'))"
                :disabled="!isMainDataEditable"
              />
              <p v-if="fieldError('bride.motherName')" class="mt-1 text-xs font-semibold text-rose">{{ fieldError("bride.motherName") }}</p>
            </div>
          </div>
        </section>

        <section v-else-if="activeStep === 'events'" class="space-y-4">
          <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 class="text-lg font-bold text-ink">Data acara</h2>
              <p class="mt-1 text-sm text-ink/55">Minimal satu acara wajib sebelum publish.</p>
            </div>
            <div class="flex gap-2">
              <AppButton type="button" variant="secondary" :disabled="!isMainDataEditable" @click="addEvent('akad')">
                <Plus class="h-4 w-4" />
                Akad
              </AppButton>
              <AppButton type="button" variant="secondary" :disabled="!isMainDataEditable" @click="addEvent('resepsi')">
                <Plus class="h-4 w-4" />
                Resepsi
              </AppButton>
            </div>
          </div>

          <div v-if="form.events.length" class="space-y-4">
            <article v-for="(eventItem, index) in form.events" :key="index" class="rounded-md border border-ink/10 p-4">
              <div class="flex items-center justify-between gap-3">
                <h3 class="font-bold text-ink">Acara {{ index + 1 }}</h3>
                <button
                  class="focus-ring rounded-md p-2 text-rose hover:bg-rose/10"
                  type="button"
                  :disabled="!isMainDataEditable"
                  @click="requestRemoveEvent(index)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                <label class="block text-sm font-semibold text-ink">
                  Jenis acara
                  <select
                    v-model="eventItem.type"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    :disabled="!isMainDataEditable"
                  >
                    <option value="akad">Akad</option>
                    <option value="resepsi">Resepsi</option>
                  </select>
                </label>
                <label class="block text-sm font-semibold text-ink">
                  Tanggal
                  <input
                    v-model="eventItem.date"
                    type="date"
                    class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                    :class="fieldClass(`events.${index}.date`)"
                    :data-invalid="Boolean(fieldError(`events.${index}.date`))"
                    :disabled="!isMainDataEditable"
                  />
                </label>
                <label class="block text-sm font-semibold text-ink">
                  Jam mulai
                  <input
                    v-model="eventItem.startTime"
                    type="time"
                    class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                    :class="fieldClass(`events.${index}.startTime`)"
                    :data-invalid="Boolean(fieldError(`events.${index}.startTime`))"
                    :disabled="!isMainDataEditable"
                  />
                </label>
                <label class="block text-sm font-semibold text-ink">
                  Jam selesai
                  <input
                    v-model="eventItem.endTime"
                    type="time"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    :disabled="!isMainDataEditable"
                  />
                </label>
              </div>
              <label class="mt-4 block text-sm font-semibold text-ink">
                Alamat
                <textarea
                  v-model.trim="eventItem.address"
                  class="focus-ring mt-2 min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  :class="fieldClass(`events.${index}.address`)"
                  :data-invalid="Boolean(fieldError(`events.${index}.address`))"
                  :disabled="!isMainDataEditable"
                />
              </label>
              <label class="mt-4 block text-sm font-semibold text-ink">
                Link Google Maps
                <input
                  v-model.trim="eventItem.googleMapsUrl"
                  class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                  :disabled="!isMainDataEditable"
                />
              </label>
            </article>
          </div>
          <p
            v-else
            class="rounded-md border border-dashed p-5 text-sm font-semibold text-ink/60"
            :class="validationErrors.events ? 'border-rose bg-rose/5' : 'border-ink/20'"
            :data-invalid="Boolean(validationErrors.events)"
          >
            Belum ada acara. Tambahkan akad atau resepsi.
          </p>
        </section>

        <section v-else-if="activeStep === 'photos'" class="space-y-6">
          <div>
            <h2 class="text-lg font-bold text-ink">Foto utama</h2>
            <p class="mt-1 text-sm text-ink/55">Foto utama wajib sebelum publish.</p>
            <div class="mt-4 grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
              <div
                class="aspect-[4/3] overflow-hidden rounded-md border bg-linen"
                :class="validationErrors.mainPhotoUrl ? 'border-rose bg-rose/5' : 'border-ink/10'"
                :data-invalid="Boolean(validationErrors.mainPhotoUrl)"
              >
                <img
                  v-if="invitation.mainPhotoUrl"
                  :src="assetUrl(invitation.mainPhotoUrl)"
                  alt="Foto utama undangan"
                  class="h-full w-full object-cover"
                />
                <div v-else class="flex h-full items-center justify-center text-ink/35">
                  <ImagePlus class="h-8 w-8" />
                </div>
              </div>
              <label class="block">
                <span class="text-sm font-semibold text-ink">Upload / ganti foto utama</span>
                <input
                  class="focus-ring mt-2 block w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-mint file:px-3 file:py-2 file:text-sm file:font-semibold file:text-leaf"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  :disabled="!isMainDataEditable || invitationStore.uploading"
                  @change="uploadMain"
                />
                <p v-if="invitationStore.uploading" class="mt-2 text-sm font-semibold text-leaf">Mengunggah foto...</p>
                <p v-else-if="fieldError('mainPhotoUrl')" class="mt-2 text-sm font-semibold text-rose">{{ fieldError("mainPhotoUrl") }}</p>
              </label>
            </div>
          </div>

          <div>
            <h2 class="text-lg font-bold text-ink">Galeri</h2>
            <p class="mt-1 text-sm text-ink/55">Maksimal 5 foto galeri.</p>
            <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="url in invitation.galleryPhotoUrls"
                :key="url"
                class="overflow-hidden rounded-md border border-ink/10 bg-white"
              >
                <img :src="assetUrl(url)" alt="Foto galeri undangan" class="aspect-[4/3] w-full object-cover" />
                <button
                  class="focus-ring flex w-full items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-rose hover:bg-rose/10"
                  type="button"
                  :disabled="!isMainDataEditable || invitationStore.uploading"
                  @click="requestRemoveGallery(url)"
                >
                  <Trash2 class="h-4 w-4" />
                  Hapus
                </button>
              </div>
              <label
                v-if="canAddGallery"
                class="focus-ring flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-ink/20 bg-linen text-center text-sm font-semibold text-ink/55 hover:border-leaf hover:text-leaf"
              >
                <ImagePlus class="mb-2 h-7 w-7" />
                Tambah foto
                <input
                  class="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  :disabled="!isMainDataEditable || invitationStore.uploading"
                  @change="uploadGallery"
                />
              </label>
            </div>
          </div>
        </section>

        <section v-else-if="activeStep === 'music'" class="space-y-4">
          <h2 class="text-lg font-bold text-ink">Pilih musik</h2>
          <label class="flex items-start gap-3 rounded-md border border-ink/10 bg-linen p-4">
            <input
              v-model="form.musicEnabled"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-ink/20 text-leaf"
              :disabled="!isMainDataEditable"
            />
            <span>
              <span class="block text-sm font-bold text-ink">Aktifkan musik undangan</span>
              <span class="mt-1 block text-sm leading-6 text-ink/60">
                Musik optional. Jika tidak diaktifkan, undangan tampil tanpa tombol dan audio musik.
              </span>
            </span>
          </label>
          <div v-if="form.musicEnabled" class="space-y-2">
            <label class="block text-sm font-semibold text-ink" for="musicId">Lagu undangan</label>
            <select
              id="musicId"
              v-model="form.musicId"
              class="focus-ring h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
              :disabled="!isMainDataEditable"
            >
              <option value="">Pilih musik</option>
              <option v-for="music in catalogStore.music" :key="music.id" :value="music.id">
                {{ music.title }}{{ music.category ? ` · ${music.category}` : "" }}
              </option>
            </select>
          </div>
          <p v-else class="rounded-md bg-mint/60 px-3 py-2 text-sm font-semibold text-ink/70">
            Undangan akan tampil tanpa musik.
          </p>
          <p v-if="!catalogStore.music.length" class="rounded-md bg-gold/10 px-3 py-2 text-sm font-semibold text-ink">
            Belum ada musik aktif dari admin.
          </p>
        </section>

        <section v-else-if="activeStep === 'theme'" class="space-y-4">
          <h2 class="text-lg font-bold text-ink">Pilih tema</h2>
          <div class="grid gap-3 md:grid-cols-3">
            <button
              v-for="theme in catalogStore.themes"
              :key="theme.id"
              type="button"
              class="focus-ring rounded-md text-left transition hover:-translate-y-0.5 hover:shadow-soft"
              :disabled="!isMainDataEditable"
              @click="form.themeId = theme.id"
            >
              <ThemePreviewCard :theme="theme" :selected="form.themeId === theme.id" compact />
            </button>
          </div>
          <p v-if="!catalogStore.themes.length" class="rounded-md bg-gold/10 px-3 py-2 text-sm font-semibold text-ink">
            Belum ada tema aktif dari admin.
          </p>
        </section>

        <section v-else-if="activeStep === 'envelope'" class="space-y-5">
          <label class="flex items-start gap-3 rounded-md border border-ink/10 bg-linen p-4">
            <input
              v-model="form.envelope.isEnabled"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-ink/20 text-leaf"
              :disabled="!isMainDataEditable"
            />
            <span>
              <span class="block text-sm font-bold text-ink">Aktifkan amplop digital</span>
              <span class="mt-1 block text-sm leading-6 text-ink/60">
                Platform hanya menampilkan rekening/e-wallet, tidak memproses uang hadiah.
              </span>
            </span>
          </label>

          <div
            v-if="form.envelope.isEnabled"
            class="space-y-4"
            :data-invalid="Boolean(validationErrors['envelope.methods'])"
          >
            <div class="flex justify-end">
              <AppButton type="button" variant="secondary" :disabled="!isMainDataEditable" @click="addEnvelopeMethod">
                <Plus class="h-4 w-4" />
                Tambah Metode
              </AppButton>
            </div>
            <p v-if="fieldError('envelope.methods')" class="rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
              {{ fieldError("envelope.methods") }}
            </p>
            <article v-for="(method, index) in form.envelope.methods" :key="index" class="rounded-md border border-ink/10 p-4">
              <div class="flex justify-between gap-3">
                <h3 class="font-bold text-ink">Metode {{ index + 1 }}</h3>
                <button
                  class="focus-ring rounded-md p-2 text-rose hover:bg-rose/10"
                  type="button"
                  :disabled="!isMainDataEditable"
                  @click="requestRemoveEnvelopeMethod(index)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                <label class="block text-sm font-semibold text-ink">
                  Tipe
                  <select
                    v-model="method.type"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    :disabled="!isMainDataEditable"
                  >
                    <option value="bank">Bank</option>
                    <option value="ewallet">E-wallet</option>
                  </select>
                </label>
                <label class="block text-sm font-semibold text-ink">
                  Provider
                  <input
                    v-model.trim="method.providerName"
                    class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                    :class="fieldClass(`envelope.methods.${index}.providerName`)"
                    :data-invalid="Boolean(fieldError(`envelope.methods.${index}.providerName`))"
                    placeholder="BCA / DANA"
                    :disabled="!isMainDataEditable"
                  />
                </label>
                <label class="block text-sm font-semibold text-ink">
                  Nomor rekening/e-wallet
                  <input
                    v-model.trim="method.accountNumber"
                    class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                    :class="fieldClass(`envelope.methods.${index}.accountNumber`)"
                    :data-invalid="Boolean(fieldError(`envelope.methods.${index}.accountNumber`))"
                    :disabled="!isMainDataEditable"
                  />
                </label>
                <label class="block text-sm font-semibold text-ink">
                  Nama pemilik
                  <input
                    v-model.trim="method.accountHolder"
                    class="focus-ring mt-2 h-11 w-full rounded-md border px-3 text-sm"
                    :class="fieldClass(`envelope.methods.${index}.accountHolder`)"
                    :data-invalid="Boolean(fieldError(`envelope.methods.${index}.accountHolder`))"
                    :disabled="!isMainDataEditable"
                  />
                </label>
              </div>
            </article>
          </div>
        </section>

        <section v-else-if="activeStep === 'preview'" class="space-y-5">
          <div>
            <h2 class="text-lg font-bold text-ink">Cek undangan sebelum publish</h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
              Preview gratis dan tidak memakai kredit. Buka hasil undangan dulu, cek semua detail, lalu publish hanya kalau sudah yakin.
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <section class="rounded-md border border-leaf/20 bg-mint p-4">
              <p class="text-sm font-bold text-leaf">1. Lihat hasil undangan</p>
              <p class="mt-2 text-sm leading-6 text-ink/65">
                Draft akan disimpan, lalu hasil undangan dibuka di tab baru. Langkah ini aman karena belum mengurangi kredit.
              </p>
              <AppButton class="mt-4" type="button" :disabled="invitationStore.saving" @click="openPreview">
                <Loader2 v-if="invitationStore.saving" class="h-4 w-4 animate-spin" />
                Lihat Hasil Undangan
              </AppButton>
            </section>

            <section class="rounded-md border border-gold/30 bg-gold/10 p-4">
              <p class="text-sm font-bold text-ink">2. Publish saat sudah yakin</p>
              <p class="mt-2 text-sm leading-6 text-ink/65">
                Publish membuat link undangan aktif dan memakai 1 kredit. Kredit yang sudah dipakai tidak bisa dikembalikan.
              </p>
              <p class="mt-2 text-sm leading-6 text-ink/65">
                Setelah publish, data utama hanya bisa diedit selama 24 jam. Daftar tamu, status kirim, ucapan, dan amplop digital tetap bisa dikelola.
              </p>
              <div class="mt-4 flex flex-col gap-3 sm:flex-row">
                <AppButton v-if="invitation.status === 'draft'" type="button" :disabled="invitationStore.saving" @click="requestPublish">
                  <Loader2 v-if="invitationStore.saving" class="h-4 w-4 animate-spin" />
                  Publish dan Pakai 1 Kredit
                </AppButton>
                <AppButton
                  v-else-if="publicPath"
                  as="a"
                  :href="publicPath"
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary"
                >
                  Buka Undangan Publik
                </AppButton>
              </div>
            </section>
          </div>

          <div class="rounded-md border border-ink/10 bg-linen p-4">
            <p class="text-sm font-bold text-ink">Pastikan sebelum publish</p>
            <ul class="mt-3 grid gap-2 text-sm leading-6 text-ink/60">
              <li>Nama pengantin dan nama orang tua sudah benar, tidak ada typo.</li>
              <li>Tanggal, jam, alamat, dan link Google Maps acara sudah sesuai.</li>
              <li>Foto utama sudah tampil jelas di preview.</li>
              <li>Galeri, musik, dan amplop digital sudah sesuai kebutuhan. Musik dan amplop boleh dikosongkan.</li>
              <li>Saldo kredit cukup dan kamu siap memakai 1 kredit untuk undangan ini.</li>
            </ul>
          </div>
        </section>

        <div v-if="activeStep !== 'preview'" class="mt-6 flex justify-end">
          <AppButton
            type="submit"
            :disabled="invitationStore.saving || !isMainDataEditable || !hasUnsavedChanges"
            :variant="hasUnsavedChanges ? 'primary' : 'secondary'"
          >
            <Loader2 v-if="invitationStore.saving" class="h-4 w-4 animate-spin" />
            {{ saveButtonText }}
          </AppButton>
        </div>
      </form>
    </template>

    <div v-if="showPublishConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4">
      <section class="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <h2 class="text-xl font-bold text-ink">Yakin publish undangan?</h2>
        <p class="mt-3 text-sm leading-6 text-ink/65">
          Setelah kamu klik publish, sistem langsung memakai 1 kredit dan link undangan menjadi aktif. Kredit yang sudah dipakai tidak bisa dikembalikan.
        </p>
        <div class="mt-5 rounded-md bg-linen p-4 text-sm">
          <div class="flex justify-between gap-4">
            <span class="text-ink/55">Sisa kredit</span>
            <span class="font-bold text-ink">{{ auth.user?.creditBalance || 0 }}</span>
          </div>
          <div class="mt-3 flex justify-between gap-4 border-t border-ink/10 pt-3">
            <span class="text-ink/55">Dipakai untuk publish ini</span>
            <span class="font-bold text-rose">1 kredit</span>
          </div>
        </div>
        <p class="mt-4 text-sm leading-6 text-ink/65">
          Data utama masih bisa diedit selama 24 jam setelah publish. Pastikan nama, waktu acara, lokasi, dan foto sudah benar.
        </p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton type="button" variant="secondary" @click="showPublishConfirm = false">Batal</AppButton>
          <AppButton type="button" :disabled="invitationStore.saving" @click="publishDraft">
            <Loader2 v-if="invitationStore.saving" class="h-4 w-4 animate-spin" />
            Ya, Publish Sekarang
          </AppButton>
        </div>
      </section>
    </div>

    <div v-if="showCreditEmpty" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4">
      <section class="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <h2 class="text-xl font-bold text-ink">Kredit belum cukup</h2>
        <p class="mt-3 text-sm leading-6 text-ink/65">
          Publish undangan membutuhkan 1 kredit. Beli kredit dulu, lalu kembali ke draft ini untuk publish.
        </p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton type="button" variant="secondary" @click="showCreditEmpty = false">Tutup</AppButton>
          <AppButton to="/app/credits/buy">Beli Kredit</AppButton>
        </div>
      </section>
    </div>

    <ConfirmDialog
      :open="Boolean(pendingDelete)"
      :title="pendingDelete?.title || ''"
      :message="pendingDelete?.message || ''"
      :detail="pendingDelete?.detail || ''"
      :confirm-label="pendingDelete?.confirmLabel || 'Ya, Hapus'"
      :loading="invitationStore.uploading"
      @cancel="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </section>
</template>
