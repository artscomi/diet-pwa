export interface FoodItem {
  name: string
  quantity: number
  unit: string
}

export interface Colazione {
  carboidrati: FoodItem
  frutta: FoodItem
  proteine: FoodItem
}

export interface Pranzo {
  carboidrati: FoodItem
  proteine: FoodItem
  verdure: FoodItem
}

export interface Cena {
  pane: FoodItem
  verdure: FoodItem
  proteine: FoodItem
}

export interface DailyMenu {
  id: string
  name: string
  colazione: Colazione
  spuntinoMattutino: FoodItem
  pranzo: Pranzo
  merenda: FoodItem
  cena: Cena
  /** Olio / condimenti "durante la giornata" – opzionale, la sezione si mostra solo se presente nella dieta */
  olio?: FoodItem
  /** Testo libero per note o altro (es. integrazioni, avvertenze) – opzionale */
  duranteLaGiornata?: string
  date?: string
}

export interface DietDataColazione {
  carboidrati: FoodItem[]
  frutta: FoodItem[]
  proteine: FoodItem[]
}

export interface DietDataPranzo {
  carboidrati: FoodItem[]
  proteine: FoodItem[]
  verdure: FoodItem[]
}

export interface DietDataCena {
  pane: FoodItem[]
  verdure: FoodItem[]
  proteine: FoodItem[]
}

export interface DietData {
  colazione: DietDataColazione
  spuntinoMattutino: FoodItem[]
  pranzo: DietDataPranzo
  merenda: FoodItem[]
  cena: DietDataCena
  /** Opzionale: se presente (length > 0) viene mostrata la sezione "Durante la giornata" in modifica */
  olio?: FoodItem[]
}

/** Info sul file caricato dall’utente, per mostrare l’anteprima nella pagina menu */
export interface UploadedFileInfo {
  name: string
  mimeType: string
  /** Data URL per anteprima (solo se file ≤ 500KB, per non saturare localStorage) */
  previewDataUrl?: string
}

export interface UserDiet {
  dailyMenus: DailyMenu[]
  dietData?: DietData
  /** Presente se la dieta è stata caricata da file (per anteprima nella pagina menu) */
  uploadedFile?: UploadedFileInfo
}

export interface ParseDietResponse {
  success: boolean
  data?: { dailyMenus: DailyMenu[]; dietData?: DietData }
  error?: string
}

export interface ValidationResult {
  valid: boolean
  error?: string
}
