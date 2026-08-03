<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { Check, Copy, Download, Loader2, Search, Trash2 } from "@lucide/vue";

import whatsappIconUrl from "@/assets/ic-whatsapp.png";
import AppButton from "@/components/AppButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { getApiErrorMessage } from "@/lib/api";
import { useGuestStore } from "@/stores/guests";
import { useInvitationStore } from "@/stores/invitations";
import { useToastStore } from "@/stores/toasts";
import { formatDate } from "@/utils/formatters";

const route = useRoute();
const guestStore = useGuestStore();
const invitationStore = useInvitationStore();
const toastStore = useToastStore();
const error = ref("");
const pendingDelete = ref(null);
const activeTab = ref("guests");
const guestSearch = ref("");
const sentFilter = ref("all");
const wishFilter = ref("all");
const form = reactive({
  name: "",
  bulkNames: ""
});

onMounted(async () => {
  await Promise.all([
    invitationStore.loadInvitation(route.params.id),
    guestStore.loadGuests(route.params.id),
    guestStore.loadWishes(route.params.id)
  ]);
});

const invitation = computed(() => invitationStore.current);
const hostViewUrl = computed(() => {
  if (!invitation.value?.hostViewUrl) {
    return "";
  }

  return new URL(invitation.value.hostViewUrl, window.location.origin).toString();
});
const sentCount = computed(() => guestStore.guests.filter((guest) => guest.sentStatus === "sent").length);
const unsentCount = computed(() => guestStore.guests.length - sentCount.value);
const hiddenWishCount = computed(() => guestStore.wishes.filter((wish) => wish.isHidden).length);
const visibleWishCount = computed(() => guestStore.wishes.length - hiddenWishCount.value);
const filteredGuests = computed(() => {
  const keyword = guestSearch.value.trim().toLowerCase();

  return guestStore.guests.filter((guest) => {
    const matchesSearch =
      !keyword ||
      guest.name.toLowerCase().includes(keyword) ||
      absoluteLink(guest.link).toLowerCase().includes(keyword);
    const matchesStatus = sentFilter.value === "all" || guest.sentStatus === sentFilter.value;

    return matchesSearch && matchesStatus;
  });
});
const filteredWishes = computed(() => {
  if (wishFilter.value === "hidden") {
    return guestStore.wishes.filter((wish) => wish.isHidden);
  }

  if (wishFilter.value === "visible") {
    return guestStore.wishes.filter((wish) => !wish.isHidden);
  }

  return guestStore.wishes;
});

function absoluteLink(link) {
  if (!link) {
    return "";
  }

  return new URL(link, window.location.origin).toString();
}

async function copyText(text, message = "Berhasil disalin.") {
  error.value = "";

  try {
    await navigator.clipboard.writeText(text);
    toastStore.show(message);
  } catch {
    error.value = "Browser belum mengizinkan copy otomatis. Salin teks secara manual dari link yang tampil.";
  }
}

async function addGuest() {
  error.value = "";

  try {
    await guestStore.create(route.params.id, form.name);
    form.name = "";
    toastStore.show("Tamu berhasil ditambahkan.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Tamu belum bisa ditambahkan.");
  }
}

async function addBulkGuests() {
  error.value = "";

  try {
    const guests = await guestStore.bulkCreate(route.params.id, form.bulkNames);
    form.bulkNames = "";
    toastStore.show(`${guests.length} tamu berhasil ditambahkan.`);
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Daftar tamu belum bisa ditambahkan.");
  }
}

async function copyWhatsapp(guest) {
  error.value = "";

  try {
    const data = await guestStore.loadWhatsappMessage(route.params.id, guest.id);
    await copyText(data.message, "Pesan WhatsApp berhasil disalin.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Pesan WhatsApp belum bisa dibuat.");
  }
}

async function copyAllGuestLinks() {
  if (!guestStore.guests.length) {
    error.value = "Belum ada tamu yang bisa disalin.";
    return;
  }

  const rows = guestStore.guests.map((guest) => `${guest.name}\t${absoluteLink(guest.link)}`);
  await copyText(["Nama Tamu\tLink Personal", ...rows].join("\n"), "Semua link tamu berhasil disalin.");
}

