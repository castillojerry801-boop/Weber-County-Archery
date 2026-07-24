import { NextRequest } from 'next/server';
import { userStore } from '@/lib/memberStore';
import { getSession } from '@/lib/auth';
import { unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return unauthorized();

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const users = q.length >= 2
    ? await userStore.search(q)
    : await userStore.listAll();

  return Response.json(users.map(({ passwordHash: _, ...u }) => u));
}
