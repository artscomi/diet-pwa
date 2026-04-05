import type { DailyMenu, DietData, FoodItem } from "@/types/diet";
import { dietData as defaultDietData } from "@/data/dietData";
import { buildDietDataFromMenus } from "@/utils/buildDietDataFromMenus";

/** Lunghezza del ciclo giornaliero: più è alto, meno si ripetono i menu vicini. */
const ROTATION_CYCLE = 21;

function pick<T>(arr: T[] | undefined, i: number): T | undefined {
  if (!arr?.length) return undefined;
  const n = arr.length;
  return arr[((i % n) + n) % n];
}

function cloneItem(f: FoodItem): FoodItem {
  return { ...f };
}

function mergeDietDataForRotation(
  explicit: DietData | null | undefined,
  menus: DailyMenu[],
): DietData {
  const fromBuild = buildDietDataFromMenus(menus);
  const dd = explicit ?? fromBuild;
  return {
    colazione: {
      carboidrati: dd.colazione.carboidrati.length
        ? dd.colazione.carboidrati
        : defaultDietData.colazione.carboidrati,
      frutta: dd.colazione.frutta.length
        ? dd.colazione.frutta
        : defaultDietData.colazione.frutta,
      proteine: dd.colazione.proteine.length
        ? dd.colazione.proteine
        : defaultDietData.colazione.proteine,
    },
    spuntinoMattutino: dd.spuntinoMattutino.length
      ? dd.spuntinoMattutino
      : defaultDietData.spuntinoMattutino,
    pranzo: {
      carboidrati: dd.pranzo.carboidrati.length
        ? dd.pranzo.carboidrati
        : defaultDietData.pranzo.carboidrati,
      proteine: dd.pranzo.proteine.length
        ? dd.pranzo.proteine
        : defaultDietData.pranzo.proteine,
      verdure: dd.pranzo.verdure.length
        ? dd.pranzo.verdure
        : defaultDietData.pranzo.verdure,
    },
    merenda: dd.merenda.length ? dd.merenda : defaultDietData.merenda,
    cena: {
      pane: dd.cena.pane.length ? dd.cena.pane : defaultDietData.cena.pane,
      verdure: dd.cena.verdure.length
        ? dd.cena.verdure
        : defaultDietData.cena.verdure,
      proteine: dd.cena.proteine.length
        ? dd.cena.proteine
        : defaultDietData.cena.proteine,
    },
    olio:
      dd.olio?.length ? dd.olio : defaultDietData.olio ?? [],
  };
}

function buildSyntheticMenusFromBase(
  base: DailyMenu,
  merged: DietData,
): DailyMenu[] {
  const out: DailyMenu[] = [];
  for (let k = 0; k < ROTATION_CYCLE; k++) {
    const carbC = pick(merged.colazione.carboidrati, k);
    const frutta = pick(merged.colazione.frutta, k * 2 + 3);
    const protC = pick(merged.colazione.proteine, k * 3 + 1);
    const spunt = pick(merged.spuntinoMattutino, k);
    const carbP = pick(merged.pranzo.carboidrati, k + 1);
    const protP = pick(merged.pranzo.proteine, k * 2 + 5);
    const verdP = pick(merged.pranzo.verdure, k + 7);
    const mer = pick(merged.merenda, k + 1);
    const pane = pick(merged.cena.pane, k);
    const verdC = pick(merged.cena.verdure, k * 2 + 1);
    const protCe = pick(merged.cena.proteine, k * 3 + 2);
    const olioItem = pick(merged.olio, k);

    out.push({
      ...base,
      id: `menu-var-${k + 1}`,
      name: `Menu variato ${k + 1}`,
      colazione: {
        carboidrati: cloneItem(carbC!),
        frutta: cloneItem(frutta!),
        proteine: cloneItem(protC!),
      },
      spuntinoMattutino: cloneItem(spunt!),
      pranzo: {
        carboidrati: cloneItem(carbP!),
        proteine: cloneItem(protP!),
        verdure: cloneItem(verdP!),
      },
      merenda: cloneItem(mer!),
      cena: {
        pane: cloneItem(pane!),
        verdure: cloneItem(verdC!),
        proteine: cloneItem(protCe!),
      },
      ...(olioItem ? { olio: cloneItem(olioItem) } : {}),
    });
  }
  return out;
}

/**
 * Garantisce un ciclo di ROTATION_CYCLE giorni distinti per l’indice data:
 * - dieta con un solo menu (tipico upload): genera varianti dagli ingredienti (dietData);
 * - 2 … ROTATION_CYCLE-1 menu: ripete i template fino a riempire il ciclo;
 * - già ≥ ROTATION_CYCLE: nessun cambio.
 */
export function expandDailyMenusForRotation(
  menus: DailyMenu[],
  dietData?: DietData | null,
): DailyMenu[] {
  if (menus.length === 0) return menus;
  if (menus.length >= ROTATION_CYCLE) return menus;

  const merged = mergeDietDataForRotation(dietData, menus);

  if (menus.length === 1) {
    return buildSyntheticMenusFromBase(menus[0], merged);
  }

  return Array.from({ length: ROTATION_CYCLE }, (_, i) => {
    const tmpl = menus[i % menus.length];
    return {
      ...tmpl,
      id: `menu-${i + 1}`,
      name: `Menu giorno ${i + 1}`,
    };
  });
}
