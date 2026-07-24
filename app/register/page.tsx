'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/app/components/Logo';
import { TurnstileWidget } from '@/app/components/TurnstileWidget';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!turnstileToken) { setError('Please complete the security check.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password, honeypot, turnstile: turnstileToken }),
      });
      let data: { error?: string } = {};
      try { data = await res.json(); } catch { /* non-JSON response */ }
      if (!res.ok) { setError(data.error ?? `Server error (${res.status})`); return; }
      router.push('/member');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function field(id: keyof typeof form, label: string, type = 'text', placeholder = '') {
    return (
      <div key={id}>
        <label className="block text-xs font-medium text-white/60 mb-1">{label}</label>
        <input
          type={type}
          required={id !== 'phone'}
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[48px]"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size={60} />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-white/40 text-sm mb-6">Get your member QR code and manage passes</p>

          {/* TODO: Wire up real Google OAuth */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl px-4 py-3 mb-4 transition-colors min-h-[48px]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Honeypot — invisible to real users, bots fill it in */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
            />

            {field('name', 'Full Name', 'text', 'Jane Smith')}
            {field('email', 'Email', 'email', 'you@example.com')}
            {field('phone', 'Phone (optional)', 'tel', '(801) 555-0100')}
            {field('password', 'Password', 'password', '••••••••')}
            {field('confirm', 'Confirm Password', 'password', '••••••••')}

            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken('')}
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="bg-green-500 hover:bg-green-400 disabled:bg-green-900 disabled:cursor-not-allowed text-black font-bold rounded-xl px-4 py-3 min-h-[48px] transition-colors"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          Already a member?{' '}
          <Link href="/login" className="text-green-400 hover:text-green-300">
            Sign in
          </Link>
        </p>
        <p className="text-center mt-4">
          <Link href="/" className="text-white/20 hover:text-white/40 text-xs">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
