import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { dayPassStore } from '@/lib/memberStore';
import { DAY_PASS_PRICE } from '@/data/memberTypes';
import type { DayPass } from '@/data/memberTypes';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !['volunteer', 'employee', 'admin'].includes(session.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as { guestName?: string; paymentMethod?: string };
  const guestName = (body.guestName ?? '').trim();
  const paymentMethod = body.paymentMethod === 'square' ? 'square' : 'cash';

  const pass: DayPass = {
    id: crypto.randomUUID(),
    guestName,
    paymentMethod,
    amount: DAY_PASS_PRICE,
    createdAt: new Date().toISOString(),
  };

  try {
    await dayPassStore.add(pass);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `Database error: ${msg}` }, { status: 500 });
  }

  return Response.json(pass, { status: 201 });
}
