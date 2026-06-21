/**
 * Simulator Page
 */
import { SimulatorClient } from "./simulator-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — What-If Simulator",
  description: "Simulate how lifestyle changes affect your carbon footprint in real-time.",
};

export default async function SimulatorPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-header__title">What-If Simulator</h1>
        <p className="page-header__subtitle">
          Explore how changes to your habits could reduce your footprint
        </p>
      </header>
      <SimulatorClient />
    </div>
  );
}
