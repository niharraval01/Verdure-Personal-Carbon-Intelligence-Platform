"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import type { CarbonInput, EmissionResult } from "@/features/carbon-engine";
import { calculateTotalEmissions } from "@/features/carbon-engine";
import type { CarbonScore } from "@/features/carbon-score";
import { calculateCarbonScore } from "@/features/carbon-score";
import type { RecommendationCategory } from "@/features/recommendations";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  impactKg: number;
  durationDays: number;
  isJoined: boolean;
  isCompleted: boolean;
};

export type Recommendation = {
  id: string;
  dbId: string;
  category: RecommendationCategory;
  title: string;
  impactKg: number;
  isCompleted: boolean;
};

interface CarbonContextState {
  carbonInput: CarbonInput;
  emissionResult: EmissionResult;
  carbonScore: CarbonScore;
  challenges: Challenge[];
  recommendations: Recommendation[];
  updateCarbonInput: (newInput: CarbonInput) => void;
  toggleChallengeJoined: (id: string) => void;
  toggleChallengeCompleted: (id: string) => void;
  toggleRecommendationCompleted: (id: string) => void;
}

const INITIAL_INPUT: CarbonInput = {
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

const INITIAL_CHALLENGES: Challenge[] = [
  { id: "ch-1", title: "Car-Free Week", description: "Avoid using personal vehicles for 7 days. Use walking, cycling, or public transport.", category: "transport", impactKg: 35, durationDays: 7, isJoined: true, isCompleted: false },
  { id: "ch-2", title: "Meatless Monday", description: "Go vegetarian every Monday for a month to reduce your dietary carbon footprint.", category: "lifestyle", impactKg: 24, durationDays: 30, isJoined: false, isCompleted: false },
  { id: "ch-3", title: "Zero Food Waste", description: "Plan meals carefully and eliminate food waste for two weeks.", category: "lifestyle", impactKg: 18, durationDays: 14, isJoined: true, isCompleted: true },
  { id: "ch-4", title: "Home Energy Audit", description: "Identify and fix energy leaks in your home — seal drafts, adjust thermostat, unplug standby devices.", category: "energy", impactKg: 45, durationDays: 3, isJoined: false, isCompleted: false },
  { id: "ch-5", title: "Shop Local Month", description: "Buy only locally produced goods for 30 days to reduce transport emissions.", category: "lifestyle", impactKg: 20, durationDays: 30, isJoined: false, isCompleted: false },
  { id: "ch-6", title: "Cold Shower Sprint", description: "Take cold showers for 10 days to reduce hot water energy usage.", category: "energy", impactKg: 8, durationDays: 10, isJoined: false, isCompleted: false },
];

const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  { id: "rec-1", dbId: "db-1", category: "transport", title: "Switch to electric vehicle or EV sharing", impactKg: 1200, isCompleted: false },
  { id: "rec-2", dbId: "db-2", category: "energy", title: "Install rooftop solar panels", impactKg: 900, isCompleted: true },
  { id: "rec-3", dbId: "db-3", category: "lifestyle", title: "Adopt a plant-based diet 3 days/week", impactKg: 600, isCompleted: false },
  { id: "rec-4", dbId: "db-4", category: "transport", title: "Use public transport for daily commute", impactKg: 480, isCompleted: false },
  { id: "rec-5", dbId: "db-5", category: "energy", title: "Switch to LED lighting throughout home", impactKg: 120, isCompleted: true },
  { id: "rec-6", dbId: "db-6", category: "lifestyle", title: "Reduce single-use plastic consumption", impactKg: 95, isCompleted: false },
  { id: "rec-7", dbId: "db-7", category: "transport", title: "Carpool to work at least 3 days/week", impactKg: 320, isCompleted: false },
  { id: "rec-8", dbId: "db-8", category: "energy", title: "Use a smart thermostat to optimize heating/cooling", impactKg: 200, isCompleted: false },
];

const CarbonContext = createContext<CarbonContextState | undefined>(undefined);

export function CarbonProvider({ children }: { children: React.ReactNode }) {
  const [carbonInput, setCarbonInput] = useState<CarbonInput>(INITIAL_INPUT);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(INITIAL_RECOMMENDATIONS);

  // Derived state based on the engine
  const emissionResult = useMemo(() => calculateTotalEmissions(carbonInput), [carbonInput]);
  const carbonScore = useMemo(() => calculateCarbonScore(emissionResult.kgCO2ePerYear), [emissionResult]);

  const updateCarbonInput = (newInput: CarbonInput) => {
    setCarbonInput(newInput);
  };

  const toggleChallengeJoined = (id: string) => {
    setChallenges((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, isJoined: !ch.isJoined } : ch))
    );
  };

  const toggleChallengeCompleted = (id: string) => {
    setChallenges((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, isCompleted: !ch.isCompleted } : ch))
    );
  };

  const toggleRecommendationCompleted = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, isCompleted: !rec.isCompleted } : rec))
    );
  };

  const value: CarbonContextState = {
    carbonInput,
    emissionResult,
    carbonScore,
    challenges,
    recommendations,
    updateCarbonInput,
    toggleChallengeJoined,
    toggleChallengeCompleted,
    toggleRecommendationCompleted,
  };

  return <CarbonContext.Provider value={value}>{children}</CarbonContext.Provider>;
}

export function useCarbon() {
  const context = useContext(CarbonContext);
  if (context === undefined) {
    throw new Error("useCarbon must be used within a CarbonProvider");
  }
  return context;
}
