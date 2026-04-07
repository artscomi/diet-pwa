/**
 * Registra `/sw.js` (Workbox da next-pwa: cache offline + worker custom per le notifiche).
 */
export async function registerMealReminderServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await reg.update();
    return reg;
  } catch {
    return null;
  }
}
