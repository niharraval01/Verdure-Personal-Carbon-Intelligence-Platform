"use client";

/**
 * Dashboard Sidebar Navigation
 *
 * Semantic <nav> landmark with accessible links.
 * Highlights active route, collapsible on mobile.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth/client";

interface SidebarProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/simulator", label: "Simulator", icon: "🔬" },
  { href: "/recommendations", label: "Actions", icon: "🎯" },
  { href: "/coach", label: "AI Coach", icon: "🤖" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/challenges", label: "Challenges", icon: "🏆" },
] as const;

export function DashboardSidebar({ userName, userEmail, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="sidebar__mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-expanded={isMobileOpen}
        aria-controls="sidebar-nav"
        aria-label="Toggle navigation menu"
      >
        <span className="sidebar__hamburger" aria-hidden="true">
          {isMobileOpen ? "✕" : "☰"}
        </span>
      </button>

      <aside
        id="sidebar-nav"
        className={`sidebar ${isMobileOpen ? "sidebar--open" : ""}`}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="sidebar__brand">
          <svg
            width="32"
            height="32"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="24" fill="var(--verdure-500)" />
            <path
              d="M24 12C18 18 14 24 14 30C14 35.5228 18.4772 40 24 40C29.5228 40 34 35.5228 34 30C34 24 30 18 24 12Z"
              fill="white"
              fillOpacity="0.9"
            />
          </svg>
          <span className="sidebar__brand-name">Verdure</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav" aria-label="Dashboard navigation">
          <ul className="sidebar__list" role="list">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span className="sidebar__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="sidebar__label">{item.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Admin link (conditional) */}
            {userRole === "admin" && (
              <li>
                <Link
                  href="/admin"
                  className={`sidebar__link ${pathname === "/admin" ? "sidebar__link--active" : ""}`}
                  aria-current={pathname === "/admin" ? "page" : undefined}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <span className="sidebar__icon" aria-hidden="true">⚙️</span>
                  <span className="sidebar__label">Admin</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* User info + sign out */}
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar" aria-hidden="true">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{userName}</p>
              <p className="sidebar__user-email">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="sidebar__signout"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="sidebar__overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
