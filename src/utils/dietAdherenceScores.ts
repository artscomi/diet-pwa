const LS_KEY = "dietAdherenceScores";

/** Emesso dopo `clearAdherenceScores` così la UI aggiorna i cursori senza ricaricare. */
export const ADHERENCE_SCORES_CLEARED_EVENT = "pocketdiet-adherence-scores-cleared";

export function loadAdherenceScores(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (typeof o !== "object" || o === null) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function setAdherenceScore(dateKey: string, score: number): void {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const all = loadAdherenceScores();
  all[dateKey] = s;
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

/** Rimuove il voto del giorno dal report (es. nessun pasto ancora segnato). */
export function removeAdherenceScore(dateKey: string): void {
  const all = loadAdherenceScores();
  if (!(dateKey in all)) return;
  delete all[dateKey];
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

export function getAdherenceScore(dateKey: string): number | undefined {
  const v = loadAdherenceScores()[dateKey];
  return typeof v === "number" ? v : undefined;
}

export function clearAdherenceScores(): void {
  localStorage.removeItem(LS_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADHERENCE_SCORES_CLEARED_EVENT));
  }
}

export type AdherenceReportEntry = {
  dateKey: string;
  dateLabel: string;
  score: number;
};

export type AdherenceReport = {
  evaluatedDays: number;
  averagePercent: number;
  sortedEntries: AdherenceReportEntry[];
};

export function buildAdherenceReport(): AdherenceReport {
  const all = loadAdherenceScores();
  const entries: AdherenceReportEntry[] = Object.entries(all).map(
    ([dateKey, score]) => ({
      dateKey,
      dateLabel: new Date(dateKey).toLocaleDateString("it-IT", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      score: Math.round(Math.max(0, Math.min(100, score))),
    }),
  );
  entries.sort(
    (a, b) =>
      new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime(),
  );
  const n = entries.length;
  const sum = entries.reduce((acc, e) => acc + e.score, 0);
  const avg = n === 0 ? 0 : sum / n;
  return {
    evaluatedDays: n,
    averagePercent: Math.round(avg * 10) / 10,
    sortedEntries: entries,
  };
}

const SHARE_MAIL_SUBJECT = "Report rispetto dieta — PocketDiet";

export function formatAdherenceReportAsText(r: AdherenceReport): string {
  if (r.evaluatedDays === 0) {
    return "PocketDiet — Nessun punteggio registrato nel report.";
  }
  const lines = [
    "PocketDiet — Report rispetto dieta",
    "",
    `Giornate valutate: ${r.evaluatedDays}`,
    `Rispetto medio: ${r.averagePercent}%`,
    "",
    "Dettaglio per giorno:",
    ...r.sortedEntries.map((e) => `• ${e.dateLabel}: ${e.score}%`),
    "",
    "La percentuale per giorno deriva dal completamento pasti (completato, in parte, saltato).",
  ];
  return lines.join("\n");
}

export function getAdherenceShareMailtoUrl(body: string): string {
  const params = new URLSearchParams({
    subject: SHARE_MAIL_SUBJECT,
    body,
  });
  return `mailto:?${params.toString()}`;
}

export function getAdherenceShareWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
