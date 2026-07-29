<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { KeyRound, Loader2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const googleButtonRef = ref(null);
const devIdToken = ref("");
const localError = ref("");
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const showDevLogin = import.meta.env.DEV && !googleClientId;
let scriptElement = null;

onMounted(() => {
  if (!googleClientId) {
    return;
  }

  if (window.google?.accounts?.id) {
    renderGoogleButton();
    return;
  }

  scriptElement = document.createElement("script");
  scriptElement.src = "https://accounts.google.com/gsi/client";
  scriptElement.async = true;
  scriptElement.defer = true;
  scriptElement.onload = renderGoogleButton;
  document.head.appendChild(scriptElement);
});

onBeforeUnmount(() => {
  if (scriptElement) {
    scriptElement.remove();
  }
});

function renderGoogleButton() {
  window.google.accounts.id.initialize({
    client_id: googleClientId,
    callback: (response) => handleCredential(response.credential)
  });
  window.google.accounts.id.renderButton(googleButtonRef.value, {
    theme: "outline",
    size: "large",
    width: 320,
    text: "continue_with"
  });
}

async function handleCredential(idToken) {
  localError.value = "";

  try {
    const user = await auth.loginWithGoogle(idToken);
    redirectAfterLogin(user);
  } catch {
    localError.value = auth.error;
  }
}

async function loginWithDevToken() {
  if (!devIdToken.value.trim()) {
    localError.value = "Masukkan Google ID token untuk pengujian lokal.";
    return;
  }

  await handleCredential(devIdToken.value.trim());
}

function redirectAfterLogin(user) {
  if (user.role === "admin") {
    router.push({ name: "admin-dashboard" });
    return;
  }

  if (user.onboardingRequired || !user.termsAcceptedAt) {
    router.push({ name: "member-onboarding" });
    return;
  }

  router.push(route.query.redirect?.toString() || { name: "member-dashboard" });
}
</script>

<template>
  <div class="page-shell grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
    <section class="flex flex-col justify-between bg-white px-6 py-6 sm:px-10">
      <RouterLink to="/" class="text-lg font-bold text-ink">Janji Nikah</RouterLink>
      <div class="py-12">
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Login member</p>
        <h1 class="mt-4 max-w-xl text-4xl font-bold leading-tight text-ink">Masuk dan lanjut kelola undangan klien.</h1>
        <p class="mt-4 max-w-lg leading-7 text-ink/65">
          Gunakan akun Google untuk masuk dengan cepat. Setelah login pertama, lengkapi username member dan setujui syarat layanan.
        </p>
      </div>
      <p class="text-sm text-ink/45">Draft dan preview tidak memakai kredit. Publish memakai 1 kredit.</p>
    </section>

    <main class="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section class="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <div class="flex h-12 w-12 items-center justify-center rounded-md bg-mint text-leaf">
          <KeyRound class="h-6 w-6" />
        </div>
        <h2 class="mt-5 text-2xl font-bold text-ink">Masuk / Daftar</h2>
        <p class="mt-2 text-sm leading-6 text-ink/60">
          Gunakan akun Google untuk membuat atau membuka akun Janji Nikah.
        </p>

        <div class="mt-6">
          <div v-if="googleClientId" ref="googleButtonRef" class="min-h-11" />
          <div v-else class="rounded-md border border-gold/30 bg-gold/10 p-4">
            <p class="text-sm font-semibold text-ink">Login Google sedang belum tersedia.</p>
            <p class="mt-1 text-sm leading-6 text-ink/60">
              Silakan coba lagi beberapa saat lagi atau hubungi admin Janji Nikah.
            </p>
          </div>
        </div>

        <form v-if="showDevLogin" class="mt-4 space-y-3" @submit.prevent="loginWithDevToken">
          <label class="block text-sm font-semibold text-ink" for="idToken">Google ID token</label>
          <textarea
            id="idToken"
            v-model="devIdToken"
            class="focus-ring min-h-28 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
            placeholder="Tempel ID token pengujian"
          />
          <AppButton type="submit" class="w-full" :disabled="auth.loading">
            <Loader2 v-if="auth.loading" class="h-4 w-4 animate-spin" />
            Masuk dengan Token
          </AppButton>
        </form>

        <p v-if="localError" class="mt-4 rounded-md bg-rose/10 px-3 py-2 text-sm font-medium text-rose">
          {{ localError }}
        </p>
      </section>
    </main>
  </div>
</template>
