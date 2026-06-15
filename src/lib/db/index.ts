/**
 * Prisma Client Singleton
 *
 * Standard Next.js pattern: uses globalThis to prevent
 * multiple PrismaClient instances in development (hot reload).
 *
 * In production, a single instance is created and reused.
 *
 * We explicitly pass datasourceUrl so that Next.js env priority
 * (.env.local > .env) is respected — Prisma's own loader reads
 * .env first and would otherwise ignore .env.local overrides.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

