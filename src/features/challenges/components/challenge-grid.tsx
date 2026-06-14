"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  category: "transport" | "energy" | "lifestyle";
  impactKg: number;
  durationDays: number;
  isJoined: boolean;
  isCompleted: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  transport: "🚗",
  energy: "⚡",
  lifestyle: "🍃",
};

export function ChallengeGrid({ challenges }: { challenges: ChallengeItem[] }) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleJoin = useCallback(async (id: string) => {
    setLoadingId(id);
    try {
      const response = await fetch("/api/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: id }),
      });
      if (response.ok) router.refresh();
    } catch { /* retry */ }
    finally { setLoadingId(null); }
  }, [router]);

  const handleComplete = useCallback(async (id: string) => {
    setLoadingId(id);
    try {
      const response = await fetch("/api/challenges/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: id }),
      });
      if (response.ok) router.refresh();
    } catch { /* retry */ }
    finally { setLoadingId(null); }
  }, [router]);

  if (challenges.length === 0) {
    return (
      <div className="challenges__empty">
        <p>No active challenges right now. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="challenges-grid">
      {challenges.map((challenge, index) => (
        <motion.div
          key={challenge.id}
          className={`challenge-card ${challenge.isCompleted ? "challenge-card--completed" : ""}`}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
        >
          <div className="challenge-card__header">
            <span className="challenge-card__category">
              {CATEGORY_ICONS[challenge.category]} {challenge.category}
            </span>
            <span className="challenge-card__duration">
              {challenge.durationDays} days
            </span>
          </div>
          <h3 className="challenge-card__title">{challenge.title}</h3>
          <p className="challenge-card__description">{challenge.description}</p>
          <div className="challenge-card__footer">
            <span className="challenge-card__impact">
              🌱 -{Math.round(challenge.impactKg)} kg CO₂e
            </span>
            {!challenge.isJoined ? (
              <button
                className="btn btn--primary btn--sm"
                onClick={() => handleJoin(challenge.id)}
                disabled={loadingId === challenge.id}
              >
                Join Challenge
              </button>
            ) : !challenge.isCompleted ? (
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => handleComplete(challenge.id)}
                disabled={loadingId === challenge.id}
              >
                Mark Complete
              </button>
            ) : (
              <span className="challenge-card__done">✓ Completed</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
