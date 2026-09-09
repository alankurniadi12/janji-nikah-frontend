<script setup>
import LegalPage from "@/components/LegalPage.vue";

const sections = [
  {
    title: "1. Data yang dikumpulkan",
    paragraphs: [
      "Janji Nikah dapat mengumpulkan data akun seperti nama, email, foto profil dari Google, username, status akun, riwayat kredit, dan riwayat transaksi.",
      "Janji Nikah juga menyimpan data undangan yang dimasukkan member, termasuk nama pengantin, data acara, foto, daftar tamu, RSVP, ucapan, dan informasi amplop digital jika diaktifkan."
    ]
  },
  {
    title: "2. Penggunaan data",
    paragraphs: [
      "Data digunakan untuk menjalankan layanan, memproses login, membuat undangan, menampilkan link undangan, mengelola kredit, memproses pembayaran, menjaga keamanan, dan menyediakan dukungan pelanggan.",
      "Data transaksi digunakan untuk riwayat pembayaran, verifikasi, audit, laporan, dan penyelesaian kendala pembayaran."
    ]
  },
  {
    title: "3. Pembayaran dan pihak ketiga",
    paragraphs: [
      "Jika pembayaran diproses melalui payment gateway, data transaksi yang diperlukan dapat dikirim ke penyedia pembayaran untuk memproses pembayaran dan mengirim status transaksi.",
      "Janji Nikah tidak menyimpan data kartu pembayaran sensitif seperti nomor kartu penuh, CVV, atau OTP pembayaran."
    ]
  },
  {
    title: "4. Penyimpanan dan penghapusan data",
    paragraphs: [
      "Data undangan aktif disimpan selama dibutuhkan untuk menjalankan layanan. Setelah undangan kedaluwarsa, detail tertentu seperti foto, daftar tamu, RSVP, dan ucapan dapat dihapus sesuai aturan cleanup Janji Nikah.",
      "Ringkasan data dapat tetap disimpan untuk kebutuhan dashboard, laporan, audit, dan riwayat operasional."
    ]
  },
  {
    title: "5. Keamanan",
    paragraphs: [
      "Janji Nikah menerapkan langkah teknis yang wajar untuk menjaga keamanan data. Namun, tidak ada sistem digital yang sepenuhnya bebas risiko.",
      "Member bertanggung jawab menjaga akses akun Google dan memastikan informasi yang dibagikan melalui undangan hanya data yang memang boleh dipublikasikan."
    ]
  },
  {
    title: "6. Kontak",
    paragraphs: [
      "Pertanyaan terkait privasi dapat dikirim melalui Instagram @alankurniadi atau Facebook Alan Kurniadi di https://www.facebook.com/alankurniadii."
    ]
  }
];
</script>

<template>
  <LegalPage
    eyebrow="Privasi"
    title="Kebijakan Privasi"
    description="Ringkasan cara Janji Nikah mengumpulkan, menggunakan, menyimpan, dan melindungi data pengguna."
    :sections="sections"
  />
</template>
