import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const joinSchema = z.object({ challengeId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const body: unknown = await request.json();
    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    await prisma.challengeEntry.create({
      data: {
        userId: session.user.id,
        challengeId: parsed.data.challengeId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Join challenge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
