<script setup>
import { onMounted, reactive, ref } from "vue";
import { Loader2 } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";

const adminStore = useAdminStore();
const filters = reactive({ q: "", status: "" });
const adjustment = reactive({ memberId: "", amount: 0, reason: "" });
const error = ref("");
const success = ref("");

onMounted(load);

function load() {
  adminStore.loadMembers({ ...filters });
}

async function setStatus(member, status) {
  error.value = "";
  success.value = "";
  try {
    await adminStore.updateMemberStatus(member.id, status);
    success.value = "Status member berhasil diubah.";
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Status member belum bisa diubah.");
  }
}

async function adjustCredits() {
  error.value = "";
  success.value = "";
  try {
    await adminStore.adjustMemberCredits(adjustment.memberId, {
      amount: Number(adjustment.amount),
      reason: adjustment.reason
    });
    adjustment.memberId = "";
    adjustment.amount = 0;
    adjustment.reason = "";
    success.value = "Kredit member berhasil diadjust.";
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Kredit member belum bisa diadjust.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Member" title="Kelola member" description="Cari member, ubah status akun, dan lakukan adjustment kredit manual dengan alasan." />

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

    <section class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <h2 class="text-lg font-bold text-ink">Adjustment kredit</h2>
      <form class="mt-4 grid gap-3 lg:grid-cols-[1fr_120px_1fr_120px]" @submit.prevent="adjustCredits">
        <select v-model="adjustment.memberId" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" required>
          <option value="">Pilih member</option>
          <option v-for="member in adminStore.members" :key="member.id" :value="member.id">{{ member.name }} · {{ member.email }}</option>
        </select>
        <input v-model.number="adjustment.amount" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" type="number" placeholder="+/- kredit" required />
        <input v-model.trim="adjustment.reason" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="Alasan adjustment" required />
        <AppButton type="submit" :disabled="adminStore.saving">Simpan</AppButton>
      </form>
    </section>

    <p v-if="error || adminStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error || adminStore.error }}</p>
    <p v-if="success" class="mt-5 rounded-md bg-leaf/10 px-4 py-3 text-sm font-semibold text-leaf">{{ success }}</p>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat member...</p>
    </div>

    <section v-else class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <div v-if="adminStore.members.length" class="divide-y divide-ink/10">
        <article v-for="member in adminStore.members" :key="member.id" class="grid gap-4 p-5 lg:grid-cols-[1fr_120px_120px_260px] lg:items-center">
          <div>
            <p class="font-bold text-ink">{{ member.name }}</p>
            <p class="mt-1 text-sm text-ink/55">{{ member.email }} · @{{ member.username }}</p>
          </div>
          <p class="text-sm font-bold text-ink">{{ member.creditBalance }} kredit</p>
          <p class="text-sm font-semibold capitalize text-ink/65">{{ member.status }}</p>
          <div class="flex flex-wrap gap-2 lg:justify-end">
            <AppButton type="button" variant="secondary" @click="setStatus(member, 'active')">Active</AppButton>
            <AppButton type="button" variant="secondary" @click="setStatus(member, 'suspended')">Suspend</AppButton>
            <AppButton type="button" variant="ghost" @click="setStatus(member, 'blocked')">Block</AppButton>
          </div>
        </article>
      </div>
      <p v-else class="p-8 text-center text-sm font-semibold text-ink/55">Member tidak ditemukan.</p>
    </section>
  </section>
</template>
