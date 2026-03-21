/**
 * Formatta quantità + unità per la lista spesa (es. 1200 g → "1,2 kg" in it-IT).
 */
export function formatShoppingQuantityDisplay(quantity: number, unit: string): string {
  const u = unit.trim().toLowerCase();
  const isGrams = u === "g" || u === "gr" || u === "grammi" || u === "grammo";

  if (isGrams && quantity >= 1000) {
    const kg = quantity / 1000;
    const qty = new Intl.NumberFormat("it-IT", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(kg);
    return `${qty} kg`;
  }

  return `${quantity} ${unit.trim()}`;
}
