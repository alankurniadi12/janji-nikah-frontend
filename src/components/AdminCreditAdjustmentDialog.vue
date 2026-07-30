<script setup>
import { computed, ref, watch } from "vue";
import { AlertCircle, Loader2, WalletCards } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  member: {
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
const amount = ref(0);
const reason = ref("");
const validationError = ref("");
const amountNumber = computed(() => Number(amount.value || 0));
const balanceAfter = computed(() => Number(props.member?.creditBalance || 0) + amountNumber.value);

watch(
  () => [props.open, props.member?.id],
  () => {
    if (props.open) {
      amount.value = 0;
      reason.value = "";
      validationError.value = "";
    }
  }
);

function confirm() {
  validationError.value = "";

  if (!Number.isInteger(amountNumber.value) || amountNumber.value === 0) {
    validationError.value = "Jumlah adjustment wajib berupa angka bulat selain 0.";
    return;
  }

  if (balanceAfter.value < 0) {
    validationError.value = "Saldo kredit member tidak boleh menjadi negatif.";
    return;
  }

  if (!reason.value.trim()) {
    validationError.value = "Alasan adjustment wajib diisi.";
    return;
  }

  emit("confirm", {
    amount: amountNumber.value,
    reason: reason.value.trim()
  });
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open && member" class="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 px-4">
      <section class="w-full max-w-lg rounded-lg bg-white p-6 shadow-soft">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gold/20 bg-gold/10 text-gold">
            <WalletCards class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-ink">Adjustment kredit member</h2>
            <p class="mt-2 text-sm leading-6 text-ink/65">
              Perubahan saldo kredit akan dicatat di ledger dan audit log. Pastikan alasan jelas.
            </p>
          </div>
        </div>

        <div class="mt-5 rounded-md bg-linen p-4 text-sm">
          <p class="font-bold text-ink">{{ member.name }}</p>
          <p class="mt-1 text-ink/55">{{ member.email }} · saldo {{ member.creditBalance }} kredit</p>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-[150px_1fr]">
          <div>
            <label class="block text-sm font-semibold text-ink" for="creditAdjustmentAmount">Jumlah</label>
            <input
              id="creditAdjustmentAmount"
              v-model.number="amount"
              class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
              type="number"
              placeholder="+/- kredit"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-ink" for="creditAdjustmentReason">Alasan</label>
            <input
              id="creditAdjustmentReason"
              v-model.trim="reason"
              class="focus-ring mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
              placeholder="Contoh: koreksi manual pembayaran"
            />
          </div>
        </div>

        <p class="mt-4 rounded-md bg-linen px-3 py-2 text-sm font-semibold text-ink/70">
          Saldo setelah adjustment: {{ balanceAfter }} kredit
        </p>

        <p v-if="validationError || error" class="mt-3 flex gap-2 rounded-md bg-rose/10 px-3 py-2 text-sm font-semibold text-rose">
          <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
          {{ validationError || error }}
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton type="button" variant="secondary" :disabled="loading" @click="emit('cancel')">Batal</AppButton>
          <AppButton type="button" :disabled="loading" @click="confirm">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            Simpan adjustment
          </AppButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>
