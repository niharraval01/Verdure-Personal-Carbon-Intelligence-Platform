/**
 * Carbon Engine — Public API
 *
 * Barrel export for the carbon-engine feature module.
 * Import from '@/features/carbon-engine' in consuming code.
 */

// Types
export type {
  VehicleType,
  FuelType,
  HomeType,
  DietType,
  ShoppingFrequency,
  WasteLevel,
  TransportInput,
  EnergyInput,
  LifestyleInput,
  CarbonInput,
  EmissionCategory,
  EmissionBreakdown,
  EmissionResult,
} from "./types";

// Calculation functions
export {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateLifestyleEmissions,
  calculateTotalEmissions,
} from "./calculate";

// Emission factors (for reference/display, e.g., in tooltips)
export {
  GLOBAL_AVG_KG_CO2E_PER_YEAR,
  INDIA_AVG_KG_CO2E_PER_YEAR,
} from "./emission-factors";
