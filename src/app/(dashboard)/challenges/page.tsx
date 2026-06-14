/**
 * Challenges Page
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { ChallengeGrid } from "@/features/challenges/components/challenge-grid";

export const metadata: Metadata = {
  title: "Verdure — Sustainability Challenges",
  description: "Join weekly sustainability challenges and track your impact.",
};

export default async function ChallengesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const challenges = await prisma.challenge.findMany({
    where: { isActive: true },
    include: {
      entries: {
        where: { userId: session.user.id },
      },
    },
  });

  const formatted = challenges.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category as "transport" | "energy" | "lifestyle",
    impactKg: c.impactKg,
    durationDays: c.durationDays,
    isJoined: c.entries.length > 0,
    isCompleted: c.entries[0]?.isCompleted ?? false,
  }));

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-header__title">🏆 Sustainability Challenges</h1>
        <p className="page-header__subtitle">
          Join challenges to reduce your footprint and build green habits
        </p>
      </header>
      <ChallengeGrid challenges={formatted} />
    </div>
  );
}
