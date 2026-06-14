/**
 * Progress Page
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProgressChart } from "@/features/progress/components/progress-chart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — Your Progress",
  description: "Track how your carbon footprint has changed over time.",
};

export default async function ProgressPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const footprints = await prisma.carbonFootprint.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  const completedRecs = await prisma.userRecommendation.count({
    where: { userId: session.user.id, isCompleted: true },
  });

  const data = footprints.map((fp) => {
    const result = fp.result as { kgCO2ePerYear: number };
    return {
      date: fp.createdAt.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      score: fp.score,
      kgCO2e: Math.round(result.kgCO2ePerYear),
    };
  });

  const latestScore = footprints[footprints.length - 1]?.score ?? 0;
  const firstScore = footprints[0]?.score ?? 0;
  const improvement = latestScore - firstScore;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-header__title">Your Progress</h1>
        <p className="page-header__subtitle">
          {footprints.length} calculation{footprints.length !== 1 ? "s" : ""} · {completedRecs} action{completedRecs !== 1 ? "s" : ""} completed
          {improvement > 0 && ` · +${improvement} point improvement`}
        </p>
      </header>

      <div className="progress-grid">
        <section className="progress-grid__chart" aria-label="Score over time">
          <h3 className="section-title">Carbon Score Over Time</h3>
          <ProgressChart data={data} />
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
            <div className="stat-card__value">{footprints.length}</div>
            <div className="stat-card__label">Calculations</div>
          </div>
        </section>
      </div>
    </div>
  );
}
