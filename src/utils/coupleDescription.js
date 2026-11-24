const childOrderWords = ["", "pertama", "kedua", "ketiga", "keempat", "kelima", "keenam", "ketujuh", "kedelapan", "kesembilan", "kesepuluh"];

export function formatCoupleDescription(couple, role) {
  const parentsName = couple?.parentsName?.trim() || "";
  if (!parentsName) return "";

  // Older invitations can contain a complete sentence instead of separate parent labels.
  const father = parentsName.match(/(?:^|\n)Ayah:\s*([^\n]*)/i)?.[1]?.trim();
  const mother = parentsName.match(/(?:^|\n)Ibu:\s*([^\n]*)/i)?.[1]?.trim();
  if (father === undefined && mother === undefined) return parentsName;

  const names = [father, mother].filter(Boolean).join(" dan ");
  if (!names) return "";

  const order = Number(couple?.childOrder);
  const orderText = Number.isSafeInteger(order) && order > 0
    ? ` ${childOrderWords[order] || `ke-${order}`}`
    : "";
  return `${role === "bride" ? "Putri" : "Putra"}${orderText} dari ${names}`;
}
