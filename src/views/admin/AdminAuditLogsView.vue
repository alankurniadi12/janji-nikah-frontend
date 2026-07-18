<script setup>
import { onMounted } from "vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import { useAdminStore } from "@/stores/admin";
import { formatDateTime } from "@/utils/formatters";

const adminStore = useAdminStore();

onMounted(() => adminStore.loadAuditLogs());
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Audit log" title="Riwayat aksi penting" description="Pantau aksi admin seperti approve pembayaran, adjustment kredit, status member, dan unlock undangan." />

    <section class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <article v-for="log in adminStore.auditLogs" :key="log.id" class="grid gap-4 border-b border-ink/10 p-5 last:border-b-0 lg:grid-cols-[220px_1fr_180px] lg:items-start">
        <div>
          <p class="font-bold text-ink">{{ log.action }}</p>
          <p class="mt-1 text-sm text-ink/55">{{ formatDateTime(log.createdAt) }}</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-ink">{{ log.targetType }} · {{ log.targetId || "-" }}</p>
          <p class="mt-1 text-sm leading-6 text-ink/60">{{ log.note || "Tanpa catatan" }}</p>
        </div>
        <p class="break-all text-xs text-ink/45">Actor: {{ log.actorId || "-" }}</p>
      </article>
      <p v-if="!adminStore.auditLogs.length" class="p-8 text-center text-sm font-semibold text-ink/55">Belum ada audit log.</p>
    </section>
  </section>
</template>
