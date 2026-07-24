import { NextRequest } from 'next/server';
import { membershipStore, punchStore } from '@/lib/memberStore';
import type { Membership, MembershipType, MemberTier, PunchPass } from '@/data/memberTypes';

function addMonths(date: Date, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    userId: string;
    passKind: 'membership' | 'punch';
    // membership fields
    type?: MembershipType;
    tier?: MemberTier;
    householdEmails?: string[];
    // punch fields
    punches?: 10 | 20 | 30;
    // payment info
    paymentMethod?: string;
    squarePaymentId?: string;
  };

  const { userId, passKind, paymentMethod = 'cash', squarePaymentId = '' } = body;
  if (!userId || !passKind) {
    return Response.json({ error: 'userId and passKind required' }, { status: 400 });
  }

  const today = new Date();

  if (passKind === 'membership') {
    const { type, tier, householdEmails = [] } = body;
    if (!type || !tier) {
      return Response.json({ error: 'type and tier required for membership' }, { status: 400 });
    }
    const membership: Membership = {
      id: crypto.randomUUID(),
      userId,
      type,
      tier,
      status: 'active',
      startDate: today.toISOString().split('T')[0],
      endDate: type === 'monthly' ? addMonths(today, 1) : addMonths(today, 12),
      householdEmails: type === 'household_annual' ? householdEmails : [],
      squarePaymentId: squarePaymentId || `${paymentMethod.toUpperCase()}-${Date.now()}`,
      createdAt: today.toISOString(),
    };
    await membershipStore.add(membership);
    return Response.json(membership, { status: 201 });
  }

  if (passKind === 'punch') {
    const { punches } = body;
    if (!punches || ![10, 20, 30].includes(punches)) {
      return Response.json({ error: 'punches must be 10, 20, or 30' }, { status: 400 });
    }
    const pass: PunchPass = {
      id: crypto.randomUUID(),
      userId,
      totalPunches: punches,
      punchesRemaining: punches,
      status: 'active',
      squarePaymentId: squarePaymentId || `${paymentMethod.toUpperCase()}-${Date.now()}`,
      purchasedAt: today.toISOString(),
    };
    await punchStore.add(pass);
    return Response.json(pass, { status: 201 });
  }

  return Response.json({ error: 'Invalid passKind' }, { status: 400 });
}
