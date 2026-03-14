import { NextResponse } from "next/server";

const PEXELS_API = "https://api.pexels.com/v1/search";

/** Risposta Pexels: array di foto con src.landscape / large2x */
interface PexelsPhoto {
  src: { landscape: string; large2x: string; original: string };
}
interface PexelsResponse {
  photos: PexelsPhoto[];
}

/**
 * GET /api/pexels-photos?query=food&per_page=15
 * Restituisce URL di immagini da Pexels (tema food). Richiede PEXELS_API_KEY in .env.local
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
  const query = searchParams.get("query") ?? "food";
  const perPage = Math.min(
    30,
    Math.max(5, parseInt(searchParams.get("per_page") ?? "15", 10) || 15)
  );
  const page =
    Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

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
      .map((p) => p.src?.landscape || p.src?.large2x || p.src?.original)
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
