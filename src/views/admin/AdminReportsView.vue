<script setup>
import { onMounted } from "vue";
import { Loader2 } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import StatCard from "@/components/StatCard.vue";
import { useAdminStore } from "@/stores/admin";
import { formatCurrency } from "@/utils/formatters";

const adminStore = useAdminStore();

onMounted(() => adminStore.loadReports());
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Laporan" title="Laporan operasional" description="Ringkasan revenue, kredit, dan penggunaan tema." />

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat laporan...</p>
    </div>

    <template v-else>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Transaksi sukses" :value="adminStore.reports.revenue?.successCount || 0" tone="leaf" />
        <StatCard label="Revenue" :value="formatCurrency(adminStore.reports.revenue?.totalRevenue || 0)" tone="gold" />
        <StatCard label="Kredit terjual" :value="adminStore.reports.revenue?.creditsSold || 0" tone="rose" />
        <StatCard label="Net kredit" :value="adminStore.reports.credits?.netChange || 0" tone="ink" />
      </div>

      <section class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 class="text-lg font-bold text-ink">Kredit</h2>
        <div class="mt-4 grid gap-4 md:grid-cols-3">
          <div class="rounded-md border border-ink/10 p-4">
            <p class="text-sm text-ink/55">Purchase</p>
            <p class="mt-2 text-2xl font-bold text-ink">{{ adminStore.reports.credits?.purchased.amount || 0 }}</p>
          </div>
          <div class="rounded-md border border-ink/10 p-4">
            <p class="text-sm text-ink/55">Publish used</p>
            <p class="mt-2 text-2xl font-bold text-ink">{{ adminStore.reports.credits?.used.amount || 0 }}</p>
          </div>
          <div class="rounded-md border border-ink/10 p-4">
            <p class="text-sm text-ink/55">Manual adjustment</p>
            <p class="mt-2 text-2xl font-bold text-ink">{{ adminStore.reports.credits?.manualAdjustment.amount || 0 }}</p>
          </div>
        </div>
      </section>

      <section class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 class="text-lg font-bold text-ink">Tema</h2>
        <div class="mt-4 divide-y divide-ink/10">
          <div v-for="theme in adminStore.reports.themes?.themes || []" :key="theme.themeId || theme.themeName" class="grid gap-3 py-3 md:grid-cols-[1fr_120px_120px_120px]">
            <p class="font-semibold text-ink">{{ theme.themeName }}</p>
            <p class="text-sm text-ink/60">Publish {{ theme.totalPublished }}</p>
            <p class="text-sm text-ink/60">Aktif {{ theme.active }}</p>
            <p class="text-sm text-ink/60">Expired {{ theme.expired }}</p>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>
