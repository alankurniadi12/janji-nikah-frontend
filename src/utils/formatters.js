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

export function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
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

export function transactionStatusTone(status) {
  const tones = {
    waiting_payment: "bg-gold/10 text-gold border-gold/20",
    waiting_verification: "bg-leaf/10 text-leaf border-leaf/20",
    success: "bg-leaf/10 text-leaf border-leaf/20",
    rejected: "bg-rose/10 text-rose border-rose/20",
    expired: "bg-ink/10 text-ink/70 border-ink/15"
  };

  return tones[status] || "bg-ink/10 text-ink/70 border-ink/15";
}
