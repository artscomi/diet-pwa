import "./globals.css";

export const metadata = {
  title: "Menoo - Il tuo menu del giorno",
  description:
    "Un menu che rispetta la tua dieta, ogni giorno. Carica il file, personalizza gli ingredienti. Installa l’app per averla sempre a portata di mano.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Menoo",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/pwa-192x192.png" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body>{children}</body>
    </html>
  );
}
