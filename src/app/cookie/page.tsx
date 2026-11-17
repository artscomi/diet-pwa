export const metadata = {
  title: "Cookie Policy — PocketDiet",
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
      </section>

      <section className="legal-section">
        <h2>Statistiche anonime di utilizzo</h2>
        <p>
          Usiamo Vercel Web Analytics, che non imposta cookie, per contare in
          forma aggregata alcune azioni (ad esempio “dieta caricata” o “lista
          della spesa condivisa”) e capire quali funzioni sono utili. Sul
          dispositivo salviamo solo la data del primo utilizzo e i giorni di
          utilizzo, per raggruppare le statistiche per settimana. Non inviamo
          nomi, file, contenuti della dieta o testi scritti da te.
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

