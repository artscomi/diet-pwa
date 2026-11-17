"use client";

import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";
import {
  getActiveDaysCount,
  hasMilestone,
  RETENTION_MIN_ACTIVE_DAYS,
  trackEvent,
  trackOnce,
} from "@/utils/productMetrics";
import "./ProductFeedbackCard.css";

/**
 * Micro-survey in-app, mostrata una sola volta dopo che l'utente è "trattenuto"
 * (≥ RETENTION_MIN_ACTIVE_DAYS giorni attivi).
 *
 * 1. Domanda di Sean Ellis (product/market fit): misura un OUTCOME, non un output.
 * 2. Domanda sul problema, su comportamenti passati (stile "Mom Test"),
 *    per validare come l'early adopter risolveva il problema prima di noi.
 * 3. Invito a un'intervista di 15 minuti: dati qualitativi accanto a quelli quantitativi.
 *
 * Risposte a scelta chiusa: nessun testo libero, nessun dato personale negli analytics.
 */

const DONE_MILESTONE = "pmf_survey_answered";
const DISMISS_KEY = "pocketDiet_feedbackDismissedAt";
const DISMISS_SNOOZE_DAYS = 7;
const CONTACT_EMAIL = "help@pocket-diet.com";

const PMF_OPTIONS = [
  { value: "very", label: "Molto deluso/a" },
  { value: "somewhat", label: "Abbastanza deluso/a" },
  { value: "not", label: "Per niente deluso/a" },
] as const;

const PROBLEM_OPTIONS = [
  { value: "pdf_phone", label: "Aprivo il PDF sul telefono" },
  { value: "paper", label: "Foglio stampato / attaccato al frigo" },
  { value: "photo", label: "Foto o screenshot" },
  { value: "memory", label: "Andavo a memoria" },
  { value: "other_app", label: "Un'altra app" },
] as const;

type Step = "pmf" | "problem" | "thanks";

function isSnoozed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const elapsedDays = (Date.now() - Number(raw)) / 86_400_000;
    return elapsedDays < DISMISS_SNOOZE_DAYS;
  } catch {
    return false;
  }
}

export default function ProductFeedbackCard() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("pmf");

  useEffect(() => {
    if (hasMilestone(DONE_MILESTONE) || isSnoozed()) return;
    if (getActiveDaysCount() < RETENTION_MIN_ACTIVE_DAYS) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    if (step === "pmf") {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      trackEvent("feedback_survey_dismissed", { step });
    }
    setVisible(false);
  };

  return (
    <section className="feedback-card" aria-labelledby="feedback-card-title">
      <button
        type="button"
        className="feedback-card__close"
        onClick={dismiss}
        aria-label="Chiudi"
      >
        <IconX size={18} stroke={2} aria-hidden />
      </button>

      {step === "pmf" && (
        <>
          <p className="feedback-card__eyebrow">Ci aiuti a migliorare? · 2 tocchi</p>
          <h2 id="feedback-card-title" className="feedback-card__title">
            Come ti sentiresti se domani non potessi più usare PocketDiet?
          </h2>
          <div className="feedback-card__options">
            {PMF_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className="feedback-card__option"
                onClick={() => {
                  trackOnce("pmf_survey_answered", { answer: o.value });
                  setStep("problem");
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}

      {step === "problem" && (
        <>
          <p className="feedback-card__eyebrow">Ultima domanda</p>
          <h2 id="feedback-card-title" className="feedback-card__title">
            Prima di PocketDiet, come consultavi la dieta durante la giornata?
          </h2>
          <div className="feedback-card__options">
            {PROBLEM_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className="feedback-card__option"
                onClick={() => {
                  trackEvent("problem_survey_answered", { answer: o.value });
                  setStep("thanks");
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}

      {step === "thanks" && (
        <>
          <h2 id="feedback-card-title" className="feedback-card__title">
            Grazie! 🙏
          </h2>
          <p className="feedback-card__text">
            Ti va di raccontarci in 15 minuti come segui la tua dieta? Ci aiuta
            a capire cosa costruire (e cosa no).
          </p>
          <a
            className="feedback-card__cta"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              "Disponibile per una chiacchierata su PocketDiet",
            )}`}
            onClick={() => trackEvent("interview_cta_clicked")}
          >
            Sì, scrivetemi
          </a>
        </>
      )}
    </section>
  );
}
