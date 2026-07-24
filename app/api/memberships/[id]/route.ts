import { NextRequest } from 'next/server';
import { membershipStore } from '@/lib/memberStore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  await membershipStore.update(id, body);
  return Response.json({ ok: true });
}
