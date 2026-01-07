# Menu Dietetici PWA

Una Progressive Web App (PWA) per consultare menu giornalieri predefiniti che rispettano la dieta personalizzata.

## Caratteristiche

- ✅ **Menu Predefiniti**: 14 menu giornalieri variati che rispettano la dieta
- ✅ **Consultazione Semplice**: Visualizza i dettagli completi di ogni menu
- ✅ **Offline Support**: Funziona anche senza connessione internet grazie al Service Worker
- ✅ **Installabile**: Può essere installata sul dispositivo come un'app nativa
- ✅ **Responsive**: Design ottimizzato per mobile e desktop
- ✅ **Modern UI**: Interfaccia utente moderna e accattivante

## Funzionalità App

### Consultazione Menu
- Visualizza l'elenco di tutti i menu disponibili
- Clicca su un menu per vedere i dettagli completi
- Ogni menu include:
  - Colazione (carboidrati, frutta, proteine)
  - Spuntino mattutino
  - Pranzo (carboidrati, proteine, verdure)
  - Merenda
  - Cena (pane, verdure, proteine)
  - Olio d'oliva durante la giornata

## Tecnologie Utilizzate

- **React 18**: Libreria UI moderna
- **Vite**: Build tool veloce e moderno
- **Vite PWA Plugin**: Plugin per configurare PWA automaticamente
- **Workbox**: Libreria per gestire Service Workers e caching
- **LocalStorage**: Salvataggio dati localmente nel browser

## Installazione

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build

# Preview della build di produzione
npm run preview
```

## Configurazione PWA

L'app è già configurata come PWA con:

- **Service Worker**: Gestisce la cache e il funzionamento offline
- **Web App Manifest**: Configurazione per l'installazione
- **Cache Strategy**: Cache intelligente per risorse statiche e API
- **Icons**: Supporto per icone PWA (da aggiungere nella cartella `public`)

## Icone PWA

Per completare la configurazione, aggiungi le seguenti icone nella cartella `public`:

- `pwa-192x192.png` (192x192px)
- `pwa-512x512.png` (512x512px)
- `apple-touch-icon.png` (180x180px)
- `favicon.ico` (32x32px)

Puoi generare queste icone usando strumenti online come:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## Utilizzo

1. **Visualizza i menu**: Vedi l'elenco di tutti i menu disponibili nella schermata principale
2. **Consulta un menu**: Clicca su un menu per vedere tutti i dettagli del pasto
3. **Torna all'elenco**: Usa il pulsante "Torna all'elenco" per tornare alla vista principale

## Sviluppo

Il progetto usa Vite per lo sviluppo. Il server di sviluppo si avvia su `http://localhost:5173` di default.

## Build

Per creare una build di produzione ottimizzata:

```bash
npm run build
```

I file compilati saranno nella cartella `dist`.

## Licenza

MIT

