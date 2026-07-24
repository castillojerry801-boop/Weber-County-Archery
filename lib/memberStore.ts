import { db } from '@/lib/supabase';
import type { User, Membership, PunchPass, CheckInLog } from '@/data/memberTypes';

// --- DB row types (snake_case from Postgres) ---
type MemberRow = {
  id: string; email: string; name: string; phone: string;
  password_hash: string; member_id: string; role: string; created_at: string;
};
type MembershipRow = {
  id: string; user_id: string; type: string; tier: string; status: string;
  start_date: string; end_date: string; household_emails: string[];
  square_payment_id: string; created_at: string;
};
type PunchPassRow = {
  id: string; user_id: string; total_punches: number; punches_remaining: number;
  status: string; square_payment_id: string; purchased_at: string;
};
type CheckInRow = {
  id: string; member_id: string; user_id: string; pass_type: string;
  result: string; note: string; checked_in_at: string;
};

// --- Mappers ---
function toUser(r: MemberRow): User {
  return { id: r.id, email: r.email, name: r.name, phone: r.phone,
    passwordHash: r.password_hash, memberId: r.member_id,
    role: (r.role ?? 'member') as User['role'], createdAt: r.created_at };
}
function toMembership(r: MembershipRow): Membership {
  return { id: r.id, userId: r.user_id, type: r.type as Membership['type'],
    tier: r.tier as Membership['tier'], status: r.status as Membership['status'],
    startDate: r.start_date, endDate: r.end_date,
    householdEmails: r.household_emails ?? [],
    squarePaymentId: r.square_payment_id, createdAt: r.created_at };
}
function toPunchPass(r: PunchPassRow): PunchPass {
  return { id: r.id, userId: r.user_id, totalPunches: r.total_punches as 10 | 20 | 30,
    punchesRemaining: r.punches_remaining, status: r.status as PunchPass['status'],
    squarePaymentId: r.square_payment_id, purchasedAt: r.purchased_at };
}
function toCheckIn(r: CheckInRow): CheckInLog {
  return { id: r.id, memberId: r.member_id, userId: r.user_id,
    passType: r.pass_type as CheckInLog['passType'], result: r.result as CheckInLog['result'],
    note: r.note, checkedInAt: r.checked_in_at };
}
function membershipToRow(updates: Partial<Membership>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (updates.status !== undefined)         row.status = updates.status;
  if (updates.householdEmails !== undefined) row.household_emails = updates.householdEmails;
  if (updates.endDate !== undefined)         row.end_date = updates.endDate;
  if (updates.startDate !== undefined)       row.start_date = updates.startDate;
  if (updates.type !== undefined)            row.type = updates.type;
  if (updates.tier !== undefined)            row.tier = updates.tier;
  if (updates.squarePaymentId !== undefined) row.square_payment_id = updates.squarePaymentId;
  return row;
}

