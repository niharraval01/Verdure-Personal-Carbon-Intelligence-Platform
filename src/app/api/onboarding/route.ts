/**
 * Onboarding API — DEMO MODE (calculates emissions, no DB save)
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { carbonInputSchema } from "@/lib/validation/onboarding";
import { calculateTotalEmissions } from "@/features/carbon-engine";
import { calculateCarbonScore } from "@/features/carbon-score";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parseResult = carbonInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const input = parseResult.data;
    const result = calculateTotalEmissions(input);
    const score = calculateCarbonScore(result.kgCO2ePerYear);

    // In demo mode we don't save to DB — just return the calculated result
    return NextResponse.json({
      success: true,
      score: score.score,
      label: score.label,
      kgCO2ePerYear: result.kgCO2ePerYear,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
