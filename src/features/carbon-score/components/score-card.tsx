"use client";

/**
 * Carbon Score Card Component
 *
 * Animated circular gauge showing the user's carbon score.
 * Color-coded by score label, with Framer Motion entrance animation.
 * Respects prefers-reduced-motion.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { CarbonScore } from "@/features/carbon-score";

interface ScoreCardProps {
  score: CarbonScore;
}

const SCORE_COLORS = {
  excellent: { stroke: "#059669", bg: "rgba(5, 150, 105, 0.1)" },
  good: { stroke: "#0d9488", bg: "rgba(13, 148, 136, 0.1)" },
  average: { stroke: "#d97706", bg: "rgba(217, 119, 6, 0.1)" },
  "needs-improvement": { stroke: "#dc2626", bg: "rgba(220, 38, 38, 0.1)" },
} as const;

const SCORE_LABELS: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  "needs-improvement": "Needs Improvement",
};

export function ScoreCard({ score }: ScoreCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const colors = SCORE_COLORS[score.label];
  const circumference = 2 * Math.PI * 54; // radius = 54
  const progress = (score.score / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  const comparisonText =
    score.percentileVsGlobal < 0
      ? `${Math.abs(score.percentileVsGlobal)}% below global average`
      : score.percentileVsGlobal > 0
      ? `${score.percentileVsGlobal}% above global average`
      : "At global average";

  return (
    <motion.div
      className="score-card"
      style={{ backgroundColor: colors.bg }}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="score-card__gauge">
        <svg
          width="140"
          height="140"
          viewBox="0 0 120 120"
          aria-label={`Carbon score: ${score.score} out of 100, rated ${SCORE_LABELS[score.label]}`}
          role="img"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            opacity="0.1"
          />
          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={shouldReduceMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            transform="rotate(-90 60 60)"
          />
          {/* Score text */}
          <text
            x="60"
            y="55"
            textAnchor="middle"
            className="score-card__score-text"
            fill={colors.stroke}
          >
            {score.score}
          </text>
          <text
            x="60"
            y="72"
            textAnchor="middle"
            className="score-card__label-text"
            fill="currentColor"
          >
            /100
          </text>
        </svg>
      </div>

      <div className="score-card__info">
        <h2 className="score-card__title" style={{ color: colors.stroke }}>
          {SCORE_LABELS[score.label]}
        </h2>
        <p className="score-card__emissions">
          {(score.kgCO2ePerYear / 1000).toFixed(1)} tonnes CO₂e/year
        </p>
        <p className="score-card__comparison">{comparisonText}</p>
      </div>
    </motion.div>
  );
}