// --- Stores ---
export const userStore = {
  async findByEmail(email: string): Promise<User | null> {
    const { data } = await db.from('members').select()
      .ilike('email', email).limit(1).maybeSingle();
    return data ? toUser(data as MemberRow) : null;
  },

  async findById(id: string): Promise<User | null> {
    const { data } = await db.from('members').select()
      .eq('id', id).maybeSingle();
    return data ? toUser(data as MemberRow) : null;
  },

  async findByMemberId(memberId: string): Promise<User | null> {
    const { data } = await db.from('members').select()
      .eq('member_id', memberId).maybeSingle();
    return data ? toUser(data as MemberRow) : null;
  },

  async add(user: User): Promise<void> {
    const { error } = await db.from('members').insert({
      id: user.id, email: user.email, name: user.name, phone: user.phone,
      password_hash: user.passwordHash, member_id: user.memberId,
      role: user.role ?? 'member', created_at: user.createdAt,
    });
    if (error) throw error;
  },

  async updateRole(id: string, role: User['role']): Promise<void> {
    const { error } = await db.from('members').update({ role }).eq('id', id);
    if (error) throw error;
  },

  async search(q: string, limit = 20): Promise<User[]> {
    const { data } = await db.from('members').select()
      .or(`email.ilike.%${q}%,name.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data ?? []).map((r) => toUser(r as MemberRow));
  },

  async listAll(limit = 100): Promise<User[]> {
    const { data } = await db.from('members').select()
      .order('created_at', { ascending: false }).limit(limit);
    return (data ?? []).map((r) => toUser(r as MemberRow));
  },
};

export const membershipStore = {
  async findByUserId(userId: string): Promise<Membership[]> {
    const { data } = await db.from('memberships').select()
      .eq('user_id', userId).order('created_at', { ascending: false });
    return (data ?? []).map((r) => toMembership(r as MembershipRow));
  },

  async findActiveByUserId(userId: string): Promise<Membership | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await db.from('memberships').select()
      .eq('user_id', userId).eq('status', 'active').gte('end_date', today)
      .limit(1).maybeSingle();
    return data ? toMembership(data as MembershipRow) : null;
  },

  async findActiveForMember(userId: string, email: string): Promise<Membership | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await db.from('memberships').select()
      .eq('status', 'active').gte('end_date', today)
      .or(`user_id.eq.${userId},household_emails.cs.{${email}}`)
      .limit(1).maybeSingle();
    return data ? toMembership(data as MembershipRow) : null;
  },

  async add(m: Membership): Promise<void> {
    const { error } = await db.from('memberships').insert({
      id: m.id, user_id: m.userId, type: m.type, tier: m.tier, status: m.status,
      start_date: m.startDate, end_date: m.endDate,
      household_emails: m.householdEmails, square_payment_id: m.squarePaymentId,
      created_at: m.createdAt,
    });
    if (error) throw error;
  },

  async update(id: string, updates: Partial<Membership>): Promise<void> {
    const row = membershipToRow(updates);
    if (Object.keys(row).length === 0) return;
    const { error } = await db.from('memberships').update(row).eq('id', id);
    if (error) throw error;
  },
};

export const punchStore = {
  async findActiveByUserId(userId: string): Promise<PunchPass | null> {
    const { data } = await db.from('punch_passes').select()
      .eq('user_id', userId).eq('status', 'active').limit(1).maybeSingle();
    return data ? toPunchPass(data as PunchPassRow) : null;
  },

  async findByUserId(userId: string): Promise<PunchPass[]> {
    const { data } = await db.from('punch_passes').select()
      .eq('user_id', userId).order('purchased_at', { ascending: false });
    return (data ?? []).map((r) => toPunchPass(r as PunchPassRow));
  },

  async add(p: PunchPass): Promise<void> {
    const { error } = await db.from('punch_passes').insert({
      id: p.id, user_id: p.userId, total_punches: p.totalPunches,
      punches_remaining: p.punchesRemaining, status: p.status,
      square_payment_id: p.squarePaymentId, purchased_at: p.purchasedAt,
    });
    if (error) throw error;
  },

  async deduct(id: string): Promise<number> {
    const { data: current } = await db.from('punch_passes').select('punches_remaining')
      .eq('id', id).single();
    if (!current) return -1;
    const newRemaining = Math.max(0, (current as { punches_remaining: number }).punches_remaining - 1);
    const { data: updated } = await db.from('punch_passes')
      .update({ punches_remaining: newRemaining, status: newRemaining === 0 ? 'depleted' : 'active' })
      .eq('id', id).select('punches_remaining').single();
    return (updated as { punches_remaining: number } | null)?.punches_remaining ?? newRemaining;
  },
};

export const checkInStore = {
  async add(log: CheckInLog): Promise<void> {
    const { error } = await db.from('check_ins').insert({
      id: log.id, member_id: log.memberId, user_id: log.userId,
      pass_type: log.passType, result: log.result, note: log.note,
      checked_in_at: log.checkedInAt,
    });
    if (error) throw error;
  },

  async recent(limit = 20): Promise<CheckInLog[]> {
    const { data } = await db.from('check_ins').select()
      .order('checked_in_at', { ascending: false }).limit(limit);
    return (data ?? []).map((r) => toCheckIn(r as CheckInRow));
  },

  async todayCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await db.from('check_ins')
      .select('*', { count: 'exact', head: true })
      .gte('checked_in_at', `${today}T00:00:00.000Z`);
    return count ?? 0;
  },

  async recentWithNames(limit = 30): Promise<Array<CheckInLog & { memberName: string }>> {
    const { data } = await db.from('check_ins').select()
      .order('checked_in_at', { ascending: false }).limit(limit);
    if (!data || data.length === 0) return [];
    const logs = data.map((r) => toCheckIn(r as CheckInRow));
    const userIds = [...new Set(logs.map((l) => l.userId))];
    const { data: members } = await db.from('members').select('id, name').in('id', userIds);
    const nameMap = new Map((members ?? []).map((m: { id: string; name: string }) => [m.id, m.name]));
    return logs.map((l) => ({ ...l, memberName: nameMap.get(l.userId) ?? 'Unknown' }));
  },
};
