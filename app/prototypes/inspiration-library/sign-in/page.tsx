import { redirect } from "next/navigation";
import { getSession } from "@/app/prototypes/inspiration-library/lib/session";
import { isDatabaseConfigured } from "@/app/prototypes/inspiration-library/lib/db";
import { Shell } from "@/app/prototypes/inspiration-library/components/shell";
import { AuthForm } from "@/app/prototypes/inspiration-library/components/auth-form";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";
export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect("/prototypes/inspiration-library");
  return <Shell><div className="auth-page"><section className="auth-intro"><div className="eyebrow"><span /> PICK UP WHERE YOU LEFT OFF</div><h1>Your ideas<br /> are waiting<br /><em>for you.</em></h1><p>A familiar place for your ever-curious mind.</p><span className="auth-spark">✳</span></section><section className="auth-panel"><span className="tiny-label">YOUR PERSONAL SPACE</span><h2>Welcome back.</h2><p className="muted">Sign in to find a little inspiration.</p><AuthForm mode="sign-in" configured={isDatabaseConfigured()} /></section></div></Shell>;
}
