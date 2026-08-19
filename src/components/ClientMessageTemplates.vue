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

const messageText = `Halo Kak, terima kasih sudah mempercayakan pembuatan undangan pernikahannya.
Agar undangannya bisa mulai dibuat, boleh dibantu kirim data berikut ya:

DATA PENGANTIN
1. Nama lengkap pengantin pria
2. Nama orang tua pengantin pria
3. Nama lengkap pengantin wanita
4. Nama orang tua pengantin wanita

DATA ACARA
Akad
1. Tanggal
2. Jam mulai
3. Jam selesai
4. Alamat lengkap acara
5. Link Google Maps jika ada

Resepsi
1. Tanggal
2. Jam mulai
3. Jam selesai
4. Alamat lengkap acara
5. Link Google Maps jika ada

DAFTAR TAMU
Mohon dibantu kirim daftar nama tamu yang akan diundang, satu nama per baris.
Daftar ini akan kami input ke menu daftar tamu agar setiap tamu bisa mendapatkan link undangan personal.

FOTO DAN ASET
1. Foto utama/cover pasangan
2. Foto pengantin pria
3. Foto pengantin wanita
4. Foto galeri, maksimal 10 foto
5. Musik (sesuai katalog)
6. Tema undangan (sesuai katalog)
7. Cerita cinta kalau ada
8. Quote jika ada request khusus (default terjemahan QS. Ar-Rum: 21)
9. Dresscode jika ada

AMPLOP DIGITAL JIKA INGIN DIAKTIFKAN
1. Bank/e-wallet
2. Nomor rekening/nomor e-wallet
3. Nama pemilik rekening

CATATAN TAMBAHAN
Kalau belum ada semua, tidak apa-apa. Datanya bisa dikirim bertahap.
Silakan ditanyakan jika masih ada yang bingung, kami siap bantu.`;

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
            Satu kali copy untuk meminta data pengantin, acara, daftar tamu, foto, musik, dan amplop digital.
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
