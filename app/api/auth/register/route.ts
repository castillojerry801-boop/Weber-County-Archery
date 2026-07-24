import { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { userStore } from '@/lib/memberStore';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';
import type { User } from '@/data/memberTypes';

const schema = z.object({
  name:       z.string().min(2).max(80).trim(),
  email:      z.string().email().max(254).toLowerCase(),
  phone:      z.string().max(20).trim().optional().default(''),
  password:   z.string().min(8).max(128),
  turnstile:  z.string().min(1, 'Bot check required'),
  honeypot:   z.string().max(0, 'Bot detected'), // must be empty
});

export async function POST(request: NextRequest) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  // Rate limit: 5 registrations per IP per hour
  const rl = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return Response.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input';
    return Response.json({ error: message }, { status: 400 });
  }

  const { name, email, phone, password, turnstile } = parsed.data;

  // Verify Turnstile token
  const valid = await verifyTurnstile(turnstile, ip);
  if (!valid) {
    return Response.json({ error: 'Bot check failed. Please try again.' }, { status: 403 });
  }

  if (userStore.findByEmail(email)) {
    // Don't reveal if email exists — return same message as success to prevent enumeration
    return Response.json(
      { error: 'If that email is available, your account has been created.' },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    phone,
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
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return Response.json(
    { id: user.id, name: user.name, email: user.email, memberId: user.memberId },
    { status: 201 },
  );
}
