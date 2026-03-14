import './globals.css'

export const metadata = {
  title: 'Menu Dieta - Carica la tua dieta e consulta il menu del giorno',
  description: 'Carica la tua dieta (file o predefinita) e consulta il menu del giorno. Nessuna registrazione. Installa l’app sul telefono per averla sempre a portata di mano.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Menu Dieta',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover' as const,
  themeColor: '#10b981',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/pwa-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/pwa-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/pwa-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/pwa-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/pwa-512x512.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
