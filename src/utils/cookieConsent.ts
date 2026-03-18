export type CookieConsentValue = "accepted" | "rejected";

export const COOKIE_CONSENT_STORAGE_KEY = "cookieConsent";

export function readCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (raw === "accepted" || raw === "rejected") return raw;
    return null;
  } catch {
    return null;
  }
}

export function writeCookieConsent(value: CookieConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  } catch {
    // ignore
  }

  // cookie non-HttpOnly per poterlo leggere lato client facilmente
  try {
    const maxAge = 60 * 60 * 24 * 180; // 180 giorni
    document.cookie = `cookie_consent=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

