"use client";

import { useEffect, useRef, useState } from "react";
import type { CompletionReminderPreferences } from "@/utils/completionReminderStorage";
import {
  clearCompletionReminderFiredForDay,
  FIXED_COMPLETION_REMINDER_TIME,
  isCompletionReminderFiredForDay,
  markCompletionReminderFiredForDay,
  parseTimeToHM,
} from "@/utils/completionReminderStorage";
import { getOrCreatePushClientId } from "@/utils/pushReminderClientId";
import { registerMealReminderServiceWorker } from "@/utils/registerMealReminderSw";
import { urlBase64ToUint8Array } from "@/utils/urlBase64ToUint8Array";

const NOTIFICATION_TITLE = "🥑 Promemoria serale";
const NOTIFICATION_BODY =
  "Prima di chiudere la giornata, segna i tuoi progressi di oggi!";
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";

interface CompletionReminderEffectsProps {
  prefs: CompletionReminderPreferences;
  /** Incrementato quando l'utente concede il permesso notifiche: riattiva la sottoscrizione push. */
  permissionRev?: number;
}

async function syncRemoteSubscription(
  reg: ServiceWorkerRegistration,
  clientId: string,
  time: string,
): Promise<boolean> {
  if (!VAPID_PUBLIC || !("PushManager" in window)) {
    return false;
  }

  let sub = await reg.pushManager.getSubscription();
  const key = urlBase64ToUint8Array(VAPID_PUBLIC);
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const res = await fetch("/api/push/reminder/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId,
      subscription: sub.toJSON(),
      time,
      timeZone,
    }),
  });

  return res.ok;
}

async function unsubscribeRemote(clientId: string): Promise<void> {
  try {
    await fetch("/api/push/reminder/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
  } catch {
    /* ignore */
  }
}

/**
 * Nessuna UI: registra lo SW e, se il promemoria è attivo e il permesso è già concesso,
 * invia la notifica giornaliera all’orario scelto. Il permesso si chiede altrove, in contesto.
 */
export default function CompletionReminderEffects({
  prefs,
  permissionRev = 0,
}: CompletionReminderEffectsProps) {
  const [swReady, setSwReady] = useState(false);
  const [remotePushActive, setRemotePushActive] = useState(false);
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
      // Il permesso NON viene chiesto all'apertura: lo chiediamo nel momento in cui
      // l'utente ne capisce il valore (dopo il primo check-in, o dalle impostazioni).
      setSwReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [prefs.enabled]);

  useEffect(() => {
    if (!swReady) return;

    let cancelled = false;

    (async () => {
      const reg = await navigator.serviceWorker.ready;
      const clientId = getOrCreatePushClientId();

      if (!prefsRef.current.enabled) {
        setRemotePushActive(false);
        try {
          const sub = await reg.pushManager.getSubscription();
          await sub?.unsubscribe();
        } catch {
          /* ignore */
        }
        if (clientId) await unsubscribeRemote(clientId);
        return;
      }

      if (Notification.permission !== "granted") {
        setRemotePushActive(false);
        return;
      }

      try {
        const ok = await syncRemoteSubscription(
          reg,
          clientId,
          FIXED_COMPLETION_REMINDER_TIME,
        );
        if (cancelled) return;
        setRemotePushActive(ok);
      } catch {
        if (!cancelled) setRemotePushActive(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [swReady, prefs.enabled, permissionRev]);

  useEffect(() => {
    if (!swReady || !prefs.enabled || Notification.permission !== "granted") {
      return;
    }

    let cancelled = false;

    const sync = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const clientId = getOrCreatePushClientId();
        if (!clientId) return;
        const ok = await syncRemoteSubscription(
          reg,
          clientId,
          FIXED_COMPLETION_REMINDER_TIME,
        );
        if (!cancelled) setRemotePushActive(ok);
      } catch {
        if (!cancelled) setRemotePushActive(false);
      }
    };

    const onVisibility = () => {
      if (!document.hidden) void sync();
    };

    document.addEventListener("visibilitychange", onVisibility);
    const id = window.setInterval(() => void sync(), 15_000);
    void sync();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(id);
    };
  }, [swReady, prefs.enabled, permissionRev]);

  useEffect(() => {
    if (!swReady || !prefs.enabled || remotePushActive) return;
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

      const parsed = parseTimeToHM(FIXED_COMPLETION_REMINDER_TIME);
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
  }, [swReady, prefs.enabled, remotePushActive]);

  return null;
}
