/**
 * Progress Page — DEMO MODE (mock data, no DB)
 */
import { ProgressChart } from "@/features/progress/components/progress-chart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — Your Progress",
  description: "Track how your carbon footprint has changed over time.",
};

const MOCK_DATA = [
  { date: "Jan 15", score: 42, kgCO2e: 8200 },
  { date: "Feb 12", score: 48, kgCO2e: 7600 },
  { date: "Mar 20", score: 55, kgCO2e: 6900 },
  { date: "Apr 8",  score: 58, kgCO2e: 6500 },
  { date: "May 3",  score: 62, kgCO2e: 5840 },
];

const latestScore = 62;
const completedRecs = 2;
const totalCalculations = MOCK_DATA.length;
const improvement = latestScore - MOCK_DATA[0].score;

export default async function ProgressPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-header__title">Your Progress</h1>
        <p className="page-header__subtitle">
          {totalCalculations} calculations · {completedRecs} actions completed
          {improvement > 0 && ` · +${improvement} point improvement`}
        </p>
      </header>

      <div className="progress-grid">
        <section className="progress-grid__chart" aria-label="Score over time">
          <h3 className="section-title">Carbon Score Over Time</h3>
          <ProgressChart data={MOCK_DATA} />
        </section>

        <section className="progress-grid__stats" aria-label="Quick stats">
          <div className="stat-card">
            <div className="stat-card__value">{latestScore}</div>
            <div className="stat-card__label">Current Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{completedRecs}</div>
            <div className="stat-card__label">Actions Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{totalCalculations}</div>
            <div className="stat-card__label">Calculations</div>
          </div>
        </section>
      </div>
    </div>
  );
}
