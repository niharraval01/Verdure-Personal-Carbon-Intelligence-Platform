/**
 * Carbon Engine — Type Contracts
 *
 * All input/output types for the carbon footprint calculation engine.
 * These types are the single source of truth shared across:
 * - Onboarding form validation (via Zod schemas)
 * - Carbon engine calculations
 * - Simulator real-time preview
 * - AI Coach context injection
 */

// ── Transport ──────────────────────────────────────────────
export type VehicleType = "car" | "bike" | "bus" | "metro" | "train" | "none";
export type FuelType = "petrol" | "diesel" | "cng" | "electric";

export interface TransportInput {
  vehicleType: VehicleType;
  fuelType?: FuelType;
  dailyDistanceKm: number;
  publicTransportDaysPerWeek: number;
}

// ── Energy ─────────────────────────────────────────────────
export type HomeType = "apartment" | "independent";

export interface EnergyInput {
  homeType: HomeType;
  residents: number;
  /** Monthly electricity bill in INR (₹) */
  monthlyElectricityBill: number;
  acUsageHoursPerDay: number;
}

// ── Lifestyle ──────────────────────────────────────────────
export type DietType = "vegetarian" | "vegan" | "eggetarian" | "non-veg";
export type ShoppingFrequency = "never" | "monthly" | "weekly";
export type WasteLevel = "low" | "medium" | "high";

export interface LifestyleInput {
  dietType: DietType;
  flightsPerYear: number;
  onlineShoppingFrequency: ShoppingFrequency;
  foodWasteLevel: WasteLevel;
}

// ── Combined Input ─────────────────────────────────────────
export interface CarbonInput {
  transport: TransportInput;
  energy: EnergyInput;
  lifestyle: LifestyleInput;
}

// ── Output ─────────────────────────────────────────────────
export type EmissionCategory = "transport" | "energy" | "lifestyle";
export type EmissionBreakdown = Record<EmissionCategory, number>;

export interface EmissionResult {
  /** Total annual emissions in kg CO₂e */
  kgCO2ePerYear: number;
  /** Breakdown by category in kg CO₂e/year */
  breakdown: EmissionBreakdown;
}
