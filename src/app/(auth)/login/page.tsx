"use client";

/**
 * DEMO MODE: Login bypassed — any input accepted, redirects to dashboard.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push("/dashboard");
  }

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Welcome back</h1>
      <p className="auth-card__subtitle">Sign in to your Verdure account</p>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-field">
          <label htmlFor="login-email" className="form-field__label">Email</label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="form-field__label">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-field__input"
            placeholder="Your password"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--full"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <span className="btn__loading">
              <span className="btn__spinner" aria-hidden="true" />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="auth-card__footer">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="auth-card__link">Create one</Link>
      </p>
    </div>
  );
}
