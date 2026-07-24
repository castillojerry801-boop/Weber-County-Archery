import { NextRequest } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return Response.json([]);

  const { data } = await db
    .from('members')
    .select('id, name, email, phone, member_id')
    .or(`email.ilike.%${q}%,name.ilike.%${q}%`)
    .limit(10);

  return Response.json(data ?? []);
}
