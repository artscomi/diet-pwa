import "./globals.css";
import { Montserrat, Baloo_2 } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import { Analytics } from "@vercel/analytics/next";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const baloo2 = Baloo_2({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-baloo2",
  display: "swap",
});

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
    <html lang="it" className={`${montserrat.variable} ${baloo2.variable}`}>
      <head>
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
        {/*
        Widget chat Agile Telecom — disattivato (commentato per non eseguire lo script).
        Dopo l’idratazione: strategy="afterInteractive". Token = istanza lato provider.
        <Script
          id="agile-telecom-chat-widget"
          src="https://pre-lora-api.agiletelecom.com/api/agent-chat/chat-widget.js"
          strategy="afterInteractive"
          data-widget-token="1c49d86a-398a-4d92-b33b-fd5d1d6679e4"
        />
        */}
        {children}
        <CookieBanner />
        <AnalyticsScripts />
        <Analytics />
      </body>
    </html>
  );
}
