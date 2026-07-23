// TODO: Replace with Postgres (Neon via Vercel Marketplace)
import type { User, Membership, PunchPass, CheckInLog } from '@/data/memberTypes';

declare global {
  // eslint-disable-next-line no-var
  var __memberStore: {
    users: User[];
    memberships: Membership[];
    punchPasses: PunchPass[];
    checkIns: CheckInLog[];
  } | undefined;
}

if (!global.__memberStore) {
  global.__memberStore = { users: [], memberships: [], punchPasses: [], checkIns: [] };
}

const store = () => global.__memberStore!;

export const userStore = {
  findByEmail: (email: string) =>
    store().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findById: (id: string) => store().users.find((u) => u.id === id),
  findByMemberId: (memberId: string) => store().users.find((u) => u.memberId === memberId),
  add: (user: User) => store().users.push(user),
};

export const membershipStore = {
  findByUserId: (userId: string) =>
    store().memberships.filter((m) => m.userId === userId),
  findActiveByUserId: (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return store().memberships.find(
      (m) => m.userId === userId && m.status === 'active' && m.endDate >= today,
    );
  },
  findActiveForMember: (userId: string, email: string) => {
    const today = new Date().toISOString().split('T')[0];
    return store().memberships.find(
      (m) =>
        m.status === 'active' &&
        m.endDate >= today &&
        (m.userId === userId || m.householdEmails.includes(email)),
    );
  },
  add: (m: Membership) => store().memberships.push(m),
  update: (id: string, updates: Partial<Membership>) => {
    const idx = store().memberships.findIndex((m) => m.id === id);
    if (idx !== -1) store().memberships[idx] = { ...store().memberships[idx], ...updates };
  },
};

export const punchStore = {
  findActiveByUserId: (userId: string) =>
    store().punchPasses.find((p) => p.userId === userId && p.status === 'active'),
  findByUserId: (userId: string) =>
    store().punchPasses.filter((p) => p.userId === userId),
  add: (p: PunchPass) => store().punchPasses.push(p),
  deduct: (id: string): number => {
    const idx = store().punchPasses.findIndex((p) => p.id === id);
    if (idx === -1) return -1;
    store().punchPasses[idx].punchesRemaining = Math.max(
      0,
      store().punchPasses[idx].punchesRemaining - 1,
    );
    if (store().punchPasses[idx].punchesRemaining === 0) {
      store().punchPasses[idx].status = 'depleted';
    }
    return store().punchPasses[idx].punchesRemaining;
  },
};

export const checkInStore = {
  add: (log: CheckInLog) => store().checkIns.push(log),
  recent: (limit = 20) =>
    [...store().checkIns]
      .sort((a, b) => b.checkedInAt.localeCompare(a.checkedInAt))
      .slice(0, limit),
};
