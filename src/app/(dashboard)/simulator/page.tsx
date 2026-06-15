/**
 * Simulator Page — DEMO MODE (mock input/result, no DB)
 */
import { SimulatorPanel } from "@/features/simulator/components/simulator-panel";
import type { CarbonInput, EmissionResult } from "@/features/carbon-engine";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — What-If Simulator",
  description: "Simulate how lifestyle changes affect your carbon footprint in real-time.",
};

const MOCK_INPUT: CarbonInput = {
  transport: {
    vehicleType: "car",
    fuelType: "petrol",
    dailyDistanceKm: 30,
    publicTransportDaysPerWeek: 1,
  },
  energy: {
    homeType: "apartment",
    residents: 3,
    monthlyElectricityBill: 2500,
    acUsageHoursPerDay: 6,
  },
  lifestyle: {
    dietType: "non-veg",
    flightsPerYear: 2,
    onlineShoppingFrequency: "monthly",
    foodWasteLevel: "medium",
  },
};

const MOCK_RESULT: EmissionResult = {
  kgCO2ePerYear: 5840,
  breakdown: {
    transport: 2400,
    energy: 1800,
    lifestyle: 1640,
  },
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
      <SimulatorPanel initialInput={MOCK_INPUT} currentResult={MOCK_RESULT} />
    </div>
  );
}