async function copyHostViewUrl() {
  if (!hostViewUrl.value) {
    error.value = "Link laporan calon pengantin belum tersedia. Publish undangan dulu, lalu buka ulang halaman ini.";
    return;
  }

  await copyText(hostViewUrl.value, "Link laporan calon pengantin berhasil disalin.");
}

function downloadGuestLinksCsv() {
  error.value = "";

  if (!guestStore.guests.length) {
    error.value = "Belum ada tamu yang bisa diunduh.";
    return;
  }

  const rows = [
    ["Nama Tamu", "Link Personal", "Status Kirim"],
    ...guestStore.guests.map((guest) => [
      guest.name,
      absoluteLink(guest.link),
      guest.sentStatus === "sent" ? "Sudah dikirim" : "Belum dikirim"
    ])
  ];
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug = invitation.value?.slug || "undangan";

  link.href = url;
  link.download = `daftar-link-tamu-${slug}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toastStore.show("CSV daftar link tamu berhasil diunduh.");
}

function escapeCsvCell(value) {
  return `"${String(value || "").replaceAll('"', '""')}"`;
}

async function markSent(guest) {
  error.value = "";

  try {
    await guestStore.markSent(route.params.id, guest.id);
    toastStore.show("Tamu ditandai sudah dikirim.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Tamu belum bisa ditandai sudah dikirim.");
  }
}

function requestRemoveGuest(guest) {
  pendingDelete.value = {
    type: "guest",
    item: guest,
    title: "Hapus tamu?",
    message: "Apakah kamu yakin ingin menghapus tamu ini? Link personal tamu ini tidak bisa dipakai lagi setelah dihapus.",
    detail: guest.name,
    confirmLabel: "Ya, Hapus Tamu"
  };
}

async function removeGuest(guest) {
  error.value = "";

  try {
    await guestStore.remove(route.params.id, guest.id);
    toastStore.show("Tamu berhasil dihapus.");
    pendingDelete.value = null;
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Tamu belum bisa dihapus.");
  }
}

async function hideWish(wish) {
  error.value = "";

  try {
    await guestStore.hideWish(route.params.id, wish.id);
    toastStore.show("Ucapan berhasil disembunyikan.");
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Ucapan belum bisa disembunyikan.");
  }
}

function requestDeleteWish(wish) {
  pendingDelete.value = {
    type: "wish",
    item: wish,
    title: "Hapus ucapan?",
    message: "Apakah kamu yakin ingin menghapus ucapan ini? Ucapan yang dihapus tidak bisa dikembalikan.",
    detail: `${wish.displayName}: ${wish.message}`,
    confirmLabel: "Ya, Hapus Ucapan"
  };
}

async function deleteWish(wish) {
  error.value = "";

  try {
    await guestStore.deleteWish(route.params.id, wish.id);
    toastStore.show("Ucapan berhasil dihapus.");
    pendingDelete.value = null;
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Ucapan belum bisa dihapus.");
  }
}

async function confirmDelete() {
  if (!pendingDelete.value) {
    return;
  }

  if (pendingDelete.value.type === "guest") {
    await removeGuest(pendingDelete.value.item);
    return;
  }

  if (pendingDelete.value.type === "wish") {
    await deleteWish(pendingDelete.value.item);
  }
}

function rsvpStatusLabel(status) {
  if (status === "attending") {
    return "Hadir";
  }

  if (status === "not_attending") {
    return "Tidak hadir";
  }

  return "Belum RSVP";
}

function rsvpStatusClass(status) {
  if (status === "attending") {
    return "border-leaf/20 bg-leaf/10 text-leaf";
  }

  if (status === "not_attending") {
    return "border-rose/20 bg-rose/10 text-rose";
  }

  return "border-ink/10 bg-white text-ink/50";
}
</script>

