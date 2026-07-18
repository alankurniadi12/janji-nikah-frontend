<script setup>
import { onMounted } from "vue";
import { Loader2 } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import StatCard from "@/components/StatCard.vue";
import { useAdminStore } from "@/stores/admin";

const adminStore = useAdminStore();

onMounted(() => {
  adminStore.loadDashboard();
});
</script>

<template>
  <section>
    <AdminPageHeader
      eyebrow="Dashboard admin"
      title="Operasional Janji Nikah"
      description="Pantau pembayaran, member, undangan, dan notifikasi admin."
    />

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat dashboard...</p>
    </div>

    <div v-else-if="adminStore.dashboard" class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Member aktif" :value="adminStore.dashboard.members.active" tone="leaf" />
      <StatCard label="Verifikasi pembayaran" :value="adminStore.dashboard.transactions.waitingVerification" tone="gold" />
      <StatCard label="Undangan aktif" :value="adminStore.dashboard.invitations.active" tone="rose" />
      <StatCard label="Notifikasi belum dibaca" :value="adminStore.dashboard.notifications.unread" tone="ink" />
    </div>
  </section>
</template>
