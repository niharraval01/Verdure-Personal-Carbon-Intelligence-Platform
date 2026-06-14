/**
 * Carbon Engine — Calculation Functions
 *
 * Pure functions for computing annual carbon emissions.
 * ZERO framework dependencies — input → output only.
 * These functions are reused by: dashboard, simulator, onboarding preview, AI coach context.
 *
 * Formula documentation:
 * - Transport: dailyDistanceKm × 365 × vehicleFactor, minus public transport offset
 * - Energy:    (monthlyBill / ratePerKWh) × 12 × gridFactor + AC supplemental, per capita
 * - Lifestyle: dietFactor + flights + shopping, scaled by food waste multiplier
 */

import type {
  TransportInput,
  EnergyInput,
  LifestyleInput,
  CarbonInput,
  EmissionResult,
} from "./types";

import {
  VEHICLE_EMISSION_FACTORS,
  PUBLIC_TRANSPORT_FACTOR_PER_KM,
  AVG_PUBLIC_TRANSPORT_DAILY_KM,
  GRID_EMISSION_FACTOR_KG_PER_KWH,
  AVG_ELECTRICITY_RATE_INR_PER_KWH,
  AC_POWER_KWH_PER_HOUR,
  INDEPENDENT_HOUSE_MULTIPLIER,
  DIET_EMISSIONS,
  FLIGHT_EMISSION_BLENDED,
  SHOPPING_EMISSIONS,
  FOOD_WASTE_MULTIPLIER,
  DAYS_PER_YEAR,
  MONTHS_PER_YEAR,
} from "./emission-factors";

/**
 * Calculate annual transport emissions (kg CO₂e/year).
 *
 * Logic:
 * 1. Personal vehicle days = 7 - publicTransportDaysPerWeek
 * 2. Personal emissions = personalDays/7 × dailyDistanceKm × 365 × vehicleFactor
 * 3. Public transport emissions = publicTransportDays/7 × avgPublicKm × 365 × publicFactor
 * 4. Total = personal + public transport
 *
 * Edge cases:
 * - vehicleType === 'none': only public transport emissions counted
 * - dailyDistanceKm === 0: zero personal vehicle emissions
 * - publicTransportDaysPerWeek === 0: no public transport component
 */
export function calculateTransportEmissions(input: TransportInput): number {
  const { vehicleType, fuelType, dailyDistanceKm, publicTransportDaysPerWeek } = input;

  // Clamp values to valid ranges
  const clampedDistance = Math.max(0, dailyDistanceKm);
  const clampedPublicDays = Math.max(0, Math.min(7, publicTransportDaysPerWeek));

  // Personal vehicle emissions
  let personalEmissions = 0;
  if (vehicleType !== "none" && clampedDistance > 0) {
    const vehicleFactors = VEHICLE_EMISSION_FACTORS[vehicleType];
    const factor =
      (fuelType ? vehicleFactors[fuelType] : undefined) ??
      vehicleFactors.default ??
      0;

    const personalDaysPerWeek = 7 - clampedPublicDays;
    const fractionPersonal = personalDaysPerWeek / 7;
    personalEmissions = fractionPersonal * clampedDistance * DAYS_PER_YEAR * factor;
  }

  // Public transport emissions
  let publicEmissions = 0;
  if (clampedPublicDays > 0) {
    const fractionPublic = clampedPublicDays / 7;
    publicEmissions =
      fractionPublic *
      AVG_PUBLIC_TRANSPORT_DAILY_KM *
      DAYS_PER_YEAR *
      PUBLIC_TRANSPORT_FACTOR_PER_KM;
  }

  return Math.round((personalEmissions + publicEmissions) * 100) / 100;
}

