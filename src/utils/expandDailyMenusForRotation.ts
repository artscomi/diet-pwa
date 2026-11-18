import type { DailyMenu, DietData, FoodItem } from "@/types/diet";
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

/** Prima lista non vuota tra quelle date (mai alimenti della dieta predefinita). */
function firstNonEmpty(...lists: (FoodItem[] | undefined)[]): FoodItem[] {
  return lists.find((l) => l && l.length > 0) ?? [];
}

/**
 * Alternative per categoria SOLO dalla dieta dell'utente: prima `dietData` estratto dal file,
 * poi gli alimenti presenti nei menu. Una categoria assente resta vuota.
 */
function mergeDietDataForRotation(
  explicit: DietData | null | undefined,
  menus: DailyMenu[],
): DietData {
  const b = buildDietDataFromMenus(menus);
  const e = explicit;
  return {
    colazione: {
      carboidrati: firstNonEmpty(e?.colazione?.carboidrati, b.colazione.carboidrati),
      frutta: firstNonEmpty(e?.colazione?.frutta, b.colazione.frutta),
      proteine: firstNonEmpty(e?.colazione?.proteine, b.colazione.proteine),
    },
    spuntinoMattutino: firstNonEmpty(e?.spuntinoMattutino, b.spuntinoMattutino),
    pranzo: {
      carboidrati: firstNonEmpty(e?.pranzo?.carboidrati, b.pranzo.carboidrati),
      proteine: firstNonEmpty(e?.pranzo?.proteine, b.pranzo.proteine),
      verdure: firstNonEmpty(e?.pranzo?.verdure, b.pranzo.verdure),
    },
    merenda: firstNonEmpty(e?.merenda, b.merenda),
    cena: {
      pane: firstNonEmpty(e?.cena?.pane, b.cena.pane),
      verdure: firstNonEmpty(e?.cena?.verdure, b.cena.verdure),
      proteine: firstNonEmpty(e?.cena?.proteine, b.cena.proteine),
    },
    olio: firstNonEmpty(e?.olio, b.olio),
  };
}

/** Alternativa scelta, oppure il valore originale del menu se la categoria non ha alternative. */
function pickOr<T>(alts: FoodItem[], i: number, fallback: T): FoodItem | T {
  const f = pick(alts, i);
  return f ? cloneItem(f) : fallback;
}

/**
 * Dieta con un solo menu: varia i giorni combinando le alternative che il nutrizionista
 * ha indicato per ciascuna categoria. Un pasto assente nella dieta resta assente.
 */
function buildSyntheticMenusFromBase(
  base: DailyMenu,
  merged: DietData,
): DailyMenu[] {
  const out: DailyMenu[] = [];
  for (let k = 0; k < ROTATION_CYCLE; k++) {
    const menu: DailyMenu = {
      ...base,
      id: `menu-var-${k + 1}`,
      name: `Menu variato ${k + 1}`,
      colazione: base.colazione && {
        ...base.colazione,
        carboidrati: pickOr(merged.colazione.carboidrati, k, base.colazione.carboidrati),
        frutta: pickOr(merged.colazione.frutta, k * 2 + 3, base.colazione.frutta),
        proteine: pickOr(merged.colazione.proteine, k * 3 + 1, base.colazione.proteine),
      },
      pranzo: base.pranzo && {
        ...base.pranzo,
        carboidrati: pickOr(merged.pranzo.carboidrati, k + 1, base.pranzo.carboidrati),
        proteine: pickOr(merged.pranzo.proteine, k * 2 + 5, base.pranzo.proteine),
        verdure: pickOr(merged.pranzo.verdure, k + 7, base.pranzo.verdure),
      },
      cena: base.cena && {
        ...base.cena,
        pane: pickOr(merged.cena.pane, k, base.cena.pane),
        verdure: pickOr(merged.cena.verdure, k * 2 + 1, base.cena.verdure),
        proteine: pickOr(merged.cena.proteine, k * 3 + 2, base.cena.proteine),
      },
    };
    // Spuntino, merenda e olio solo se il nutrizionista li ha previsti nel menu.
    if (base.spuntinoMattutino) {
      menu.spuntinoMattutino = pickOr(merged.spuntinoMattutino, k, base.spuntinoMattutino);
    }
    if (base.merenda) {
      menu.merenda = pickOr(merged.merenda, k + 1, base.merenda);
    }
    if (base.olio) {
      menu.olio = pickOr(merged.olio ?? [], k, base.olio);
    }
    delete menu.weekday;
    out.push(menu);
  }
  return out;
}

/**
 * Garantisce un ciclo di ROTATION_CYCLE giorni distinti per l’indice data:
 * - dieta con un solo menu (tipico upload): genera varianti dagli ingredienti (dietData);
 * - 2 … ROTATION_CYCLE-1 menu: ripete i template fino a riempire il ciclo;
 * - già ≥ ROTATION_CYCLE, oppure menu legati ai giorni della settimana: nessun cambio.
 *
 * Non aggiunge mai alimenti che non siano nella dieta dell'utente.
 */
export function expandDailyMenusForRotation(
  menus: DailyMenu[],
  dietData?: DietData | null,
): DailyMenu[] {
  if (menus.length === 0) return menus;
  if (menus.length >= ROTATION_CYCLE) return menus;
  // Piano per giorni della settimana (almeno 2 giorni diversi): nessuna rotazione sintetica.
  const weekdays = new Set(menus.map((m) => m.weekday).filter((w) => w != null));
  if (weekdays.size >= 2) return menus;

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
