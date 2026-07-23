import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { userStore } from '@/lib/memberStore';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const user = userStore.findByEmail(email);
  if (!user) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // TODO: Replace with bcrypt.compare(password, user.passwordHash) before production
  const hash = Buffer.from(password).toString('base64');
  if (hash !== user.passwordHash) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set('member_session', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return Response.json({ id: user.id, name: user.name, email: user.email, memberId: user.memberId });
}
