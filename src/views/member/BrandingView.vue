<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Check, Copy, Download, Image, Loader2, MessageCircle, Sparkles } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useBrandingStore } from "@/stores/branding";
import { useToastStore } from "@/stores/toasts";
import { assetUrl } from "@/utils/assets";
import { formatDate } from "@/utils/formatters";

const brandingStore = useBrandingStore();
const toastStore = useToastStore();
const error = ref("");

const profileForm = reactive({
  businessName: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  whatsapp: "",
  selectedTemplate: "elegant"
});

const generatorForm = reactive({
  headline: "Undangan Digital Pernikahan",
  subheadline: "Cantik, praktis, dan siap dibagikan ke semua tamu.",
  offer: "Undangan digital elegan untuk hari bahagiamu.",
  cta: "Yuk buat undangan yang rapi, cantik, dan mudah dibagikan."
});

const templateOptions = [
  {
    value: "elegant",
    label: "Elegant",
    description: "Hangat, lembut, cocok untuk gaya romantis."
  },
  {
    value: "modern",
    label: "Modern",
    description: "Bersih, tegas, cocok untuk promosi profesional."
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Netral, simpel, fokus pada teks utama."
  }
];

onMounted(async () => {
  const profile = await brandingStore.loadProfile();

  if (profile) {
    syncForm(profile);
  }
});

const assets = computed(() => brandingStore.assets || brandingStore.profile?.promoAssets || null);
const warnings = computed(() => brandingStore.profile?.warnings || []);
const hasAssets = computed(() => Boolean(assets.value?.squareImageUrl || assets.value?.storyImageUrl || assets.value?.caption));

function syncForm(profile) {
  Object.assign(profileForm, {
    businessName: profile.businessName || "",
    instagram: profile.instagram || "",
    facebook: profile.facebook || "",
    tiktok: profile.tiktok || "",
    whatsapp: profile.whatsapp || "",
    selectedTemplate: profile.selectedTemplate || "elegant"
  });
}

async function saveProfile() {
  error.value = "";

  try {
    const profile = await brandingStore.saveProfile(profileForm);
    syncForm(profile);
    toastStore.show("Profil branding berhasil disimpan.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Profil branding belum bisa disimpan.");
  }
}

async function generateAssets() {
  error.value = "";

  try {
    const profile = await brandingStore.saveProfile(profileForm);
    syncForm(profile);
    await brandingStore.generate(generatorForm);
    toastStore.show("Materi promosi berhasil dibuat.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Materi branding belum bisa dibuat.");
  }
}

