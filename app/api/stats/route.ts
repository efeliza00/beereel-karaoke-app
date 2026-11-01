import { NextResponse } from "next/server";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getStats();
    // getStats scans every room row; let the CDN share one result across
    // visitors instead of hitting the database on every 15s poll.
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Failed to load stats", error);
    return NextResponse.json(
      {
        songsInCell: 0,
        honeyGifts: 0,
        honeyDrops: 0,
        totalHives: 0,
        trendingSongs: [],
      },
      { status: 500 },
    );
  }
}
