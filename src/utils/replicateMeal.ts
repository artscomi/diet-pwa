import type { DailyMenu } from "@/types/diet";

export type ReplicateMealSlot =
  | "colazione"
  | "spuntinoMattutino"
  | "pranzo"
  | "merenda"
  | "cena"
  | "duranteLaGiornata";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/**
 * Sostituisce nel menu `target` il solo slot `slot` con una copia da `source`.
 */
export function applyMealSlotFromSource(
  target: DailyMenu,
  source: DailyMenu,
  slot: ReplicateMealSlot,
): DailyMenu {
  const out: DailyMenu = { ...target, date: target.date };

  switch (slot) {
    case "colazione":
      return { ...out, colazione: clone(source.colazione) };
    case "spuntinoMattutino":
      return { ...out, spuntinoMattutino: clone(source.spuntinoMattutino) };
    case "pranzo":
      return { ...out, pranzo: clone(source.pranzo) };
    case "merenda":
      return { ...out, merenda: clone(source.merenda) };
    case "cena":
      return { ...out, cena: clone(source.cena) };
    case "duranteLaGiornata": {
      const next: DailyMenu = { ...out };
      if (source.duranteLaGiornata !== undefined) {
        next.duranteLaGiornata = source.duranteLaGiornata;
      } else {
        delete next.duranteLaGiornata;
      }
      if (source.olio) {
        next.olio = clone(source.olio);
      } else {
        delete next.olio;
      }
      return next;
    }
    default:
      return out;
  }
}
