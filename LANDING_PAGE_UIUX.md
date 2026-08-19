# Landing Page UI/UX

Dokumen ini menjadi pegangan UI/UX landing page Janji Nikah.

## Design Direction

Landing page harus terasa:

- Premium tapi tetap mudah didekati.
- Hangat dan profesional.
- Relevan untuk wedding business.
- Lebih SaaS/reseller daripada undangan personal.
- Tidak terlalu ramai dekorasi.

## Visual Priority

Landing page wajib memakai visual asset yang kuat.

Asset landing saat ini:

- `src/assets/landing/hero-visual.png`
- `src/assets/landing/showcase-modern.png`
- `src/assets/landing/showcase-elegant.png`
- `src/assets/landing/showcase-floral.png`

Hero visual harus menjadi first-viewport signal bahwa Janji Nikah adalah platform undangan digital untuk member/reseller.

## Layout Principles

- First viewport harus langsung menjelaskan produk dan target user.
- Jangan membuat landing page terasa seperti artikel panjang.
- Hindari nested card.
- Gunakan section full-width dengan inner container.
- Cards dipakai hanya untuk item berulang, fitur, atau preview.
- CTA utama harus terlihat tanpa scroll.
- Mobile layout harus tetap prioritas.

## Recommended Hero Layout

Desktop:

- Kiri: copy, CTA, proof points singkat.
- Kanan: hero visual besar.

Mobile:

- Copy dulu.
- CTA.
- Hero visual.

Hero copy tidak dimasukkan ke card. Biarkan berada langsung di section agar terasa lebih kuat.

## Brand Colors

Warna utama project:

```text
Ink:   #17201b
Leaf:  #315c4c
Mint:  #d9eee3
Linen: #f8f3ea
Gold:  #b9853c
Rose:  #d46f6b
```

Guideline:

- Gunakan `Ink` untuk heading dan section gelap.
- Gunakan `Leaf` untuk primary CTA dan trust signal.
- Gunakan `Linen` sebagai background hangat.
- Gunakan `Gold` untuk label/eyebrow dan aksen premium.
- Gunakan `Rose` secara hemat untuk aksen wedding/emotional.

## Typography

- Heading harus tegas dan mudah dipindai.
- Hindari font terlalu dekoratif untuk landing.
- Gunakan ukuran besar hanya di hero dan section headline.
- Text dalam card harus compact.
- Jangan memakai negative letter spacing.

## Showcase UI

Showcase tema harus menunjukkan variasi visual nyata.

Gunakan tiga asset:

- Modern: `showcase-modern.png`
- Elegant: `showcase-elegant.png`
- Floral: `showcase-floral.png`

Setiap showcase sebaiknya punya:

- Nama gaya tema.
- Benefit singkat.
- Visual preview.
- CTA kecil ke demo tema.

Jangan tampilkan semua showcase sebagai gambar identik dengan label berbeda.

## CTA Behavior

Primary CTA:

- Route: `/login`
- Label: `Masuk / Daftar dengan Google`

Secondary CTA:

- Route: `/demo-tema`
- Label: `Lihat Demo Tema`

CTA harus muncul minimal di:

- Hero.
- Showcase/katalog section.
- Final CTA.

## UX Risks

Risiko terbesar:

- Landing terlihat cantik tapi tidak menjelaskan model bisnis.
- Terlalu banyak visual wedding sehingga user mengira targetnya calon pengantin langsung.
- Halaman terlalu berat karena asset PNG besar.
- Semua tema terlihat sama.
- CTA login kalah terlihat oleh visual.

Mitigasi:

- Copy harus sering menyebut member/reseller secara natural.
- Gunakan proof points seperti preview gratis dan 1 kredit per publish.
- Optimasi asset sebelum production, idealnya ke JPG/WebP.
- Buat showcase visual berbeda untuk tiap gaya tema.
- Pastikan CTA primary selalu jelas.

## Verification Checklist

- Desktop landing terlihat kuat di first viewport.
- Mobile tidak ada text overlap.
- Semua gambar tampil.
- CTA `/login` dan `/demo-tema` berjalan.
- Build lulus.
- Lint lulus.
- Asset size dicek sebelum production.
