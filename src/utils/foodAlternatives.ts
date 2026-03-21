import type { FoodItem, FoodItemOrAlternatives } from "@/types/diet";

export function isFoodItem(x: unknown): x is FoodItem {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as FoodItem).name === "string" &&
    typeof (x as FoodItem).quantity === "number" &&
    typeof (x as FoodItem).unit === "string"
  );
}

/** Appiattisce un campo menu in voci lista spesa. */
export function flattenFoodSlot(
  v: FoodItemOrAlternatives | undefined | null,
): FoodItem[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.filter((x) => isFoodItem(x) && x.name && x.quantity > 0);
  return isFoodItem(v) && v.name && v.quantity > 0 ? [v] : [];
}

/** Prima voce per i selettori (dropdown) quando ci sono più alternative. */
export function firstFoodItem(
  v: FoodItemOrAlternatives | undefined | null,
): FoodItem | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Aggiorna colazione.frutta / verdure con una nuova scelta da dropdown o modifica nome/qty.
 * - Stesso nome della prima alternativa → aggiorna solo quella, mantieni le altre.
 * - Nome diverso (nuova scelta dal menu) → sostituisci con una singola voce.
 */
export function updateFoodAlternativesSlot(
  prev: FoodItemOrAlternatives | undefined | null,
  next: FoodItem,
): FoodItemOrAlternatives {
  if (prev == null) return next;
  if (!Array.isArray(prev)) {
    return next;
  }
  const first = prev[0];
  if (first && first.name === next.name) {
    return [next, ...prev.slice(1)];
  }
  return next;
}
