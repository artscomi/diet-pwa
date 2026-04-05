import type { DailyMenu } from "@/types/diet";
import type { ReplicateMealSlot } from "@/utils/replicateMeal";
import type { MealCompletionMap } from "@/utils/mealCompletionStatus";

/** Pasti mostrati in lettura per quel giorno (allineato a `DailyMenu.tsx`). */
export function getVisibleMealSlots(menu: DailyMenu): ReplicateMealSlot[] {
  const slots: ReplicateMealSlot[] = ["colazione"];
  if (menu.spuntinoMattutino) slots.push("spuntinoMattutino");
  slots.push("pranzo");
  if (menu.merenda) slots.push("merenda");
  slots.push("cena");
  if (menu.duranteLaGiornata || menu.olio) slots.push("duranteLaGiornata");
  return slots;
}

export function hasAnyMealCompletionForDay(
  menu: DailyMenu,
  map: MealCompletionMap,
): boolean {
  return getVisibleMealSlots(menu).some((s) => map[s] !== undefined);
}

/** 0–100: completato 100%, in parte 50%, saltato o non segnato 0%. */
export function computeDailyMealCompletionPercent(
  menu: DailyMenu,
  map: MealCompletionMap,
): number {
  const slots = getVisibleMealSlots(menu);
  if (slots.length === 0) return 0;
  let sum = 0;
  for (const s of slots) {
    const st = map[s];
    if (st === "completed") sum += 100;
    else if (st === "partial") sum += 50;
  }
  return Math.round(sum / slots.length);
}
