# PocketDiet

App Next.js per il menu del giorno che rispetta la tua dieta: usa i 14 menu predefiniti oppure carica un file (PDF, immagine o testo) e ottieni la dieta in formato strutturato grazie a OpenAI.

## Funzionalità

- **Pagina iniziale**: scegli “Usa dieta predefinita” o “Carica un file” con la tua dieta
- **Caricamento file**: PDF, immagini (JPG, PNG, WebP) o testo analizzati da OpenAI per generare i menu
- **I tuoi pasti**: visualizzazione e modifica dei pasti del giorno, con salvataggio in localStorage
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
yarn install
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
   PEXELS_API_KEY=...   # opzionale: carosello foto sulla landing (solo desktop)
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...  # opzionale: abilita Web Push remoto
   VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   VAPID_SUBJECT=mailto:you@example.com
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   CRON_SECRET=...  # secret per chiamare la route cron di dispatch
   ```
   - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Pexels: [pexels.com/api](https://www.pexels.com/api/) — per lo sfondo a rotazione su desktop; su mobile la landing usa uno sfondo neutro (slate) e il pannello bianco.
   - **Microsoft Clarity** (opzionale): [clarity.microsoft.com](https://clarity.microsoft.com/) – crea un progetto, copia il Project ID e imposta `NEXT_PUBLIC_CLARITY_PROJECT_ID=...` in `.env.local` per heatmap e registrazioni sessione.
   - **Hotjar** (opzionale): [hotjar.com](https://www.hotjar.com/) – imposta `NEXT_PUBLIC_HOTJAR_ID=...` (Site ID) e opzionalmente `NEXT_PUBLIC_HOTJAR_SV=6` (script version) per registrazioni e heatmap. Solo in produzione.
   - **Web Push** (opzionale): genera una coppia di chiavi VAPID, esponi la public key anche come `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, salva le subscription su Upstash Redis e proteggi la route cron con `CRON_SECRET`.

Senza `OPENAI_API_KEY` l’app parte comunque; il pulsante “Carica un file” mostrerà un messaggio che invita a configurarla. Senza `PEXELS_API_KEY` lo sfondo desktop usa immagini di fallback. Senza `NEXT_PUBLIC_CLARITY_PROJECT_ID` Clarity non viene caricato. Clarity e Hotjar vengono caricati solo in produzione (non su localhost). Se non configuri le variabili Web Push, PocketDiet continua a usare il promemoria locale già esistente come fallback.

## Reminder Push remoto

La Fase 1 del promemoria remoto aggiunge:

- registrazione della `PushSubscription` dal browser
- salvataggio di `subscription` e `timeZone` su Redis
- route cron `GET /api/cron/reminder-dispatch` che invia una notifica semplice
- fallback locale ancora attivo se il push remoto non è configurato o fallisce
- orario fisso del promemoria alle `21:00`

Route principali:

- `POST /api/push/reminder/subscribe`
- `POST /api/push/reminder/unsubscribe`
- `GET /api/cron/reminder-dispatch`

La route cron richiede header:

```http
Authorization: Bearer <CRON_SECRET>
```

Con il reminder fisso alle `21:00`, il cron puo anche essere eseguito ogni ora, pur con un comportamento meno preciso rispetto a un check al minuto.

## Deploy su Vercel Hobby

Per questa versione del reminder conviene:

- deployare l'app su **Vercel Hobby**
- usare un **cron esterno** per chiamare la route di dispatch

### Variabili ambiente su Vercel

Nel progetto Vercel configura queste env:

```env
OPENAI_API_KEY=
PEXELS_API_KEY=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
NEXT_PUBLIC_HOTJAR_ID=
NEXT_PUBLIC_HOTJAR_SV=6
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CRON_SECRET=
```

`NEXT_PUBLIC_VAPID_PUBLIC_KEY` e `VAPID_PUBLIC_KEY` hanno lo stesso valore.

### Deploy

1. Collega il repository a Vercel
2. Importa il progetto come app Next.js
3. Inserisci le env di produzione
4. Esegui il deploy
5. Apri il dominio di produzione e attiva il promemoria su una sola tab

### Cron esterno

Su Vercel Hobby non configuriamo cron in `vercel.json`. Usiamo invece un servizio esterno come `cron-job.org`.

Impostazione consigliata del job:

- **URL**: `https://<tuo-dominio>/api/cron/reminder-dispatch`
- **Method**: `GET`
- **Schedule**: ogni ora
- **Header**:

```http
Authorization: Bearer <CRON_SECRET>
```

Con il promemoria fisso alle `21:00`, il job puo girare ogni ora. La finestra pratica di invio sara intorno alle `21`.

### Test produzione

1. Apri il sito di produzione
2. Consenti le notifiche del browser
3. Attiva il promemoria
4. Verifica che Redis contenga almeno un `clientId`
5. Esegui manualmente:

```bash
curl -i "https://<tuo-dominio>/api/cron/reminder-dispatch" \
  -H "Authorization: Bearer <CRON_SECRET>"
```

6. Controlla che la risposta contenga `sent: 1` oppure `skipped: 1` se il promemoria è già stato inviato oggi

## Avvio

```bash
# Sviluppo (frontend + API sulla stessa origine)
yarn dev
```

Apri [http://localhost:3000](http://localhost:3000).

```bash
# Build per produzione
yarn build

# Avvio in produzione
yarn start
```

## Script disponibili

| Comando       | Descrizione                    |
|---------------|--------------------------------|
| `yarn dev` | Server di sviluppo (porta 3000) |
| `yarn build` | Build ottimizzata per produzione |
| `yarn start`   | Avvia l’app in produzione      |
| `yarn lint` | Esegue ESLint                  |

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
