"use client";

import { useCallback, useEffect, useState } from "react";
import Modal from "@/components/Modal";
import {
  type CompletionReminderPreferences,
  FIXED_COMPLETION_REMINDER_TIME,
} from "@/utils/completionReminderStorage";
import "./AppSettingsModal.css";

interface AppSettingsModalProps {
  open: boolean;
  onClose: () => void;
  completionPrefs: CompletionReminderPreferences;
  onCompletionPrefsChange: (next: CompletionReminderPreferences) => void;
}

export default function AppSettingsModal({
  open,
  onClose,
  completionPrefs,
  onCompletionPrefsChange,
}: AppSettingsModalProps) {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    "default",
  );

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission);
  }, [open]);

  const persist = useCallback(
    (next: CompletionReminderPreferences) => {
      onCompletionPrefsChange(next);
    },
    [onCompletionPrefsChange],
  );

  const toggleReminder = useCallback(async () => {
    const nextEnabled = !completionPrefs.enabled;
    if (
      nextEnabled &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      const p = await Notification.requestPermission();
      setPerm(p);
    }
    persist({ ...completionPrefs, enabled: nextEnabled });
  }, [completionPrefs, persist]);

  const unsupported = perm === "unsupported";

  if (!open) return null;

  return (
    <Modal title="Impostazioni" onClose={onClose} buttonLabel="Chiudi" wide>
      <div className="app-settings-modal__section">
        <h3 className="app-settings-modal__section-title">
          Promemoria completamento
        </h3>
        <p className="app-settings-modal__hint">
          Un avviso al giorno per ricordarti di segnare quanto hai seguito la
          dieta. Qui puoi attivare o disattivare il promemoria in PocketDiet.
          L’orario e fisso alle {FIXED_COMPLETION_REMINDER_TIME}. Il browser
          gestisce ancora il permesso delle notifiche: puoi modificarlo dalle
          impostazioni del sito quando vuoi.
        </p>

        <div className="app-settings-modal__row">
          <span
            className="app-settings-modal__label"
            id="settings-reminder-label"
          >
            Promemoria giornaliero
          </span>
          <label className="app-settings-modal__switch">
            <input
              type="checkbox"
              checked={completionPrefs.enabled}
              onChange={() => void toggleReminder()}
              disabled={unsupported}
              aria-labelledby="settings-reminder-label"
            />
            <span className="app-settings-modal__switch-track" aria-hidden>
              <span className="app-settings-modal__switch-thumb" />
            </span>
          </label>
        </div>

        {unsupported ? (
          <p
            className="app-settings-modal__status app-settings-modal__status--warn"
            role="status"
          >
            Il browser non supporta le notifiche su questo dispositivo.
          </p>
        ) : perm === "denied" ? (
          <p
            className="app-settings-modal__status app-settings-modal__status--warn"
            role="status"
          >
            Le notifiche risultano bloccate per questo sito. Per ricevere il
            promemoria, abilitale dalle impostazioni del browser (lucchetto o
            icona del sito → Notifiche).
          </p>
        ) : completionPrefs.enabled && perm === "granted" ? (
          <p
            className="app-settings-modal__status app-settings-modal__status--ok"
            role="status"
          >
            Promemoria attivo in PocketDiet e permesso del browser concesso.
          </p>
        ) : completionPrefs.enabled && perm === "default" ? (
          <>
            <p className="app-settings-modal__status" role="status">
              Il browser non ha ancora concesso le notifiche: tocca il pulsante
              qui sotto e scegli «Consenti» nel messaggio del browser.
            </p>
            <button
              type="button"
              className="app-settings-modal__perm-btn"
              onClick={async () => {
                if (!("Notification" in window)) return;
                const p = await Notification.requestPermission();
                setPerm(p);
              }}
            >
              Consenti notifiche nel browser
            </button>
          </>
        ) : (
          <p className="app-settings-modal__status" role="status">
            Promemoria disattivato in PocketDiet: non verranno inviate notifiche
            dall’app.
          </p>
        )}
      </div>
    </Modal>
  );
}
