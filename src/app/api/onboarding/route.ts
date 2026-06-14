/**
 * Onboarding API Route
 *
 * Server-side handler for onboarding form submission.
 * Validates input with Zod, calculates emissions, saves to DB.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { carbonInputSchema } from "@/lib/validation/onboarding";
import { calculateTotalEmissions } from "@/features/carbon-engine";
import { calculateCarbonScore } from "@/features/carbon-score";
import { generateRecommendations } from "@/features/recommendations";

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate input
    const body: unknown = await request.json();
    const parseResult = carbonInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Calculate emissions using pure engine
    const result = calculateTotalEmissions(input);
    const score = calculateCarbonScore(result.kgCO2ePerYear);
    const recommendations = generateRecommendations(input, result);

    // Save to database in a transaction
    await prisma.$transaction(async (tx) => {
      // Save footprint
      await tx.carbonFootprint.create({
        data: {
          userId: session.user.id,
          inputData: input as any,
          result: result as any,
          score: score.score,
          scoreLabel: score.label,
        },
      });

      // Save personalized recommendations
      const recommendationData = recommendations.map((rec) => ({
        userId: session.user.id,
        recommendationId: rec.id,
        category: rec.category,
        title: rec.title,
        impactKg: rec.impactKgCO2ePerYear,
      }));

      // Delete old recommendations before inserting new ones
      await tx.userRecommendation.deleteMany({
        where: { userId: session.user.id },
      });

      await tx.userRecommendation.createMany({
        data: recommendationData,
      });
    });

    return NextResponse.json({
      success: true,
      score: score.score,
      label: score.label,
      kgCO2ePerYear: result.kgCO2ePerYear,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
