import type { DailyMenu, DietData, FoodItem } from "@/types/diet";

/**
 * Ripulisce la risposta dell'AI PRIMA della validazione, così un singolo alimento
 * scritto male non fa scartare l'intera dieta.
 *
 * - quantità come testo ("100 g", "1,5") → numero; quantità assente → 0 con unità "q.b."
 * - alimenti senza nome → rimossi; liste di alternative vuote → campo rimosso
 * - id/nome del menu mancanti → generati
 * - weekday non valido → rimosso
 *
 * Non aggiunge mai alimenti: toglie o corregge solo il formato.
 */

type Loose = Record<string, unknown>;

function toQuantity(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const m = v.replace(",", ".").match(/\d+(\.\d+)?/);
    if (m) return Number(m[0]);
  }
  return null;
}

function normalizeFood(v: unknown): FoodItem | undefined {
  // Campo a voce singola restituito come lista di alternative: teniamo la prima valida.
  if (Array.isArray(v)) {
    for (const x of v) {
      const f = normalizeFood(x);
      if (f) return f;
    }
    return undefined;
  }
  if (!v || typeof v !== "object") return undefined;
  const o = v as Loose;
  const name = typeof o.name === "string" ? o.name.trim() : "";
  if (!name) return undefined;
  const quantity = toQuantity(o.quantity);
  const unit = typeof o.unit === "string" && o.unit.trim() ? o.unit.trim() : "";
  if (quantity === null || quantity <= 0) {
    return { name, quantity: 0, unit: "q.b." };
  }
  return { name, quantity, unit: unit || "g" };
}

function normalizeFoodOrAlternatives(v: unknown): FoodItem | FoodItem[] | undefined {
  if (Array.isArray(v)) {
    const items = v.map(normalizeFood).filter((f): f is FoodItem => Boolean(f));
    if (items.length === 0) return undefined;
    return items.length === 1 ? items[0] : items;
  }
  return normalizeFood(v);
}

function normalizeFoodList(v: unknown): FoodItem[] {
  if (!Array.isArray(v)) {
    const one = normalizeFood(v);
    return one ? [one] : [];
  }
  return v.map(normalizeFood).filter((f): f is FoodItem => Boolean(f));
}

/** Imposta o rimuove un campo a seconda che il valore normalizzato esista. */
function setOrDelete(o: Loose, key: string, value: unknown): void {
  if (value === undefined) delete o[key];
  else o[key] = value;
}

function normalizeMeal(
  meal: unknown,
  single: string[],
  multi: string[],
): Loose | undefined {
  if (!meal || typeof meal !== "object" || Array.isArray(meal)) return undefined;
  const o = { ...(meal as Loose) };
  single.forEach((k) => setOrDelete(o, k, normalizeFood(o[k])));
  multi.forEach((k) => setOrDelete(o, k, normalizeFoodOrAlternatives(o[k])));
  const hasAny = [...single, ...multi].some((k) => o[k] !== undefined);
  return hasAny ? o : undefined;
}

function normalizeMenu(menu: unknown, index: number): DailyMenu | null {
  if (!menu || typeof menu !== "object" || Array.isArray(menu)) return null;
  const m = { ...(menu as Loose) };

  if (typeof m.id !== "string" || !m.id) m.id = `menu-${index + 1}`;
  if (typeof m.name !== "string" || !m.name) m.name = `Menu ${index + 1}`;

  setOrDelete(m, "colazione", normalizeMeal(m.colazione, ["carboidrati", "proteine"], ["frutta"]));
  setOrDelete(m, "pranzo", normalizeMeal(m.pranzo, ["carboidrati", "proteine"], ["verdure"]));
  setOrDelete(m, "cena", normalizeMeal(m.cena, ["pane", "proteine"], ["verdure"]));
  setOrDelete(m, "spuntinoMattutino", normalizeFood(m.spuntinoMattutino));
  setOrDelete(m, "merenda", normalizeFood(m.merenda));
  setOrDelete(m, "olio", normalizeFood(m.olio));

  if (m.duranteLaGiornata != null && typeof m.duranteLaGiornata !== "string") {
    delete m.duranteLaGiornata;
  }

  const w = typeof m.weekday === "string" ? Number(m.weekday) : m.weekday;
  if (typeof w === "number" && Number.isInteger(w) && w >= 1 && w <= 7) m.weekday = w;
  else delete m.weekday;

  const hasMeal = ["colazione", "pranzo", "cena", "spuntinoMattutino", "merenda"].some(
    (k) => m[k] !== undefined,
  );
  return hasMeal ? (m as unknown as DailyMenu) : null;
}

function normalizeDietData(v: unknown): DietData | undefined {
  if (!v || typeof v !== "object") return undefined;
  const d = v as Loose;
  const sub = (x: unknown) => (x && typeof x === "object" ? (x as Loose) : {});
  const c = sub(d.colazione);
  const p = sub(d.pranzo);
  const ce = sub(d.cena);
  return {
    colazione: {
      carboidrati: normalizeFoodList(c.carboidrati),
      frutta: normalizeFoodList(c.frutta),
      proteine: normalizeFoodList(c.proteine),
    },
    spuntinoMattutino: normalizeFoodList(d.spuntinoMattutino),
    pranzo: {
      carboidrati: normalizeFoodList(p.carboidrati),
      proteine: normalizeFoodList(p.proteine),
      verdure: normalizeFoodList(p.verdure),
    },
    merenda: normalizeFoodList(d.merenda),
    cena: {
      pane: normalizeFoodList(ce.pane),
      verdure: normalizeFoodList(ce.verdure),
      proteine: normalizeFoodList(ce.proteine),
    },
    olio: normalizeFoodList(d.olio),
  };
}

/** Contenuto del menu senza etichette (id, nome, giorno). */
function menuContentKey(m: DailyMenu): string {
  const rest: Partial<DailyMenu> = { ...m };
  delete rest.id;
  delete rest.name;
  delete rest.weekday;
  delete rest.date;
  return JSON.stringify(rest);
}

/**
 * Se l'AI ha copiato lo stesso menu su più giorni (es. un piano unico valido tutta la settimana),
 * teniamo un solo menu senza giorno: così l'app alterna le sostituzioni previste dal nutrizionista.
 */
function collapseIdenticalMenus(menus: DailyMenu[]): DailyMenu[] {
  if (menus.length < 2) return menus;
  const first = menuContentKey(menus[0]);
  if (!menus.every((m) => menuContentKey(m) === first)) return menus;
  const single: DailyMenu = { ...menus[0], name: "Menu" };
  delete single.weekday;
  return [single];
}

export function normalizeDietPayload<T extends { dailyMenus?: unknown; dietData?: unknown }>(
  payload: T,
): T & { dailyMenus: DailyMenu[]; dietData?: DietData } {
  const menus = Array.isArray(payload.dailyMenus) ? payload.dailyMenus : [];
  const dailyMenus = menus
    .map((m, i) => normalizeMenu(m, i))
    .filter((m): m is DailyMenu => m !== null);
  const dietData = normalizeDietData(payload.dietData);
  return {
    ...payload,
    dailyMenus: collapseIdenticalMenus(dailyMenus),
    ...(dietData ? { dietData } : {}),
  };
}
