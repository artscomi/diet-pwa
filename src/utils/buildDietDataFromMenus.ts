import type { DailyMenu, DietData, FoodItem } from '@/types/diet'

function foodItemKey(f: FoodItem): string {
  return `${f.name}|${f.quantity}|${f.unit}`
}

function uniqueFoodItems(items: FoodItem[]): FoodItem[] {
  const seen = new Set<string>()
  return items.filter((f) => {
    const k = foodItemKey(f)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/**
 * Costruisce DietData dagli ingredienti presenti nei menu caricati.
 * Usato quando l'upload restituisce solo dailyMenus (senza dietData) così in Modifica
 * i dropdown mostrano gli ingredienti della dieta personalizzata invece di quella predefinita.
 */
export function buildDietDataFromMenus(menus: DailyMenu[]): DietData {
  const colazioneCarb: FoodItem[] = []
  const colazioneFrutta: FoodItem[] = []
  const colazioneProteine: FoodItem[] = []
  const spuntino: FoodItem[] = []
  const pranzoCarb: FoodItem[] = []
  const pranzoProteine: FoodItem[] = []
  const pranzoVerdure: FoodItem[] = []
  const merenda: FoodItem[] = []
  const cenaPane: FoodItem[] = []
  const cenaVerdure: FoodItem[] = []
  const cenaProteine: FoodItem[] = []
  const olio: FoodItem[] = []

  for (const m of menus) {
    if (m.colazione?.carboidrati) colazioneCarb.push(m.colazione.carboidrati)
    if (m.colazione?.frutta) colazioneFrutta.push(m.colazione.frutta)
    if (m.colazione?.proteine) colazioneProteine.push(m.colazione.proteine)
    if (m.spuntinoMattutino) spuntino.push(m.spuntinoMattutino)
    if (m.pranzo?.carboidrati) pranzoCarb.push(m.pranzo.carboidrati)
    if (m.pranzo?.proteine) pranzoProteine.push(m.pranzo.proteine)
    if (m.pranzo?.verdure) pranzoVerdure.push(m.pranzo.verdure)
    if (m.merenda) merenda.push(m.merenda)
    if (m.cena?.pane) cenaPane.push(m.cena.pane)
    if (m.cena?.verdure) cenaVerdure.push(m.cena.verdure)
    if (m.cena?.proteine) cenaProteine.push(m.cena.proteine)
    if (m.olio) olio.push(m.olio)
  }

  return {
    colazione: {
      carboidrati: uniqueFoodItems(colazioneCarb),
      frutta: uniqueFoodItems(colazioneFrutta),
      proteine: uniqueFoodItems(colazioneProteine),
    },
    spuntinoMattutino: uniqueFoodItems(spuntino),
    pranzo: {
      carboidrati: uniqueFoodItems(pranzoCarb),
      proteine: uniqueFoodItems(pranzoProteine),
      verdure: uniqueFoodItems(pranzoVerdure),
    },
    merenda: uniqueFoodItems(merenda),
    cena: {
      pane: uniqueFoodItems(cenaPane),
      verdure: uniqueFoodItems(cenaVerdure),
      proteine: uniqueFoodItems(cenaProteine),
    },
    olio: uniqueFoodItems(olio),
  }
}
