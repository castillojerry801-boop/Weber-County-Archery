'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  MEMBERSHIP_PRICES, PUNCH_PASS_PRICES,
  MEMBERSHIP_LABELS, TIER_LABELS,
} from '@/data/memberTypes';
import type { MembershipType, MemberTier } from '@/data/memberTypes';

type MemberResult = {
  id: string;
  name: string;
  email: string;
  phone: string;
  member_id: string;
};

type PassTab = 'membership' | 'punch';

const MEMBERSHIP_TYPES: MembershipType[] = ['monthly', 'annual', 'household_annual'];
const TIERS: MemberTier[] = ['adult', 'senior_military', 'youth'];
const PUNCH_OPTIONS = [10, 20, 30] as const;

export default function SquarePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemberResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<MemberResult | null>(null);

  const [tab, setTab] = useState<PassTab>('membership');
  const [memberType, setMemberType] = useState<MembershipType>('annual');
  const [tier, setTier] = useState<MemberTier>('adult');
  const [punches, setPunches] = useState<10 | 20 | 30>(10);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'square'>('cash');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const search = useCallback(async (q: string) => {
    setQuery(q);
    setSelected(null);
    setSuccess('');
    setError('');
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/staff/members?q=${encodeURIComponent(q)}`);
      setResults(await res.json());
    } finally {
      setSearching(false);
    }
  }, []);

  const price = tab === 'membership'
    ? MEMBERSHIP_PRICES[memberType][tier]
    : PUNCH_PASS_PRICES[punches];

  async function handleAddPass() {
    if (!selected) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const body = tab === 'membership'
        ? { userId: selected.id, passKind: 'membership', type: memberType, tier, paymentMethod }
        : { userId: selected.id, passKind: 'punch', punches, paymentMethod };

      const res = await fetch('/api/staff/passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong.');
        return;
      }

      const label = tab === 'membership'
        ? `${MEMBERSHIP_LABELS[memberType]} (${TIER_LABELS[tier]})`
        : `${punches}-Visit Punch Pass`;

      setSuccess(`Added ${label} to ${selected.name}'s account.`);
      setSelected(null);
      setQuery('');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h1 className="font-bold text-white">Point of Sale</h1>
          <p className="text-white/40 text-xs mt-0.5">Add passes for walk-in & cash customers</p>
        </div>
        <Link href="/staff" className="text-white/40 hover:text-white text-sm transition-colors">
          ← Staff Portal
        </Link>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Success banner */}
        {success && (
          <div className="bg-green-500/15 border border-green-500/40 rounded-xl p-4 text-green-300 text-sm">
            {success}
          </div>
        )}

        {/* Step 1 — Member lookup */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-wide mb-3">1 — Find Member</p>
          <input
            type="text"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[48px]"
          />

          {searching && <p className="text-white/30 text-xs mt-2">Searching…</p>}

          {results.length > 0 && !selected && (
            <div className="mt-2 flex flex-col gap-1">
              {results.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelected(m); setResults([]); setQuery(m.name); }}
                  className="text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <p className="text-white text-sm font-semibold">{m.name}</p>
                  <p className="text-white/40 text-xs">{m.email} · {m.member_id}</p>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="mt-3 flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
              <div>
                <p className="text-green-300 font-semibold text-sm">{selected.name}</p>
                <p className="text-white/40 text-xs">{selected.email}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setQuery(''); }}
                className="text-white/30 hover:text-white text-xs"
              >
                Change
              </button>
            </div>
          )}
        </section>

        {/* Step 2 — Pass selection */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-wide mb-3">2 — Choose Pass</p>

          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-4">
            {(['membership', 'punch'] as PassTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
                  tab === t ? 'bg-green-600 text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                {t === 'membership' ? 'Membership' : 'Punch Pass'}
              </button>
            ))}
          </div>

          {tab === 'membership' && (
            <div className="flex flex-col gap-3">
              {MEMBERSHIP_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setMemberType(type)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    memberType === type ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-white text-sm">{MEMBERSHIP_LABELS[type]}</p>
                    <p className="text-green-400 font-bold text-sm">${MEMBERSHIP_PRICES[type][tier]}</p>
                  </div>
                </button>
              ))}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-2 mt-1">Member Type</p>
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
            </div>
          )}

          {tab === 'punch' && (
            <div className="flex flex-col gap-2">
              {PUNCH_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() => setPunches(count)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    punches === count ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white text-sm">{count}-Visit Pass</p>
                      <p className="text-white/30 text-xs">${(PUNCH_PASS_PRICES[count] / count).toFixed(2)}/visit · Never expires</p>
                    </div>
                    <p className="text-green-400 font-bold">${PUNCH_PASS_PRICES[count]}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Step 3 — Payment & confirm */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-wide mb-3">3 — Payment</p>

          <div className="flex gap-2 mb-4">
            {(['cash', 'square'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                  paymentMethod === method
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-white/10 text-white/40 hover:border-white/20'
                }`}
              >
                {method === 'cash' ? 'Cash' : 'Square Terminal'}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 mb-4">
            <p className="text-white/60 text-sm">Collect from customer</p>
            <p className="text-green-400 font-black text-2xl">${price}</p>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            onClick={handleAddPass}
            disabled={!selected || loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-900 disabled:cursor-not-allowed text-black font-bold rounded-xl py-3 min-h-[52px] transition-colors"
          >
            {loading ? 'Adding…' : !selected ? 'Select a member first' : `Collect $${price} & Add Pass`}
          </button>
        </section>
      </div>
    </div>
  );
}
