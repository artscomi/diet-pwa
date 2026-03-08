# Menu Dietetici PWA

App Next.js per gestire menu dietetici: usa i 14 menu predefiniti oppure carica un file (PDF, immagine o testo) e ottieni la dieta in formato strutturato grazie a OpenAI.

## Funzionalità

- **Pagina iniziale**: scegli “Usa dieta predefinita” o “Carica un file” con la tua dieta
- **Caricamento file**: PDF, immagini (JPG, PNG, WebP) o testo analizzati da OpenAI per generare i menu
- **Menu del giorno**: visualizzazione e modifica del menu del giorno, con salvataggio in localStorage
- **Cambia dieta**: pulsante per tornare alla schermata iniziale e scegliere un’altra dieta
- **Responsive**: layout adatto a mobile e desktop
- **Installabile**: configurabile come PWA (manifest e icone in `public/`)

## Stack

- **Next.js 14** (App Router) – frontend e API in un’unica app
- **TypeScript** – tipizzazione per dati dieta, menu e componenti
- **React 18**
- **OpenAI API** – estrazione dieta da file (testo, PDF, immagini)
- **LocalStorage** – persistenza dieta attiva e modifiche ai menu

## Requisiti

- Node.js 18+
- (Opzionale) Chiave API OpenAI per il caricamento file

## Installazione

```bash
git clone <repo>
cd react-pwa-app
npm install
```

## Configurazione

L’app funziona subito con la **dieta predefinita**. Per abilitare il **caricamento file** con OpenAI:

1. Copia il file di esempio e aggiungi la tua chiave API:
   ```bash
   cp .env.local.example .env.local
   ```
2. Apri `.env.local` e imposta:
   ```env
   OPENAI_API_KEY=sk-proj-...
   ```
   La chiave si ottiene da [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

Senza `OPENAI_API_KEY` l’app parte comunque; il pulsante “Carica un file” mostrerà un messaggio che invita a configurarla.

## Avvio

```bash
# Sviluppo (frontend + API sulla stessa origine)
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

```bash
# Build per produzione
npm run build

# Avvio in produzione
npm start
```

## Script disponibili

| Comando       | Descrizione                    |
|---------------|--------------------------------|
| `npm run dev` | Server di sviluppo (porta 3000) |
| `npm run build` | Build ottimizzata per produzione |
| `npm start`   | Avvia l’app in produzione      |
| `npm run lint` | Esegue ESLint                  |

## Struttura del progetto

```
src/
├── app/
│   ├── api/parse-diet/   # API route POST per upload e parsing con OpenAI
│   ├── globals.css       # Stili globali
│   ├── layout.tsx        # Layout root e metadata
│   └── page.tsx          # Pagina principale (client)
├── components/           # Landing, DailyMenu, IngredientSelector, Icons (.tsx)
├── data/                 # dietData.ts, dailyMenus.ts (dieta predefinita)
├── types/                # diet.ts (tipi condivisi), pdf-parse.d.ts
├── utils/                # validateDietJson.ts
└── App.tsx               # Logica app (dieta, menu del giorno, Cambia dieta)
```

## Formato dieta (API)

L’endpoint `POST /api/parse-diet` accetta un form con campo `file`. Risponde con un JSON:

- **Successo**: `{ "success": true, "data": { "dailyMenus": [ ... ], "dietData"?: { ... } } }`
- **Errore**: `{ "success": false, "error": "messaggio" }`

Ogni menu in `dailyMenus` segue la struttura usata dall’app (colazione, spuntino, pranzo, merenda, cena, olio con `name`, `quantity`, `unit`).

## Licenza

MIT
