import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  getSession: vi.fn(),
  requireUser: vi.fn(),
  configured: vi.fn(() => true),
  revalidate: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/app/prototypes/inspiration-library/lib/db", () => ({ getPool: () => ({ query: mocks.query }), isDatabaseConfigured: mocks.configured }));
vi.mock("@/app/prototypes/inspiration-library/lib/session", () => ({ getSession: mocks.getSession, requireUser: mocks.requireUser }));
vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NOT_FOUND"); },
  redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));

import { getBoardPage, getMyBoards } from "@/app/prototypes/inspiration-library/lib/data";
import { addItem, createBoard, deleteBoard, deleteItem, updateBoard, updateItem } from "@/app/prototypes/inspiration-library/actions";
import { itemSchema } from "@/app/prototypes/inspiration-library/lib/validation";

const boardId = "10000000-0000-4000-8000-000000000001";
const itemId = "20000000-0000-4000-8000-000000000001";
const owner = { id: "owner-from-session", name: "Owner", email: "owner@example.com" };
const board = { id: boardId, user_id: owner.id, title: "A board", description: "", is_public: false, created_at: new Date() };
function form(entries: Record<string, string>) {
  const data = new FormData();
  Object.entries(entries).forEach(([key, value]) => data.set(key, value));
  return data;
}
const itemForm = () => form({ image_url: "https://example.com/photo.jpg", link_url: "", title: "A photo", note: "A thought", user_id: "attacker-supplied-id" });
const boardForm = () => form({ title: "A new board", description: "", user_id: "attacker-supplied-id" });

beforeEach(() => {
  mocks.query.mockReset();
  mocks.getSession.mockResolvedValue({ user: owner });
  mocks.requireUser.mockResolvedValue(owner);
  mocks.configured.mockReturnValue(true);
});

