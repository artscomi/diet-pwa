"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconChartBar,
  IconCopyPlus,
  IconEdit,
  IconCheckbox,
  IconMoodSmile,
  IconShoppingCart,
  IconToolsKitchen2,
} from "@tabler/icons-react";
import Footer from "./Footer";
import InstallAppCTA, { isStandalone } from "./InstallAppCTA";
import "./MarketingHome.css";

const MARKETING_BENEFITS = [
  {
    title: "Sai subito cosa mangiare oggi",
    body: "Apri l'app e trovi subito cosa mangiare, con piu chiarezza tra pasti, porzioni e alternative durante la giornata.",
    image:
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Persona che consulta il telefono mentre prepara il cibo",
  },
  {
    title: "La spesa si prepara da sola",
    body: "Dal menu che segui in app nascono ingredienti e quantità già allineati al piano: niente ricopiature, meno indecisione in corsia e meno spreco in settimana.",
    image:
      "https://images.pexels.com/photos/3850888/pexels-photo-3850888.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Verdure e ingredienti freschi organizzati su un piano cucina",
  },
  {
    title: "Invia il report al tuo nutrizionista",
    body: "I progressi diventano piu facili da leggere e da raccontare, anche quando vuoi confrontarti con il tuo nutrizionista.",
    image:
      "https://images.pexels.com/photos/6690908/pexels-photo-6690908.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Persona che annota o controlla i progressi del piano alimentare",
  },
  {
    title: "Condividi la lista della spesa con chi vuoi",
    body: "Chi vive con te riceve una lista piu chiara e immediata, senza messaggi sparsi, note volanti o confusione.",
    image:
      "https://images.pexels.com/photos/6214370/pexels-photo-6214370.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Lista della spesa su quaderno, carrellino e busta su sfondo verde acqua",
  },
] as const;

const MARKETING_STEPS = [
  {
    label: "1. Carica il piano alimentare",
    body: "Puoi partire da PDF, foto o testo del piano ricevuto dal nutrizionista.",
    image:
      "https://images.pexels.com/photos/7669729/pexels-photo-7669729.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Persona che usa uno smartphone in cucina mentre consulta un contenuto",
    appPreview: false,
  },
  {
    label: "2. PocketDiet lo riorganizza",
    body: "Pasti, porzioni, alternative e lista della spesa vengono presentati in un formato piu chiaro e piu adatto all'uso quotidiano.",
    image: null,
    alt: "",
    appPreview: true,
  },
  {
    label: "3. Consulti la tua dieta ogni giorno",
    body: "Dal telefono trovi subito le informazioni rilevanti, senza dover tornare ogni volta al documento originale.",
    image:
      "https://images.pexels.com/photos/9788841/pexels-photo-9788841.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Persona a colazione che consulta lo smartphone con una ciotola di cereali e frutta",
    appPreview: false,
  },
] as const;

const MARKETING_FAQ = [
  {
    question: "Cosa succede dopo che carico la dieta?",
    answer:
      "Il piano viene riorganizzato in schermate piu semplici da consultare dal telefono, mantenendo il contenuto del documento ma rendendolo piu fruibile nella routine quotidiana.",
  },
  {
    question: "Funziona anche con una foto?",
    answer:
      "Si. La pagina upload accetta PDF, immagini del piano alimentare e testo copiato dal nutrizionista.",
  },
  {
    question: "Posso tracciare i progressi e vedere un report?",
    answer:
      "Si. PocketDiet puo aiutarti a tenere traccia di quanto stai seguendo il piano durante la giornata e a consultare un report sintetico dei progressi.",
  },
  {
    question: "PocketDiet sostituisce il nutrizionista?",
    answer:
      "No. PocketDiet non sostituisce il professionista: aiuta a consultare e seguire con piu continuita la dieta che hai gia ricevuto.",
  },
] as const;

const MARKETING_SIGNAL_ITEMS = [
  "Pensata per l'uso quotidiano dal telefono",
  "Piu chiarezza tra pasti, porzioni e alternative",
  "Una pagina upload dedicata, semplice e immediata",
] as const;

