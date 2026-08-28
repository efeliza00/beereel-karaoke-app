import { prisma } from "@/lib/prisma";

export type TrendingSong = {
  title: string;
  count: number;
  videoId: string;
  thumbnail?: string;
};

export type Stats = {
  songsInCell: number;
  honeyGifts: number;
  honeyDrops: number;
  totalHives: number;
  trendingSongs: TrendingSong[];
};

export async function getStats(): Promise<Stats> {
  const [rooms, gifts] = await Promise.all([
    prisma.roomState.findMany({ select: { queue: true, history: true } }),
    prisma.gift.aggregate({ _count: true, _sum: { amount: true } }),
  ]);

  const songsInCell = (rooms as { queue?: unknown }[]).reduce<number>(
    (total, room) =>
      total + (Array.isArray(room?.queue) ? room.queue.length : 0),
    0,
  );

  const songCounts: Record<string, TrendingSong> = {};

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

  return {
    songsInCell,
    honeyGifts: gifts._count ?? 0,
    honeyDrops: gifts._sum.amount ?? 0,
    totalHives: rooms.length,
    trendingSongs,
  };
}
