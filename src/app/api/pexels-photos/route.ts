import { NextResponse } from "next/server";

const PEXELS_API = "https://api.pexels.com/v1/search";

/** Risposta Pexels: `original` = massima qualità (ideale per sfondo fullscreen). */
interface PexelsPhoto {
  src: {
    original?: string;
    large2x?: string;
    large?: string;
    landscape?: string;
    portrait?: string;
  };
}
interface PexelsResponse {
  photos: PexelsPhoto[];
}

/**
 * GET /api/pexels-photos?query=healthy+food&per_page=15&purpose=background|card
 * - `purpose=background`: URL `src.original` (massima qualità) per sfondo fullscreen.
 * - `purpose=card` o omesso: `large2x` / `large` (card value prop).
 * Richiede PEXELS_API_KEY in .env.local
 */
export async function GET(request: Request) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PEXELS_API_KEY non configurata" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "healthy food colorful";
  const perPage = Math.min(
    30,
    Math.max(5, parseInt(searchParams.get("per_page") ?? "15", 10) || 15)
  );
  const page =
    Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  /** `background` = URL originali (massima qualità) per cover desktop; default = card / thumb. */
  const purpose = searchParams.get("purpose") ?? "";

  try {
    const url = new URL(PEXELS_API);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));

    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Pexels API error", details: text },
        { status: res.status }
      );
    }

    const data = (await res.json()) as PexelsResponse;
    const urls = (data.photos ?? [])
      .map((p) => {
        const s = p.src;
        if (!s) return "";
        if (purpose === "background") {
          return (
            s.original ||
            s.large2x ||
            s.landscape ||
            s.large ||
            s.portrait ||
            ""
          );
        }
        return (
          s.large2x ||
          s.large ||
          s.landscape ||
          s.portrait ||
          s.original ||
          ""
        );
      })
      .filter(Boolean);

    return NextResponse.json({ urls });
  } catch (e) {
    console.error("Pexels fetch error:", e);
    return NextResponse.json(
      { error: "Errore nel recupero delle immagini" },
      { status: 500 }
    );
  }
}
