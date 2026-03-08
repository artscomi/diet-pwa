import './globals.css'

export const metadata = {
  title: 'Menu Dieta - PWA',
  description: 'Menu giornalieri che rispettano la tua dieta personalizzata',
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
        <link rel="apple-touch-icon" href="/pwa-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
