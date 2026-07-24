'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  MEMBERSHIP_PRICES, PUNCH_PASS_PRICES,
  MEMBERSHIP_LABELS, TIER_LABELS, DAY_PASS_PRICE,
} from '@/data/memberTypes';
import type { MembershipType, MemberTier } from '@/data/memberTypes';

type MemberResult = {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberId?: string;
  member_id?: string;
};

type PassTab = 'membership' | 'punch';
type PageMode = 'sell' | 'register';

const MEMBERSHIP_TYPES: MembershipType[] = ['monthly', 'annual', 'household_annual'];
const TIERS: MemberTier[] = ['adult', 'senior_military', 'youth'];
const PUNCH_OPTIONS = [10, 20, 30] as const;

// ── Sell Pass panel ──────────────────────────────────────────────────────────

function SellPassPanel() {
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
    <div className="flex flex-col gap-6">
      {success && (
        <div className="bg-green-500/15 border border-green-500/40 rounded-xl p-4 text-green-300 text-sm">
          {success}
        </div>
      )}

      {/* Step 1 */}
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
                <p className="text-white/40 text-xs">{m.email} · {m.memberId ?? m.member_id}</p>
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
            <button onClick={() => { setSelected(null); setQuery(''); }} className="text-white/30 hover:text-white text-xs">
              Change
            </button>
          </div>
        )}
      </section>

      {/* Step 2 */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-xs text-white/40 uppercase tracking-wide mb-3">2 — Choose Pass</p>
        <div className="flex bg-white/5 rounded-xl p-1 mb-4">
          {(['membership', 'punch'] as PassTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-green-600 text-white' : 'text-white/40 hover:text-white'}`}>
              {t === 'membership' ? 'Membership' : 'Punch Pass'}
            </button>
          ))}
        </div>
        {tab === 'membership' && (
          <div className="flex flex-col gap-3">
            {MEMBERSHIP_TYPES.map((type) => (
              <button key={type} onClick={() => setMemberType(type)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${memberType === type ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-white/20'}`}>
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
                  <button key={t} onClick={() => setTier(t)}
                    className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${tier === t ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
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
              <button key={count} onClick={() => setPunches(count)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${punches === count ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-white/20'}`}>
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

      {/* Step 3 */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-xs text-white/40 uppercase tracking-wide mb-3">3 — Payment</p>
        <div className="flex gap-2 mb-4">
          {(['cash', 'square'] as const).map((method) => (
            <button key={method} onClick={() => setPaymentMethod(method)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${paymentMethod === method ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
              {method === 'cash' ? 'Cash' : 'Square Terminal'}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 mb-4">
          <p className="text-white/60 text-sm">Collect from customer</p>
          <p className="text-green-400 font-black text-2xl">${price}</p>
        </div>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button onClick={handleAddPass} disabled={!selected || loading}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-900 disabled:cursor-not-allowed text-black font-bold rounded-xl py-3 min-h-[52px] transition-colors">
          {loading ? 'Adding…' : !selected ? 'Select a member first' : `Collect $${price} & Add Pass`}
        </button>
      </section>
    </div>
  );
}

// ── Register Member panel ────────────────────────────────────────────────────

type PassChoice = 'none' | 'membership' | 'punch';

function RegisterPanel() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  // pass selection
  const [passChoice, setPassChoice] = useState<PassChoice>('membership');
  const [memberType, setMemberType] = useState<MembershipType>('annual');
  const [tier, setTier] = useState<MemberTier>('adult');
  const [punches, setPunches] = useState<10 | 20 | 30>(10);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'square'>('cash');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{
    name: string; email: string; memberId: string;
    passLabel: string | null; price: number | null;
  } | null>(null);

  const passPrice =
    passChoice === 'membership' ? MEMBERSHIP_PRICES[memberType][tier]
    : passChoice === 'punch'    ? PUNCH_PASS_PRICES[punches]
    : 0;

  const passLabel =
    passChoice === 'membership'
      ? `${MEMBERSHIP_LABELS[memberType]} — ${TIER_LABELS[tier]}`
      : passChoice === 'punch'
      ? `${punches}-Visit Punch Pass`
      : null;

  function textField(id: keyof typeof form, label: string, type = 'text', placeholder = '') {
    return (
      <div key={id}>
        <label className="block text-xs font-medium text-white/50 mb-1">{label}</label>
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Step 1: create account
      const regRes = await fetch('/api/staff/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const regData = await regRes.json();
      if (!regRes.ok) { setError(regData.error ?? 'Registration failed.'); return; }

      // Step 2: add pass if one was chosen
      if (passChoice !== 'none') {
        const passBody = passChoice === 'membership'
          ? { userId: regData.id, passKind: 'membership', type: memberType, tier, paymentMethod }
          : { userId: regData.id, passKind: 'punch', punches, paymentMethod };

        const passRes = await fetch('/api/staff/passes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(passBody),
        });
        if (!passRes.ok) {
          const passData = await passRes.json();
          // Account was created — warn but still show success for account
          setError(`Account created, but pass failed: ${passData.error ?? 'Unknown error'}`);
          setCreated({ name: regData.name, email: regData.email, memberId: regData.memberId, passLabel: null, price: null });
          return;
        }
      }

      setCreated({
        name: regData.name,
        email: regData.email,
        memberId: regData.memberId,
        passLabel: passChoice !== 'none' ? passLabel : null,
        price: passChoice !== 'none' ? passPrice : null,
      });
      setForm({ name: '', email: '', phone: '', password: '' });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setCreated(null);
    setError('');
    setPassChoice('membership');
    setMemberType('annual');
    setTier('adult');
    setPunches(10);
    setPaymentMethod('cash');
  }

  if (created) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-green-500/15 border border-green-500/40 rounded-2xl p-6 text-center">
          <p className="text-green-400 text-2xl font-black mb-1">Done!</p>
          <p className="text-white font-semibold text-lg">{created.name}</p>
          <p className="text-white/50 text-sm">{created.email}</p>
          <p className="text-white/30 text-xs font-mono mt-1">{created.memberId}</p>

          {created.passLabel && created.price !== null && (
            <div className="mt-5 bg-white/5 rounded-xl px-4 py-3 text-left">
              <div className="flex justify-between items-center">
                <p className="text-white/70 text-sm">{created.passLabel}</p>
                <p className="text-green-400 font-black text-lg">${created.price}</p>
              </div>
              <p className="text-white/30 text-xs mt-1">Pass activated — QR code ready immediately</p>
            </div>
          )}

          <p className="text-white/40 text-xs mt-5 leading-relaxed">
            Tell {created.name.split(' ')[0]} to sign in at{' '}
            <span className="text-green-400">webercountyarchery.com/login</span> to access their QR code.
          </p>
        </div>
        {error && <p className="text-yellow-400 text-sm">{error}</p>}
        <button
          onClick={reset}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl py-3 transition-colors"
        >
          Register Another Member
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Member info */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
        <p className="text-xs text-white/40 uppercase tracking-wide">1 — Member Info</p>
        {textField('name',     'Full Name',          'text',     'Frank Johnson')}
        {textField('email',    'Email',              'email',    'frank@example.com')}
        {textField('phone',    'Phone (optional)',   'tel',      '(801) 555-0100')}
        {textField('password', 'Temporary Password', 'password', 'min 6 characters')}
        <p className="text-white/25 text-xs">Give this password to the customer — they can change it after logging in.</p>
      </section>

      {/* Pass selection */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
        <p className="text-xs text-white/40 uppercase tracking-wide">2 — Add a Pass</p>

        {/* Pass type tabs */}
        <div className="flex bg-white/5 rounded-xl p-1">
          {([['membership', 'Membership'], ['punch', 'Punch Pass'], ['none', 'Skip']] as [PassChoice, string][]).map(([val, label]) => (
            <button key={val} type="button" onClick={() => setPassChoice(val)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${passChoice === val ? val === 'none' ? 'bg-white/10 text-white/60' : 'bg-green-600 text-white' : 'text-white/30 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {passChoice === 'membership' && (
          <>
            <div className="flex flex-col gap-2">
              {MEMBERSHIP_TYPES.map((type) => (
                <button key={type} type="button" onClick={() => setMemberType(type)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${memberType === type ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-white/20'}`}>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-white text-sm">{MEMBERSHIP_LABELS[type]}</p>
                    <p className="text-green-400 font-bold text-sm">${MEMBERSHIP_PRICES[type][tier]}</p>
                  </div>
                </button>
              ))}
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Member Type</p>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map((t) => (
                  <button key={t} type="button" onClick={() => setTier(t)}
                    className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${tier === t ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 text-white/50 hover:border-white/20'}`}>
                    {TIER_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {passChoice === 'punch' && (
          <div className="flex flex-col gap-2">
            {PUNCH_OPTIONS.map((count) => (
              <button key={count} type="button" onClick={() => setPunches(count)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${punches === count ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-white/20'}`}>
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

        {passChoice === 'none' && (
          <p className="text-white/30 text-xs">No pass — account only. You can add a pass later from the Sell Pass tab.</p>
        )}
      </section>

      {/* Payment */}
      {passChoice !== 'none' && (
        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-xs text-white/40 uppercase tracking-wide">3 — Payment</p>
          <div className="flex gap-2">
            {(['cash', 'square'] as const).map((method) => (
              <button key={method} type="button" onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${paymentMethod === method ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                {method === 'cash' ? 'Cash' : 'Square Terminal'}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
            <p className="text-white/60 text-sm">Collect from customer</p>
            <p className="text-green-400 font-black text-2xl">${passPrice}</p>
          </div>
        </section>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-black font-bold rounded-xl py-3 min-h-[52px] transition-colors"
      >
        {loading
          ? 'Processing…'
          : passChoice !== 'none'
          ? `Collect $${passPrice} & Register`
          : 'Create Account'}
      </button>
    </form>
  );
}

// ── Day Pass widget ──────────────────────────────────────────────────────────

function DayPassWidget() {
  const [open, setOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'square'>('cash');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleCharge() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/staff/day-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName, paymentMethod }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong.');
        return;
      }
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSuccess(false);
    setOpen(false);
    setGuestName('');
    setPaymentMethod('cash');
    setError('');
  }

  if (success) {
    return (
      <div className="bg-green-500/15 border border-green-500/40 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black font-black text-lg shrink-0">✓</div>
          <div>
            <p className="text-green-300 font-bold">Day Pass Sold — ${DAY_PASS_PRICE}</p>
            <p className="text-white/40 text-xs">{guestName || 'Walk-in guest'} · {paymentMethod === 'cash' ? 'Cash' : 'Square'}</p>
          </div>
        </div>
        <button onClick={reset} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors">
          Sell Another Day Pass
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-5 py-4 transition-colors group"
      >
        <div className="text-left">
          <p className="text-white font-bold text-lg">Day Pass</p>
          <p className="text-white/40 text-xs">Walk-in · No account needed</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-green-400 font-black text-2xl">${DAY_PASS_PRICE}</span>
          <span className="text-white/30 group-hover:text-white/60 text-sm transition-colors">Tap →</span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-lg">Day Pass</p>
          <p className="text-white/40 text-xs">Walk-in · No account needed</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white text-sm transition-colors">Cancel</button>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/50 mb-1">Guest Name <span className="text-white/25">(optional)</span></label>
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Frank Johnson"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[48px]"
        />
      </div>

      <div className="flex gap-2">
        {(['cash', 'square'] as const).map((method) => (
          <button key={method} type="button" onClick={() => setPaymentMethod(method)}
            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${paymentMethod === method ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
            {method === 'cash' ? 'Cash' : 'Square Terminal'}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleCharge}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-black font-black rounded-xl py-4 text-lg min-h-[56px] transition-colors"
      >
        {loading ? 'Processing…' : `Collect $${DAY_PASS_PRICE} · Day Pass`}
      </button>
    </div>
  );
}

// ── Page shell ───────────────────────────────────────────────────────────────

export default function SquarePage() {
  const [mode, setMode] = useState<PageMode>('sell');

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h1 className="font-bold text-white">Point of Sale</h1>
          <p className="text-white/40 text-xs mt-0.5">Walk-in sales &amp; new member registration</p>
        </div>
        <Link href="/staff" className="text-white/40 hover:text-white text-sm transition-colors">
          ← Staff Portal
        </Link>
      </header>

      {/* Day pass quick-sale */}
      <div className="max-w-lg mx-auto px-4 pt-6">
        <DayPassWidget />
      </div>

      {/* Divider */}
      <div className="max-w-lg mx-auto px-4 pt-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/20 text-xs uppercase tracking-widest">Member Sales</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Mode switcher */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
          <button
            onClick={() => setMode('sell')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${mode === 'sell' ? 'bg-green-600 text-white' : 'text-white/40 hover:text-white'}`}
          >
            Sell Pass
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${mode === 'register' ? 'bg-green-600 text-white' : 'text-white/40 hover:text-white'}`}
          >
            Register Member
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {mode === 'sell' ? <SellPassPanel /> : <RegisterPanel />}
      </div>
    </div>
  );
}
