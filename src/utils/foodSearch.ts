import type { FoodItem } from "@/types/diet";

/** Oltre questo numero di opzioni mostriamo il campo di ricerca. */
export const FOOD_SEARCH_MIN_OPTIONS = 6;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Filtra per nome: tutte le parole cercate devono comparire (senza accenti né maiuscole). */
export function filterFoods(options: FoodItem[], query: string): FoodItem[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return options;
  return options.filter((o) => {
    const name = normalize(o.name);
    return words.every((w) => name.includes(w));
  });
}
