/**
 * Carbon Score — Calculation
 *
 * Deterministic scoring formula that converts raw kg CO₂e/year
 * into a 0–100 score with labels.
 *
 * PURE FUNCTION — no dependencies on DB, network, or framework.
 *
 * ═══════════════════════════════════════════════════════════════
 * FORMULA:
 *   score = max(0, min(100, round(100 × (1 - userKg / (2 × globalAvgKg)))))
 *
 * WHERE:
 *   globalAvgKg = 4,800 (global avg ~4.8 tCO₂e/year, Our World in Data)
 *   denominator = 2 × 4,800 = 9,600
 *
 * RATIONALE:
 *   - At 0 kg:     score = 100 (perfect)
 *   - At 4,800 kg: score = 50  (global average = midpoint)
 *   - At 9,600 kg: score = 0   (2× global average = worst)
 *   - Above 9,600: clamped to 0
 *
 * This linear normalization ensures:
 *   1. The score is intuitive (higher = better)
 *   2. The global average falls at the midpoint
 *   3. There's room for improvement in both directions
 *   4. The formula is deterministic and reproducible
 * ═══════════════════════════════════════════════════════════════
 *
 * SCORE LABELS:
 *   90–100: Excellent  (well below global average)
 *   70–89:  Good       (below global average)
 *   50–69:  Average    (near global average)
 *   0–49:   Needs Improvement (above global average)
 */

import type { CarbonScore, ScoreLabel, ScoreThreshold } from "./types";
import {
  GLOBAL_AVG_KG_CO2E_PER_YEAR,
  INDIA_AVG_KG_CO2E_PER_YEAR,
} from "../carbon-engine/emission-factors";

/**
 * Score thresholds with labels, colors, and descriptions.
 * Used by UI components for rendering score cards.
 */
export const SCORE_THRESHOLDS: readonly ScoreThreshold[] = [
  {
    min: 90,
    max: 100,
    label: "excellent",
    color: "var(--score-excellent)",
    description: "Outstanding! Your footprint is well below the global average.",
  },
  {
    min: 70,
    max: 89,
    label: "good",
    color: "var(--score-good)",
    description: "Great job! You're below the global average carbon footprint.",
  },
  {
    min: 50,
    max: 69,
    label: "average",
    color: "var(--score-average)",
    description: "You're near the global average. Room for meaningful improvement.",
  },
  {
    min: 0,
    max: 49,
    label: "needs-improvement",
    color: "var(--score-poor)",
    description: "Your footprint is above the global average. Let's find ways to reduce it.",
  },
] as const;

/**
 * Calculate the carbon score from raw emissions.
 *
 * @param kgCO2ePerYear - Total annual emissions in kg CO₂e
 * @returns CarbonScore with score, label, and comparison metrics
 */
export function calculateCarbonScore(kgCO2ePerYear: number): CarbonScore {
  // Clamp input to non-negative
  const clampedKg = Math.max(0, kgCO2ePerYear);

  // Apply scoring formula: score = 100 × (1 - userKg / (2 × globalAvg))
  const denominator = 2 * GLOBAL_AVG_KG_CO2E_PER_YEAR;
  const rawScore = 100 * (1 - clampedKg / denominator);
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Determine label from thresholds
  const label = getScoreLabel(score);

  // Calculate percentile comparisons
  // Negative = user is below (better than) average
  // Positive = user is above (worse than) average
  const percentileVsGlobal = ((clampedKg - GLOBAL_AVG_KG_CO2E_PER_YEAR) / GLOBAL_AVG_KG_CO2E_PER_YEAR) * 100;
  const percentileVsIndia = ((clampedKg - INDIA_AVG_KG_CO2E_PER_YEAR) / INDIA_AVG_KG_CO2E_PER_YEAR) * 100;

  return {
    score,
    label,
    kgCO2ePerYear: clampedKg,
    percentileVsGlobal: Math.round(percentileVsGlobal * 10) / 10,
    percentileVsIndia: Math.round(percentileVsIndia * 10) / 10,
  };
}

/**
 * Get the score label for a given numeric score.
 */
export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "average";
  return "needs-improvement";
}

/**
 * Get the threshold definition for a given score.
 */
export function getScoreThreshold(score: number): ScoreThreshold {
  const threshold = SCORE_THRESHOLDS.find(
    (t) => score >= t.min && score <= t.max
  );
  // This should never happen with valid thresholds, but TypeScript needs the fallback
  return threshold ?? SCORE_THRESHOLDS[SCORE_THRESHOLDS.length - 1]!;
}