const MARKETING_HIGHLIGHTS = [
  {
    value: "Carichi la tua dieta e non ci pensi più",
    label:
      "PDF, foto o testo: PocketDiet ricostruisce i pasti senza farti riscrivere tutto",
  },
  {
    value: "Tieni traccia dei tuoi progressi",
    label:
      "Genera un report da condividere con il tuo nutrizionista per tenere traccia dei tuoi progressi.",
  },
  {
    value: "Lista spesa mirata e senza sprechi",
    label:
      "Ogni quantità segue ciò che hai in menu: niente stime improvvisate in corsia, meno avanzi in frigo e meno spreco",
  },
] as const;

const MARKETING_EDITORIAL_IMAGES = [
  {
    src: "https://images.pexels.com/photos/27175522/pexels-photo-27175522.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Donna al supermercato che controlla gli scaffali davanti al carrello",
    title: "Al supermercato non sai cosa comprare senza la dieta sotto mano",
  },
  {
    src: "https://images.pexels.com/photos/693267/pexels-photo-693267.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Persona al tavolo con piatto servito e smartphone in mano",
    title:
      "Arriva l'ora di cena: dov'è il PDF che ti aveva mandato il tuo nutrizionista?",
  },
  {
    src: "https://images.pexels.com/photos/8844387/pexels-photo-8844387.jpeg?auto=compress&cs=tinysrgb&w=1200",
    alt: "Due persone consultano una guida stampata su verdure e carboidrati sul tavolo da cucina",
    title:
      "La dieta resta sul foglio: come fai a sapere se l'hai seguita davvero?",
  },
] as const;

