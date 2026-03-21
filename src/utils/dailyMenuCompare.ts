import type { DailyMenu } from "@/types/diet";

/** Confronto strutturale per rilevare modifiche non salvate in modifica menu. */
export function dailyMenusEqual(a: DailyMenu, b: DailyMenu): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
