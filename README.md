# Menoo

App Next.js per il menu del giorno che rispetta la tua dieta: usa i 14 menu predefiniti oppure carica un file (PDF, immagine o testo) e ottieni la dieta in formato strutturato grazie a OpenAI.

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
   PEXELS_API_KEY=...   # opzionale: slider sfondo a tema food sulla landing
   ```
   - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Pexels: [pexels.com/api](https://www.pexels.com/api/) (gratuito, per le immagini di sfondo casuali).
   - **Microsoft Clarity** (opzionale): [clarity.microsoft.com](https://clarity.microsoft.com/) – crea un progetto, copia il Project ID e imposta `NEXT_PUBLIC_CLARITY_PROJECT_ID=...` in `.env.local` per heatmap e registrazioni sessione.
   - **Hotjar** (opzionale): [hotjar.com](https://www.hotjar.com/) – imposta `NEXT_PUBLIC_HOTJAR_ID=...` (Site ID) e opzionalmente `NEXT_PUBLIC_HOTJAR_SV=6` (script version) per registrazioni e heatmap. Solo in produzione.

Senza `OPENAI_API_KEY` l’app parte comunque; il pulsante “Carica un file” mostrerà un messaggio che invita a configurarla. Senza `PEXELS_API_KEY` la landing userà immagini di fallback per lo sfondo. Senza `NEXT_PUBLIC_CLARITY_PROJECT_ID` Clarity non viene caricato. Clarity e Hotjar vengono caricati solo in produzione (non su localhost).

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
