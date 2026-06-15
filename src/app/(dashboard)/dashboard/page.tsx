/**
 * Dashboard Page — DEMO MODE (mock data, no DB)
 */
import { ScoreCard } from "@/features/carbon-score/components/score-card";
import { BreakdownChart } from "@/features/carbon-engine/components/breakdown-chart";
import { RecommendationList } from "@/features/recommendations/components/recommendation-list";
import type { CarbonScore } from "@/features/carbon-score";
import type { EmissionBreakdown } from "@/features/carbon-engine";

const MOCK_SCORE: CarbonScore = {
  score: 62,
  label: "average",
  kgCO2ePerYear: 5840,
  percentileVsGlobal: 21.7,
  percentileVsIndia: 165.5,
};

const MOCK_BREAKDOWN: EmissionBreakdown = {
  transport: 2400,
  energy: 1800,
  lifestyle: 1640,
};

const MOCK_RECOMMENDATIONS = [
  { id: "rec-1", dbId: "db-1", category: "transport" as const, title: "Switch to electric vehicle or EV sharing", impactKg: 1200, isCompleted: false },
  { id: "rec-2", dbId: "db-2", category: "energy" as const, title: "Install rooftop solar panels", impactKg: 900, isCompleted: true },
  { id: "rec-3", dbId: "db-3", category: "lifestyle" as const, title: "Adopt a plant-based diet 3 days/week", impactKg: 600, isCompleted: false },
  { id: "rec-4", dbId: "db-4", category: "transport" as const, title: "Use public transport for daily commute", impactKg: 480, isCompleted: false },
  { id: "rec-5", dbId: "db-5", category: "energy" as const, title: "Switch to LED lighting throughout home", impactKg: 120, isCompleted: true },
];

export default async function DashboardPage() {
  return (
    <div className="page-container">
      <header className="dashboard-header">
        <h1 className="dashboard-header__title">Welcome back, Nihar</h1>
        <p className="dashboard-header__subtitle">
          Here&apos;s your carbon footprint snapshot
        </p>
      </header>

      <div className="dashboard-grid">
        <section className="dashboard-grid__score" aria-label="Carbon Score">
          <ScoreCard score={MOCK_SCORE} />
        </section>

        <section className="dashboard-grid__breakdown" aria-label="Emission Breakdown">
          <BreakdownChart
            breakdown={MOCK_BREAKDOWN}
            totalKg={MOCK_SCORE.kgCO2ePerYear}
          />
        </section>

        <section className="dashboard-grid__recommendations" aria-label="Top Actions">
          <h3 className="section-title">Top Actions to Reduce Your Footprint</h3>
          <RecommendationList recommendations={MOCK_RECOMMENDATIONS} compact />
        </section>
      </div>
    </div>
  );
}
