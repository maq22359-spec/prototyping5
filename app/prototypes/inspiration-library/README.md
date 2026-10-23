# Inspiration library

A personal collection of images and links, built inside the existing prototyping5 Next.js App Router workspace with Better Auth, and PostgreSQL through `pg`. No Supabase Auth or Supabase JavaScript SDK is used.

This prototype lives at `/prototypes/inspiration-library`. Sign-in, sign-up, and board pages stay under that path. The Better Auth API remains at `/api/auth/[...all]`. Its CSS is scoped to the prototype layout so other projects keep their styles.

Run the commands below from the **repository root**, not this prototype folder.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000/prototypes/inspiration-library. The landing page and auth pages work before database setup. Authentication and saving require a configured database and tables; the UI shows setup status and disables auth submission while `DATABASE_URL` is empty.

## Environment

Create a root `.env.local` from the empty `.env.example` template when setting up a fresh clone. Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`, use `BETTER_AUTH_URL=http://localhost:3000` for local development, and enter the Supabase **Postgres connection URL locally in `DATABASE_URL`**, never in chat. The current working copy is already configured; credentials are never committed. Keep TLS certificate verification enabled and restart the development server after changing environment values. On a hosted deployment, set these values in the host’s private environment settings and use the deployment origin for `BETTER_AUTH_URL`.

## Database migrations

The migrations below were applied through Supabase MCP to project `umwcmelrbeysezxxvshb` on October 23, 2026. There are no automatic migrations at install, startup, or build time. The existing Supabase tables are reused; importing this prototype does not rerun migrations. **Do not reapply these initial migrations to the existing database.**

1. `db/migrations/001_better_auth.sql`: CLI-generated Better Auth `user`, `session`, `account`, and `verification` tables, plus RLS and direct-browser access restrictions.
2. `db/migrations/002_boards_and_items.sql`: boards, saved items, ownership constraints, cascading deletion, indexes, RLS, and browser access restrictions.

`auth.cli.ts` explicitly loads `.env.local` and shares the runtime's configuration from `app/prototypes/inspiration-library/lib/auth-options.ts`. The CLI wrapper pins Better Auth 1.7.12 and redacts database credentials from diagnostic output.

```sh
# Read-only: confirm that the live tables match Better Auth's configuration.
node scripts/auth-cli.mjs check schema

# Generate a new SQL proposal without applying it (review before use).
node scripts/auth-cli.mjs generate --output ./work/proposed-auth-changes.sql --yes
```

All six application tables have RLS enabled, explicit restrictive policies denying `anon`/`authenticated` access, and revoked direct browser privileges. Better Auth uses its own sessions, not Supabase Auth JWTs, so policies using `auth.uid()` would not represent these users. Data access goes through the Next.js server and its session-derived ownership checks. The current private Postgres connection uses the trusted `postgres` role, which bypasses RLS; credentials must stay on the server. Supabase-managed system schemas are not altered by these application migrations.

The Supabase security advisor returned no findings after migration. Live Better Auth schema validation passed. Transactional database checks verified private board defaults, matching board/item ownership, and cascading deletion, then rolled back all test writes.

## Access rules

- Every data page and server action validates a Better Auth session on the server. No browser-supplied user ID is accepted.
- Private boards return the same not-found page as unknown IDs for signed-out visitors and other users.
- Public boards are readable with the link. Only the owner receives add, edit, settings, or delete controls; all mutations also enforce ownership in SQL.
- All database inputs are parameterized. Item insertion checks board ownership in the same statement. A composite foreign key also enforces that item and board owners match.
- Deleting a board cascades to its items. Indexes cover owner and board lookups.
- Pages that use sessions are dynamic. There is no shared data cache or cookie session cache.
- Images load directly in the visitor's browser with no referrer; external links use `noopener noreferrer`. URLs must use HTTP or HTTPS. The server does not fetch arbitrary submitted URLs.
- Better Auth retains origin/CSRF protections, password hashing, and secure cookie defaults. Its rate limiter uses memory for this single-process local prototype; use shared storage when scaling to multiple processes.
- Email verification and password recovery are not enabled in this prototype; they require a mail provider in a later step.

## Checks

```sh
npm run typecheck
npm run test:inspiration-library
npm run build
```

The unit tests mock database calls; they never connect to Supabase or create tables. Use the read-only CLI schema check above to validate the live schema. Database constraints were also verified using rolled-back test transactions through MCP. The `/api/auth/ok` health endpoint is available on the running development server.

## Documentation consulted before implementation

Latest stable Better Auth 1.7 documentation, checked October 23, 2026. Installed: Better Auth 1.7.12.

- https://better-auth.com/llms.txt
- https://better-auth.com/docs/installation
- https://better-auth.com/docs/adapters/postgresql
- https://better-auth.com/docs/integrations/next
- https://better-auth.com/docs/authentication/email-password
- https://better-auth.com/docs/concepts/session-management
- https://better-auth.com/docs/concepts/cli
- https://better-auth.com/docs/concepts/database
- https://supabase.com/docs/guides/database/postgres/row-level-security

Sample landing-page photography is served from Unsplash. It is illustrative content, never presented as your saved data.
