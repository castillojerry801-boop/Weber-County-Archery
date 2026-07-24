import { db } from '@/lib/supabase';
import type { Booking } from '@/data/schedulerTypes';

type BookingRow = {
  id: string; service_id: string; service_name: string;
  provider_id: string; provider_name: string; date: string; time: string;
  customer_name: string; customer_email: string; customer_phone: string;
  notes: string; status: string; created_at: string;
};

function toBooking(r: BookingRow): Booking {
  return {
    id: r.id, serviceId: r.service_id, serviceName: r.service_name,
    providerId: r.provider_id, providerName: r.provider_name,
    date: r.date, time: r.time, customerName: r.customer_name,
    customerEmail: r.customer_email, customerPhone: r.customer_phone,
    notes: r.notes, status: r.status as Booking['status'], createdAt: r.created_at,
  };
}
function bookingToRow(updates: Partial<Booking>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (updates.status !== undefined)        row.status = updates.status;
  if (updates.notes !== undefined)         row.notes = updates.notes;
  if (updates.customerName !== undefined)  row.customer_name = updates.customerName;
  if (updates.customerEmail !== undefined) row.customer_email = updates.customerEmail;
  if (updates.customerPhone !== undefined) row.customer_phone = updates.customerPhone;
  if (updates.date !== undefined)          row.date = updates.date;
  if (updates.time !== undefined)          row.time = updates.time;
  return row;
}

export const bookingStore = {
  async getAll(): Promise<Booking[]> {
    const { data } = await db.from('bookings').select()
      .order('date').order('time');
    return (data ?? []).map((r) => toBooking(r as BookingRow));
  },

  async getById(id: string): Promise<Booking | null> {
    const { data } = await db.from('bookings').select()
      .eq('id', id).maybeSingle();
    return data ? toBooking(data as BookingRow) : null;
  },

  async getFiltered(providerId?: string, date?: string): Promise<Booking[]> {
    let q = db.from('bookings').select().order('date').order('time');
    if (providerId) q = q.eq('provider_id', providerId);
    if (date)       q = q.eq('date', date);
    const { data } = await q;
    return (data ?? []).map((r) => toBooking(r as BookingRow));
  },

  async add(booking: Booking): Promise<void> {
    const { error } = await db.from('bookings').insert({
      id: booking.id, service_id: booking.serviceId, service_name: booking.serviceName,
      provider_id: booking.providerId, provider_name: booking.providerName,
      date: booking.date, time: booking.time, customer_name: booking.customerName,
      customer_email: booking.customerEmail, customer_phone: booking.customerPhone,
      notes: booking.notes, status: booking.status, created_at: booking.createdAt,
    });
    if (error) throw error;
  },

  async update(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const row = bookingToRow(updates);
    if (Object.keys(row).length === 0) return this.getById(id);
    const { data, error } = await db.from('bookings').update(row)
      .eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? toBooking(data as BookingRow) : null;
  },
};
