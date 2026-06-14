/**
 * Recommendations Toggle API Route
 *
 * Marks a recommendation as complete or incomplete.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const toggleSchema = z.object({
  id: z.string().min(1),
  isCompleted: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parseResult = toggleSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { id, isCompleted } = parseResult.data;

    // Ensure the recommendation belongs to this user
    const recommendation = await prisma.userRecommendation.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    await prisma.userRecommendation.update({
      where: { id },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle recommendation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
