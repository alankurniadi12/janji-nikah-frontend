<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ImagePlus, Loader2, Plus, Trash2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useCatalogStore } from "@/stores/catalog";
import { useInvitationStore } from "@/stores/invitations";
import { formatDate, photoIdFromUrl } from "@/utils/formatters";

const route = useRoute();
const router = useRouter();
const invitationStore = useInvitationStore();
const catalogStore = useCatalogStore();
const activeStep = ref("couple");
const error = ref("");
const success = ref("");

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
    parentsName: ""
  },
  bride: {
    fullName: "",
    parentsName: ""
  },
  events: [],
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

function syncForm(source) {
  form.title = source.title || "";
  form.slug = source.slug || "";
  form.groom.fullName = source.groom?.fullName || "";
  form.groom.parentsName = source.groom?.parentsName || "";
  form.bride.fullName = source.bride?.fullName || "";
  form.bride.parentsName = source.bride?.parentsName || "";
  form.events = (source.events || []).map((event) => ({
    type: event.type || "akad",
    date: toDateInput(event.date),
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    address: event.address || "",
    googleMapsUrl: event.googleMapsUrl || ""
  }));
  form.themeId = source.themeId || "";
  form.musicId = source.musicId || "";
  form.envelope.isEnabled = Boolean(source.envelope?.isEnabled);
  form.envelope.methods = (source.envelope?.methods || []).map((method) => ({
    type: method.type || "bank",
    providerName: method.providerName || "",
    accountNumber: method.accountNumber || "",
    accountHolder: method.accountHolder || ""
  }));
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

function buildPayload() {
  return {
    title: form.title,
    slug: form.slug,
    groom: { ...form.groom },
    bride: { ...form.bride },
    events: form.events.map((event) => ({ ...event })),
    themeId: form.themeId || null,
    musicId: form.musicId || null,
    envelope: {
      isEnabled: form.envelope.isEnabled,
      methods: form.envelope.isEnabled ? form.envelope.methods.map((method) => ({ ...method })) : []
    }
  };
}

async function saveInvitation() {
  error.value = "";
  success.value = "";

  try {
    const updated = await invitationStore.saveInvitation(route.params.id, buildPayload());
    syncForm(updated);
    success.value = "Undangan berhasil disimpan.";
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
  success.value = "";

  try {
    if (type === "main") {
      await invitationStore.replaceMainPhoto(route.params.id, file);
      success.value = "Foto utama berhasil diunggah.";
      return;
    }

    await invitationStore.addGalleryPhoto(route.params.id, file);
    success.value = "Foto galeri berhasil diunggah.";
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Foto belum bisa diunggah.");
  }
}

async function removeGallery(url) {
  error.value = "";
  success.value = "";

  try {
    await invitationStore.removeGalleryPhoto(route.params.id, photoIdFromUrl(url));
    success.value = "Foto galeri berhasil dihapus.";
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Foto galeri belum bisa dihapus.");
  }
}

async function openPreview() {
  error.value = "";
  success.value = "";

  try {
    const saved = await saveInvitation();
    if (!saved) {
      return;
    }
    router.push({ name: "member-invitation-preview", params: { id: route.params.id } });
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Preview belum bisa dibuka.");
  }
}
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Builder undangan</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">
          {{ form.title || "Draft undangan" }}
        </h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Isi data secara bertahap. Simpan draft tidak memakai kredit.
        </p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row">
        <AppButton to="/app/invitations" variant="secondary">Daftar Undangan</AppButton>
        <AppButton :disabled="invitationStore.saving || !isMainDataEditable" @click="saveInvitation">
          <Loader2 v-if="invitationStore.saving" class="h-4 w-4 animate-spin" />
          Simpan Draft
        </AppButton>
      </div>
    </div>

    <div v-if="invitationStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat builder...</p>
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
      <p v-if="success" class="mt-5 rounded-md bg-leaf/10 px-4 py-3 text-sm font-semibold text-leaf">{{ success }}</p>

      <form class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft" @submit.prevent="saveInvitation">
        <section v-if="activeStep === 'couple'" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-ink" for="title">Judul undangan</label>
            <input
              id="title"
              v-model.trim="form.title"
              class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
              :disabled="!isMainDataEditable"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-ink" for="slug">Slug undangan</label>
            <input
              id="slug"
              v-model.trim="form.slug"
              class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
              placeholder="andi-sari"
              :disabled="!isMainDataEditable"
            />
          </div>
          <div class="grid gap-5 md:grid-cols-2">
            <div class="rounded-md border border-ink/10 p-4">
              <h2 class="font-bold text-ink">Pengantin pria</h2>
              <label class="mt-4 block text-sm font-semibold text-ink" for="groomName">Nama lengkap</label>
              <input
                id="groomName"
                v-model.trim="form.groom.fullName"
                class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                :disabled="!isMainDataEditable"
              />
              <label class="mt-4 block text-sm font-semibold text-ink" for="groomParents">Nama orang tua</label>
              <input
                id="groomParents"
                v-model.trim="form.groom.parentsName"
                class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                :disabled="!isMainDataEditable"
              />
            </div>
            <div class="rounded-md border border-ink/10 p-4">
              <h2 class="font-bold text-ink">Pengantin wanita</h2>
              <label class="mt-4 block text-sm font-semibold text-ink" for="brideName">Nama lengkap</label>
              <input
                id="brideName"
                v-model.trim="form.bride.fullName"
                class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                :disabled="!isMainDataEditable"
              />
              <label class="mt-4 block text-sm font-semibold text-ink" for="brideParents">Nama orang tua</label>
              <input
                id="brideParents"
                v-model.trim="form.bride.parentsName"
                class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                :disabled="!isMainDataEditable"
              />
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
                  @click="removeEvent(index)"
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
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    :disabled="!isMainDataEditable"
                  />
                </label>
                <label class="block text-sm font-semibold text-ink">
                  Jam mulai
                  <input
                    v-model="eventItem.startTime"
                    type="time"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
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
                  class="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
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
          <p v-else class="rounded-md border border-dashed border-ink/20 p-5 text-sm font-semibold text-ink/60">
            Belum ada acara. Tambahkan akad atau resepsi.
          </p>
        </section>

        <section v-else-if="activeStep === 'photos'" class="space-y-6">
          <div>
            <h2 class="text-lg font-bold text-ink">Foto utama</h2>
            <p class="mt-1 text-sm text-ink/55">Foto utama wajib sebelum publish.</p>
            <div class="mt-4 grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
              <div class="aspect-[4/3] overflow-hidden rounded-md border border-ink/10 bg-linen">
                <img
                  v-if="invitation.mainPhotoUrl"
                  :src="invitation.mainPhotoUrl"
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
                <img :src="url" alt="Foto galeri undangan" class="aspect-[4/3] w-full object-cover" />
                <button
                  class="focus-ring flex w-full items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-rose hover:bg-rose/10"
                  type="button"
                  :disabled="!isMainDataEditable || invitationStore.uploading"
                  @click="removeGallery(url)"
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
          <select
            v-model="form.musicId"
            class="focus-ring h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
            :disabled="!isMainDataEditable"
          >
            <option value="">Tanpa musik</option>
            <option v-for="music in catalogStore.music" :key="music.id" :value="music.id">
              {{ music.title }}{{ music.category ? ` · ${music.category}` : "" }}
            </option>
          </select>
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
              class="focus-ring rounded-md border p-4 text-left transition hover:border-leaf"
              :class="form.themeId === theme.id ? 'border-leaf bg-mint/50' : 'border-ink/10 bg-white'"
              :disabled="!isMainDataEditable"
              @click="form.themeId = theme.id"
            >
              <div class="aspect-[4/3] rounded-md bg-linen">
                <img
                  v-if="theme.thumbnailUrl"
                  :src="theme.thumbnailUrl"
                  :alt="theme.name"
                  class="h-full w-full rounded-md object-cover"
                />
              </div>
              <p class="mt-3 text-sm font-bold text-ink">{{ theme.name }}</p>
              <p class="mt-1 text-xs text-ink/45">{{ theme.key }}</p>
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

          <div v-if="form.envelope.isEnabled" class="space-y-4">
            <div class="flex justify-end">
              <AppButton type="button" variant="secondary" :disabled="!isMainDataEditable" @click="addEnvelopeMethod">
                <Plus class="h-4 w-4" />
                Tambah Metode
              </AppButton>
            </div>
            <article v-for="(method, index) in form.envelope.methods" :key="index" class="rounded-md border border-ink/10 p-4">
              <div class="flex justify-between gap-3">
                <h3 class="font-bold text-ink">Metode {{ index + 1 }}</h3>
                <button
                  class="focus-ring rounded-md p-2 text-rose hover:bg-rose/10"
                  type="button"
                  :disabled="!isMainDataEditable"
                  @click="removeEnvelopeMethod(index)"
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
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    placeholder="BCA / DANA"
                    :disabled="!isMainDataEditable"
                  />
                </label>
                <label class="block text-sm font-semibold text-ink">
                  Nomor rekening/e-wallet
                  <input
                    v-model.trim="method.accountNumber"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    :disabled="!isMainDataEditable"
                  />
                </label>
                <label class="block text-sm font-semibold text-ink">
                  Nama pemilik
                  <input
                    v-model.trim="method.accountHolder"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    :disabled="!isMainDataEditable"
                  />
                </label>
              </div>
            </article>
          </div>
        </section>

        <section v-else-if="activeStep === 'preview'" class="space-y-4">
          <h2 class="text-lg font-bold text-ink">Preview undangan</h2>
          <p class="text-sm leading-6 text-ink/60">
            Preview tidak memakai kredit. Data draft akan disimpan sebelum preview dibuat.
          </p>
          <div class="rounded-md border border-ink/10 bg-linen p-4">
            <p class="text-sm font-semibold text-ink">Checklist sebelum publish fase berikutnya:</p>
            <ul class="mt-3 grid gap-2 text-sm text-ink/60">
              <li>Nama dan orang tua kedua pengantin lengkap.</li>
              <li>Minimal satu acara punya tanggal, jam mulai, dan alamat.</li>
              <li>Foto utama sudah diunggah.</li>
              <li>Tema dan musik dipilih jika tersedia.</li>
            </ul>
          </div>
          <AppButton type="button" :disabled="invitationStore.saving" @click="openPreview">
            <Loader2 v-if="invitationStore.saving" class="h-4 w-4 animate-spin" />
            Buka Preview
          </AppButton>
        </section>

        <div v-if="activeStep !== 'preview'" class="mt-6 flex justify-end">
          <AppButton type="submit" :disabled="invitationStore.saving || !isMainDataEditable">
            <Loader2 v-if="invitationStore.saving" class="h-4 w-4 animate-spin" />
            Simpan
          </AppButton>
        </div>
      </form>
    </template>
  </section>
</template>
