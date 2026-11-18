import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdf from "pdf-parse";
import type { DietData, DailyMenu } from "@/types/diet";
import { isAllowedMime, MAX_UPLOAD_BYTES } from "@/constants/upload";
import { normalizeDietPayload } from "@/utils/normalizeDietPayload";
import { looksLikeDiet, tidyPdfText } from "@/utils/looksLikeDiet";

/** Modello OpenAI per vision + estrazione JSON (immagini e testo). */
const PARSE_MODEL = "gpt-4o";

const CLASSIFY_PROMPT = `L'utente ha fornito un contenuto (testo o immagine). Il contenuto descrive chiaramente una DIETA o un PIANO ALIMENTARE con pasti (colazione, pranzo, cena, spuntini) e quantità di alimenti (grammi, porzioni)?

Rispondi SOLO con un JSON valido, nient'altro:
- Se SÌ (è una dieta/piano con pasti e quantità): {"isDiet": true}
- Se NO (meme, fattura, lista della spesa generica, foto non pertinente, testo senza menu): {"isDiet": false}`;

const DIET_JSON_PROMPT = `Sei un assistente che estrae informazioni su diete e menu DAL TESTO/CONTENUTO FORNITO DALL'UTENTE.

REGOLA FONDAMENTALE: Se il contenuto NON descrive chiaramente una dieta o un piano alimentare con pasti (colazione, pranzo, cena, ecc.) e quantità di alimenti, NON inventare nulla. Restituisci SOLO: {"error":"not_a_diet"}

ATTENZIONE: molti nutrizionisti usano un MENU UNICO valido tutti i giorni, con per ogni pasto una "prima scelta" seguita da un elenco di alimenti alternativi con le rispettive grammature (tabelle di sostituzione, spesso su due colonne). Anche questo È una dieta: metti la prima scelta di ogni categoria in un unico elemento di dailyMenus e tutte le alternative in dietData. Ignora tabelle di valori nutrizionali (kcal, proteine %, lipidi…), intestazioni e piè di pagina.

Se invece il contenuto È una dieta/menu:
- Usa SOLO gli alimenti e le quantità presenti nel contenuto. Non inventare menu generici né copiare esempi: estrai esattamente ciò che è scritto nel file.
- Restituisci SOLO un oggetto JSON valido, senza testo prima o dopo, senza markdown o blocchi di codice.
- Lo schema deve essere esattamente:

{
  "dailyMenus": [
    {
      "id": "menu-1",
      "name": "Menu Giorno 1",
      "weekday": 1,
      "colazione": {
        "carboidrati": { "name": "...", "quantity": numero, "unit": "g" },
        "frutta": { "name": "...", "quantity": numero, "unit": "g" }
          OPPURE se nel documento sono indicate PIÙ frutta diverse per la stessa colazione (es. "mela o pera o kiwi" come alternative da acquistare tutte):
          [ { "name": "...", "quantity": numero, "unit": "g" }, ... ],
        "proteine": { "name": "...", "quantity": numero, "unit": "g" }
      },
      "spuntinoMattutino": { "name": "...", "quantity": numero, "unit": "g" },
      "pranzo": {
        "carboidrati": { "name": "...", "quantity": numero, "unit": "g" },
        "proteine": { "name": "...", "quantity": numero, "unit": "g" },
        "verdure": { "name": "...", "quantity": numero, "unit": "g" }
          OPPURE più verdure distinte (es. zucchine, carote, peperoni) come voci separate:
          [ { "name": "...", "quantity": numero, "unit": "g" }, ... ]
      },
      "merenda": { "name": "...", "quantity": numero, "unit": "g" },
      "cena": {
        "pane": { "name": "...", "quantity": numero, "unit": "g" },
        "verdure": { "name": "...", "quantity": numero, "unit": "g" }
          OPPURE array di verdure distinte come sopra,
        "proteine": { "name": "...", "quantity": numero, "unit": "g" }
      },
      "olio": { "name": "Olio di oliva extra vergine", "quantity": 20, "unit": "g" }
    }
  ],
  "dietData": {
    "colazione": {
      "carboidrati": [ { "name": "...", "quantity": numero, "unit": "g" } ],
      "frutta": [ { "name": "...", "quantity": numero, "unit": "g" } ],
      "proteine": [ { "name": "...", "quantity": numero, "unit": "g" } ]
    },
    "spuntinoMattutino": [ { "name": "...", "quantity": numero, "unit": "g" } ],
    "pranzo": {
      "carboidrati": [ { "name": "...", "quantity": numero, "unit": "g" } ],
      "proteine": [ { "name": "...", "quantity": numero, "unit": "g" } ],
      "verdure": [ { "name": "...", "quantity": numero, "unit": "g" } ]
    },
    "merenda": [ { "name": "...", "quantity": numero, "unit": "g" } ],
    "cena": {
      "pane": [ { "name": "...", "quantity": numero, "unit": "g" } ],
      "verdure": [ { "name": "...", "quantity": numero, "unit": "g" } ],
      "proteine": [ { "name": "...", "quantity": numero, "unit": "g" } ]
    },
    "olio": [ { "name": "...", "quantity": numero, "unit": "g" } ]
  }
}

REGOLE PER dailyMenus:
- Per ogni giorno/menu presente nel contenuto dell'utente, crea un elemento in dailyMenus.
- Copia i nomi degli alimenti e le quantità DAL TESTO (es. "Pasta integrale 70g" -> name: "Pasta integrale", quantity: 70, unit: "g").
- Se un pasto o un alimento NON è specificato nel testo, OMETTI quel campo (o l'intero pasto). Non inventare mai alimenti o quantità: l'utente deve vedere solo ciò che ha scritto il suo nutrizionista.
- "weekday": se il documento associa il menu a UN giorno della settimana, indica il numero (1 = lunedì, 2 = martedì, …, 7 = domenica). Se il menu vale per più giorni o non è associato a giorni della settimana (es. "Giorno 1", "Menu A"), ometti "weekday". Non duplicare i menu.
- "quantity" deve essere sempre un numero. Se il documento non indica una quantità (es. "a volontà", "q.b."), usa quantity 0 e unit "q.b.". Per i pezzi (es. "2 uova") usa unit "pz".
- "name": usa l'etichetta del documento (es. "Lunedì", "Giorno 1", "Menu A").
- Per "frutta" (colazione) e "verdure" (pranzo e cena): se il documento elenca PIÙ tipi da consumare insieme o da alternare come acquisti distinti (es. "200g verdure a scelta: zucchine, carote, melanzane"), usa un ARRAY di oggetti { name, quantity, unit } con UNA voce per ogni tipo e la quantità indicata o ripartita in modo sensato; NON unificare tutto in un solo nome generico "Verdure" o "Frutta" se i tipi sono specificati.

REGOLE PER dietData (IMPORTANTE):
- dietData contiene TUTTE le alternative possibili per ogni categoria, raccolte da TUTTO il documento.
- Includi ogni alimento unico menzionato nel documento per quella categoria (es. se il documento elenca "pollo OPPURE tacchino OPPURE pesce", mettili tutti come alternative in proteine).
- Includi anche gli alimenti usati nei dailyMenus.
- Se il documento contiene tabelle di sostituzione o liste di alternative, estraile tutte.
- Se il documento menziona un solo alimento per una categoria, metti solo quello. Se una categoria non compare nel documento, usa un array vuoto [].
- NON inventare alternative non presenti nel documento.

Restituisci SOLO il JSON.`;

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
      temperature: 0,
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
      temperature: 0,
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
      textContent = tidyPdfText(data.text);
    } else {
      textContent = buffer.toString("utf-8");
    }

    const openai = new OpenAI({ apiKey });

    const NOT_A_DIET_MESSAGE =
      "Il file non sembra contenere una dieta o un piano alimentare con pasti e quantità. Carica un documento o un'immagine con il menu (colazione, pranzo, cena, ecc.) e le quantità in grammi.";

    // Testo con pasti e grammature: è una dieta, non serve il classificatore AI.
    const isDiet =
      looksLikeDiet(textContent) ||
      (await classifyIsDiet(openai, mime, imageBase64, textContent));
    if (!isDiet) {
      console.warn("parse-diet: rifiutato dal classificatore");
      return NextResponse.json(
        { success: false, error: NOT_A_DIET_MESSAGE, code: "not_a_diet_classify" },
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
      temperature: 0,
        max_tokens: 16384,
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
      temperature: 0,
        max_tokens: 16384,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Risposta OpenAI vuota");
      if (response.choices[0]?.finish_reason === "length") {
        console.error("parse-diet: risposta troncata (max_tokens)");
        return NextResponse.json(
          {
            success: false,
            error:
              "La dieta è molto lunga e non siamo riusciti a leggerla tutta in una volta. Prova a caricare un file con meno pagine (es. solo il piano settimanale).",
          },
          { status: 400 },
        );
      }
      result = extractJsonFromText(content) as ParseResult;
    }

    if (result.error !== "not_a_diet") {
      result = normalizeDietPayload(result);
    }

    if (result.error === "not_a_diet") {
      return NextResponse.json(
        { success: false, error: NOT_A_DIET_MESSAGE, code: "not_a_diet_extract" },
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
