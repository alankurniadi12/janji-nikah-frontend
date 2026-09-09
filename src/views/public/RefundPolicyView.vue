<script setup>
import LegalPage from "@/components/LegalPage.vue";

const sections = [
  {
    title: "1. Produk Janji Nikah",
    paragraphs: [
      "Produk utama Janji Nikah adalah kredit digital untuk mempublikasikan undangan pernikahan digital melalui platform Janji Nikah.",
      "Kredit bukan produk fisik dan tidak memerlukan pengiriman barang. Setelah pembayaran berhasil dikonfirmasi, kredit akan masuk ke akun member dan dapat digunakan untuk publish undangan."
    ]
  },
  {
    title: "2. Harga dan pembayaran",
    paragraphs: [
      "Harga paket kredit ditampilkan sebelum member membuat transaksi pembayaran. Total pembayaran dapat mengikuti metode pembayaran yang tersedia di platform.",
      "Jika Janji Nikah menggunakan payment gateway, proses pembayaran mengikuti pilihan metode bayar, status, dan ketentuan teknis dari penyedia pembayaran tersebut."
    ]
  },
  {
    title: "3. Aktivasi kredit",
    paragraphs: [
      "Kredit akan ditambahkan ke akun member setelah pembayaran dinyatakan berhasil atau telah disetujui oleh admin jika metode pembayaran memerlukan verifikasi manual.",
      "Jika pembayaran gagal, dibatalkan, atau melewati batas waktu, kredit tidak akan ditambahkan dan member dapat membuat transaksi baru."
    ]
  },
  {
    title: "4. Kebijakan pengembalian dana",
    paragraphs: [
      "Kredit yang sudah dibeli bersifat non-refundable. Kredit yang sudah digunakan untuk publish undangan juga tidak dapat dikembalikan.",
      "Pengembalian dana hanya dapat dipertimbangkan dalam kondisi khusus, misalnya pembayaran ganda untuk transaksi yang sama, kesalahan sistem yang menyebabkan kredit tidak dapat digunakan, atau pembayaran berhasil tetapi kredit belum diberikan dan masalah tidak dapat diselesaikan oleh Janji Nikah."
    ],
    items: [
      "Permintaan refund harus dikirim maksimal 7 hari kalender setelah pembayaran berhasil.",
      "Member wajib menyertakan identitas akun, ID transaksi, nominal pembayaran, metode pembayaran, dan bukti pembayaran.",
      "Refund tidak berlaku untuk kredit yang sudah digunakan, kesalahan input data undangan oleh member, perubahan keputusan member, atau transaksi jasa antara member dan calon pengantin."
    ]
  },
  {
    title: "5. Pembatalan transaksi",
    paragraphs: [
      "Transaksi yang belum dibayar dapat dibiarkan kedaluwarsa atau dibatalkan sesuai status sistem. Transaksi yang sudah berhasil dibayar tidak dapat dibatalkan jika kredit telah masuk atau telah digunakan.",
      "Jika terdapat kendala pembayaran, member dapat menghubungi admin sebelum membuat transaksi baru agar tidak terjadi pembayaran ganda."
    ]
  },
  {
    title: "6. Waktu proses refund",
    paragraphs: [
      "Jika refund disetujui, proses pengembalian dana mengikuti metode pembayaran, bank, e-wallet, atau payment gateway yang digunakan. Waktu proses dapat berbeda-beda tergantung pihak penyedia pembayaran.",
      "Biaya layanan, biaya administrasi, atau biaya payment gateway yang sudah dikenakan oleh pihak ketiga dapat tidak dikembalikan apabila ketentuan penyedia pembayaran menyatakan demikian."
    ]
  },
  {
    title: "7. Kontak bantuan",
    paragraphs: [
      "Permintaan bantuan pembayaran atau refund dapat dikirim melalui Instagram @alankurniadi atau Facebook Alan Kurniadi di https://www.facebook.com/alankurniadii."
    ]
  }
];
</script>

<template>
  <LegalPage
    eyebrow="Kebijakan Pembayaran"
    title="Kebijakan Pengembalian Dana & Produk"
    description="Penjelasan produk kredit digital Janji Nikah, aktivasi kredit, pembatalan transaksi, dan kondisi refund."
    :sections="sections"
  />
</template>
