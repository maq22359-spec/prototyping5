import { ArrowDownRight } from "lucide-react";
import { getSession } from "@/app/prototypes/inspiration-library/lib/session";
import { getMyBoards } from "@/app/prototypes/inspiration-library/lib/data";
import { isDatabaseConfigured } from "@/app/prototypes/inspiration-library/lib/db";
import { Shell } from "@/app/prototypes/inspiration-library/components/shell";
import { Landing } from "@/app/prototypes/inspiration-library/components/landing";
import { BoardCollection } from "@/app/prototypes/inspiration-library/components/collection";
import { NewBoardButton } from "@/app/prototypes/inspiration-library/components/forms";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const session = await getSession();
  if (!session) return <Shell><Landing configured={isDatabaseConfigured()} /></Shell>;
  const boards = await getMyBoards();
  return <Shell user={session.user}><div className="page-content"><section className="library-hero"><div><div className="eyebrow"><span /> YOUR PERSONAL COLLECTION</div><h1>A home for<br />your <em>good ideas.</em></h1><p className="hero-description">Keep what catches your eye. See where it takes you.</p></div><div className="library-hero-side"><span className="big-spark">✳</span><NewBoardButton /></div></section><div className="library-divider"><ArrowDownRight size={19} /><span>FOLLOW YOUR CURIOSITY</span></div><BoardCollection boards={boards} /></div></Shell>;
}
