import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { userStore, membershipStore } from '@/lib/memberStore';
import type { Membership, MembershipType, MemberTier } from '@/data/memberTypes';

function addMonths(date: Date, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('member_session')?.value;
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  return Response.json(membershipStore.findByUserId(userId));
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('member_session')?.value;
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const user = userStore.findById(userId);
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  const { type, tier, householdEmails = [] } = await request.json() as {
    type: MembershipType;
    tier: MemberTier;
    householdEmails?: string[];
  };

  const today = new Date();
  const endDate = type === 'monthly'
    ? addMonths(today, 1)
    : addMonths(today, 12);

  // TODO: Charge Square before creating membership
  // const payment = await squareClient.paymentsApi.createPayment(...)

  const membership: Membership = {
    id: crypto.randomUUID(),
    userId,
    type,
    tier,
    status: 'active',
    startDate: today.toISOString().split('T')[0],
    endDate,
    householdEmails: type === 'household_annual' ? householdEmails : [],
    squarePaymentId: 'TODO_SQUARE',
    createdAt: today.toISOString(),
  };

  membershipStore.add(membership);

  return Response.json(membership, { status: 201 });
}