describe("board visibility", () => {
  it("loads only the signed-in user's boards, with owner-scoped covers and counts", async () => {
    mocks.query.mockResolvedValue({ rows: [board] });
    expect(await getMyBoards()).toEqual([board]);
    const [sql, params] = mocks.query.mock.calls[0];
    expect(sql).toContain("WHERE b.user_id = $1");
    expect(sql).toContain("i.user_id = $1");
    expect(params).toEqual([owner.id]);
  });

  it("checks authentication before listing any personal data", async () => {
    mocks.requireUser.mockRejectedValue(new Error("REDIRECT:/prototypes/inspiration-library/sign-in"));
    await expect(getMyBoards()).rejects.toThrow("REDIRECT:/prototypes/inspiration-library/sign-in");
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("returns not found for a signed-out private board visit", async () => {
    mocks.getSession.mockResolvedValue(null);
    mocks.query.mockResolvedValueOnce({ rows: [] });
    await expect(getBoardPage(boardId)).rejects.toThrow("NOT_FOUND");
    expect(mocks.query).toHaveBeenCalledTimes(1);
    expect(mocks.query.mock.calls[0][0]).toContain("is_public = true OR user_id = $2");
    expect(mocks.query.mock.calls[0][1]).toEqual([boardId, null]);
  });

  it("uses the visitor session ID to deny another owner's private board", async () => {
    mocks.getSession.mockResolvedValue({ user: { ...owner, id: "another-user" } });
    mocks.query.mockResolvedValueOnce({ rows: [] });
    await expect(getBoardPage(boardId)).rejects.toThrow("NOT_FOUND");
    expect(mocks.query.mock.calls[0][1]).toEqual([boardId, "another-user"]);
    expect(mocks.query).toHaveBeenCalledTimes(1);
  });

  it("permits an owner to read a private board", async () => {
    mocks.query.mockResolvedValueOnce({ rows: [board] }).mockResolvedValueOnce({ rows: [] });
    const result = await getBoardPage(boardId);
    expect(result.isOwner).toBe(true);
    expect(mocks.query.mock.calls[1][1]).toEqual([boardId, owner.id]);
  });

  it("allows a signed-out public board viewer without ownership", async () => {
    mocks.getSession.mockResolvedValue(null);
    mocks.query.mockResolvedValueOnce({ rows: [{ ...board, is_public: true }] }).mockResolvedValueOnce({ rows: [] });
    const result = await getBoardPage(boardId);
    expect(result.isOwner).toBe(false);
    expect(result.session).toBe(null);
  });

  it("keeps a public board view-only for another signed-in user", async () => {
    mocks.getSession.mockResolvedValue({ user: { ...owner, id: "another-user" } });
    mocks.query.mockResolvedValueOnce({ rows: [{ ...board, is_public: true }] }).mockResolvedValueOnce({ rows: [] });
    expect((await getBoardPage(boardId)).isOwner).toBe(false);
  });

  it("rejects malformed board IDs without querying", async () => {
    await expect(getBoardPage("' OR 1=1")).rejects.toThrow("NOT_FOUND");
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("returns not found while the database is not configured", async () => {
    mocks.configured.mockReturnValue(false);
    await expect(getBoardPage(boardId)).rejects.toThrow("NOT_FOUND");
    expect(mocks.query).not.toHaveBeenCalled();
  });
});

describe("session-derived writes", () => {
  it("ignores a browser-supplied user ID on board creation and defaults private", async () => {
    mocks.query.mockResolvedValueOnce({ rows: [{ id: boardId }], rowCount: 1 });
    await expect(createBoard({}, boardForm())).rejects.toThrow(`REDIRECT:/prototypes/inspiration-library/boards/${boardId}`);
    expect(mocks.query.mock.calls[0][1]).toEqual([owner.id, "A new board", "", false]);
  });

  it("checks board ownership inside the item insert", async () => {
    mocks.query.mockResolvedValueOnce({ rows: [{ id: itemId }], rowCount: 1 });
    expect(await addItem(boardId, {}, itemForm())).toEqual({ success: true });
    const [sql, params] = mocks.query.mock.calls[0];
    expect(sql).toContain("FROM boards WHERE id = $1 AND user_id = $2");
    expect(params[1]).toBe(owner.id);
    expect(params).not.toContain("attacker-supplied-id");
  });

  const attempts = [
    ["update board", () => updateBoard(boardId, {}, boardForm())],
    ["delete board", () => deleteBoard(boardId, {}, new FormData())],
    ["add item", () => addItem(boardId, {}, itemForm())],
    ["update item", () => updateItem(boardId, itemId, {}, itemForm())],
    ["delete item", () => deleteItem(boardId, itemId, {}, new FormData())],
  ] as const;

  it.each(attempts)("%s rejects a non-owner result", async (_name, action) => {
    mocks.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    await expect(action()).rejects.toThrow("NOT_FOUND");
    const [sql, params] = mocks.query.mock.calls[0];
    expect(sql).toContain("user_id = $");
    expect(params).toContain(owner.id);
    expect(params).not.toContain("attacker-supplied-id");
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it.each(attempts)("%s validates the session before accessing the database", async (_name, action) => {
    mocks.requireUser.mockRejectedValue(new Error("REDIRECT:/prototypes/inspiration-library/sign-in"));
    await expect(action()).rejects.toThrow("REDIRECT:/prototypes/inspiration-library/sign-in");
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("does not leak raw database errors or connection details", async () => {
    mocks.query.mockRejectedValueOnce(new Error("postgres://sensitive-connection-details"));
    const result = await addItem(boardId, {}, itemForm());
    expect(result.error).toBeTruthy();
    expect(result.error).not.toContain("postgres");
  });

  it("parameterizes titles instead of interpolating them", async () => {
    const title = "'); DROP TABLE boards; --";
    mocks.query.mockResolvedValueOnce({ rows: [{ id: boardId }], rowCount: 1 });
    await expect(createBoard({}, form({ title, description: "" }))).rejects.toThrow("REDIRECT:");
    expect(mocks.query.mock.calls[0][0]).not.toContain(title);
    expect(mocks.query.mock.calls[0][1]).toContain(title);
  });
});

describe("saved source validation", () => {
  const base = { image_url: "", link_url: "", title: "", note: "" };
  it("requires an image or a link", () => expect(itemSchema.safeParse(base).success).toBe(false));
  it.each(["javascript:alert(1)", "data:text/html,hello", "file:///etc/passwd", "ftp://example.com/x"])("rejects %s", (url) => {
    expect(itemSchema.safeParse({ ...base, link_url: url }).success).toBe(false);
    expect(itemSchema.safeParse({ ...base, image_url: url }).success).toBe(false);
  });
  it("allows an image-only item", () => expect(itemSchema.safeParse({ ...base, image_url: "https://example.com/a.jpg" }).success).toBe(true));
  it("allows a link-only item", () => expect(itemSchema.safeParse({ ...base, link_url: "https://example.com/article" }).success).toBe(true));
});
