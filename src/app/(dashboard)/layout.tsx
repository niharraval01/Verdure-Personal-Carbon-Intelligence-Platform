/**
 * Dashboard Layout
 *
 * Main app shell with sidebar navigation and semantic landmarks.
 * Uses <nav>, <main>, and <aside> for accessibility.
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/features/dashboard/components/sidebar";

export const metadata: Metadata = {
  title: "Verdure — Dashboard",
  description: "Track and reduce your personal carbon footprint with Verdure.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        userName={session.user.name}
        userEmail={session.user.email}
        userRole={(session.user as { role?: string }).role ?? "user"}
      />
      <main className="dashboard-layout__main" id="main-content">
        {children}
      </main>
    </div>
  );
}
