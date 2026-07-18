<template>
  <div class="page-shell">
    <header class="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
      <RouterLink to="/" class="text-lg font-bold text-ink">Janji Nikah</RouterLink>
      <RouterLink class="focus-ring rounded-md px-3 py-2 text-sm font-semibold text-leaf hover:bg-mint" to="/login">
        Masuk
      </RouterLink>
    </header>
    <main class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section class="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <p class="text-sm font-bold uppercase tracking-widest text-gold">Demo tema</p>
        <h1 class="mt-3 text-3xl font-bold text-ink">Demo tema akan disambungkan pada fase tema publik.</h1>
        <p class="mt-3 leading-7 text-ink/65">
          Endpoint tema sudah tersedia di backend. Halaman ini disiapkan agar navigasi publik tidak buntu saat fase auth berjalan.
        </p>
      </section>
    </main>
  </div>
</template>
