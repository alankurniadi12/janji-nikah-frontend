<script setup>
import { computed, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, CalendarDays, ExternalLink, Image, Loader2, Lock, LockOpen, MapPin, Music, UsersRound } from "@lucide/vue";

import AdminInvitationUnlockDialog from "@/components/AdminInvitationUnlockDialog.vue";
import AdminPageHeader from "@/components/AdminPageHeader.vue";
import AppButton from "@/components/AppButton.vue";
import InvitationStatusBadge from "@/components/InvitationStatusBadge.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import { useToastStore } from "@/stores/toasts";
import { assetUrl } from "@/utils/assets";
import { formatDate, formatDateTime, formatEventDate } from "@/utils/formatters";

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const toastStore = useToastStore();
const unlockDialog = reactive({
  open: false,
  error: ""
});

onMounted(() => {
  adminStore.loadInvitation(route.params.id);
});

const invitation = computed(() => adminStore.currentInvitation);
const canUnlock = computed(() => invitation.value?.permissions?.canUnlock || invitation.value?.status === "locked");
const mainPhotoUrl = computed(() => assetUrl(invitation.value?.mainPhotoUrl || ""));
const groomPhotoUrl = computed(() => assetUrl(invitation.value?.groom?.photoUrl || ""));
const bridePhotoUrl = computed(() => assetUrl(invitation.value?.bride?.photoUrl || ""));
const galleryPhotoUrls = computed(() => (invitation.value?.galleryPhotoUrls || []).map(assetUrl).filter(Boolean));
const publicPath = computed(() => invitation.value?.links?.publicPath || "");
const previewPath = computed(() => invitation.value?.links?.previewPath || "");
const statusMessage = computed(() => {
  const status = invitation.value?.status;

  if (status === "locked") {
    return {
      icon: Lock,
      tone: "border-ink/10 bg-ink/5",
      title: "Data utama terkunci",
      message: "Edit data utama sudah lewat 24 jam. Admin hanya boleh unlock untuk kasus khusus yang tercatat."
    };
  }

  if (status === "active") {
    return {
      icon: LockOpen,
      tone: "border-leaf/20 bg-leaf/10",
      title: "Undangan aktif",
      message: "Undangan sudah publish. Pantau expiry, tamu, RSVP, ucapan, dan asetnya dari halaman ini."
    };
  }

  if (status === "expired") {
    return {
      icon: CalendarDays,
      tone: "border-rose/20 bg-rose/10",
      title: "Undangan expired",
      message: "Detail operasional bisa terbatas karena data expired dibersihkan sesuai aturan cleanup."
    };
  }

  return {
    icon: CalendarDays,
    tone: "border-gold/20 bg-gold/10",
    title: "Draft undangan",
    message: "Draft belum memakan kredit dan belum bisa dibuka melalui link publik tanpa preview."
  };
});

function openUnlockDialog() {
  unlockDialog.error = "";
  unlockDialog.open = true;
}

function closeUnlockDialog() {
  unlockDialog.open = false;
  unlockDialog.error = "";
}

async function confirmUnlock(note) {
  if (!invitation.value) {
    return;
  }

  unlockDialog.error = "";

  try {
    await adminStore.unlockInvitation(invitation.value.id, note);
    await adminStore.loadInvitation(invitation.value.id);
    closeUnlockDialog();
    toastStore.show("Undangan berhasil di-unlock.");
  } catch (requestError) {
    unlockDialog.error = getApiErrorMessage(requestError, "Undangan belum bisa di-unlock.");
  }
}

function eventTypeLabel(type) {
  const labels = {
    akad: "Akad",
    resepsi: "Resepsi"
  };

  return labels[type] || type || "Acara";
}

function ledgerTitle(type) {
  const labels = {
    purchase: "Pembelian kredit",
    publish: "Publish undangan",
    manual_adjustment: "Adjustment manual"
  };

  return labels[type] || "Aktivitas kredit";
}

