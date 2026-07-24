import type { NextRequest } from 'next/server';
import { bookingStore } from '@/lib/bookingStore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const booking = await bookingStore.getById(id);
  if (!booking) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(booking);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const updated = await bookingStore.update(id, body);
  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(updated);
}
