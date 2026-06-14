/**
 * Better Auth — Server Configuration
 *
 * Server-side auth instance with Prisma adapter (Supabase PostgreSQL).
 * Email/password authentication enabled.
 * Cookies: httpOnly, secure, sameSite: lax.
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

// Ensure BETTER_AUTH_URL is set for deployments (Vercel automatically provides VERCEL_URL)
if (!process.env.BETTER_AUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.BETTER_AUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NEXT_PUBLIC_APP_URL) {
    process.env.BETTER_AUTH_URL = process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },

  advanced: {
    cookiePrefix: "verdure",
    generateId: undefined, // use default cuid
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
});

/**
 * Type helper for session data.
 */
export type Session = typeof auth.$Infer.Session;
