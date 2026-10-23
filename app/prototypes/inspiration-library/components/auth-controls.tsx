"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/app/prototypes/inspiration-library/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return <div><button className="quiet-button sign-out" disabled={pending} onClick={async () => {
    setPending(true); setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error();
      router.replace("/prototypes/inspiration-library"); router.refresh();
    } catch { setError("Couldn’t sign out. Try again."); setPending(false); }
  }}><LogOut size={15} />{pending ? "Signing out…" : "Sign out"}</button>{error && <small role="alert">{error}</small>}</div>;
}
