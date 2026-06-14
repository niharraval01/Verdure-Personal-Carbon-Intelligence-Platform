/**
 * Recommendations Engine
 *
 * PURE FUNCTION — takes CarbonInput + EmissionResult,
 * returns prioritized Recommendation[] sorted by impact descending.
 *
 * Logic: conditionally generates recommendations based on user's
 * actual inputs. Only suggests actions that are relevant to the
 * user's current behavior (e.g., no "switch to EV" if already electric).
 *
 * Each recommendation's impact is parametrically calculated from
 * the user's actual data, not a generic fixed number.
 */

import type { CarbonInput, EmissionResult } from "../carbon-engine/types";
import type { Recommendation } from "./types";
import {
  VEHICLE_EMISSION_FACTORS,
  DIET_EMISSIONS,
  SHOPPING_EMISSIONS,
  FLIGHT_EMISSION_BLENDED,
  FOOD_WASTE_MULTIPLIER,
  DAYS_PER_YEAR,
  GRID_EMISSION_FACTOR_KG_PER_KWH,
  AC_POWER_KWH_PER_HOUR,
  AVG_ELECTRICITY_RATE_INR_PER_KWH,
  MONTHS_PER_YEAR,
} from "../carbon-engine/emission-factors";

/**
 * Generate personalized, prioritized recommendations.
 *
 * @returns Recommendation[] sorted by impactKgCO2ePerYear descending (highest impact first)
 */
export function generateRecommendations(
  input: CarbonInput,
  result: EmissionResult
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // ── TRANSPORT RECOMMENDATIONS ──────────────────────────────
  generateTransportRecommendations(input, recommendations);

  // ── ENERGY RECOMMENDATIONS ─────────────────────────────────
  generateEnergyRecommendations(input, recommendations);

  // ── LIFESTYLE RECOMMENDATIONS ──────────────────────────────
  generateLifestyleRecommendations(input, result, recommendations);

  // Sort by impact (highest first), then by difficulty (easy first for same impact)
  const difficultyOrder = { easy: 0, medium: 1, hard: 2 } as const;
  recommendations.sort((a, b) => {
    const impactDiff = b.impactKgCO2ePerYear - a.impactKgCO2ePerYear;
    if (Math.abs(impactDiff) > 1) return impactDiff;
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });

  return recommendations;
}

