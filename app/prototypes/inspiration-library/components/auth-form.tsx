"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/app/prototypes/inspiration-library/lib/auth-client";

export function AuthForm({ mode, configured }: { mode: "sign-in" | "sign-up"; configured: boolean }) {
  const signUp = mode === "sign-up";
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  return <form className="stack-form auth-form" onSubmit={async (e) => {
    e.preventDefault(); if (!configured || pending) return;
    setPending(true); setError("");
    const form = new FormData(e.currentTarget);
    const body = { email: String(form.get("email")), password: String(form.get("password")), callbackURL: `${window.location.origin}/prototypes/inspiration-library` };
    try {
      const result = signUp ? await authClient.signUp.email({ ...body, name: String(form.get("name")) }) : await authClient.signIn.email(body);
      if (result.error) { setError(signUp ? "We couldn’t create your account. Check your details or try signing in." : "We couldn’t sign you in. Check your email and password, or try again later."); setPending(false); return; }
      router.replace("/prototypes/inspiration-library"); router.refresh();
    } catch { setError("We couldn’t connect. Please try again in a moment."); setPending(false); }
  }}>
    {!configured && <div className="setup-notice" role="status"><strong>Your space is almost ready.</strong><p>Database setup is pending. Sign in and sign up will be available once the database is configured and the tables are prepared.</p></div>}
    {signUp && <label>Your name<input name="name" autoComplete="name" required maxLength={100} placeholder="How should we call you?" /></label>}
    <label>Email address<input type="email" name="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label>
    <label>Password<div className="password-wrap"><input type={visible ? "text" : "password"} name="password" autoComplete={signUp ? "new-password" : "current-password"} required minLength={8} maxLength={128} placeholder={signUp ? "At least 8 characters" : "Your password"} /><button className="icon-button" type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button" disabled={pending || !configured}>{pending ? "One moment…" : signUp ? "Create your library" : "Welcome back"}<ArrowUpRight size={17} /></button>
    <p className="auth-switch">{signUp ? "Already have a little space here?" : "New around here?"} <Link href={signUp ? "/prototypes/inspiration-library/sign-in" : "/prototypes/inspiration-library/sign-up"}>{signUp ? "Sign in" : "Create an account"}</Link></p>
  </form>;
}
