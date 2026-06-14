/**
 * Auth Layout
 *
 * Centered layout for login and signup pages.
 * Clean, minimal design with brand presence.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdure — Sign In",
  description: "Sign in to your Verdure account to track your carbon footprint.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__brand">
        <div className="auth-layout__logo">
          <svg
            width="48"
            height="48"
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
            <path
              d="M24 20V32M24 32L20 28M24 32L28 28"
              stroke="var(--verdure-700)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="auth-layout__title">Verdure</span>
        </div>
        <p className="auth-layout__tagline">
          Your personal carbon intelligence platform
        </p>
      </div>
      <main className="auth-layout__content">{children}</main>
    </div>
  );
}
