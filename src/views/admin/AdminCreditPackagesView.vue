<script setup>
import { onMounted, reactive, ref } from "vue";
import { Loader2 } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import StatusPill from "@/components/StatusPill.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import { useToastStore } from "@/stores/toasts";
import { formatCurrency } from "@/utils/formatters";

const adminStore = useAdminStore();
const toastStore = useToastStore();
const form = reactive({ id: "", name: "", creditAmount: 1, price: 0, isActive: true });
const error = ref("");

onMounted(() => adminStore.loadCreditPackages());

function editPackage(item) {
  Object.assign(form, item);
}

function resetForm() {
  Object.assign(form, { id: "", name: "", creditAmount: 1, price: 0, isActive: true });
}

async function savePackage() {
  error.value = "";
  try {
    await adminStore.saveCreditPackage({ ...form, creditAmount: Number(form.creditAmount), price: Number(form.price) });
    resetForm();
    toastStore.show("Paket kredit berhasil disimpan.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Paket kredit belum bisa disimpan.");
  }
}

async function setPackageStatus(item) {
  error.value = "";

  try {
    await adminStore.setCreditPackageStatus(item.id, !item.isActive);
    toastStore.show(item.isActive ? "Paket kredit dinonaktifkan." : "Paket kredit diaktifkan.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Status paket kredit belum bisa diubah.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader eyebrow="Paket kredit" title="Kelola paket kredit" description="Harga paket tidak hardcoded dan bisa diatur dari dashboard admin." />

    <form class="mt-6 grid gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft lg:grid-cols-[1fr_120px_160px_120px_120px]" @submit.prevent="savePackage">
      <input v-model.trim="form.name" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="Nama paket" required />
      <input v-model.number="form.creditAmount" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" type="number" min="1" required />
      <input v-model.number="form.price" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" type="number" min="0" required />
      <AppButton type="submit" :disabled="adminStore.saving">{{ form.id ? "Update" : "Buat" }}</AppButton>
      <AppButton type="button" variant="secondary" @click="resetForm">Reset</AppButton>
    </form>

    <p v-if="error || adminStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error || adminStore.error }}</p>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat paket...</p>
    </div>

    <section v-else class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <article v-for="item in adminStore.creditPackages" :key="item.id" class="grid gap-4 border-b border-ink/10 p-5 last:border-b-0 md:grid-cols-[1fr_120px_160px_110px_180px] md:items-center">
        <p class="font-bold text-ink">{{ item.name }}</p>
        <p class="text-sm font-semibold text-ink">{{ item.creditAmount }} kredit</p>
        <p class="font-bold text-ink">{{ formatCurrency(item.price) }}</p>
        <StatusPill :active="item.isActive" :label="item.isActive ? 'Aktif' : 'Nonaktif'" />
        <div class="flex gap-2 md:justify-end">
          <AppButton type="button" variant="secondary" @click="editPackage(item)">Edit</AppButton>
          <AppButton type="button" variant="ghost" @click="setPackageStatus(item)">
            {{ item.isActive ? "Nonaktifkan" : "Aktifkan" }}
          </AppButton>
        </div>
      </article>
    </section>
  </section>
</template>
