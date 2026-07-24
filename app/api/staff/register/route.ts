import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { userStore } from '@/lib/memberStore';
import type { User } from '@/data/memberTypes';

const schema = z.object({
  name:     z.string().min(2).max(80).trim(),
  email:    z.string().email().max(254).toLowerCase(),
  phone:    z.string().max(20).trim().optional().default(''),
  password: z.string().min(6).max(128),
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

  const { name, email, phone, password } = parsed.data;

  const existing = await userStore.findByEmail(email);
  if (existing) {
    return Response.json({ error: 'An account with that email already exists.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    phone,
    passwordHash,
    memberId: `WCAP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    role: 'member',
    createdAt: new Date().toISOString(),
  };

  try {
    await userStore.add(user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `Database error: ${msg}` }, { status: 500 });
  }

  return Response.json(
    { id: user.id, name: user.name, email: user.email, phone: user.phone, memberId: user.memberId },
    { status: 201 },
  );
}
