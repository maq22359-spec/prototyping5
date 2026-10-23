"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, LayoutGrid, List, LockKeyhole, Globe2, Search, FolderHeart } from "lucide-react";
import type { Board } from "@/app/prototypes/inspiration-library/lib/data";
import { NewBoardButton } from "@/app/prototypes/inspiration-library/components/forms";

export function BoardCollection({ boards }: { boards: Board[] }) {
  const [search, setSearch] = useState("");
  const [list, setList] = useState(false);
  const filtered = boards.filter((board) => `${board.title} ${board.description}`.toLowerCase().includes(search.toLowerCase()));
  return <section id="collection"><div className="collection-toolbar"><div className="section-heading"><h2>My boards</h2><span className="count">{boards.length}</span></div><div className="collection-tools"><label className="search-input"><Search size={15} /><input aria-label="Search your boards" placeholder="Find a board…" value={search} onChange={(e) => setSearch(e.target.value)} /></label><div className="view-toggle"><button className={!list ? "selected" : ""} aria-label="Grid view" aria-pressed={!list} onClick={() => setList(false)}><LayoutGrid size={16} /></button><button className={list ? "selected" : ""} aria-label="List view" aria-pressed={list} onClick={() => setList(true)}><List size={16} /></button></div></div></div>
    {boards.length === 0 ? <div className="empty-state"><FolderHeart size={36} strokeWidth={1.2} /><h2>Every collection starts with a spark.</h2><p>Create your first board, then fill it with things that move you.</p><NewBoardButton /></div> : filtered.length === 0 ? <div className="empty-state"><Search size={30} /><h2>No boards found.</h2><p>Try a different word or clear your search.</p><button className="quiet-button" onClick={() => setSearch("")}>Clear search</button></div> : <div className={list ? "board-grid list-view" : "board-grid"}>{filtered.map((board) => <Link href={`/prototypes/inspiration-library/boards/${board.id}`} className="board-card" key={board.id}><div className={`board-cover ${(board.covers?.length ?? 0) === 0 ? "no-cover" : ""}`}>{board.covers?.length ? board.covers.map((image, i) => <img src={image} key={`${image}-${i}`} alt="" loading="lazy" referrerPolicy="no-referrer" />) : <FolderHeart size={44} strokeWidth={1} />}</div><div className="board-card-body"><h3>{board.title}<ArrowUpRight size={17} /></h3>{board.description && <p>{board.description}</p>}<div className="card-meta"><span>{board.item_count} {board.item_count === "1" ? "item" : "items"}</span><span>{board.is_public ? <><Globe2 size={12} />Public</> : <><LockKeyhole size={12} />Private</>}</span></div></div></Link>)}</div>}
  </section>;
}
