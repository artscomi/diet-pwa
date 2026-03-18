"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readCookieConsent, writeCookieConsent } from "@/utils/cookieConsent";

export default function CookieBanner() {
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "";
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID ?? "";
  const isProduction = process.env.NODE_ENV === "production";

  const shouldShowBanner = useMemo(() => {
    const hasAnalytics = Boolean(clarityProjectId || hotjarId);
    return hasAnalytics && isProduction;
  }, [clarityProjectId, hotjarId, isProduction]);

  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!shouldShowBanner) return;
    const current = readCookieConsent();
    setConsent(current);
    setIsVisible(current === null);
  }, [shouldShowBanner]);

  if (!shouldShowBanner) return null;
  if (!isVisible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite">
      <div className="cookie-banner__inner">
        <p className="cookie-banner__title">Cookie e analytics</p>
        <p className="cookie-banner__text">
          Usiamo strumenti di analytics per capire cosa migliorare. Puoi accettare o rifiutare.{" "}
          <Link href="/cookie">Leggi la Cookie Policy</Link>.
        </p>
        <div className="cookie-banner__actions">
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--secondary"
            onClick={() => {
              writeCookieConsent("rejected");
              setConsent("rejected");
              setIsVisible(false);
            }}
          >
            Rifiuta
          </button>
          <button
            type="button"
            className="cookie-banner__btn cookie-banner__btn--primary"
            onClick={() => {
              writeCookieConsent("accepted");
              setConsent("accepted");
              setIsVisible(false);
              // Se l'utente accetta, gli script analytics verranno montati dal componente AnalyticsScripts
            }}
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}

