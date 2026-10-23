"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Plus, X, Settings2, Pencil, Trash2 } from "lucide-react";
import { addItem, createBoard, deleteBoard, deleteItem, updateBoard, updateItem, type ActionState } from "@/app/prototypes/inspiration-library/actions";
import type { Board, Item } from "@/app/prototypes/inspiration-library/lib/data";

type Action = (state: ActionState, form: FormData) => Promise<ActionState>;

function Dialog({ title, trigger, children }: { title: string; trigger: React.ReactNode; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  return <><button className={title === "New board" ? "button" : "quiet-button"} onClick={() => ref.current?.showModal()}>{trigger}</button><dialog ref={ref} className="dialog" onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }}><div className="dialog-head"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={() => ref.current?.close()}><X size={20} /></button></div>{children}</dialog></>;
}

function Feedback({ state }: { state: ActionState }) {
  return <>{state.error && <p className="form-error" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">Saved to your library.</p>}</>;
}

function BoardForm({ board }: { board?: Board }) {
  const action: Action = board ? updateBoard.bind(null, board.id) : createBoard;
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="stack-form"><p className="muted">A small home for a big idea. You can always change it later.</p><label>Board title<input name="title" required maxLength={120} placeholder="e.g. Spaces to slow down" defaultValue={board?.title} /></label><label>Description <span className="optional">optional</span><textarea name="description" rows={3} maxLength={1000} placeholder="What’s the feeling behind this collection?" defaultValue={board?.description} /></label><label className="checkbox-label"><input type="checkbox" name="is_public" defaultChecked={board?.is_public} /><span>Share with a link<small>Anyone with the link can view. Only you can edit.</small></span></label><Feedback state={state} /><button className="button" disabled={pending}>{pending ? "Saving…" : board ? "Save changes" : "Create board"}<ArrowUpRight size={16} /></button></form>;
}

export function NewBoardButton() {
  return <Dialog title="New board" trigger={<><Plus size={17} />New board</>}><BoardForm /></Dialog>;
}

function DeleteForm({ action, board = false }: { action: Action; board?: boolean }) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} onSubmit={(e) => {
    if (!window.confirm(board ? "Delete this board and all its items? This cannot be undone." : "Delete this item? This cannot be undone.")) e.preventDefault();
  }}><button className="quiet-button danger" disabled={pending}><Trash2 size={14} />{pending ? "Deleting…" : board ? "Delete board and its items" : "Delete item"}</button><Feedback state={state} /></form>;
}

export function BoardSettings({ board }: { board: Board }) {
  return <Dialog title="Board settings" trigger={<><Settings2 size={16} />Settings</>}><BoardForm board={board} /><div className="danger-zone"><DeleteForm action={deleteBoard.bind(null, board.id)} board /></div></Dialog>;
}

function ItemForm({ boardId, item }: { boardId: string; item?: Item }) {
  const [state, formAction, pending] = useActionState(item ? updateItem.bind(null, boardId, item.id) : addItem.bind(null, boardId), {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success && !item) ref.current?.reset(); }, [state, item]);
  return <form ref={ref} action={formAction} className="stack-form"><p className="muted">An image, an interesting link, a thought worth keeping.</p><label>Image URL<input type="url" name="image_url" maxLength={2048} placeholder="https://…/image.jpg" defaultValue={item?.image_url ?? ""} /></label><label>Link URL<input type="url" name="link_url" maxLength={2048} placeholder="https://something-inspiring.com" defaultValue={item?.link_url ?? ""} /></label><label>Title <span className="optional">optional</span><input name="title" maxLength={200} placeholder="Give it a little context" defaultValue={item?.title} /></label><label>Note <span className="optional">optional</span><textarea name="note" rows={3} maxLength={2000} placeholder="What caught your eye?" defaultValue={item?.note} /></label><Feedback state={state} /><button className="button" disabled={pending}>{pending ? "Saving…" : item ? "Save changes" : "Add to board"}<Plus size={16} /></button></form>;
}

export function AddItemButton({ boardId }: { boardId: string }) {
  return <Dialog title="Add something good" trigger={<><Plus size={17} />Add item</>}><ItemForm boardId={boardId} /></Dialog>;
}

export function ItemControls({ item }: { item: Item }) {
  return <div className="item-controls"><Dialog title="Edit item" trigger={<><Pencil size={13} />Edit</>}><ItemForm boardId={item.board_id} item={item} /><div className="danger-zone"><DeleteForm action={deleteItem.bind(null, item.board_id, item.id)} /></div></Dialog></div>;
}

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  return <span><button className="quiet-button" onClick={async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setError(""); setTimeout(() => setCopied(false), 2500); }
    catch { setError("Copy the URL from your address bar to share."); }
  }}>{copied ? "Link copied!" : "Copy board link"}<ArrowUpRight size={14} /></button><span className="sr-only" role="status">{copied ? "Link copied to clipboard" : error}</span>{error && <small>{error}</small>}</span>;
}
