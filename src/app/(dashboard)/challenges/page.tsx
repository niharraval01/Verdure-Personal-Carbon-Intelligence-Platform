/**
 * Challenges Page
 */
import type { Metadata } from "next";
import { ChallengesClient } from "./challenges-client";

export const metadata: Metadata = {
  title: "Verdure — Sustainability Challenges",
  description: "Join weekly sustainability challenges and track your impact.",
};

export default async function ChallengesPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-header__title">🏆 Sustainability Challenges</h1>
        <p className="page-header__subtitle">
          Join challenges to reduce your footprint and build green habits
        </p>
      </header>
      <ChallengesClient />
    </div>
  );
}
