import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "SerpApi key not configured. Add SERPAPI_API_KEY to .env.local" },
      { status: 500 },
    );
  }

  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "youtube");
  url.searchParams.set("search_query", q);
  url.searchParams.set("api_key", apiKey);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `SerpApi responded with ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const results = ((data.video_results ?? []) as Record<string, unknown>[]).map(
      (v) => {
        const link = (v.link as string) ?? "";
        const videoId = link.match(/[?&]v=([^&]+)/)?.[1] ?? link;
        const rawThumb =
          typeof v.thumbnail === "string"
            ? v.thumbnail
            : ((v.thumbnail as Record<string, string> | undefined)?.static ??
              (v.thumbnail as Record<string, string> | undefined)?.rich ??
              "");
        return {
          videoId,
          title: (v.title as string) ?? "",
          thumbnail: rawThumb,
          channel:
            ((v.channel as Record<string, unknown> | undefined)?.name as string) ??
            "",
          length: (v.length as string) ?? "",
          views: (v.views as string) ?? "",
        };
      },
    );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Search request failed" }, { status: 502 });
  }
}
