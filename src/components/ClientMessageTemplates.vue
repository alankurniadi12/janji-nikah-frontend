<script setup>
import { ref } from "vue";
import { Check, ChevronDown, ChevronUp, Copy, MessageSquareText } from "@lucide/vue";

defineProps({
  compact: {
    type: Boolean,
    default: false
  }
});

const copied = ref(false);
const expanded = ref(false);
let copiedTimer = null;

const messageText = `Halo Kak, terima kasih sudah mempercayakan pembuatan undangan digitalnya.

Agar undangannya bisa mulai dibuat, boleh dibantu kirim data berikut ya:

DATA PENGANTIN
1. Nama lengkap pengantin pria
2. Nama orang tua pengantin pria
3. Nama lengkap pengantin wanita
4. Nama orang tua pengantin wanita
5. Nama panggilan kedua pengantin jika ingin dipakai di undangan

DATA ACARA
1. Jenis acara: akad, resepsi, atau keduanya
2. Tanggal acara
3. Jam mulai acara
4. Jam selesai acara jika ada
5. Nama lokasi atau gedung
6. Alamat lengkap acara
7. Link Google Maps jika sudah ada

FOTO DAN ASET
1. Foto utama pasangan
2. Foto pengantin pria dan wanita jika ingin ditampilkan
3. Foto galeri, maksimal 10 foto
4. Pilihan musik jika ada request khusus

AMPLOP DIGITAL JIKA INGIN DIAKTIFKAN
1. Bank/e-wallet
2. Nomor rekening/nomor e-wallet
3. Nama pemilik rekening

CATATAN TAMBAHAN
Kalau ada konsep warna, dress code, cerita cinta, quote, atau request khusus lain, boleh sekalian dikirim ya Kak.

Kalau belum ada semua, tidak apa-apa. Datanya bisa dikirim bertahap. Untuk nama dan gelar, mohon ditulis sesuai ejaan yang ingin tampil di undangan.`;

async function copyMessage() {
  try {
    await navigator.clipboard.writeText(messageText);
    copied.value = true;
    window.clearTimeout(copiedTimer);
    copiedTimer = window.setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <section class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mint text-leaf">
          <MessageSquareText class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-gold">Template pesan</p>
          <h2 class="mt-2 text-xl font-bold text-ink">Pesan lengkap untuk minta data catin</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Satu kali copy untuk meminta data pengantin, acara, foto, musik, dan amplop digital.
          </p>
        </div>
      </div>
      <button
        class="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
        type="button"
        @click="copyMessage"
      >
        <Check v-if="copied" class="h-4 w-4" />
        <Copy v-else class="h-4 w-4" />
        {{ copied ? "Pesan Tersalin" : "Salin Semua" }}
      </button>
    </div>

    <div class="mt-5 rounded-md border border-ink/10 bg-linen">
      <pre
        class="whitespace-pre-wrap px-4 py-4 text-sm leading-6 text-ink/70"
        :class="[
          expanded ? 'max-h-none' : compact ? 'max-h-44 overflow-hidden' : 'max-h-64 overflow-hidden'
        ]"
      >{{ messageText }}</pre>
      <div class="border-t border-ink/10 bg-white px-4 py-3">
        <button
          class="focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-leaf hover:bg-mint"
          type="button"
          @click="expanded = !expanded"
        >
          <ChevronUp v-if="expanded" class="h-4 w-4" />
          <ChevronDown v-else class="h-4 w-4" />
          {{ expanded ? "Tutup teks lengkap" : "Lihat teks lengkap" }}
        </button>
      </div>
    </div>
  </section>
</template>
