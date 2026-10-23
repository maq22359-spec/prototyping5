import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Shell } from "@/app/prototypes/inspiration-library/components/shell";

export default function NotFound() {
  return <Shell><div className="not-found"><span className="tiny-label">404 / A LITTLE LOST</span><h1>Nothing to<br />see <em>here.</em></h1><p>This page couldn’t be found.</p><Link href="/prototypes/inspiration-library" className="button"><ArrowLeft size={16} />Back to your library</Link></div></Shell>;
}
