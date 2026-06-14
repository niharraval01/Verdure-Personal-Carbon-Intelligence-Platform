"use client";

/**
 * Recommendation List Component
 *
 * Displays prioritized recommendations with impact badges.
 * Supports marking recommendations as complete.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

interface RecommendationItem {
  id: string;
  dbId: string;
  category: "transport" | "energy" | "lifestyle";
  title: string;
  impactKg: number;
  isCompleted: boolean;
}

interface RecommendationListProps {
  recommendations: RecommendationItem[];
  compact?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  transport: "🚗",
  energy: "⚡",
  lifestyle: "🍃",
};

const CATEGORY_COLORS: Record<string, string> = {
  transport: "#0ea5e9",
  energy: "#f59e0b",
  lifestyle: "#8b5cf6",
};

export function RecommendationList({
  recommendations,
  compact = false,
}: RecommendationListProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleComplete = useCallback(async (dbId: string, currentState: boolean) => {
    setLoadingId(dbId);
    try {
      const response = await fetch("/api/recommendations/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dbId, isCompleted: !currentState }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch {
      // silently fail, user can retry
    } finally {
      setLoadingId(null);
    }
  }, [router]);

  const displayed = compact ? recommendations.slice(0, 5) : recommendations;

  return (
    <ul className="recommendation-list" role="list">
      {displayed.map((rec, index) => (
        <motion.li
          key={rec.dbId}
          className={`recommendation-card ${rec.isCompleted ? "recommendation-card--completed" : ""}`}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="recommendation-card__header">
            <span
              className="recommendation-card__category"
              style={{ color: CATEGORY_COLORS[rec.category] }}
            >
              {CATEGORY_ICONS[rec.category]} {rec.category}
            </span>
            <span className="recommendation-card__impact">
              -{Math.round(rec.impactKg).toLocaleString()} kg CO₂e/yr
            </span>
          </div>
          <p className="recommendation-card__title">{rec.title}</p>
          <button
            className={`recommendation-card__action ${rec.isCompleted ? "recommendation-card__action--done" : ""}`}
            onClick={() => handleToggleComplete(rec.dbId, rec.isCompleted)}
            disabled={loadingId === rec.dbId}
            aria-label={rec.isCompleted ? `Mark "${rec.title}" as incomplete` : `Mark "${rec.title}" as complete`}
          >
            {loadingId === rec.dbId
              ? "…"
              : rec.isCompleted
              ? "✓ Completed"
              : "Mark Complete"}
          </button>
        </motion.li>
      ))}
      {displayed.length === 0 && (
        <li className="recommendation-list__empty">
          No recommendations yet. Complete onboarding to get personalized actions.
        </li>
      )}
    </ul>
  );
}
