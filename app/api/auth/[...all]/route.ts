import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/app/prototypes/inspiration-library/lib/auth";
import { isDatabaseConfigured } from "@/app/prototypes/inspiration-library/lib/db";

export const runtime = "nodejs";

async function handler(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json({ message: "Database setup is pending. Add DATABASE_URL to .env.local and prepare the tables before signing in." }, { status: 503 });
  }
  return toNextJsHandler(getAuth())[request.method === "GET" ? "GET" : "POST"](request);
}
export { handler as GET, handler as POST };
