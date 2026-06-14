/**
 * Simulator Page
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SimulatorPanel } from "@/features/simulator/components/simulator-panel";
import type { CarbonInput, EmissionResult } from "@/features/carbon-engine";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — What-If Simulator",
  description: "Simulate how lifestyle changes affect your carbon footprint in real-time.",
};

export default async function SimulatorPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const latestFootprint = await prisma.carbonFootprint.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!latestFootprint) redirect("/onboarding");

  const inputData = latestFootprint.inputData as unknown as CarbonInput;
  const resultData = latestFootprint.result as unknown as EmissionResult;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-header__title">What-If Simulator</h1>
        <p className="page-header__subtitle">
          Explore how changes to your habits could reduce your footprint
        </p>
      </header>
      <SimulatorPanel initialInput={inputData} currentResult={resultData} />
    </div>
  );
}
