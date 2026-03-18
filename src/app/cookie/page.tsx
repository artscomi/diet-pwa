export const metadata = {
  title: "Cookie Policy — My menoo",
  description: "Informazioni su cookie e strumenti di analytics.",
};

export default function CookiePolicyPage() {
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "";
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID ?? "";
  const hasAnyAnalytics = Boolean(clarityProjectId || hotjarId);

  return (
    <main className="legal-page">
      <h1 className="legal-title">Cookie Policy</h1>
      <p className="legal-updated">Ultimo aggiornamento: 18/03/2026</p>

      <section className="legal-section">
        <h2>In breve</h2>
        <p>
          Possiamo usare strumenti di analytics per capire come migliorare l’esperienza.
          Questi strumenti possono impostare cookie o tecnologie simili.
        </p>
      </section>

      <section className="legal-section">
        <h2>Strumenti attivi</h2>
        {!hasAnyAnalytics ? (
          <p className="legal-muted">Al momento non risultano strumenti di analytics attivi.</p>
        ) : (
          <ul>
            {clarityProjectId && (
              <li>
                <strong>Microsoft Clarity</strong>
              </li>
            )}
            {hotjarId && (
              <li>
                <strong>Hotjar</strong>
              </li>
            )}
          </ul>
        )}
        <p className="legal-muted">
          Nota: gli script vengono caricati solo in produzione (non su localhost).
        </p>
      </section>

      <section className="legal-section">
        <h2>Come gestire cookie</h2>
        <p>
          Puoi gestire o disabilitare i cookie dalle impostazioni del browser.
        </p>
      </section>
    </main>
  );
}

