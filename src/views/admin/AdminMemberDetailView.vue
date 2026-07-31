<script setup>
import { computed, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, CreditCard, FileText, Loader2, ReceiptText, ShieldCheck, UserRound, WalletCards } from "@lucide/vue";

import AdminCreditAdjustmentDialog from "@/components/AdminCreditAdjustmentDialog.vue";
import AdminMemberStatusDialog from "@/components/AdminMemberStatusDialog.vue";
import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import { useToastStore } from "@/stores/toasts";
import { formatDateTime } from "@/utils/formatters";

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const toastStore = useToastStore();
const statusDialog = reactive({
  open: false,
  status: "active",
  error: ""
});
const creditDialog = reactive({
  open: false,
  error: ""
});

onMounted(() => {
  adminStore.loadMember(route.params.id);
});

const member = computed(() => adminStore.currentMember);
const activityItems = computed(() => member.value?.activity?.items || []);
const statusTone = computed(() => {
  const tones = {
    active: "border-leaf/20 bg-leaf/10 text-leaf",
    suspended: "border-gold/20 bg-gold/10 text-gold",
    blocked: "border-rose/20 bg-rose/10 text-rose"
  };

  return tones[member.value?.status] || "border-ink/15 bg-ink/5 text-ink/70";
});
const activityMeta = {
  transaction: {
    icon: ReceiptText,
    tone: "border-gold/20 bg-gold/10 text-gold"
  },
  invitation: {
    icon: FileText,
    tone: "border-leaf/20 bg-leaf/10 text-leaf"
  },
  credit: {
    icon: CreditCard,
    tone: "border-rose/20 bg-rose/10 text-rose"
  }
};
const statusLabel = computed(() => {
  const labels = {
    active: "Active",
    suspended: "Suspended",
    blocked: "Blocked"
  };

  return labels[member.value?.status] || member.value?.status || "-";
});

function openStatusDialog(status) {
  statusDialog.status = status;
  statusDialog.error = "";
  statusDialog.open = true;
}

function closeStatusDialog() {
  statusDialog.open = false;
  statusDialog.error = "";
}

async function confirmStatusChange() {
  if (!member.value) {
    return;
  }

  statusDialog.error = "";

  try {
    await adminStore.updateMemberStatus(member.value.id, statusDialog.status);
    await adminStore.loadMember(member.value.id);
    closeStatusDialog();
    toastStore.show("Status member berhasil diubah.");
  } catch (requestError) {
    statusDialog.error = getApiErrorMessage(requestError, "Status member belum bisa diubah.");
  }
}

function openCreditDialog() {
  creditDialog.error = "";
  creditDialog.open = true;
}

function closeCreditDialog() {
  creditDialog.open = false;
  creditDialog.error = "";
}

async function confirmCreditAdjustment(payload) {
  if (!member.value) {
    return;
  }

  creditDialog.error = "";

  try {
    await adminStore.adjustMemberCredits(member.value.id, payload);
    await adminStore.loadMember(member.value.id);
    closeCreditDialog();
    toastStore.show("Kredit member berhasil diadjust.");
  } catch (requestError) {
    creditDialog.error = getApiErrorMessage(requestError, "Kredit member belum bisa diadjust.");
  }
}
</script>

