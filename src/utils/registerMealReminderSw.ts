/**
 * Registra lo service worker per i promemoria (tap sulla notifica → focus app).
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
