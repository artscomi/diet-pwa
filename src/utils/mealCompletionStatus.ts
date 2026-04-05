import type { ReplicateMealSlot } from "@/utils/replicateMeal";

export type MealCompletionStatus = "completed" | "skipped" | "partial";

export type MealCompletionMap = Partial<
  Record<ReplicateMealSlot, MealCompletionStatus>
>;

const STORAGE_PREFIX = "pocketDiet_mealCompletion_";

const SLOTS: ReplicateMealSlot[] = [
  "colazione",
  "spuntinoMattutino",
  "pranzo",
  "merenda",
  "cena",
  "duranteLaGiornata",
];

const STATUSES: MealCompletionStatus[] = ["completed", "skipped", "partial"];

function isSlot(k: string): k is ReplicateMealSlot {
  return (SLOTS as string[]).includes(k);
}

function isStatus(v: string): v is MealCompletionStatus {
  return (STATUSES as string[]).includes(v);
}

export function loadMealCompletionMap(dateKey: string): MealCompletionMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + dateKey);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, unknown>;
    const out: MealCompletionMap = {};
    for (const [k, v] of Object.entries(o)) {
      if (isSlot(k) && typeof v === "string" && isStatus(v)) {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveMealCompletionMap(
  dateKey: string,
  map: MealCompletionMap,
): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(map).filter(
    (k) => map[k as ReplicateMealSlot] !== undefined,
  );
  if (keys.length === 0) {
    localStorage.removeItem(STORAGE_PREFIX + dateKey);
    return;
  }
  localStorage.setItem(STORAGE_PREFIX + dateKey, JSON.stringify(map));
}

/** Rimuove tutti gli stati pasto salvati (es. cambio dieta). */
export function clearAllMealCompletions(): void {
  if (typeof window === "undefined") return;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) toRemove.push(key);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}
