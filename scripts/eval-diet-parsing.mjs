#!/usr/bin/env node
/**
 * Test di lettura delle diete su una cartella di file reali (PDF, TXT, immagini).
 *
 * Uso:
 *   node --experimental-strip-types scripts/eval-diet-parsing.mjs <cartella> [--api http://localhost:3000]
 *
 * Per ogni file:
 *  1. controlli locali, senza AI (solo PDF/TXT): testo estratto, pasti e grammature trovati,
 *     esito di `looksLikeDiet` (lo stesso pre-controllo del server);
 *  2. con `--api`, invia il file a /api/parse-diet di un'istanza in esecuzione (stessa pipeline
 *     di produzione: classificatore, AI, normalizzazione) e riassume il risultato.
 *
 * Alla fine stampa il tasso di successo. I file restano locali: non vanno messi nel repository
 * (sono documenti di terzi o dati di salute).
 *
 * Richiede Node >= 22.6 (per importare il modulo TypeScript condiviso con il server).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { looksLikeDiet, tidyPdfText } from "../src/utils/looksLikeDiet.ts";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse/lib/pdf-parse.js");

const MIME = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};
const MEALS = ["colazione", "pranzo", "cena", "spuntino", "merenda"];

function parseArgs(argv) {
  const args = { dir: null, api: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--api") args.api = argv[++i];
    else if (!args.dir) args.dir = argv[i];
  }
  return args;
}

async function extractText(file, mime) {
  const buf = fs.readFileSync(file);
  if (mime === "application/pdf") return tidyPdfText((await pdf(buf)).text);
  if (mime === "text/plain") return buf.toString("utf-8");
  return null; // immagini: solo via API
}

function localChecks(text) {
  if (text == null) return { local: "n/a (immagine)" };
  const t = text.toLowerCase();
  const meals = MEALS.filter((m) => t.includes(m));
  const grams = t.match(/\d+(?:[.,]\d+)?\s?(?:g|gr|grammi|ml)\b/g)?.length ?? 0;
  return {
    chars: text.length,
    meals: meals.length,
    grams,
    looksLikeDiet: looksLikeDiet(text),
  };
}

function summarizeDiet(data) {
  const menus = data?.dailyMenus ?? [];
  const has = (k) => menus.some((m) => m[k]);
  const dd = data?.dietData;
  const altCount = dd
    ? [
        ...Object.values(dd.colazione ?? {}),
        dd.spuntinoMattutino,
        ...Object.values(dd.pranzo ?? {}),
        dd.merenda,
        ...Object.values(dd.cena ?? {}),
      ]
        .filter(Array.isArray)
        .reduce((n, a) => n + a.length, 0)
    : 0;
  return {
    menus: menus.length,
    weekdays: menus.filter((m) => m.weekday).length,
    meals: ["colazione", "spuntinoMattutino", "pranzo", "merenda", "cena"]
      .filter(has)
      .map((k) => k.slice(0, 3))
      .join(","),
    alternatives: altCount,
  };
}

async function callApi(api, file, mime) {
  const form = new FormData();
  form.append(
    "file",
    new Blob([fs.readFileSync(file)], { type: mime }),
    path.basename(file),
  );
  const started = Date.now();
  const res = await fetch(new URL("/api/parse-diet", api), { method: "POST", body: form });
  const seconds = Math.round((Date.now() - started) / 100) / 10;
  let json = {};
  try {
    json = await res.json();
  } catch {
    /* risposta non JSON */
  }
  if (!res.ok || !json.success) {
    return { ok: false, seconds, error: json.code ?? `http_${res.status}`, message: json.error };
  }
  return { ok: true, seconds, ...summarizeDiet(json.data) };
}

async function main() {
  const { dir, api } = parseArgs(process.argv.slice(2));
  if (!dir || !fs.existsSync(dir)) {
    console.error(
      "Uso: node --experimental-strip-types scripts/eval-diet-parsing.mjs <cartella> [--api http://localhost:3000]",
    );
    process.exit(1);
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => MIME[path.extname(f).toLowerCase()])
    .sort();
  if (files.length === 0) {
    console.error("Nessun file PDF/TXT/immagine nella cartella.");
    process.exit(1);
  }

  const rows = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const mime = MIME[path.extname(f).toLowerCase()];
    const row = { file: f };
    try {
      Object.assign(row, localChecks(await extractText(full, mime)));
    } catch (e) {
      row.local = `errore estrazione: ${e.message}`;
    }
    if (api) {
      try {
        Object.assign(row, await callApi(api, full, mime));
      } catch (e) {
        Object.assign(row, { ok: false, error: `rete: ${e.message}` });
      }
    }
    rows.push(row);
    console.log(JSON.stringify(row));
  }

  console.log("");
  console.table(rows);
  const local = rows.filter((r) => typeof r.looksLikeDiet === "boolean");
  if (local.length) {
    const pass = local.filter((r) => r.looksLikeDiet).length;
    console.log(`Pre-controllo locale: ${pass}/${local.length} riconosciute come dieta`);
  }
  if (api) {
    const ok = rows.filter((r) => r.ok).length;
    console.log(`Lettura completa via API: ${ok}/${rows.length} riuscite (${Math.round((ok / rows.length) * 100)}%)`);
  } else {
    console.log("Suggerimento: aggiungi --api http://localhost:3000 (con OPENAI_API_KEY) per il test completo.");
  }
}

main();
