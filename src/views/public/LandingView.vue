<script setup>
import { ref } from "vue";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarCheck2,
  Check,
  ChevronDown,
  Code2,
  Eye,
  FilePenLine,
  Gift,
  Image,
  LayoutDashboard,
  MessageCircleHeart,
  Palette,
  Rocket,
  Send,
  Smartphone,
  Sparkles,
  SwatchBook,
  Tags,
  UserPlus,
  Users
} from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import heroVisual1600 from "@/assets/landing/hero-visual-1600.jpg";
import heroVisual960 from "@/assets/landing/hero-visual-960.jpg";
import showcaseElegant560 from "@/assets/landing/showcase-elegant-560.jpg";
import showcaseElegant900 from "@/assets/landing/showcase-elegant-900.jpg";
import showcaseFloral560 from "@/assets/landing/showcase-floral-560.jpg";
import showcaseFloral900 from "@/assets/landing/showcase-floral-900.jpg";
import showcaseModern560 from "@/assets/landing/showcase-modern-560.jpg";
import showcaseModern900 from "@/assets/landing/showcase-modern-900.jpg";

const creditPurchaseRoute = {
  name: "login",
  query: { redirect: "/app/credits/buy" }
};

const values = [
  {
    title: "Gratis Selamanya",
    text: "Tidak ada biaya pendaftaran dan tidak ada biaya langganan bulanan.",
    shortText: "Tanpa biaya langganan.",
    icon: BadgeCheck
  },
  {
    title: "Tanpa Coding",
    text: "Tidak perlu membangun website sendiri atau memahami teknis yang rumit.",
    shortText: "Sistem sudah disiapkan.",
    icon: Code2
  },
  {
    title: "Branding Usahamu",
    text: "Nama usaha kamu tetap tampil pada undangan bersama Janji Nikah.",
    shortText: "Nama usaha member tetap tampil.",
    icon: BriefcaseBusiness
  },
  {
    title: "Harga Jasa Kamu Tentukan",
    text: "Kamu bebas menentukan harga jasa yang ditawarkan kepada calon pengantin.",
    shortText: "Member menentukan harga sendiri.",
    icon: Tags
  }
];

const problems = [
  {
    title: "Tidak bisa coding?",
    text: "Tidak masalah. Pilih tema, isi data pengantin, lalu preview hasilnya.",
    icon: Code2
  },
  {
    title: "Tidak jago desain?",
    text: "Gunakan tema yang sudah disiapkan tanpa harus membuat desain dari awal.",
    icon: Palette
  },
  {
    title: "Takut sistemnya ribet?",
    text: "Semua undangan dikelola dari satu dashboard yang sederhana dan mudah dipahami.",
    icon: LayoutDashboard
  }
];

const steps = [
  {
    title: "Daftar Gratis",
    text: "Masuk menggunakan akun Google dan mulai tanpa biaya langganan.",
    icon: UserPlus
  },
  {
    title: "Buat Undangan",
    text: "Masukkan data pengantin, acara, foto, cerita, dan informasi lainnya.",
    icon: FilePenLine
  },
  {
    title: "Publish",
    text: "Gunakan 1 kredit hanya ketika undangan benar-benar siap dipublikasikan.",
    icon: Rocket
  },
  {
    title: "Kirim ke Calon Pengantin",
    text: "Bagikan link undangan kepada calon pengantin untuk diteruskan kepada tamu.",
    icon: Send
  }
];

const features = [
  {
    title: "Tema Undangan",
    text: "Pilih tampilan yang sesuai dengan gaya acara tanpa membuat desain dari nol.",
    icon: Palette,
    visual: "themes"
  },
  {
    title: "RSVP",
    text: "Tamu dapat mengonfirmasi kehadiran langsung dari undangan.",
    icon: CalendarCheck2,
    visual: "rsvp"
  },
  {
    title: "Galeri Foto",
    text: "Tampilkan momen terbaik pasangan dalam satu halaman yang rapi dan menarik.",
    icon: Image,
    visual: "gallery"
  },
  {
    title: "Dashboard Pengelolaan",
    text: "Kelola draft, undangan aktif, kredit, transaksi, dan kebutuhan member dari satu tempat.",
    icon: LayoutDashboard,
    visual: "dashboard"
  }
];

