"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getPool } from "@/app/prototypes/inspiration-library/lib/db";
import { requireUser } from "@/app/prototypes/inspiration-library/lib/session";
import { boardSchema, idSchema, itemSchema } from "@/app/prototypes/inspiration-library/lib/validation";

export type ActionState = { error?: string; success?: boolean };
const value = (form: FormData, key: string) => String(form.get(key) ?? "");
function readBoard(form: FormData) {
  return boardSchema.safeParse({ title: value(form, "title"), description: value(form, "description"), is_public: form.get("is_public") === "on" });
}
function readItem(form: FormData) {
  return itemSchema.safeParse({ image_url: value(form, "image_url"), link_url: value(form, "link_url"), title: value(form, "title"), note: value(form, "note") });
}
function validId(id: string) { if (!idSchema.safeParse(id).success) notFound(); }

export async function createBoard(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = readBoard(form);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { title, description, is_public } = parsed.data;
  let id: string;
  try {
    const result = await getPool().query<{ id: string }>(
      "INSERT INTO boards (user_id, title, description, is_public) VALUES ($1, $2, $3, $4) RETURNING id",
      [user.id, title, description, is_public]);
    id = result.rows[0].id;
  } catch { return { error: "Your board couldn’t be saved. Check database setup and try again." }; }
  revalidatePath("/prototypes/inspiration-library");
  redirect(`/prototypes/inspiration-library/boards/${id}`);
}

export async function updateBoard(id: string, _: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  validId(id);
  const parsed = readBoard(form);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  let count;
  try {
    const { title, description, is_public } = parsed.data;
    const result = await getPool().query(
      "UPDATE boards SET title = $1, description = $2, is_public = $3 WHERE id = $4 AND user_id = $5 RETURNING id",
      [title, description, is_public, id, user.id]);
    count = result.rowCount;
  } catch { return { error: "Changes couldn’t be saved. Please try again." }; }
  if (!count) notFound();
  revalidatePath(`/prototypes/inspiration-library/boards/${id}`);
  revalidatePath("/prototypes/inspiration-library");
  return { success: true };
}

export async function deleteBoard(id: string, _: ActionState, _form: FormData): Promise<ActionState> {
  const user = await requireUser();
  validId(id);
  let count;
  try {
    const result = await getPool().query("DELETE FROM boards WHERE id = $1 AND user_id = $2 RETURNING id", [id, user.id]);
    count = result.rowCount;
  } catch { return { error: "Your board couldn’t be deleted. Please try again." }; }
  if (!count) notFound();
  revalidatePath("/prototypes/inspiration-library");
  redirect("/prototypes/inspiration-library");
}

export async function addItem(boardId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  validId(boardId);
  const parsed = readItem(form);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  let count;
  try {
    const { image_url, link_url, title, note } = parsed.data;
    // The ownership check and INSERT are one statement to avoid a check/write race.
    const result = await getPool().query(`
      INSERT INTO items (board_id, user_id, image_url, link_url, title, note)
      SELECT id, user_id, $3, $4, $5, $6 FROM boards WHERE id = $1 AND user_id = $2 RETURNING id`,
      [boardId, user.id, image_url || null, link_url || null, title, note]);
    count = result.rowCount;
  } catch { return { error: "Your item couldn’t be saved. Please try again." }; }
  if (!count) notFound();
  revalidatePath(`/prototypes/inspiration-library/boards/${boardId}`);
  revalidatePath("/prototypes/inspiration-library");
  return { success: true };
}

export async function updateItem(boardId: string, itemId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  validId(boardId); validId(itemId);
  const parsed = readItem(form);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  let count;
  try {
    const { image_url, link_url, title, note } = parsed.data;
    const result = await getPool().query(`
      UPDATE items SET image_url = $1, link_url = $2, title = $3, note = $4
      WHERE id = $5 AND board_id = $6 AND user_id = $7
      AND EXISTS (SELECT 1 FROM boards WHERE id = $6 AND user_id = $7) RETURNING id`,
      [image_url || null, link_url || null, title, note, itemId, boardId, user.id]);
    count = result.rowCount;
  } catch { return { error: "Your item couldn’t be updated. Please try again." }; }
  if (!count) notFound();
  revalidatePath(`/prototypes/inspiration-library/boards/${boardId}`);
  revalidatePath("/prototypes/inspiration-library");
  return { success: true };
}

export async function deleteItem(boardId: string, itemId: string, _: ActionState, _form: FormData): Promise<ActionState> {
  const user = await requireUser();
  validId(boardId); validId(itemId);
  let count;
  try {
    const result = await getPool().query(`DELETE FROM items WHERE id = $1 AND board_id = $2 AND user_id = $3
      AND EXISTS (SELECT 1 FROM boards WHERE id = $2 AND user_id = $3) RETURNING id`, [itemId, boardId, user.id]);
    count = result.rowCount;
  } catch { return { error: "Your item couldn’t be deleted. Please try again." }; }
  if (!count) notFound();
  revalidatePath(`/prototypes/inspiration-library/boards/${boardId}`);
  revalidatePath("/prototypes/inspiration-library");
  return { success: true };
}
