import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rooms, gifts, totalHives] = await Promise.all([
      prisma.roomState.findMany({ select: { queue: true, history: true } }),
      prisma.gift.aggregate({ _count: true, _sum: { amount: true } }),
      prisma.roomState.count(),
    ]);

    const songsInCell = (rooms as { queue?: unknown }[]).reduce<number>(
      (total, room) =>
        total + (Array.isArray(room?.queue) ? room.queue.length : 0),
      0,
    );

    // Aggregate most frequently played songs across all rooms
    const songCounts: Record<
      string,
      { title: string; count: number; videoId: string; thumbnail?: string }
    > = {};

    for (const room of rooms) {
      if (!Array.isArray(room.history)) continue;
      for (const song of room.history as Record<string, unknown>[]) {
        if (!song?.videoId) continue;
        const id = song.videoId as string;
        if (!songCounts[id]) {
          songCounts[id] = {
            title: (song.title as string) ?? "Unknown",
            count: 0,
            videoId: id,
            thumbnail: song.thumbnail as string | undefined,
          };
        }
        songCounts[id].count++;
      }
    }

    const trendingSongs = Object.values(songCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      songsInCell,
      honeyGifts: gifts._count ?? 0,
      honeyDrops: gifts._sum.amount ?? 0,
      totalHives: rooms.length,
      trendingSongs,
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
      { status: 200 },
    );
  }
}
