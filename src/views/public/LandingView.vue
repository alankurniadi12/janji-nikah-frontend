<script setup>
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  Gift,
  Link as LinkIcon,
  MessageCircle,
  Palette,
  Sparkles,
  WalletCards
} from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { invitationThemes } from "@/lib/invitationThemes";

const steps = [
  { title: "Beli kredit sesuai kebutuhan", text: "Mulai dari paket kecil dulu. Kredit hanya terpakai saat undangan benar-benar dipublish.", icon: WalletCards },
  { title: "Buat undangan untuk klien", text: "Isi data pengantin, acara, foto, musik, dan tema lewat form bertahap yang sederhana.", icon: Gift },
  { title: "Bagikan link siap pakai", text: "Tamu mendapat link personal untuk membuka undangan, RSVP, dan mengirim ucapan.", icon: LinkIcon }
];

const featuredThemes = invitationThemes.slice(0, 4);

const sellingPoints = [
  "Input Data Pengantin",
  "Publish undangan",
  "Kirim Undangan ke Pengantin"
];

const highlights = [
  { value: "0", label: "kredit untuk preview", text: "Buat contoh undangan dulu tanpa memotong saldo kredit member." },
  { value: "1", label: "kredit per publish", text: "Biaya tiap order lebih mudah dihitung dan dijelaskan ke tim." },
  { value: "Link", label: "personal untuk tamu", text: "Undangan bisa dibagikan dengan nama tamu, RSVP, dan ucapan." }
];

const featureCards = [
  {
    title: "Katalog tema siap jual",
    text: "Tunjukkan demo tema ke calon pengantin, biar mereka mudah memilih gaya undangan yang cocok.",
    icon: Palette
  },
  {
    title: "Link tamu personal",
    text: "Setiap nama tamu punya link sendiri, lengkap dengan RSVP dan ucapan yang rapi.",
    icon: LinkIcon
  },
  {
    title: "Modal lebih terukur",
    text: "Kredit baru terpakai saat publish, jadi kamu bisa hitung biaya per order dengan jelas.",
    icon: WalletCards
  },
  {
    title: "Materi promosi member",
    text: "Siapkan branding dan caption promosi agar jasa undanganmu lebih mudah ditawarkan.",
    icon: Sparkles
  }
];

const audienceItems = [
  "Reseller undangan yang ingin punya produk digital sendiri.",
  "Freelancer desain/admin wedding yang sering bantu calon pengantin.",
  "Pemilik akun FB/WA yang sudah punya pasar lokal dan ingin mulai jual jasa."
];
</script>