function generateTransportRecommendations(
  input: CarbonInput,
  recs: Recommendation[]
): void {
  const { vehicleType, fuelType, dailyDistanceKm, publicTransportDaysPerWeek } =
    input.transport;

  // 1. Switch from fossil fuel car to EV
  if (
    vehicleType === "car" &&
    fuelType &&
    fuelType !== "electric"
  ) {
    const currentFactor = VEHICLE_EMISSION_FACTORS.car[fuelType] ?? 0.192;
    const evFactor = VEHICLE_EMISSION_FACTORS.car.electric ?? 0.053;
    const personalDays = 7 - publicTransportDaysPerWeek;
    const annualKm = (personalDays / 7) * dailyDistanceKm * DAYS_PER_YEAR;
    const savings = annualKm * (currentFactor - evFactor);

    if (savings > 50) {
      recs.push({
        id: "transport-switch-ev",
        category: "transport",
        title: "Switch to an Electric Vehicle",
        description: `Your ${fuelType} car emits ~${currentFactor * 1000} g CO₂e/km. An EV would reduce this by ${Math.round(((currentFactor - evFactor) / currentFactor) * 100)}%. Over your ${Math.round(annualKm)} km/year, that's ${Math.round(savings)} kg CO₂e saved.`,
        impactKgCO2ePerYear: Math.round(savings),
        difficulty: "hard",
        costSaving: false,
      });
    }
  }

  // 2. Use more public transport
  if (vehicleType !== "none" && publicTransportDaysPerWeek < 5 && dailyDistanceKm > 0) {
    const additionalDays = Math.min(5, 7) - publicTransportDaysPerWeek;
    if (additionalDays > 0) {
      const vehicleFactors = VEHICLE_EMISSION_FACTORS[vehicleType];
      const currentFactor =
        (fuelType ? vehicleFactors[fuelType] : undefined) ??
        vehicleFactors.default ??
        0;
      const savedKmPerDay = dailyDistanceKm;
      const annualSavedKm = (additionalDays / 7) * savedKmPerDay * DAYS_PER_YEAR;
      const savings = annualSavedKm * (currentFactor - 0.065); // public transport factor

      if (savings > 30) {
        recs.push({
          id: "transport-more-public",
          category: "transport",
          title: "Increase Public Transport Usage",
          description: `Adding ${additionalDays} more day(s) of public transport per week could save ~${Math.round(savings)} kg CO₂e/year. Public transport emits 65g/km vs your vehicle's ${Math.round(currentFactor * 1000)}g/km.`,
          impactKgCO2ePerYear: Math.round(savings),
          difficulty: "easy",
          costSaving: true,
        });
      }
    }
  }

  // 3. Carpool
  if (vehicleType === "car" && dailyDistanceKm > 10) {
    const vehicleFactors = VEHICLE_EMISSION_FACTORS.car;
    const currentFactor =
      (fuelType ? vehicleFactors[fuelType] : undefined) ??
      vehicleFactors.default ??
      0.192;
    const personalDays = 7 - publicTransportDaysPerWeek;
    const annualKm = (personalDays / 7) * dailyDistanceKm * DAYS_PER_YEAR;
    // Carpooling with 1 other person = 50% reduction in per-capita emissions
    const savings = annualKm * currentFactor * 0.5;

    recs.push({
      id: "transport-carpool",
      category: "transport",
      title: "Start Carpooling",
      description: `Sharing your commute with one person halves your per-trip emissions. That's ~${Math.round(savings)} kg CO₂e/year saved on your ${Math.round(annualKm)} km annual driving.`,
      impactKgCO2ePerYear: Math.round(savings),
      difficulty: "medium",
      costSaving: true,
    });
  }

  // 4. Work from home (if daily distance > 5km)
  if (vehicleType !== "none" && dailyDistanceKm > 5) {
    const vehicleFactors = VEHICLE_EMISSION_FACTORS[vehicleType];
    const currentFactor =
      (fuelType ? vehicleFactors[fuelType] : undefined) ??
      vehicleFactors.default ??
      0;
    // Assume 2 WFH days per week
    const savedKm = (2 / 7) * dailyDistanceKm * DAYS_PER_YEAR;
    const savings = savedKm * currentFactor;

    if (savings > 20) {
      recs.push({
        id: "transport-wfh",
        category: "transport",
        title: "Work from Home 2 Days/Week",
        description: `Working remotely 2 days a week eliminates ~${Math.round(savedKm)} km of commuting annually, saving ${Math.round(savings)} kg CO₂e.`,
        impactKgCO2ePerYear: Math.round(savings),
        difficulty: "medium",
        costSaving: true,
      });
    }
  }

  // 5. Switch from bike petrol to electric
  if (vehicleType === "bike" && fuelType === "petrol") {
    const currentFactor = VEHICLE_EMISSION_FACTORS.bike.petrol ?? 0.084;
    const evFactor = VEHICLE_EMISSION_FACTORS.bike.electric ?? 0.022;
    const personalDays = 7 - publicTransportDaysPerWeek;
    const annualKm = (personalDays / 7) * dailyDistanceKm * DAYS_PER_YEAR;
    const savings = annualKm * (currentFactor - evFactor);

    if (savings > 30) {
      recs.push({
        id: "transport-ebike",
        category: "transport",
        title: "Switch to an Electric Bike",
        description: `An electric two-wheeler emits ~74% less than petrol. Saving ${Math.round(savings)} kg CO₂e/year over ${Math.round(annualKm)} km.`,
        impactKgCO2ePerYear: Math.round(savings),
        difficulty: "medium",
        costSaving: true,
      });
    }
  }
}

