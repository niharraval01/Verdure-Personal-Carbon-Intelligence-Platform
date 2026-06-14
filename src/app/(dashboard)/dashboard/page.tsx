/**
 * Dashboard Page (Server Component)
 *
 * Fetches latest footprint via RSC, renders score card + breakdown chart.
 * Redirects to onboarding if no footprint exists.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ScoreCard } from "@/features/carbon-score/components/score-card";
import { BreakdownChart } from "@/features/carbon-engine/components/breakdown-chart";
import { RecommendationList } from "@/features/recommendations/components/recommendation-list";
import type { CarbonScore } from "@/features/carbon-score";
import type { EmissionBreakdown } from "@/features/carbon-engine";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Fetch latest footprint
  const latestFootprint = await prisma.carbonFootprint.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // No footprint yet → redirect to onboarding
  if (!latestFootprint) {
    redirect("/onboarding");
  }

  // Parse stored data
  const result = latestFootprint.result as unknown as { kgCO2ePerYear: number; breakdown: EmissionBreakdown };
  const score: CarbonScore = {
    score: latestFootprint.score,
    label: latestFootprint.scoreLabel as CarbonScore["label"],
    kgCO2ePerYear: result.kgCO2ePerYear,
    percentileVsGlobal: Math.round(((result.kgCO2ePerYear - 4800) / 4800) * 1000) / 10,
    percentileVsIndia: Math.round(((result.kgCO2ePerYear - 2200) / 2200) * 1000) / 10,
  };

  // Fetch user's recommendations
  const recommendations = await prisma.userRecommendation.findMany({
    where: { userId: session.user.id },
    orderBy: { impactKg: "desc" },
    take: 5,
  });

  return (
    <div className="page-container">
      <header className="dashboard-header">
        <h1 className="dashboard-header__title">
          Welcome back, {session.user.name.split(" ")[0]}
        </h1>
        <p className="dashboard-header__subtitle">
          Here&apos;s your carbon footprint snapshot
        </p>
      </header>

      <div className="dashboard-grid">
        {/* Score Card */}
        <section className="dashboard-grid__score" aria-label="Carbon Score">
          <ScoreCard score={score} />
        </section>

        {/* Breakdown Chart */}
        <section className="dashboard-grid__breakdown" aria-label="Emission Breakdown">
          <BreakdownChart
            breakdown={result.breakdown}
            totalKg={result.kgCO2ePerYear}
          />
        </section>

        {/* Top Recommendations */}
        <section className="dashboard-grid__recommendations" aria-label="Top Actions">
          <h3 className="section-title">Top Actions to Reduce Your Footprint</h3>
          <RecommendationList
            recommendations={recommendations.map((r) => ({
              id: r.recommendationId,
              dbId: r.id,
              category: r.category as "transport" | "energy" | "lifestyle",
              title: r.title,
              impactKg: r.impactKg,
              isCompleted: r.isCompleted,
            }))}
            compact
          />
        </section>
      </div>
    </div>
  );
}
