/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  safelist: [
    "invitation-theme-elegant-classic",
    "invitation-theme-modern-minimal",
    "invitation-theme-floral-garden",
    "invitation-theme-islamic-soft",
    "invitation-theme-nusantara-heritage",
    "invitation-theme-coastal-dawn",
    "invitation-theme-golden-bloom-stage"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        leaf: "#315c4c",
        mint: "#d9eee3",
        rose: "#d46f6b",
        gold: "#b9853c",
        linen: "#f8f3ea"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 27, 0.08)"
      }
    }
  },
  plugins: []
};
