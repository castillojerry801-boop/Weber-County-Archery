'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase-browser';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    async function finish() {
      const supabase = getSupabase();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.email) {
        setError('Google sign-in failed. Please try again.');
        setTimeout(() => router.push('/login?error=google'), 2000);
        return;
      }

      const { email, user_metadata } = session.user;
      const name = (user_metadata?.full_name as string) || (user_metadata?.name as string) || email;

      const res = await fetch('/api/auth/google/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (res.ok) {
        router.push('/member');
      } else {
        setError('Sign-in failed. Please try again.');
        setTimeout(() => router.push('/login?error=google'), 2000);
      }
    }

    finish();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      {error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <p className="text-white/50">Signing you in…</p>
      )}
    </div>
  );
}
