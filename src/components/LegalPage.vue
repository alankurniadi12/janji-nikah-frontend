<script setup>
import BrandLogo from "@/components/BrandLogo.vue";

defineProps({
  eyebrow: {
    type: String,
    default: "Legal"
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  updatedAt: {
    type: String,
    default: "9 September 2026"
  },
  sections: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="page-shell">
    <header class="border-b border-ink/10 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <RouterLink to="/" class="focus-ring rounded-md">
          <BrandLogo mode="compact" size="compact" />
        </RouterLink>
        <RouterLink class="focus-ring rounded-md text-sm font-semibold text-leaf hover:text-ink" to="/">
          Kembali
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
      <section class="border-b border-ink/10 pb-8">
        <p class="text-sm font-bold uppercase tracking-widest text-gold">{{ eyebrow }}</p>
        <h1 class="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">{{ title }}</h1>
        <p class="mt-4 max-w-3xl text-base leading-7 text-ink/65">{{ description }}</p>
        <p class="mt-5 text-sm font-semibold text-ink/45">Terakhir diperbarui: {{ updatedAt }}</p>
      </section>

      <div class="mt-8 grid gap-8">
        <section v-for="section in sections" :key="section.title" class="border-b border-ink/10 pb-8 last:border-b-0">
          <h2 class="text-xl font-bold text-ink">{{ section.title }}</h2>
          <div class="mt-4 grid gap-3 text-sm leading-7 text-ink/65">
            <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          </div>
          <ul v-if="section.items?.length" class="mt-4 grid gap-2 text-sm leading-7 text-ink/65">
            <li v-for="item in section.items" :key="item" class="flex gap-3">
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  </div>
</template>