<template>
  <section>
    <AdminPageHeader
      eyebrow="Detail member"
      title="Kelola detail member"
      description="Pantau profil member, status akun, saldo kredit, dan tindakan admin yang sensitif."
    >
      <AppButton type="button" variant="secondary" @click="router.push('/admin/members')">
        <ArrowLeft class="h-4 w-4" />
        Kembali
      </AppButton>
    </AdminPageHeader>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat detail member...</p>
    </div>

    <p v-else-if="adminStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ adminStore.error }}
    </p>

    <div v-else-if="member" class="mt-8 space-y-6">
      <section class="grid gap-6 xl:grid-cols-[1fr_360px]">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-start">
            <img
              v-if="member.avatarUrl"
              :src="member.avatarUrl"
              :alt="member.name"
              class="h-20 w-20 rounded-lg object-cover"
            />
            <div v-else class="flex h-20 w-20 items-center justify-center rounded-lg bg-mint text-leaf">
              <UserRound class="h-9 w-9" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <h2 class="text-2xl font-bold text-ink">{{ member.name }}</h2>
                <span class="inline-flex rounded-full border px-2.5 py-1 text-xs font-bold" :class="statusTone">{{ statusLabel }}</span>
              </div>
              <p class="mt-2 text-sm text-ink/60">{{ member.email }}</p>
              <p class="mt-1 text-sm font-semibold text-ink/60">@{{ member.username || "-" }}</p>
            </div>
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div class="rounded-md bg-linen p-4">
              <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Saldo kredit</p>
              <p class="mt-2 text-2xl font-bold text-leaf">{{ member.creditBalance }} kredit</p>
            </div>
            <div class="rounded-md bg-linen p-4">
              <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Role</p>
              <p class="mt-2 text-lg font-bold capitalize text-ink">{{ member.role }}</p>
            </div>
          </div>

          <div class="mt-6 border-t border-ink/10 pt-5">
            <h3 class="text-sm font-bold uppercase tracking-widest text-ink/45">Informasi akun</h3>
            <div class="mt-4 grid gap-3 text-sm lg:grid-cols-3">
              <div>
                <p class="text-ink/55">Bergabung</p>
                <p class="mt-1 font-semibold text-ink">{{ formatDateTime(member.createdAt) }}</p>
              </div>
              <div>
                <p class="text-ink/55">Terms accepted</p>
                <p class="mt-1 font-semibold text-ink">{{ formatDateTime(member.termsAcceptedAt) }}</p>
              </div>
              <div>
                <p class="text-ink/55">Username terakhir diubah</p>
                <p class="mt-1 font-semibold text-ink">{{ formatDateTime(member.lastUsernameChangedAt) }}</p>
              </div>
            </div>
          </div>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Aksi admin</h2>
          <p class="mt-2 text-sm leading-6 text-ink/60">
            Semua aksi penting memakai popup konfirmasi agar tidak terjadi salah klik.
          </p>
          <div class="mt-5 grid gap-2">
            <AppButton type="button" variant="secondary" :disabled="adminStore.saving || member.status === 'active'" @click="openStatusDialog('active')">
              <ShieldCheck class="h-4 w-4" />
              Aktifkan
            </AppButton>
            <AppButton type="button" variant="secondary" :disabled="adminStore.saving || member.status === 'suspended'" @click="openStatusDialog('suspended')">
              Suspend
            </AppButton>
            <AppButton type="button" variant="ghost" :disabled="adminStore.saving || member.status === 'blocked'" @click="openStatusDialog('blocked')">
              Block
            </AppButton>
            <AppButton type="button" :disabled="adminStore.saving" @click="openCreditDialog">
              <WalletCards class="h-4 w-4" />
              Adjustment kredit
            </AppButton>
          </div>
          <p class="mt-4 border-t border-ink/10 pt-4 text-xs leading-5 text-ink/45">
            Adjustment kredit wajib memakai alasan dan tercatat di ledger serta audit log.
          </p>
        </article>
      </section>

      <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-bold text-ink">Aktivitas member</h2>
            <p class="mt-1 text-sm text-ink/55">Transaksi, undangan, dan perubahan kredit terbaru.</p>
          </div>
          <p class="text-sm font-semibold text-ink/50">{{ activityItems.length }} aktivitas terbaru</p>
        </div>

        <div v-if="activityItems.length" class="mt-5 divide-y divide-ink/10">
          <article
            v-for="item in activityItems"
            :key="item.id"
            class="grid gap-4 py-4 md:grid-cols-[42px_1fr_180px] md:items-start"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-md border"
              :class="(activityMeta[item.type] || activityMeta.transaction).tone"
            >
              <component :is="(activityMeta[item.type] || activityMeta.transaction).icon" class="h-5 w-5" />
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-bold text-ink">{{ item.title }}</p>
                <span class="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-semibold capitalize text-ink/55">{{ item.type }}</span>
              </div>
              <p class="mt-1 text-sm leading-6 text-ink/60">{{ item.description }}</p>
              <p v-if="item.note" class="mt-2 rounded-md bg-linen px-3 py-2 text-sm leading-6 text-ink/65">{{ item.note }}</p>
            </div>
            <p class="text-sm font-semibold text-ink/50 md:text-right">{{ formatDateTime(item.createdAt) }}</p>
          </article>
        </div>
        <p v-else class="mt-5 rounded-md bg-linen p-5 text-center text-sm font-semibold text-ink/55">
          Belum ada aktivitas transaksi, undangan, atau kredit untuk member ini.
        </p>
      </section>
    </div>

    <AdminMemberStatusDialog
      :open="statusDialog.open"
      :member="member"
      :status="statusDialog.status"
      :loading="adminStore.saving"
      :error="statusDialog.error"
      @cancel="closeStatusDialog"
      @confirm="confirmStatusChange"
    />

    <AdminCreditAdjustmentDialog
      :open="creditDialog.open"
      :member="member"
      :loading="adminStore.saving"
      :error="creditDialog.error"
      @cancel="closeCreditDialog"
      @confirm="confirmCreditAdjustment"
    />
  </section>
</template>
