<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Check, CreditCard, ExternalLink, Loader2, ShieldCheck, Tag, X } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import CreditPackageTimer from "@/components/CreditPackageTimer.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useCreditStore } from "@/stores/credit";
import { useTransactionStore } from "@/stores/transactions";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

const creditStore = useCreditStore();
const transactionStore = useTransactionStore();
const router = useRouter();
const selectedPackageId = ref("");
const promoCode = ref("");
const error = ref("");
const checkoutUrl = ref("");
const checkoutTransactionId = ref("");
const checkoutFrameLoaded = ref(false);
const checkoutFrameBlocked = ref(false);

onMounted(async () => {
  await creditStore.loadPackages();

  if (!selectedPackageId.value && creditStore.packages.length) {
    selectedPackageId.value = creditStore.packages[0].id;
  }
});

const selectedPackage = computed(() =>
  creditStore.packages.find((creditPackage) => creditPackage.id === selectedPackageId.value)
);

function selectPackage(creditPackage) {
  selectedPackageId.value = creditPackage.id;
  error.value = "";

  if (!creditPackage.hasPromoCode) {
    promoCode.value = "";
  }
}

async function createPayment() {
  if (!selectedPackageId.value) {
    error.value = "Pilih paket kredit terlebih dahulu.";
    return;
  }

  error.value = "";

  try {
    if (selectedPackage.value?.hasPromoCode && !promoCode.value.trim()) {
      error.value = "Masukkan kode promo untuk paket promo yang dipilih.";
      return;
    }

    if (!selectedPackage.value?.hasPromoCode && promoCode.value.trim()) {
      error.value = "Kode promo hanya dipakai saat memilih paket promo.";
      return;
    }

    if (selectedPackage.value?.price <= 0 && selectedPackage.value?.hasPromoCode) {
      const transaction = await transactionStore.redeemPromo(promoCode.value.trim());
      router.push({ name: "member-transaction-detail", params: { id: transaction.id } });
      return;
    }

    const transaction = await transactionStore.create(selectedPackageId.value, promoCode.value.trim());
    if (transaction.providerCheckoutUrl) {
      openEmbeddedCheckout(transaction);
      return;
    }

    router.push({ name: "member-transaction-detail", params: { id: transaction.id } });
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Transaksi belum bisa dibuat.");
  }
}

function openEmbeddedCheckout(transaction) {
  if (!isValidCheckoutUrl(transaction.providerCheckoutUrl)) {
    error.value = "Link pembayaran tidak valid.";
    return;
  }

  checkoutUrl.value = transaction.providerCheckoutUrl;
  checkoutTransactionId.value = transaction.id;
  checkoutFrameLoaded.value = false;
  checkoutFrameBlocked.value = false;
}

function closeEmbeddedCheckout({ goToDetail = false } = {}) {
  const transactionId = checkoutTransactionId.value;

  checkoutUrl.value = "";
  checkoutTransactionId.value = "";
  checkoutFrameLoaded.value = false;
  checkoutFrameBlocked.value = false;

  if (goToDetail && transactionId) {
    router.push({ name: "member-transaction-detail", params: { id: transactionId }, query: { payment: "mayar" } });
  }
}

function handleCheckoutFrameLoad(event) {
  checkoutFrameLoaded.value = true;

  try {
    const href = event.target?.contentWindow?.location?.href || "";
    const url = href ? new URL(href) : null;

    if (url?.origin === window.location.origin && url.pathname.startsWith("/app/transactions/")) {
      closeEmbeddedCheckout({ goToDetail: true });
    }
  } catch {
    // Cross-origin payment pages cannot be inspected. Loading the iframe is enough.
  }
}

function openHostedFallback() {
  if (checkoutUrl.value) {
    window.location.assign(checkoutUrl.value);
  }
}

function isValidCheckoutUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
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
          Pilih paket, lalu selesaikan pembayaran di popup checkout. Kredit masuk otomatis setelah pembayaran terkonfirmasi.
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
          @click="selectPackage(creditPackage)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-sm font-bold uppercase tracking-widest text-gold">{{ creditPackage.creditAmount }} kredit</p>
                <span v-if="creditPackage.hasPromoCode" class="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold">
                  <Tag class="h-3.5 w-3.5" />
                  Kode promo
                </span>
              </div>
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
          <div v-if="creditPackage.countdownEndsAt || creditPackage.endsAt" class="mt-4 space-y-2">
            <CreditPackageTimer v-if="creditPackage.countdownEndsAt" :ends-at="creditPackage.countdownEndsAt" prefix="Sisa promo" />
            <p v-if="creditPackage.endsAt" class="text-xs font-semibold text-ink/45">Berakhir {{ formatDateTime(creditPackage.endsAt) }}</p>
          </div>
        </button>
      </div>

      <p v-if="!creditStore.packages.length" class="mt-8 rounded-lg border border-ink/10 bg-white p-8 text-center text-sm font-semibold text-ink/55 shadow-soft">
        Belum ada paket kredit yang aktif saat ini.
      </p>

      <section class="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div class="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
          <div class="border-b border-ink/10 bg-linen px-5 py-4">
            <p class="text-xs font-bold uppercase tracking-widest text-gold">Pembayaran paket</p>
            <h2 class="mt-1 text-lg font-bold text-ink">Checkout singkat, kredit otomatis aktif</h2>
          </div>
          <div class="grid gap-3 p-5 sm:grid-cols-3">
            <div class="rounded-md border border-ink/10 bg-white p-4">
              <div class="flex h-9 w-9 items-center justify-center rounded-md bg-mint text-leaf">
                <CreditCard class="h-4 w-4" />
              </div>
              <p class="mt-3 text-sm font-bold text-ink">Pilih paket</p>
              <p class="mt-1 text-sm leading-6 text-ink/60">Pastikan paket dan total kredit sudah sesuai.</p>
            </div>
            <div class="rounded-md border border-ink/10 bg-white p-4">
              <div class="flex h-9 w-9 items-center justify-center rounded-md bg-gold/10 text-gold">
                <ExternalLink class="h-4 w-4" />
              </div>
              <p class="mt-3 text-sm font-bold text-ink">Bayar langsung</p>
              <p class="mt-1 text-sm leading-6 text-ink/60">Form checkout terbuka setelah tombol Bayar Sekarang.</p>
            </div>
            <div class="rounded-md border border-ink/10 bg-white p-4">
              <div class="flex h-9 w-9 items-center justify-center rounded-md bg-leaf/10 text-leaf">
                <ShieldCheck class="h-4 w-4" />
              </div>
              <p class="mt-3 text-sm font-bold text-ink">Kredit masuk</p>
              <p class="mt-1 text-sm leading-6 text-ink/60">Saldo bertambah otomatis setelah pembayaran selesai.</p>
            </div>
          </div>
          <div class="border-t border-ink/10 px-5 py-3">
            <p class="text-xs leading-5 text-ink/50">
              Jika form tidak tampil sempurna, gunakan tombol Buka Halaman Pembayaran yang muncul di popup.
            </p>
          </div>
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
            <div v-if="selectedPackage.hasPromoCode" class="flex justify-between gap-4">
              <span class="text-ink/55">Kode promo</span>
              <span class="font-semibold text-gold">Wajib diisi</span>
            </div>
            <div v-if="selectedPackage.endsAt" class="flex justify-between gap-4">
              <span class="text-ink/55">Promo berakhir</span>
              <span class="font-semibold text-ink">{{ formatDateTime(selectedPackage.endsAt) }}</span>
            </div>
            <div class="rounded-md bg-linen px-3 py-2 text-ink/65">
              {{ selectedPackage.hasPromoCode && selectedPackage.price <= 0 ? "Kode promo valid akan langsung menambahkan kredit tanpa pembayaran." : "Form pembayaran dibuat setelah transaksi dibuat." }}
            </div>

            <label class="block">
              <span class="text-sm font-semibold text-ink">Punya Kode Promo?</span>
              <input
                v-model.trim="promoCode"
                class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm uppercase"
                placeholder="Masukkan kode promo"
              />
              <span class="mt-1 block text-xs leading-5 text-ink/45">
                {{ selectedPackage.hasPromoCode ? "Kode wajib diisi untuk melanjutkan paket promo." : "Kosongkan jika membeli paket reguler." }}
              </span>
            </label>
          </div>

          <p v-if="error || transactionStore.error" class="mt-4 rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
            {{ error || transactionStore.error }}
          </p>

          <AppButton class="mt-5 w-full" :disabled="transactionStore.submitting || !selectedPackage" @click="createPayment">
            <Loader2 v-if="transactionStore.submitting" class="h-4 w-4 animate-spin" />
            {{ selectedPackage?.price <= 0 && selectedPackage?.hasPromoCode ? "Klaim Kode Promo" : "Bayar Sekarang" }}
          </AppButton>
          <p class="mt-3 text-xs leading-5 text-ink/50">
            Kredit yang sudah dibeli dan kredit yang sudah dipakai publish tidak bisa refund.
          </p>
        </aside>
      </section>
    </template>

    <div
      v-if="checkoutUrl"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Checkout pembayaran"
    >
      <section class="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-soft">
        <div class="flex items-start justify-between gap-4 border-b border-ink/10 px-4 py-3 sm:px-5">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-gold">Pembayaran</p>
            <h2 class="mt-1 text-lg font-bold text-ink">Selesaikan pembayaran</h2>
            <p class="mt-1 text-sm leading-6 text-ink/60">
              Tutup popup setelah pembayaran selesai, lalu cek status transaksi. Kredit masuk setelah pembayaran terkonfirmasi.
            </p>
          </div>
          <button
            type="button"
            class="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-ink/10 text-ink/60 hover:text-ink"
            aria-label="Tutup checkout"
            @click="closeEmbeddedCheckout({ goToDetail: true })"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="relative min-h-0 flex-1 bg-linen">
          <div v-if="!checkoutFrameLoaded" class="absolute inset-0 flex items-center justify-center">
            <div class="rounded-lg border border-ink/10 bg-white px-5 py-4 text-center shadow-soft">
              <Loader2 class="mx-auto h-6 w-6 animate-spin text-leaf" />
              <p class="mt-3 text-sm font-semibold text-ink/70">Memuat halaman pembayaran...</p>
            </div>
          </div>
          <iframe
            :src="checkoutUrl"
            title="Checkout pembayaran"
            class="h-full w-full border-0 bg-white"
            allow="payment *"
            @load="handleCheckoutFrameLoad"
            @error="checkoutFrameBlocked = true"
          />
        </div>

        <div class="flex flex-col gap-3 border-t border-ink/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p class="text-xs leading-5 text-ink/55">
            Jika halaman checkout kosong atau metode bayar membuka halaman baru, gunakan tombol fallback.
          </p>
          <div class="flex flex-col gap-2 sm:flex-row">
            <AppButton type="button" variant="secondary" @click="openHostedFallback">
              <ExternalLink class="h-4 w-4" />
              Buka Halaman Pembayaran
            </AppButton>
            <AppButton type="button" @click="closeEmbeddedCheckout({ goToDetail: true })">
              Cek Status Transaksi
            </AppButton>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