<template>
  <section>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Daftar tamu</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">
          {{ invitation?.title || "Undangan" }}
        </h1>
        <p class="mt-2 max-w-2xl leading-7 text-ink/65">
          Tambahkan tamu, salin link personal, salin pesan WhatsApp, dan tandai undangan yang sudah dikirim.
        </p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row">
        <AppButton
          v-if="hostViewUrl && invitation?.status !== 'draft'"
          type="button"
          variant="secondary"
          @click="copyHostViewUrl"
        >
          <Copy class="h-4 w-4" />
          Salin Link Laporan
        </AppButton>
        <AppButton
          v-if="invitation"
          :to="{ name: 'member-invitation-detail', params: { id: invitation.id } }"
          variant="secondary"
        >
          Edit Undangan
        </AppButton>
      </div>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-4">
      <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <p class="text-sm font-medium text-ink/55">Total tamu</p>
        <p class="mt-2 text-3xl font-bold text-ink">{{ guestStore.guests.length }}</p>
      </section>
      <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <p class="text-sm font-medium text-ink/55">Sudah dikirim</p>
        <p class="mt-2 text-3xl font-bold text-ink">{{ sentCount }}</p>
      </section>
      <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <p class="text-sm font-medium text-ink/55">Belum dikirim</p>
        <p class="mt-2 text-3xl font-bold text-ink">{{ unsentCount }}</p>
      </section>
      <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <p class="text-sm font-medium text-ink/55">Ucapan masuk</p>
        <p class="mt-2 text-3xl font-bold text-ink">{{ guestStore.wishes.length }}</p>
      </section>
    </div>

    <p v-if="error || guestStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ error || guestStore.error }}
    </p>

    <div class="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside class="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Tambah satu tamu</h2>
          <p class="mt-2 text-sm leading-6 text-ink/60">
            Gunakan form ini kalau ingin menambahkan tamu satu per satu, misalnya setelah menerima nama tambahan dari klien.
          </p>
          <form class="mt-4 space-y-3" @submit.prevent="addGuest">
            <label class="block text-sm font-semibold text-ink" for="guestName">Nama tamu</label>
            <input
              id="guestName"
              v-model.trim="form.name"
              class="focus-ring h-11 w-full rounded-md border border-ink/15 px-3 text-sm"
              placeholder="Contoh: Bapak/Ibu Andi"
            />
            <p class="text-xs leading-5 text-ink/50">
              Setelah ditambahkan, sistem otomatis membuat link personal untuk tamu ini.
            </p>
            <AppButton class="w-full" type="submit" :disabled="guestStore.saving">
              <Loader2 v-if="guestStore.saving" class="h-4 w-4 animate-spin" />
              Tambah Tamu
            </AppButton>
          </form>
        </section>

        <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
          <h2 class="text-lg font-bold text-ink">Tambah banyak tamu</h2>
          <p class="mt-2 text-sm leading-6 text-ink/60">
            Gunakan form ini kalau sudah punya daftar nama dari WhatsApp, spreadsheet, atau catatan. Tempel semua nama sekaligus.
          </p>
          <form class="mt-4 space-y-3" @submit.prevent="addBulkGuests">
            <label class="block text-sm font-semibold text-ink" for="bulkNames">Daftar nama tamu</label>
            <textarea
              id="bulkNames"
              v-model="form.bulkNames"
              class="focus-ring min-h-36 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
              placeholder="Contoh:&#10;Bapak Andi&#10;Ibu Sari&#10;Keluarga Pak Budi"
            />
            <p class="text-xs leading-5 text-ink/50">
              Tulis satu nama per baris. Setiap nama akan dibuatkan link undangan personal.
            </p>
            <AppButton class="w-full" type="submit" :disabled="guestStore.saving">
              <Loader2 v-if="guestStore.saving" class="h-4 w-4 animate-spin" />
              Tambah Semua Tamu
            </AppButton>
          </form>
        </section>
      </aside>

      <section class="rounded-lg border border-ink/10 bg-white shadow-soft">
        <div class="border-b border-ink/10 p-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-bold text-ink">Kelola pengiriman dan ucapan</h2>
              <p class="mt-1 text-sm leading-6 text-ink/55">
                Pantau link personal, status kirim, dan ucapan tamu dari satu area kerja.
              </p>
            </div>
            <div class="inline-flex rounded-md border border-ink/10 bg-linen p-1">
              <button
                class="focus-ring rounded px-3 py-2 text-sm font-bold transition"
                :class="activeTab === 'guests' ? 'bg-white text-leaf shadow-sm' : 'text-ink/55 hover:text-ink'"
                type="button"
                @click="activeTab = 'guests'"
              >
                Daftar Tamu
                <span class="ml-1 text-xs text-ink/45">{{ guestStore.guests.length }}</span>
              </button>
              <button
                class="focus-ring rounded px-3 py-2 text-sm font-bold transition"
                :class="activeTab === 'wishes' ? 'bg-white text-leaf shadow-sm' : 'text-ink/55 hover:text-ink'"
                type="button"
                @click="activeTab = 'wishes'"
              >
                Ucapan
                <span class="ml-1 text-xs text-ink/45">{{ guestStore.wishes.length }}</span>
              </button>
            </div>
          </div>
        </div>

        <template v-if="activeTab === 'guests'">
          <div class="border-b border-ink/10 p-5">
            <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_auto] lg:items-center">
              <label class="relative block">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                <input
                  v-model="guestSearch"
                  class="focus-ring h-11 w-full rounded-md border border-ink/15 pl-10 pr-3 text-sm"
                  placeholder="Cari nama tamu atau link"
                />
              </label>
              <select v-model="sentFilter" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm font-semibold text-ink">
                <option value="all">Semua status</option>
                <option value="not_sent">Belum dikirim</option>
                <option value="sent">Sudah dikirim</option>
              </select>
              <div class="flex flex-col gap-2 sm:flex-row lg:justify-end">
                <AppButton type="button" variant="secondary" :disabled="!guestStore.guests.length" @click="copyAllGuestLinks">
                  <Copy class="h-4 w-4" />
                  Salin Semua
                </AppButton>
                <AppButton type="button" variant="secondary" :disabled="!guestStore.guests.length" @click="downloadGuestLinksCsv">
                  <Download class="h-4 w-4" />
                  Unduh CSV
                </AppButton>
              </div>
            </div>
          </div>

          <div v-if="guestStore.loading" class="flex items-center gap-3 p-5">
            <Loader2 class="h-5 w-5 animate-spin text-leaf" />
            <p class="text-sm font-semibold text-ink/70">Memuat tamu...</p>
          </div>

          <div v-else-if="filteredGuests.length" class="max-h-[640px] overflow-y-auto divide-y divide-ink/10">
            <article v-for="guest in filteredGuests" :key="guest.id" class="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_130px_196px] lg:items-center">
              <div class="min-w-0">
                <p class="font-bold text-ink">{{ guest.name }}</p>
                <p class="mt-1 break-all text-sm text-ink/55">{{ absoluteLink(guest.link) }}</p>
              </div>
              <span
                class="inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-bold"
                :class="guest.sentStatus === 'sent' ? 'border-leaf/20 bg-leaf/10 text-leaf' : 'border-gold/20 bg-gold/10 text-gold'"
              >
                {{ guest.sentStatus === "sent" ? "Sudah dikirim" : "Belum dikirim" }}
              </span>
              <div class="flex flex-wrap justify-start gap-2 lg:justify-end">
                <button
                  class="focus-ring rounded-md p-2 text-ink/60 hover:bg-mint hover:text-leaf"
                  type="button"
                  title="Salin link"
                  @click="copyText(absoluteLink(guest.link), 'Link tamu berhasil disalin.')"
                >
                  <Copy class="h-4 w-4" />
                </button>
                <button
                  class="focus-ring rounded-md p-1.5 text-ink/60 hover:bg-mint hover:text-leaf"
                  type="button"
                  title="Salin pesan WhatsApp"
                  aria-label="Salin pesan WhatsApp"
                  @click="copyWhatsapp(guest)"
                >
                  <img :src="whatsappIconUrl" alt="" class="h-5 w-5" />
                </button>
                <button
                  class="focus-ring rounded-md p-2 text-ink/60 hover:bg-mint hover:text-leaf"
                  type="button"
                  title="Tandai sudah dikirim"
                  @click="markSent(guest)"
                >
                  <Check class="h-4 w-4" />
                </button>
                <button
                  class="focus-ring rounded-md p-2 text-rose hover:bg-rose/10"
                  type="button"
                  title="Hapus tamu"
                  @click="requestRemoveGuest(guest)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </article>
          </div>

          <p v-else class="p-8 text-center text-sm font-semibold text-ink/55">
            {{ guestStore.guests.length ? "Tidak ada tamu yang cocok dengan pencarian/filter." : "Belum ada tamu." }}
          </p>
        </template>

        <template v-else>
          <div class="border-b border-ink/10 p-5">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div class="grid grid-cols-3 gap-2 text-center text-sm">
                <div class="rounded-md bg-linen px-3 py-2">
                  <p class="font-bold text-ink">{{ guestStore.wishes.length }}</p>
                  <p class="mt-1 text-xs text-ink/50">Semua</p>
                </div>
                <div class="rounded-md bg-mint px-3 py-2">
                  <p class="font-bold text-leaf">{{ visibleWishCount }}</p>
                  <p class="mt-1 text-xs text-ink/50">Tampil</p>
                </div>
                <div class="rounded-md bg-gold/10 px-3 py-2">
                  <p class="font-bold text-gold">{{ hiddenWishCount }}</p>
                  <p class="mt-1 text-xs text-ink/50">Disembunyikan</p>
                </div>
              </div>
              <select v-model="wishFilter" class="focus-ring h-11 rounded-md border border-ink/15 px-3 text-sm font-semibold text-ink">
                <option value="all">Semua ucapan</option>
                <option value="visible">Yang tampil</option>
                <option value="hidden">Disembunyikan</option>
              </select>
            </div>
          </div>

          <div v-if="filteredWishes.length" class="max-h-[640px] overflow-y-auto divide-y divide-ink/10">
            <article v-for="wish in filteredWishes" :key="wish.id" class="grid gap-4 p-5 md:grid-cols-[1fr_180px] md:items-start">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-bold text-ink">{{ wish.displayName }}</p>
                  <span
                    class="rounded-full border px-2.5 py-1 text-xs font-bold"
                    :class="rsvpStatusClass(wish.rsvpStatus)"
                  >
                    {{ rsvpStatusLabel(wish.rsvpStatus) }}
                  </span>
                  <span v-if="wish.isHidden" class="rounded-full bg-gold/10 px-2 py-1 text-xs font-bold text-gold">Disembunyikan</span>
                </div>
                <p class="mt-2 text-sm leading-6 text-ink/65">{{ wish.message }}</p>
                <p class="mt-2 text-xs text-ink/45">{{ formatDate(wish.createdAt) }}</p>
              </div>
              <div class="flex gap-2 md:justify-end">
                <AppButton type="button" variant="secondary" @click="hideWish(wish)">Sembunyikan</AppButton>
                <AppButton type="button" variant="ghost" @click="requestDeleteWish(wish)">Hapus</AppButton>
              </div>
            </article>
          </div>
          <p v-else class="p-8 text-center text-sm font-semibold text-ink/55">
            {{ guestStore.wishes.length ? "Tidak ada ucapan yang cocok dengan filter." : "Belum ada ucapan." }}
          </p>
        </template>
      </section>
    </div>

    <ConfirmDialog
      :open="Boolean(pendingDelete)"
      :title="pendingDelete?.title || ''"
      :message="pendingDelete?.message || ''"
      :detail="pendingDelete?.detail || ''"
      :confirm-label="pendingDelete?.confirmLabel || 'Ya, Hapus'"
      :loading="guestStore.saving"
      @cancel="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </section>
</template>
