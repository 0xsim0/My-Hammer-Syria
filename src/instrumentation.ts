export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prisma } = await import("./lib/prisma");
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      // Warmup failure is non-fatal
    }
  }
}
