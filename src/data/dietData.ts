import type { DietData } from '@/types/diet'

export const dietData: DietData = {
  colazione: {
    carboidrati: [
      { name: 'Fette biscottate integrali', quantity: 30, unit: 'g' },
      { name: 'Pane integrale', quantity: 50, unit: 'g' },
      { name: 'Gallette di riso', quantity: 30, unit: 'g' },
      { name: 'Crackers integrali', quantity: 30, unit: 'g' },
      { name: 'Cereali da Colazione (media)', quantity: 30, unit: 'g' },
      { name: 'Avena', quantity: 30, unit: 'g' },
      { name: 'Amaranto', quantity: 40, unit: 'g' },
      { name: 'Kamut', quantity: 30, unit: 'g' },
      { name: 'Miglio', quantity: 30, unit: 'g' },
      { name: 'Grano saraceno', quantity: 40, unit: 'g' },
      { name: 'Farro', quantity: 30, unit: 'g' }
    ],
    frutta: [
      { name: 'Frutta fresca (media)', quantity: 150, unit: 'g' },
      { name: 'Albicocche', quantity: 200, unit: 'g' },
      { name: 'Ananas', quantity: 150, unit: 'g' },
      { name: 'Arance', quantity: 150, unit: 'g' },
      { name: 'Ciliege', quantity: 150, unit: 'g' },
      { name: 'Cocomero', quantity: 350, unit: 'g' },
      { name: 'Fragole', quantity: 200, unit: 'g' },
      { name: 'Kiwi', quantity: 150, unit: 'g' },
      { name: 'Mandarini', quantity: 100, unit: 'g' },
      { name: 'Mela', quantity: 100, unit: 'g' },
      { name: 'Melone', quantity: 200, unit: 'g' },
      { name: 'Pera', quantity: 150, unit: 'g' },
      { name: 'Pesca', quantity: 200, unit: 'g' },
      { name: 'Pesca con buccia', quantity: 250, unit: 'g' },
      { name: 'Prugne', quantity: 150, unit: 'g' }
    ],
    proteine: [
      { name: 'Tacchino - fesa', quantity: 60, unit: 'g' },
      { name: 'PROTEINE IN POLVERE', quantity: 15, unit: 'g' },
      { name: 'Uova di gallina - albume', quantity: 170, unit: 'g' },
      { name: 'Tonno sott\'olio - sgocciolato', quantity: 50, unit: 'g' },
      { name: 'Bresaola', quantity: 40, unit: 'g' },
      { name: 'Greek Yogurt - Fage', quantity: 150, unit: 'g' },
      { name: 'Uova di gallina - intero', quantity: 60, unit: 'g' },
      { name: 'Salmone fresco', quantity: 50, unit: 'g' }
    ]
  },
  spuntinoMattutino: [
    { name: 'Mandorle dolci - secche', quantity: 30, unit: 'g' },
    { name: 'Noci - secche', quantity: 30, unit: 'g' }
  ],
  pranzo: {
    carboidrati: [
      { name: 'Pasta di semola integrale', quantity: 70, unit: 'g' },
      { name: 'Riso integrale', quantity: 70, unit: 'g' },
      { name: 'Pane integrale', quantity: 100, unit: 'g' },
      { name: 'Avena', quantity: 70, unit: 'g' },
      { name: 'Amaranto', quantity: 60, unit: 'g' },
      { name: 'Kamut', quantity: 70, unit: 'g' },
      { name: 'Miglio', quantity: 60, unit: 'g' },
      { name: 'Grano saraceno', quantity: 70, unit: 'g' },
      { name: 'Farro', quantity: 70, unit: 'g' }
    ],
    proteine: [
      { name: 'Pollo - petto', quantity: 130, unit: 'g' },
      { name: 'Pollo coscia - senza pelle', quantity: 120, unit: 'g' },
      { name: 'Tacchino petto', quantity: 100, unit: 'g' },
      { name: 'Anatra domestica', quantity: 80, unit: 'g' },
      { name: 'Tacchino - fesa', quantity: 120, unit: 'g' },
      { name: 'Vitello - filetto', quantity: 120, unit: 'g' },
      { name: 'Vitellone tagli magri', quantity: 120, unit: 'g' },
      { name: 'Vitellone - fesa', quantity: 130, unit: 'g' },
      { name: 'Coniglio magro', quantity: 130, unit: 'g' },
      { name: 'Tonno sott\'olio - sgocciolato', quantity: 70, unit: 'g' },
      { name: 'Merluzzo o nasello surgelato - filetti', quantity: 190, unit: 'g' },
      { name: 'Pesce persico', quantity: 170, unit: 'g' },
      { name: 'Trota', quantity: 150, unit: 'g' },
      { name: 'Cernia', quantity: 160, unit: 'g' },
      { name: 'Dentice', quantity: 130, unit: 'g' },
      { name: 'Halibut', quantity: 110, unit: 'g' },
      { name: 'Merluzzo o nasello', quantity: 180, unit: 'g' },
      { name: 'Orata fresca', quantity: 110, unit: 'g' },
      { name: 'Palombo', quantity: 160, unit: 'g' },
      { name: 'Pesce spada', quantity: 120, unit: 'g' },
      { name: 'Rombo', quantity: 160, unit: 'g' },
      { name: 'Salmone fresco', quantity: 70, unit: 'g' },
      { name: 'Sarda', quantity: 100, unit: 'g' },
      { name: 'Sgombro o maccarello', quantity: 80, unit: 'g' },
      { name: 'Sogliola', quantity: 160, unit: 'g' },
      { name: 'Spigola', quantity: 160, unit: 'g' },
      { name: 'Tonno', quantity: 80, unit: 'g' },
      { name: 'Triglia', quantity: 110, unit: 'g' },
      { name: 'Bresaola', quantity: 90, unit: 'g' },
      { name: 'Uova di gallina - intero', quantity: 120, unit: 'g' }
    ],
    verdure: [
      { name: 'Verdure fresche (media)', quantity: 250, unit: 'g' },
      { name: 'Lattuga', quantity: 300, unit: 'g' },
      { name: 'Pomodori da insalata', quantity: 300, unit: 'g' },
      { name: 'Broccoletti di rapa', quantity: 200, unit: 'g' },
      { name: 'Spinaci', quantity: 200, unit: 'g' },
      { name: 'Spinaci surgelati', quantity: 200, unit: 'g' },
      { name: 'Melanzane', quantity: 200, unit: 'g' },
      { name: 'Carote', quantity: 100, unit: 'g' },
      { name: 'Zucchini', quantity: 300, unit: 'g' },
      { name: 'Cavolfiore', quantity: 200, unit: 'g' },
      { name: 'Cicoria da taglio', quantity: 300, unit: 'g' },
      { name: 'Bieta', quantity: 300, unit: 'g' },
      { name: 'Finocchi', quantity: 300, unit: 'g' },
      { name: 'Peperoni', quantity: 200, unit: 'g' },
      { name: 'Sedano', quantity: 200, unit: 'g' },
      { name: 'Cetrioli', quantity: 300, unit: 'g' },
      { name: 'Cipolle', quantity: 200, unit: 'g' },
      { name: 'Asparagi di serra', quantity: 200, unit: 'g' },
      { name: 'Carciofi', quantity: 200, unit: 'g' }
    ]
  },
  merenda: [
    { name: 'Mandorle dolci - secche', quantity: 30, unit: 'g' },
    { name: 'Noci - secche', quantity: 30, unit: 'g' }
  ],
  cena: {
    pane: [
      { name: 'Pane integrale', quantity: 40, unit: 'g' }
    ],
    verdure: [
      { name: 'Verdure fresche (media)', quantity: 200, unit: 'g' },
      { name: 'Lattuga', quantity: 200, unit: 'g' },
      { name: 'Pomodori da insalata', quantity: 200, unit: 'g' },
      { name: 'Broccoletti di rapa', quantity: 200, unit: 'g' },
      { name: 'Spinaci', quantity: 100, unit: 'g' },
      { name: 'Spinaci surgelati', quantity: 200, unit: 'g' },
      { name: 'Melanzane', quantity: 200, unit: 'g' },
      { name: 'Carote', quantity: 100, unit: 'g' },
      { name: 'Zucchini', quantity: 300, unit: 'g' },
      { name: 'Cavolfiore', quantity: 200, unit: 'g' },
      { name: 'Cicoria da taglio', quantity: 300, unit: 'g' },
      { name: 'Bieta', quantity: 200, unit: 'g' },
      { name: 'Finocchi', quantity: 300, unit: 'g' },
      { name: 'Peperoni', quantity: 200, unit: 'g' },
      { name: 'Sedano', quantity: 200, unit: 'g' },
      { name: 'Vegetali misti surgelati', quantity: 100, unit: 'g' },
      { name: 'Cetrioli', quantity: 300, unit: 'g' },
      { name: 'Cipolle', quantity: 200, unit: 'g' },
      { name: 'Asparagi di serra', quantity: 200, unit: 'g' },
      { name: 'Carciofi', quantity: 200, unit: 'g' }
    ],
    proteine: [
      { name: 'Pollo - petto', quantity: 170, unit: 'g' },
      { name: 'Sogliola', quantity: 200, unit: 'g' },
      { name: 'Pollo coscia - senza pelle', quantity: 160, unit: 'g' },
      { name: 'Tacchino petto', quantity: 130, unit: 'g' },
      { name: 'Anatra domestica', quantity: 110, unit: 'g' },
      { name: 'Tacchino - fesa', quantity: 160, unit: 'g' },
      { name: 'Vitello - filetto', quantity: 160, unit: 'g' },
      { name: 'Vitellone tagli magri', quantity: 160, unit: 'g' },
      { name: 'Vitellone - fesa', quantity: 170, unit: 'g' },
      { name: 'Coniglio magro', quantity: 170, unit: 'g' },
      { name: 'Tonno sott\'olio - sgocciolato', quantity: 90, unit: 'g' },
      { name: 'Merluzzo o nasello surgelato - filetti', quantity: 250, unit: 'g' },
      { name: 'Pesce persico', quantity: 230, unit: 'g' },
      { name: 'Trota', quantity: 200, unit: 'g' },
      { name: 'Cernia', quantity: 210, unit: 'g' },
      { name: 'Dentice', quantity: 170, unit: 'g' },
      { name: 'Halibut', quantity: 150, unit: 'g' },
      { name: 'Merluzzo o nasello', quantity: 240, unit: 'g' },
      { name: 'Orata fresca', quantity: 140, unit: 'g' },
      { name: 'Palombo', quantity: 210, unit: 'g' },
      { name: 'Pesce spada', quantity: 160, unit: 'g' },
      { name: 'Rombo', quantity: 210, unit: 'g' },
      { name: 'Salmone fresco', quantity: 90, unit: 'g' },
      { name: 'Sarda', quantity: 130, unit: 'g' },
      { name: 'Sgombro o maccarello', quantity: 100, unit: 'g' },
      { name: 'Spigola', quantity: 210, unit: 'g' },
      { name: 'Tonno', quantity: 110, unit: 'g' },
      { name: 'Triglia', quantity: 140, unit: 'g' },
      { name: 'Bresaola', quantity: 100, unit: 'g' },
      { name: 'Uova di gallina - intero', quantity: 120, unit: 'g' }
    ]
  },
  olio: [
    { name: 'Olio di oliva extra vergine', quantity: 20, unit: 'g' }
  ]
}

