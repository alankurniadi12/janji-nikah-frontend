<script setup>
import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Music,
  Palette,
  Users
} from "@lucide/vue";
import { useRouter } from "vue-router";

import AppButton from "@/components/AppButton.vue";
import BrandLogo from "@/components/BrandLogo.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();
const navigation = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Verifikasi Pembayaran", to: "/admin/payments", icon: CreditCard },
  { label: "Member", to: "/admin/members", icon: Users },
  { label: "Undangan", to: "/admin/invitations", icon: FileText },
  { label: "Paket Kredit", to: "/admin/credit-packages", icon: Boxes },
  { label: "Tema", to: "/admin/themes", icon: Palette },
  { label: "Musik", to: "/admin/music", icon: Music },
  { label: "Laporan", to: "/admin/reports", icon: BarChart3 },
  { label: "Audit Log", to: "/admin/audit-logs", icon: ClipboardList }
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
        <div class="flex items-center gap-3">
          <BrandLogo mode="mark" size="compact" />
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-gold">Admin</p>
            <h1 class="text-xl font-bold text-ink">Janji Nikah</h1>
          </div>
        </div>
        <AppButton variant="ghost" @click="logout">
          <LogOut class="h-4 w-4" />
          Keluar
        </AppButton>
      </div>
    </header>
    <div class="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
      <aside class="rounded-lg border border-ink/10 bg-white p-3 shadow-soft lg:sticky lg:top-6 lg:h-fit">
        <nav class="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          <RouterLink
            v-for="item in navigation"
            :key="item.label"
            :to="item.to"
            class="focus-ring flex min-w-max items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-mint/70 hover:text-ink"
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
