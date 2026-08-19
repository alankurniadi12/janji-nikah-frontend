<script setup>
import { CreditCard, Home, LogOut, Settings, Sparkles, Ticket, WalletCards } from "@lucide/vue";
import { useRouter } from "vue-router";

import AppButton from "@/components/AppButton.vue";
import BrandLogo from "@/components/BrandLogo.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();

const navigation = [
  { label: "Dashboard", to: "/app/dashboard", icon: Home, enabled: true },
  { label: "Undangan Saya", to: "/app/invitations", icon: Ticket, enabled: true },
  { label: "Beli Kredit", to: "/app/credits/buy", icon: CreditCard, enabled: true },
  { label: "Transaksi", to: "/app/transactions", icon: WalletCards, enabled: true },
  { label: "Branding", to: "/app/branding", icon: Sparkles, enabled: true },
  { label: "Pengaturan", to: "/app/settings", icon: Settings, enabled: true }
];

async function logout() {
  await auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <div class="page-shell">
    <header class="border-b border-ink/10 bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <RouterLink to="/app/dashboard" class="focus-ring rounded-md">
          <BrandLogo mode="compact" size="compact" />
        </RouterLink>
        <div class="flex items-center gap-3">
          <div class="hidden text-right sm:block">
            <p class="text-sm font-semibold text-ink">{{ auth.user?.name }}</p>
            <p class="text-xs text-ink/55">@{{ auth.user?.username }}</p>
          </div>
          <img
            v-if="auth.user?.avatarUrl"
            :src="auth.user.avatarUrl"
            :alt="auth.user.name"
            class="h-10 w-10 rounded-full border border-ink/10"
          />
          <AppButton variant="ghost" aria-label="Keluar" @click="logout">
            <LogOut class="h-4 w-4" />
          </AppButton>
        </div>
      </div>
    </header>

    <div class="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
      <aside class="rounded-lg border border-ink/10 bg-white p-3 shadow-soft lg:sticky lg:top-6 lg:h-fit">
        <nav class="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          <RouterLink
            v-for="item in navigation"
            :key="item.label"
            :to="item.enabled ? item.to : '/app/dashboard'"
            class="focus-ring flex min-w-max items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-mint/70 hover:text-ink"
            :class="{ 'pointer-events-none opacity-45': !item.enabled }"
          >
            <component :is="item.icon" class="h-4 w-4" />
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>
