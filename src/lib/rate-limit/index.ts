/**
 * In-Memory Rate Limiter
 *
 * Sliding window rate limiter for development/free-tier deployments.
 * No external dependencies (no Redis/Upstash needed).
 *
 * NOTE: This is per-process. In a multi-instance deployment,
 * replace with @upstash/ratelimit for distributed rate limiting.
 *
 * Implements sliding window algorithm:
 * - Tracks timestamps of all requests within the window
 * - Evicts expired entries on each check
 * - Memory-bounded via periodic cleanup
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Maximum requests allowed */
  limit: number;
  /** Milliseconds until the oldest request in the window expires */
  retryAfterMs: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: RateLimitConfig) {
    this.config = config;
    // Periodic cleanup every 60 seconds to prevent memory leaks
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
    // Allow garbage collection of the interval
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Check if a request from the given identifier should be allowed.
   */
  limit(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or create entry
    let entry = this.store.get(identifier);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(identifier, entry);
    }

    // Evict timestamps outside the window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    // Check if under limit
    if (entry.timestamps.length < this.config.maxRequests) {
      entry.timestamps.push(now);
      return {
        success: true,
        remaining: this.config.maxRequests - entry.timestamps.length,
        limit: this.config.maxRequests,
        retryAfterMs: 0,
      };
    }

    // Over limit — calculate retry-after
    const oldestInWindow = entry.timestamps[0] ?? now;
    const retryAfterMs = oldestInWindow + this.config.windowMs - now;

    return {
      success: false,
      remaining: 0,
      limit: this.config.maxRequests,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  /**
   * Remove expired entries to bound memory usage.
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [key, entry] of this.store.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
      if (entry.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Dispose of the cleanup interval (for testing).
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Pre-configured rate limiters
// ─────────────────────────────────────────────────────────────

/**
 * Login: 5 requests per 15 minutes per IP
 */
export const authLoginLimiter = new InMemoryRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
});

/**
 * Signup: 3 requests per hour per IP
 */
export const authSignupLimiter = new InMemoryRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000,
});

/**
 * AI Coach: 10 requests per hour per user
 */
export const coachLimiter = new InMemoryRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000,
});

/**
 * General API: 60 requests per minute per IP
 */
export const apiLimiter = new InMemoryRateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000,
});

export { InMemoryRateLimiter };
export type { RateLimitConfig, RateLimitResult };
