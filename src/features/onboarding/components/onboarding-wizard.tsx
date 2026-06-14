"use client";

/**
 * Onboarding Wizard
 *
 * Multi-step form: Transport → Energy → Lifestyle → Review.
 * Uses Zod schemas for validation, shows live score preview on review.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { transportInputSchema, energyInputSchema, lifestyleInputSchema } from "@/lib/validation/onboarding";
import { calculateTotalEmissions } from "@/features/carbon-engine";
import { calculateCarbonScore } from "@/features/carbon-score";
import type { TransportInput, EnergyInput, LifestyleInput } from "@/features/carbon-engine";

const STEPS = ["Transport", "Energy", "Lifestyle", "Review"] as const;

type StepErrors = Record<string, string>;

export function OnboardingWizard() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Form state
  const [transport, setTransport] = useState<TransportInput>({
    vehicleType: "car",
    fuelType: "petrol",
    dailyDistanceKm: 15,
    publicTransportDaysPerWeek: 0,
  });

  const [energy, setEnergy] = useState<EnergyInput>({
    homeType: "apartment",
    residents: 3,
    monthlyElectricityBill: 2000,
    acUsageHoursPerDay: 4,
  });

  const [lifestyle, setLifestyle] = useState<LifestyleInput>({
    dietType: "vegetarian",
    flightsPerYear: 1,
    onlineShoppingFrequency: "monthly",
    foodWasteLevel: "medium",
  });

  // Live preview (calculated on review step)
  const preview = calculateTotalEmissions({ transport, energy, lifestyle });
  const scorePreview = calculateCarbonScore(preview.kgCO2ePerYear);

  const validateStep = useCallback(() => {
    setErrors({});
    let result;

    switch (currentStep) {
      case 0:
        result = transportInputSchema.safeParse(transport);
        break;
      case 1:
        result = energyInputSchema.safeParse(energy);
        break;
      case 2:
        result = lifestyleInputSchema.safeParse(lifestyle);
        break;
      default:
        return true;
    }

    if (!result || result.success) return true;

    const fieldErrors: StepErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join(".");
      fieldErrors[field] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  }, [currentStep, transport, energy, lifestyle]);

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setErrors({});
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transport, energy, lifestyle }),
      });

      if (!response.ok) {
        const data = await response.json();
        setServerError(data.error ?? "Failed to save your data. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const animationProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.3 },
      };

  return (
    <div className="onboarding">
      {/* Progress indicator */}
      <div className="onboarding__progress" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label={`Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep]}`}>
        <div className="onboarding__steps">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`onboarding__step ${
                index === currentStep ? "onboarding__step--active" : ""
              } ${index < currentStep ? "onboarding__step--completed" : ""}`}
            >
              <div className="onboarding__step-number">
                {index < currentStep ? "✓" : index + 1}
              </div>
              <span className="onboarding__step-label">{step}</span>
            </div>
          ))}
        </div>
        <div className="onboarding__progress-bar">
          <div
            className="onboarding__progress-fill"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="onboarding__content">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="transport" {...animationProps}>
              <h2 className="onboarding__title">🚗 How do you commute?</h2>
              <p className="onboarding__subtitle">Tell us about your daily transportation</p>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="ob-vehicle-type" className="form-field__label">Vehicle Type</label>
                  <select
                    id="ob-vehicle-type"
                    className="form-field__select"
                    value={transport.vehicleType}
                    onChange={(e) => setTransport({ ...transport, vehicleType: e.target.value as TransportInput["vehicleType"] })}
                    aria-invalid={!!errors.vehicleType}
                    aria-describedby={errors.vehicleType ? "ob-vehicle-type-error" : undefined}
                  >
                    <option value="car">Car</option>
                    <option value="bike">Motorcycle/Scooter</option>
                    <option value="bus">Bus</option>
                    <option value="metro">Metro</option>
                    <option value="train">Train</option>
                    <option value="none">None (WFH/Walk/Cycle)</option>
                  </select>
                  {errors.vehicleType && <p id="ob-vehicle-type-error" className="form-field__error" role="alert">{errors.vehicleType}</p>}
                </div>

                {(transport.vehicleType === "car" || transport.vehicleType === "bike") && (
                  <div className="form-field">
                    <label htmlFor="ob-fuel-type" className="form-field__label">Fuel Type</label>
                    <select
                      id="ob-fuel-type"
                      className="form-field__select"
                      value={transport.fuelType ?? "petrol"}
                      onChange={(e) => setTransport({ ...transport, fuelType: e.target.value as TransportInput["fuelType"] })}
                      aria-invalid={!!errors.fuelType}
                      aria-describedby={errors.fuelType ? "ob-fuel-type-error" : undefined}
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="cng">CNG</option>
                      <option value="electric">Electric</option>
                    </select>
                    {errors.fuelType && <p id="ob-fuel-type-error" className="form-field__error" role="alert">{errors.fuelType}</p>}
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="ob-distance" className="form-field__label">Daily Commute Distance (km)</label>
                  <input
                    id="ob-distance"
                    type="number"
                    className="form-field__input"
                    value={transport.dailyDistanceKm}
                    onChange={(e) => setTransport({ ...transport, dailyDistanceKm: Number(e.target.value) })}
                    min={0}
                    max={500}
                    aria-invalid={!!errors.dailyDistanceKm}
                    aria-describedby={errors.dailyDistanceKm ? "ob-distance-error" : undefined}
                  />
                  {errors.dailyDistanceKm && <p id="ob-distance-error" className="form-field__error" role="alert">{errors.dailyDistanceKm}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="ob-public-days" className="form-field__label">Public Transport Days/Week</label>
                  <input
                    id="ob-public-days"
                    type="number"
                    className="form-field__input"
                    value={transport.publicTransportDaysPerWeek}
                    onChange={(e) => setTransport({ ...transport, publicTransportDaysPerWeek: Number(e.target.value) })}
                    min={0}
                    max={7}
                    aria-invalid={!!errors.publicTransportDaysPerWeek}
                    aria-describedby={errors.publicTransportDaysPerWeek ? "ob-public-error" : undefined}
                  />
                  {errors.publicTransportDaysPerWeek && <p id="ob-public-error" className="form-field__error" role="alert">{errors.publicTransportDaysPerWeek}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="energy" {...animationProps}>
              <h2 className="onboarding__title">⚡ Your Energy Usage</h2>
              <p className="onboarding__subtitle">Help us estimate your household energy consumption</p>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="ob-home-type" className="form-field__label">Home Type</label>
                  <select
                    id="ob-home-type"
                    className="form-field__select"
                    value={energy.homeType}
                    onChange={(e) => setEnergy({ ...energy, homeType: e.target.value as EnergyInput["homeType"] })}
                  >
                    <option value="apartment">Apartment/Flat</option>
                    <option value="independent">Independent House</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="ob-residents" className="form-field__label">Number of Residents</label>
                  <input
                    id="ob-residents"
                    type="number"
                    className="form-field__input"
                    value={energy.residents}
                    onChange={(e) => setEnergy({ ...energy, residents: Number(e.target.value) })}
                    min={1}
                    max={20}
                    aria-invalid={!!errors.residents}
                    aria-describedby={errors.residents ? "ob-residents-error" : undefined}
                  />
                  {errors.residents && <p id="ob-residents-error" className="form-field__error" role="alert">{errors.residents}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="ob-bill" className="form-field__label">Monthly Electricity Bill (₹)</label>
                  <input
                    id="ob-bill"
                    type="number"
                    className="form-field__input"
                    value={energy.monthlyElectricityBill}
                    onChange={(e) => setEnergy({ ...energy, monthlyElectricityBill: Number(e.target.value) })}
                    min={0}
                    max={100000}
                    aria-invalid={!!errors.monthlyElectricityBill}
                    aria-describedby={errors.monthlyElectricityBill ? "ob-bill-error" : undefined}
                  />
                  {errors.monthlyElectricityBill && <p id="ob-bill-error" className="form-field__error" role="alert">{errors.monthlyElectricityBill}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="ob-ac" className="form-field__label">AC Usage (hours/day)</label>
                  <input
                    id="ob-ac"
                    type="number"
                    className="form-field__input"
                    value={energy.acUsageHoursPerDay}
                    onChange={(e) => setEnergy({ ...energy, acUsageHoursPerDay: Number(e.target.value) })}
                    min={0}
                    max={24}
                    step={0.5}
                    aria-invalid={!!errors.acUsageHoursPerDay}
                    aria-describedby={errors.acUsageHoursPerDay ? "ob-ac-error" : undefined}
                  />
                  {errors.acUsageHoursPerDay && <p id="ob-ac-error" className="form-field__error" role="alert">{errors.acUsageHoursPerDay}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="lifestyle" {...animationProps}>
              <h2 className="onboarding__title">🍃 Your Lifestyle</h2>
              <p className="onboarding__subtitle">A few questions about your daily habits</p>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="ob-diet" className="form-field__label">Diet Type</label>
                  <select
                    id="ob-diet"
                    className="form-field__select"
                    value={lifestyle.dietType}
                    onChange={(e) => setLifestyle({ ...lifestyle, dietType: e.target.value as LifestyleInput["dietType"] })}
                  >
                    <option value="vegan">Vegan</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="eggetarian">Eggetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="ob-flights" className="form-field__label">Flights per Year</label>
                  <input
                    id="ob-flights"
                    type="number"
                    className="form-field__input"
                    value={lifestyle.flightsPerYear}
                    onChange={(e) => setLifestyle({ ...lifestyle, flightsPerYear: Number(e.target.value) })}
                    min={0}
                    max={100}
                    aria-invalid={!!errors.flightsPerYear}
                    aria-describedby={errors.flightsPerYear ? "ob-flights-error" : undefined}
                  />
                  {errors.flightsPerYear && <p id="ob-flights-error" className="form-field__error" role="alert">{errors.flightsPerYear}</p>}
                </div>

                <div className="form-field">
                  <label htmlFor="ob-shopping" className="form-field__label">Online Shopping Frequency</label>
                  <select
                    id="ob-shopping"
                    className="form-field__select"
                    value={lifestyle.onlineShoppingFrequency}
                    onChange={(e) => setLifestyle({ ...lifestyle, onlineShoppingFrequency: e.target.value as LifestyleInput["onlineShoppingFrequency"] })}
                  >
                    <option value="never">Rarely/Never</option>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="ob-waste" className="form-field__label">Food Waste Level</label>
                  <select
                    id="ob-waste"
                    className="form-field__select"
                    value={lifestyle.foodWasteLevel}
                    onChange={(e) => setLifestyle({ ...lifestyle, foodWasteLevel: e.target.value as LifestyleInput["foodWasteLevel"] })}
                  >
                    <option value="low">Low (rarely waste food)</option>
                    <option value="medium">Medium (some waste)</option>
                    <option value="high">High (frequently waste food)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="review" {...animationProps}>
              <h2 className="onboarding__title">📊 Your Carbon Preview</h2>
              <p className="onboarding__subtitle">Here&apos;s an estimate based on your inputs</p>

              {serverError && (
                <div className="auth-card__error" role="alert">{serverError}</div>
              )}

              <div className="onboarding__preview">
                <div className="onboarding__preview-score">
                  <div className="onboarding__preview-number" style={{ color: scorePreview.score >= 70 ? "#059669" : scorePreview.score >= 50 ? "#d97706" : "#dc2626" }}>
                    {scorePreview.score}
                  </div>
                  <div className="onboarding__preview-label">Carbon Score</div>
                  <div className="onboarding__preview-emissions">
                    {(preview.kgCO2ePerYear / 1000).toFixed(1)} tonnes CO₂e/year
                  </div>
                </div>

                <div className="onboarding__preview-breakdown">
                  {Object.entries(preview.breakdown).map(([key, value]) => {
                    const percentage = preview.kgCO2ePerYear > 0 ? Math.round((value / preview.kgCO2ePerYear) * 100) : 0;
                    return (
                      <div key={key} className="onboarding__preview-item">
                        <span className="onboarding__preview-category">
                          {key === "transport" ? "🚗" : key === "energy" ? "⚡" : "🍃"} {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <span className="onboarding__preview-value">
                          {Math.round(value).toLocaleString()} kg ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="onboarding__actions">
        {currentStep > 0 && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            ← Back
          </button>
        )}
        <div className="onboarding__actions-spacer" />
        {currentStep < STEPS.length - 1 ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleNext}
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save & View Dashboard →"}
          </button>
        )}
      </div>
    </div>
  );
}
