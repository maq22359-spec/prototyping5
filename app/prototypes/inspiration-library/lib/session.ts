import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/app/prototypes/inspiration-library/lib/auth";
import { isDatabaseConfigured } from "@/app/prototypes/inspiration-library/lib/db";

export async function getSession() {
  if (!isDatabaseConfigured()) return null;
  return getAuth().api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/prototypes/inspiration-library/sign-in");
  return session.user;
}
