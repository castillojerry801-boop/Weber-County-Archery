import { NextRequest } from 'next/server';
import { userStore } from '@/lib/memberStore';
import { getSession, unauthorized } from '@/lib/auth';
import type { UserRole } from '@/data/memberTypes';

const VALID_ROLES: UserRole[] = ['member', 'volunteer', 'employee', 'admin'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return unauthorized();

  const { id } = await params;
  const { role } = await request.json() as { role: UserRole };

  if (!VALID_ROLES.includes(role)) {
    return Response.json({ error: 'Invalid role' }, { status: 400 });
  }

  await userStore.updateRole(id, role);
  return Response.json({ ok: true });
}