export default function MarketingHome() {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
  }, []);

  return (
    <div
      className={`marketing-home${standalone ? " marketing-home--standalone" : ""}`}
    >
      <div className="marketing-topbarWrap">
        <div className="marketing-home__main marketing-home__main--topbar">
          <header className="marketing-topbar">
            <Link
              href="/"
              className="marketing-topbar__brand"
              aria-label="PocketDiet home"
            >
              <span className="marketing-topbar__brandName">PocketDiet</span>
            </Link>
            <nav
              className="marketing-topbar__nav"
              aria-label="Navigazione principale"
            >
              <a href="#come-funziona" className="marketing-topbar__link">
                Come funziona
              </a>
              <a href="#faq" className="marketing-topbar__link">
                FAQ
              </a>
              <Link href="/upload" className="marketing-topbar__cta">
                Hai già una dieta? Vai all'upload
              </Link>
            </nav>
          </header>
        </div>
      </div>

      <main className="marketing-home__main">
        <section className="marketing-hero">
          <div className="marketing-hero__introHead">
            <p className="marketing-hero__eyebrow">
              Seguire la dieta del tuo nutrizionista non è mai stato così facile
            </p>
            <h1 className="marketing-hero__title">
              La tua dieta, piu leggibile. Piu pratica. Piu quotidiana.
            </h1>
          </div>

          <div className="marketing-hero__phoneCol">
            <div className="marketing-phone" aria-hidden>
              <div className="marketing-phone__device">
                <div className="marketing-phone__notch" />
                <div className="marketing-phone__shell">
                  <div className="marketing-phone__appbar">
                    <span className="marketing-phone__brandMini">
                      PocketDiet
                    </span>
                    <div className="marketing-phone__appActions">
                      <span className="marketing-phone__iconBtn">⚙</span>
                      <span className="marketing-phone__changeDiet">
                        Cambia dieta
                      </span>
                    </div>
                  </div>
                  <div className="marketing-phone__daybar">
                    <span className="marketing-phone__navBtn">‹</span>
                    <div className="marketing-phone__dayCenter">
                      <span className="marketing-phone__dayBadge">OGGI</span>
                      <span className="marketing-phone__dayText">
                        Domenica 12 Aprile 2026
                      </span>
                    </div>
                    <span className="marketing-phone__navBtn">›</span>
                  </div>

                  <div className="marketing-phone__progressCard">
                    <div className="marketing-phone__progressTitle">
                      Quanto hai rispettato la dieta oggi?
                    </div>
                    <div className="marketing-phone__progressPill">
                      <span className="marketing-phone__progressIcon">
                        <IconMoodSmile size={15} stroke={2} aria-hidden />
                      </span>
                      <span>84%</span>
                    </div>
                  </div>

                  <div className="marketing-phone__menuCard">
                    <div className="marketing-phone__mealSection">
                      <span className="marketing-phone__mealLabel">
                        Colazione
                      </span>
                      <span className="marketing-phone__mealRow">
                        <strong>Carboidrati:</strong> Cereali da Colazione (30
                        g)
                      </span>
                      <span className="marketing-phone__mealRow">
                        <strong>Frutta:</strong> Pera (150 g)
                      </span>
                      <span className="marketing-phone__mealRow">
                        <strong>Proteine:</strong> Yogurt greco (150 g)
                      </span>
                      <div className="marketing-phone__mealActions">
                        <span>
                          <IconCopyPlus size={16} stroke={2} aria-hidden />
                        </span>
                        <span>
                          <IconCheckbox size={16} stroke={2} aria-hidden />
                        </span>
                        <span>
                          <IconEdit size={16} stroke={2} aria-hidden />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="marketing-phone__menuCard marketing-phone__menuCard--compact">
                    <div className="marketing-phone__mealSection">
                      <span className="marketing-phone__mealLabel">
                        Spuntino Mattutino
                      </span>
                      <span className="marketing-phone__mealText">
                        Noci - secche (30 g)
                      </span>
                      <div className="marketing-phone__mealActions">
                        <span>
                          <IconCopyPlus size={16} stroke={2} aria-hidden />
                        </span>
                        <span>
                          <IconCheckbox size={16} stroke={2} aria-hidden />
                        </span>
                        <span>
                          <IconEdit size={16} stroke={2} aria-hidden />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="marketing-phone__bottomNav">
                    <span className="marketing-phone__bottomNavItem marketing-phone__bottomNavItem--active">
                      <IconToolsKitchen2 size={18} stroke={2} aria-hidden />
                      <span>Pasti</span>
                    </span>
                    <span className="marketing-phone__bottomNavItem">
                      <IconShoppingCart size={18} stroke={2} aria-hidden />
                      <span>Spesa</span>
                    </span>
                    <span className="marketing-phone__bottomNavItem">
                      <IconChartBar size={18} stroke={2} aria-hidden />
                      <span>Report</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="marketing-hero__introSub">
            <p className="marketing-hero__subtitle">
              PocketDiet prende la dieta che hai già e la trasforma in qualcosa
              di semplice da usare ogni giorno. Niente più PDF da rileggere o
              informazioni sparse: sai subito cosa mangiare.
            </p>
          </div>

          <div className="marketing-hero__rest">
            {/* <div
              className="marketing-hero__signalBar"
              aria-label="Valore chiave"
            >
              {MARKETING_SIGNAL_ITEMS.map((item) => (
                <span key={item} className="marketing-hero__signalPill">
                  {item}
                </span>
              ))}
            </div> */}
            <div className="marketing-hero__actions">
              <Link
                href="/upload"
                className="marketing-btn marketing-btn--primary"
              >
                Carica la tua dieta
              </Link>
              <a
                href="#come-funziona"
                className="marketing-btn marketing-btn--secondary"
              >
                Scopri come funziona
              </a>
            </div>
            {/* <ul className="marketing-hero__trust" aria-label="Punti chiave">
              <li>Funziona con PDF, foto e testo</li>
              <li>Rende piu consultabili pasti, porzioni e alternative</li>
              <li>
                Non sostituisce il nutrizionista: migliora l'esperienza d'uso
              </li>
            </ul> */}
          </div>
        </section>

        <section className="marketing-highlights" aria-label="Punti chiave">
          <div className="marketing-highlights__inner">
            {MARKETING_HIGHLIGHTS.map((item) => (
              <article key={item.value} className="marketing-highlights__card">
                <p className="marketing-highlights__value">{item.value}</p>
                <p className="marketing-highlights__label">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="marketing-editorial"
          aria-label="Cosa succede senza PocketDiet"
        >
          <div className="marketing-editorial__inner">
            <p className="marketing-editorial__eyebrow">
              Cosa succede senza PocketDiet
            </p>
            {MARKETING_EDITORIAL_IMAGES.map((item) => (
              <article key={item.title} className="marketing-editorial__card">
                <div className="marketing-editorial__media">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="marketing-editorial__img"
                  />
                </div>
                <p className="marketing-editorial__caption">{item.title}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="marketing-section marketing-section--benefits"
          id="come-funziona"
        >
          <div className="marketing-section__inner marketing-section__inner--wide">
            <div className="marketing-section__header">
              <p className="marketing-section__eyebrow">
                Cosa cambia davvero con PocketDiet
              </p>

              <h2 className="marketing-section__title">
                Dalla prescrizione alla consultazione quotidiana
              </h2>
            </div>
            <div className="marketing-grid">
              {MARKETING_BENEFITS.map((item) => (
                <article key={item.title} className="marketing-card">
                  <div className="marketing-card__media">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 767px) 100vw, 25vw"
                      className="marketing-card__img"
                    />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section--steps">
          <div className="marketing-section__inner marketing-section__inner--mid">
            <div className="marketing-section__header">
              <p className="marketing-section__eyebrow">Come funziona</p>
              <h2 className="marketing-section__title">
                Un flusso semplice, pensato per l'uso reale
              </h2>
            </div>
            <div className="marketing-steps">
              {MARKETING_STEPS.map((step) => (
                <article key={step.label} className="marketing-step">
                  {step.appPreview ? (
                    <div className="marketing-stepPreview" aria-hidden>
                      <div className="marketing-stepPreview__header">
                        <span className="marketing-stepPreview__badge">
                          OGGI
                        </span>
                        <span className="marketing-stepPreview__date">
                          Domenica 12 Aprile
                        </span>
                      </div>
                      <div className="marketing-stepPreview__card">
                        <span className="marketing-stepPreview__title">
                          Colazione
                        </span>
                        <span className="marketing-stepPreview__row">
                          <strong>Carboidrati:</strong> Cereali da colazione
                        </span>
                        <span className="marketing-stepPreview__row">
                          <strong>Frutta:</strong> Pera
                        </span>
                        <span className="marketing-stepPreview__row">
                          <strong>Proteine:</strong> Yogurt greco
                        </span>
                      </div>
                      <div className="marketing-stepPreview__chips">
                        <span>Alternative</span>
                        <span>Spesa</span>
                        <span>Report</span>
                      </div>
                    </div>
                  ) : (
                    <div className="marketing-card__media marketing-card__media--step">
                      <Image
                        src={step.image}
                        alt={step.alt}
                        fill
                        sizes="(max-width: 767px) 100vw, 33vw"
                        className="marketing-card__img"
                      />
                    </div>
                  )}
                  <h3>{step.label}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section--faq" id="faq">
          <div className="marketing-section__inner marketing-section__inner--narrow">
            <div className="marketing-section__header">
              <p className="marketing-section__eyebrow">Domande frequenti</p>
            </div>
            <div className="marketing-faq">
              {MARKETING_FAQ.map((item) => (
                <article key={item.question} className="marketing-faq__item">
                  <h3 className="marketing-faq__question">{item.question}</h3>
                  <p className="marketing-faq__answer">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="marketing-cta">
          <div className="marketing-cta__inner">
            <div className="marketing-cta__panel">
              <div>
                <p className="marketing-section__eyebrow">Pronto a provarla?</p>
                <h2 className="marketing-cta__title">
                  Vai alla pagina di upload e importa la tua dieta in modo
                  semplice e sicuro
                </h2>
              </div>
              <Link
                href="/upload"
                className="marketing-btn marketing-btn--primary"
              >
                Vai alla pagina di upload
              </Link>
            </div>
          </div>
        </section>
      </main>

      <div
        className={`marketing-home__footerWrap${standalone ? "" : " marketing-home__footerWrap--withDock"}`}
      >
        <Footer showInstallCTA={false} />
      </div>

      {!standalone && (
        <>
          <div
            className="marketing-home__uploadDock"
            role="region"
            aria-label="Carica la dieta"
          >
            <div className="marketing-home__uploadDockInner">
              <Link
                href="/upload"
                className="marketing-btn marketing-btn--primary marketing-home__uploadDockBtn"
              >
                Carica la tua dieta
              </Link>
            </div>
          </div>
          <div className="marketing-home__installDock">
            <InstallAppCTA variant="stickyBar" />
          </div>
        </>
      )}
    </div>
  );
}
