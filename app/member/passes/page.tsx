'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MEMBERSHIP_PRICES, PUNCH_PASS_PRICES,
  MEMBERSHIP_LABELS, TIER_LABELS,
} from '@/data/memberTypes';
import type { MembershipType, MemberTier } from '@/data/memberTypes';

type Tab = 'membership' | 'punch';

const MEMBERSHIP_TYPES: MembershipType[] = ['monthly', 'annual', 'household_annual'];
const TIERS: MemberTier[] = ['adult', 'senior_military', 'youth'];
const PUNCH_OPTIONS = [10, 20, 30] as const;

export default function PassesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('membership');
  const [memberType, setMemberType] = useState<MembershipType>('annual');
  const [tier, setTier] = useState<MemberTier>('adult');
  const [punches, setPunches] = useState<10 | 20 | 30>(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function purchaseMembership() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: memberType, tier, householdEmails: [] }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) { setError('Something went wrong. Please try again.'); return; }
      setSuccess('Membership activated! Redirecting…');
      setTimeout(() => router.push('/member'), 1500);
    } finally {
      setLoading(false);
    }
  }

  async function purchasePunch() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/punch-passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ punches }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) { setError('Something went wrong. Please try again.'); return; }
      setSuccess('Punch pass added! Redirecting…');
      setTimeout(() => router.push('/member'), 1500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <Link href="/member" className="text-white/40 hover:text-white text-sm">← Back</Link>
        <h1 className="font-bold text-white">Passes &amp; Memberships</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Square notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-sm text-yellow-300">
          💳 Payment processing coming soon — passes are being activated instantly for demo purposes.
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
          {(['membership', 'punch'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors capitalize ${
                tab === t ? 'bg-green-600 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              {t === 'membership' ? '📅 Membership' : '🎯 Punch Pass'}
            </button>
          ))}
        </div>

        {tab === 'membership' && (
          <div className="flex flex-col gap-4">
            {/* Pass type */}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Pass Type</p>
              <div className="flex flex-col gap-2">
                {MEMBERSHIP_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setMemberType(type)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      memberType === type
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">{MEMBERSHIP_LABELS[type]}</p>
                        {type === 'household_annual' && (
                          <p className="text-xs text-white/40 mt-0.5">One QR code covers your whole family</p>
                        )}
                      </div>
                      <p className="text-green-400 font-bold text-sm">
                        ${MEMBERSHIP_PRICES[type][tier]}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tier */}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Member Type</p>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      tier === t
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {TIER_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">{MEMBERSHIP_LABELS[memberType]}</p>
                <p className="text-white/40 text-xs">{TIER_LABELS[tier]}</p>
              </div>
              <p className="text-green-400 font-black text-2xl">
                ${MEMBERSHIP_PRICES[memberType][tier]}
              </p>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}

            <button
              onClick={purchaseMembership}
              disabled={loading}
              className="bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-black font-bold rounded-xl px-4 py-4 min-h-[52px] transition-colors"
            >
              {loading ? 'Processing…' : `Activate — $${MEMBERSHIP_PRICES[memberType][tier]}`}
            </button>
            <p className="text-center text-white/20 text-xs">
              {/* TODO: Square payment will be charged here */}
              Square payment integration coming soon
            </p>
          </div>
        )}

        {tab === 'punch' && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Choose Your Pack</p>
              <div className="flex flex-col gap-2">
                {PUNCH_OPTIONS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setPunches(count)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      punches === count
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">{count}-Visit Pass</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          ${(PUNCH_PASS_PRICES[count] / count).toFixed(2)} per visit · Never expires
                        </p>
                      </div>
                      <p className="text-green-400 font-bold">${PUNCH_PASS_PRICES[count]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}

            <button
              onClick={purchasePunch}
              disabled={loading}
              className="bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-black font-bold rounded-xl px-4 py-4 min-h-[52px] transition-colors"
            >
              {loading ? 'Processing…' : `Get ${punches}-Visit Pass — $${PUNCH_PASS_PRICES[punches]}`}
            </button>
            <p className="text-center text-white/20 text-xs">
              Square payment integration coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
