import { loadEnvFile } from "node:process";
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { authOptions } from "./app/prototypes/inspiration-library/lib/auth-options";

// Next.js loads this automatically for the app; the standalone CLI needs it too.
loadEnvFile(".env.local");
if (!process.env.DATABASE_URL?.trim()) throw new Error("DATABASE_URL is not configured locally.");

export const auth = betterAuth(authOptions(new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 1_000,
})));
