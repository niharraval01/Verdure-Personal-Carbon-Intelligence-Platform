"use client";

/**
 * DEMO MODE: Signup bypassed — any input accepted, redirects straight to dashboard.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    setIsLoading(true);
    // Small delay for UX feel, then redirect straight to dashboard
    await new Promise((r) => setTimeout(r, 600));
    router.push("/dashboard");
  }

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Create your account</h1>
      <p className="auth-card__subtitle">
        Start understanding and reducing your carbon footprint
      </p>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-field">
          <label htmlFor="signup-name" className="form-field__label">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-field__input"
            placeholder="Your name"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="signup-email" className="form-field__label">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-field__input"
            placeholder="you@example.com"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="signup-password" className="form-field__label">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-field__input"
            placeholder="Any password (demo mode)"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--full"
          disabled={isLoading || !name || !email || !password}
        >
          {isLoading ? (
            <span className="btn__loading">
              <span className="btn__spinner" aria-hidden="true" />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="auth-card__footer">
        Already have an account?{" "}
        <Link href="/login" className="auth-card__link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
