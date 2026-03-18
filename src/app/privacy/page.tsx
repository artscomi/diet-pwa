export const metadata = {
  title: "Privacy Policy — PocketDiet",
  description: "Informativa privacy e trattamento dei dati.",
};

export default function PrivacyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "help@pocket-diet.com";
  const poweredByLabel = process.env.NEXT_PUBLIC_POWERED_BY_LABEL ?? "artscomi";

  return (
    <main className="legal-page">
      <h1 className="legal-title">Privacy Policy</h1>
      <p className="legal-updated">Ultimo aggiornamento: 18/03/2026</p>

      <section className="legal-section">
        <h2>In breve</h2>
        <ul>
          <li>
            Carichi un file (PDF/TXT/immagine) solo per estrarre la dieta e generare i menu.
          </li>
          <li>
            Il contenuto può essere inviato a un provider di AI per l’analisi (es. OpenAI).
          </li>
          <li>
            Non vendiamo i tuoi dati e non pubblichiamo i documenti caricati.
          </li>
          <li>
            Il risultato (menu/dieta) viene salvato sul tuo dispositivo tramite localStorage.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Titolare e contatti</h2>
        <p>
          Per richieste relative alla privacy puoi scrivere a{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
        <p className="legal-muted">
          Powered by: {poweredByLabel}.
        </p>
      </section>

      <section className="legal-section">
        <h2>Dati trattati</h2>
        <ul>
          <li>
            <strong>File dieta</strong>: contenuto del documento che carichi (testo/immagine/PDF).
          </li>
          <li>
            <strong>Dati generati</strong>: menu estratti/generati a partire dal file.
          </li>
          <li>
            <strong>Dati tecnici</strong>: log tecnici indispensabili al funzionamento del servizio.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Finalità e base giuridica</h2>
        <ul>
          <li>
            <strong>Erogazione del servizio</strong> (esecuzione del servizio richiesto dall’utente):
            analisi del file e generazione dei menu.
          </li>
          <li>
            <strong>Sicurezza e prevenzione abusi</strong> (legittimo interesse): protezione del servizio.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Come vengono trattati i file</h2>
        <p>
          Il file viene inviato alla nostra API per essere elaborato e trasformato in dati strutturati.
          L’elaborazione può includere l’invio del contenuto a un provider di AI (es. OpenAI) per
          estrarre correttamente i menu.
        </p>
        <p>
          Non conserviamo il documento oltre il tempo necessario all’elaborazione. L’app salva sul tuo
          dispositivo i dati risultanti (menu) tramite localStorage per mostrarti il menu del giorno e
          le tue modifiche.
        </p>
      </section>

      <section className="legal-section">
        <h2>Condivisione con terze parti</h2>
        <p>
          Per la funzionalità di analisi possono essere coinvolti fornitori esterni (es. provider AI).
          In questo caso, i dati vengono usati solo per fornire la risposta richiesta.
        </p>
      </section>

      <section className="legal-section">
        <h2>Conservazione</h2>
        <p>
          I documenti caricati non vengono conservati oltre il tempo necessario all’elaborazione.
          I dati generati possono restare salvati sul tuo dispositivo finché non li rimuovi (es. “Cambia dieta”).
        </p>
      </section>

      <section className="legal-section">
        <h2>Diritti</h2>
        <p>
          Hai diritto di chiedere informazioni sul trattamento dei dati e di richiedere la cancellazione
          di eventuali dati gestiti dal servizio contattandoci via email.
        </p>
      </section>
    </main>
  );
}

