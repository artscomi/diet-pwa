"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { readCookieConsent } from "@/utils/cookieConsent";

export default function AnalyticsScripts() {
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "";
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID ?? "";
  const hotjarSv = process.env.NEXT_PUBLIC_HOTJAR_SV ?? "6";
  const isProduction = process.env.NODE_ENV === "production";

  const hasAnalytics = useMemo(
    () => Boolean(clarityProjectId || hotjarId) && isProduction,
    [clarityProjectId, hotjarId, isProduction],
  );

  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    setConsent(readCookieConsent());
  }, []);

  if (!hasAnalytics) return null;
  if (consent !== "accepted") return null;

  return (
    <>
      {clarityProjectId && (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityProjectId}");
            `,
          }}
        />
      )}

      {hotjarId && (
        <Script
          id="hotjar"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${hotjarId},hjsv:${parseInt(hotjarSv, 10)}};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      )}
    </>
  );
}

