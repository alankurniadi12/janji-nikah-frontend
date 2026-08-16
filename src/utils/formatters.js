export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function formatCompactCurrency(value) {
  const amount = Number(value || 0);
  const absoluteAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absoluteAmount >= 1_000_000_000) {
    return `${sign}Rp ${formatCompactNumber(absoluteAmount / 1_000_000_000)} M`;
  }

  if (absoluteAmount >= 1_000_000) {
    return `${sign}Rp ${formatCompactNumber(absoluteAmount / 1_000_000)} jt`;
  }

  if (absoluteAmount >= 1_000) {
    return `${sign}Rp ${formatCompactNumber(absoluteAmount / 1_000)} rb`;
  }

  return `${sign}Rp ${Math.round(absoluteAmount)}`;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: value >= 100 ? 0 : 1
  }).format(value);
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

export function formatRelativeDate(value, now = new Date()) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return "baru saja";
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / dayMs);

  if (days === 0) {
    return "hari ini";
  }

  if (days < 30) {
    return `${days} hari yang lalu`;
  }

  const months = completeMonthDifference(date, now);

  if (months < 12) {
    return `${Math.max(1, months)} bulan yang lalu`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (!remainingMonths) {
    return `${years} tahun yang lalu`;
  }

  return `${years} tahun ${remainingMonths} bulan yang lalu`;
}

function completeMonthDifference(startDate, endDate) {
  let months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (endDate.getDate() < startDate.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
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

export function invitationStatusLabel(status) {
  const labels = {
    draft: "Draft",
    active: "Aktif",
    locked: "Terkunci",
    expired: "Expired"
  };

  return labels[status] || status || "-";
}

export function invitationStatusTone(status) {
  const tones = {
    draft: "bg-gold/10 text-gold border-gold/20",
    active: "bg-leaf/10 text-leaf border-leaf/20",
    locked: "bg-ink/10 text-ink/70 border-ink/15",
    expired: "bg-rose/10 text-rose border-rose/20"
  };

  return tones[status] || "bg-ink/10 text-ink/70 border-ink/15";
}

export function photoIdFromUrl(url) {
  if (!url) {
    return "";
  }

  const fileName = url.split("/").pop() || "";
  return fileName.replace(/\.[^.]+$/, "");
}

export function formatEventDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}