function rsvpLabel(status) {
  const labels = {
    attending: "Hadir",
    not_attending: "Tidak hadir"
  };

  return labels[status] || "-";
}
</script>

<template>
  <section>
    <AdminPageHeader
      eyebrow="Detail undangan"
      title="Inspeksi undangan member"
      description="Cek data utama, aset, member pemilik, statistik tamu, dan aksi admin khusus."
    >
      <AppButton type="button" variant="secondary" @click="router.push('/admin/invitations')">
        <ArrowLeft class="h-4 w-4" />
        Kembali
      </AppButton>
    </AdminPageHeader>

    <div v-if="adminStore.loading" class="mt-8 flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <Loader2 class="h-5 w-5 animate-spin text-leaf" />
      <p class="text-sm font-semibold text-ink/70">Memuat detail undangan...</p>
    </div>

    <p v-else-if="adminStore.error" class="mt-8 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ adminStore.error }}
    </p>

    <div v-else-if="invitation" class="mt-8 space-y-6">
      <section class="rounded-lg border p-5 shadow-soft" :class="statusMessage.tone">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/80 text-ink">
              <component :is="statusMessage.icon" class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-ink">{{ statusMessage.title }}</h2>
              <p class="mt-1 text-sm leading-6 text-ink/65">{{ statusMessage.message }}</p>
            </div>
          </div>
          <InvitationStatusBadge :status="invitation.status" />
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div class="space-y-6">
          <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 class="text-2xl font-bold text-ink">{{ invitation.title }}</h2>
                <p class="mt-2 text-sm font-semibold text-ink/55">/{{ invitation.slug }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <a
                  v-if="publicPath && invitation.status !== 'draft'"
                  :href="publicPath"
                  target="_blank"
                  rel="noreferrer"
                  class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf"
                >
                  <ExternalLink class="h-4 w-4" />
                  Buka publik
                </a>
                <a
                  v-if="previewPath"
                  :href="previewPath"
                  target="_blank"
                  rel="noreferrer"
                  class="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf"
                >
                  Preview
                </a>
              </div>
            </div>

            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-md bg-linen p-4">
                <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Pengantin pria</p>
                <p class="mt-2 text-lg font-bold text-ink">{{ invitation.groom?.fullName || "-" }}</p>
                <p class="mt-1 text-sm text-ink/55">{{ invitation.groom?.parentsName || "Orang tua belum diisi" }}</p>
              </div>
              <div class="rounded-md bg-linen p-4">
                <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Pengantin wanita</p>
                <p class="mt-2 text-lg font-bold text-ink">{{ invitation.bride?.fullName || "-" }}</p>
                <p class="mt-1 text-sm text-ink/55">{{ invitation.bride?.parentsName || "Orang tua belum diisi" }}</p>
              </div>
            </div>
          </article>

          <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <h2 class="text-lg font-bold text-ink">Acara</h2>
            <div v-if="invitation.events?.length" class="mt-4 divide-y divide-ink/10">
              <div v-for="event in invitation.events" :key="`${event.type}-${event.date}-${event.startTime}`" class="grid gap-3 py-4 md:grid-cols-[140px_1fr]">
                <div>
                  <p class="font-bold text-ink">{{ eventTypeLabel(event.type) }}</p>
                  <p class="mt-1 text-sm text-ink/55">{{ event.startTime }}{{ event.endTime ? ` - ${event.endTime}` : "" }}</p>
                </div>
                <div class="space-y-2 text-sm">
                  <p class="flex gap-2 font-semibold text-ink">
                    <CalendarDays class="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                    {{ formatEventDate(event.date) }}
                  </p>
                  <p class="flex gap-2 leading-6 text-ink/60">
                    <MapPin class="mt-1 h-4 w-4 shrink-0 text-ink/35" />
                    {{ event.address }}
                  </p>
                  <a v-if="event.googleMapsUrl" :href="event.googleMapsUrl" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 text-sm font-semibold text-leaf">
                    <ExternalLink class="h-4 w-4" />
                    Buka maps
                  </a>
                </div>
              </div>
            </div>
            <p v-else class="mt-4 rounded-md bg-linen p-5 text-center text-sm font-semibold text-ink/55">
              Data acara belum diisi.
            </p>
          </article>

          <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <h2 class="text-lg font-bold text-ink">Aset dan preferensi</h2>
            <div class="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <div class="flex items-center gap-2 text-sm font-bold text-ink">
                  <Image class="h-4 w-4 text-leaf" />
                  Foto utama
                </div>
                <div class="mt-3 overflow-hidden rounded-md border border-ink/10 bg-linen">
                  <img v-if="mainPhotoUrl" :src="mainPhotoUrl" alt="Foto utama undangan" class="max-h-80 w-full object-contain" />
                  <p v-else class="p-5 text-center text-sm font-semibold text-ink/55">Belum ada foto utama.</p>
                </div>
              </div>
              <div class="space-y-4">
                <div class="rounded-md border border-ink/10 p-4">
                  <p class="text-sm text-ink/55">Foto pengantin</p>
                  <div class="mt-3 grid grid-cols-2 gap-3">
                    <div class="overflow-hidden rounded-md border border-ink/10 bg-linen">
                      <img v-if="groomPhotoUrl" :src="groomPhotoUrl" alt="Foto pengantin pria" class="aspect-[3/4] w-full object-cover" />
                      <p v-else class="flex aspect-[3/4] items-center justify-center p-3 text-center text-xs font-semibold text-ink/45">Pria belum ada</p>
                    </div>
                    <div class="overflow-hidden rounded-md border border-ink/10 bg-linen">
                      <img v-if="bridePhotoUrl" :src="bridePhotoUrl" alt="Foto pengantin wanita" class="aspect-[3/4] w-full object-cover" />
                      <p v-else class="flex aspect-[3/4] items-center justify-center p-3 text-center text-xs font-semibold text-ink/45">Wanita belum ada</p>
                    </div>
                  </div>
                </div>
                <div class="rounded-md border border-ink/10 p-4">
                  <p class="text-sm text-ink/55">Tema</p>
                  <p class="mt-1 font-bold text-ink">{{ invitation.theme?.name || invitation.themeId || "-" }}</p>
                  <p v-if="invitation.theme" class="mt-1 text-sm text-ink/55">{{ invitation.theme.key }} · {{ invitation.theme.isActive ? "Aktif" : "Nonaktif" }}</p>
                </div>
                <div class="rounded-md border border-ink/10 p-4">
                  <p class="flex items-center gap-2 text-sm text-ink/55">
                    <Music class="h-4 w-4" />
                    Musik
                  </p>
                  <p class="mt-1 font-bold text-ink">{{ invitation.music?.title || invitation.musicId || "-" }}</p>
                  <p v-if="invitation.music" class="mt-1 text-sm text-ink/55">{{ invitation.music.category || "Tanpa kategori" }}</p>
                </div>
                <div class="rounded-md border border-ink/10 p-4">
                  <p class="text-sm text-ink/55">Galeri</p>
                  <p class="mt-1 font-bold text-ink">{{ galleryPhotoUrls.length }} foto</p>
                </div>
              </div>
            </div>
            <div v-if="galleryPhotoUrls.length" class="mt-5 grid gap-3 sm:grid-cols-3">
              <img v-for="url in galleryPhotoUrls" :key="url" :src="url" alt="Foto galeri undangan" class="h-36 w-full rounded-md border border-ink/10 object-cover" />
            </div>
          </article>

          <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <h2 class="text-lg font-bold text-ink">Amplop digital</h2>
            <p class="mt-1 text-sm text-ink/55">{{ invitation.envelope?.isEnabled ? "Aktif" : "Nonaktif" }}</p>
            <div v-if="invitation.envelope?.methods?.length" class="mt-4 grid gap-3 md:grid-cols-2">
              <div v-for="method in invitation.envelope.methods" :key="`${method.type}-${method.providerName}-${method.accountNumber}`" class="rounded-md border border-ink/10 p-4 text-sm">
                <p class="font-bold capitalize text-ink">{{ method.type }} · {{ method.providerName }}</p>
                <p class="mt-2 text-ink/60">{{ method.accountNumber }}</p>
                <p class="mt-1 font-semibold text-ink">{{ method.accountHolder }}</p>
              </div>
            </div>
          </article>
        </div>

        <aside class="space-y-6">
          <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <h2 class="text-lg font-bold text-ink">Aksi admin</h2>
            <p class="mt-2 text-sm leading-6 text-ink/60">
              Unlock hanya untuk kasus khusus dan wajib memakai catatan audit.
            </p>
            <div class="mt-5 grid gap-2">
              <AppButton type="button" :disabled="adminStore.saving || !canUnlock" @click="openUnlockDialog">
                <LockOpen class="h-4 w-4" />
                Unlock
              </AppButton>
            </div>
            <p v-if="!canUnlock" class="mt-3 text-sm font-semibold text-ink/50">
              Aksi unlock hanya tersedia saat status undangan terkunci.
            </p>
          </article>

          <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <h2 class="text-lg font-bold text-ink">Member pemilik</h2>
            <div class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-ink/55">Nama</span>
                <span class="font-semibold text-ink">{{ invitation.member?.name || "-" }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-ink/55">Email</span>
                <span class="font-semibold text-ink">{{ invitation.member?.email || invitation.memberId }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-ink/55">Username</span>
                <span class="font-semibold text-ink">@{{ invitation.member?.username || "-" }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-ink/55">Saldo kredit</span>
                <span class="font-semibold text-ink">{{ invitation.member?.creditBalance ?? "-" }}</span>
              </div>
            </div>
            <AppButton v-if="invitation.member?.id" class="mt-5 w-full" type="button" variant="secondary" :to="{ name: 'admin-member-detail', params: { id: invitation.member.id } }">
              <UsersRound class="h-4 w-4" />
              Buka detail member
            </AppButton>
          </article>

          <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <h2 class="text-lg font-bold text-ink">Statistik</h2>
            <div class="mt-5 grid grid-cols-2 gap-3">
              <div class="rounded-md bg-linen p-4">
                <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Tamu</p>
                <p class="mt-2 text-2xl font-bold text-ink">{{ invitation.statistics?.guests?.total || 0 }}</p>
                <p class="mt-1 text-xs text-ink/55">{{ invitation.statistics?.guests?.sent || 0 }} terkirim · {{ invitation.statistics?.guests?.opened || 0 }} dibuka</p>
              </div>
              <div class="rounded-md bg-linen p-4">
                <p class="text-xs font-bold uppercase tracking-widest text-ink/45">RSVP</p>
                <p class="mt-2 text-2xl font-bold text-ink">{{ invitation.statistics?.rsvp?.total || 0 }}</p>
                <p class="mt-1 text-xs text-ink/55">{{ invitation.statistics?.rsvp?.attending || 0 }} hadir</p>
              </div>
              <div class="rounded-md bg-linen p-4">
                <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Ucapan</p>
                <p class="mt-2 text-2xl font-bold text-ink">{{ invitation.statistics?.wishes?.total || 0 }}</p>
                <p class="mt-1 text-xs text-ink/55">{{ invitation.statistics?.wishes?.hidden || 0 }} disembunyikan</p>
              </div>
              <div class="rounded-md bg-linen p-4">
                <p class="text-xs font-bold uppercase tracking-widest text-ink/45">Expired</p>
                <p class="mt-2 text-sm font-bold text-ink">{{ formatDate(invitation.expiresAt) }}</p>
                <p class="mt-1 text-xs text-ink/55">Publish {{ formatDate(invitation.publishedAt) }}</p>
              </div>
            </div>
          </article>

          <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <h2 class="text-lg font-bold text-ink">Riwayat status</h2>
            <div class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-ink/55">Dibuat</span>
                <span class="font-semibold text-ink">{{ formatDateTime(invitation.createdAt) }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-ink/55">Publish</span>
                <span class="font-semibold text-ink">{{ formatDateTime(invitation.publishedAt) }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-ink/55">Terkunci</span>
                <span class="font-semibold text-ink">{{ formatDateTime(invitation.lockedAt) }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-ink/55">Expired</span>
                <span class="font-semibold text-ink">{{ formatDateTime(invitation.expiredAt) }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-ink/55">Update terakhir</span>
                <span class="font-semibold text-ink">{{ formatDateTime(invitation.updatedAt) }}</span>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <section class="grid gap-6 xl:grid-cols-3">
        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Tamu terbaru</h2>
          <div v-if="invitation.recentGuests?.length" class="mt-4 divide-y divide-ink/10">
            <div v-for="guest in invitation.recentGuests" :key="guest.id" class="py-3 text-sm">
              <p class="font-bold text-ink">{{ guest.name }}</p>
              <p class="mt-1 text-ink/55">{{ guest.sentStatus === "sent" ? "Sudah dikirim" : "Belum dikirim" }} · dibuka {{ formatDateTime(guest.openedAt) }}</p>
            </div>
          </div>
          <p v-else class="mt-4 rounded-md bg-linen p-5 text-center text-sm font-semibold text-ink/55">Belum ada tamu.</p>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Ucapan terbaru</h2>
          <div v-if="invitation.recentWishes?.length" class="mt-4 divide-y divide-ink/10">
            <div v-for="wish in invitation.recentWishes" :key="wish.id" class="py-3 text-sm">
              <div class="flex items-center justify-between gap-3">
                <p class="font-bold text-ink">{{ wish.displayName }}</p>
                <span class="text-xs font-semibold text-ink/45">{{ rsvpLabel(wish.rsvpStatus) }}</span>
              </div>
              <p class="mt-1 leading-6 text-ink/60">{{ wish.message }}</p>
              <p v-if="wish.isHidden || wish.deletedAt" class="mt-2 text-xs font-semibold text-rose">
                {{ wish.deletedAt ? "Dihapus" : "Disembunyikan" }}
              </p>
            </div>
          </div>
          <p v-else class="mt-4 rounded-md bg-linen p-5 text-center text-sm font-semibold text-ink/55">Belum ada ucapan.</p>
        </article>

        <article class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Ledger publish</h2>
          <div v-if="invitation.creditLedgers?.length" class="mt-4 divide-y divide-ink/10">
            <div v-for="ledger in invitation.creditLedgers" :key="ledger.id" class="py-3 text-sm">
              <p class="font-bold text-ink">{{ ledgerTitle(ledger.type) }}</p>
              <p class="mt-1 text-ink/55">{{ ledger.amount > 0 ? "+" : "" }}{{ ledger.amount }} kredit · saldo {{ ledger.balanceAfter }}</p>
              <p v-if="ledger.note" class="mt-2 rounded-md bg-linen px-3 py-2 leading-6 text-ink/65">{{ ledger.note }}</p>
            </div>
          </div>
          <p v-else class="mt-4 rounded-md bg-linen p-5 text-center text-sm font-semibold text-ink/55">Belum ada ledger untuk undangan ini.</p>
        </article>
      </section>
    </div>

    <AdminInvitationUnlockDialog
      :open="unlockDialog.open"
      :invitation="invitation"
      :loading="adminStore.saving"
      :error="unlockDialog.error"
      @cancel="closeUnlockDialog"
      @confirm="confirmUnlock"
    />
  </section>
</template>
