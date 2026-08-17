<script setup>
import { ArrowRight, CheckCircle2, Eye, Gift, Link as LinkIcon, Palette, WalletCards } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";
import { invitationThemes } from "@/lib/invitationThemes";

const steps = [
  { title: "Beli kredit sesuai kebutuhan", text: "Mulai dari paket kecil dulu. Kredit hanya terpakai saat undangan benar-benar dipublish.", icon: WalletCards },
  { title: "Buat undangan untuk klien", text: "Isi data pengantin, acara, foto, musik, dan tema lewat form bertahap yang sederhana.", icon: Gift },
  { title: "Bagikan link siap pakai", text: "Tamu mendapat link personal untuk membuka undangan, RSVP, dan mengirim ucapan.", icon: LinkIcon }
];

const featuredThemes = invitationThemes.slice(0, 4);

const sellingPoints = [
  "Cocok untuk reseller, admin jasa undangan, dan freelancer wedding.",
  "Tidak perlu membuat desain dari nol untuk setiap order.",
  "Preview gratis, kredit baru dipakai saat undangan dipublish."
];
</script>

<template>
  <div class="page-shell">
    <header class="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <RouterLink to="/" class="text-lg font-bold text-ink">Janji Nikah</RouterLink>
      <AppButton to="/login" variant="secondary">Masuk</AppButton>
    </header>

    <main>
      <section class="border-y border-ink/10 bg-white">
        <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
          <div class="flex flex-col justify-center">
            <p class="text-sm font-bold uppercase tracking-widest text-gold">Peluang jasa undangan digital</p>
            <h1 class="mt-4 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Janji Nikah
            </h1>
            <p class="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
              Bantu calon pengantin punya undangan digital yang rapi, lengkap, dan mudah dibagikan.
              Kamu fokus cari klien dan isi data, Janji Nikah bantu urusan tema, link tamu, RSVP, ucapan,
              dan sistem kredit yang sederhana.
            </p>
            <div class="mt-6 grid gap-3 sm:grid-cols-3">
              <div v-for="point in sellingPoints" :key="point" class="flex gap-2 rounded-md border border-ink/10 bg-linen px-3 py-3 text-sm font-semibold leading-6 text-ink/70">
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
          </div>

          <div class="rounded-lg border border-ink/10 bg-linen p-4 shadow-soft sm:p-6">
            <div class="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
              <div class="rounded-md border border-ink/10 bg-white p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-bold uppercase tracking-widest text-gold">Katalog tema</p>
                    <h2 class="mt-1 text-xl font-bold text-ink">Pilih gaya undangan klien</h2>
                  </div>
                  <Palette class="h-5 w-5 text-leaf" />
                </div>
                <div class="mt-4 grid grid-cols-2 gap-3">
                  <RouterLink
                    v-for="theme in featuredThemes"
                    :key="theme.key"
                    :to="{ name: 'theme-demo-detail', params: { themeKey: theme.key } }"
                    class="focus-ring block rounded-md border border-ink/10 bg-white p-2 transition hover:-translate-y-0.5 hover:border-leaf hover:shadow-soft"
                  >
                    <div class="theme-preview aspect-[4/3]" :class="theme.previewClass" />
                    <p class="mt-2 truncate text-sm font-bold text-ink">{{ theme.name }}</p>
                    <p class="truncate text-xs font-semibold text-ink/45">{{ theme.category }}</p>
                  </RouterLink>
                </div>
              </div>

              <div class="rounded-md border border-ink/10 bg-white p-4">
                <div class="mx-auto max-w-[260px] rounded-[2rem] border-8 border-ink bg-ink p-2 shadow-soft">
                  <div class="overflow-hidden rounded-[1.35rem] bg-white">
                    <div class="theme-preview theme-preview-golden-bloom-stage h-36 rounded-none border-0">
                      <div class="absolute inset-x-5 top-8 z-10 text-center">
                        <p class="text-xs font-bold uppercase tracking-widest text-white/80">The Wedding of</p>
                        <h3 class="mt-2 text-3xl font-bold text-white">Alya & Rama</h3>
                      </div>
                    </div>
                    <div class="space-y-3 p-4">
                      <div class="rounded-md border border-ink/10 bg-linen p-3 text-center">
                        <p class="text-xs font-bold uppercase tracking-widest text-gold">Akad & Resepsi</p>
                        <p class="mt-1 text-sm font-bold text-ink">Sabtu, 18 Juli 2026</p>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <div class="rounded-md bg-mint p-3 text-center">
                          <p class="text-xs font-bold text-leaf">RSVP</p>
                          <p class="mt-1 text-xs font-semibold text-ink/60">Hadir / Tidak</p>
                        </div>
                        <div class="rounded-md bg-gold/10 p-3 text-center">
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
                <p class="mt-4 text-center text-sm font-semibold leading-6 text-ink/60">
                  Katalog tema bisa ditunjukkan ke calon klien sebelum kamu membuat undangan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="grid gap-4 md:grid-cols-3">
          <article v-for="step in steps" :key="step.title" class="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
            <component :is="step.icon" class="h-5 w-5 text-leaf" />
            <h2 class="mt-4 text-lg font-bold text-ink">{{ step.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-ink/65">{{ step.text }}</p>
          </article>
        </div>
      </section>

      <section class="bg-ink">
        <div class="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-white sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p class="text-sm font-bold uppercase tracking-widest text-gold">Mulai dari order pertama</p>
            <h2 class="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
              Punya pasar calon pengantin? Ubah jadi jasa undangan digital yang bisa langsung kamu tawarkan.
            </h2>
            <p class="mt-4 max-w-2xl leading-7 text-white/70">
              Tunjukkan katalog tema, buat preview untuk klien, lalu publish saat sudah deal. Sistem kredit membantu modal tetap ringan dan biaya tiap undangan mudah dihitung.
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
