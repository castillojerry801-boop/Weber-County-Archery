'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import type { Membership, PunchPass } from '@/data/memberTypes';
import { MEMBERSHIP_LABELS, TIER_LABELS } from '@/data/memberTypes';

type MeData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberId: string;
  createdAt: string;
  activeMembership: Membership | null;
  activePunchPass: PunchPass | null;
  memberships: Membership[];
  punchPasses: PunchPass[];
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function MemberDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => { if (r.status === 401) { router.push('/login'); return null; } return r.json(); })
      .then((d) => { if (d) setMe(d); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!me) return null;

  const membership = me.activeMembership;
  const punch = me.activePunchPass;
  const hasPass = !!(membership || punch);

  const membershipDays = membership ? daysUntil(membership.endDate) : null;
  const passStatus: 'green' | 'yellow' | 'red' = !hasPass
    ? 'red'
    : membership
    ? membershipDays! <= 7 ? 'yellow' : 'green'
    : punch!.punchesRemaining <= 2 ? 'yellow' : 'green';

  const statusColors = {
    green:  { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400',  dot: 'bg-green-400'  },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
    red:    { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    dot: 'bg-red-400'    },
  }[passStatus];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🏹</span>
          <span className="font-bold text-white text-sm">WCAP</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/member/passes" className="text-xs text-white/50 hover:text-white">Passes</Link>
          <Link href="/member/family" className="text-xs text-white/50 hover:text-white">Family</Link>
          <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white/60">Sign Out</button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Hey, {me.name.split(' ')[0]} 👋</h1>
          <p className="text-white/40 text-sm mt-0.5">{me.email}</p>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 border mb-6 ${statusColors.bg} ${statusColors.border}`}>
          <span className={`w-2 h-2 rounded-full ${statusColors.dot} ${passStatus === 'green' ? 'animate-pulse' : ''}`} />
          <span className={`text-sm font-semibold ${statusColors.text}`}>
            {!hasPass
              ? 'No active pass — purchase one below'
              : membership
              ? `${MEMBERSHIP_LABELS[membership.type]} · ${membershipDays}d remaining`
              : `Punch Pass · ${punch!.punchesRemaining} of ${punch!.totalPunches} left`}
          </span>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center mb-6">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">Your Member QR Code</p>
          <div className="p-2">
            <QRCode
              value={me.memberId}
              size={200}
              level="H"
              style={{ display: 'block' }}
            />
          </div>
          <p className="text-gray-300 text-xs font-mono mt-4">{me.memberId}</p>
          <p className="text-gray-400 text-xs mt-1">Show this at the front desk to check in</p>
        </div>

        {/* Pass details */}
        {membership && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Active Membership</p>
                <p className="font-bold text-white">{MEMBERSHIP_LABELS[membership.type]}</p>
                <p className="text-white/50 text-sm">{TIER_LABELS[membership.tier]}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">Expires</p>
                <p className="text-white text-sm font-semibold">{formatDate(membership.endDate)}</p>
              </div>
            </div>
            {membership.householdEmails.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-white/40 mb-1">Household members covered</p>
                {membership.householdEmails.map((e) => (
                  <p key={e} className="text-white/60 text-xs">{e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {punch && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Punch Pass</p>
                <p className="font-bold text-white">{punch.totalPunches}-Visit Pass</p>
              </div>
              <p className={`text-2xl font-black ${punch.punchesRemaining <= 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                {punch.punchesRemaining}
                <span className="text-sm text-white/30 font-normal"> left</span>
              </p>
            </div>
            {/* Punch dots */}
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: punch.totalPunches }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < punch.punchesRemaining ? 'bg-green-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Get a pass CTA */}
        {!hasPass && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-4 text-center">
            <p className="text-white font-semibold mb-1">No active pass</p>
            <p className="text-white/50 text-sm mb-4">Purchase a membership or punch pass to check in at the range.</p>
            <Link
              href="/member/passes"
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-6 py-3 transition-colors"
            >
              Browse Passes
            </Link>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Link
            href="/member/passes"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-center transition-colors"
          >
            <p className="text-2xl mb-1">🎟</p>
            <p className="text-white text-sm font-semibold">Passes</p>
            <p className="text-white/40 text-xs">Buy or renew</p>
          </Link>
          <Link
            href="/member/family"
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-center transition-colors"
          >
            <p className="text-2xl mb-1">👨‍👩‍👧</p>
            <p className="text-white text-sm font-semibold">Family</p>
            <p className="text-white/40 text-xs">Manage household</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
