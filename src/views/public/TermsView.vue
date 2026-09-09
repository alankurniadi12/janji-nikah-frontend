<script setup>
import LegalPage from "@/components/LegalPage.vue";

const sections = [
  {
    title: "1. Definisi layanan",
    paragraphs: [
      "Janji Nikah adalah platform digital untuk membantu member membuat, mengelola, dan mempublikasikan undangan pernikahan digital bagi calon pengantin.",
      "Member adalah pengguna terdaftar yang menggunakan Janji Nikah untuk membuat undangan digital. Tamu adalah pihak yang membuka link undangan, mengisi RSVP, atau menulis ucapan."
    ]
  },
  {
    title: "2. Akun dan tanggung jawab member",
    paragraphs: [
      "Member wajib menggunakan akun Google yang valid, menjaga akses akun masing-masing, dan memastikan data yang dimasukkan ke dalam undangan sudah benar.",
      "Member bertanggung jawab atas foto, teks, nama, rekening amplop digital, musik, dan seluruh konten yang diunggah atau ditampilkan melalui undangan."
    ]
  },
  {
    title: "3. Kredit dan publish undangan",
    paragraphs: [
      "Kredit adalah satuan digital yang digunakan untuk mempublikasikan undangan. Draft dan preview tidak menggunakan kredit.",
      "Satu undangan yang dipublish menggunakan 1 kredit. Kredit yang sudah dipakai untuk publish tidak dapat dikembalikan."
    ],
    items: [
      "Member dapat membuat draft sesuai batas yang berlaku di platform.",
      "Undangan yang sudah dipublish masih dapat diedit selama 24 jam setelah publish.",
      "Setelah 24 jam, data utama undangan dapat dikunci sesuai aturan layanan."
    ]
  },
  {
    title: "4. Pembayaran",
    paragraphs: [
      "Pembelian kredit dilakukan melalui metode pembayaran yang tersedia di Janji Nikah. Jika pembayaran berhasil dan terkonfirmasi, kredit akan ditambahkan ke akun member.",
      "Janji Nikah dapat menggunakan penyedia payment gateway untuk memproses pembayaran secara aman. Status pembayaran ditentukan berdasarkan konfirmasi dari sistem pembayaran dan/atau verifikasi admin."
    ]
  },
  {
    title: "5. Masa aktif undangan",
    paragraphs: [
      "Undangan aktif sampai 5 hari setelah tanggal acara terakhir. Setelah masa aktif berakhir, undangan dapat dinonaktifkan dan data detail tertentu dapat dihapus sesuai aturan cleanup layanan.",
      "Ringkasan transaksi dan ringkasan undangan dapat tetap disimpan untuk kebutuhan riwayat, laporan, audit, dan operasional platform."
    ]
  },
  {
    title: "6. Konten yang dilarang",
    paragraphs: [
      "Member dilarang mengunggah konten yang melanggar hukum, menipu, mengandung kekerasan ekstrem, pornografi, ujaran kebencian, pelanggaran hak cipta, atau data pribadi pihak lain tanpa izin.",
      "Janji Nikah berhak membatasi, menonaktifkan, atau menghapus konten dan akun yang melanggar syarat layanan."
    ]
  },
  {
    title: "7. Batasan tanggung jawab",
    paragraphs: [
      "Janji Nikah menyediakan platform pembuatan undangan digital. Janji Nikah tidak bertanggung jawab atas kesalahan data yang dimasukkan member, isi undangan, transaksi jasa antara member dan calon pengantin, atau dana amplop digital yang dikirim langsung ke rekening member/calon pengantin.",
      "Layanan dapat mengalami gangguan teknis, pemeliharaan, atau keterbatasan dari pihak ketiga seperti payment gateway, layanan Google, hosting, atau jaringan internet."
    ]
  },
  {
    title: "8. Perubahan syarat",
    paragraphs: [
      "Janji Nikah dapat memperbarui syarat dan ketentuan ini untuk menyesuaikan fitur, aturan operasional, kebutuhan keamanan, atau ketentuan pihak ketiga. Versi terbaru akan ditampilkan di halaman ini."
    ]
  },
  {
    title: "9. Kontak",
    paragraphs: [
      "Pertanyaan terkait layanan dapat dikirim melalui Instagram @alankurniadi atau Facebook Alan Kurniadi di https://www.facebook.com/alankurniadii."
    ]
  }
];
</script>

<template>
  <LegalPage
    eyebrow="Syarat Layanan"
    title="Syarat & Ketentuan Janji Nikah"
    description="Ketentuan penggunaan platform Janji Nikah untuk member, calon pengantin, dan tamu undangan."
    :sections="sections"
  />
</template>
