import type { DailyMenu, FoodItem, ShoppingItem, ShoppingCategory } from "@/types/diet";

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

  push(menu.colazione?.carboidrati, CATEGORY_MAP["colazione.carboidrati"]);
  push(menu.colazione?.frutta, CATEGORY_MAP["colazione.frutta"]);
  push(menu.colazione?.proteine, CATEGORY_MAP["colazione.proteine"]);
  push(menu.spuntinoMattutino, CATEGORY_MAP["spuntinoMattutino"]);
  push(menu.pranzo?.carboidrati, CATEGORY_MAP["pranzo.carboidrati"]);
  push(menu.pranzo?.proteine, CATEGORY_MAP["pranzo.proteine"]);
  push(menu.pranzo?.verdure, CATEGORY_MAP["pranzo.verdure"]);
  push(menu.merenda, CATEGORY_MAP["merenda"]);
  push(menu.cena?.pane, CATEGORY_MAP["cena.pane"]);
  push(menu.cena?.verdure, CATEGORY_MAP["cena.verdure"]);
  push(menu.cena?.proteine, CATEGORY_MAP["cena.proteine"]);
  push(menu.olio, CATEGORY_MAP["olio"]);

  return results;
}

function makeId(name: string, unit: string): string {
  return `${name.toLowerCase().trim()}__${unit.toLowerCase().trim()}`;
}

export function buildShoppingList(
  dailyMenus: DailyMenu[],
  days: number,
  checkedIds: Set<string> = new Set(),
): ShoppingItem[] {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

  const aggregated = new Map<string, { name: string; totalQuantity: number; unit: string; category: ShoppingCategory }>();

  for (let d = 0; d < days; d++) {
    const menuIndex = ((dayOfYear + d) % dailyMenus.length);
    const menu = dailyMenus[menuIndex];
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
