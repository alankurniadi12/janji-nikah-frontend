<script setup>
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  Gift,
  Link as LinkIcon,
  MessageCircle,
  Palette,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards
} from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { invitationThemes } from "@/lib/invitationThemes";

const featuredThemes = invitationThemes.slice(0, 5);

const heroStats = [
  { value: "0", label: "kredit untuk draft & preview" },
  { value: "1", label: "kredit saat publish" },
  { value: "5 hari", label: "aktif setelah acara terakhir" }
];

const pipeline = [
  { title: "Prospek masuk", detail: "Kirim demo tema ke calon pengantin", icon: MessageCircle },
  { title: "Data diterima", detail: "Isi form bertahap tanpa desain manual", icon: ClipboardList },
  { title: "Preview disetujui", detail: "Tunjukkan link sebelum publish", icon: Eye },
  { title: "Undangan aktif", detail: "Bagikan link personal ke tamu", icon: LinkIcon }
];

const steps = [
  {
    title: "Beli kredit sesuai order",
    text: "Ambil paket kecil dulu, lalu tambah saat order bertambah. Kredit tidak terpakai untuk draft dan preview.",
    icon: WalletCards
  },
  {
    title: "Buat undangan dari form",
    text: "Member cukup isi pengantin, acara, foto, musik, tema, dan amplop digital bila diperlukan.",
    icon: Gift
  },
  {
    title: "Kelola tamu dan laporan",
    text: "Setelah publish, member bisa mengatur tamu, copy teks WhatsApp, memantau RSVP, dan membagikan laporan ke pengantin.",
    icon: Users
  }
];

const featureCards = [
  {
    title: "Katalog tema siap ditawarkan",
    text: "Calon pengantin bisa melihat contoh nyata sebelum member membuat draft, jadi proses closing lebih konkret.",
    icon: Palette
  },
  {
    title: "Biaya order mudah dihitung",
    text: "Model 1 kredit per publish membuat modal per undangan jelas dan tidak membingungkan reseller.",
    icon: WalletCards
  },
  {
    title: "Link personal untuk tamu",
    text: "Setiap tamu mendapat link sendiri untuk membuka undangan, RSVP, dan menulis ucapan.",
    icon: LinkIcon
  },
  {
    title: "Operasional lebih rapi",
    text: "Draft, preview, publish, daftar tamu, dan status undangan berada di satu dashboard member.",
    icon: ShieldCheck
  }
];

const objections = [
  "Tidak perlu bikin website sendiri dari nol.",
  "Tidak perlu menjanjikan desain custom yang makan waktu.",
  "Tidak perlu stok banyak modal sebelum punya order.",
  "Tidak perlu mengajari klien memakai dashboard."
];

const audienceItems = [
  "Reseller undangan yang ingin mulai dari produk digital sederhana.",
  "Freelancer desain, admin wedding, atau WO kecil yang sering bantu calon pengantin.",
  "Penjual lokal di WhatsApp, Facebook, atau Instagram yang butuh produk jasa bernilai tambah."
];
</script>

