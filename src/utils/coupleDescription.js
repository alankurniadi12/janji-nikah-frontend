const childOrderWords = ["", "pertama", "kedua", "ketiga", "keempat", "kelima", "keenam", "ketujuh", "kedelapan", "kesembilan", "kesepuluh"];

function withParentTitle(name, title) {
  if (!name) return "";
  const withoutTitle = name.replace(title === "Bapak" ? /^(?:Bapak|Bpk\.?|Pak)\s+/i : /^(?:Ibu|Bu)\s+/i, "");
  return `${title} ${withoutTitle}`;
}

export function formatCoupleDescription(couple, role) {
  const parentsName = couple?.parentsName?.trim() || "";
  if (!parentsName) return "";

  // Older invitations can contain a complete sentence instead of separate parent labels.
  const father = parentsName.match(/(?:^|\n)Ayah:\s*([^\n]*)/i)?.[1]?.trim();
  const mother = parentsName.match(/(?:^|\n)Ibu:\s*([^\n]*)/i)?.[1]?.trim();
  if (father === undefined && mother === undefined) {
    const sentence = parentsName.match(/^(Putra|Putri)(.*?) dari (.+?) dan (.+)$/i);
    if (!sentence) return parentsName;
    return `${sentence[1]}${sentence[2]} dari ${withParentTitle(sentence[3], "Bapak")} dan ${withParentTitle(sentence[4], "Ibu")}`;
  }

  const names = [withParentTitle(father, "Bapak"), withParentTitle(mother, "Ibu")].filter(Boolean).join(" dan ");
  if (!names) return "";

  const order = Number(couple?.childOrder);
  const orderText = Number.isSafeInteger(order) && order > 0
    ? ` ${childOrderWords[order] || `ke-${order}`}`
    : "";
  return `${role === "bride" ? "Putri" : "Putra"}${orderText} dari ${names}`;
}
