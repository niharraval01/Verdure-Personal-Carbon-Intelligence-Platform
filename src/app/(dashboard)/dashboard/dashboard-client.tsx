"use client";

import { ScoreCard } from "@/features/carbon-score/components/score-card";
import { BreakdownChart } from "@/features/carbon-engine/components/breakdown-chart";
import { RecommendationList } from "@/features/recommendations/components/recommendation-list";
import { useCarbon } from "@/contexts/CarbonContext";

export function DashboardClient() {
  const { carbonScore, emissionResult, recommendations, toggleRecommendationCompleted } = useCarbon();

  // Sort recommendations by impact and only show a few on the dashboard
  const topRecommendations = [...recommendations]
    .sort((a, b) => b.impactKg - a.impactKg)
    .slice(0, 5);

  return (
    <div className="dashboard-grid">
      <section className="dashboard-grid__score" aria-label="Carbon Score">
        <ScoreCard score={carbonScore} />
      </section>

      <section className="dashboard-grid__breakdown" aria-label="Emission Breakdown">
        <BreakdownChart
          breakdown={emissionResult.breakdown}
          totalKg={emissionResult.kgCO2ePerYear}
        />
      </section>

      <section className="dashboard-grid__recommendations" aria-label="Top Actions">
        <h3 className="section-title">Top Actions to Reduce Your Footprint</h3>
        <RecommendationList 
          recommendations={topRecommendations} 
          compact 
          onToggle={toggleRecommendationCompleted}
        />
      </section>
    </div>
  );
}
