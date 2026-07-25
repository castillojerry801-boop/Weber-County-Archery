'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    async function finish() {
      // Supabase implicit flow puts the access token in the URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');

      if (!accessToken) {
        setStatus('error');
        setTimeout(() => router.replace('/login?error=google'), 2000);
        return;
      }

      // Get the user's profile from Supabase using the access token
      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
        },
      );

      if (!userRes.ok) {
        setStatus('error');
        setTimeout(() => router.replace('/login?error=google'), 2000);
        return;
      }

      const userData = await userRes.json() as {
        email: string;
        user_metadata?: { full_name?: string; name?: string };
      };

      const email = userData.email;
      const name = userData.user_metadata?.full_name
        || userData.user_metadata?.name
        || email;

      if (!email) {
        setStatus('error');
        setTimeout(() => router.replace('/login?error=google'), 2000);
        return;
      }

      // Create the member record and set the session cookie
      const sessionRes = await fetch('/api/auth/google/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (sessionRes.ok) {
        router.replace('/member');
      } else {
        setStatus('error');
        setTimeout(() => router.replace('/login?error=google'), 2000);
      }
    }

    finish();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      {status === 'error' ? (
        <p className="text-red-400">Sign-in failed. Redirecting…</p>
      ) : (
        <p className="text-white/50 text-sm">Signing you in…</p>
      )}
    </div>
  );
}
