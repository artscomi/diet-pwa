import type {
  DailyMenu,
  FoodItem,
  FoodItemOrAlternatives,
  ShoppingItem,
  ShoppingCategory,
} from "@/types/diet";
import { flattenFoodSlot } from "@/utils/foodAlternatives";

const CATEGORY_MAP: Record<string, ShoppingCategory> = {
  "colazione.carboidrati": "carboidrati",
  "colazione.frutta": "frutta",
  "colazione.proteine": "proteine",
  "spuntinoMattutino": "altro",
  "pranzo.carboidrati": "carboidrati",
  "pranzo.proteine": "proteine",
  "pranzo.verdure": "verdure",
  "cena.pane": "carboidrati",
  "cena.verdure": "verdure",
  "cena.proteine": "proteine",
  "merenda": "altro",
  "olio": "altro",
};

function extractItems(menu: DailyMenu): Array<{ item: FoodItem; category: ShoppingCategory }> {
  const results: Array<{ item: FoodItem; category: ShoppingCategory }> = [];

  const push = (item: FoodItem | undefined, cat: ShoppingCategory) => {
    if (item?.name && item.quantity > 0) results.push({ item, category: cat });
  };

  const pushAlternatives = (
    slot: FoodItemOrAlternatives | undefined,
    cat: ShoppingCategory,
  ) => {
    for (const item of flattenFoodSlot(slot)) {
      results.push({ item, category: cat });
    }
  };

  push(menu.colazione?.carboidrati, CATEGORY_MAP["colazione.carboidrati"]);
  pushAlternatives(menu.colazione?.frutta, CATEGORY_MAP["colazione.frutta"]);
  push(menu.colazione?.proteine, CATEGORY_MAP["colazione.proteine"]);
  push(menu.spuntinoMattutino, CATEGORY_MAP["spuntinoMattutino"]);
  push(menu.pranzo?.carboidrati, CATEGORY_MAP["pranzo.carboidrati"]);
  push(menu.pranzo?.proteine, CATEGORY_MAP["pranzo.proteine"]);
  pushAlternatives(menu.pranzo?.verdure, CATEGORY_MAP["pranzo.verdure"]);
  push(menu.merenda, CATEGORY_MAP["merenda"]);
  push(menu.cena?.pane, CATEGORY_MAP["cena.pane"]);
  pushAlternatives(menu.cena?.verdure, CATEGORY_MAP["cena.verdure"]);
  push(menu.cena?.proteine, CATEGORY_MAP["cena.proteine"]);
  push(menu.olio, CATEGORY_MAP["olio"]);

  return results;
}

function makeId(name: string, unit: string): string {
  return `${name.toLowerCase().trim()}__${unit.toLowerCase().trim()}`;
}

function addDaysToDateKey(dateKey: string, deltaDays: number): string {
  const d = new Date(dateKey);
  d.setDate(d.getDate() + deltaDays);
  return d.toDateString();
}

/** Stesso criterio di rotazione menu dell’app (`getMenuForDateKey`). */
function menuIndexForDateKey(dateKey: string, menuCount: number): number {
  if (menuCount <= 0) return 0;
  const d = new Date(dateKey);
  const startOfYear = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - startOfYear.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  if (!Number.isFinite(diff)) return 0;
  const dayOfYear = Math.floor(diff / dayMs);
  return ((dayOfYear % menuCount) + menuCount) % menuCount;
}

export type BuildShoppingListOptions = {
  /** Chiave del giorno 0 (`Date.toDateString()`). Default: oggi locale. */
  todayKey?: string;
  /**
   * Per ogni giorno del periodo: se restituisce un menu con `date` assente o uguale a quella data,
   * quella versione sostituisce il template (es. menu modificato salvato in locale).
   */
  resolveSavedMenu?: (dateKey: string) => DailyMenu | null | undefined;
};

export function buildShoppingList(
  dailyMenus: DailyMenu[],
  days: number,
  checkedIds: Set<string> = new Set(),
  opts?: BuildShoppingListOptions,
): ShoppingItem[] {
  const today = new Date();
  const baseKey = opts?.todayKey ?? today.toDateString();
  const len = dailyMenus.length;

  const aggregated = new Map<string, { name: string; totalQuantity: number; unit: string; category: ShoppingCategory }>();

  for (let d = 0; d < days; d++) {
    const dateKey = addDaysToDateKey(baseKey, d);
    const menuIndex = menuIndexForDateKey(dateKey, len);
    const template = len > 0 ? dailyMenus[menuIndex] : undefined;

    const resolved = opts?.resolveSavedMenu?.(dateKey);
    const useSaved =
      resolved &&
      (resolved.date === undefined || resolved.date === dateKey);
    const menu = useSaved ? resolved : template;
    if (!menu) continue;

    for (const { item, category } of extractItems(menu)) {
      const id = makeId(item.name, item.unit);
      const existing = aggregated.get(id);
      if (existing) {
        existing.totalQuantity += item.quantity;
      } else {
        aggregated.set(id, {
          name: item.name,
          totalQuantity: item.quantity,
          unit: item.unit,
          category,
        });
      }
    }
  }

  return Array.from(aggregated.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      totalQuantity: Math.round(data.totalQuantity * 100) / 100,
      unit: data.unit,
      category: data.category,
      checked: checkedIds.has(id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "it"));
}

export const CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  carboidrati: "Carboidrati",
  proteine: "Proteine",
  verdure: "Verdure",
  frutta: "Frutta",
  altro: "Altro",
};

export const CATEGORY_ORDER: ShoppingCategory[] = [
  "verdure",
  "frutta",
  "proteine",
  "carboidrati",
  "altro",
];
