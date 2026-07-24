import { cookies } from 'next/headers';
import { userStore } from '@/lib/memberStore';
import type { User } from '@/data/memberTypes';

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('member_session')?.value;
  if (!userId) return null;
  return userStore.findById(userId) ?? null;
}

export async function requireSession(): Promise<User> {
  const user = await getSession();
  if (!user) throw new Error('Unauthorized');
  return user;
}

// Use in route handlers
export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