const showcases = [
  {
    name: "Elegant",
    label: "Lembut & elegan",
    src: showcaseElegant560,
    srcset: `${showcaseElegant560} 560w, ${showcaseElegant900} 900w`
  },
  {
    name: "Floral",
    label: "Hangat & romantis",
    src: showcaseFloral560,
    srcset: `${showcaseFloral560} 560w, ${showcaseFloral900} 900w`
  },
  {
    name: "Modern",
    label: "Bersih & modern",
    src: showcaseModern560,
    srcset: `${showcaseModern560} 560w, ${showcaseModern900} 900w`
  }
];

const pricing = [
  {
    credits: "1 Kredit",
    price: "Rp25.000",
    unit: "Rp25.000 per undangan",
    description: "Cocok untuk satu order atau mulai mencoba.",
    cta: "Beli 1 Kredit"
  },
  {
    credits: "3 Kredit",
    price: "Rp70.000",
    unit: "Sekitar Rp23.333 per undangan",
    description: "Lebih hemat untuk beberapa order.",
    cta: "Beli 3 Kredit"
  },
  {
    credits: "5 Kredit",
    price: "Rp100.000",
    unit: "Rp20.000 per undangan",
    description: "Hemat Rp25.000 dibanding pembelian satuan.",
    cta: "Beli 5 Kredit",
    featured: true
  }
];

const faqs = [
  {
    question: "Apakah Janji Nikah benar-benar gratis?",
    answer: "Ya. Tidak ada biaya pendaftaran dan tidak ada biaya langganan bulanan. Kredit hanya diperlukan ketika ingin mempublish undangan."
  },
  {
    question: "Apakah harus bisa coding?",
    answer: "Tidak. Janji Nikah dirancang supaya member bisa membuat undangan tanpa kemampuan programming."
  },
  {
    question: "Apakah harus bisa desain?",
    answer: "Tidak. Tema undangan sudah disediakan dan dapat dipilih sesuai kebutuhan calon pengantin."
  },
  {
    question: "Berapa draft yang bisa dibuat?",
    answer: "Setiap member dapat membuat maksimal 3 draft sebelum dipublish."
  },
  {
    question: "Apakah harga jasa ke calon pengantin ditentukan Janji Nikah?",
    answer: "Tidak. Member bebas menentukan sendiri harga jasa yang ditawarkan kepada calon pengantin."
  },
  {
    question: "Apakah Janji Nikah mengambil komisi dari harga jasa member?",
    answer: "Tidak. Harga jasa yang kamu tentukan untuk calon pengantin adalah urusan antara kamu dan calon pengantin."
  },
  {
    question: "Apakah Janji Nikah nyaman digunakan lewat HP?",
    answer: "Untuk pengalaman terbaik saat membuat dan mengelola undangan, penggunaan laptop disarankan. Undangan yang sudah dipublish tetap dirancang agar nyaman dibuka melalui perangkat mobile."
  },
  {
    question: "Apakah ada tutorial penggunaan?",
    answer: "Ya. Panduan penggunaan akan disediakan untuk membantu member memahami alur dari membuat draft hingga publish undangan."
  }
];

const activeFaq = ref(0);

function toggleFaq(index) {
  activeFaq.value = activeFaq.value === index ? -1 : index;
}
</script>

