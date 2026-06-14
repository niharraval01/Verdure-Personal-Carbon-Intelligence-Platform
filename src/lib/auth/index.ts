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
  ],
});

/**
 * Type helper for session data.
 */
export type Session = typeof auth.$Infer.Session;
