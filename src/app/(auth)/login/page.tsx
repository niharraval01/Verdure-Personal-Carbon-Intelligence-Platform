"use client";

/**
 * Login Page
 *
 * Email/password sign-in form with Zod validation.
 * Uses Better Auth client for authentication.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    // Client-side validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await signIn.email({
        email: result.data.email,
        password: result.data.password,
      });

      if (response.error) {
        setServerError(response.error.message ?? "Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Welcome back</h1>
      <p className="auth-card__subtitle">
        Sign in to continue tracking your carbon footprint
      </p>

      {serverError && (
        <div className="auth-card__error" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-field">
          <label htmlFor="login-email" className="form-field__label">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`form-field__input ${errors.email ? "form-field__input--error" : ""}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            placeholder="you@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p id="login-email-error" className="form-field__error" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="login-password" className="form-field__label">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`form-field__input ${errors.password ? "form-field__input--error" : ""}`}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.password && (
            <p id="login-password-error" className="form-field__error" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--full"
          disabled={isLoading}
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
        <Link href="/signup" className="auth-card__link">
          Create one
        </Link>
      </p>
    </div>
  );
}
