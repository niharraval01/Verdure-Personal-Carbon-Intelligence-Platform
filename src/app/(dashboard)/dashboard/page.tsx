/**
 * Dashboard Page
 */
import { DashboardClient } from "./dashboard-client";
import { MOCK_USER } from "@/lib/auth";

export default async function DashboardPage() {
  return (
    <div className="page-container">
      <header className="dashboard-header">
        <h1 className="dashboard-header__title">Welcome back, {MOCK_USER.name}</h1>
        <p className="dashboard-header__subtitle">
          Here&apos;s your carbon footprint snapshot
        </p>
      </header>

      <DashboardClient />
    </div>
  );
}
