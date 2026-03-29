"use client";

import { useEffect, useState } from "react";
import {
  IconChevronUp,
  IconClipboardListFilled,
} from "@tabler/icons-react";
import {
  ADHERENCE_SCORES_CLEARED_EVENT,
  getAdherenceScore,
  setAdherenceScore,
} from "@/utils/dietAdherenceScores";
import "./MenuAdherenceBlock.css";

export interface MenuAdherenceBlockProps {
  /** Chiave giorno (`Date.toDateString()`) per salvare il punteggio */
  dateKey: string;
}

export default function MenuAdherenceBlock({ dateKey }: MenuAdherenceBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const [adherenceScore, setAdherenceScoreState] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => {
      const s = getAdherenceScore(dateKey);
      setAdherenceScoreState(s !== undefined ? s : null);
    };
    sync();
    window.addEventListener(ADHERENCE_SCORES_CLEARED_EVENT, sync);
    return () => window.removeEventListener(ADHERENCE_SCORES_CLEARED_EVENT, sync);
  }, [dateKey]);

  useEffect(() => {
    setExpanded(false);
  }, [dateKey]);

  const rangeId = `adherence-range-${dateKey.replace(/\s+/g, "-")}`;

  if (!expanded) {
    return (
      <div className="menu-adherence-wrap">
        <button
          type="button"
          className="menu-adherence-cta"
          onClick={() => setExpanded(true)}
          aria-expanded={false}
        >
          <span className="menu-adherence-cta__icon" aria-hidden>
            <IconClipboardListFilled size={26} color="currentColor" />
          </span>
          <span className="menu-adherence-cta__text">
            <span className="menu-adherence-cta__title">Pagella di oggi</span>
            <span className="menu-adherence-cta__sub">
              Clicca qui per indicare un punteggio su quanto hai rispettato la dieta.
            </span>
          </span>
          {adherenceScore !== null ? (
            <span className="menu-adherence-cta__badge">{adherenceScore}%</span>
          ) : null}
        </button>
      </div>
    );
  }

  return (
    <div className="menu-adherence-wrap">
      <div className="menu-adherence">
        <div className="menu-adherence__head">
          <span className="menu-adherence__title">
            Quanto siamo stati bravi oggi?
          </span>
          <div className="menu-adherence__head-actions">
            <span className="menu-adherence__value" aria-live="polite">
              {adherenceScore === null ? "—" : `${adherenceScore}%`}
            </span>
            <button
              type="button"
              className="menu-adherence__collapse"
              onClick={() => setExpanded(false)}
              aria-label="Chiudi pagella"
            >
              <IconChevronUp size={20} stroke={2} aria-hidden />
            </button>
          </div>
        </div>
        <p className="menu-adherence__hint">
          {adherenceScore === null
            ? "Segna quanto hai rispettato la dieta (da 0 a 100%)."
            : "Indica quanto hai rispettato la dieta oggi: i dati saranno salvati nel tuo prossimo report."}
        </p>
        <label className="menu-adherence__slider-label" htmlFor={rangeId}>
          <span className="menu-adherence__visually-hidden">
            Quanto hai rispettato la dieta oggi, in percentuale
          </span>
          <input
            id={rangeId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={adherenceScore ?? 50}
            onChange={(e) => {
              const v = Number(e.target.value);
              setAdherenceScoreState(v);
              setAdherenceScore(dateKey, v);
            }}
            className="menu-adherence__range"
          />
        </label>
        <div className="menu-adherence__ticks" aria-hidden>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
