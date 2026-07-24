'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { UserRole } from '@/data/memberTypes';

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberId: string;
  role: UserRole;
  createdAt: string;
};

const ROLE_LABELS: Record<UserRole, string> = {
  member:    'Member',
  volunteer: 'Volunteer',
  employee:  'Employee',
  admin:     'Admin',
};

const ROLE_COLORS: Record<UserRole, string> = {
  member:    'bg-white/10 text-white/50',
  volunteer: 'bg-blue-500/20 text-blue-300',
  employee:  'bg-purple-500/20 text-purple-300',
  admin:     'bg-green-500/20 text-green-300',
};

export default function AdminPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchUsers = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const url = q.length >= 2 ? `/api/admin/users?q=${encodeURIComponent(q)}` : '/api/admin/users';
      const res = await fetch(url);
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleSearch(q: string) {
    setQuery(q);
    await fetchUsers(q);
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    setSaving(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h1 className="font-bold text-white">Admin Panel</h1>
          <p className="text-white/40 text-xs mt-0.5">Manage user roles and access</p>
        </div>
        <Link href="/staff" className="text-white/40 hover:text-white text-sm transition-colors">
          ← Staff Portal
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[48px] mb-6"
        />

        {/* Role legend */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
            <span key={r} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[r]}`}>
              {ROLE_LABELS[r]}
            </span>
          ))}
        </div>

        {loading ? (
          <p className="text-white/30 text-sm">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-white/30 text-sm">No users found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-sm">{user.name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{user.email}</p>
                  <p className="text-white/20 text-xs">{user.memberId}</p>
                </div>

                <select
                  value={user.role}
                  disabled={saving === user.id}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                  className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[40px] disabled:opacity-50"
                >
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                    <option key={r} value={r} className="bg-[#1a1a1a]">
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
