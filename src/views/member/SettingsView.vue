<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  LogOut,
  ShieldCheck,
  UserRound
} from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toasts";
import { formatDate, formatDateTime } from "@/utils/formatters";

const auth = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();
const activeTab = ref("account");
const error = ref("");
const form = reactive({
  username: auth.user?.username || ""
});

const tabs = [
  { value: "account", label: "Akun", icon: UserRound },
  { value: "username", label: "Username & Link", icon: ExternalLink },
  { value: "legal", label: "Legal", icon: ShieldCheck },
  { value: "session", label: "Sesi", icon: LogOut }
];

const publicBaseUrl = computed(() => window.location.origin);
const sampleInvitationUrl = computed(() => `${publicBaseUrl.value}/${displayUsername.value}/andi-sari`);
const displayUsername = computed(() => form.username.trim() || auth.user?.username || "username-member");
const savedUsername = computed(() => auth.user?.username || "");
const usernameChanged = computed(() => form.username.trim() !== savedUsername.value);
const usernameIsValid = computed(() => /^[a-z0-9-]{3,}$/.test(form.username.trim()));
const canSubmitUsername = computed(() => usernameChanged.value && usernameIsValid.value && canChangeUsername.value && !auth.loading);
const nextUsernameChangeAt = computed(() => {
  if (!auth.user?.lastUsernameChangedAt) {
    return null;
  }

  const nextDate = new Date(auth.user.lastUsernameChangedAt);
  nextDate.setDate(nextDate.getDate() + 30);

  return nextDate;
});
const canChangeUsername = computed(() => {
  if (!nextUsernameChangeAt.value) {
    return true;
  }

  return Date.now() >= nextUsernameChangeAt.value.getTime();
});
const usernameHelp = computed(() => {
  if (!form.username.trim()) {
    return "Username wajib diisi untuk link undangan.";
  }

  if (!usernameIsValid.value) {
    return "Gunakan minimal 3 karakter: huruf kecil, angka, dan tanda strip.";
  }

  if (!canChangeUsername.value) {
    return `Bisa diubah lagi mulai ${formatDate(nextUsernameChangeAt.value)}.`;
  }

  if (!usernameChanged.value) {
    return "Username ini sedang aktif.";
  }

  return "Username baru akan dipakai untuk link undangan berikutnya.";
});

watch(
  () => auth.user?.username,
  (username) => {
    form.username = username || "";
  }
);

async function saveUsername() {
  error.value = "";

  try {
    await auth.updateSettings({
      username: form.username.trim()
    });
    toastStore.show("Username berhasil disimpan.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Username belum bisa disimpan.");
  }
}

async function copySampleLink() {
  error.value = "";

  try {
    await navigator.clipboard.writeText(sampleInvitationUrl.value);
    toastStore.show("Contoh link berhasil disalin.");
  } catch {
    error.value = "Browser belum mengizinkan copy otomatis. Salin link secara manual.";
  }
}