<template>
  <div class="page-shell">
    <header class="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <RouterLink to="/" class="text-lg font-bold text-ink">Janji Nikah</RouterLink>
      <nav class="hidden items-center gap-6 text-sm font-semibold text-ink/60 md:flex">
        <a class="transition hover:text-leaf" href="#katalog">Katalog</a>
        <a class="transition hover:text-leaf" href="#cara-kerja">Cara kerja</a>
        <a class="transition hover:text-leaf" href="#mulai">Mulai</a>
      </nav>
      <AppButton to="/login" variant="secondary">Masuk</AppButton>
    </header>

    <main>
      <section class="border-y border-ink/10 bg-white">
        <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.14fr_0.86fr] lg:px-8 lg:py-16 xl:gap-14">
          <div class="flex flex-col justify-center">
            <div class="inline-flex w-fit items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-gold">
              <Sparkles class="h-3.5 w-3.5" />
              Peluang jasa undangan digital
            </div>
            <h1 class="mt-5 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              Janji Nikah
            </h1>
            <h2 class="mt-4 max-w-3xl text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Bikin jasa undangan digital terasa siap jual, tanpa ribet bikin sistem sendiri.
            </h2>
            <p class="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
              Punya waktu luang, jaringan pertemanan, atau calon pengantin di sekitar kamu?
              Jadikan itu peluang penghasilan tambahan lewat jasa undangan digital yang mudah ditawarkan dan terlihat profesional.
            </p>
            <div class="mt-6 grid gap-3 sm:grid-cols-3">
              <div
                v-for="point in sellingPoints"
                :key="point"
                class="flex min-h-[68px] items-center gap-2 rounded-md border border-ink/10 bg-linen px-3 py-3 text-sm font-bold leading-5 text-ink/70"
              >
                <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                <span>{{ point }}</span>
              </div>
            </div>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <AppButton to="/login">
                Masuk / Daftar dengan Google
                <ArrowRight class="h-4 w-4" />
              </AppButton>
              <AppButton to="/demo-tema" variant="secondary">
                <Eye class="h-4 w-4" />
                Lihat Katalog Tema & Musik
              </AppButton>
            </div>
            <p class="mt-4 text-sm font-semibold text-ink/45">
              Login cukup dengan Google. Tidak ada biaya pendaftaran.
            </p>
          </div>

          <div class="w-full max-w-[520px] justify-self-end rounded-lg border border-ink/10 bg-linen p-3 shadow-soft sm:p-4">
            <div class="rounded-md border border-ink/10 bg-white p-3">
              <div class="flex items-center justify-between gap-3 border-b border-ink/10 pb-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-widest text-gold">Etalase member</p>
                  <h2 class="mt-1 text-lg font-bold text-ink">Katalog tema + preview undangan</h2>
                </div>
                <div class="hidden rounded-full bg-mint px-3 py-1 text-xs font-bold text-leaf sm:block">
                  Siap ditunjukkan ke klien
                </div>
              </div>

              <div class="mt-4 grid gap-3 lg:grid-cols-[0.82fr_1.18fr]">
                <div id="katalog" class="grid grid-cols-2 gap-2">
                  <RouterLink
                    v-for="theme in featuredThemes"
                    :key="theme.key"
                    :to="{ name: 'theme-demo-detail', params: { themeKey: theme.key } }"
                    class="focus-ring block rounded-md border border-ink/10 bg-white p-1.5 transition hover:-translate-y-0.5 hover:border-leaf hover:shadow-soft"
                  >
                    <div class="theme-preview aspect-[4/3]" :class="theme.previewClass" />
                    <p class="mt-1.5 truncate text-xs font-bold text-ink">{{ theme.name }}</p>
                    <p class="truncate text-xs font-semibold text-ink/45">{{ theme.category }}</p>
                  </RouterLink>
                </div>

                <div class="rounded-md bg-ink p-3 text-white">
                  <div class="mx-auto max-w-[218px] rounded-[1.6rem] border-[7px] border-white/15 bg-white/10 p-1.5 shadow-soft">
                    <div class="overflow-hidden rounded-[1.05rem] bg-white text-ink">
                      <div class="theme-preview theme-preview-golden-bloom-stage h-32 rounded-none border-0">
                        <div class="absolute inset-x-4 top-7 z-10 text-center">
                          <p class="text-xs font-bold uppercase tracking-widest text-white/80">The Wedding of</p>
                          <h3 class="mt-1.5 text-2xl font-bold text-white">Alya & Rama</h3>
                        </div>
                      </div>
                      <div class="space-y-2 p-3">
                        <div class="rounded-md border border-ink/10 bg-linen p-2.5 text-center">
                          <p class="text-xs font-bold uppercase tracking-widest text-gold">Akad & Resepsi</p>
                          <p class="mt-1 text-xs font-bold text-ink">Sabtu, 18 Juli 2026</p>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                          <div class="rounded-md bg-mint p-2 text-center">
                            <p class="text-xs font-bold text-leaf">RSVP</p>
                            <p class="mt-1 text-xs font-semibold text-ink/60">Hadir / Tidak</p>
                          </div>
                          <div class="rounded-md bg-gold/10 p-2 text-center">
                            <p class="text-xs font-bold text-gold">Ucapan</p>
                            <p class="mt-1 text-xs font-semibold text-ink/60">Langsung tampil</p>
                          </div>
                        </div>
                        <div class="rounded-md bg-ink px-3 py-2 text-center text-xs font-bold text-white">
                          Link siap dibagikan ke tamu
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 grid grid-cols-2 gap-2">
                    <div class="rounded-md border border-white/10 bg-white/10 p-2.5">
                      <p class="text-xs font-bold uppercase tracking-widest text-gold">Preview</p>
                      <p class="mt-1 text-xs font-semibold text-white/80">Gratis</p>
                    </div>
                    <div class="rounded-md border border-white/10 bg-white/10 p-2.5">
                      <p class="text-xs font-bold uppercase tracking-widest text-gold">Publish</p>
                      <p class="mt-1 text-xs font-semibold text-white/80">1 kredit</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="border-b border-ink/10 bg-linen">
        <div class="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
          <article v-for="item in highlights" :key="item.label" class="rounded-md border border-ink/10 bg-white p-5 shadow-soft">
            <p class="text-3xl font-bold text-leaf">{{ item.value }}</p>
            <h2 class="mt-2 text-base font-bold text-ink">{{ item.label }}</h2>
            <p class="mt-2 text-sm leading-6 text-ink/60">{{ item.text }}</p>
          </article>
        </div>
      </section>

      <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p class="text-sm font-bold uppercase tracking-widest text-gold">Bukan cuma halaman cantik</p>
            <h2 class="mt-3 max-w-xl text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Yang kamu jual adalah undangan siap pakai, bukan janji desain yang belum jelas.
            </h2>
            <p class="mt-4 max-w-xl leading-7 text-ink/65">
              Calon pengantin biasanya ingin cepat lihat contoh, cepat revisi data, dan cepat sebar link.
              Janji Nikah membantu kamu menjawab itu dengan katalog, preview, dan alur kerja yang mudah dipahami.
            </p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <article v-for="feature in featureCards" :key="feature.title" class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
                <component :is="feature.icon" class="h-5 w-5" />
              </div>
              <h3 class="mt-4 text-lg font-bold text-ink">{{ feature.title }}</h3>
              <p class="mt-2 text-sm leading-6 text-ink/65">{{ feature.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="cara-kerja" class="border-y border-ink/10 bg-white">
        <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div class="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p class="text-sm font-bold uppercase tracking-widest text-gold">Cara kerja</p>
              <h2 class="mt-3 max-w-2xl text-3xl font-bold leading-tight text-ink sm:text-4xl">
                Dari calon klien sampai link undangan, alurnya dibuat pendek.
              </h2>
            </div>
            <AppButton to="/demo-tema" variant="secondary">
              <Eye class="h-4 w-4" />
              Cek demo tema
            </AppButton>
          </div>

          <div class="mt-8 grid gap-4 md:grid-cols-3">
            <article v-for="(step, index) in steps" :key="step.title" class="rounded-lg border border-ink/10 bg-linen p-5">
              <div class="flex items-center justify-between gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-md bg-white text-leaf shadow-soft">
                  <component :is="step.icon" class="h-5 w-5" />
                </div>
                <span class="text-sm font-bold text-ink/30">0{{ index + 1 }}</span>
              </div>
              <h3 class="mt-5 text-lg font-bold text-ink">{{ step.title }}</h3>
              <p class="mt-2 text-sm leading-6 text-ink/65">{{ step.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-8">
        <div class="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
          <p class="text-sm font-bold uppercase tracking-widest text-gold">Untuk siapa?</p>
          <h2 class="mt-3 text-3xl font-bold leading-tight text-ink">Untuk yang sudah punya jalan ke pasar, tapi butuh produk yang rapi.</h2>
          <div class="mt-6 grid gap-3">
            <div v-for="item in audienceItems" :key="item" class="flex gap-3 rounded-md bg-linen p-4 text-sm font-semibold leading-6 text-ink/70">
              <CheckCircle2 class="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
              <span>{{ item }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-ink p-6 text-white shadow-soft">
          <div class="flex h-12 w-12 items-center justify-center rounded-md bg-white/10 text-gold">
            <MessageCircle class="h-6 w-6" />
          </div>
          <h2 class="mt-5 text-3xl font-bold leading-tight">Santai untuk member, tetap meyakinkan untuk klien.</h2>
          <p class="mt-4 leading-7 text-white/70">
            Kamu bisa ngobrol dengan calon pengantin seperti biasa: kirim demo tema, terima data, buat preview,
            lalu publish setelah pembayaran jasa kamu beres.
          </p>
          <div class="mt-6 rounded-md border border-white/10 bg-white/10 p-4">
            <div class="flex items-start gap-3">
              <Clock3 class="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p class="text-sm font-semibold leading-6 text-white/80">
                Tidak perlu menunggu semua sempurna untuk mulai jualan. Yang penting contoh tema jelas,
                alur order mudah, dan hasil undangan terlihat pantas dibayar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="mulai" class="bg-ink">
        <div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-white sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p class="text-sm font-bold uppercase tracking-widest text-gold">Mulai dari order pertama</p>
            <h2 class="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
              Kalau kamu sudah punya calon pembeli, Janji Nikah bisa jadi produk digital yang langsung kamu tawarkan.
            </h2>
            <p class="mt-4 max-w-2xl leading-7 text-white/70">
              Buat akun, cek katalog tema, lalu coba bikin draft undangan. Kredit baru terpakai saat undangan dipublish untuk klien.
            </p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <AppButton to="/login">
              Mulai jadi member
              <ArrowRight class="h-4 w-4" />
            </AppButton>
            <AppButton to="/demo-tema" variant="secondary">
              <Eye class="h-4 w-4" />
              Lihat Demo Tema
            </AppButton>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
