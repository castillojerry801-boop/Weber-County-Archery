import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/supabase';

const schema = z.object({
  description:   z.string().max(200).trim().optional().default(''),
  amount:        z.number().positive().max(10000),
  paymentMethod: z.enum(['cash', 'square']).optional().default('cash'),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !['volunteer', 'employee', 'admin'].includes(session.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const { description, amount, paymentMethod } = parsed.data;

  const { data, error } = await db.from('custom_charges').insert({
    id: crypto.randomUUID(),
    description,
    amount,
    payment_method: paymentMethod,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
