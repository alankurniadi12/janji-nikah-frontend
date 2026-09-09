<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  Landmark,
  Loader2,
  ReceiptText,
  UploadCloud
} from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import PaymentSupportCard from "@/components/PaymentSupportCard.vue";
import TransactionStatusBadge from "@/components/TransactionStatusBadge.vue";
import { paymentConfig, hasConfiguredPaymentAccount } from "@/config/payment";
import { getApiErrorGuidance } from "@/lib/api";
import { useToastStore } from "@/stores/toasts";
import { useTransactionStore } from "@/stores/transactions";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";

const route = useRoute();
const transactionStore = useTransactionStore();
const toastStore = useToastStore();
const selectedFile = ref(null);
const uploadError = ref(null);
const currentTime = ref(Date.now());
let timerInterval = null;

onMounted(() => {
  transactionStore.loadTransaction(route.params.id);
  timerInterval = window.setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) {
    window.clearInterval(timerInterval);
  }
});

const transaction = computed(() => transactionStore.current);
const isPromoTransaction = computed(() => transaction.value?.paymentMethod === "promo_code");
const canUploadProof = computed(() => transaction.value?.status === "waiting_payment");
const hasUploadedProof = computed(() => ["waiting_verification", "success"].includes(transaction.value?.status));
const isPaymentAccountReady = computed(() => hasConfiguredPaymentAccount(paymentConfig));
const remainingPaymentMs = computed(() => {
  if (transaction.value?.status !== "waiting_payment" || !transaction.value?.expiresAt) {
    return 0;
  }

  return Math.max(0, new Date(transaction.value.expiresAt).getTime() - currentTime.value);
});
const paymentCountdown = computed(() => {
  const totalSeconds = Math.floor(remainingPaymentMs.value / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    isExpired: totalSeconds <= 0
  };
});
const paymentSteps = computed(() => {
  const status = transaction.value?.status;

  if (isPromoTransaction.value) {
    return [
      {
        title: "Kode promo diklaim",
        description: `Kode ${transaction.value?.promoCode || "promo"} sudah divalidasi.`,
        done: status === "success",
        active: status !== "success"
      },
      {
        title: "Kredit masuk",
        description: "Saldo kredit langsung bertambah tanpa transfer manual.",
        done: status === "success",
        active: status === "success"
      }
    ];
  }

  const proofUploaded = ["waiting_verification", "success"].includes(status);

  return [
    {
      title: "Transaksi dibuat",
      description: "Nominal final dan kode unik sudah dibuat.",
      done: Boolean(status),
      active: status === "waiting_payment"
    },
    {
      title: "Upload bukti",
      description: "Bukti transfer menunggu cek admin.",
      done: proofUploaded,
      active: status === "waiting_verification"
    },
    {
      title: "Kredit masuk",
      description: "Saldo bertambah setelah admin approve.",
      done: status === "success",
      active: status === "success"
    }
  ];
});
const statusMessage = computed(() => {
  const status = transaction.value?.status;

  if (status === "waiting_payment") {
    return {
      icon: Clock3,
      tone: "border-gold/25 bg-gold/10 text-ink",
      title: "Menunggu pembayaran",
      message: `Transfer sebelum ${formatDateTime(transaction.value?.expiresAt)}, lalu upload bukti transfer di halaman ini.`
    };
  }

  if (status === "waiting_verification") {
    return {
      icon: UploadCloud,
      tone: "border-leaf/20 bg-leaf/10 text-ink",
      title: "Bukti sudah diterima",
      message: "Admin sedang mencocokkan nominal dan bukti transfer. Kredit masuk setelah pembayaran disetujui."
    };
  }

  if (status === "success") {
    return {
      icon: CheckCircle2,
      tone: "border-leaf/20 bg-leaf/10 text-ink",
      title: isPromoTransaction.value ? "Kode promo berhasil diklaim" : "Pembayaran berhasil",
      message: isPromoTransaction.value
        ? "Kredit promo sudah ditambahkan ke saldo member tanpa transfer manual."
        : "Kredit sudah ditambahkan ke saldo member dan bisa dipakai untuk publish undangan."
    };
  }

  if (status === "rejected") {
    return {
      icon: AlertCircle,
      tone: "border-rose/20 bg-rose/10 text-rose",
      title: "Pembayaran ditolak",
      message: "Cek catatan admin. Buat transaksi baru jika perlu membeli kredit lagi."
    };
  }

  if (status === "expired") {
    return {
      icon: AlertCircle,
      tone: "border-ink/10 bg-ink/5 text-ink",
      title: "Transaksi kedaluwarsa",
      message: "Batas pembayaran sudah lewat. Buat transaksi baru agar mendapat kode unik dan nominal bayar baru."
    };
  }

  return {
    icon: ReceiptText,
    tone: "border-ink/10 bg-linen text-ink",
    title: "Detail transaksi",
    message: "Ikuti instruksi pembayaran pada halaman ini."
  };
});

