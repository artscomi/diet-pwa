import type { DailyMenu } from "@/types/diet";

/** Giorno della settimana ISO: 1 = lunedì … 7 = domenica. */
export function isoWeekday(d: Date): number {
  return d.getDay() === 0 ? 7 : d.getDay();
}

export const WEEKDAY_LABELS = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
] as const;

function rotationIndex(d: Date, len: number): number {
  const startOfYear = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - startOfYear.getTime();
  if (!Number.isFinite(diff) || len <= 0) return 0;
  const dayOfYear = Math.floor(diff / 86_400_000);
  return ((dayOfYear % len) + len) % len;
}

/**
 * Menu (template) per una data.
 * - Se il nutrizionista ha associato i menu ai giorni della settimana, usa quello del giorno.
 * - Altrimenti (o se quel giorno manca nel piano) ruota sui menu disponibili.
 */
export function pickMenuTemplateForDate(
  menus: DailyMenu[],
  dateKey: string,
): DailyMenu | undefined {
  if (menus.length === 0) return undefined;
  const d = new Date(dateKey);
  const byWeekday = menus.find((m) => m.weekday === isoWeekday(d));
  if (byWeekday) return byWeekday;
  return menus[rotationIndex(d, menus.length)] ?? menus[0];
}
