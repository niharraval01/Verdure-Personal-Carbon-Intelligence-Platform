/**
 * Shared Zod Validation Schemas
 *
 * Single source of truth: schema → TS type → form validation → API validation.
 * These schemas are used by:
 * - Onboarding form (client-side validation)
 * - Server Actions (server-side validation)
 * - API Route Handlers (input parsing)
 */

import { z } from "zod";

// ── Transport Schema ───────────────────────────────────────

export const vehicleTypeSchema = z.enum(
  ["car", "bike", "bus", "metro", "train", "none"],
  { error: "Please select a vehicle type" }
);

export const fuelTypeSchema = z.enum(
  ["petrol", "diesel", "cng", "electric"],
  { error: "Please select a fuel type" }
);

export const transportInputSchema = z
  .object({
    vehicleType: vehicleTypeSchema,
    fuelType: fuelTypeSchema.optional(),
    dailyDistanceKm: z
      .number({ error: "Distance must be a number" })
      .min(0, "Distance cannot be negative")
      .max(500, "Distance seems too high (max 500 km/day)"),
    publicTransportDaysPerWeek: z
      .number({ error: "Days must be a number" })
      .int("Days must be a whole number")
      .min(0, "Cannot be negative")
      .max(7, "Maximum 7 days per week"),
  })
  .refine(
    (data) => {
      // Fuel type required for car and bike (unless electric bike has default)
      if (data.vehicleType === "car") return data.fuelType !== undefined;
      return true;
    },
    { message: "Please select a fuel type for your car", path: ["fuelType"] }
  );

// ── Energy Schema ──────────────────────────────────────────

export const homeTypeSchema = z.enum(["apartment", "independent"], {
  error: "Please select a home type",
});

export const energyInputSchema = z.object({
  homeType: homeTypeSchema,
  residents: z
    .number({ error: "Residents must be a number" })
    .int("Must be a whole number")
    .min(1, "At least 1 resident")
    .max(20, "Maximum 20 residents"),
  monthlyElectricityBill: z
    .number({ error: "Bill must be a number" })
    .min(0, "Bill cannot be negative")
    .max(100000, "Bill seems too high (max ₹1,00,000)"),
  acUsageHoursPerDay: z
    .number({ error: "Hours must be a number" })
    .min(0, "Cannot be negative")
    .max(24, "Maximum 24 hours per day"),
});

// ── Lifestyle Schema ───────────────────────────────────────

export const dietTypeSchema = z.enum(
  ["vegetarian", "vegan", "eggetarian", "non-veg"],
  { error: "Please select a diet type" }
);

export const shoppingFrequencySchema = z.enum(
  ["never", "monthly", "weekly"],
  { error: "Please select a frequency" }
);

export const wasteLevelSchema = z.enum(["low", "medium", "high"], {
  error: "Please select a waste level",
});

export const lifestyleInputSchema = z.object({
  dietType: dietTypeSchema,
  flightsPerYear: z
    .number({ error: "Flights must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(100, "Maximum 100 flights per year"),
  onlineShoppingFrequency: shoppingFrequencySchema,
  foodWasteLevel: wasteLevelSchema,
});

// ── Combined Carbon Input Schema ───────────────────────────

export const carbonInputSchema = z.object({
  transport: transportInputSchema,
  energy: energyInputSchema,
  lifestyle: lifestyleInputSchema,
});

// ── Derived TypeScript types ───────────────────────────────
// Use these instead of the types from carbon-engine for form state,
// as they include the Zod refinements.

export type TransportFormInput = z.infer<typeof transportInputSchema>;
export type EnergyFormInput = z.infer<typeof energyInputSchema>;
export type LifestyleFormInput = z.infer<typeof lifestyleInputSchema>;
export type CarbonFormInput = z.infer<typeof carbonInputSchema>;

// ── Coach Message Schema ───────────────────────────────────

export const coachMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(500, "Message too long (max 500 characters)")
    .trim(),
});

export type CoachMessageInput = z.infer<typeof coachMessageSchema>;
