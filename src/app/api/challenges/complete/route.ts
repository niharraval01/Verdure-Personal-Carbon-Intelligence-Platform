import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const completeSchema = z.object({ challengeId: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const body: unknown = await request.json();
    const parsed = completeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    await prisma.challengeEntry.updateMany({
      where: {
        userId: session.user.id,
        challengeId: parsed.data.challengeId,
      },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Complete challenge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
