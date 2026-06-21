/**
 * Recommendations Page
 */
import { RecommendationsClient } from "./recommendations-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — Recommended Actions",
  description: "Personalized actions to reduce your carbon footprint, sorted by impact.",
};

export default async function RecommendationsPage() {
  return (
    <div className="page-container">
      <RecommendationsClient />
    </div>
  );
}
