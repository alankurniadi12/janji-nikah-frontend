<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { Check, Copy, Loader2, MessageCircle, Trash2 } from "@lucide/vue";

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
const sentCount = computed(() => guestStore.guests.filter((guest) => guest.sentStatus === "sent").length);

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
      <AppButton
        v-if="invitation"
        :to="{ name: 'member-invitation-detail', params: { id: invitation.id } }"
        variant="secondary"
      >
        Edit Undangan
      </AppButton>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-3">
      <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <p class="text-sm font-medium text-ink/55">Total tamu</p>
        <p class="mt-2 text-3xl font-bold text-ink">{{ guestStore.guests.length }}</p>
      </section>
      <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <p class="text-sm font-medium text-ink/55">Sudah dikirim</p>
        <p class="mt-2 text-3xl font-bold text-ink">{{ sentCount }}</p>
      </section>
      <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <p class="text-sm font-medium text-ink/55">Ucapan masuk</p>
        <p class="mt-2 text-3xl font-bold text-ink">{{ guestStore.wishes.length }}</p>
      </section>
    </div>

    <p v-if="error || guestStore.error" class="mt-5 rounded-md bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">
      {{ error || guestStore.error }}
    </p>

    <div class="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside class="space-y-6">
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
          <h2 class="text-lg font-bold text-ink">Daftar Tamu</h2>
        </div>

        <div v-if="guestStore.loading" class="flex items-center gap-3 p-5">
          <Loader2 class="h-5 w-5 animate-spin text-leaf" />
          <p class="text-sm font-semibold text-ink/70">Memuat tamu...</p>
        </div>

        <div v-else-if="guestStore.guests.length" class="divide-y divide-ink/10">
          <article v-for="guest in guestStore.guests" :key="guest.id" class="grid gap-4 p-5 lg:grid-cols-[1fr_130px_220px] lg:items-center">
            <div>
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
                title="Copy link"
                @click="copyText(absoluteLink(guest.link), 'Link tamu berhasil disalin.')"
              >
                <Copy class="h-4 w-4" />
              </button>
              <button
                class="focus-ring rounded-md p-2 text-ink/60 hover:bg-mint hover:text-leaf"
                type="button"
                title="Copy WhatsApp"
                @click="copyWhatsapp(guest)"
              >
                <MessageCircle class="h-4 w-4" />
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

        <p v-else class="p-8 text-center text-sm font-semibold text-ink/55">Belum ada tamu.</p>
      </section>
    </div>

    <section class="mt-6 rounded-lg border border-ink/10 bg-white shadow-soft">
      <div class="border-b border-ink/10 p-5">
        <h2 class="text-lg font-bold text-ink">Ucapan tamu</h2>
      </div>
      <div v-if="guestStore.wishes.length" class="divide-y divide-ink/10">
        <article v-for="wish in guestStore.wishes" :key="wish.id" class="grid gap-4 p-5 md:grid-cols-[1fr_180px] md:items-start">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-bold text-ink">{{ wish.displayName }}</p>
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
      <p v-else class="p-8 text-center text-sm font-semibold text-ink/55">Belum ada ucapan.</p>
    </section>

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
