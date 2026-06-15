/**
 * Recommendations Page — DEMO MODE (mock data, no DB)
 */
import { RecommendationList } from "@/features/recommendations/components/recommendation-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — Recommended Actions",
  description: "Personalized actions to reduce your carbon footprint, sorted by impact.",
};

const MOCK_RECOMMENDATIONS = [
  { id: "rec-1", dbId: "db-1", category: "transport" as const, title: "Switch to electric vehicle or EV sharing", impactKg: 1200, isCompleted: false },
  { id: "rec-2", dbId: "db-2", category: "energy" as const, title: "Install rooftop solar panels", impactKg: 900, isCompleted: true },
  { id: "rec-3", dbId: "db-3", category: "lifestyle" as const, title: "Adopt a plant-based diet 3 days/week", impactKg: 600, isCompleted: false },
  { id: "rec-4", dbId: "db-4", category: "transport" as const, title: "Use public transport for daily commute", impactKg: 480, isCompleted: false },
  { id: "rec-5", dbId: "db-5", category: "energy" as const, title: "Switch to LED lighting throughout home", impactKg: 120, isCompleted: true },
  { id: "rec-6", dbId: "db-6", category: "lifestyle" as const, title: "Reduce single-use plastic consumption", impactKg: 95, isCompleted: false },
  { id: "rec-7", dbId: "db-7", category: "transport" as const, title: "Carpool to work at least 3 days/week", impactKg: 320, isCompleted: false },
  { id: "rec-8", dbId: "db-8", category: "energy" as const, title: "Use a smart thermostat to optimize heating/cooling", impactKg: 200, isCompleted: false },
];

const completedCount = MOCK_RECOMMENDATIONS.filter((r) => r.isCompleted).length;
const totalImpact = MOCK_RECOMMENDATIONS.filter((r) => r.isCompleted).reduce((sum, r) => sum + r.impactKg, 0);

export default async function RecommendationsPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-header__title">Recommended Actions</h1>
        <p className="page-header__subtitle">
          {completedCount} of {MOCK_RECOMMENDATIONS.length} completed
          {totalImpact > 0 && ` · ${Math.round(totalImpact).toLocaleString()} kg CO₂e/yr saved`}
        </p>
      </header>
      <RecommendationList recommendations={MOCK_RECOMMENDATIONS} />
    </div>
  );
}