async function copyCaption() {
  error.value = "";

  try {
    await navigator.clipboard.writeText(assets.value?.caption || "");
    toastStore.show("Caption berhasil disalin.");
  } catch {
    error.value = "Browser belum mengizinkan copy otomatis. Salin caption secara manual.";
  }
}
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Branding</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">Generator materi promosi</h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Simpan identitas usaha, buat gambar promosi ukuran feed dan story, lalu salin caption untuk dipakai di media sosial.
        </p>
      </div>
      <AppButton to="/app/invitations" variant="secondary">Undangan Saya</AppButton>
    </div>

    <div v-if="brandingStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat profil branding...</p>
    </div>

    <template v-else>
      <p v-if="error || brandingStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
        {{ error || brandingStore.error }}
      </p>
      <p
        v-for="warning in warnings"
        :key="warning.code"
        class="mt-5 rounded-md bg-gold/10 px-4 py-3 text-sm font-semibold text-ink"
      >
        {{ warning.message }}
      </p>

      <div class="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside class="space-y-6">
          <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
                <Sparkles class="h-5 w-5" />
              </div>
              <h2 class="text-lg font-bold text-ink">Profil usaha</h2>
            </div>

            <form class="mt-5 space-y-4" @submit.prevent="saveProfile">
              <div>
                <label class="block text-sm font-semibold text-ink" for="businessName">Nama usaha/jasa</label>
                <input
                  id="businessName"
                  v-model.trim="profileForm.businessName"
                  class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                  maxlength="80"
                  placeholder="Contoh: Rio Wedding Digital"
                  required
                />
              </div>

              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <label class="block text-sm font-semibold text-ink" for="instagram">Instagram</label>
                  <input
                    id="instagram"
                    v-model.trim="profileForm.instagram"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    placeholder="@namabisnis"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-ink" for="whatsapp">WhatsApp</label>
                  <input
                    id="whatsapp"
                    v-model.trim="profileForm.whatsapp"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    placeholder="0812 3456 7890"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-ink" for="facebook">Facebook</label>
                  <input
                    id="facebook"
                    v-model.trim="profileForm.facebook"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    placeholder="Nama halaman"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-ink" for="tiktok">TikTok</label>
                  <input
                    id="tiktok"
                    v-model.trim="profileForm.tiktok"
                    class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                    placeholder="@namabisnis"
                  />
                </div>
              </div>

              <div>
                <p class="block text-sm font-semibold text-ink">Template</p>
                <div class="mt-2 grid gap-2">
                  <button
                    v-for="template in templateOptions"
                    :key="template.value"
                    type="button"
                    class="focus-ring rounded-md border p-3 text-left transition hover:border-leaf"
                    :class="profileForm.selectedTemplate === template.value ? 'border-leaf bg-mint/45' : 'border-ink/10 bg-white'"
                    @click="profileForm.selectedTemplate = template.value"
                  >
                    <span class="flex items-start justify-between gap-3">
                      <span>
                        <span class="block text-sm font-bold text-ink">{{ template.label }}</span>
                        <span class="mt-1 block text-xs leading-5 text-ink/55">{{ template.description }}</span>
                      </span>
                      <Check v-if="profileForm.selectedTemplate === template.value" class="h-4 w-4 text-leaf" />
                    </span>
                  </button>
                </div>
              </div>

              <AppButton class="w-full" type="submit" :disabled="brandingStore.saving">
                <Loader2 v-if="brandingStore.saving" class="h-4 w-4 animate-spin" />
                Simpan Profil
              </AppButton>
            </form>
          </section>

          <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <h2 class="text-lg font-bold text-ink">Teks promosi</h2>
            <form class="mt-5 space-y-4" @submit.prevent="generateAssets">
              <div>
                <label class="block text-sm font-semibold text-ink" for="headline">Headline gambar</label>
                <input
                  id="headline"
                  v-model.trim="generatorForm.headline"
                  class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
                  maxlength="80"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-ink" for="subheadline">Subheadline gambar</label>
                <textarea
                  id="subheadline"
                  v-model.trim="generatorForm.subheadline"
                  class="focus-ring mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
                  maxlength="130"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-ink" for="offer">Kalimat pembuka caption</label>
                <textarea
                  id="offer"
                  v-model.trim="generatorForm.offer"
                  class="focus-ring mt-2 min-h-20 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
                  maxlength="160"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-ink" for="cta">CTA caption</label>
                <textarea
                  id="cta"
                  v-model.trim="generatorForm.cta"
                  class="focus-ring mt-2 min-h-20 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
                  maxlength="160"
                />
              </div>

              <AppButton class="w-full" type="submit" :disabled="brandingStore.saving || brandingStore.generating">
                <Loader2 v-if="brandingStore.saving || brandingStore.generating" class="h-4 w-4 animate-spin" />
                Generate Materi
              </AppButton>
            </form>
          </section>
        </aside>

        <section class="space-y-6">
          <div class="grid gap-6 lg:grid-cols-2">
            <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-bold uppercase tracking-widest text-gold">Feed</p>
                  <h2 class="mt-1 text-lg font-bold text-ink">Gambar 1:1</h2>
                </div>
                <a
                  v-if="assets?.squareImageUrl"
                  :href="assetUrl(assets.squareImageUrl)"
                  class="focus-ring rounded-md p-2 text-ink/60 hover:bg-mint hover:text-leaf"
                  target="_blank"
                  rel="noreferrer"
                  title="Buka gambar 1:1"
                >
                  <Download class="h-4 w-4" />
                </a>
              </div>
              <div class="mt-4 overflow-hidden rounded-md border border-ink/10 bg-linen">
                <img
                  v-if="assets?.squareImageUrl"
                  :src="assetUrl(assets.squareImageUrl)"
                  alt="Gambar promosi 1:1"
                  class="aspect-square w-full object-cover"
                />
                <div v-else class="flex aspect-square items-center justify-center">
                  <div class="text-center text-ink/45">
                    <Image class="mx-auto h-8 w-8" />
                    <p class="mt-3 text-sm font-semibold">Belum digenerate</p>
                  </div>
                </div>
              </div>
            </article>

            <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-bold uppercase tracking-widest text-gold">Story</p>
                  <h2 class="mt-1 text-lg font-bold text-ink">Gambar 9:16</h2>
                </div>
                <a
                  v-if="assets?.storyImageUrl"
                  :href="assetUrl(assets.storyImageUrl)"
                  class="focus-ring rounded-md p-2 text-ink/60 hover:bg-mint hover:text-leaf"
                  target="_blank"
                  rel="noreferrer"
                  title="Buka gambar 9:16"
                >
                  <Download class="h-4 w-4" />
                </a>
              </div>
              <div class="mt-4 overflow-hidden rounded-md border border-ink/10 bg-linen">
                <img
                  v-if="assets?.storyImageUrl"
                  :src="assetUrl(assets.storyImageUrl)"
                  alt="Gambar promosi 9:16"
                  class="mx-auto aspect-[9/16] max-h-[620px] w-full object-cover sm:w-auto"
                />
                <div v-else class="flex aspect-[9/16] max-h-[620px] items-center justify-center">
                  <div class="text-center text-ink/45">
                    <Image class="mx-auto h-8 w-8" />
                    <p class="mt-3 text-sm font-semibold">Belum digenerate</p>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <section class="rounded-lg border border-ink/10 bg-white shadow-soft">
            <div class="flex flex-col justify-between gap-3 border-b border-ink/10 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 class="text-lg font-bold text-ink">Caption</h2>
                <p v-if="assets?.generatedAt" class="mt-1 text-xs text-ink/45">
                  Terakhir dibuat {{ formatDate(assets.generatedAt) }}
                </p>
              </div>
              <button
                class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="!assets?.caption"
                @click="copyCaption"
              >
                <Copy class="h-4 w-4" />
                Copy Caption
              </button>
            </div>

            <div v-if="assets?.caption" class="p-5">
              <pre class="whitespace-pre-wrap rounded-md bg-linen p-4 text-sm leading-6 text-ink/75">{{ assets.caption }}</pre>
            </div>
            <div v-else class="p-8 text-center">
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-mint text-leaf">
                <MessageCircle class="h-6 w-6" />
              </div>
              <h2 class="mt-4 text-xl font-bold text-ink">Belum ada caption</h2>
              <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
                Isi profil usaha dan klik generate materi untuk membuat caption promosi pertama.
              </p>
            </div>
          </section>

          <section v-if="!hasAssets" class="rounded-lg border border-gold/25 bg-gold/10 p-5">
            <p class="text-sm font-semibold leading-6 text-ink">
              Simpan profil terlebih dahulu jika hanya ingin cek nama usaha. Tombol generate akan menyimpan profil dan membuat asset sekaligus.
            </p>
          </section>
        </section>
      </div>
    </template>
  </section>
</template>
