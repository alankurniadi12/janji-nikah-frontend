<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Loader2 } from "@lucide/vue";

import AdminMemberStatusDialog from "@/components/AdminMemberStatusDialog.vue";
import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import { useToastStore } from "@/stores/toasts";
import { formatCurrency } from "@/utils/formatters";

const adminStore = useAdminStore();
const toastStore = useToastStore();
const router = useRouter();
const filters = reactive({ q: "", status: "" });
const error = ref("");
const statusDialog = reactive({
  open: false,
  member: null,
  status: "active",
  error: ""
});

onMounted(load);

function load() {
  adminStore.loadMembers({ ...filters });
}

function openDetail(member) {
  router.push(`/admin/members/${member.id}`);
}

function openStatusDialog(member, status) {
  statusDialog.member = member;
  statusDialog.status = status;
  statusDialog.error = "";
  statusDialog.open = true;
}

function closeStatusDialog() {
  statusDialog.open = false;
  statusDialog.member = null;
  statusDialog.error = "";
}

async function confirmStatusChange() {
  if (!statusDialog.member) {
    return;
  }

  error.value = "";
  statusDialog.error = "";

  try {
    await adminStore.updateMemberStatus(statusDialog.member.id, statusDialog.status);
    closeStatusDialog();
    toastStore.show("Status member berhasil diubah.");
  } catch (requestError) {
    statusDialog.error = getApiErrorMessage(requestError, "Status member belum bisa diubah.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Member" title="Kelola member" description="Cari member, cek detail akun, dan ubah status dengan konfirmasi admin." />

    <div class="mt-6 grid gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft md:grid-cols-[1fr_180px_120px]">
      <input v-model.trim="filters.q" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="Cari nama, email, username" />
      <select v-model="filters.status" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm">
        <option value="">Semua status</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
        <option value="blocked">Blocked</option>
      </select>
      <AppButton type="button" @click="load">Cari</AppButton>
    </div>

    <p v-if="error || adminStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error || adminStore.error }}</p>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat member...</p>
    </div>

    <section v-else class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <div v-if="adminStore.members.length" class="divide-y divide-ink/10">
        <article
          v-for="member in adminStore.members"
          :key="member.id"
          class="grid cursor-pointer gap-4 p-5 transition hover:bg-mint/30 lg:grid-cols-[1fr_120px_160px_120px_260px] lg:items-center"
          tabindex="0"
          role="button"
          @click="openDetail(member)"
          @keyup.enter="openDetail(member)"
        >
          <div>
            <p class="font-bold text-ink">{{ member.name }}</p>
            <p class="mt-1 text-sm text-ink/55">@{{ member.username || "-" }}</p>
          </div>
          <p class="text-sm font-bold text-ink">{{ member.creditBalance }} kredit</p>
          <div>
            <p class="text-sm font-bold text-leaf">{{ formatCurrency(member.revenue?.serviceTotal || 0) }}</p>
            <p class="mt-1 text-xs font-semibold text-ink/45">{{ member.revenue?.pricedInvitations || 0 }} undangan</p>
          </div>
          <p class="text-sm font-semibold capitalize text-ink/65">{{ member.status }}</p>
          <div class="flex flex-wrap gap-2 lg:justify-end">
            <AppButton type="button" variant="secondary" :disabled="adminStore.saving || member.status === 'active'" @click.stop="openStatusDialog(member, 'active')">Active</AppButton>
            <AppButton type="button" variant="secondary" :disabled="adminStore.saving || member.status === 'suspended'" @click.stop="openStatusDialog(member, 'suspended')">Suspend</AppButton>
            <AppButton type="button" variant="ghost" :disabled="adminStore.saving || member.status === 'blocked'" @click.stop="openStatusDialog(member, 'blocked')">Block</AppButton>
          </div>
        </article>
      </div>
      <p v-else class="p-8 text-center text-sm font-semibold text-ink/55">Member tidak ditemukan.</p>
    </section>

    <AdminMemberStatusDialog
      :open="statusDialog.open"
      :member="statusDialog.member"
      :status="statusDialog.status"
      :loading="adminStore.saving"
      :error="statusDialog.error"
      @cancel="closeStatusDialog"
      @confirm="confirmStatusChange"
    />
  </section>
</template>
