<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Check, CreditCard, Loader2 } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useCreditStore } from "@/stores/credit";
import { useTransactionStore } from "@/stores/transactions";
import { formatCurrency } from "@/utils/formatters";

const creditStore = useCreditStore();
const transactionStore = useTransactionStore();
const router = useRouter();
const selectedPackageId = ref("");
const error = ref("");

onMounted(async () => {
  await creditStore.loadPackages();

  if (!selectedPackageId.value && creditStore.packages.length) {
    selectedPackageId.value = creditStore.packages[0].id;
  }
});

const selectedPackage = computed(() =>
  creditStore.packages.find((creditPackage) => creditPackage.id === selectedPackageId.value)
);

async function createPayment() {
  if (!selectedPackageId.value) {
    error.value = "Pilih paket kredit terlebih dahulu.";
    return;
  }

  error.value = "";

  try {
    const transaction = await transactionStore.create(selectedPackageId.value);
    router.push({ name: "member-transaction-detail", params: { id: transaction.id } });
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Transaksi belum bisa dibuat.");
  }
}
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Beli kredit</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">Pilih paket kredit</h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Pembayaran MVP dilakukan melalui transfer manual. Sistem akan membuat kode unik 3 digit setelah paket dipilih.
        </p>
      </div>
      <AppButton to="/app/transactions" variant="secondary">Riwayat Transaksi</AppButton>
    </div>

    <div v-if="creditStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat paket kredit...</p>
    </div>

    <p v-else-if="creditStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ creditStore.error }}
    </p>

    <template v-else>
      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <button
          v-for="creditPackage in creditStore.packages"
          :key="creditPackage.id"
          type="button"
          class="focus-ring rounded-lg border bg-white p-5 text-left shadow-soft transition hover:border-leaf"
          :class="selectedPackageId === creditPackage.id ? 'border-leaf ring-2 ring-leaf/15' : 'border-ink/10'"
          @click="selectedPackageId = creditPackage.id"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-bold uppercase tracking-widest text-gold">{{ creditPackage.creditAmount }} kredit</p>
              <h2 class="mt-3 text-xl font-bold text-ink">{{ creditPackage.name }}</h2>
            </div>
            <span
              class="flex h-7 w-7 items-center justify-center rounded-full"
              :class="selectedPackageId === creditPackage.id ? 'bg-leaf text-white' : 'bg-ink/5 text-ink/35'"
            >
              <Check class="h-4 w-4" />
            </span>
          </div>
          <p class="mt-5 text-2xl font-bold text-ink">{{ formatCurrency(creditPackage.price) }}</p>
          <p class="mt-2 text-sm leading-6 text-ink/55">
            Cocok untuk publish {{ creditPackage.creditAmount }} undangan. Draft dan preview tetap gratis.
          </p>
        </button>
      </div>

      <section class="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Instruksi pembayaran</h2>
          <div class="mt-4 grid gap-3 text-sm leading-6 text-ink/65">
            <p>1. Pilih paket kredit yang ingin dibeli.</p>
            <p>2. Klik buat transaksi untuk mendapatkan total bayar dengan kode unik.</p>
            <p>3. Transfer sesuai total bayar, lalu upload bukti transfer pada detail transaksi.</p>
            <p>4. Kredit masuk setelah admin menyetujui pembayaran.</p>
          </div>
          <p class="mt-4 rounded-md bg-gold/10 px-3 py-2 text-sm font-semibold text-ink">
            Kredit yang sudah dibeli dan kredit yang sudah dipakai untuk publish tidak bisa refund.
          </p>
        </div>

        <aside class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
            <CreditCard class="h-5 w-5" />
          </div>
          <h2 class="mt-4 text-lg font-bold text-ink">Ringkasan</h2>
          <div v-if="selectedPackage" class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Paket</span>
              <span class="font-semibold text-ink">{{ selectedPackage.name }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Kredit</span>
              <span class="font-semibold text-ink">{{ selectedPackage.creditAmount }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-ink/55">Harga paket</span>
              <span class="font-semibold text-ink">{{ formatCurrency(selectedPackage.price) }}</span>
            </div>
          </div>

          <p v-if="error || transactionStore.error" class="mt-4 rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
            {{ error || transactionStore.error }}
          </p>

          <AppButton class="mt-5 w-full" :disabled="transactionStore.submitting || !selectedPackage" @click="createPayment">
            <Loader2 v-if="transactionStore.submitting" class="h-4 w-4 animate-spin" />
            Buat Transaksi
          </AppButton>
        </aside>
      </section>
    </template>
  </section>
</template>
