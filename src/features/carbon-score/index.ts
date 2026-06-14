/**
 * Carbon Score — Public API
 */
export type { CarbonScore, ScoreLabel, ScoreThreshold } from "./types";
export {
  calculateCarbonScore,
  getScoreLabel,
  getScoreThreshold,
  SCORE_THRESHOLDS,
} from "./calculate";
