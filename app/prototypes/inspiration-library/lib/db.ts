import "server-only";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as { inspirationPool?: Pool };

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

// A Pool is lazy: constructing it never opens a connection or creates tables.
export function getPool(): Pool {
  if (!isDatabaseConfigured()) throw new Error("Database is not configured.");
  if (!globalForDb.inspirationPool) {
    globalForDb.inspirationPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
    });
    globalForDb.inspirationPool.on("error", () => {
      // Do not log connection errors: drivers may include connection details.
      console.error("An idle database connection failed.");
    });
  }
  return globalForDb.inspirationPool;
}
