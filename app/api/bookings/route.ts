import type { NextRequest } from 'next/server';
import { bookingStore } from '@/lib/bookingStore';
import type { Booking } from '@/data/schedulerTypes';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const providerId = searchParams.get('providerId') ?? undefined;
  const date = searchParams.get('date') ?? undefined;
  return Response.json(bookingStore.getFiltered(providerId, date));
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const booking: Booking = {
    id: crypto.randomUUID(),
    serviceId: body.serviceId,
    serviceName: body.serviceName,
    providerId: body.providerId,
    providerName: body.providerName,
    date: body.date,
    time: body.time,
    customerName: body.customerName ?? '',
    customerEmail: body.customerEmail ?? '',
    customerPhone: body.customerPhone ?? '',
    notes: body.notes ?? '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  bookingStore.add(booking);

  // TODO: Send confirmation email to customer and admin notification
  // TODO: Integrate Square payment when requirePayment is true

  return Response.json(booking, { status: 201 });
}
