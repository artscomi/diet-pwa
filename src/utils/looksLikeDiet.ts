/**
 * Controllo deterministico (senza AI) sul testo estratto da PDF/TXT:
 * se contiene almeno 2 pasti diversi e diverse quantità in grammi è quasi
 * certamente un piano alimentare. Evita falsi "non è una dieta" dovuti al
 * classificatore AI su layout insoliti (es. menu unico con tabelle di sostituzioni).
 */
const MEAL_WORDS = ["colazione", "pranzo", "cena", "spuntino", "merenda"];

export function looksLikeDiet(text: string | null | undefined): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  const meals = MEAL_WORDS.filter((w) => t.includes(w)).length;
  const grams = t.match(/\d+(?:[.,]\d+)?\s?(?:g|gr|grammi|ml)\b/g)?.length ?? 0;
  return meals >= 2 && grams >= 5;
}

/**
 * Testo estratto da PDF a colonne (es. "integrali30 gPane integrale50 g"):
 * separa nome e quantità e mette un divisore tra le colonne, così l'AI
 * distingue la prima scelta dalle alternative.
 */
export function tidyPdfText(text: string): string {
  return text
    .replace(/([A-Za-zÀ-ÿ)])(\d)/g, "$1 $2")
    .replace(/(\d+(?:[.,]\d+)?\s?(?:g|gr|ml|pz))(?=[A-ZÀ-Ý])/g, "$1 | ");
}
