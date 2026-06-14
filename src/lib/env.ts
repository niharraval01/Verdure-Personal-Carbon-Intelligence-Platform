/**
 * Environment Configuration — Zod-Validated
 *
 * Single source of truth for environment variables.
 * Fails fast at boot time if required vars are missing.
 *
 * Uses Supabase for PostgreSQL and OpenRouter for AI.
 */

import { z } from "zod";

const envSchema = z.object({
  // ── Database (Supabase PostgreSQL) ──
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL connection string"),

  DIRECT_URL: z
    .string()
    .url("DIRECT_URL must be a valid direct PostgreSQL connection string")
    .optional(),

  // ── Auth (Better Auth) ──
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),

  BETTER_AUTH_URL: z
    .string()
    .url("BETTER_AUTH_URL must be a valid URL (e.g. http://localhost:3000)"),

  // ── AI Coach (OpenRouter / Nemotron) ──
  OPENROUTER_API_KEY: z
    .string()
    .min(1, "OPENROUTER_API_KEY is required"),

  OPENROUTER_MODEL: z
    .string()
    .default("nvidia/llama-3.1-nemotron-ultra-253b-v1:free"),

  // ── Application ──
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
});

/**
 * Validated environment variables.
 * This call will throw a descriptive ZodError at import time
 * if any required variable is missing or malformed.
 */
export const env = envSchema.parse(process.env);

/**
 * Type-safe environment variable access.
 */
export type Env = z.infer<typeof envSchema>;
