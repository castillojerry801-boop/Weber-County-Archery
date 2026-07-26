'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase-browser';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    async function finish() {
      const supabase = getSupabase();
      let session = null;

      // Check for existing session first — React StrictMode fires effects twice
      // in dev, which would try to exchange the same PKCE code twice (second fails)
      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) {
        session = existing.session;
      } else {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) session = data.session;
        }
      }

      if (!session) {
        setStatus('error');
        setTimeout(() => router.replace('/login?error=google'), 2000);
        return;
      }

      const email = session.user.email;
      const name =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        email;

      if (!email) {
        setStatus('error');
        setTimeout(() => router.replace('/login?error=google'), 2000);
        return;
      }

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