function generateEnergyRecommendations(
  input: CarbonInput,
  recs: Recommendation[]
): void {
  const { homeType, residents, monthlyElectricityBill, acUsageHoursPerDay } =
    input.energy;

  const clampedResidents = Math.max(1, residents);

  // 1. Reduce AC usage
  if (acUsageHoursPerDay > 2) {
    const reductionHours = Math.min(acUsageHoursPerDay - 1, 4);
    const savedKWh = reductionHours * DAYS_PER_YEAR * AC_POWER_KWH_PER_HOUR;
    const savedEmissions = (savedKWh * GRID_EMISSION_FACTOR_KG_PER_KWH) / clampedResidents;
    const savedMoney = Math.round(savedKWh * AVG_ELECTRICITY_RATE_INR_PER_KWH);

    recs.push({
      id: "energy-reduce-ac",
      category: "energy",
      title: `Reduce AC Usage by ${reductionHours} Hours/Day`,
      description: `Cutting AC by ${reductionHours} hours daily saves ~${Math.round(savedEmissions)} kg CO₂e/year and ₹${savedMoney.toLocaleString("en-IN")}/year on electricity.`,
      impactKgCO2ePerYear: Math.round(savedEmissions),
      difficulty: "easy",
      costSaving: true,
    });
  }

  // 2. Switch to 5-star rated AC
  if (acUsageHoursPerDay > 0) {
    // 5-star AC uses ~30% less energy than average
    const currentAcKWh = acUsageHoursPerDay * DAYS_PER_YEAR * AC_POWER_KWH_PER_HOUR;
    const savedKWh = currentAcKWh * 0.3;
    const savedEmissions = (savedKWh * GRID_EMISSION_FACTOR_KG_PER_KWH) / clampedResidents;

    if (savedEmissions > 30) {
      recs.push({
        id: "energy-efficient-ac",
        category: "energy",
        title: "Upgrade to a 5-Star Rated AC",
        description: `A BEE 5-star rated AC uses ~30% less electricity. This could save ${Math.round(savedEmissions)} kg CO₂e/year for your household.`,
        impactKgCO2ePerYear: Math.round(savedEmissions),
        difficulty: "hard",
        costSaving: true,
      });
    }
  }

  // 3. Switch to LED lighting
  // Assume ~10% of electricity bill goes to lighting, LEDs save 75% of that
  if (monthlyElectricityBill > 500) {
    const monthlyKWh = monthlyElectricityBill / AVG_ELECTRICITY_RATE_INR_PER_KWH;
    const lightingKWh = monthlyKWh * 0.10;
    const savedKWh = lightingKWh * 0.75 * MONTHS_PER_YEAR;
    const savedEmissions = (savedKWh * GRID_EMISSION_FACTOR_KG_PER_KWH) / clampedResidents;

    if (savedEmissions > 10) {
      recs.push({
        id: "energy-led",
        category: "energy",
        title: "Switch to LED Lighting",
        description: `LEDs use 75% less energy than incandescent bulbs. Could save ~${Math.round(savedEmissions)} kg CO₂e/year.`,
        impactKgCO2ePerYear: Math.round(savedEmissions),
        difficulty: "easy",
        costSaving: true,
      });
    }
  }

  // 4. Install solar panels (for independent houses)
  if (homeType === "independent" && monthlyElectricityBill > 1000) {
    const monthlyKWh = monthlyElectricityBill / AVG_ELECTRICITY_RATE_INR_PER_KWH;
    // Solar can offset ~60-80% of household electricity
    const savedKWh = monthlyKWh * 0.7 * MONTHS_PER_YEAR;
    const savedEmissions = (savedKWh * GRID_EMISSION_FACTOR_KG_PER_KWH) / clampedResidents;

    recs.push({
      id: "energy-solar",
      category: "energy",
      title: "Install Rooftop Solar Panels",
      description: `A rooftop solar system can offset ~70% of your electricity from the grid, saving ${Math.round(savedEmissions)} kg CO₂e/year. Government subsidies (PM Surya Ghar) can reduce installation costs by 40%.`,
      impactKgCO2ePerYear: Math.round(savedEmissions),
      difficulty: "hard",
      costSaving: true,
    });
  }

  // 5. Use smart power strips
  if (monthlyElectricityBill > 800) {
    const monthlyKWh = monthlyElectricityBill / AVG_ELECTRICITY_RATE_INR_PER_KWH;
    // Standby power is ~5-10% of consumption
    const savedKWh = monthlyKWh * 0.07 * MONTHS_PER_YEAR;
    const savedEmissions = (savedKWh * GRID_EMISSION_FACTOR_KG_PER_KWH) / clampedResidents;

    if (savedEmissions > 10) {
      recs.push({
        id: "energy-standby",
        category: "energy",
        title: "Eliminate Standby Power Waste",
        description: `Devices on standby use 5-10% of your electricity. Smart power strips can save ~${Math.round(savedEmissions)} kg CO₂e/year.`,
        impactKgCO2ePerYear: Math.round(savedEmissions),
        difficulty: "easy",
        costSaving: true,
      });
    }
  }
}

