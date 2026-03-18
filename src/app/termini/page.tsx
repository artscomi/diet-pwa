export const metadata = {
  title: "Termini di servizio — My menoo",
  description: "Termini e condizioni d’uso del servizio.",
};

export default function TermsPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@my-menoo.app";

  return (
    <main className="legal-page">
      <h1 className="legal-title">Termini di servizio</h1>
      <p className="legal-updated">Ultimo aggiornamento: 18/03/2026</p>

      <section className="legal-section">
        <h2>Cos’è My menoo</h2>
        <p>
          My menoo ti aiuta a trasformare una dieta (documento o immagine) in menu giornalieri
          consultabili e personalizzabili.
        </p>
      </section>

      <section className="legal-section">
        <h2>Uso consentito</h2>
        <ul>
          <li>Puoi caricare solo documenti di cui hai diritto a disporre.</li>
          <li>Non usare il servizio per contenuti illeciti o sensibili che non vuoi inviare a terzi.</li>
          <li>Non tentare di compromettere o abusare del servizio.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>AI e risultati</h2>
        <p>
          Il menu viene generato tramite AI a partire dal documento caricato. Cerchiamo di estrarre le
          informazioni nel modo più fedele possibile, ma potrebbero verificarsi errori. Verifica sempre
          che i menu risultanti corrispondano alla tua dieta prescritta.
        </p>
      </section>

      <section className="legal-section">
        <h2>Non è un servizio medico</h2>
        <p>
          My menoo non fornisce consulenza medica e non sostituisce il parere di un professionista.
          Usalo come strumento di organizzazione della dieta già prescritta.
        </p>
      </section>

      <section className="legal-section">
        <h2>Limitazione di responsabilità</h2>
        <p>
          Il servizio è fornito “così com’è”. Nei limiti consentiti dalla legge, non siamo responsabili
          per danni indiretti o conseguenze derivanti dall’uso del servizio o dall’affidamento ai risultati.
        </p>
      </section>

      <section className="legal-section">
        <h2>Contatti</h2>
        <p>
          Per supporto o segnalazioni: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </section>
    </main>
  );
}

