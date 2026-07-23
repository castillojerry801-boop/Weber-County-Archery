'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Membership } from '@/data/memberTypes';

export default function FamilyPage() {
  const router = useRouter();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then((r) => { if (r.status === 401) { router.push('/login'); return null; } return r.json(); })
      .then((d) => {
        if (d?.activeMembership?.type === 'household_annual') {
          setMembership(d.activeMembership);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function addMember() {
    if (!newEmail.trim() || !membership) return;
    setError(''); setSuccess(''); setSaving(true);
    try {
      const updated = [...(membership.householdEmails ?? []), newEmail.trim().toLowerCase()];
      const res = await fetch(`/api/memberships/${membership.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ householdEmails: updated }),
      });
      if (!res.ok) { setError('Could not add member. Try again.'); return; }
      setMembership((m) => m ? { ...m, householdEmails: updated } : m);
      setNewEmail('');
      setSuccess(`${newEmail} added to your household.`);
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(email: string) {
    if (!membership) return;
    const updated = membership.householdEmails.filter((e) => e !== email);
    const res = await fetch(`/api/memberships/${membership.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ householdEmails: updated }),
    });
    if (res.ok) setMembership((m) => m ? { ...m, householdEmails: updated } : m);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <Link href="/member" className="text-white/40 hover:text-white text-sm">← Back</Link>
        <h1 className="font-bold text-white">Household Members</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {!membership ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">👨‍👩‍👧</p>
            <h2 className="text-lg font-bold text-white mb-2">Household Pass Required</h2>
            <p className="text-white/40 text-sm mb-6">
              Add family members to your account by upgrading to a Household Annual Pass.
              Everyone shares one QR code at check-in.
            </p>
            <Link
              href="/member/passes"
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-6 py-3 transition-colors"
            >
              Get Household Pass
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <p className="text-green-400 text-sm font-semibold">Household Annual Pass</p>
              <p className="text-white/50 text-xs mt-1">
                All members below are covered under your QR code. They can also log in to view their status.
              </p>
            </div>

            {/* Add member */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
              <p className="text-sm font-semibold text-white mb-3">Add a Family Member</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="their@email.com"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
                  onKeyDown={(e) => e.key === 'Enter' && addMember()}
                />
                <button
                  onClick={addMember}
                  disabled={saving || !newEmail.trim()}
                  className="bg-green-500 hover:bg-green-400 disabled:bg-green-900 text-black font-bold rounded-xl px-4 min-h-[44px] transition-colors text-sm"
                >
                  {saving ? '…' : 'Add'}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              {success && <p className="text-green-400 text-xs mt-2">{success}</p>}
            </div>

            {/* Member list */}
            {membership.householdEmails.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">No family members added yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {membership.householdEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
                        {email[0].toUpperCase()}
                      </div>
                      <p className="text-white text-sm">{email}</p>
                    </div>
                    <button
                      onClick={() => removeMember(email)}
                      className="text-white/20 hover:text-red-400 text-xs transition-colors min-h-[44px] px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
