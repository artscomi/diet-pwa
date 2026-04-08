export const COMPLETION_REMINDER_STORAGE_KEY = "pocketDiet_completionReminder_v2";
/** Migrazione da v1: si importa solo l’orario */
const LEGACY_COMPLETION_REMINDER_STORAGE_KEY = "pocketDiet_completionReminder_v1";

export const COMPLETION_REMINDER_FIRED_PREFIX = "pocketDiet_completionReminderFired_";

export interface CompletionReminderPreferences {
  /** Se false, PocketDiet non programma notifiche (il permesso del browser resta indipendente). */
  enabled: boolean;
  /** Formato HH:mm (24h), fuso orario locale */
  time: string;
}

export const FIXED_COMPLETION_REMINDER_TIME = "21:00";

function defaultPreferences(): CompletionReminderPreferences {
  return { enabled: true, time: FIXED_COMPLETION_REMINDER_TIME };
}

function normalizeTimeString(raw: string): string | null {
  if (!/^\d{1,2}:\d{2}$/.test(raw)) return null;
  const [h, m] = raw.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return null;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function readLegacyTime(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEGACY_COMPLETION_REMINDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { time?: string; enabled?: boolean };
    if (typeof parsed.time !== "string") return null;
    return normalizeTimeString(parsed.time);
  } catch {
    return null;
  }
}

export function readCompletionReminderPreferences(): CompletionReminderPreferences {
  if (typeof window === "undefined") return defaultPreferences();
  try {
    const raw = window.localStorage.getItem(COMPLETION_REMINDER_STORAGE_KEY);
    if (!raw) {
      const base = defaultPreferences();
      return base;
    }
    const parsed = JSON.parse(raw) as Partial<CompletionReminderPreferences>;
    const base = defaultPreferences();
    if (typeof parsed.enabled === "boolean") base.enabled = parsed.enabled;
    return base;
  } catch {
    return defaultPreferences();
  }
}

export function writeCompletionReminderPreferences(prefs: CompletionReminderPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      COMPLETION_REMINDER_STORAGE_KEY,
      JSON.stringify({
        enabled: prefs.enabled,
        time: FIXED_COMPLETION_REMINDER_TIME,
      }),
    );
  } catch {
    /* ignore */
  }
}

function firedStorageKey(dateKey: string): string {
  return `${COMPLETION_REMINDER_FIRED_PREFIX}${dateKey}`;
}

export function isCompletionReminderFiredForDay(dateKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(firedStorageKey(dateKey)) === "1";
  } catch {
    return false;
  }
}

export function markCompletionReminderFiredForDay(dateKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(firedStorageKey(dateKey), "1");
  } catch {
    /* ignore */
  }
}

export function clearCompletionReminderFiredForDay(dateKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(firedStorageKey(dateKey));
  } catch {
    /* ignore */
  }
}

export function parseTimeToHM(time: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) {
    return null;
  }
  return { h, m: min };
}
