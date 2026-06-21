"use client";

import { SimulatorPanel } from "@/features/simulator/components/simulator-panel";
import { useCarbon } from "@/contexts/CarbonContext";

export function SimulatorClient() {
  const { carbonInput, emissionResult, updateCarbonInput } = useCarbon();

  return (
    <SimulatorPanel 
      initialInput={carbonInput} 
      currentResult={emissionResult} 
      onSave={updateCarbonInput}
    />
  );
}
