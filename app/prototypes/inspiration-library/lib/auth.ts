import "server-only";
import { betterAuth } from "better-auth";
import { getPool } from "@/app/prototypes/inspiration-library/lib/db";
import { authOptions } from "@/app/prototypes/inspiration-library/lib/auth-options";

function createAuthInstance() {
  return betterAuth(authOptions(getPool()));
}

let instance: ReturnType<typeof createAuthInstance> | undefined;

// Deliberately lazy so the landing page works before Supabase is configured.
export function getAuth() {
  if (!instance) instance = createAuthInstance();
  return instance;
}
