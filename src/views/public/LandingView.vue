<script setup>
import { ArrowRight, Eye, Gift, Link as LinkIcon, WalletCards } from "@lucide/vue";

import AppButton from "@/components/AppButton.vue";

const steps = [
  { title: "Beli kredit", text: "Member memilih paket kredit yang sudah diatur admin.", icon: WalletCards },
  { title: "Buat undangan", text: "Isi data pengantin, acara, foto, musik, dan tema secara bertahap.", icon: Gift },
  { title: "Bagikan link", text: "Setiap tamu mendapat link personal untuk RSVP dan ucapan.", icon: LinkIcon }
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
            <p class="text-sm font-bold uppercase tracking-widest text-gold">SaaS undangan digital</p>
            <h1 class="mt-4 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Janji Nikah
            </h1>
            <p class="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
              Platform untuk member dan reseller yang ingin membuat undangan pernikahan digital untuk klien,
              mengelola tamu, dan menjual layanan dengan sistem kredit sederhana.
            </p>
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
          </div>

          <div class="min-h-[360px] rounded-lg border border-ink/10 bg-linen p-6 shadow-soft">
            <div class="h-full rounded-md bg-white p-5">
              <div class="border-b border-ink/10 pb-4">
                <p class="text-sm text-ink/50">Preview undangan</p>
                <h2 class="mt-2 text-3xl font-bold text-ink">Alya & Rama</h2>
              </div>
              <div class="mt-6 grid gap-4">
                <div class="h-32 rounded-md bg-mint" />
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-md border border-ink/10 p-4">
                    <p class="text-xs font-bold uppercase tracking-widest text-rose">Akad</p>
                    <p class="mt-2 text-sm font-semibold text-ink">Sabtu, 18 Juli</p>
                  </div>
                  <div class="rounded-md border border-ink/10 p-4">
                    <p class="text-xs font-bold uppercase tracking-widest text-gold">RSVP</p>
                    <p class="mt-2 text-sm font-semibold text-ink">Hadir / Tidak</p>
                  </div>
                </div>
                <div class="rounded-md bg-ink p-4 text-white">
                  <p class="text-sm font-semibold">Dibuat untuk klien, dikelola dari dashboard member.</p>
                </div>
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
    </main>
  </div>
</template>
