import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="offline-fallback">
      <h1>Sei offline</h1>
      <p>PocketDiet non raggiunge la rete. Controlla la connessione e riprova.</p>
      <p>
        <Link href="/">Torna alla home</Link>
      </p>
    </main>
  );
}
