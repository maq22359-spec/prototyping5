import "server-only";
import { notFound } from "next/navigation";
import { getPool, isDatabaseConfigured } from "@/app/prototypes/inspiration-library/lib/db";
import { getSession, requireUser } from "@/app/prototypes/inspiration-library/lib/session";
import { idSchema } from "@/app/prototypes/inspiration-library/lib/validation";

export type Board = {
  id: string; user_id: string; title: string; description: string;
  is_public: boolean; created_at: Date; item_count?: string; covers?: string[];
};
export type Item = {
  id: string; board_id: string; user_id: string; image_url: string | null;
  link_url: string | null; title: string; note: string; created_at: Date;
};

export async function getMyBoards() {
  const user = await requireUser();
  const result = await getPool().query<Board>(`
    SELECT b.*, (SELECT count(*) FROM items i WHERE i.board_id = b.id AND i.user_id = $1) AS item_count,
      ARRAY(SELECT image_url FROM items i WHERE i.board_id = b.id AND i.user_id = $1
        AND image_url IS NOT NULL ORDER BY created_at DESC LIMIT 4) AS covers
    FROM boards b WHERE b.user_id = $1 ORDER BY b.created_at DESC`, [user.id]);
  return result.rows;
}

export async function getBoardPage(id: string) {
  const session = await getSession();
  if (!idSchema.safeParse(id).success || !isDatabaseConfigured()) notFound();
  const result = await getPool().query<Board>(`
    SELECT * FROM boards WHERE id = $1 AND (is_public = true OR user_id = $2)`,
    [id, session?.user.id ?? null]);
  const board = result.rows[0];
  if (!board) notFound();
  const items = await getPool().query<Item>(`
    SELECT * FROM items WHERE board_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
    [board.id, board.user_id]);
  return { board, items: items.rows, isOwner: session?.user.id === board.user_id, session };
}
