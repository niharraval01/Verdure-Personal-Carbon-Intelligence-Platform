"use client";

import { RecommendationList } from "@/features/recommendations/components/recommendation-list";
import { useCarbon } from "@/contexts/CarbonContext";

export function RecommendationsClient() {
  const { recommendations, toggleRecommendationCompleted } = useCarbon();

  const completedCount = recommendations.filter((r) => r.isCompleted).length;
  const totalImpact = recommendations.filter((r) => r.isCompleted).reduce((sum, r) => sum + r.impactKg, 0);

  return (
    <>
      <header className="page-header">
        <h1 className="page-header__title">Recommended Actions</h1>
        <p className="page-header__subtitle">
          {completedCount} of {recommendations.length} completed
          {totalImpact > 0 && ` · ${Math.round(totalImpact).toLocaleString()} kg CO₂e/yr saved`}
        </p>
      </header>
      <RecommendationList 
        recommendations={recommendations} 
        onToggle={toggleRecommendationCompleted}
      />
    </>
  );
}
