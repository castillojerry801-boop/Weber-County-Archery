import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { punchStore } from '@/lib/memberStore';
import type { PunchPass } from '@/data/memberTypes';

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('member_session')?.value;
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  return Response.json(await punchStore.findByUserId(userId));
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('member_session')?.value;
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { punches } = await request.json() as { punches: 10 | 20 | 30 };

  if (![10, 20, 30].includes(punches)) {
    return Response.json({ error: 'Invalid punch count. Choose 10, 20, or 30.' }, { status: 400 });
  }

  // TODO: Charge Square before creating punch pass

  const pass: PunchPass = {
    id: crypto.randomUUID(),
    userId,
    totalPunches: punches,
    punchesRemaining: punches,
    status: 'active',
    squarePaymentId: 'TODO_SQUARE',
    purchasedAt: new Date().toISOString(),
  };

  await punchStore.add(pass);

  return Response.json(pass, { status: 201 });
}
