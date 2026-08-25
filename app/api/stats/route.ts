import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rooms, gifts] = await Promise.all([
      prisma.roomState.findMany({ select: { queue: true } }),
      prisma.gift.aggregate({ _count: true, _sum: { amount: true } }),
    ]);

    const songsInCell = (rooms as { queue?: unknown }[]).reduce<number>(
      (total, room) =>
        total + (Array.isArray(room?.queue) ? room.queue.length : 0),
      0,
    );

    return NextResponse.json({
      songsInCell,
      honeyGifts: gifts._count ?? 0,
      honeyDrops: gifts._sum.amount ?? 0,
    });
  } catch (error) {
    console.error("Failed to load stats", error);
    return NextResponse.json(
      { songsInCell: 0, honeyGifts: 0, honeyDrops: 0 },
      { status: 200 },
    );
  }
}
