"use client";

import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="not-found"><span className="tiny-label">A SMALL INTERRUPTION</span><h1>Let’s try<br /><em>that again.</em></h1><p>Your library couldn’t be loaded. If you’re setting things up, check the database configuration and tables locally.</p><button className="button" onClick={reset}>Try again</button><Link className="quiet-button" href="/prototypes/inspiration-library">Back home</Link></div>;
}
