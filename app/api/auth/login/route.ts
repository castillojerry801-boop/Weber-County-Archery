import { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { userStore } from '@/lib/memberStore';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';

const schema = z.object({
  email:     z.string().email().max(254).toLowerCase(),
  password:  z.string().min(1).max(128),
  turnstile: z.string().min(1, 'Bot check required'),
  honeypot:  z.string().max(0, 'Bot detected'),
});

export async function POST(request: NextRequest) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  const rlIp = checkRateLimit(`login:ip:${ip}`, 10, 15 * 60 * 1000);
  if (!rlIp.allowed) {
    return Response.json(
      { error: 'Too many login attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rlIp.retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const { email, password, turnstile } = parsed.data;

  const valid = await verifyTurnstile(turnstile, ip);
  if (!valid) {
    return Response.json({ error: 'Bot check failed. Please try again.' }, { status: 403 });
  }

  const rlEmail = checkRateLimit(`login:email:${email}`, 5, 15 * 60 * 1000);
  if (!rlEmail.allowed) {
    return Response.json(
      { error: 'Account temporarily locked. Please try again later.' },
      { status: 429 },
    );
  }

  const user = await userStore.findByEmail(email);

  // Always run bcrypt to prevent timing attacks
  const dummyHash = '$2b$12$invalidhashfortimingprotectiononly000000000000000000000';
  const passwordMatch = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);

  if (!user || !passwordMatch) {
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
