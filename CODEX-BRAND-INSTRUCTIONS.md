# CODEX IMPLEMENTATION NOTE — JANJI NIKAH BRAND

1. Asset logo dan icon berada di `src/assets/brand/logo/` dan `src/assets/brand/icons/`.
2. Jangan gunakan `reference/brand-reference.png` sebagai elemen UI.
3. Buat reusable component `BrandLogo` bila arsitektur project mendukungnya.
4. Gunakan light logo pada background terang dan dark logo pada background hijau/dark.
5. Dashboard: mark 28–32px + text `Janji Nikah`.
6. Navbar desktop: horizontal logo 34–40px height, width auto.
7. Navbar mobile: horizontal 30–32px; fallback mark + text jika ruang sempit.
8. Favicon: gunakan `src/assets/brand/icons/favicon.ico` serta PNG 16/32.
9. Apple: gunakan `src/assets/brand/icons/apple-touch-icon.png`.
10. PWA: gunakan `src/assets/brand/icons/icon-192x192.png` dan `src/assets/brand/icons/icon-512x512.png` saat manifest PWA ditambahkan.
11. Jangan stretch gambar; selalu pertahankan aspect ratio.
12. Jangan menambahkan border, shadow, gradient, atau recolor ke logo tanpa alasan desain.
13. Pertahankan warna brand:
    - #2F4A3F
    - #E6ECE7
    - #F3E9D7
    - #C28B4E
14. Prioritaskan mobile dan cek viewport 320/375/390/430 px.
