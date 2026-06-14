import type { Metadata } from "next";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";

export const metadata: Metadata = {
  title: "Verdure — Calculate Your Footprint",
  description: "Answer a few questions to calculate your personal carbon footprint.",
};

export default function OnboardingPage() {
  return (
    <div className="page-container">
      <OnboardingWizard />
    </div>
  );
}
