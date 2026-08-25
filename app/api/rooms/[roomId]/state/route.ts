import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

type Snapshot = {
  queue?: unknown[];
  history?: unknown[];
  currentSong?: unknown;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    if (!roomId || roomId.length > 64) {
      return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
    }

    const state = await prisma.roomState.findUnique({
      where: { id: roomId.toUpperCase() },
    });

    if (!state) {
      return NextResponse.json({ queue: [], history: [], currentSong: null });
    }

    return NextResponse.json({
      queue: state.queue,
      history: state.history,
      currentSong: state.currentSong,
    });
  } catch (error) {
    console.error("Failed to load room state", error);
    return NextResponse.json(
      { error: "Load failed" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    const body = (await request.json()) as Snapshot;

    if (!roomId || roomId.length > 64) {
      return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
    }

    const id = roomId.toUpperCase();
    const queue = (body.queue ?? []) as Prisma.InputJsonValue;
    const history = (body.history ?? []) as Prisma.InputJsonValue;
    const currentSong: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput =
      body.currentSong == null
        ? Prisma.JsonNull
        : (body.currentSong as Prisma.InputJsonValue);

    await prisma.roomState.upsert({
      where: { id },
      update: { queue, history, currentSong },
      create: { id, queue, history, currentSong },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save room state", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
