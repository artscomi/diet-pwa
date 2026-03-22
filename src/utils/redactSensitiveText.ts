/**
 * Riduce i dati personali inviati a OpenAI prima del parsing dieta (testo da PDF/TXT).
 * Non sostituisce il consenso dell’utente né la valutazione privacy: è un filtro euristico.
 */

/** Se la riga sembra già parte del menu (alimenti, quantità), non applicare redazione “per etichetta”. */
function lineLooksLikeMenuContent(line: string): boolean {
  return /(\d+[\s,.]?\d*\s*(g|gr\.?|gramm|ml|kcal|mg)\b|colazione|pranzo|cena|merenda|spuntino|proteine|carboidrati|verdure?|frutta|olio|pane|pasto)/i.test(
    line,
  );
}

const LINE_REDACT: RegExp[] = [
  /^\s*(paziente|assistito|intestatario)\s*[:.;]\s*.+$/i,
  /^\s*codice\s+fiscale\s*[:.;]\s*.+$/i,
  /^\s*c\.?\s*f\.?\s*[:.;]\s*.+$/i,
  /^\s*partita\s+iva\s*[:.;]\s*.+$/i,
  /^\s*p\.?\s*iva\s*[:.;]\s*.+$/i,
  /^\s*(indirizzo|residenza|domicilio|sede\s+legale)\s*[:.;]\s*.+$/i,
  /^\s*(telefono|tel\.|cell\.?|cellulare|fax)\s*[:.;]\s*.+$/i,
  /^\s*e[\s-]?mail\s*[:.;]\s*.+$/i,
  /^\s*(pec)\s*[:.;]\s*.+$/i,
  /^\s*(data\s+di\s+nascita|nato\s+il|nata\s+il|luogo\s+di\s+nascita|età|eta)\s*[:.;]\s*.+$/i,
  /^\s*(medico\s+curante|nutrizionista|referente)\s*[:.;]\s*.+$/i,
  /^\s*(codice\s+sanitario|tessera\s+sanitaria|numero\s+iscrizione)\s*[:.;]\s*.+$/i,
];

function redactLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return line;

  if (lineLooksLikeMenuContent(line)) return line;

  if (
    /^\s*nome\s*[:.;]\s*\S+/i.test(line) &&
    line.length < 120
  ) {
    return "[riga omessa]";
  }
  if (
    /^\s*cognome\s*[:.;]\s*\S+/i.test(line) &&
    line.length < 120
  ) {
    return "[riga omessa]";
  }

  for (const re of LINE_REDACT) {
    if (re.test(line)) return "[riga omessa]";
  }
  return line;
}

/**
 * Applica redazioni su tutto il testo: pattern inline (email, CF, telefoni, IBAN, carte) + righe con etichette anagrafiche.
 */
export function redactSensitiveTextForOpenAI(text: string): string {
  if (!text || !text.trim()) return text;

  let t = text;

  t = t.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[email omessa]",
  );

  t = t.replace(/\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi, "[CF omesso]");

  t = t.replace(/\bIT\d{2}[A-Z0-9]{1}\d{10}[A-Z0-9]{12}\b/gi, "[IBAN omesso]");

  t = t.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, "[numero omesso]");

  t = t.replace(/(?:\+39\s*)?3\d{9}\b/g, "[tel. omesso]");
  t = t.replace(
    /(?:\+39\s*)?3\d{2}[\s.-]\d{3}[\s.-]\d{4}\b/g,
    "[tel. omesso]",
  );
  t = t.replace(
    /(?:\+39\s*)?0\d{1,3}[\s./]?\d{5,7}(?:[\s./]?\d{1,4})?\b/g,
    "[tel. omesso]",
  );

  t = t
    .split(/\r?\n/)
    .map((line) => redactLine(line))
    .join("\n");

  return t.replace(/\n{3,}/g, "\n\n").trim();
}
