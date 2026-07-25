import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { userStore } from '@/lib/memberStore';
import type { User } from '@/data/memberTypes';

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get('code');

  if (!code) {
    return Response.redirect(new URL('/login?error=google', origin));
  }

  // Exchange the code for a Supabase session (uses anon key)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email) {
    return Response.redirect(new URL('/login?error=google', origin));
  }

  const { email, user_metadata } = data.user;
  const name = (user_metadata?.full_name as string) || (user_metadata?.name as string) || email;

  // Find or create the member record in our members table
  let member = await userStore.findByEmail(email);

  if (!member) {
    const newMember: User = {
      id:           crypto.randomUUID(),
      email,
      name,
      phone:        '',
      passwordHash: '',
      memberId:     `WCAP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      role:         'member',
      createdAt:    new Date().toISOString(),
    };
    await userStore.add(newMember);
    member = newMember;
  }

  // Set the same session cookie the rest of the app uses
  const cookieStore = await cookies();
  cookieStore.set('member_session', member.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return Response.redirect(new URL('/member', origin));
}
