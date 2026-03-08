import type { FoodItem, ValidationResult } from '@/types/diet'

function isFoodItem(obj: unknown): obj is FoodItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as FoodItem).name === 'string' &&
    'quantity' in obj &&
    typeof (obj as FoodItem).quantity === 'number' &&
    'unit' in obj &&
    typeof (obj as FoodItem).unit === 'string'
  )
}

function validateMenu(menu: unknown): boolean {
  if (!menu || typeof menu !== 'object') return false
  const m = menu as Record<string, unknown>
  if (!m.id || !m.name) return false
  const colazione = m.colazione
  if (colazione && typeof colazione === 'object') {
    const c = colazione as Record<string, unknown>
    if (c.carboidrati && !isFoodItem(c.carboidrati)) return false
    if (c.frutta && !isFoodItem(c.frutta)) return false
    if (c.proteine && !isFoodItem(c.proteine)) return false
  }
  if (m.spuntinoMattutino && !isFoodItem(m.spuntinoMattutino)) return false
  const pranzo = m.pranzo
  if (pranzo && typeof pranzo === 'object') {
    const p = pranzo as Record<string, unknown>
    if (p.carboidrati && !isFoodItem(p.carboidrati)) return false
    if (p.proteine && !isFoodItem(p.proteine)) return false
    if (p.verdure && !isFoodItem(p.verdure)) return false
  }
  if (m.merenda && !isFoodItem(m.merenda)) return false
  const cena = m.cena
  if (cena && typeof cena === 'object') {
    const c = cena as Record<string, unknown>
    if (c.pane && !isFoodItem(c.pane)) return false
    if (c.verdure && !isFoodItem(c.verdure)) return false
    if (c.proteine && !isFoodItem(c.proteine)) return false
  }
  if (m.olio && !isFoodItem(m.olio)) return false
  return true
}

export function validateDietJson(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== 'object')
    return { valid: false, error: 'Payload non valido' }
  const p = payload as { dailyMenus?: unknown[] }
  if (!Array.isArray(p.dailyMenus))
    return { valid: false, error: 'Manca dailyMenus o non è un array' }
  if (p.dailyMenus.length === 0)
    return { valid: false, error: 'dailyMenus è vuoto' }
  for (let i = 0; i < p.dailyMenus.length; i++) {
    if (!validateMenu(p.dailyMenus[i])) {
      return { valid: false, error: `Menu alla posizione ${i} non valido` }
    }
  }
  return { valid: true }
}
