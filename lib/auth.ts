import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { userStore } from '@/lib/memberStore';
import type { User } from '@/data/memberTypes';

const STAFF_ROLES: User['role'][] = ['volunteer', 'employee', 'admin'];

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

// Use in server layouts to guard staff pages
export async function requireStaff(currentPath = '/staff'): Promise<User> {
  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  if (!STAFF_ROLES.includes(user.role)) redirect('/');
  return user;
}

// Use in server layouts to guard admin-only pages
export async function requireAdmin(currentPath = '/admin'): Promise<User> {
  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  if (user.role !== 'admin') redirect('/');
  return user;
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
