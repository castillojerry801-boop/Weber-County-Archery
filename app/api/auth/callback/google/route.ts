import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { userStore } from '@/lib/memberStore';
import type { User } from '@/data/memberTypes';

type GoogleUserInfo = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const cookieStore = await cookies();

  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const storedState = cookieStore.get('oauth_state')?.value;
  const next        = cookieStore.get('oauth_next')?.value ?? '/member';

  cookieStore.delete('oauth_state');
  cookieStore.delete('oauth_next');

  if (error || !code || !state || state !== storedState) {
    return Response.redirect(new URL('/login?error=google', origin));
  }

  // Exchange authorization code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri:  `${origin}/api/auth/callback/google`,
      grant_type:    'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return Response.redirect(new URL('/login?error=google', origin));
  }

  const { access_token } = await tokenRes.json() as { access_token: string };

  // Fetch Google profile
  const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!infoRes.ok) {
    return Response.redirect(new URL('/login?error=google', origin));
  }

  const googleUser = await infoRes.json() as GoogleUserInfo;

  if (!googleUser.email) {
    return Response.redirect(new URL('/login?error=google', origin));
  }

  // Find existing account or create one
  let user = await userStore.findByEmail(googleUser.email);

  if (!user) {
    // Google-only account — generate an unguessable password hash
    const passwordHash = await bcrypt.hash(crypto.randomUUID() + crypto.randomUUID(), 12);

    const newUser: User = {
      id:           crypto.randomUUID(),
      email:        googleUser.email,
      name:         googleUser.name,
      phone:        '',
      passwordHash,
      memberId:     `WCAP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      role:         'member',
      createdAt:    new Date().toISOString(),
    };

    await userStore.add(newUser);
    user = newUser;
  }

  // Set session cookie (30 days)
  cookieStore.set('member_session', user.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  const redirectTo = next.startsWith('/') ? next : '/member';
  return Response.redirect(new URL(redirectTo, origin));
}
