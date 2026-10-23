import Link from "next/link";
import { ArrowUpRight, LayoutGrid, Bookmark, Sparkles, LockKeyhole } from "lucide-react";
import { SignOutButton } from "@/app/prototypes/inspiration-library/components/auth-controls";

export function Brand() {
  return <Link href="/prototypes/inspiration-library" className="brand" aria-label="Inspiration library home"><span className="brand-mark"><i /><i /><i /><i /></span><span>inspiration<br /><b>library</b><span className="brand-dot">.</span></span></Link>;
}

export function Shell({ children, user }: { children: React.ReactNode; user?: { name: string; email: string } | null }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <Brand />
      <p className="sidebar-label">A HOME FOR YOUR IDEAS</p>
      <nav aria-label="Main navigation">
        <Link className="nav-link active" href="/prototypes/inspiration-library"><LayoutGrid size={17} />{user ? "My boards" : "Your library"}<span className="nav-dot" /></Link>
        <Link className="nav-link" href={user ? "/prototypes/inspiration-library/#collection" : "/prototypes/inspiration-library/#collection"}><Bookmark size={17} />{user ? "Your collection" : "A little inspiration"}</Link>
      </nav>
      <div className="sidebar-note"><Sparkles size={20} strokeWidth={1.4} /><p>Good ideas start<br />with noticing.</p><span>Keep what catches your eye.</span></div>
      <div className="sidebar-bottom">
        {user ? <><div className="profile"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><small>Your personal space</small></div></div><SignOutButton /></> : <><div className="private-note"><LockKeyhole size={15} /><span>Personal by default.<br />Shared when you choose.</span></div><Link className="sidebar-join" href="/prototypes/inspiration-library/sign-up">Make yourself at home <ArrowUpRight size={15} /></Link></>}
      </div>
    </aside>
    <div className="main-wrap"><header className="topbar"><span>YOUR CORNER OF THE INTERNET</span><div>{user ? <><span className="topbar-greeting">A place for your next idea.</span><div className="mobile-sign-out"><SignOutButton /></div></> : <><Link href="/prototypes/inspiration-library/sign-in">Sign in</Link><Link href="/prototypes/inspiration-library/sign-up" className="button button-small">Get started <ArrowUpRight size={14} /></Link></>}</div></header><main>{children}</main><footer className="footer"><span>A little curiosity. A growing collection.</span><span>INSPIRATION LIBRARY © {new Date().getFullYear()}</span></footer></div>
  </div>;
}
