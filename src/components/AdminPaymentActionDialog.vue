<script setup>
import { computed, ref, watch } from "vue";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { formatCurrency } from "@/utils/formatters";

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: "approve"
  },
  transaction: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["cancel", "confirm"]);
const note = ref("");
const validationError = ref("");

const isReject = computed(() => props.mode === "reject");
const title = computed(() => (isReject.value ? "Tolak pembayaran?" : "Approve pembayaran?"));
const confirmLabel = computed(() => (isReject.value ? "Tolak pembayaran" : "Approve pembayaran"));
const icon = computed(() => (isReject.value ? XCircle : CheckCircle2));
const tone = computed(() => (isReject.value ? "border-rose/20 bg-rose/10 text-rose" : "border-leaf/20 bg-leaf/10 text-leaf"));
const message = computed(() =>
  isReject.value
    ? "Catatan penolakan akan terlihat sebagai alasan admin pada transaksi member."
    : "Pastikan nominal transfer, kode unik, dan bukti pembayaran sudah cocok sebelum kredit ditambahkan."
);

watch(
  () => [props.open, props.mode, props.transaction?.id],
  () => {
    if (props.open) {
      note.value = "";
      validationError.value = "";
    }
  }
);

function confirm() {
  validationError.value = "";

  if (isReject.value && !note.value.trim()) {
    validationError.value = "Catatan penolakan wajib diisi.";
    return;
  }

  emit("confirm", note.value.trim());
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open && transaction" class="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 px-4">
      <section class="w-full max-w-lg rounded-lg bg-white p-6 shadow-soft">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border" :class="tone">
            <component :is="icon" class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-ink">{{ title }}</h2>
            <p class="mt-2 text-sm leading-6 text-ink/65">{{ message }}</p>
          </div>
        </div>

        <div class="mt-5 rounded-md bg-linen p-4">
          <div class="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p class="text-ink/50">Member</p>
              <p class="mt-1 font-bold text-ink">{{ transaction.member?.name || transaction.member?.email || transaction.memberId }}</p>
            </div>
            <div>
              <p class="text-ink/50">Total bayar</p>
              <p class="mt-1 font-bold text-ink">{{ formatCurrency(transaction.totalAmount) }}</p>
            </div>
            <div>
              <p class="text-ink/50">Kredit</p>
              <p class="mt-1 font-bold text-ink">{{ transaction.creditAmount }} kredit</p>
            </div>
            <div>
              <p class="text-ink/50">Kode unik</p>
              <p class="mt-1 font-bold text-ink">{{ transaction.uniqueCode }}</p>
            </div>
          </div>
        </div>

        <label class="mt-5 block text-sm font-semibold text-ink" for="paymentActionNote">
          {{ isReject ? "Catatan penolakan" : "Catatan admin" }}
        </label>
        <textarea
          id="paymentActionNote"
          v-model="note"
          class="focus-ring mt-2 min-h-28 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          :placeholder="isReject ? 'Contoh: nominal transfer tidak sesuai atau bukti belum jelas.' : 'Optional, misalnya nominal sudah cocok dengan mutasi.'"
        />

        <p v-if="validationError || error" class="mt-3 flex gap-2 rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
          <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
          {{ validationError || error }}
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton type="button" variant="secondary" :disabled="loading" @click="emit('cancel')">Batal</AppButton>
          <AppButton type="button" :disabled="loading" @click="confirm">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            {{ confirmLabel }}
          </AppButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>
