-- Application tables. Depends on 001_better_auth.sql.
-- Owners come from Better Auth server sessions, never Supabase Auth/JWTs.
BEGIN;
SET LOCAL search_path = public;

CREATE TABLE public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 1000),
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);

CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL,
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  image_url text CHECK (image_url ~* '^https?://' AND length(image_url) <= 2048),
  link_url text CHECK (link_url ~* '^https?://' AND length(link_url) <= 2048),
  title text NOT NULL DEFAULT '' CHECK (length(title) <= 200),
  note text NOT NULL DEFAULT '' CHECK (length(note) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT item_has_source CHECK (image_url IS NOT NULL OR link_url IS NOT NULL),
  CONSTRAINT item_belongs_to_board_owner FOREIGN KEY (board_id, user_id)
    REFERENCES public.boards(id, user_id) ON DELETE CASCADE
);

CREATE INDEX boards_user_id_idx ON public.boards(user_id);
CREATE INDEX items_user_id_idx ON public.items(user_id);
CREATE INDEX items_board_id_idx ON public.items(board_id);
CREATE INDEX items_board_owner_idx ON public.items(board_id, user_id);


ALTER TABLE public."boards" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."boards" FROM PUBLIC, anon, authenticated;
CREATE POLICY deny_direct_browser_access ON public."boards"
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

ALTER TABLE public."items" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."items" FROM PUBLIC, anon, authenticated;
CREATE POLICY deny_direct_browser_access ON public."items"
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

COMMIT;
