export const DEFAULT_THEME_KEY = "elegant-classic";

export const invitationThemes = [
  {
    key: "elegant-classic",
    name: "Elegant Classic",
    category: "Formal premium",
    description: "Serif tegas, kontras hitam-putih, dan aksen emas tipis untuk resepsi gedung yang rapi.",
    swatches: ["#111514", "#f8f4ea", "#b9853c"],
    previewClass: "theme-preview-elegant-classic"
  },
  {
    key: "modern-minimal",
    name: "Modern Minimal",
    category: "Clean modern",
    description: "Layout lapang, tipografi bersih, dan aksen biru-hijau untuk pasangan muda yang suka sederhana.",
    swatches: ["#f7f8f6", "#243b3a", "#6f9c9a"],
    previewClass: "theme-preview-modern-minimal"
  },
  {
    key: "floral-garden",
    name: "Floral Garden",
    category: "Romantis taman",
    description: "Nuansa botanical, blush lembut, dan kartu acara hangat untuk konsep garden party.",
    swatches: ["#fff7f3", "#496c54", "#d46f6b"],
    previewClass: "theme-preview-floral-garden"
  },
  {
    key: "islamic-soft",
    name: "Islamic Soft",
    category: "Syar'i elegan",
    description: "Ornamen arch dan geometric halus dengan nuansa hijau teduh yang sopan dan tenang.",
    swatches: ["#eef5ee", "#2f5d51", "#c19a55"],
    previewClass: "theme-preview-islamic-soft"
  },
  {
    key: "nusantara-heritage",
    name: "Nusantara Heritage",
    category: "Adat Indonesia",
    description: "Aksen motif kain, komposisi royal, dan warna maroon-emas untuk rasa budaya yang kuat.",
    swatches: ["#3b1718", "#f5eee2", "#c79a45"],
    previewClass: "theme-preview-nusantara-heritage"
  },
  {
    key: "coastal-dawn",
    name: "Coastal Dawn",
    category: "Outdoor resort",
    description: "Nuansa pantai pagi, komposisi lapang, dan aksen koral untuk akad outdoor atau intimate wedding.",
    swatches: ["#f6fbfa", "#1f5f6f", "#e78f72"],
    previewClass: "theme-preview-coastal-dawn"
  },
  {
    key: "golden-bloom-stage",
    name: "Golden Bloom Stage",
    category: "Cinematic floral",
    description: "Ornamen bunga emas, section seperti panggung, galeri emosional, dan navigasi cepat untuk undangan yang terasa mewah.",
    swatches: ["#fff9ed", "#5b3b1f", "#c49a45", "#7e5b4f"],
    previewClass: "theme-preview-golden-bloom-stage"
  }
];

const themeMap = new Map(invitationThemes.map((theme) => [theme.key, theme]));

export function getInvitationTheme(key) {
  return themeMap.get(key) || themeMap.get(DEFAULT_THEME_KEY);
}

export function getThemeClass(key) {
  return `invitation-theme-${getInvitationTheme(key).key}`;
}
