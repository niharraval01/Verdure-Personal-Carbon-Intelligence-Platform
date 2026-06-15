/**
 * Challenges Page — DEMO MODE (mock challenges, no DB)
 */
import type { Metadata } from "next";
import { ChallengeGrid } from "@/features/challenges/components/challenge-grid";

export const metadata: Metadata = {
  title: "Verdure — Sustainability Challenges",
  description: "Join weekly sustainability challenges and track your impact.",
};

const MOCK_CHALLENGES = [
  { id: "ch-1", title: "Car-Free Week", description: "Avoid using personal vehicles for 7 days. Use walking, cycling, or public transport.", category: "transport" as const, impactKg: 35, durationDays: 7, isJoined: true, isCompleted: false },
  { id: "ch-2", title: "Meatless Monday", description: "Go vegetarian every Monday for a month to reduce your dietary carbon footprint.", category: "lifestyle" as const, impactKg: 24, durationDays: 30, isJoined: false, isCompleted: false },
  { id: "ch-3", title: "Zero Food Waste", description: "Plan meals carefully and eliminate food waste for two weeks.", category: "lifestyle" as const, impactKg: 18, durationDays: 14, isJoined: true, isCompleted: true },
  { id: "ch-4", title: "Home Energy Audit", description: "Identify and fix energy leaks in your home — seal drafts, adjust thermostat, unplug standby devices.", category: "energy" as const, impactKg: 45, durationDays: 3, isJoined: false, isCompleted: false },
  { id: "ch-5", title: "Shop Local Month", description: "Buy only locally produced goods for 30 days to reduce transport emissions.", category: "lifestyle" as const, impactKg: 20, durationDays: 30, isJoined: false, isCompleted: false },
  { id: "ch-6", title: "Cold Shower Sprint", description: "Take cold showers for 10 days to reduce hot water energy usage.", category: "energy" as const, impactKg: 8, durationDays: 10, isJoined: false, isCompleted: false },
];

export default async function ChallengesPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-header__title">🏆 Sustainability Challenges</h1>
        <p className="page-header__subtitle">
          Join challenges to reduce your footprint and build green habits
        </p>
      </header>
      <ChallengeGrid challenges={MOCK_CHALLENGES} />
    </div>
  );
}
