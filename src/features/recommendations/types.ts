/**
 * Recommendations — Type Contracts
 */

export type RecommendationCategory = "transport" | "energy" | "lifestyle";
export type Difficulty = "easy" | "medium" | "hard";

export interface Recommendation {
  /** Unique identifier for this recommendation template */
  id: string;
  /** Which emission category this addresses */
  category: RecommendationCategory;
  /** Short actionable title */
  title: string;
  /** Detailed description with specific advice */
  description: string;
  /** Estimated annual CO₂e reduction in kg */
  impactKgCO2ePerYear: number;
  /** How hard is this to implement */
  difficulty: Difficulty;
  /** Whether this recommendation also saves money */
  costSaving: boolean;
}
