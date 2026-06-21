/**
 * Dashboard Layout — DEMO MODE (auth bypassed)
 */
import type { Metadata } from "next";
import { DashboardSidebar } from "@/features/dashboard/components/sidebar";
import { MOCK_USER } from "@/lib/auth";
import { CarbonProvider } from "@/contexts/CarbonContext";

export const metadata: Metadata = {
  title: "Verdure — Dashboard",
  description: "Track and reduce your personal carbon footprint with Verdure.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        userName={MOCK_USER.name}
        userEmail={MOCK_USER.email}
        userRole={MOCK_USER.role}
      />
      <main className="dashboard-layout__main" id="main-content">
        <CarbonProvider>
          {children}
        </CarbonProvider>
      </main>
    </div>
  );
}
