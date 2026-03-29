"use client";

import { useCallback } from "react";
import Modal from "@/components/Modal";
import {
  buildAdherenceReport,
  clearAdherenceScores,
  formatAdherenceReportAsText,
  getAdherenceShareMailtoUrl,
  getAdherenceShareWhatsAppUrl,
} from "@/utils/dietAdherenceScores";
import {
  IconBrandWhatsappFilled,
  IconClipboardList,
  IconMailFilled,
  IconShare3,
} from "@tabler/icons-react";
import "./DietReportModal.css";

interface DietReportModalProps {
  open: boolean;
  onClose: () => void;
}

const CONFIRM_SHARE =
  "Dopo la condivisione tutti i punteggi giornalieri salvati verranno azzerati. Vuoi continuare?";

export default function DietReportModal({ open, onClose }: DietReportModalProps) {
  const share = useCallback(
    (channel: "whatsapp" | "email") => {
      if (typeof window !== "undefined" && !window.confirm(CONFIRM_SHARE)) {
        return;
      }
      const r = buildAdherenceReport();
      const text = formatAdherenceReportAsText(r);
      if (channel === "whatsapp") {
        window.open(
          getAdherenceShareWhatsAppUrl(text),
          "_blank",
          "noopener,noreferrer",
        );
      } else {
        window.location.href = getAdherenceShareMailtoUrl(text);
      }
      clearAdherenceScores();
      onClose();
    },
    [onClose],
  );

  if (!open) return null;

  const r = buildAdherenceReport();

  return (
    <Modal title="Report rispetto dieta" onClose={onClose} buttonLabel="Chiudi" wide>
      {r.evaluatedDays === 0 ? (
        <div className="diet-report diet-report--empty">
          <IconClipboardList
            className="diet-report__empty-icon"
            size={40}
            stroke={1.5}
            aria-hidden
          />
          <p className="diet-report__empty">
            Qui ancora non c&apos;è nessun voto. Nella schermata dei pasti apri
            &quot;Pagella di oggi&quot;, segna quanto hai rispettato la dieta, poi
            torna qui per la media.
          </p>
        </div>
      ) : (
        <div className="diet-report">
          <p className="diet-report__summary">
            Fino ad ora hai valutato <strong>{r.evaluatedDays}</strong>{" "}
            {r.evaluatedDays === 1 ? "giornata" : "giornate"}.
          </p>
          <p className="diet-report__average-wrap">
            <span className="diet-report__average-label">
              Rispetto medio della dieta
            </span>
            <span className="diet-report__average-value">{r.averagePercent}%</span>
          </p>
          <p className="diet-report__note">
            La percentuale è la media dei punteggi (0–100%) che hai assegnato ai
            singoli giorni.
          </p>
          <ul className="diet-report__list">
            {r.sortedEntries.map((e) => (
              <li key={e.dateKey}>
                <span className="diet-report__list-date">{e.dateLabel}</span>
                <span className="diet-report__list-score">{e.score}%</span>
              </li>
            ))}
          </ul>

          <div className="diet-report-share">
            <div className="diet-report-share__header">
              <IconShare3
                className="diet-report-share__header-icon tabler-icon"
                size={24}
                stroke={2}
                aria-hidden
              />
              <h3 className="diet-report-share__title">Condividi</h3>
              <p className="diet-report-share__blurb">
                Un clic su WhatsApp o email: confermi e invii; i punteggi si
                azzerano dopo l&apos;invio.
              </p>
            </div>
            <div className="diet-report-share__actions">
              <button
                type="button"
                className="diet-report-share__tile diet-report-share__tile--whatsapp"
                onClick={() => share("whatsapp")}
              >
                <span className="diet-report-share__tile-icon" aria-hidden>
                  <IconBrandWhatsappFilled size={30} color="currentColor" />
                </span>
                <span className="diet-report-share__tile-label">WhatsApp</span>
              </button>
              <button
                type="button"
                className="diet-report-share__tile diet-report-share__tile--mail"
                onClick={() => share("email")}
              >
                <span className="diet-report-share__tile-icon" aria-hidden>
                  <IconMailFilled size={30} color="currentColor" />
                </span>
                <span className="diet-report-share__tile-label">Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
