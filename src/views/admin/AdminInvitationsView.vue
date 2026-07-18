<script setup>
import { onMounted, ref } from "vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import { useAdminStore } from "@/stores/admin";
import { formatDate } from "@/utils/formatters";

const adminStore = useAdminStore();
const status = ref("");
const note = ref("");

onMounted(load);

function load() {
  adminStore.loadInvitations(status.value);
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Undangan" title="Inspeksi undangan" description="Lihat semua undangan dan buka lock untuk kasus khusus dengan audit log.">
      <select v-model="status" class="focus-ring h-11 rounded-md border border-ink/15 bg-white px-3 text-sm" @change="load">
        <option value="">Semua status</option>
        <option value="draft">Draft</option>
        <option value="active">Aktif</option>
        <option value="locked">Terkunci</option>
        <option value="expired">Expired</option>
      </select>
    </AdminPageHeader>
    <input v-model.trim="note" class="focus-ring mt-6 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm" placeholder="Catatan unlock undangan" />
    <section class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <article v-for="invitation in adminStore.invitations" :key="invitation.id" class="grid gap-4 border-b border-ink/10 p-5 last:border-b-0 lg:grid-cols-[1fr_120px_140px_150px] lg:items-center">
        <div>
          <p class="font-bold text-ink">{{ invitation.title || `${invitation.groom?.fullName || "-"} & ${invitation.bride?.fullName || "-"}` }}</p>
          <p class="mt-1 text-sm text-ink/55">/{{ invitation.slug }} · {{ formatDate(invitation.updatedAt) }}</p>
        </div>
        <InvitationStatusBadge :status="invitation.status" />
        <p class="text-sm text-ink/55">{{ invitation.events?.length || 0 }} acara</p>
        <AppButton type="button" variant="secondary" :disabled="invitation.status !== 'locked'" @click="adminStore.unlockInvitation(invitation.id, note)">Unlock</AppButton>
      </article>
      <p v-if="!adminStore.invitations.length" class="p-8 text-center text-sm font-semibold text-ink/55">Belum ada undangan.</p>
    </section>
  </section>
</template>
