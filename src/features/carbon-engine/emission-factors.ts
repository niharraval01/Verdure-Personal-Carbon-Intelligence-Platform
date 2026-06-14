/**
 * Carbon Engine — Emission Factors
 *
 * Published, cited emission factors used for all calculations.
 * Each constant includes its source in a JSDoc comment for
 * defensible methodology (Problem Statement Alignment).
 *
 * All factors are in kg CO₂e unless otherwise noted.
 */

import type { VehicleType, FuelType, DietType, ShoppingFrequency, WasteLevel } from "./types";

// ─────────────────────────────────────────────────────────────
// TRANSPORT EMISSION FACTORS (kg CO₂e per km)
// ─────────────────────────────────────────────────────────────

/**
 * Vehicle emission factors by vehicle type and fuel type.
 *
 * Sources:
 * - Car (Petrol):   DEFRA 2024, average car, 0.192 kgCO₂e/km
 * - Car (Diesel):   DEFRA 2024, average car, 0.171 kgCO₂e/km
 * - Car (CNG):      IPCC AR6 / Indian context, 0.158 kgCO₂e/km
 * - Car (Electric): DEFRA 2024 BEV average, 0.053 kgCO₂e/km
 *                   (includes upstream electricity generation)
 * - Bike (Petrol):  India CEA/TERI estimates, 0.084 kgCO₂e/km
 * - Bus:            DEFRA 2024, local bus per passenger-km, 0.089 kgCO₂e/pkm
 * - Metro/Train:    DEFRA 2024, national rail average, 0.041 kgCO₂e/pkm
 */
export const VEHICLE_EMISSION_FACTORS: Record<
  VehicleType,
  Partial<Record<FuelType, number>> & { default?: number }
> = {
  car: {
    petrol: 0.192,
    diesel: 0.171,
    cng: 0.158,
    electric: 0.053,
  },
  bike: {
    petrol: 0.084,
    electric: 0.022,
    default: 0.084,
  },
  bus: {
    default: 0.089,
  },
  metro: {
    default: 0.041,
  },
  train: {
    default: 0.041,
  },
  none: {
    default: 0,
  },
};

/**
 * Public transport emission factor (kg CO₂e per km).
 * Uses average of bus + metro weighted toward metro for urban contexts.
 * Source: DEFRA 2024, average public transport
 */
export const PUBLIC_TRANSPORT_FACTOR_PER_KM = 0.065;

/**
 * Average daily commute distance assumed for public transport days (km).
 * Source: Indian Census 2011 / RITES transport survey, urban average
 */
export const AVG_PUBLIC_TRANSPORT_DAILY_KM = 15;

// ─────────────────────────────────────────────────────────────
// ENERGY EMISSION FACTORS
// ─────────────────────────────────────────────────────────────

/**
 * India grid emission factor (kg CO₂ per kWh).
 * Source: Central Electricity Authority (CEA), India, 2024
 * https://cea.nic.in/wp-content/uploads/baseline/2024/01/Approved_report_emission.pdf
 */
export const GRID_EMISSION_FACTOR_KG_PER_KWH = 0.82;

/**
 * Average domestic electricity tariff in India (₹ per kWh).
 * Source: Average across Indian state DISCOMs, 2024
 * Used to convert monthly bill (₹) → monthly kWh consumption.
 */
export const AVG_ELECTRICITY_RATE_INR_PER_KWH = 8.0;

/**
 * Average AC power consumption (kWh per hour of operation).
 * Source: Bureau of Energy Efficiency (BEE), India
 * Assumes 1.5-ton split AC (most common residential unit).
 */
export const AC_POWER_KWH_PER_HOUR = 1.5;

/**
 * Independent house energy multiplier vs apartment.
 * Independent homes typically consume 15-25% more energy
 * due to larger floor area, less shared insulation.
 * Source: BEE India residential energy survey
 */
export const INDEPENDENT_HOUSE_MULTIPLIER = 1.2;

// ─────────────────────────────────────────────────────────────
// LIFESTYLE EMISSION FACTORS
// ─────────────────────────────────────────────────────────────

/**
 * Annual diet-related emissions by diet type (kg CO₂e per year).
 *
 * Sources:
 * - Poore & Nemecek (2018), "Reducing food's environmental impacts
 *   through producers and consumers", Science 360(6392).
 * - Adapted for Indian dietary patterns (lower dairy/meat intensity
 *   than Western diets even for non-vegetarians).
 *
 * Values:
 * - Vegan:      ~1,100 kgCO₂e/year (plant-based only)
 * - Vegetarian: ~1,700 kgCO₂e/year (includes dairy)
 * - Eggetarian: ~1,900 kgCO₂e/year (vegetarian + eggs, interpolated)
 * - Non-veg:    ~2,500 kgCO₂e/year (includes poultry, mutton, fish)
 */
export const DIET_EMISSIONS: Record<DietType, number> = {
  vegan: 1100,
  vegetarian: 1700,
  eggetarian: 1900,
  "non-veg": 2500,
};

/**
 * Average flight emissions (kg CO₂e per flight).
 *
 * Source: DEFRA 2024 — "Business travel – air"
 * Domestic (average ~1000 km): 255 kgCO₂e per passenger
 * International (average ~5000 km, economy): 1,100 kgCO₂e per passenger
 *
 * We use a blended average assuming 70% domestic / 30% international
 * for Indian users: 0.7 × 255 + 0.3 × 1100 = 508.5 ≈ 509 kgCO₂e
 */
export const FLIGHT_EMISSION_DOMESTIC = 255;
export const FLIGHT_EMISSION_INTERNATIONAL = 1100;
export const FLIGHT_EMISSION_BLENDED = 509;

/**
 * Online shopping annual emissions by frequency (kg CO₂e per year).
 *
 * Source: Carbon Trust / MIT Center for Transportation & Logistics
 * estimates for e-commerce packaging + last-mile delivery.
 * - Never:   0 kgCO₂e/year
 * - Monthly: ~120 kgCO₂e/year (packaging + delivery × 12)
 * - Weekly:  ~520 kgCO₂e/year (packaging + delivery × 52)
 */
export const SHOPPING_EMISSIONS: Record<ShoppingFrequency, number> = {
  never: 0,
  monthly: 120,
  weekly: 520,
};

/**
 * Food waste multiplier applied to diet emissions.
 *
 * Source: UNEP Food Waste Index Report 2024
 * When food is wasted, all production emissions are also wasted.
 * - Low:    baseline (no additional waste factor)
 * - Medium: +10% of diet emissions
 * - High:   +25% of diet emissions
 */
export const FOOD_WASTE_MULTIPLIER: Record<WasteLevel, number> = {
  low: 0,
  medium: 0.1,
  high: 0.25,
};

// ─────────────────────────────────────────────────────────────
// REFERENCE BENCHMARKS
// ─────────────────────────────────────────────────────────────

/**
 * Global average per-capita CO₂ emissions (kg CO₂e per year).
 * Source: Our World in Data / Global Carbon Project, 2023
 * ~4.8 tonnes CO₂e per person per year globally.
 */
export const GLOBAL_AVG_KG_CO2E_PER_YEAR = 4800;

/**
 * India average per-capita CO₂ emissions (kg CO₂e per year).
 * Source: Worldometer / IEA, 2024
 * ~2.2 tonnes CO₂e per person per year.
 */
export const INDIA_AVG_KG_CO2E_PER_YEAR = 2200;

/**
 * Days in a year (for annualization).
 */
export const DAYS_PER_YEAR = 365;

/**
 * Months in a year.
 */
export const MONTHS_PER_YEAR = 12;
