/**
 * Better Auth — Client Configuration
 *
 * Client-side auth instance for React components.
 * Used for signIn, signUp, signOut, and session hooks.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

/**
 * Convenience exports for common auth actions.
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
