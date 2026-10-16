import bookshelf from '../../bookshelf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  // These values stay on Vercel's server; never include them in client code.
  return bookshelf.fetch(request, {
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NOTION_DATA_SOURCE_ID: process.env.NOTION_DATA_SOURCE_ID,
  });
}
