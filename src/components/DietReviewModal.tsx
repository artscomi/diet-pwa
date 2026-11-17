"use client";

import Modal from "@/components/Modal";
import type { DailyMenu, UserDiet } from "@/types/diet";
import { WEEKDAY_LABELS } from "@/utils/menuForDate";
import "./DietReviewModal.css";

interface DietReviewModalProps {
  diet: UserDiet;
  onConfirm: () => void;
  onReupload: () => void;
}

const MEALS: { label: string; has: (m: DailyMenu) => boolean }[] = [
  {
    label: "Colazione",
    has: (m) =>
      Boolean(m.colazione?.carboidrati || m.colazione?.frutta || m.colazione?.proteine),
  },
  { label: "Spuntino", has: (m) => Boolean(m.spuntinoMattutino) },
  {
    label: "Pranzo",
    has: (m) => Boolean(m.pranzo?.carboidrati || m.pranzo?.proteine || m.pranzo?.verdure),
  },
  { label: "Merenda", has: (m) => Boolean(m.merenda) },
  {
    label: "Cena",
    has: (m) => Boolean(m.cena?.pane || m.cena?.proteine || m.cena?.verdure),
  },
];

export function summarizeDiet(diet: UserDiet) {
  const menus = diet.dailyMenus;
  const weekdays = Array.from(
    new Set(
      menus
        .map((m) => m.weekday)
        .filter((w): w is number => typeof w === "number"),
    ),
  ).sort((a, b) => a - b);
  return {
    menuCount: menus.length,
    weekdays,
    meals: MEALS.map((meal) => ({
      label: meal.label,
      present: menus.some(meal.has),
    })),
  };
}

/**
 * Riepilogo dopo l'upload: l'utente verifica subito che l'AI abbia letto bene il piano
 * (fiducia = presupposto della retention), invece di scoprire errori all'ora di pranzo.
 */
export default function DietReviewModal({
  diet,
  onConfirm,
  onReupload,
}: DietReviewModalProps) {
  const s = summarizeDiet(diet);

  return (
    <Modal
      title="Controlla la tua dieta"
      onClose={onConfirm}
      primaryLabel="Tutto ok"
      onPrimaryClick={onConfirm}
      singlePrimaryButton
    >
      <div className="diet-review">
        <p className="diet-review__lead">
          {s.weekdays.length > 0 ? (
            <>
              Abbiamo trovato <strong>{s.menuCount} menu</strong> organizzati per
              giorno della settimana:{" "}
              {s.weekdays.map((w) => WEEKDAY_LABELS[w - 1]).join(", ")}.
            </>
          ) : s.menuCount === 1 ? (
            <>
              Abbiamo trovato <strong>1 menu</strong>: ogni giorno PocketDiet
              alterna gli alimenti che il tuo nutrizionista ha indicato come
              sostituibili.
            </>
          ) : (
            <>
              Abbiamo trovato <strong>{s.menuCount} menu</strong>: PocketDiet li
              alterna un giorno dopo l&apos;altro.
            </>
          )}
        </p>

        <ul className="diet-review__meals" aria-label="Pasti trovati">
          {s.meals.map((m) => (
            <li
              key={m.label}
              className={`diet-review__meal${m.present ? "" : " diet-review__meal--missing"}`}
            >
              <span aria-hidden>{m.present ? "✓" : "—"}</span>
              {m.label}
              <span className="visually-hidden">
                {m.present ? ": presente" : ": non presente nel piano"}
              </span>
            </li>
          ))}
        </ul>

        <p className="diet-review__note">
          Vedrai solo gli alimenti scritti nel tuo piano. Se qualcosa non torna,
          puoi correggere ogni pasto con la matita ✏️ oppure ricaricare il file.
        </p>

        <button
          type="button"
          className="diet-review__reupload"
          onClick={onReupload}
        >
          Non è corretta: ricarica il file
        </button>
      </div>
    </Modal>
  );
}
