"use client";

import { useEffect, useState } from "react";
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
    title: "Consulta il piano con piu chiarezza",
    body: "Pasti, porzioni e alternative vengono presentati in una schermata ordinata, pensata per essere letta rapidamente durante la giornata.",
  },
  {
    title: "Riduci il carico operativo",
    body: "PocketDiet trasforma i pasti della dieta in una lista della spesa pronta, riducendo passaggi manuali, ricopiature e dimenticanze.",
  },
  {
    title: "Condividi in modo piu ordinato",
    body: "La lista puo essere condivisa in pochi secondi, con un formato piu chiaro e piu facile da usare anche da chi vive con te.",
  },
] as const;

const MARKETING_STEPS = [
  {
    label: "1. Carica il piano alimentare",
    body: "Puoi partire da PDF, foto o testo del piano ricevuto dal nutrizionista.",
  },
  {
    label: "2. PocketDiet lo riorganizza",
    body: "Pasti, porzioni, alternative e lista della spesa vengono presentati in un formato piu chiaro e piu adatto all'uso quotidiano.",
  },
  {
    label: "3. Lo consulti ogni giorno",
    body: "Dal telefono trovi subito le informazioni rilevanti, senza dover tornare ogni volta al documento originale.",
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
                Hai gia una dieta? Vai a upload
              </Link>
            </nav>
          </header>
        </div>
      </div>

      <main className="marketing-home__main">
        <section className="marketing-hero">
          <div className="marketing-hero__copy">
            <p className="marketing-hero__eyebrow">
              Un modo piu chiaro di usare la dieta del tuo nutrizionista
            </p>
            <h1 className="marketing-hero__title">
              La tua dieta, piu leggibile. Piu pratica. Piu quotidiana.
            </h1>
            <p className="marketing-hero__subtitle">
              PocketDiet prende il piano alimentare che hai gia ricevuto e lo
              organizza in una forma piu chiara da consultare dal telefono.
              L'obiettivo non e cambiare la dieta, ma ridurre attrito,
              dispersione e complessita nella sua esecuzione quotidiana.
            </p>
            <div className="marketing-hero__signalBar" aria-label="Valore chiave">
              {MARKETING_SIGNAL_ITEMS.map((item) => (
                <span key={item} className="marketing-hero__signalPill">
                  {item}
                </span>
              ))}
            </div>
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
            <ul className="marketing-hero__trust" aria-label="Punti chiave">
              <li>Funziona con PDF, foto e testo</li>
              <li>Rende piu consultabili pasti, porzioni e alternative</li>
              <li>
                Non sostituisce il nutrizionista: migliora l'esperienza d'uso
              </li>
            </ul>
          </div>

          <div className="marketing-phone" aria-hidden>
            <div className="marketing-phone__device">
              <div className="marketing-phone__notch" />
              <div className="marketing-phone__shell">
                <div className="marketing-phone__appbar">
                  <span className="marketing-phone__brandMini">PocketDiet</span>
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
                      <strong>Carboidrati:</strong> Cereali da Colazione (30 g)
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
        </section>

        <section className="marketing-proof">
          <div className="marketing-proof__inner">
            <div className="marketing-proof__card">
              <p className="marketing-proof__kicker">
                Non cambia la dieta del tuo nutrizionista.
              </p>
              <p className="marketing-proof__text">
                La rende piu ordinata, piu consultabile e piu semplice da seguire
                nel contesto reale della giornata.
              </p>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section--benefits" id="come-funziona">
          <div className="marketing-section__inner marketing-section__inner--wide">
            <div className="marketing-section__header">
              <p className="marketing-section__eyebrow">Cosa cambia davvero</p>
              <h2 className="marketing-section__title">
                Dalla prescrizione alla consultazione quotidiana
              </h2>
            </div>
            <div className="marketing-grid">
              {MARKETING_BENEFITS.map((item) => (
                <article key={item.title} className="marketing-card">
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
              <h2 className="marketing-section__title">
                Prima di andare su upload
              </h2>
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
                  Vai alla pagina di upload e importa il tuo piano alimentare
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
        <div className="marketing-home__installDock">
          <InstallAppCTA variant="stickyBar" />
        </div>
      )}
    </div>
  );
}