<template>
  <div class="page-shell overflow-x-clip bg-linen">
    <header class="sticky top-0 z-40 border-b border-ink/10 bg-linen/95 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-6 lg:px-8">
        <RouterLink to="/" class="focus-ring flex shrink-0 items-center gap-2 rounded-md text-ink" aria-label="Janji Nikah">
          <span class="flex h-9 w-9 items-center justify-center rounded-md bg-leaf text-xs font-bold text-white">JN</span>
          <span class="text-base font-bold sm:text-lg">Janji Nikah</span>
        </RouterLink>

        <nav class="hidden items-center gap-7 text-sm font-semibold text-ink/65 lg:flex" aria-label="Navigasi utama">
          <a class="focus-ring rounded transition hover:text-leaf" href="#fitur">Fitur</a>
          <a class="focus-ring rounded transition hover:text-leaf" href="#cara-kerja">Cara Kerja</a>
          <a class="focus-ring rounded transition hover:text-leaf" href="#harga">Harga</a>
          <a class="focus-ring rounded transition hover:text-leaf" href="#faq">FAQ</a>
        </nav>

        <div class="flex shrink-0 items-center gap-2">
          <RouterLink class="focus-ring hidden min-h-11 items-center rounded-md px-2 text-sm font-semibold text-ink/70 hover:text-leaf min-[390px]:inline-flex" to="/login">
            Masuk
          </RouterLink>
          <AppButton to="/login" class="px-3 sm:px-4">Mulai Gratis</AppButton>
        </div>
      </div>
    </header>

    <main>
      <section class="overflow-hidden border-b border-ink/10 bg-[#fffaf2]">
        <div class="mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[0.45fr_0.55fr] lg:items-center lg:gap-10 lg:px-8 lg:py-20 xl:gap-16">
          <div>
            <p class="text-xs font-bold uppercase text-gold sm:text-sm">Platform Jasa Undangan Digital</p>
            <h1 class="mt-4 max-w-xl text-4xl font-bold leading-[1.12] text-ink sm:text-5xl lg:text-[3.5rem]">
              Mulai Jasa Undangan Digital Tanpa Ribet
            </h1>
            <p class="mt-5 max-w-xl text-base leading-7 text-ink/70 sm:text-lg sm:leading-8">
              Buat undangan digital untuk calon pengantin dengan template siap pakai, kelola semuanya dari satu dashboard, dan tentukan sendiri harga jasamu.
            </p>
            <p class="mt-4 max-w-xl text-base font-bold leading-7 text-ink">
              Tanpa bisa coding, tanpa bisa desain, dan tanpa biaya bulanan.
            </p>

            <div class="mt-7 flex flex-col gap-3 sm:flex-row">
              <AppButton to="/login" class="w-full px-6 sm:w-auto">
                Mulai Gratis
                <ArrowRight class="h-4 w-4" />
              </AppButton>
              <AppButton to="/demo-tema" variant="secondary" class="w-full px-6 sm:w-auto">
                <Eye class="h-4 w-4" />
                Lihat Contoh Undangan
              </AppButton>
            </div>
            <p class="mt-4 flex items-center gap-2 text-sm font-medium text-ink/55">
              <Check class="h-4 w-4 shrink-0 text-leaf" />
              Gratis selamanya <span aria-hidden="true">•</span> Kredit hanya digunakan saat publish
            </p>
          </div>

          <div class="relative lg:-mr-12 xl:-mr-24">
            <div class="absolute inset-x-10 bottom-1 h-16 rounded-full bg-ink/10 blur-2xl" aria-hidden="true" />
            <img
              :src="heroVisual960"
              :srcset="`${heroVisual960} 960w, ${heroVisual1600} 1600w`"
              sizes="(min-width: 1024px) 58vw, 100vw"
              width="1600"
              height="900"
              alt="Dashboard member Janji Nikah, pilihan tema, dan undangan digital pada smartphone"
              fetchpriority="high"
              decoding="async"
              class="relative block h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section class="border-b border-ink/10 bg-white" aria-labelledby="value-heading">
        <div class="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div class="max-w-2xl">
            <p class="text-xs font-bold uppercase text-gold sm:text-sm">Mulai dengan tenang</p>
            <h2 id="value-heading" class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Mulai lebih ringan, jalankan lebih fleksibel
            </h2>
          </div>

          <div class="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-4 md:gap-6">
            <article v-for="value in values" :key="value.title" class="border-t border-ink/10 pt-5">
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-leaf">
                <component :is="value.icon" class="h-5 w-5" />
              </div>
              <h3 class="mt-4 text-base font-bold leading-6 text-ink">{{ value.title }}</h3>
              <p class="mt-2 text-sm leading-6 text-ink/60 md:hidden">{{ value.shortText }}</p>
              <p class="mt-2 hidden text-sm leading-6 text-ink/60 md:block">{{ value.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-linen" aria-labelledby="problem-heading">
        <div class="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div class="max-w-3xl">
            <p class="text-xs font-bold uppercase text-gold sm:text-sm">Sistemnya sudah disiapkan</p>
            <h2 id="problem-heading" class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Mulai jasa digital tidak harus mulai dari nol
            </h2>
            <p class="mt-5 max-w-2xl leading-7 text-ink/65">
              Membangun website undangan sendiri membutuhkan waktu, kemampuan teknis, desain, hosting, dan pengelolaan sistem.
            </p>
            <p class="mt-3 max-w-3xl leading-7 text-ink/65">
              Janji Nikah menyiapkan platformnya supaya kamu bisa fokus pada hal yang lebih penting:
              <strong class="text-ink">mencari calon pengantin dan memberikan pelayanan yang baik.</strong>
            </p>
          </div>

          <div class="mt-9 grid gap-4 md:grid-cols-3">
            <article v-for="problem in problems" :key="problem.title" class="rounded-lg border border-ink/10 bg-white p-5 sm:p-6">
              <div class="flex h-11 w-11 items-center justify-center rounded-md bg-mint text-leaf">
                <component :is="problem.icon" class="h-5 w-5" />
              </div>
              <h3 class="mt-5 text-lg font-bold text-ink">{{ problem.title }}</h3>
              <p class="mt-2 text-sm leading-6 text-ink/65">{{ problem.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="cara-kerja" class="scroll-mt-20 border-y border-ink/10 bg-white" aria-labelledby="steps-heading">
        <div class="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div class="max-w-3xl">
            <p class="text-xs font-bold uppercase text-gold sm:text-sm">Cara Kerja</p>
            <h2 id="steps-heading" class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Dari order sampai undangan online, cukup beberapa langkah
            </h2>
          </div>

          <ol class="relative mt-10 grid gap-0 md:grid-cols-2 md:gap-x-10 lg:grid-cols-4 lg:gap-x-8">
            <li v-for="(step, index) in steps" :key="step.title" class="landing-step relative grid grid-cols-[3.25rem_1fr] gap-4 pb-9 md:pb-10">
              <div class="relative z-10 flex h-12 w-12 items-center justify-center rounded-md border border-leaf/20 bg-mint text-leaf">
                <component :is="step.icon" class="h-5 w-5" />
              </div>
              <div class="pt-0.5">
                <p class="text-xs font-bold text-gold">{{ String(index + 1).padStart(2, "0") }}</p>
                <h3 class="mt-1 text-lg font-bold text-ink">{{ step.title }}</h3>
                <p class="mt-2 text-sm leading-6 text-ink/60">{{ step.text }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section id="fitur" class="scroll-mt-20 bg-linen" aria-labelledby="features-heading">
        <div class="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div class="max-w-3xl">
            <p class="text-xs font-bold uppercase text-gold sm:text-sm">Fitur Utama</p>
            <h2 id="features-heading" class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Semua yang dibutuhkan untuk membuat undangan calon pengantin
            </h2>
          </div>

          <div class="mt-12 grid gap-14 lg:gap-20">
            <article
              v-for="(feature, index) in features"
              :key="feature.title"
              class="grid items-center gap-7 lg:grid-cols-2 lg:gap-16"
            >
              <div class="order-2 lg:order-none" :class="index % 2 === 1 ? 'lg:order-2' : ''">
                <div class="flex h-11 w-11 items-center justify-center rounded-md bg-mint text-leaf">
                  <component :is="feature.icon" class="h-5 w-5" />
                </div>
                <h3 class="mt-5 text-2xl font-bold text-ink sm:text-3xl">{{ feature.title }}</h3>
                <p class="mt-3 max-w-lg leading-7 text-ink/65">{{ feature.text }}</p>
              </div>

              <div class="order-1 rounded-lg border border-ink/10 bg-white p-4 shadow-soft sm:p-6 lg:order-none" :class="index % 2 === 1 ? 'lg:order-1' : ''">
                <div v-if="feature.visual === 'themes'" class="grid grid-cols-3 gap-3" aria-label="Pilihan tema undangan">
                  <div class="aspect-[3/4] rounded-md bg-[#eff6f2] p-2">
                    <div class="h-full rounded border border-leaf/15 bg-white p-2 text-center">
                      <div class="mx-auto mt-3 h-10 w-10 rounded-full border border-leaf/25" />
                      <p class="mt-3 text-[10px] font-bold text-leaf">MODERN</p>
                      <div class="mx-auto mt-2 h-px w-8 bg-gold/60" />
                    </div>
                  </div>
                  <div class="aspect-[3/4] rounded-md bg-[#fff8ed] p-2">
                    <div class="h-full rounded border border-gold/25 bg-ink p-2 text-center text-white">
                      <div class="mx-auto mt-3 h-10 w-10 rounded-full border border-gold/60" />
                      <p class="mt-3 text-[10px] font-bold text-gold">ELEGANT</p>
                      <div class="mx-auto mt-2 h-px w-8 bg-white/40" />
                    </div>
                  </div>
                  <div class="aspect-[3/4] rounded-md bg-rose/10 p-2">
                    <div class="h-full rounded border border-rose/20 bg-white p-2 text-center">
                      <Sparkles class="mx-auto mt-4 h-8 w-8 text-rose" />
                      <p class="mt-4 text-[10px] font-bold text-rose">FLORAL</p>
                      <div class="mx-auto mt-2 h-px w-8 bg-leaf/30" />
                    </div>
                  </div>
                </div>

                <div v-else-if="feature.visual === 'rsvp'" class="grid gap-4 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
                  <div class="rounded-md bg-mint p-5 text-center">
                    <Users class="mx-auto h-8 w-8 text-leaf" />
                    <p class="mt-3 text-sm font-bold text-ink">Konfirmasi Kehadiran</p>
                    <p class="mt-1 text-xs text-ink/55">langsung dari undangan</p>
                  </div>
                  <div class="grid gap-3">
                    <div class="flex min-h-12 items-center gap-3 rounded-md border border-leaf/20 bg-white px-4">
                      <span class="flex h-5 w-5 items-center justify-center rounded-full bg-leaf text-white"><Check class="h-3 w-3" /></span>
                      <span class="text-sm font-semibold text-ink">Hadir</span>
                    </div>
                    <div class="flex min-h-12 items-center gap-3 rounded-md border border-ink/10 bg-white px-4">
                      <span class="h-5 w-5 rounded-full border border-ink/20" />
                      <span class="text-sm font-semibold text-ink/65">Tidak Hadir</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="feature.visual === 'gallery'" class="grid grid-cols-[1.2fr_0.8fr] gap-3">
                  <div class="flex min-h-44 items-end rounded-md bg-[#d9eee3] p-4">
                    <div>
                      <Image class="h-7 w-7 text-leaf" />
                      <p class="mt-2 text-sm font-bold text-ink">Momen Utama</p>
                    </div>
                  </div>
                  <div class="grid gap-3">
                    <div class="rounded-md bg-rose/15" />
                    <div class="rounded-md bg-gold/15" />
                  </div>
                </div>

                <div v-else class="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                  <div class="rounded-md bg-ink p-5 text-white">
                    <p class="text-xs font-bold uppercase text-gold">Dashboard Member</p>
                    <p class="mt-3 text-xl font-bold">Semua tetap rapi</p>
                    <div class="mt-5 grid grid-cols-2 gap-2">
                      <div class="rounded bg-white/10 p-3">
                        <p class="text-xl font-bold">3</p>
                        <p class="mt-1 text-[11px] text-white/60">Draft</p>
                      </div>
                      <div class="rounded bg-white/10 p-3">
                        <p class="text-xl font-bold">2</p>
                        <p class="mt-1 text-[11px] text-white/60">Aktif</p>
                      </div>
                    </div>
                  </div>
                  <div class="grid content-center gap-3">
                    <div v-for="label in ['Undangan', 'Kredit', 'Transaksi']" :key="label" class="flex items-center gap-3 rounded-md border border-ink/10 px-4 py-3">
                      <span class="h-2 w-2 rounded-full bg-leaf" />
                      <span class="text-sm font-semibold text-ink">{{ label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="overflow-hidden border-y border-ink/10 bg-white" aria-labelledby="showcase-heading">
        <div class="mx-auto max-w-7xl py-20 sm:py-24">
          <div class="flex flex-col gap-6 px-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div class="max-w-3xl">
              <p class="text-xs font-bold uppercase text-gold sm:text-sm">Showcase Undangan</p>
              <h2 id="showcase-heading" class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
                Undangan yang pantas kamu tawarkan kepada calon pengantin
              </h2>
              <p class="mt-4 max-w-2xl leading-7 text-ink/65">
                Berikan pilihan tampilan yang sesuai dengan karakter setiap pasangan. Dari gaya elegan, romantis, hingga modern dan minimal, setiap undangan dirancang agar terlihat profesional dan nyaman dibuka melalui perangkat mobile.
              </p>
            </div>
            <AppButton to="/demo-tema" variant="secondary" class="w-full shrink-0 sm:w-auto">
              Lihat Contoh Undangan
              <ArrowRight class="h-4 w-4" />
            </AppButton>
          </div>

          <div class="showcase-track mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-6 lg:grid lg:grid-cols-3 lg:items-center lg:gap-5 lg:overflow-visible lg:px-8">
            <RouterLink
              v-for="(showcase, index) in showcases"
              :key="showcase.name"
              to="/demo-tema"
              class="focus-ring group w-[84vw] max-w-[410px] shrink-0 snap-center overflow-hidden rounded-lg border border-ink/10 bg-linen transition hover:-translate-y-1 hover:shadow-soft lg:w-auto lg:max-w-none"
              :class="index === 1 ? 'lg:-translate-y-3' : ''"
            >
              <img
                :src="showcase.src"
                :srcset="showcase.srcset"
                sizes="(min-width: 1024px) 32vw, 84vw"
                width="900"
                height="1124"
                :alt="`Contoh undangan digital gaya ${showcase.name}`"
                loading="lazy"
                decoding="async"
                class="aspect-[900/1124] w-full object-cover"
              />
              <div class="flex items-center justify-between gap-4 border-t border-ink/10 bg-white px-4 py-4">
                <div>
                  <p class="font-bold text-ink">{{ showcase.name }}</p>
                  <p class="mt-0.5 text-sm text-ink/55">{{ showcase.label }}</p>
                </div>
                <ArrowRight class="h-5 w-5 text-leaf transition group-hover:translate-x-1" />
              </div>
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="bg-linen" aria-labelledby="opportunity-heading">
        <div class="mx-auto grid max-w-7xl gap-9 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-8">
          <div>
            <p class="text-xs font-bold uppercase text-gold sm:text-sm">Peluang Jasa</p>
            <h2 id="opportunity-heading" class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Kamu menentukan sendiri nilai jasamu
            </h2>
            <p class="mt-5 max-w-xl leading-7 text-ink/65">Janji Nikah menyediakan platform dan sistem publish.</p>
            <p class="mt-2 max-w-xl leading-7 text-ink/65">Harga jasa kepada calon pengantin sepenuhnya menjadi keputusanmu.</p>
          </div>

          <div class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft sm:p-7">
            <p class="text-sm font-bold text-gold">Contoh 1 Order</p>
            <div class="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
              <div>
                <p class="text-sm text-ink/55">Biaya 1 kredit</p>
                <p class="mt-1 text-2xl font-bold text-ink">Rp25.000</p>
              </div>
              <ArrowDown class="h-5 w-5 text-gold sm:-rotate-90" />
              <div>
                <p class="text-sm text-ink/55">Contoh harga jasa</p>
                <p class="mt-1 text-2xl font-bold text-ink">Rp75.000</p>
              </div>
              <ArrowDown class="h-5 w-5 text-gold sm:-rotate-90" />
              <div class="rounded-md bg-mint p-4">
                <p class="text-sm font-semibold text-leaf">Potensi margin kotor</p>
                <p class="mt-1 text-3xl font-bold text-leaf">Rp50.000</p>
              </div>
            </div>
            <p class="mt-5 border-t border-ink/10 pt-4 text-xs leading-5 text-ink/50">
              Harga jasa dan hasil yang diperoleh setiap member dapat berbeda. Simulasi di atas hanya sebagai contoh, bukan jaminan penghasilan.
            </p>
          </div>
        </div>
      </section>

      <section id="harga" class="scroll-mt-20 border-y border-ink/10 bg-white" aria-labelledby="pricing-heading">
        <div class="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div class="mx-auto max-w-3xl text-center">
            <p class="text-xs font-bold uppercase text-gold sm:text-sm">Harga Kredit</p>
            <h2 id="pricing-heading" class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Bayar hanya ketika ada undangan yang dipublish
            </h2>
            <p class="mt-4 leading-7 text-ink/65">Tidak ada biaya pendaftaran. Tidak ada biaya langganan bulanan.</p>
          </div>

          <div class="mx-auto mt-10 grid max-w-5xl gap-4 lg:grid-cols-3 lg:items-stretch">
            <article
              v-for="plan in pricing"
              :key="plan.credits"
              class="relative flex flex-col rounded-lg border p-5 sm:p-6"
              :class="plan.featured ? 'border-leaf bg-mint/45 shadow-soft' : 'border-ink/10 bg-linen'"
            >
              <span v-if="plan.featured" class="absolute right-4 top-4 rounded-md bg-leaf px-2.5 py-1 text-xs font-bold text-white">Paling Hemat</span>
              <p class="text-sm font-bold text-leaf">{{ plan.credits }}</p>
              <p class="mt-4 text-3xl font-bold text-ink">{{ plan.price }}</p>
              <p class="mt-2 text-sm font-semibold text-ink/70">{{ plan.unit }}</p>
              <p class="mt-4 min-h-12 text-sm leading-6 text-ink/55">{{ plan.description }}</p>
              <AppButton :to="creditPurchaseRoute" :variant="plan.featured ? 'primary' : 'secondary'" class="mt-6 w-full">
                {{ plan.cta }}
              </AppButton>
            </article>
          </div>

          <div class="mx-auto mt-8 max-w-2xl rounded-lg border border-ink/10 bg-linen px-5 py-5 text-center">
            <p class="font-bold text-ink">Belum yakin?</p>
            <p class="mt-2 text-sm leading-6 text-ink/65"><strong class="text-ink">Daftar gratis dan buat hingga 3 draft terlebih dahulu.</strong></p>
            <p class="mt-1 text-sm leading-6 text-ink/55">Kredit baru digunakan saat undangan dipublish.</p>
          </div>
        </div>
      </section>

      <section class="bg-linen" aria-labelledby="flexible-heading">
        <div class="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8">
          <div>
            <p class="text-xs font-bold uppercase text-gold sm:text-sm">Jalankan secara fleksibel</p>
            <h2 id="flexible-heading" class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Mulai dari sampingan. Jalankan sesuai waktumu.
            </h2>
            <p class="mt-5 max-w-2xl leading-7 text-ink/65">Tidak semua orang punya waktu untuk membangun usaha baru dari nol.</p>
            <p class="mt-3 max-w-2xl leading-7 text-ink/65">
              Janji Nikah dibuat untuk membantu siapa pun memulai jasa undangan digital dengan cara yang lebih sederhana, fleksibel, dan bisa dijalankan tanpa harus meninggalkan pekerjaan utama.
            </p>
            <p class="mt-3 max-w-2xl leading-7 text-ink/65">
              Kamu tetap menentukan sendiri kapan menerima order, berapa harga jasamu, dan seberapa besar ingin mengembangkan layananmu.
            </p>
          </div>

          <div class="relative rounded-lg border border-ink/10 bg-white p-5 shadow-soft sm:p-7">
            <div class="flex items-center justify-between gap-4 border-b border-ink/10 pb-5">
              <div>
                <p class="text-sm font-bold text-ink">Ritme kerja milikmu</p>
                <p class="mt-1 text-sm text-ink/55">Atur order sesuai waktu yang tersedia.</p>
              </div>
              <Smartphone class="h-7 w-7 shrink-0 text-leaf" />
            </div>
            <div class="mt-5 grid gap-3">
              <div class="flex items-center gap-4 rounded-md bg-mint/65 p-4">
                <MessageCircleHeart class="h-5 w-5 shrink-0 text-leaf" />
                <p class="text-sm font-semibold text-ink">Terima data calon pengantin</p>
              </div>
              <div class="flex items-center gap-4 rounded-md bg-linen p-4">
                <SwatchBook class="h-5 w-5 shrink-0 text-gold" />
                <p class="text-sm font-semibold text-ink">Siapkan undangan saat waktumu longgar</p>
              </div>
              <div class="flex items-center gap-4 rounded-md bg-rose/10 p-4">
                <Gift class="h-5 w-5 shrink-0 text-rose" />
                <p class="text-sm font-semibold text-ink">Publish ketika semuanya sudah siap</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" class="scroll-mt-20 border-t border-ink/10 bg-white" aria-labelledby="faq-heading">
        <div class="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:px-8">
          <div>
            <p class="text-xs font-bold uppercase text-gold sm:text-sm">FAQ</p>
            <h2 id="faq-heading" class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">Pertanyaan yang sering ditanyakan</h2>
          </div>

          <div class="divide-y divide-ink/10 border-y border-ink/10">
            <article v-for="(faq, index) in faqs" :key="faq.question">
              <h3>
                <button
                  type="button"
                  class="focus-ring flex min-h-14 w-full items-center justify-between gap-4 rounded px-1 py-4 text-left text-base font-bold text-ink"
                  :aria-expanded="activeFaq === index"
                  :aria-controls="`faq-panel-${index}`"
                  @click="toggleFaq(index)"
                >
                  <span>{{ faq.question }}</span>
                  <ChevronDown class="h-5 w-5 shrink-0 text-leaf transition" :class="activeFaq === index ? 'rotate-180' : ''" />
                </button>
              </h3>
              <div v-show="activeFaq === index" :id="`faq-panel-${index}`" class="pb-5 pr-9 text-sm leading-6 text-ink/65">
                {{ faq.answer }}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-leaf text-white">
        <div class="mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <Sparkles class="mx-auto h-7 w-7 text-gold" />
          <h2 class="mt-5 text-3xl font-bold leading-tight sm:text-4xl">Siap Memulai Jasa Undangan Digitalmu?</h2>
          <p class="mx-auto mt-4 max-w-2xl leading-7 text-white/75">
            Daftar gratis, buat undangan pertamamu, dan lihat sendiri bagaimana Janji Nikah membantu proses kerja menjadi lebih sederhana.
          </p>
          <AppButton to="/login" variant="secondary" class="mt-7 w-full border-white bg-white px-7 text-leaf hover:border-white hover:text-ink sm:w-auto">
            Mulai Gratis
            <ArrowRight class="h-4 w-4" />
          </AppButton>
          <p class="mt-4 text-sm font-medium text-white/60">Tanpa biaya bulanan <span aria-hidden="true">•</span> Tanpa kartu kredit</p>
        </div>
      </section>
    </main>

    <footer class="bg-ink text-white">
      <div class="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div class="max-w-md">
          <RouterLink to="/" class="focus-ring inline-flex items-center gap-2 rounded text-lg font-bold">
            <span class="flex h-9 w-9 items-center justify-center rounded-md bg-white text-xs font-bold text-leaf">JN</span>
            Janji Nikah
          </RouterLink>
          <p class="mt-4 text-sm leading-6 text-white/60">
            Platform untuk membantu siapa pun memulai dan menjalankan jasa undangan digital dengan lebih mudah.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:justify-self-end md:text-right">
          <a class="focus-ring rounded text-white/65 transition hover:text-white" href="#fitur">Fitur</a>
          <a class="focus-ring rounded text-white/65 transition hover:text-white" href="#cara-kerja">Cara Kerja</a>
          <a class="focus-ring rounded text-white/65 transition hover:text-white" href="#harga">Harga</a>
          <a class="focus-ring rounded text-white/65 transition hover:text-white" href="#faq">FAQ</a>
          <span class="text-white/45">Syarat & Ketentuan</span>
          <span class="text-white/45">Kebijakan Privasi</span>
        </div>
      </div>
      <div class="border-t border-white/10">
        <p class="mx-auto max-w-7xl px-5 py-5 text-xs text-white/45 sm:px-6 lg:px-8">© Janji Nikah. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing-step:not(:last-child)::before {
  position: absolute;
  top: 3.25rem;
  bottom: 0;
  left: 1.625rem;
  width: 1px;
  content: "";
  background: rgba(49, 92, 76, 0.18);
}

.showcase-track {
  scrollbar-width: none;
}

.showcase-track::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .landing-step::before {
    display: none;
  }
}
</style>
