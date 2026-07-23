// TODO: Replace with a real database (Postgres via Vercel Marketplace or Supabase)
// Module-level store resets on server restart — dev/demo only
import type { Booking } from '@/data/schedulerTypes';

declare global {
  // eslint-disable-next-line no-var
  var __bookingStore: Booking[] | undefined;
}

if (!global.__bookingStore) {
  global.__bookingStore = [];
}

export const bookingStore = {
  getAll(): Booking[] {
    return global.__bookingStore!;
  },

  getById(id: string): Booking | undefined {
    return global.__bookingStore!.find((b) => b.id === id);
  },

  getFiltered(providerId?: string, date?: string): Booking[] {
    let list = global.__bookingStore!;
    if (providerId) list = list.filter((b) => b.providerId === providerId);
    if (date) list = list.filter((b) => b.date === date);
    return list;
  },

  add(booking: Booking): void {
    global.__bookingStore!.push(booking);
  },

  update(id: string, updates: Partial<Booking>): Booking | null {
    const idx = global.__bookingStore!.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    global.__bookingStore![idx] = { ...global.__bookingStore![idx], ...updates };
    return global.__bookingStore![idx];
  },
};
