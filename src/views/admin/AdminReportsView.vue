<script setup>
import { computed, onMounted, reactive } from "vue";
import { BarChart3, CalendarDays, Loader2, RefreshCw } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import StatCard from "@/components/StatCard.vue";
import { useAdminStore } from "@/stores/admin";
import { formatCurrency } from "@/utils/formatters";

const adminStore = useAdminStore();
const filters = reactive({
  startDate: "",
  endDate: ""
});

onMounted(loadReports);

const revenue = computed(() => adminStore.reports.revenue || {});
const credits = computed(() => adminStore.reports.credits || {});
const themes = computed(() => adminStore.reports.themes?.themes || []);
const creditRows = computed(() => [
  {
    label: "Kredit dibeli",
    count: credits.value.purchased?.count || 0,
    amount: credits.value.purchased?.amount || 0,
    tone: "text-leaf"
  },
  {
    label: "Kredit dipakai publish",
    count: credits.value.used?.count || 0,
    amount: Math.abs(credits.value.used?.amount || 0),
    tone: "text-rose"
  },
  {
    label: "Manual adjustment",
    count: credits.value.manualAdjustment?.count || 0,
    amount: credits.value.manualAdjustment?.amount || 0,
    tone: "text-gold"
  }
]);
const hasActiveFilter = computed(() => Boolean(filters.startDate || filters.endDate));
const rangeLabel = computed(() => {
  if (!hasActiveFilter.value) {
    return "Semua periode";
  }

  return `${filters.startDate || "Awal"} sampai ${filters.endDate || "Hari ini"}`;
});

function loadReports() {
  adminStore.loadReports({
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined
  });
}

function resetFilters() {
  filters.startDate = "";
  filters.endDate = "";
  loadReports();
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Laporan" title="Laporan operasional" description="Ringkasan revenue, kredit, dan penggunaan tema.">
      <AppButton type="button" variant="secondary" :disabled="adminStore.loading" @click="loadReports">
        <RefreshCw class="h-4 w-4" />
        Refresh
      </AppButton>
    </AdminPageHeader>

    <section class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <form class="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end" @submit.prevent="loadReports">
        <div>
          <label class="block text-sm font-semibold text-ink" for="startDate">Tanggal mulai</label>
          <input
            id="startDate"
            v-model="filters.startDate"
            class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
            type="date"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-ink" for="endDate">Tanggal akhir</label>
          <input
            id="endDate"
            v-model="filters.endDate"
            class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
            type="date"
          />
        </div>
        <AppButton type="submit" :disabled="adminStore.loading">
          <Loader2 v-if="adminStore.loading" class="h-4 w-4 animate-spin" />
          Terapkan
        </AppButton>
        <AppButton type="button" variant="ghost" :disabled="adminStore.loading || !hasActiveFilter" @click="resetFilters">
          Reset
        </AppButton>
      </form>
      <div class="mt-4 flex items-center gap-2 text-sm font-semibold text-ink/60">
        <CalendarDays class="h-4 w-4 text-gold" />
        {{ rangeLabel }}
      </div>
    </section>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat laporan...</p>
    </div>

    <template v-else>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Transaksi sukses" :value="revenue.successCount || 0" tone="leaf" />
        <StatCard label="Revenue" :value="formatCurrency(revenue.totalRevenue || 0)" tone="gold" />
        <StatCard label="Kredit terjual" :value="revenue.creditsSold || 0" tone="rose" />
        <StatCard label="Net kredit" :value="credits.netChange || 0" tone="ink" />
      </div>

      <section class="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Revenue</h2>
          <div class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Total transfer</span>
              <span class="font-bold text-ink">{{ formatCurrency(revenue.totalRevenue || 0) }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Harga paket</span>
              <span class="font-semibold text-ink">{{ formatCurrency(revenue.baseRevenue || 0) }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Akumulasi kode unik</span>
              <span class="font-semibold text-ink">{{ formatCurrency(revenue.uniqueCodeTotal || 0) }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Rata-rata per transaksi</span>
              <span class="font-semibold text-ink">
                {{ formatCurrency(revenue.successCount ? revenue.totalRevenue / revenue.successCount : 0) }}
              </span>
            </div>
          </div>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Kredit</h2>
          <div class="mt-4 divide-y divide-ink/10">
            <div v-for="row in creditRows" :key="row.label" class="grid gap-3 py-3 sm:grid-cols-[1fr_120px_120px] sm:items-center">
              <p class="font-semibold text-ink">{{ row.label }}</p>
              <p class="text-sm text-ink/55">{{ row.count }} aktivitas</p>
              <p class="text-lg font-bold" :class="row.tone">{{ row.amount }}</p>
            </div>
          </div>
        </article>
      </section>

      <section class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
            <BarChart3 class="h-5 w-5" />
          </div>
          <h2 class="text-lg font-bold text-ink">Penggunaan tema</h2>
        </div>
        <div v-if="themes.length" class="mt-4 divide-y divide-ink/10">
          <div
            v-for="theme in themes"
            :key="theme.themeId || theme.themeName"
            class="grid gap-3 py-3 md:grid-cols-[1fr_120px_120px_120px] md:items-center"
          >
            <div>
              <p class="font-semibold text-ink">{{ theme.themeName }}</p>
              <p class="mt-1 text-xs text-ink/45">{{ theme.themeKey || "tanpa-key" }}</p>
            </div>
            <p class="text-sm text-ink/60">Publish {{ theme.totalPublished }}</p>
            <p class="text-sm text-ink/60">Aktif {{ theme.active }}</p>
            <p class="text-sm text-ink/60">Expired {{ theme.expired }}</p>
          </div>
        </div>
        <p v-else class="mt-4 rounded-md bg-linen p-5 text-center text-sm font-semibold text-ink/55">
          Belum ada undangan publish pada periode ini.
        </p>
      </section>
    </template>
  </section>
</template>
