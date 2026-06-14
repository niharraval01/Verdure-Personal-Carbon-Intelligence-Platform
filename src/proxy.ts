/**
 * Next.js Proxy — Route Protection + Rate Limiting
 *
 * Protects:
 * - /(dashboard)/* routes → redirect to /login if no session
 * - /api/* (except /api/auth/*) → return 401 if no session
 *
 * Rate limits:
 * - /api/auth/sign-in → 5 req / 15 min / IP
 * - /api/auth/sign-up → 3 req / hour / IP
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  authLoginLimiter,
  authSignupLimiter,
} from "@/lib/rate-limit";

/**
 * Session cookie name used by Better Auth.
 * Better Auth with prefix "verdure" → "verdure.session_token"
 */
const SESSION_COOKIE = "verdure.session_token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate limiting for auth endpoints ──────────────────────
  if (pathname === "/api/auth/sign-in/email") {
    const ip = getClientIP(request);
    const result = authLoginLimiter.limit(ip);
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": String(result.remaining),
          },
        }
      );
    }
  }

  if (pathname === "/api/auth/sign-up/email") {
    const ip = getClientIP(request);
    const result = authSignupLimiter.limit(ip);
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": String(result.remaining),
          },
        }
      );
    }
  }

  // ── Let auth API requests pass through ────────────────────
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // ── Protected API routes (non-auth) ───────────────────────
  if (pathname.startsWith("/api/")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE);
    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // ── Protected dashboard routes ────────────────────────────
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/simulator") ||
    pathname.startsWith("/recommendations") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/challenges") ||
    pathname.startsWith("/coach") ||
    pathname.startsWith("/admin")
  ) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE);
    if (!sessionCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/**
 * Extract client IP from request headers.
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
