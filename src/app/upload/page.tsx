import App from "@/App";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload dieta | Importa il piano alimentare in PocketDiet",
  description:
    "Importa il piano alimentare del tuo nutrizionista in PDF, foto o testo e trasformalo in una versione piu semplice da consultare dal telefono.",
  keywords: [
    "upload dieta pdf",
    "caricare piano alimentare",
    "importare dieta nutrizionista",
    "pdf dieta telefono",
    "scannerizzare dieta",
  ],
  alternates: {
    canonical: "/upload",
  },
  openGraph: {
    title: "Upload dieta | Importa il piano alimentare in PocketDiet",
    description:
      "Importa il piano alimentare del tuo nutrizionista in PDF, foto o testo e trasformalo in una versione piu semplice da consultare dal telefono.",
    url: "/upload",
    type: "website",
    images: ["/upload/opengraph-image"],
  },
  twitter: {
    card: "summary",
    title: "Upload dieta | Importa il piano alimentare in PocketDiet",
    description:
      "Importa il piano alimentare del tuo nutrizionista in PDF, foto o testo e trasformalo in una versione piu semplice da consultare dal telefono.",
    images: ["/upload/opengraph-image"],
  },
};

export default function UploadPage() {
  return <App />;
}