async function logout() {
  await auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Pengaturan</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">Akun member</h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Kelola identitas akun, username link undangan, status legal, dan sesi login.
        </p>
      </div>
    </div>

    <div class="mt-8 rounded-lg border border-ink/10 bg-white p-2 shadow-soft">
      <div class="grid gap-2 sm:grid-cols-4">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="focus-ring flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition"
          :class="activeTab === tab.value ? 'bg-leaf text-white' : 'text-ink/65 hover:bg-mint hover:text-ink'"
          type="button"
          @click="activeTab = tab.value"
        >
          <component :is="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <p v-if="error || auth.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ error || auth.error }}
    </p>

    <section v-if="activeTab === 'account'" class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
        <img
          v-if="auth.user?.avatarUrl"
          :src="auth.user.avatarUrl"
          :alt="auth.user.name"
          class="h-20 w-20 rounded-full border border-ink/10 object-cover"
        />
        <div v-else class="flex h-20 w-20 items-center justify-center rounded-full bg-mint text-2xl font-bold text-leaf">
          {{ auth.user?.name?.slice(0, 1) || "J" }}
        </div>
        <div>
          <h2 class="text-xl font-bold text-ink">{{ auth.user?.name }}</h2>
          <p class="mt-1 text-sm text-ink/55">{{ auth.user?.email }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="rounded-md border border-leaf/15 bg-leaf/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-leaf">
              {{ auth.user?.role }}
            </span>
            <span class="rounded-md border border-ink/10 bg-linen px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink/70">
              {{ auth.user?.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div class="rounded-md border border-ink/10 bg-linen p-4">
          <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Sisa kredit</p>
          <p class="mt-2 text-2xl font-bold text-ink">{{ auth.user?.creditBalance || 0 }}</p>
        </div>
        <div class="rounded-md border border-ink/10 bg-linen p-4">
          <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Bergabung</p>
          <p class="mt-2 text-sm font-semibold text-ink">{{ formatDate(auth.user?.createdAt) }}</p>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'username'" class="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
      <form class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft" @submit.prevent="saveUsername">
        <h2 class="text-xl font-bold text-ink">Username member</h2>
        <p class="mt-2 text-sm leading-6 text-ink/60">
          Username dipakai sebagai bagian pertama pada link undangan milik member.
        </p>

        <div class="mt-5">
          <label class="block text-sm font-semibold text-ink" for="settings-username">Username</label>
          <input
            id="settings-username"
            v-model.trim="form.username"
            class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
            autocomplete="username"
            inputmode="text"
            pattern="[a-z0-9-]{3,}"
            placeholder="contoh: rio-undangan"
            required
          />
          <p class="mt-2 text-sm" :class="usernameIsValid && canChangeUsername ? 'text-ink/55' : 'text-rose'">
            {{ usernameHelp }}
          </p>
        </div>

        <div class="mt-5 rounded-md border border-gold/20 bg-gold/10 p-4">
          <div class="flex items-start gap-3">
            <Clock3 class="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <p class="text-sm leading-6 text-ink/70">
              Username bisa diubah maksimal 1 kali setiap 30 hari. Username lama tetap disimpan agar tidak dipakai member lain.
            </p>
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <AppButton type="submit" :disabled="!canSubmitUsername">
            <Loader2 v-if="auth.loading" class="h-4 w-4 animate-spin" />
            Simpan Username
          </AppButton>
          <AppButton type="button" variant="secondary" @click="form.username = savedUsername">
            Batalkan
          </AppButton>
        </div>
      </form>

      <aside class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 class="text-lg font-bold text-ink">Preview link</h2>
        <p class="mt-2 break-all rounded-md border border-ink/10 bg-linen p-3 text-sm font-semibold text-ink">
          {{ sampleInvitationUrl }}
        </p>
        <AppButton class="mt-4 w-full" type="button" variant="secondary" @click="copySampleLink">
          <Copy class="h-4 w-4" />
          Salin Contoh Link
        </AppButton>
      </aside>
    </section>

    <section v-if="activeTab === 'legal'" class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mint text-leaf">
          <CheckCircle2 class="h-5 w-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-ink">Status persetujuan</h2>
          <p class="mt-2 text-sm leading-6 text-ink/60">
            Disetujui pada {{ formatDateTime(auth.user?.termsAcceptedAt) }}.
          </p>
        </div>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div class="rounded-md border border-ink/10 bg-linen p-4">
          <p class="text-sm font-bold text-ink">Kredit non-refundable</p>
          <p class="mt-2 text-sm leading-6 text-ink/60">
            Kredit yang sudah dibeli atau dipakai publish tidak bisa dikembalikan.
          </p>
        </div>
        <div class="rounded-md border border-ink/10 bg-linen p-4">
          <p class="text-sm font-bold text-ink">Data undangan expired</p>
          <p class="mt-2 text-sm leading-6 text-ink/60">
            Undangan nonaktif 5 hari setelah tanggal acara terakhir dan data detail dibersihkan otomatis.
          </p>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'session'" class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-rose/10 text-rose">
          <AlertCircle class="h-5 w-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-ink">Sesi login</h2>
          <p class="mt-2 text-sm leading-6 text-ink/60">
            Akun ini masuk dengan Google. Janji Nikah tidak meminta atau menyimpan password member.
          </p>
        </div>
      </div>

      <div class="mt-6">
        <AppButton variant="secondary" type="button" @click="logout">
          <LogOut class="h-4 w-4" />
          Keluar dari Akun
        </AppButton>
      </div>
    </section>
  </section>
</template>
