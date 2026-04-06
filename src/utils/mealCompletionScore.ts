import type { DailyMenu } from "@/types/diet";
import type { ReplicateMealSlot } from "@/utils/replicateMeal";
import type { MealCompletionMap } from "@/utils/mealCompletionStatus";

/** I 5 pasti della giornata (stesso ordine della UI). */
const FIVE_MEAL_SLOTS: ReplicateMealSlot[] = [
  "colazione",
  "spuntinoMattutino",
  "pranzo",
  "merenda",
  "cena",
];

/** Allineato a `DailyMenu.tsx`: pasto conteggiato solo se la sezione è mostrata. */
export function isMealSlotActive(
  menu: DailyMenu,
  slot: ReplicateMealSlot,
): boolean {
  switch (slot) {
    case "colazione":
    case "pranzo":
    case "cena":
      return true;
    case "spuntinoMattutino":
      return Boolean(menu.spuntinoMattutino);
    case "merenda":
      return Boolean(menu.merenda);
    default:
      return false;
  }
}

/** Pasti attivi quel giorno (sottoinsieme dei 5). */
export function getVisibleMealSlots(menu: DailyMenu): ReplicateMealSlot[] {
  return FIVE_MEAL_SLOTS.filter((s) => isMealSlotActive(menu, s));
}

export function hasAnyMealCompletionForDay(
  menu: DailyMenu,
  map: MealCompletionMap,
): boolean {
  return FIVE_MEAL_SLOTS.filter((s) => isMealSlotActive(menu, s)).some(
    (s) => map[s] !== undefined,
  );
}

/**
 * 0–100: media su **sempre 5** pasti.
 * Completato 100%, in parte 50%, non segnato 0%.
 * Pasto non previsto nel menu (spuntino/merenda assenti) conta 100% così non abbassa la media.
 */
export function computeDailyMealCompletionPercent(
  menu: DailyMenu,
  map: MealCompletionMap,
): number {
  let sum = 0;
  for (const s of FIVE_MEAL_SLOTS) {
    if (!isMealSlotActive(menu, s)) {
      sum += 100;
      continue;
    }
    const st = map[s];
    if (st === "completed") sum += 100;
    else if (st === "partial") sum += 50;
  }
  return Math.round(sum / 5);
}
