import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "PocketDiet — La dieta del nutrizionista, sempre in tasca",
  description:
    "Carica la dieta del tuo nutrizionista e consulta i tuoi pasti del giorno, direttamente dal telefono. Personalizza gli ingredienti e installa l'app.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PocketDiet",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/pwa-192x192.png"
        />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body>
        {children}
        <CookieBanner />
        <AnalyticsScripts />
        <Analytics />
      </body>
    </html>
  );
}
