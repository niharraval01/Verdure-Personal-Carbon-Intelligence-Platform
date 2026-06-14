/**
 * Recommendations Page
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RecommendationList } from "@/features/recommendations/components/recommendation-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — Recommended Actions",
  description: "Personalized actions to reduce your carbon footprint, sorted by impact.",
};

export default async function RecommendationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const recommendations = await prisma.userRecommendation.findMany({
    where: { userId: session.user.id },
    orderBy: { impactKg: "desc" },
  });

  const formatted = recommendations.map((r) => ({
    id: r.recommendationId,
    dbId: r.id,
    category: r.category as "transport" | "energy" | "lifestyle",
    title: r.title,
    impactKg: r.impactKg,
    isCompleted: r.isCompleted,
  }));

  const completedCount = formatted.filter((r) => r.isCompleted).length;
  const totalImpact = formatted
    .filter((r) => r.isCompleted)
    .reduce((sum, r) => sum + r.impactKg, 0);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-header__title">Recommended Actions</h1>
        <p className="page-header__subtitle">
          {completedCount} of {formatted.length} completed
          {totalImpact > 0 && ` · ${Math.round(totalImpact).toLocaleString()} kg CO₂e/yr saved`}
        </p>
      </header>
      <RecommendationList recommendations={formatted} />
    </div>
  );
}
