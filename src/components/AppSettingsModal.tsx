"use client";

import { useCallback, useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { type CompletionReminderPreferences } from "@/utils/completionReminderStorage";
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
        <p className="app-settings-modal__hint">Un promemoria per aiutarti a registrare i tuoi progressi.</p>

        <div className="app-settings-modal__row">
          <span
            className="app-settings-modal__label"
            id="settings-reminder-label"
          >
            Attiva promemoria
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
            Perfetto: il promemoria e attivo e il browser puo inviarti la
            notifica serale.
          </p>
        ) : completionPrefs.enabled && perm === "default" ? (
          <>
            <p className="app-settings-modal__status" role="status">
              Ci siamo quasi: consenti le notifiche nel browser per ricevere il
              promemoria.
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
            Il promemoria e disattivato: non ti invieremo notifiche serali.
          </p>
        )}
      </div>
    </Modal>
  );
}
