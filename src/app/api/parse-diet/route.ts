import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdf from "pdf-parse";
import type { DietData, DailyMenu } from "@/types/diet";

/** Modello OpenAI per vision + estrazione JSON (immagini e testo). gpt-5.4 è il più avanzato con vision. */
const PARSE_MODEL = "gpt-4o";

const DIET_JSON_PROMPT = `Sei un assistente che estrae informazioni su diete e menu DAL TESTO/CONTENUTO FORNITO DALL'UTENTE.
IMPORTANTE: Usa SOLO gli alimenti e le quantità presenti nel contenuto. Non inventare menu generici né copiare esempi: estrai esattamente ciò che è scritto nel file.

Restituisci SOLO un oggetto JSON valido, senza testo prima o dopo, senza markdown o blocchi di codice.
Lo schema deve essere esattamente:

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
  dailyMenus: DailyMenu[];
  dietData?: DietData;
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

    const mime = file.type;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
        result = extractJsonFromText(content);
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
      result = extractJsonFromText(content);
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
