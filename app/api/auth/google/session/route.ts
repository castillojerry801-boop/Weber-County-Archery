import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { userStore } from '@/lib/memberStore';
import type { User } from '@/data/memberTypes';

export async function POST(request: NextRequest) {
  const { email, name } = await request.json() as { email: string; name: string };

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  let member = await userStore.findByEmail(email);

  if (!member) {
    const newMember: User = {
      id:           crypto.randomUUID(),
      email,
      name:         name || email,
      phone:        '',
      passwordHash: '',
      memberId:     `WCAP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      role:         'member',
      createdAt:    new Date().toISOString(),
    };
    await userStore.add(newMember);
    member = newMember;
  }

  const cookieStore = await cookies();
  cookieStore.set('member_session', member.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return NextResponse.json({ ok: true });
}
