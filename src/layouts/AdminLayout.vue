<script setup>
import { LogOut } from "@lucide/vue";
import { useRouter } from "vue-router";

import AppButton from "@/components/AppButton.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();

async function logout() {
  await auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <div class="page-shell">
    <header class="border-b border-ink/10 bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-gold">Admin</p>
          <h1 class="text-xl font-bold text-ink">Janji Nikah</h1>
        </div>
        <AppButton variant="ghost" @click="logout">
          <LogOut class="h-4 w-4" />
          Keluar
        </AppButton>
      </div>
    </header>
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>
