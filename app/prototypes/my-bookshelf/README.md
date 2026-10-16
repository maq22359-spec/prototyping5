# My bookshelf / 我的书架

Open `/prototypes/my-bookshelf` to browse finished books from Notion. The gallery loads automatically, hides rows with empty titles, and supports search, genre filters, rating/title/author sorting and full reviews.

## Local setup

Add `NOTION_TOKEN` and `NOTION_DATABASE_ID` to the repository root `.env.local`. Grant the Notion integration read access to the database. Then run `npm run dev`. For databases with multiple data sources, optionally set `NOTION_DATA_SOURCE_ID` or select the source in the connection dialog.

## Vercel

Configure those same environment variable names in Vercel Production, then deploy the main branch. Never commit tokens or prefix them with NEXT_PUBLIC_. The gallery and reviews are visible to visitors who can access the deployed site.

Notion-Version is pinned to 2026-03-11. The server retrieves the database's data sources, validates the six properties, queries all pages using opaque pagination cursors, and retries rate limits using Retry-After. Title: title; Author and Review: rich_text; Genre: select; Cover Image: files or url; Rating: number. Every database row is treated as a finished book because there is no read-status property.

`page.tsx` embeds the isolated gallery document from `view/route.ts`. The browser calls `api/books/route.ts`; the server forwards requests to Notion. No Notion token is returned to the browser. Local and production environment files remain outside Git.
