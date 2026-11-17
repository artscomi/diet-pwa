/**
 * Metriche di prodotto — funnel AAARRR + coorti.
 *
 * Principi (vedi PRODUCT.md):
 * - "Se non lo misuri non lo sai": ogni step del funnel ha un evento esplicito.
 * - Ogni utente appartiene a UNA sola coorte (settimana ISO del primo accesso),
 *   inviata come proprietà `cohort` su tutti gli eventi.
 * - Si misurano comportamenti, non vanity metrics: niente contatori cumulativi,
 *   solo eventi da cui ricavare tassi di conversione step → step.
 * - Nessun dato personale: niente nomi file, testi liberi o contenuti della dieta.
 *
 * Gli eventi vanno su Vercel Web Analytics (custom events, solo produzione).
 */
import { track } from "@vercel/analytics";

export type FunnelStage =
  | "awareness"
  | "acquisition"
  | "activation"
  | "retention"
  | "referral"
  | "revenue"
  | "feedback";

const EVENT_STAGE = {
  // Awareness — l'utente scopre che PocketDiet esiste
  landing_viewed: "awareness",
  upload_page_viewed: "awareness",
  // Acquisition — l'utente prova a "registrarsi" (caricare la dieta)
  diet_upload_started: "acquisition",
  diet_upload_failed: "acquisition",
  diet_upload_succeeded: "acquisition",
  acquired: "acquisition",
  diet_review_answered: "acquisition",
  // Activation — prima esperienza di valore: segna com'è andato un pasto
  activated: "activation",
  // Retention — torna e usa il prodotto
  app_active_day: "retention",
  meal_checkin_day: "retention",
  retained: "retention",
  reminder_toggled: "retention",
  reminder_offer_answered: "retention",
  app_installed: "retention",
  // Referral — porta PocketDiet fuori dall'app
  shopping_list_shared: "referral",
  report_shared: "referral",
  // Feedback qualitativo (survey in-app)
  pmf_survey_answered: "feedback",
  problem_survey_answered: "feedback",
  feedback_survey_dismissed: "feedback",
  interview_cta_clicked: "feedback",
} as const satisfies Record<string, FunnelStage>;

export type ProductEvent = keyof typeof EVENT_STAGE;
type Props = Record<string, string | number | boolean | null>;

/** Soglia retention: giorni attivi distinti entro la finestra dal primo accesso. */
export const RETENTION_MIN_ACTIVE_DAYS = 3;
export const RETENTION_WINDOW_DAYS = 14;

const FIRST_SEEN_KEY = "pocketDiet_metrics_firstSeen";
const LEGACY_KEY = "pocketDiet_metrics_legacy";
const ACTIVE_DAYS_KEY = "pocketDiet_metrics_activeDays";
const MILESTONES_KEY = "pocketDiet_metrics_milestones";
const MAX_ACTIVE_DAYS_STORED = 120;

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage pieno o bloccato: le metriche non devono rompere l'app */
  }
}

/** Data locale in formato YYYY-MM-DD. */
export function localDayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function daysBetween(fromKey: string, toKey: string): number {
  const ms = parseDayKey(toKey).getTime() - parseDayKey(fromKey).getTime();
  return Math.round(ms / 86_400_000);
}

/** Settimana ISO, es. "2026-W47". */
export function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/**
 * Primo accesso del dispositivo. Gli utenti che avevano già una dieta salvata
 * prima dell'introduzione delle metriche vengono marcati come "legacy", così
 * non sporcano la coorte della settimana di rilascio.
 */
function ensureFirstSeen(): string {
  const existing = safeGet(FIRST_SEEN_KEY);
  if (existing) return existing;
  const today = localDayKey();
  safeSet(FIRST_SEEN_KEY, today);
  if (safeGet("userDiet")) safeSet(LEGACY_KEY, "1");
  return today;
}

export function getCohort(): string {
  if (safeGet(LEGACY_KEY) === "1") return "legacy";
  return isoWeek(parseDayKey(ensureFirstSeen()));
}

export function daysSinceFirstSeen(): number {
  return Math.max(0, daysBetween(ensureFirstSeen(), localDayKey()));
}

function readActiveDays(): string[] {
  try {
    const raw = safeGet(ACTIVE_DAYS_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function getActiveDaysCount(): number {
  return readActiveDays().length;
}

function readMilestones(): Record<string, string> {
  try {
    const raw = safeGet(MILESTONES_KEY);
    const o = raw ? (JSON.parse(raw) as unknown) : {};
    return o && typeof o === "object" ? (o as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function hasMilestone(name: string): boolean {
  return Boolean(readMilestones()[name]);
}

function setMilestone(name: string): boolean {
  const m = readMilestones();
  if (m[name]) return false;
  m[name] = localDayKey();
  safeSet(MILESTONES_KEY, JSON.stringify(m));
  return true;
}

function isStandaloneDisplay(): boolean {
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

export function trackEvent(name: ProductEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;
  const payload: Props = {
    stage: EVENT_STAGE[name],
    cohort: getCohort(),
    day: daysSinceFirstSeen(),
    standalone: isStandaloneDisplay(),
    ...props,
  };
  if (process.env.NODE_ENV === "development") {
    console.debug("[metrics]", name, payload);
  }
  try {
    track(name, payload);
  } catch {
    /* analytics non disponibile */
  }
}

/**
 * Evento "milestone": inviato una sola volta per dispositivo.
 * Restituisce `true` se è la prima volta (utile per reagire nella UI).
 */
export function trackOnce(name: ProductEvent, props: Props = {}): boolean {
  if (typeof window === "undefined") return false;
  if (!setMilestone(name)) return false;
  trackEvent(name, props);
  return true;
}

/** Segna una milestone di UI (non inviata agli analytics). `true` se nuova. */
export function markMilestone(name: string): boolean {
  if (typeof window === "undefined") return false;
  return setMilestone(name);
}

/** Evento inviato al massimo una volta al giorno. */
export function trackOncePerDay(name: ProductEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;
  if (!setMilestone(`${name}:${localDayKey()}`)) return;
  trackEvent(name, props);
}

/**
 * Da chiamare quando un utente con dieta caricata apre l'app.
 * Registra il giorno attivo e, al raggiungimento della soglia, la milestone `retained`.
 */
export function recordActiveDay(): void {
  if (typeof window === "undefined") return;
  const today = localDayKey();
  const days = readActiveDays();
  if (days.includes(today)) return;
  days.push(today);
  safeSet(ACTIVE_DAYS_KEY, JSON.stringify(days.slice(-MAX_ACTIVE_DAYS_STORED)));

  trackEvent("app_active_day", { activeDays: days.length });

  const firstSeen = ensureFirstSeen();
  const inWindow = days.filter(
    (d) => daysBetween(firstSeen, d) < RETENTION_WINDOW_DAYS,
  ).length;
  if (inWindow >= RETENTION_MIN_ACTIVE_DAYS) {
    trackOnce("retained", { activeDays: inWindow });
  }
}

/** Categoria del file caricato, senza nome né contenuto. */
export function fileKind(mime: string): string {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("text/")) return "text";
  return "other";
}

/** Link di condivisione con UTM, per attribuire i nuovi arrivi al canale di referral. */
export function referralUrl(source: string): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: "share",
    utm_campaign: "referral",
  });
  return `https://pocketdiet.app/?${params.toString()}`;
}
