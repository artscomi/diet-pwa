import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdf from "pdf-parse";
import type { DietData, DailyMenu } from "@/types/diet";
import { isAllowedMime, MAX_UPLOAD_BYTES } from "@/constants/upload";

/** Modello OpenAI per vision + estrazione JSON (immagini e testo). */
const PARSE_MODEL = "gpt-4o";

const CLASSIFY_PROMPT = `L'utente ha fornito un contenuto (testo o immagine). Il contenuto descrive chiaramente una DIETA o un PIANO ALIMENTARE con pasti (colazione, pranzo, cena, spuntini) e quantità di alimenti (grammi, porzioni)?

Rispondi SOLO con un JSON valido, nient'altro:
- Se SÌ (è una dieta/piano con pasti e quantità): {"isDiet": true}
- Se NO (meme, fattura, lista della spesa generica, foto non pertinente, testo senza menu): {"isDiet": false}`;

const DIET_JSON_PROMPT = `Sei un assistente che estrae informazioni su diete e menu DAL TESTO/CONTENUTO FORNITO DALL'UTENTE.

REGOLA FONDAMENTALE: Se il contenuto NON descrive chiaramente una dieta o un piano alimentare con pasti (colazione, pranzo, cena, ecc.) e quantità di alimenti, NON inventare nulla. Restituisci SOLO: {"error":"not_a_diet"}

Se invece il contenuto È una dieta/menu:
- Usa SOLO gli alimenti e le quantità presenti nel contenuto. Non inventare menu generici né copiare esempi: estrai esattamente ciò che è scritto nel file.
- Restituisci SOLO un oggetto JSON valido, senza testo prima o dopo, senza markdown o blocchi di codice.
- Lo schema deve essere esattamente:

{
  "dailyMenus": [
    {
      "id": "menu-1",
      "name": "Menu Giorno 1",
      "colazione": {
        "carboidrati": { "name": "...", "quantity": numero, "unit": "g" },
        "frutta": { "name": "...", "quantity": numero, "unit": "g" },
        "proteine": { "name": "...", "quantity": numero, "unit": "g" }
      },
      "spuntinoMattutino": { "name": "...", "quantity": numero, "unit": "g" },
      "pranzo": {
        "carboidrati": { "name": "...", "quantity": numero, "unit": "g" },
        "proteine": { "name": "...", "quantity": numero, "unit": "g" },
        "verdure": { "name": "...", "quantity": numero, "unit": "g" }
      },
      "merenda": { "name": "...", "quantity": numero, "unit": "g" },
      "cena": {
        "pane": { "name": "...", "quantity": numero, "unit": "g" },
        "verdure": { "name": "...", "quantity": numero, "unit": "g" },
        "proteine": { "name": "...", "quantity": numero, "unit": "g" }
      },
      "olio": { "name": "Olio di oliva extra vergine", "quantity": 20, "unit": "g" }
    }
  ]
}

Per ogni giorno/menu presente nel contenuto dell'utente, crea un elemento in dailyMenus. Copia i nomi degli alimenti e le quantità DAL TESTO (es. "Pasta integrale 70g" -> name: "Pasta integrale", quantity: 70, unit: "g"). Se un pasto non è specificato nel testo, usa un valore ragionevole basato sul contesto. Restituisci SOLO il JSON.`;

interface ParseResult {
  dailyMenus?: DailyMenu[];
  dietData?: DietData;
  error?: string;
}

function extractJsonFromText(text: string): ParseResult {
  const trimmed = text.trim();

  // Prima prova: assumiamo che il modello abbia restituito direttamente un JSON valido
  try {
    return JSON.parse(trimmed) as ParseResult;
  } catch {
    // Fallback: estraiamo eventuale blocco ```json``` dal testo
    const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    const toParse = jsonMatch ? jsonMatch[1].trim() : trimmed;
    return JSON.parse(toParse) as ParseResult;
  }
}

