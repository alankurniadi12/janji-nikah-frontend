export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function transactionStatusLabel(status) {
  const labels = {
    waiting_payment: "Menunggu pembayaran",
    waiting_verification: "Menunggu verifikasi",
    success: "Berhasil",
    rejected: "Ditolak",
    expired: "Expired"
  };

  return labels[status] || status || "-";
}
