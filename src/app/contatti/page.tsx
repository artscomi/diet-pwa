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
      <p className="legal-updated">Rispondiamo appena possibile.</p>

      <section className="legal-section">
        <h2>Email</h2>
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

