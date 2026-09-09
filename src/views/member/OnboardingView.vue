<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { CheckCircle2, Loader2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();
const error = ref("");
const form = reactive({
  username: auth.user?.username || "",
  acceptTerms: false
});
const publicDomain = (import.meta.env.VITE_PUBLIC_DOMAIN || "janjinikah.com")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

const usernameHelp = computed(() => {
  if (!form.username) {
    return "Username akan dipakai pada link undangan.";
  }

  if (!/^[a-z0-9-]+$/.test(form.username)) {
    return "Gunakan huruf kecil, angka, dan tanda strip saja.";
  }

  if (form.username.length < 3) {
    return "Minimal 3 karakter.";
  }

  return `Link member: ${publicDomain}/${form.username}`;
});

async function submit() {
  error.value = "";

  try {
    await auth.completeOnboarding({
      username: form.username.trim(),
      acceptTerms: form.acceptTerms
    });
    router.push({ name: "member-dashboard" });
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Onboarding gagal disimpan.");
  }
}
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <div class="rounded-lg border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
      <div class="flex h-12 w-12 items-center justify-center rounded-md bg-mint text-leaf">
        <CheckCircle2 class="h-6 w-6" />
      </div>
      <p class="mt-5 text-sm font-bold uppercase tracking-widest text-gold">Onboarding member</p>
      <h1 class="mt-3 text-3xl font-bold text-ink">Selesaikan akun Janji Nikah</h1>
      <p class="mt-3 leading-7 text-ink/65">
        Cek username yang akan muncul di link undangan, lalu setujui syarat layanan sebelum masuk dashboard.
      </p>

      <form class="mt-8 space-y-6" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-semibold text-ink" for="username">Username member</label>
          <input
            id="username"
            v-model.trim="form.username"
            class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
            inputmode="text"
            autocomplete="username"
            placeholder="contoh: rio-undangan"
            required
            pattern="[a-z0-9-]{3,}"
          />
          <p class="mt-2 text-sm text-ink/55">{{ usernameHelp }}</p>
        </div>

        <label class="flex items-start gap-3 rounded-md border border-ink/10 bg-linen p-4">
          <input v-model="form.acceptTerms" type="checkbox" class="mt-1 h-4 w-4 rounded border-ink/20 text-leaf" />
          <span class="text-sm leading-6 text-ink/70">
            Saya menyetujui
            <RouterLink class="font-semibold text-leaf hover:text-ink" to="/syarat-ketentuan" target="_blank">Syarat & Ketentuan</RouterLink>
            serta
            <RouterLink class="font-semibold text-leaf hover:text-ink" to="/kebijakan-pengembalian-dana" target="_blank">Kebijakan Refund & Produk</RouterLink>,
            dan memahami bahwa kredit yang sudah dibeli atau dipakai untuk publish tidak bisa refund.
          </span>
        </label>

        <p v-if="error" class="rounded-md bg-rose/10 px-3 py-2 text-sm font-medium text-rose">{{ error }}</p>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AppButton type="submit" :disabled="auth.loading || !form.acceptTerms">
            <Loader2 v-if="auth.loading" class="h-4 w-4 animate-spin" />
            Simpan dan Masuk Dashboard
          </AppButton>
          <p class="text-sm text-ink/50">Username bisa diubah maksimal 1 kali per 30 hari.</p>
        </div>
      </form>
    </div>
  </section>
</template>
