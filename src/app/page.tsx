import MarketingHome from "@/components/MarketingHome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PocketDiet | Organizza la dieta del nutrizionista in modo piu chiaro",
  description:
    "PocketDiet rende piu chiara e pratica la dieta del tuo nutrizionista: consulta pasti, porzioni, alternative e lista della spesa in un formato ordinato da usare ogni giorno dal telefono.",
  keywords: [
    "app dieta nutrizionista",
    "dieta sul telefono",
    "piano alimentare digitale",
    "lista spesa dieta",
    "organizzare dieta nutrizionista",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PocketDiet | Organizza la dieta del nutrizionista in modo piu chiaro",
    description:
      "PocketDiet rende piu chiara e pratica la dieta del tuo nutrizionista: consulta pasti, porzioni, alternative e lista della spesa in un formato ordinato da usare ogni giorno dal telefono.",
    url: "/",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary",
    title: "PocketDiet | Organizza la dieta del nutrizionista in modo piu chiaro",
    description:
      "PocketDiet rende piu chiara e pratica la dieta del tuo nutrizionista: consulta pasti, porzioni, alternative e lista della spesa in un formato ordinato da usare ogni giorno dal telefono.",
    images: ["/opengraph-image"],
  },
};

export default function HomePage() {
  return <MarketingHome />;
}
