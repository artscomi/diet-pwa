# Istruzioni per le Icone PWA

Per completare la configurazione PWA, aggiungi le seguenti icone nella cartella `public`:

## Icone Richieste

1. **pwa-192x192.png** - 192x192 pixel
2. **pwa-512x512.png** - 512x512 pixel  
3. **apple-touch-icon.png** - 180x180 pixel
4. **favicon.ico** - 32x32 pixel (o multipli)

## Generazione Icone

Puoi generare queste icone usando uno dei seguenti strumenti:

### Opzione 1: PWA Asset Generator (CLI)
```bash
npx pwa-asset-generator logo.svg public/
```

### Opzione 2: Online Tools
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

### Opzione 3: Manuale
Crea un'icona quadrata (almeno 512x512px) e ridimensiona alle dimensioni richieste usando:
- Photoshop
- GIMP
- ImageMagick
- Online tools come [ResizeImage.net](https://resizeimage.net/)

## Note

- Le icone devono essere in formato PNG
- Usa colori vivaci e contrasto elevato per migliore visibilità
- L'icona 512x512px sarà usata anche come maskable icon
- L'app funzionerà anche senza queste icone, ma non sarà installabile

