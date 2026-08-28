import { NextResponse } from "next/server";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats);
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
