# Janji Nikah Frontend

Frontend Janji Nikah adalah aplikasi Vue 3 + Tailwind CSS untuk platform undangan pernikahan digital.

Stack:

- Vue 3
- Vite
- Tailwind CSS
- Vue Router
- Pinia
- Axios

Environment lokal:

- `VITE_API_BASE_URL`: base URL backend API.
- `VITE_PUBLIC_DOMAIN`: domain publik yang tampil di footer undangan, default lokal `janjinikah.com`.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API key untuk pencarian lokasi dan pin interaktif di builder undangan.
- `VITE_GOOGLE_MAPS_ALLOWED_HOSTS`: daftar hostname yang boleh memuat Google Maps dari frontend, pisahkan dengan koma. Default lokal: `localhost,127.0.0.1`.
- `VITE_PAYMENT_BANK_NAME`: nama bank tujuan transfer manual.
- `VITE_PAYMENT_ACCOUNT_NUMBER`: nomor rekening tujuan transfer manual.
- `VITE_PAYMENT_ACCOUNT_HOLDER`: nama pemilik rekening.
- `VITE_PAYMENT_SUPPORT_CONTACT`: kontak bantuan pembayaran optional.

Catatan:

- User-facing copy menggunakan Bahasa Indonesia.
- Internal product documents are kept private and are not committed to this repository.
- Batasi `VITE_GOOGLE_MAPS_API_KEY` di Google Cloud dengan HTTP referrer restriction, minimal `http://localhost:5173/*`, `http://127.0.0.1:5173/*`, dan domain production. Enable hanya Maps JavaScript API, Places API, dan Geocoding API.

## Brand Assets

Asset brand resmi berada di:

- `src/assets/brand/logo/light/`: logo untuk background terang.
- `src/assets/brand/logo/dark/`: logo untuk background hijau atau gelap.
- `src/assets/brand/icons/`: favicon, Apple touch icon, dan icon aplikasi/PWA.
- `src/assets/brand/reference/brand-reference.png`: referensi visual saja, jangan digunakan sebagai elemen UI.

Gunakan komponen `src/components/BrandLogo.vue` untuk menampilkan identitas Janji Nikah di aplikasi. Pertahankan aspect ratio dan jangan menambahkan recolor, border, shadow, atau gradient pada logo.

Palet brand:

- Primary: `#2F4A3F`
- Soft Green: `#E6ECE7`
- Warm Cream: `#F3E9D7`
- Gold Accent: `#C28B4E`
