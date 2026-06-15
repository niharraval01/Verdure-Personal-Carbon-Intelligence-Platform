"use client";

/**
 * Signup Page
 *
 * Email/password registration with Zod validation.
 * Uses Better Auth client for account creation.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth/client";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const result = signupSchema.safeParse({ name, email, password });
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
      const response = await signUp.email({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      });

      if (response.error) {
        setServerError(
          response.error.message ?? "Could not create account. Please try again."
        );
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch (e) {
      console.error("Signup error:", e);
      setServerError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Create your account</h1>
      <p className="auth-card__subtitle">
        Start understanding and reducing your carbon footprint
      </p>

      {serverError && (
        <div className="auth-card__error" role="alert">
          {serverError}
        </div>
      )}

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
            className={`form-field__input ${errors.name ? "form-field__input--error" : ""}`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "signup-name-error" : undefined}
            placeholder="Your name"
            disabled={isLoading}
          />
          {errors.name && (
            <p id="signup-name-error" className="form-field__error" role="alert">
              {errors.name}
            </p>
          )}
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
            className={`form-field__input ${errors.email ? "form-field__input--error" : ""}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            placeholder="you@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p id="signup-email-error" className="form-field__error" role="alert">
              {errors.email}
            </p>
          )}
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
            className={`form-field__input ${errors.password ? "form-field__input--error" : ""}`}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "signup-password-error" : undefined}
            placeholder="At least 8 characters"
            disabled={isLoading}
          />
          {errors.password && (
            <p id="signup-password-error" className="form-field__error" role="alert">
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
