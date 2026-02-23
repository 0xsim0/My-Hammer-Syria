import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit during hot reloading.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const logOptions = 
  process.env.NODE_ENV === "development" 
    ? ["error", "warn"] // Remove "query" to reduce noise - enable only when debugging
    : ["error"]; // Only log errors in production

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logOptions as Array<"query" | "error" | "warn" | "info">,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