/**
 * Calculate annual energy emissions (kg CO₂e/year), per capita.
 *
 * Logic:
 * 1. Monthly kWh = monthlyBill / avgRatePerKWh
 * 2. Annual base kWh = monthlyKWh × 12
 * 3. AC supplemental kWh = acHours × 365 × acPowerRate
 * 4. Total kWh = (base + AC) × homeTypeMultiplier
 * 5. Per-capita kWh = total / residents
 * 6. Emissions = perCapitaKWh × gridFactor
 *
 * Edge cases:
 * - residents < 1: treated as 1 (avoid division by zero)
 * - monthlyElectricityBill === 0: zero base emissions (AC still counted)
 * - acUsageHoursPerDay === 0: no AC supplemental
 */
export function calculateEnergyEmissions(input: EnergyInput): number {
  const { homeType, residents, monthlyElectricityBill, acUsageHoursPerDay } = input;

  // Clamp values
  const clampedResidents = Math.max(1, residents);
  const clampedBill = Math.max(0, monthlyElectricityBill);
  const clampedAcHours = Math.max(0, Math.min(24, acUsageHoursPerDay));

  // Base electricity consumption
  const monthlyKWh = clampedBill / AVG_ELECTRICITY_RATE_INR_PER_KWH;
  const annualBaseKWh = monthlyKWh * MONTHS_PER_YEAR;

  // AC supplemental consumption
  const annualAcKWh = clampedAcHours * DAYS_PER_YEAR * AC_POWER_KWH_PER_HOUR;

  // Home type adjustment
  const homeMultiplier = homeType === "independent" ? INDEPENDENT_HOUSE_MULTIPLIER : 1;

  // Total per-capita consumption
  const totalKWh = (annualBaseKWh + annualAcKWh) * homeMultiplier;
  const perCapitaKWh = totalKWh / clampedResidents;

  // Convert to emissions
  const emissions = perCapitaKWh * GRID_EMISSION_FACTOR_KG_PER_KWH;

  return Math.round(emissions * 100) / 100;
}

/**
 * Calculate annual lifestyle emissions (kg CO₂e/year).
 *
 * Logic:
 * 1. Diet base emissions (annual, from lookup table)
 * 2. Flight emissions = flightsPerYear × blendedFlightFactor
 * 3. Shopping emissions (annual, from lookup table)
 * 4. Food waste adjustment: total × (1 + wasteMultiplier)
 *
 * The food waste multiplier applies to diet emissions only,
 * not flights/shopping (waste of purchased food ≠ travel waste).
 *
 * Edge cases:
 * - flightsPerYear === 0: no flight component
 * - onlineShoppingFrequency === 'never': zero shopping emissions
 */
export function calculateLifestyleEmissions(input: LifestyleInput): number {
  const { dietType, flightsPerYear, onlineShoppingFrequency, foodWasteLevel } = input;

  // Clamp values
  const clampedFlights = Math.max(0, flightsPerYear);

  // Diet emissions with food waste adjustment
  const baseDietEmissions = DIET_EMISSIONS[dietType];
  const wasteMultiplier = FOOD_WASTE_MULTIPLIER[foodWasteLevel];
  const adjustedDietEmissions = baseDietEmissions * (1 + wasteMultiplier);

  // Flight emissions
  const flightEmissions = clampedFlights * FLIGHT_EMISSION_BLENDED;

  // Shopping emissions
  const shoppingEmissions = SHOPPING_EMISSIONS[onlineShoppingFrequency];

  const total = adjustedDietEmissions + flightEmissions + shoppingEmissions;

  return Math.round(total * 100) / 100;
}

/**
 * Calculate total annual carbon emissions across all categories.
 *
 * Returns the total and a per-category breakdown.
 * This is the primary entry point used by the dashboard, simulator,
 * and onboarding preview.
 */
export function calculateTotalEmissions(input: CarbonInput): EmissionResult {
  const transport = calculateTransportEmissions(input.transport);
  const energy = calculateEnergyEmissions(input.energy);
  const lifestyle = calculateLifestyleEmissions(input.lifestyle);

  const total = Math.round((transport + energy + lifestyle) * 100) / 100;

  return {
    kgCO2ePerYear: total,
    breakdown: {
      transport,
      energy,
      lifestyle,
    },
  };
}
