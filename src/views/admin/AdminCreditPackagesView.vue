<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Loader2, Trash2 } from "@lucide/vue";

import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import CreditPackageTimer from "@/components/CreditPackageTimer.vue";
import StatusPill from "@/components/StatusPill.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import { useToastStore } from "@/stores/toasts";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

const adminStore = useAdminStore();
const toastStore = useToastStore();
const form = reactive({
  id: "",
  name: "",
  creditAmount: 1,
  price: 0,
  isActive: true,
  promoCode: "",
  startsAt: "",
  endsAt: ""
});
const error = ref("");
const deleteDialog = reactive({
  open: false,
  item: null
});

onMounted(() => adminStore.loadCreditPackages());

const deleteDetail = computed(() => {
  if (!deleteDialog.item) {
    return "";
  }

  return `${deleteDialog.item.name} · ${deleteDialog.item.creditAmount} kredit · ${formatCurrency(deleteDialog.item.price)}`;
});

function editPackage(item) {
  Object.assign(form, {
    id: item.id,
    name: item.name,
    creditAmount: item.creditAmount,
    price: item.price,
    isActive: item.isActive,
    promoCode: item.promoCode || "",
    startsAt: toDateTimeInput(item.startsAt),
    endsAt: toDateTimeInput(item.endsAt)
  });
}

function resetForm() {
  Object.assign(form, {
    id: "",
    name: "",
    creditAmount: 1,
    price: 0,
    isActive: true,
    promoCode: "",
    startsAt: "",
    endsAt: ""
  });
}

async function savePackage() {
  error.value = "";

  try {
    await adminStore.saveCreditPackage({
      ...form,
      creditAmount: Number(form.creditAmount),
      price: Number(form.price),
      promoCode: form.promoCode.trim().toUpperCase(),
      startsAt: fromDateTimeInput(form.startsAt),
      endsAt: fromDateTimeInput(form.endsAt)
    });
    resetForm();
    await adminStore.loadCreditPackages();
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

function openDeleteDialog(item) {
  deleteDialog.item = item;
  deleteDialog.open = true;
}

function closeDeleteDialog() {
  deleteDialog.open = false;
  deleteDialog.item = null;
}

async function confirmDelete() {
  if (!deleteDialog.item) {
    return;
  }

  error.value = "";

  try {
    await adminStore.deleteCreditPackage(deleteDialog.item.id);
    closeDeleteDialog();
    toastStore.show("Paket kredit berhasil dihapus.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Paket kredit belum bisa dihapus.");
  }
}

function statusLabel(item) {
  const labels = {
    available: "Tersedia",
    scheduled: "Terjadwal",
    expired: "Expired",
    inactive: "Nonaktif"
  };

  return labels[item.availabilityStatus] || (item.isActive ? "Aktif" : "Nonaktif");
}

function statusActive(item) {
  return item.availabilityStatus === "available";
}

function toDateTimeInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function fromDateTimeInput(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}
</script>

<template>
  <section>
    <AdminPageHeader
      eyebrow="Paket kredit"
      title="Kelola paket kredit"
      description="Atur paket reguler, paket promo terbatas, kode promo, dan masa tayang paket untuk member."
    />

    <form class="mt-6 rounded-lg border border-ink/10 bg-white p-5 shadow-soft" @submit.prevent="savePackage">
      <div class="grid gap-3 lg:grid-cols-[1fr_120px_160px_140px]">
        <input v-model.trim="form.name" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" placeholder="Nama paket" required />
        <input v-model.number="form.creditAmount" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" type="number" min="1" required />
        <input v-model.number="form.price" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm" type="number" min="0" required />
        <input v-model.trim="form.promoCode" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm uppercase" placeholder="Kode promo" />
      </div>

      <div class="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_160px_120px]">
        <label class="block">
          <span class="text-xs font-bold uppercase tracking-widest text-ink/45">Mulai tampil</span>
          <input v-model="form.startsAt" class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" type="datetime-local" />
        </label>
        <label class="block">
          <span class="text-xs font-bold uppercase tracking-widest text-ink/45">Berakhir</span>
          <input v-model="form.endsAt" class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm" type="datetime-local" />
        </label>
        <label class="mt-7 flex min-h-11 items-center gap-2 rounded-md border border-ink/10 px-3 text-sm font-semibold text-ink">
          <input v-model="form.isActive" type="checkbox" class="h-4 w-4 accent-leaf" />
          Aktif
        </label>
        <div class="mt-7 flex gap-2">
          <AppButton type="submit" :disabled="adminStore.saving">{{ form.id ? "Update" : "Buat" }}</AppButton>
          <AppButton type="button" variant="secondary" @click="resetForm">Reset</AppButton>
        </div>
      </div>

      <p class="mt-4 text-xs leading-5 text-ink/45">
        Kode promo bersifat label paket promo dan harus unik. Jika waktu berakhir lewat, paket otomatis nonaktif dan hilang dari menu Beli Kredit member.
      </p>
    </form>

    <p v-if="error || adminStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{{ error || adminStore.error }}</p>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat paket...</p>
    </div>

    <section v-else class="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <article v-for="item in adminStore.creditPackages" :key="item.id" class="grid gap-4 border-b border-ink/10 p-5 last:border-b-0 xl:grid-cols-[1fr_120px_160px_170px_240px] xl:items-center">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-bold text-ink">{{ item.name }}</p>
            <span v-if="item.promoCode" class="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold">{{ item.promoCode }}</span>
          </div>
          <p class="mt-1 text-sm text-ink/55">
            {{ item.startsAt ? `Mulai ${formatDateTime(item.startsAt)}` : "Tampil langsung" }}
            ·
            {{ item.endsAt ? `Berakhir ${formatDateTime(item.endsAt)}` : "Tanpa batas waktu" }}
          </p>
          <CreditPackageTimer v-if="item.countdownEndsAt" class="mt-2" :ends-at="item.countdownEndsAt" :prefix="item.availabilityStatus === 'scheduled' ? 'Mulai dalam' : 'Sisa'" />
        </div>
        <p class="text-sm font-semibold text-ink">{{ item.creditAmount }} kredit</p>
        <p class="font-bold text-ink">{{ formatCurrency(item.price) }}</p>
        <StatusPill :active="statusActive(item)" :label="statusLabel(item)" />
        <div class="flex flex-wrap gap-2 xl:justify-end">
          <AppButton type="button" variant="secondary" @click="editPackage(item)">Edit</AppButton>
          <AppButton type="button" variant="ghost" @click="setPackageStatus(item)">
            {{ item.isActive ? "Nonaktifkan" : "Aktifkan" }}
          </AppButton>
          <AppButton type="button" variant="ghost" @click="openDeleteDialog(item)">
            <Trash2 class="h-4 w-4" />
            Hapus
          </AppButton>
        </div>
      </article>
      <p v-if="!adminStore.creditPackages.length" class="p-8 text-center text-sm font-semibold text-ink/55">
        Belum ada paket kredit.
      </p>
    </section>

    <ConfirmDialog
      :open="deleteDialog.open"
      title="Hapus paket kredit?"
      message="Paket akan hilang dari admin dan menu beli kredit member. Jika sudah pernah dipakai transaksi, data transaksi lama tetap aman."
      :detail="deleteDetail"
      confirm-label="Hapus paket"
      :loading="adminStore.saving"
      @cancel="closeDeleteDialog"
      @confirm="confirmDelete"
    />
  </section>
</template>
