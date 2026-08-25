import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      amount?: number;
      message?: string;
    };

    const amount =
      typeof body.amount === "number" && body.amount > 0
        ? Math.min(Math.floor(body.amount), 1000)
        : 1;

    const gift = await prisma.gift.create({
      data: {
        amount,
        message:
          typeof body.message === "string" && body.message.trim()
            ? body.message.trim().slice(0, 200)
            : null,
      },
    });

    return NextResponse.json({ ok: true, gift });
  } catch (error) {
    console.error("Failed to record gift", error);
    return NextResponse.json({ error: "Gift failed" }, { status: 500 });
  }
}
