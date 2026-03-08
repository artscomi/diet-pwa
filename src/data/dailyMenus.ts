import { dietData } from './dietData'
import type { DailyMenu } from '@/types/diet'

// Menu giornalieri predefiniti che rispettano la dieta
export const dailyMenus: DailyMenu[] = [
  {
    id: 'menu-1',
    name: 'Menu Giorno 1',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[0], // Fette biscottate integrali 30g
      frutta: dietData.colazione.frutta[8], // Mela 100g
      proteine: dietData.colazione.proteine[0] // Tacchino - fesa 60g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[0], // Mandorle dolci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[0], // Pasta di semola integrale 70g
      proteine: dietData.pranzo.proteine[0], // Pollo - petto 130g
      verdure: dietData.pranzo.verdure[0] // Verdure fresche (media) 250g
    },
    merenda: dietData.merenda[0], // Mandorle dolci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[0], // Verdure fresche (media) 200g
      proteine: dietData.cena.proteine[0] // Pollo - petto 170g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-2',
    name: 'Menu Giorno 2',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[1], // Pane integrale 50g
      frutta: dietData.colazione.frutta[2], // Arance 150g
      proteine: dietData.colazione.proteine[5] // Greek Yogurt - Fage 150g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[1], // Noci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[1], // Riso integrale 70g
      proteine: dietData.pranzo.proteine[9], // Tonno sott'olio - sgocciolato 70g
      verdure: dietData.pranzo.verdure[1] // Lattuga 300g
    },
    merenda: dietData.merenda[1], // Noci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[2], // Pomodori da insalata 200g
      proteine: dietData.cena.proteine[1] // Sogliola 200g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-3',
    name: 'Menu Giorno 3',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[5], // Avena 30g
      frutta: dietData.colazione.frutta[6], // Kiwi 150g
      proteine: dietData.colazione.proteine[6] // Uova di gallina - intero 60g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[0], // Mandorle dolci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[2], // Pane integrale 100g
      proteine: dietData.pranzo.proteine[11], // Merluzzo o nasello surgelato - filetti 190g
      verdure: dietData.pranzo.verdure[3] // Broccoletti di rapa 200g
    },
    merenda: dietData.merenda[0], // Mandorle dolci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[4], // Spinaci 100g
      proteine: dietData.cena.proteine[2] // Pollo coscia - senza pelle 160g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-4',
    name: 'Menu Giorno 4',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[9], // Grano saraceno 40g
      frutta: dietData.colazione.frutta[5], // Cocomero 350g
      proteine: dietData.colazione.proteine[3] // Tonno sott'olio - sgocciolato 50g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[1], // Noci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[5], // Kamut 70g
      proteine: dietData.pranzo.proteine[4], // Tacchino - fesa 120g
      verdure: dietData.pranzo.verdure[5] // Spinaci 200g
    },
    merenda: dietData.merenda[1], // Noci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[7], // Zucchini 300g
      proteine: dietData.cena.proteine[10] // Merluzzo o nasello surgelato - filetti 250g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-5',
    name: 'Menu Giorno 5',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[10], // Farro 30g
      frutta: dietData.colazione.frutta[10], // Pera 150g
      proteine: dietData.colazione.proteine[4] // Bresaola 40g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[0], // Mandorle dolci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[6], // Miglio 60g
      proteine: dietData.pranzo.proteine[12], // Pesce persico 170g
      verdure: dietData.pranzo.verdure[8] // Carote 100g
    },
    merenda: dietData.merenda[0], // Mandorle dolci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[9], // Cavolfiore 200g
      proteine: dietData.cena.proteine[3] // Tacchino petto 130g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-6',
    name: 'Menu Giorno 6',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[2], // Gallette di riso 30g
      frutta: dietData.colazione.frutta[0], // Albicocche 200g
      proteine: dietData.colazione.proteine[7] // Salmone fresco 50g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[1], // Noci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[7], // Grano saraceno 70g
      proteine: dietData.pranzo.proteine[13], // Trota 150g
      verdure: dietData.pranzo.verdure[11] // Finocchi 300g
    },
    merenda: dietData.merenda[1], // Noci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[12], // Bieta 200g
      proteine: dietData.cena.proteine[4] // Anatra domestica 110g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-7',
    name: 'Menu Giorno 7',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[3], // Crackers integrali 30g
      frutta: dietData.colazione.frutta[3], // Ciliege 150g
      proteine: dietData.colazione.proteine[2] // Uova di gallina - albume 170g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[0], // Mandorle dolci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[8], // Farro 70g
      proteine: dietData.pranzo.proteine[14], // Cernia 160g
      verdure: dietData.pranzo.verdure[12] // Peperoni 200g
    },
    merenda: dietData.merenda[0], // Mandorle dolci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[13], // Finocchi 300g
      proteine: dietData.cena.proteine[5] // Tacchino - fesa 160g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-8',
    name: 'Menu Giorno 8',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[4], // Cereali da Colazione (media) 30g
      frutta: dietData.colazione.frutta[1], // Ananas 150g
      proteine: dietData.colazione.proteine[1] // PROTEINE IN POLVERE 15g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[1], // Noci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[4], // Amaranto 60g
      proteine: dietData.pranzo.proteine[15], // Dentice 130g
      verdure: dietData.pranzo.verdure[13] // Sedano 200g
    },
    merenda: dietData.merenda[1], // Noci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[14], // Peperoni 200g
      proteine: dietData.cena.proteine[6] // Vitello - filetto 160g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-9',
    name: 'Menu Giorno 9',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[6], // Amaranto 40g
      frutta: dietData.colazione.frutta[4], // Fragole 200g
      proteine: dietData.colazione.proteine[6] // Uova di gallina - intero 60g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[0], // Mandorle dolci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[3], // Avena 70g
      proteine: dietData.pranzo.proteine[16], // Halibut 110g
      verdure: dietData.pranzo.verdure[14] // Cetrioli 300g
    },
    merenda: dietData.merenda[0], // Mandorle dolci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[15], // Sedano 200g
      proteine: dietData.cena.proteine[7] // Vitellone tagli magri 160g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-10',
    name: 'Menu Giorno 10',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[7], // Kamut 30g
      frutta: dietData.colazione.frutta[9], // Melone 200g
      proteine: dietData.colazione.proteine[3] // Tonno sott'olio - sgocciolato 50g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[1], // Noci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[1], // Riso integrale 70g
      proteine: dietData.pranzo.proteine[17], // Merluzzo o nasello 180g
      verdure: dietData.pranzo.verdure[15] // Cipolle 200g
    },
    merenda: dietData.merenda[1], // Noci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[16], // Cetrioli 300g
      proteine: dietData.cena.proteine[8] // Vitellone - fesa 170g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-11',
    name: 'Menu Giorno 11',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[8], // Miglio 30g
      frutta: dietData.colazione.frutta[11], // Pesca 200g
      proteine: dietData.colazione.proteine[4] // Bresaola 40g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[0], // Mandorle dolci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[0], // Pasta di semola integrale 70g
      proteine: dietData.pranzo.proteine[18], // Orata fresca 110g
      verdure: dietData.pranzo.verdure[16] // Asparagi di serra 200g
    },
    merenda: dietData.merenda[0], // Mandorle dolci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[17], // Cipolle 200g
      proteine: dietData.cena.proteine[9] // Coniglio magro 170g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-12',
    name: 'Menu Giorno 12',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[1], // Pane integrale 50g
      frutta: dietData.colazione.frutta[12], // Pesca con buccia 250g
      proteine: dietData.colazione.proteine[5] // Greek Yogurt - Fage 150g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[1], // Noci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[5], // Kamut 70g
      proteine: dietData.pranzo.proteine[19], // Palombo 160g
      verdure: dietData.pranzo.verdure[17] // Carciofi 200g
    },
    merenda: dietData.merenda[1], // Noci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[18], // Asparagi di serra 200g
      proteine: dietData.cena.proteine[10] // Merluzzo o nasello surgelato - filetti 250g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-13',
    name: 'Menu Giorno 13',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[0], // Fette biscottate integrali 30g
      frutta: dietData.colazione.frutta[13], // Prugne 150g
      proteine: dietData.colazione.proteine[0] // Tacchino - fesa 60g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[0], // Mandorle dolci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[7], // Grano saraceno 70g
      proteine: dietData.pranzo.proteine[20], // Pesce spada 120g
      verdure: dietData.pranzo.verdure[4] // Melanzane 200g
    },
    merenda: dietData.merenda[0], // Mandorle dolci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[19], // Carciofi 200g
      proteine: dietData.cena.proteine[11] // Tonno sott'olio - sgocciolato 90g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  },
  {
    id: 'menu-14',
    name: 'Menu Giorno 14',
    colazione: {
      carboidrati: dietData.colazione.carboidrati[5], // Avena 30g
      frutta: dietData.colazione.frutta[2], // Arance 150g
      proteine: dietData.colazione.proteine[7] // Salmone fresco 50g
    },
    spuntinoMattutino: dietData.spuntinoMattutino[1], // Noci - secche 30g
    pranzo: {
      carboidrati: dietData.pranzo.carboidrati[8], // Farro 70g
      proteine: dietData.pranzo.proteine[21], // Rombo 160g
      verdure: dietData.pranzo.verdure[6] // Carote 100g
    },
    merenda: dietData.merenda[1], // Noci - secche 30g
    cena: {
      pane: dietData.cena.pane[0], // Pane integrale 40g
      verdure: dietData.cena.verdure[3], // Melanzane 200g
      proteine: dietData.cena.proteine[12] // Pesce persico 230g
    },
    olio: dietData.olio[0] // Olio di oliva extra vergine 20g
  }
]

