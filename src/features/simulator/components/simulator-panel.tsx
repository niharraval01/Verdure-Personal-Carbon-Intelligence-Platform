"use client";

/**
 * Simulator Panel
 *
 * Interactive sliders that call the pure carbon engine in real-time.
 * NO API calls — direct function calls to calculateTotalEmissions().
 * All sliders are keyboard-operable with proper ARIA attributes.
 */

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { calculateTotalEmissions } from "@/features/carbon-engine";
import { calculateCarbonScore } from "@/features/carbon-score";
import type { CarbonInput, EmissionResult } from "@/features/carbon-engine";
import { BreakdownChart } from "@/features/carbon-engine/components/breakdown-chart";

interface SimulatorProps {
  initialInput: CarbonInput;
  currentResult: EmissionResult;
}

export function SimulatorPanel({ initialInput, currentResult }: SimulatorProps) {
  const shouldReduceMotion = useReducedMotion();
  const [input, setInput] = useState<CarbonInput>(initialInput);

  // Real-time calculation — pure function, no API call
  const simulatedResult = useMemo(
    () => calculateTotalEmissions(input),
    [input]
  );
  const simulatedScore = useMemo(
    () => calculateCarbonScore(simulatedResult.kgCO2ePerYear),
    [simulatedResult]
  );

  const delta = simulatedResult.kgCO2ePerYear - currentResult.kgCO2ePerYear;
  const deltaPercent = currentResult.kgCO2ePerYear > 0
    ? Math.round((delta / currentResult.kgCO2ePerYear) * 100)
    : 0;

  return (
    <motion.div
      className="simulator"
      initial={shouldReduceMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="simulator__grid">
        {/* Sliders Panel */}
        <div className="simulator__controls">
          <h2 className="simulator__section-title">What If…</h2>
          <p className="simulator__section-subtitle">
            Adjust the sliders to see how changes affect your footprint
          </p>

          {/* Transport Sliders */}
          <fieldset className="simulator__group">
            <legend className="simulator__group-title">🚗 Transport</legend>

            <div className="simulator__slider-field">
              <label htmlFor="sim-distance" className="simulator__slider-label">
                Daily distance: <strong>{input.transport.dailyDistanceKm} km</strong>
              </label>
              <input
                id="sim-distance"
                type="range"
                min={0}
                max={100}
                step={1}
                value={input.transport.dailyDistanceKm}
                onChange={(e) =>
                  setInput({
                    ...input,
                    transport: { ...input.transport, dailyDistanceKm: Number(e.target.value) },
                  })
                }
                className="simulator__slider"
                aria-valuenow={input.transport.dailyDistanceKm}
                aria-valuetext={`${input.transport.dailyDistanceKm} kilometers per day`}
                aria-label="Daily commute distance in kilometers"
              />
            </div>

            <div className="simulator__slider-field">
              <label htmlFor="sim-public" className="simulator__slider-label">
                Public transport: <strong>{input.transport.publicTransportDaysPerWeek} days/week</strong>
              </label>
              <input
                id="sim-public"
                type="range"
                min={0}
                max={7}
                step={1}
                value={input.transport.publicTransportDaysPerWeek}
                onChange={(e) =>
                  setInput({
                    ...input,
                    transport: { ...input.transport, publicTransportDaysPerWeek: Number(e.target.value) },
                  })
                }
                className="simulator__slider"
                aria-valuenow={input.transport.publicTransportDaysPerWeek}
                aria-valuetext={`${input.transport.publicTransportDaysPerWeek} days per week on public transport`}
                aria-label="Public transport days per week"
              />
            </div>

            <div className="simulator__slider-field">
              <label htmlFor="sim-vehicle" className="simulator__slider-label">
                Vehicle type
              </label>
              <select
                id="sim-vehicle"
                className="form-field__select"
                value={input.transport.vehicleType}
                onChange={(e) =>
                  setInput({
                    ...input,
                    transport: {
                      ...input.transport,
                      vehicleType: e.target.value as CarbonInput["transport"]["vehicleType"],
                    },
                  })
                }
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="bus">Bus</option>
                <option value="metro">Metro</option>
                <option value="none">None</option>
              </select>
            </div>
          </fieldset>

          {/* Energy Sliders */}
          <fieldset className="simulator__group">
            <legend className="simulator__group-title">⚡ Energy</legend>

            <div className="simulator__slider-field">
              <label htmlFor="sim-bill" className="simulator__slider-label">
                Electricity bill: <strong>₹{input.energy.monthlyElectricityBill.toLocaleString("en-IN")}</strong>
              </label>
              <input
                id="sim-bill"
                type="range"
                min={0}
                max={10000}
                step={100}
                value={input.energy.monthlyElectricityBill}
                onChange={(e) =>
                  setInput({
                    ...input,
                    energy: { ...input.energy, monthlyElectricityBill: Number(e.target.value) },
                  })
                }
                className="simulator__slider"
                aria-valuenow={input.energy.monthlyElectricityBill}
                aria-valuetext={`₹${input.energy.monthlyElectricityBill.toLocaleString("en-IN")} per month`}
                aria-label="Monthly electricity bill in rupees"
              />
            </div>

            <div className="simulator__slider-field">
              <label htmlFor="sim-ac" className="simulator__slider-label">
                AC usage: <strong>{input.energy.acUsageHoursPerDay} hours/day</strong>
              </label>
              <input
                id="sim-ac"
                type="range"
                min={0}
                max={24}
                step={0.5}
                value={input.energy.acUsageHoursPerDay}
                onChange={(e) =>
                  setInput({
                    ...input,
                    energy: { ...input.energy, acUsageHoursPerDay: Number(e.target.value) },
                  })
                }
                className="simulator__slider"
                aria-valuenow={input.energy.acUsageHoursPerDay}
                aria-valuetext={`${input.energy.acUsageHoursPerDay} hours of AC per day`}
                aria-label="AC usage hours per day"
              />
            </div>
          </fieldset>

          {/* Lifestyle Sliders */}
          <fieldset className="simulator__group">
            <legend className="simulator__group-title">🍃 Lifestyle</legend>

            <div className="simulator__slider-field">
              <label htmlFor="sim-diet" className="simulator__slider-label">
                Diet type
              </label>
              <select
                id="sim-diet"
                className="form-field__select"
                value={input.lifestyle.dietType}
                onChange={(e) =>
                  setInput({
                    ...input,
                    lifestyle: {
                      ...input.lifestyle,
                      dietType: e.target.value as CarbonInput["lifestyle"]["dietType"],
                    },
                  })
                }
              >
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
              </select>
            </div>

            <div className="simulator__slider-field">
              <label htmlFor="sim-flights" className="simulator__slider-label">
                Flights/year: <strong>{input.lifestyle.flightsPerYear}</strong>
              </label>
              <input
                id="sim-flights"
                type="range"
                min={0}
                max={20}
                step={1}
                value={input.lifestyle.flightsPerYear}
                onChange={(e) =>
                  setInput({
                    ...input,
                    lifestyle: { ...input.lifestyle, flightsPerYear: Number(e.target.value) },
                  })
                }
                className="simulator__slider"
                aria-valuenow={input.lifestyle.flightsPerYear}
                aria-valuetext={`${input.lifestyle.flightsPerYear} flights per year`}
                aria-label="Flights per year"
              />
            </div>
          </fieldset>
        </div>

        {/* Results Panel */}
        <div className="simulator__results">
          {/* Delta Display */}
          <div className={`simulator__delta ${delta < 0 ? "simulator__delta--better" : delta > 0 ? "simulator__delta--worse" : ""}`}>
            <div className="simulator__delta-value">
              {delta > 0 ? "+" : ""}{Math.round(delta).toLocaleString()} kg
            </div>
            <div className="simulator__delta-percent">
              {deltaPercent > 0 ? "+" : ""}{deltaPercent}% vs current
            </div>
            <div className="simulator__delta-label">
              {delta < 0 ? "🌱 Reduction" : delta > 0 ? "⚠️ Increase" : "No change"}
            </div>
          </div>

          {/* Simulated Score */}
          <div className="simulator__score">
            <div className="simulator__score-value">{simulatedScore.score}</div>
            <div className="simulator__score-label">Simulated Score</div>
            <div className="simulator__score-emissions">
              {(simulatedResult.kgCO2ePerYear / 1000).toFixed(1)} t CO₂e/yr
            </div>
          </div>

          {/* Simulated Breakdown */}
          <BreakdownChart
            breakdown={simulatedResult.breakdown}
            totalKg={simulatedResult.kgCO2ePerYear}
          />
        </div>
      </div>
    </motion.div>
  );
}
