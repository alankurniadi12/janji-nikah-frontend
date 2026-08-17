<script setup>
import { computed, ref } from "vue";
import { Check, Copy, MessageSquareText } from "@lucide/vue";

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  }
});

const copiedTemplateId = ref("");
let copiedTimer = null;

const templates = [
  {
    id: "couple-data",
    title: "Minta data pengantin",
    description: "Dipakai setelah deal untuk mengumpulkan data utama catin.",
    text: `Halo Kak, terima kasih sudah mempercayakan pembuatan undangan digitalnya.

Agar undangannya bisa mulai dibuat, boleh dibantu kirim data berikut ya:

1. Nama lengkap pengantin pria
2. Nama orang tua pengantin pria
3. Nama lengkap pengantin wanita
4. Nama orang tua pengantin wanita
5. Nama panggilan kedua pengantin jika ingin dipakai di undangan

Kalau ada ejaan nama atau gelar khusus, mohon ditulis sesuai yang ingin tampil di undangan ya Kak.`
  },
  {
    id: "event-data",
    title: "Minta data acara",
    description: "Untuk mengisi akad/resepsi dan titik lokasi.",
    text: `Halo Kak, untuk bagian detail acara, boleh dibantu kirim data ini ya:

1. Jenis acara: akad, resepsi, atau keduanya
2. Tanggal acara
3. Jam mulai acara
4. Jam selesai acara jika ada
5. Nama lokasi atau gedung
6. Alamat lengkap acara
7. Link Google Maps jika sudah ada

Kalau ada lebih dari satu acara, boleh dikirim per acara supaya tidak tertukar.`
  },
  {
    id: "assets-data",
    title: "Minta foto, musik, dan amplop",
    description: "Untuk melengkapi tampilan undangan dan fitur optional.",
    text: `Halo Kak, untuk melengkapi undangan digitalnya, boleh dibantu kirim:

1. Foto utama pasangan
2. Foto pengantin pria dan wanita jika ingin ditampilkan
3. Foto galeri, maksimal 10 foto
4. Pilihan musik jika ada request khusus
5. Data amplop digital jika ingin diaktifkan:
   - Bank/e-wallet
   - Nomor rekening/nomor e-wallet
   - Nama pemilik rekening

Kalau belum ada semua, tidak apa-apa Kak. Bisa dikirim bertahap.`
  }
];

const visibleTemplates = computed(() => (props.compact ? templates.slice(0, 2) : templates));

async function copyTemplate(template) {
  try {
    await navigator.clipboard.writeText(template.text);
    copiedTemplateId.value = template.id;
    window.clearTimeout(copiedTimer);
    copiedTimer = window.setTimeout(() => {
      copiedTemplateId.value = "";
    }, 1800);
  } catch {
    copiedTemplateId.value = "";
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
          <h2 class="mt-2 text-xl font-bold text-ink">Pesan siap copy untuk catin</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            Pakai setelah deal supaya data undangan terkumpul rapi dari awal.
          </p>
        </div>
      </div>
    </div>

    <div class="mt-5 grid gap-3" :class="compact ? 'lg:grid-cols-2' : 'lg:grid-cols-3'">
      <article v-for="template in visibleTemplates" :key="template.id" class="rounded-md border border-ink/10 bg-linen p-4">
        <div class="flex min-h-[112px] flex-col">
          <p class="font-bold text-ink">{{ template.title }}</p>
          <p class="mt-2 text-sm leading-6 text-ink/60">{{ template.description }}</p>
          <button
            class="focus-ring mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-leaf px-3 py-2 text-sm font-semibold text-white transition hover:bg-ink"
            type="button"
            @click="copyTemplate(template)"
          >
            <Check v-if="copiedTemplateId === template.id" class="h-4 w-4" />
            <Copy v-else class="h-4 w-4" />
            {{ copiedTemplateId === template.id ? "Tersalin" : "Salin Pesan" }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
