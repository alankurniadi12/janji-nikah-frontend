export const paymentConfig = {
  bankName: import.meta.env.VITE_PAYMENT_BANK_NAME || "Rekening belum dikonfigurasi",
  accountNumber: import.meta.env.VITE_PAYMENT_ACCOUNT_NUMBER || "",
  accountHolder: import.meta.env.VITE_PAYMENT_ACCOUNT_HOLDER || "Janji Nikah",
  supportContact: import.meta.env.VITE_PAYMENT_SUPPORT_CONTACT || ""
};

export function hasConfiguredPaymentAccount(config = paymentConfig) {
  return Boolean(config.bankName && config.accountNumber);
}