function chooseFile(event) {
  selectedFile.value = event.target.files?.[0] || null;
  uploadError.value = null;
}

async function copyText(value, label) {
  if (!value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(String(value));
    toastStore.show(`${label} berhasil disalin.`);
  } catch {
    toastStore.show(`${label} belum bisa disalin otomatis.`);
  }
}

async function submitProof() {
  if (!selectedFile.value) {
    uploadError.value = {
      title: "File bukti belum dipilih",
      message: "Pilih screenshot atau foto bukti transfer terlebih dahulu, lalu klik upload lagi."
    };
    return;
  }

  uploadError.value = null;

  try {
    await transactionStore.uploadProof(transaction.value.id, selectedFile.value);
    selectedFile.value = null;
    toastStore.show("Bukti pembayaran berhasil diunggah dan menunggu verifikasi admin.");
  } catch (requestError) {
    uploadError.value = getApiErrorGuidance(requestError, "Bukti pembayaran belum bisa diunggah.");
  }
}
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Detail transaksi</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">{{ isPromoTransaction ? "Klaim kode promo" : "Pembayaran kredit" }}</h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          {{ isPromoTransaction ? "Kredit promo langsung masuk setelah kode valid diklaim." : "Selesaikan transfer manual sesuai nominal final, lalu upload bukti agar admin bisa memverifikasi pembayaran." }}
        </p>
      </div>
      <AppButton to="/app/transactions" variant="secondary">Kembali</AppButton>
    </div>

    <div v-if="transactionStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat detail transaksi...</p>
    </div>

    <p v-else-if="transactionStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ transactionStore.error }}
    </p>

    <div v-else-if="transaction" class="mt-8 space-y-6">
      <section class="rounded-lg border p-5 shadow-soft" :class="statusMessage.tone">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/80">
              <component :is="statusMessage.icon" class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold">{{ statusMessage.title }}</h2>
              <p class="mt-1 text-sm leading-6 text-ink/65">{{ statusMessage.message }}</p>
            </div>
          </div>
          <TransactionStatusBadge :status="transaction.status" />
        </div>
      </section>

      <section
        v-if="transaction.status === 'waiting_payment'"
        class="rounded-lg border border-gold/25 bg-white p-5 shadow-soft"
      >
        <div class="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <p class="text-sm font-bold uppercase tracking-widest text-gold">Batas transfer berjalan</p>
            <h2 class="mt-2 text-xl font-bold text-ink">Selesaikan sebelum transaksi kedaluwarsa</h2>
            <p class="mt-2 text-sm leading-6 text-ink/60">
              Nominal dan kode unik hanya berlaku sampai {{ formatDateTime(transaction.expiresAt) }}. Upload bukti setelah transfer agar admin bisa verifikasi.
            </p>
          </div>
          <div class="rounded-lg border border-gold/20 bg-gold/10 p-4 text-center">
            <p class="text-xs font-bold uppercase tracking-widest text-ink/50">Sisa waktu</p>
            <div class="mt-3 grid grid-cols-3 gap-2">
              <div class="rounded-md bg-white px-2 py-3">
                <p class="text-2xl font-bold text-ink">{{ paymentCountdown.hours }}</p>
                <p class="mt-1 text-[11px] font-bold uppercase tracking-wide text-ink/45">Jam</p>
              </div>
              <div class="rounded-md bg-white px-2 py-3">
                <p class="text-2xl font-bold text-ink">{{ paymentCountdown.minutes }}</p>
                <p class="mt-1 text-[11px] font-bold uppercase tracking-wide text-ink/45">Menit</p>
              </div>
              <div class="rounded-md bg-white px-2 py-3">
                <p class="text-2xl font-bold text-ink">{{ paymentCountdown.seconds }}</p>
                <p class="mt-1 text-[11px] font-bold uppercase tracking-wide text-ink/45">Detik</p>
              </div>
            </div>
            <p class="mt-3 text-xs font-semibold leading-5 text-ink/55">
              {{ paymentCountdown.isExpired ? "Waktu habis. Muat ulang halaman untuk cek status terbaru." : "Timer berjalan sampai batas pembayaran." }}
            </p>
          </div>
        </div>
      </section>

      <section class="grid gap-3 md:grid-cols-3">
        <article
          v-for="(step, index) in paymentSteps"
          :key="step.title"
          class="rounded-lg border bg-white p-4 shadow-soft"
          :class="step.done ? 'border-leaf/25' : step.active ? 'border-gold/35' : 'border-ink/10'"
        >
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
            :class="step.done ? 'bg-leaf text-white' : step.active ? 'bg-gold/15 text-gold' : 'bg-ink/5 text-ink/40'"
          >
            {{ index + 1 }}
          </div>
          <p class="mt-3 text-sm font-bold text-ink">{{ step.title }}</p>
          <p class="mt-1 text-sm leading-6 text-ink/55">{{ step.description }}</p>
        </article>
      </section>

      <div class="grid gap-6 lg:grid-cols-[1fr_390px]">
        <div class="space-y-6">
          <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
                  <ReceiptText class="h-5 w-5" />
                </div>
                <div>
                  <h2 class="text-lg font-bold text-ink">{{ transaction.creditAmount }} kredit</h2>
                  <p class="text-sm text-ink/55">Dibuat {{ formatDate(transaction.createdAt) }}</p>
                </div>
              </div>
              <AppButton
                v-if="transaction.status === 'expired' || transaction.status === 'rejected'"
                to="/app/credits/buy"
                variant="secondary"
              >
                Buat Transaksi Baru
              </AppButton>
            </div>

            <div class="mt-6 rounded-lg border border-leaf/20 bg-mint p-4">
              <p class="text-sm font-bold text-leaf">{{ isPromoTransaction ? "Nilai klaim promo" : "Total yang harus ditransfer" }}</p>
              <div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-3xl font-bold text-ink">{{ formatCurrency(transaction.totalAmount) }}</p>
                <AppButton
                  v-if="canUploadProof && !isPromoTransaction"
                  type="button"
                  variant="secondary"
                  @click="copyText(transaction.totalAmount, 'Nominal transfer')"
                >
                  <Copy class="h-4 w-4" />
                  Salin Nominal
                </AppButton>
              </div>
              <p v-if="!isPromoTransaction" class="mt-3 text-sm leading-6 text-ink/65">
                Transfer persis sampai 3 digit terakhir. Jangan dibulatkan agar admin mudah mencocokkan pembayaran.
              </p>
              <p v-else class="mt-3 text-sm leading-6 text-ink/65">
                Transaksi ini berasal dari kode promo gratis. Tidak ada transfer, kode unik, atau upload bukti.
              </p>
            </div>

            <div class="mt-5 grid gap-3 rounded-lg border border-ink/10 bg-linen p-4">
              <div class="flex justify-between gap-4 text-sm">
                <span class="text-ink/55">Harga paket</span>
                <span class="font-semibold text-ink">{{ formatCurrency(transaction.baseAmount) }}</span>
              </div>
              <div v-if="!isPromoTransaction" class="flex justify-between gap-4 text-sm">
                <span class="text-ink/55">Kode unik</span>
                <span class="font-semibold text-ink">{{ transaction.uniqueCode }}</span>
              </div>
              <div v-if="isPromoTransaction" class="flex justify-between gap-4 text-sm">
                <span class="text-ink/55">Kode promo</span>
                <span class="font-semibold text-gold">{{ transaction.promoCode }}</span>
              </div>
              <div v-if="!isPromoTransaction" class="flex justify-between gap-4 text-sm">
                <span class="text-ink/55">Batas pembayaran</span>
                <span class="font-semibold text-ink">{{ formatDateTime(transaction.expiresAt) }}</span>
              </div>
            </div>

            <p v-if="transaction.adminNote" class="mt-5 rounded-md bg-gold/10 px-3 py-2 text-sm font-semibold text-ink">
              Catatan admin: {{ transaction.adminNote }}
            </p>
          </section>

          <section v-if="!isPromoTransaction" class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mint text-leaf">
                <Landmark class="h-5 w-5" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-ink">Metode pembayaran</h2>
                <p class="mt-1 text-sm leading-6 text-ink/60">
                  Gunakan transfer bank manual sesuai rekening tujuan dan nominal yang tertera.
                </p>
              </div>
            </div>

            <div class="mt-5 grid gap-3 rounded-lg border border-ink/10 bg-linen p-4">
              <div class="flex justify-between gap-4 text-sm">
                <span class="text-ink/55">Bank tujuan</span>
                <span class="text-right font-semibold text-ink">{{ paymentConfig.bankName }}</span>
              </div>
              <div class="flex flex-col gap-2 border-t border-ink/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-ink/55">Nomor rekening</p>
                  <p class="mt-1 font-semibold text-ink">{{ paymentConfig.accountNumber || "Belum diatur" }}</p>
                </div>
                <AppButton
                  v-if="paymentConfig.accountNumber"
                  type="button"
                  variant="secondary"
                  @click="copyText(paymentConfig.accountNumber, 'Nomor rekening')"
                >
                  <Copy class="h-4 w-4" />
                  Salin
                </AppButton>
              </div>
              <div class="flex justify-between gap-4 border-t border-ink/10 pt-3 text-sm">
                <span class="text-ink/55">Atas nama</span>
                <span class="text-right font-semibold text-ink">{{ paymentConfig.accountHolder }}</span>
              </div>
            </div>

            <p v-if="!isPaymentAccountReady" class="mt-4 rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
              Rekening pembayaran belum tersedia. Hubungi admin sebelum melakukan transfer.
            </p>
          </section>

          <section v-if="!isPromoTransaction" class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <h2 class="text-lg font-bold text-ink">Cara transfer</h2>
            <ol class="mt-4 grid gap-3 text-sm leading-6 text-ink/65">
              <li>1. Buka mobile banking, internet banking, ATM, atau e-wallet yang mendukung transfer bank.</li>
              <li>2. Pilih transfer ke bank tujuan, lalu masukkan nomor rekening di atas.</li>
              <li>3. Masukkan nominal persis: <strong class="text-ink">{{ formatCurrency(transaction.totalAmount) }}</strong>.</li>
              <li>4. Simpan atau screenshot bukti transfer yang menampilkan nominal, tanggal, dan rekening tujuan.</li>
              <li>5. Upload bukti transfer di panel kanan halaman ini.</li>
            </ol>

            <PaymentSupportCard class="mt-5" />
          </section>
        </div>

        <aside v-if="!isPromoTransaction" class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft lg:sticky lg:top-6 lg:self-start">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-rose/10 text-rose">
            <UploadCloud class="h-5 w-5" />
          </div>
          <h2 class="mt-4 text-lg font-bold text-ink">Upload bukti transfer</h2>
          <p class="mt-2 text-sm leading-6 text-ink/60">
            Upload JPG, PNG, atau WebP. Pastikan nominal dan tanggal transfer terbaca jelas.
          </p>

          <div class="mt-5 rounded-md border border-ink/10 bg-linen p-4">
            <p class="text-sm font-bold text-ink">Checklist sebelum upload</p>
            <ul class="mt-3 grid gap-2 text-sm leading-6 text-ink/60">
              <li>Total transfer sama dengan {{ formatCurrency(transaction.totalAmount) }}.</li>
              <li>Bukti menampilkan status transfer berhasil.</li>
              <li>Nama bank/rekening tujuan terlihat.</li>
            </ul>
          </div>

          <form v-if="canUploadProof" class="mt-5 space-y-4" @submit.prevent="submitProof">
            <label class="block">
              <span class="text-sm font-semibold text-ink">File bukti</span>
              <input
                class="focus-ring mt-2 block w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-mint file:px-3 file:py-2 file:text-sm file:font-semibold file:text-leaf"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="chooseFile"
              />
            </label>

            <p v-if="selectedFile" class="rounded-md bg-linen px-3 py-2 text-sm font-medium text-ink">
              {{ selectedFile.name }}
            </p>
            <div v-if="uploadError" class="rounded-md border border-rose/20 bg-rose/10 p-4">
              <p class="text-sm font-bold text-rose">{{ uploadError.title }}</p>
              <p class="mt-1 text-sm leading-6 text-rose/85">{{ uploadError.message }}</p>
              <div v-if="uploadError.actionLabel" class="mt-3">
                <AppButton
                  v-if="uploadError.actionTo"
                  :to="uploadError.actionTo"
                  variant="secondary"
                >
                  {{ uploadError.actionLabel }}
                </AppButton>
                <AppButton
                  v-else
                  type="button"
                  variant="secondary"
                  @click="uploadError = null"
                >
                  {{ uploadError.actionLabel }}
                </AppButton>
              </div>
            </div>

            <AppButton class="w-full" type="submit" :disabled="transactionStore.uploading">
              <Loader2 v-if="transactionStore.uploading" class="h-4 w-4 animate-spin" />
              Upload Bukti dan Minta Verifikasi
            </AppButton>
          </form>

          <div v-else-if="hasUploadedProof" class="mt-5 rounded-md border border-leaf/20 bg-leaf/10 p-4">
            <p class="text-sm font-bold text-leaf">Bukti transfer sudah diupload.</p>
            <p class="mt-1 text-sm leading-6 text-ink/65">
              Admin akan mencocokkan nominal dan bukti transfer. Kredit otomatis masuk setelah pembayaran disetujui.
            </p>
          </div>

          <div v-else class="mt-5 rounded-md border border-ink/10 bg-linen p-4">
            <p class="text-sm font-semibold text-ink">
              Upload bukti hanya tersedia saat status transaksi masih menunggu pembayaran.
            </p>
          </div>
        </aside>

        <aside v-else class="rounded-lg border border-leaf/20 bg-white p-5 shadow-soft lg:sticky lg:top-6 lg:self-start">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-leaf/10 text-leaf">
            <CheckCircle2 class="h-5 w-5" />
          </div>
          <h2 class="mt-4 text-lg font-bold text-ink">Promo berhasil</h2>
          <p class="mt-2 text-sm leading-6 text-ink/60">
            Kredit sudah masuk otomatis. Kamu bisa langsung membuat atau publish undangan jika saldo sudah cukup.
          </p>
          <AppButton class="mt-5 w-full" to="/app/dashboard">Ke Dashboard</AppButton>
        </aside>
      </div>
    </div>
  </section>
</template>
