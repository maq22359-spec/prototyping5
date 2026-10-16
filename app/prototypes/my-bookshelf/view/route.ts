import bookshelf from '../bookshelf';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return bookshelf.fetch(request, {});
}
