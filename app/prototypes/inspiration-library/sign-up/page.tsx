import { redirect } from "next/navigation";
import { getSession } from "@/app/prototypes/inspiration-library/lib/session";
import { isDatabaseConfigured } from "@/app/prototypes/inspiration-library/lib/db";
import { Shell } from "@/app/prototypes/inspiration-library/components/shell";
import { AuthForm } from "@/app/prototypes/inspiration-library/components/auth-form";

export const metadata = { title: "Sign up" };
export const dynamic = "force-dynamic";
export default async function SignUpPage() {
  const session = await getSession();
  if (session) redirect("/prototypes/inspiration-library");
  return <Shell><div className="auth-page"><section className="auth-intro"><div className="eyebrow"><span /> A NEW CHAPTER OF CURIOSITY</div><h1>Make a little<br /> space for<br /><em>inspiration.</em></h1><p>For the things you love, and the ideas still taking shape.</p><span className="auth-spark">✳</span></section><section className="auth-panel"><span className="tiny-label">GOOD IDEAS START HERE</span><h2>Start your library.</h2><p className="muted">A personal home for everything that inspires you.</p><AuthForm mode="sign-up" configured={isDatabaseConfigured()} /></section></div></Shell>;
}