function generateLifestyleRecommendations(
  input: CarbonInput,
  _result: EmissionResult,
  recs: Recommendation[]
): void {
  const { dietType, flightsPerYear, onlineShoppingFrequency, foodWasteLevel } =
    input.lifestyle;

  // 1. Reduce meat consumption
  if (dietType === "non-veg") {
    const savings = DIET_EMISSIONS["non-veg"] - DIET_EMISSIONS.eggetarian;
    recs.push({
      id: "lifestyle-reduce-meat",
      category: "lifestyle",
      title: "Reduce Meat to Weekends Only",
      description: `Switching to an eggetarian diet on weekdays saves ~${savings} kg CO₂e/year. You'll still enjoy non-veg on weekends.`,
      impactKgCO2ePerYear: savings,
      difficulty: "medium",
      costSaving: true,
    });
  }

  if (dietType === "non-veg" || dietType === "eggetarian") {
    const currentEmissions = DIET_EMISSIONS[dietType];
    const targetEmissions = DIET_EMISSIONS.vegetarian;
    const savings = currentEmissions - targetEmissions;

    recs.push({
      id: "lifestyle-go-vegetarian",
      category: "lifestyle",
      title: "Try a Vegetarian Diet",
      description: `Going vegetarian saves ~${savings} kg CO₂e/year. India has one of the world's richest vegetarian cuisines to explore.`,
      impactKgCO2ePerYear: savings,
      difficulty: "hard",
      costSaving: true,
    });
  }

  // 2. Consider plant-based diet
  if (dietType !== "vegan") {
    const currentEmissions = DIET_EMISSIONS[dietType];
    const savings = currentEmissions - DIET_EMISSIONS.vegan;

    if (savings > 200) {
      recs.push({
        id: "lifestyle-plant-based",
        category: "lifestyle",
        title: "Explore Plant-Based Meals",
        description: `Adding 3-4 fully plant-based meals per week can save ~${Math.round(savings * 0.4)} kg CO₂e/year as a first step.`,
        impactKgCO2ePerYear: Math.round(savings * 0.4),
        difficulty: "medium",
        costSaving: true,
      });
    }
  }

  // 3. Reduce flights
  if (flightsPerYear > 0) {
    const oneFlightSaving = FLIGHT_EMISSION_BLENDED;
    const reducibleFlights = Math.min(flightsPerYear, Math.max(1, Math.floor(flightsPerYear * 0.5)));
    const savings = reducibleFlights * oneFlightSaving;

    recs.push({
      id: "lifestyle-reduce-flights",
      category: "lifestyle",
      title: `Reduce ${reducibleFlights} Flight(s) per Year`,
      description: `Each avoided flight saves ~${oneFlightSaving} kg CO₂e. Consider train travel for domestic trips — Indian Railways emits 80% less CO₂ per passenger-km.`,
      impactKgCO2ePerYear: savings,
      difficulty: flightsPerYear > 4 ? "medium" : "hard",
      costSaving: true,
    });
  }

  // 4. Reduce online shopping
  if (onlineShoppingFrequency === "weekly") {
    const savings = SHOPPING_EMISSIONS.weekly - SHOPPING_EMISSIONS.monthly;

    recs.push({
      id: "lifestyle-reduce-shopping",
      category: "lifestyle",
      title: "Consolidate Online Orders",
      description: `Batching orders to monthly instead of weekly reduces packaging and delivery emissions by ~${savings} kg CO₂e/year.`,
      impactKgCO2ePerYear: savings,
      difficulty: "easy",
      costSaving: true,
    });
  }

  if (onlineShoppingFrequency === "monthly") {
    recs.push({
      id: "lifestyle-local-shopping",
      category: "lifestyle",
      title: "Shop Local When Possible",
      description: `Buying from local stores eliminates last-mile delivery emissions. Can save ~${Math.round(SHOPPING_EMISSIONS.monthly * 0.6)} kg CO₂e/year.`,
      impactKgCO2ePerYear: Math.round(SHOPPING_EMISSIONS.monthly * 0.6),
      difficulty: "easy",
      costSaving: false,
    });
  }

  // 5. Reduce food waste
  if (foodWasteLevel === "high") {
    const dietEmissions = DIET_EMISSIONS[dietType];
    const currentWasteEmissions = dietEmissions * FOOD_WASTE_MULTIPLIER.high;
    const targetWasteEmissions = dietEmissions * FOOD_WASTE_MULTIPLIER.low;
    const savings = currentWasteEmissions - targetWasteEmissions;

    recs.push({
      id: "lifestyle-reduce-waste",
      category: "lifestyle",
      title: "Reduce Food Waste",
      description: `Your high food waste adds ~${Math.round(currentWasteEmissions)} kg CO₂e/year. Meal planning and proper storage can eliminate most of this.`,
      impactKgCO2ePerYear: Math.round(savings),
      difficulty: "easy",
      costSaving: true,
    });
  }

  if (foodWasteLevel === "medium") {
    const dietEmissions = DIET_EMISSIONS[dietType];
    const currentWasteEmissions = dietEmissions * FOOD_WASTE_MULTIPLIER.medium;
    const savings = currentWasteEmissions;

    recs.push({
      id: "lifestyle-minimize-waste",
      category: "lifestyle",
      title: "Minimize Food Waste",
      description: `Your food waste adds ~${Math.round(currentWasteEmissions)} kg CO₂e/year. Try the "eat what you buy" approach with weekly meal planning.`,
      impactKgCO2ePerYear: Math.round(savings),
      difficulty: "easy",
      costSaving: true,
    });
  }

  // 6. Composting
  if (foodWasteLevel !== "low") {
    recs.push({
      id: "lifestyle-compost",
      category: "lifestyle",
      title: "Start Composting",
      description: "Composting food scraps prevents methane from landfills. A kitchen compost bin can divert ~100 kg of organic waste annually.",
      impactKgCO2ePerYear: 50,
      difficulty: "easy",
      costSaving: false,
    });
  }
}