<template>
  <div class="page-shell">
    <header class="sticky top-0 z-30 border-b border-ink/10 bg-linen/95 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <RouterLink to="/" class="flex items-center gap-2 text-lg font-bold text-ink">
          <span class="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-sm text-white">JN</span>
          Janji Nikah
        </RouterLink>
        <nav class="hidden items-center gap-6 text-sm font-semibold text-ink/60 md:flex">
          <a class="transition hover:text-leaf" href="#demo">Demo tema</a>
          <a class="transition hover:text-leaf" href="#nilai">Nilai bisnis</a>
          <a class="transition hover:text-leaf" href="#cara-kerja">Cara kerja</a>
        </nav>
        <div class="flex items-center gap-2">
          <AppButton to="/demo-tema" variant="ghost" class="hidden sm:inline-flex">Demo</AppButton>
          <AppButton to="/login" variant="secondary">Masuk</AppButton>
        </div>
      </div>
    </header>

    <main>
      <section class="overflow-hidden border-b border-ink/10 bg-[#fffaf2]">
        <div class="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16 xl:gap-16">
          <div class="flex flex-col justify-center">
            <div class="inline-flex w-fit items-center gap-2 rounded-full border border-rose/20 bg-rose/10 px-3 py-1.5 text-xs font-bold uppercase text-rose">
              <Sparkles class="h-3.5 w-3.5" />
              Untuk member dan reseller undangan
            </div>
            <h1 class="mt-5 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              Janji Nikah
            </h1>
            <p class="mt-4 max-w-3xl text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Buka jasa undangan digital yang terlihat siap dijual sejak hari pertama.
            </p>
            <p class="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
              Platform untuk membuat undangan pernikahan digital bagi klien: pilih tema, isi data, preview gratis,
              publish pakai kredit, lalu bagikan link personal ke tamu.
            </p>

            <div class="mt-6 grid gap-3 sm:grid-cols-3">
              <div
                v-for="stat in heroStats"
                :key="stat.label"
                class="min-h-[86px] rounded-md border border-ink/10 bg-white p-4 shadow-soft"
              >
                <p class="text-2xl font-bold text-leaf">{{ stat.value }}</p>
                <p class="mt-1 text-sm font-semibold leading-5 text-ink/60">{{ stat.label }}</p>
              </div>
            </div>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <AppButton to="/login">
                Masuk / Daftar dengan Google
                <ArrowRight class="h-4 w-4" />
              </AppButton>
              <AppButton to="/demo-tema" variant="secondary">
                <Eye class="h-4 w-4" />
                Lihat Demo Tema
              </AppButton>
            </div>
            <p class="mt-4 text-sm font-semibold text-ink/45">
              Cocok untuk jual jasa ke calon pengantin, bukan untuk membuat website umum.
            </p>
          </div>

          <div id="demo" class="relative">
            <div class="absolute -right-16 top-10 hidden h-44 w-44 rounded-full bg-rose/10 blur-2xl lg:block" />
            <div class="relative rounded-lg border border-ink/10 bg-ink p-3 text-white shadow-soft sm:p-4">
              <div class="rounded-md border border-white/10 bg-white/10 p-3">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-xs font-bold uppercase text-gold">Order aktif</p>
                    <h2 class="mt-1 text-xl font-bold">Alya & Rama</h2>
                  </div>
                  <span class="rounded-md bg-mint px-3 py-1 text-xs font-bold text-leaf">Siap preview</span>
                </div>

                <div class="mt-4 grid gap-3 lg:grid-cols-[0.76fr_1.24fr]">
                  <div class="grid gap-2">
                    <RouterLink
                      v-for="theme in featuredThemes"
                      :key="theme.key"
                      :to="{ name: 'theme-demo-detail', params: { themeKey: theme.key } }"
                      class="focus-ring flex items-center gap-3 rounded-md border border-white/10 bg-white/10 p-2 transition hover:-translate-y-0.5 hover:bg-white/15"
                    >
                      <div class="theme-preview h-12 w-16 shrink-0" :class="theme.previewClass" />
                      <div class="min-w-0">
                        <p class="truncate text-sm font-bold text-white">{{ theme.name }}</p>
                        <p class="truncate text-xs font-semibold text-white/50">{{ theme.category }}</p>
                      </div>
                    </RouterLink>
                  </div>

                  <div class="rounded-md bg-white p-3 text-ink">
                    <div class="mx-auto max-w-[235px] rounded-[1.7rem] border-[7px] border-ink/10 bg-linen p-1.5 shadow-soft">
                      <div class="overflow-hidden rounded-[1.05rem] bg-white">
                        <div class="theme-preview theme-preview-golden-bloom-stage h-36 rounded-none border-0">
                          <div class="absolute inset-x-4 top-8 z-10 text-center">
                            <p class="text-xs font-bold uppercase text-white/80">The Wedding of</p>
                            <h3 class="mt-1.5 text-2xl font-bold text-white">Alya & Rama</h3>
                          </div>
                        </div>
                        <div class="space-y-2 p-3">
                          <div class="rounded-md border border-ink/10 bg-linen p-2.5">
                            <p class="text-xs font-bold uppercase text-gold">Sabtu, 18 Juli 2026</p>
                            <p class="mt-1 text-sm font-bold text-ink">Akad & Resepsi</p>
                          </div>
                          <div class="grid grid-cols-2 gap-2">
                            <div class="rounded-md bg-mint p-2 text-center">
                              <p class="text-xs font-bold text-leaf">RSVP</p>
                              <p class="mt-1 text-xs font-semibold text-ink/60">Hadir</p>
                            </div>
                            <div class="rounded-md bg-rose/10 p-2 text-center">
                              <p class="text-xs font-bold text-rose">Ucapan</p>
                              <p class="mt-1 text-xs font-semibold text-ink/60">Live</p>
                            </div>
                          </div>
                          <div class="rounded-md bg-ink px-3 py-2 text-center text-xs font-bold text-white">
                            janjinikah.com/rio/...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-3 grid gap-3 sm:grid-cols-4">
                <div v-for="item in pipeline" :key="item.title" class="rounded-md border border-white/10 bg-white/10 p-3">
                  <component :is="item.icon" class="h-5 w-5 text-gold" />
                  <p class="mt-3 text-sm font-bold">{{ item.title }}</p>
                  <p class="mt-1 text-xs leading-5 text-white/55">{{ item.detail }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="nilai" class="border-b border-ink/10 bg-white">
        <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div>
            <p class="text-sm font-bold uppercase text-gold">Penilaian jujur</p>
            <h2 class="mt-3 max-w-xl text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Landing page harus menjual peluang bisnis, bukan sekadar undangan cantik.
            </h2>
            <p class="mt-4 max-w-xl leading-7 text-ink/65">
              Target Janji Nikah adalah member yang ingin dapat order. Jadi halaman pertama perlu membuat mereka yakin:
              modalnya terukur, prosesnya pendek, dan hasilnya pantas ditawarkan ke klien.
            </p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <article v-for="feature in featureCards" :key="feature.title" class="rounded-lg border border-ink/10 bg-linen p-5">
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-white text-leaf shadow-soft">
                <component :is="feature.icon" class="h-5 w-5" />
              </div>
              <h3 class="mt-4 text-lg font-bold text-ink">{{ feature.title }}</h3>
              <p class="mt-2 text-sm leading-6 text-ink/65">{{ feature.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-linen">
        <div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:px-8">
          <div class="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
            <p class="text-sm font-bold uppercase text-gold">Yang dipangkas dari proses jualan</p>
            <h2 class="mt-3 text-3xl font-bold leading-tight text-ink">Member fokus cari order, sistem yang menjaga alurnya tetap rapi.</h2>
            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <div v-for="item in objections" :key="item" class="flex gap-3 rounded-md bg-linen p-4 text-sm font-semibold leading-6 text-ink/70">
                <CheckCircle2 class="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
                <span>{{ item }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-ink/10 bg-[#203a34] p-6 text-white shadow-soft">
            <Clock3 class="h-8 w-8 text-gold" />
            <h2 class="mt-5 text-3xl font-bold leading-tight">Cepat dicoba, tetap aman untuk MVP.</h2>
            <p class="mt-4 leading-7 text-white/70">
              Draft dan preview tidak memotong kredit, publish baru memakai kredit, pembayaran tetap manual, dan member tidak perlu
              menguasai editor desain rumit untuk mulai menawarkan jasa.
            </p>
            <div class="mt-6 rounded-md border border-white/10 bg-white/10 p-4">
              <p class="text-sm font-bold text-gold">Rekomendasi posisi jualan</p>
              <p class="mt-2 text-sm leading-6 text-white/75">
                Jangan jual sebagai "template undangan murah". Jual sebagai paket jasa cepat: demo tema, input data, link tamu,
                RSVP, ucapan, dan laporan untuk calon pengantin.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="cara-kerja" class="border-y border-ink/10 bg-white">
        <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div class="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p class="text-sm font-bold uppercase text-gold">Cara kerja</p>
              <h2 class="mt-3 max-w-2xl text-3xl font-bold leading-tight text-ink sm:text-4xl">
                Tiga langkah yang gampang dijelaskan ke member baru.
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

      <section class="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8">
        <div>
          <p class="text-sm font-bold uppercase text-gold">Untuk siapa?</p>
          <h2 class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Cocok kalau kamu punya akses ke pasar, bukan cuma ingin punya aplikasi.
          </h2>
          <p class="mt-4 leading-7 text-ink/65">
            Ini penting: tanpa channel jualan, landing page secantik apa pun tidak otomatis menghasilkan order.
            Janji Nikah paling masuk akal untuk orang yang sudah bisa ngobrol dengan calon pengantin.
          </p>
        </div>
        <div class="grid gap-3">
          <div v-for="item in audienceItems" :key="item" class="flex gap-3 rounded-md border border-ink/10 bg-white p-4 text-sm font-semibold leading-6 text-ink/70 shadow-soft">
            <CheckCircle2 class="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
            <span>{{ item }}</span>
          </div>
        </div>
      </section>

      <section class="bg-ink">
        <div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-white sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p class="text-sm font-bold uppercase text-gold">Langkah paling masuk akal</p>
            <h2 class="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
              Cek demo tema, buat draft pertama, lalu tawarkan ke satu calon klien nyata.
            </h2>
            <p class="mt-4 max-w-2xl leading-7 text-white/70">
              Validasi bisnisnya dari respons pasar. Kredit baru terpakai saat undangan benar-benar dipublish.
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
