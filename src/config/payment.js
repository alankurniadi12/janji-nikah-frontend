function normalizeInstagramHandle(value = "") {
  return value.trim().replace(/^@/, "");
}

function buildSupportLinks() {
  const instagramHandle = normalizeInstagramHandle(import.meta.env.VITE_PAYMENT_SUPPORT_INSTAGRAM || "");
  const facebookUrl = (import.meta.env.VITE_PAYMENT_SUPPORT_FACEBOOK_URL || "").trim();

  return [
    instagramHandle
      ? {
          key: "instagram",
          icon: "instagram",
          label: "Instagram",
          value: `@${instagramHandle}`,
          href: `https://www.instagram.com/${instagramHandle}`
        }
      : null,
    facebookUrl
      ? {
          key: "facebook",
          icon: "facebook",
          label: "Facebook",
          value: "Alan Kurniadi",
          href: facebookUrl
        }
      : null
  ].filter(Boolean);
}

export const paymentConfig = {
  bankName: import.meta.env.VITE_PAYMENT_BANK_NAME || "Hubungi admin",
  accountNumber: import.meta.env.VITE_PAYMENT_ACCOUNT_NUMBER || "",
  accountHolder: import.meta.env.VITE_PAYMENT_ACCOUNT_HOLDER || "Janji Nikah",
  supportContact: import.meta.env.VITE_PAYMENT_SUPPORT_CONTACT || "",
  supportLinks: buildSupportLinks()
};

export function hasConfiguredPaymentAccount(config = paymentConfig) {
  return Boolean(config.bankName && config.accountNumber);
}
