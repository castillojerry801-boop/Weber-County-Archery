import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { userStore } from '@/lib/memberStore';
import type { User } from '@/data/memberTypes';

export async function POST(request: NextRequest) {
  const { name, email, phone, password } = await request.json();

  if (!name || !email || !password) {
    return Response.json({ error: 'Name, email, and password are required' }, { status: 400 });
  }

  if (userStore.findByEmail(email)) {
    return Response.json({ error: 'An account with that email already exists' }, { status: 409 });
  }

  // TODO: Replace with bcrypt.hash(password, 10) before production
  const passwordHash = Buffer.from(password).toString('base64');

  const user: User = {
    id: crypto.randomUUID(),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    phone: phone?.trim() ?? '',
    passwordHash,
    memberId: `WCAP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  userStore.add(user);

  const cookieStore = await cookies();
  cookieStore.set('member_session', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return Response.json({ id: user.id, name: user.name, email: user.email, memberId: user.memberId }, { status: 201 });
}