async function classifyIsDiet(
  openai: OpenAI,
  mime: string,
  imageBase64: string | null,
  textContent: string | null,
): Promise<boolean> {
  if (imageBase64) {
    const res = await openai.chat.completions.create({
      model: PARSE_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: CLASSIFY_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:${mime};base64,${imageBase64}` },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });
    const raw = res.choices[0]?.message?.content;
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw) as { isDiet?: boolean };
      return parsed.isDiet === true;
    } catch {
      return false;
    }
  }
  const text = (textContent ?? "").trim();
  if (!text) return false;
  const res = await openai.chat.completions.create({
    model: PARSE_MODEL,
    messages: [
      { role: "system", content: CLASSIFY_PROMPT },
      { role: "user", content: text.slice(0, 15000) },
    ],
    response_format: { type: "json_object" },
    max_tokens: 100,
  });
  const raw = res.choices[0]?.message?.content;
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { isDiet?: boolean };
    return parsed.isDiet === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY non configurata" },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Nessun file caricato" },
        { status: 400 },
      );
    }

    const mime = file.type || "";
    if (!isAllowedMime(mime)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tipo di file non supportato. Usa PDF, TXT o immagini (JPG, PNG, WebP).",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File troppo grande. Dimensione massima: ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
        },
        { status: 400 },
      );
    }

    let textContent: string | null = null;
    let imageBase64: string | null = null;

    if (mime.startsWith("image/")) {
      imageBase64 = buffer.toString("base64");
    } else if (mime === "application/pdf") {
      const data = await pdf(buffer);
      textContent = data.text;
    } else {
      textContent = buffer.toString("utf-8");
    }

    const openai = new OpenAI({ apiKey });

    const NOT_A_DIET_MESSAGE =
      "Il file non sembra contenere una dieta o un piano alimentare con pasti e quantità. Carica un documento o un'immagine con il menu (colazione, pranzo, cena, ecc.) e le quantità in grammi.";

    const isDiet = await classifyIsDiet(
      openai,
      mime,
      imageBase64,
      textContent,
    );
    if (!isDiet) {
      return NextResponse.json(
        { success: false, error: NOT_A_DIET_MESSAGE },
        { status: 400 },
      );
    }

    let result: ParseResult;

    if (imageBase64) {
      const response = await openai.chat.completions.create({
        model: PARSE_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: DIET_JSON_PROMPT },
              {
                type: "image_url",
                image_url: { url: `data:${mime};base64,${imageBase64}` },
              },
            ],
          },
        ],
        // Chiediamo esplicitamente un JSON valido
        response_format: { type: "json_object" },
        max_tokens: 4096,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Risposta OpenAI vuota");
      }

      try {
        result = extractJsonFromText(content) as ParseResult;
      } catch (parseErr) {
        console.error("parse-diet image JSON parse error:", parseErr);
        return NextResponse.json(
          {
            success: false,
            error:
              "Non riesco a leggere correttamente questa immagine. Prova a caricare la dieta in PDF o testo, oppure ritaglia l’immagine su 1–2 giorni alla volta.",
          },
          { status: 400 },
        );
      }
    } else {
      const contentToSend = textContent ?? "";
      if (!contentToSend.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Il file è vuoto o non è stato possibile estrarre testo",
          },
          { status: 400 },
        );
      }
      const response = await openai.chat.completions.create({
        model: PARSE_MODEL,
        messages: [
          { role: "system", content: DIET_JSON_PROMPT },
          { role: "user", content: contentToSend },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4096,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Risposta OpenAI vuota");
      result = extractJsonFromText(content) as ParseResult;
    }

    if (result.error === "not_a_diet") {
      return NextResponse.json(
        { success: false, error: NOT_A_DIET_MESSAGE },
        { status: 400 },
      );
    }

    if (
      !result.dailyMenus ||
      !Array.isArray(result.dailyMenus) ||
      result.dailyMenus.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OpenAI non ha restituito una lista di menu valida. Riprova con un file che descriva chiaramente la dieta.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("parse-diet error:", err);

    let message: string;
    if (
      err instanceof SyntaxError ||
      (err instanceof Error && /Unexpected token/.test(err.message))
    ) {
      message =
        "Non riesco a leggere questo file come dieta. Carica un PDF o un TXT con il testo della tua dieta.";
    } else if (err instanceof OpenAI.APIError) {
      if (err.status === 401 || err.status === 403) {
        message =
          "C’è un problema con la configurazione del servizio di analisi. Riprova più tardi.";
      } else if (err.status === 429) {
        message =
          "Il servizio di analisi ha ricevuto troppe richieste in questo momento. Riprova tra qualche minuto.";
      } else if (err.status && err.status >= 500) {
        message =
          "Il servizio esterno che elabora la dieta sta avendo dei problemi. Riprova più tardi.";
      } else {
        message =
          "Si è verificato un errore durante la richiesta al servizio di analisi della dieta. Riprova più tardi.";
      }
    } else {
      message =
        err instanceof Error
          ? "Si è verificato un errore imprevisto durante l’analisi del file. Riprova più tardi."
          : "Errore durante l'analisi del file";
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
