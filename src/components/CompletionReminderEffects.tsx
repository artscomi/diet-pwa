"use client";

import { useEffect, useRef, useState } from "react";
import type { CompletionReminderPreferences } from "@/utils/completionReminderStorage";
import {
  clearCompletionReminderFiredForDay,
  isCompletionReminderFiredForDay,
  markCompletionReminderFiredForDay,
  parseTimeToHM,
} from "@/utils/completionReminderStorage";
import { registerMealReminderServiceWorker } from "@/utils/registerMealReminderSw";

const NOTIFICATION_TITLE = "Completamento dieta";
const NOTIFICATION_BODY =
  "Segna la percentuale con cui hai seguito i pasti di oggi in PocketDiet.";

interface CompletionReminderEffectsProps {
  prefs: CompletionReminderPreferences;
}

/**
 * Nessuna UI: registra lo SW, chiede il permesso se il promemoria è attivo nelle impostazioni,
 * invia la notifica giornaliera all’orario scelto.
 */
export default function CompletionReminderEffects({
  prefs,
}: CompletionReminderEffectsProps) {
  const [swReady, setSwReady] = useState(false);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!("Notification" in window)) {
        return;
      }

      await registerMealReminderServiceWorker();
      if (cancelled) return;
      try {
        await navigator.serviceWorker.ready;
      } catch {
        if (!cancelled) setSwReady(false);
        return;
      }
      if (cancelled) return;
      setSwReady(true);

      if (!prefsRef.current.enabled) return;

      if (Notification.permission === "default") {
        // Sempre applicare il risultato (vedi Strict Mode: non usare flag cancelled qui).
        await Notification.requestPermission();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prefs.enabled]);

  useEffect(() => {
    if (!swReady || !prefs.enabled) return;
    if (!("Notification" in window)) return;

    const tick = async () => {
      const p = prefsRef.current;
      if (!p.enabled) return;
      if (Notification.permission !== "granted") return;

      const now = new Date();
      const dateKey = now.toDateString();
      const h = now.getHours();
      const min = now.getMinutes();

      if (isCompletionReminderFiredForDay(dateKey)) return;

      const parsed = parseTimeToHM(p.time);
      if (!parsed || parsed.h !== h || parsed.m !== min) return;

      let reg: ServiceWorkerRegistration;
      try {
        reg = await navigator.serviceWorker.ready;
      } catch {
        return;
      }

      markCompletionReminderFiredForDay(dateKey);
      try {
        await reg.showNotification(NOTIFICATION_TITLE, {
          body: NOTIFICATION_BODY,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          tag: `pocketdiet-completion-${dateKey}`,
        });
      } catch {
        clearCompletionReminderFiredForDay(dateKey);
      }
    };

    const id = window.setInterval(tick, 15_000);
    void tick();
    return () => window.clearInterval(id);
  }, [swReady, prefs.enabled, prefs.time]);

  return null;
}
