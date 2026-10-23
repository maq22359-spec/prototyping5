import type { Pool } from "pg";
import { nextCookies } from "better-auth/next-js";

// Shared by the runtime and the CLI so generated tables match the app exactly.
export function authOptions(database: Pool) {
  return {
    appName: "Inspiration library",
    database,
    emailAndPassword: { enabled: true as const, minPasswordLength: 8, maxPasswordLength: 128 },
    session: { cookieCache: { enabled: false as const } },
    rateLimit: { enabled: true as const, storage: "memory" as const },
    plugins: [nextCookies()],
  };
}
