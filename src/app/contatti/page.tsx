export const metadata = {
  title: "Contatti — PocketDiet",
  description: "Come contattarci.",
};

export default function ContactPage() {
  const contactEmail = "help@pocket-diet.com";
  const poweredByLabel = process.env.NEXT_PUBLIC_POWERED_BY_LABEL ?? "artscomi";
  const poweredByUrl =
    process.env.NEXT_PUBLIC_POWERED_BY_URL ?? "https://instagram.com/artscomi";

  return (
    <main className="legal-page">
      <h1 className="legal-title">Contatti</h1>
      <section className="legal-section">
        <h2>Il progetto</h2>
        <p>
          <strong>PocketDiet</strong> è un progetto gratuito e senza scopo di lucro, nato
          per semplificare la vita di chi segue una dieta prescritta da un nutrizionista.
        </p>
        <p>
          L&apos;idea è semplice: carichi il piano alimentare che ti ha dato il tuo
          professionista e l&apos;app ti mostra ogni giorno cosa mangiare, senza dover
          cercare tra fogli, PDF o foto ogni volta.
        </p>
        <p>
          PocketDiet non sostituisce il parere medico e non genera diete autonomamente.
          Si limita a rendere più comoda la consultazione di un piano già esistente.
        </p>
      </section>

      <section className="legal-section">
        <h2>Cosa puoi fare con PocketDiet</h2>
        <ul>
          <li>Caricare la dieta in formato PDF, immagine o testo</li>
          <li>Consultare i pasti del giorno con ingredienti e quantità</li>
          <li>Personalizzare gli ingredienti scegliendo tra le alternative previste dalla dieta</li>
          <li>Generare una lista della spesa automatica per 1, 3 o 7 giorni</li>
          <li>Installare l&apos;app sul telefono per averla sempre a portata di mano</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>Scrivici</h2>
        <p>
          Per domande, suggerimenti o segnalazioni puoi contattarci all&apos;indirizzo:
        </p>
        <p>
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
      </section>

      <section className="legal-section">
        <h2>Powered by</h2>
        <p>
          <a href={poweredByUrl} target="_blank" rel="noopener noreferrer">
            {poweredByLabel}
          </a>
        </p>
      </section>
    </main>
  );
}

