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
  olio: FoodItem
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
  olio: FoodItem[]
}

export interface UserDiet {
  dailyMenus: DailyMenu[]
  dietData?: DietData
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
