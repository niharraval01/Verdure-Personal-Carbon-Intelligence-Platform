/**
 * Carbon Score — Type Contracts
 */

export type ScoreLabel = "excellent" | "good" | "average" | "needs-improvement";

export interface CarbonScore {
  /** Normalized score 0–100, higher = lower footprint */
  score: number;
  /** Human-readable label */
  label: ScoreLabel;
  /** User's total annual emissions in kg CO₂e */
  kgCO2ePerYear: number;
  /** Percentage comparison vs global average (negative = below avg, positive = above) */
  percentileVsGlobal: number;
  /** Percentage comparison vs India average */
  percentileVsIndia: number;
}

export interface ScoreThreshold {
  min: number;
  max: number;
  label: ScoreLabel;
  color: string;
  description: string;
}
