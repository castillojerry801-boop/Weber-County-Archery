'use client';

import { useState, useEffect, useCallback } from 'react';
import { Logo } from '@/app/components/Logo';
import { schedulerConfig } from '@/data/schedulerConfig';
import type { Booking, Provider } from '@/data/schedulerTypes';
import { AdminBookingCard } from '@/app/components/scheduler/AdminBookingCard';
import { EmptyState } from '@/app/components/scheduler/EmptyState';
import { LoadingState } from '@/app/components/scheduler/LoadingState';

const PROVIDER_PINS: Record<string, string> = {
  '1111': 'instructor-1',
  '2222': 'instructor-2',
  '3333': 'instructor-3',
};

type View = 'hub' | 'login' | 'dashboard';

type AddForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  date: string;
  time: string;
  notes: string;
};

function toDateStr(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function TrainerPage() {
  const [view, setView] = useState<View>('hub');
  const [pin, setPin] = useState('');
  const [trainer, setTrainer] = useState<Provider | null>(null);
  const [pinError, setPinError] = useState('');
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>({
    customerName: '', customerEmail: '', customerPhone: '',
    serviceId: schedulerConfig.services[0].id,
    date: selectedDate, time: '11:00', notes: '',
  });

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const providerId = PROVIDER_PINS[pin];
    if (providerId) {
      const provider = schedulerConfig.providers.find((p) => p.id === providerId) ?? null;
      setTrainer(provider);
      setPinError('');
      setView('dashboard');
    } else {
      setPinError('Incorrect PIN. Try again.');
    }
  }

  function handleSignOut() {
    setTrainer(null);
    setPin('');
    setPinError('');
    setView('hub');
  }

  const fetchBookings = useCallback(async () => {
    if (!trainer) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?providerId=${trainer.id}&date=${selectedDate}`);
      setBookings(await res.json());
    } finally {
      setLoading(false);
    }
  }, [trainer, selectedDate]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  async function handleUpdate(id: string, updates: Partial<Booking>) {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    await fetchBookings();
  }

  async function handleAddTraining(e: React.FormEvent) {
    e.preventDefault();
    if (!trainer) return;
    const service = schedulerConfig.services.find((s) => s.id === addForm.serviceId);
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: addForm.serviceId,
        serviceName: service?.name ?? addForm.serviceId,
        providerId: trainer.id,
        providerName: trainer.name,
        date: addForm.date,
        time: addForm.time,
        customerName: addForm.customerName,
        customerEmail: addForm.customerEmail,
        customerPhone: addForm.customerPhone,
        notes: addForm.notes,
      }),
    });
    setShowAddForm(false);
    setAddForm((f) => ({ ...f, customerName: '', customerEmail: '', customerPhone: '', notes: '' }));
    if (addForm.date === selectedDate) await fetchBookings();
  }

  function shiftDate(days: number) {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(toDateStr(d));
  }

  // ── Hub ──
  if (view === 'hub') {
    return (
      <main className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4 py-12">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-10">Staff Portal</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
          {/* Trainer card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center gap-6 hover:bg-white/8 transition-colors">
            <Logo size={72} showText={false} href="" />
            <div>
              <h2 className="text-white font-bold text-xl">Trainer</h2>
              <p className="text-white/40 text-sm mt-1">Schedule &amp; sessions</p>
            </div>
            <button
              onClick={() => setView('login')}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl py-3 min-h-[48px] transition-colors"
            >
              Trainer Login
            </button>
          </div>

          {/* Kiosk card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center gap-6 hover:bg-white/8 transition-colors">
            <Logo size={72} showText={false} href="" />
            <div>
              <h2 className="text-white font-bold text-xl">Kiosk</h2>
              <p className="text-white/40 text-sm mt-1">Member check-in scanner</p>
            </div>
            <a
              href="/kiosk"
              className="w-full block bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl py-3 min-h-[48px] leading-[48px] transition-colors"
            >
              Open Kiosk
            </a>
          </div>
        </div>

        <a href="/" className="text-white/20 hover:text-white/40 text-xs mt-10 transition-colors">
          ← Back to home
        </a>
      </main>
    );
  }

  // ── Trainer PIN login ──
  if (view === 'login') {
    return (
      <main className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <Logo size={64} showText={false} href="" />
            <h1 className="text-white font-bold text-xl mt-4">Trainer Login</h1>
            <p className="text-white/40 text-sm mt-1">Weber County Archery Park</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Trainer PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[48px]"
              />
              {pinError && <p className="text-xs text-red-400 mt-1">{pinError}</p>}
              <p className="text-xs text-white/20 mt-2">Demo PINs: 1111 · 2222 · 3333</p>
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl py-3 min-h-[48px] transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
        <button
          onClick={() => { setView('hub'); setPinError(''); setPin(''); }}
          className="text-white/30 hover:text-white/60 text-sm mt-6 transition-colors"
        >
          ← Back
        </button>
      </main>
    );
  }

  // ── Dashboard ──
  const activeSessions = bookings.filter((b) => b.status !== 'cancelled');

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('hub')}
            className="text-sm text-gray-400 hover:text-gray-600 min-h-[44px] px-2 transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="font-bold text-gray-900">My Schedule</h1>
            <p className="text-xs text-gray-500">{trainer?.name} · {trainer?.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/kiosk"
            className="text-sm text-green-600 hover:text-green-700 font-medium border border-green-200 hover:border-green-400 rounded-lg px-3 min-h-[44px] flex items-center transition-colors"
          >
            Kiosk
          </a>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-600 min-h-[44px] px-2 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Date navigation */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3 mb-6">
          <button
            onClick={() => shiftDate(-1)}
            aria-label="Previous day"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
          >
            ←
          </button>
          <div className="text-center">
            <p className="font-semibold text-gray-800 text-sm">{formatDisplayDate(selectedDate)}</p>
            <button
              onClick={() => setSelectedDate(toDateStr(new Date()))}
              className="text-xs text-green-600 hover:text-green-800 mt-0.5"
            >
              Today
            </button>
          </div>
          <button
            onClick={() => shiftDate(1)}
            aria-label="Next day"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
          >
            →
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">
            Sessions
            {activeSessions.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {activeSessions.length}
              </span>
            )}
          </h2>
          <button
            onClick={() => {
              setAddForm((f) => ({ ...f, date: selectedDate }));
              setShowAddForm(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg px-4 py-2 min-h-[44px] transition-colors"
          >
            + Add Training
          </button>
        </div>

        {/* Add Training form */}
        {showAddForm && (
          <form
            onSubmit={handleAddTraining}
            className="bg-white rounded-xl border border-gray-200 p-4 mb-4"
          >
            <h3 className="font-semibold text-gray-800 mb-3">Add Training Session</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Service</label>
                <select
                  value={addForm.serviceId}
                  onChange={(e) => setAddForm((f) => ({ ...f, serviceId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
                >
                  {schedulerConfig.services
                    .filter((s) => trainer?.availableServices.includes(s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Date</label>
                  <input
                    type="date"
                    value={addForm.date}
                    onChange={(e) => setAddForm((f) => ({ ...f, date: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Time</label>
                  <input
                    type="time"
                    value={addForm.time}
                    onChange={(e) => setAddForm((f) => ({ ...f, time: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={addForm.customerName}
                  onChange={(e) => setAddForm((f) => ({ ...f, customerName: e.target.value }))}
                  placeholder="Full name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Email</label>
                  <input
                    type="email"
                    value={addForm.customerEmail}
                    onChange={(e) => setAddForm((f) => ({ ...f, customerEmail: e.target.value }))}
                    placeholder="Email"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={addForm.customerPhone}
                    onChange={(e) => setAddForm((f) => ({ ...f, customerPhone: e.target.value }))}
                    placeholder="Phone"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Notes</label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Optional notes"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 text-sm text-gray-500 hover:text-gray-700 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 min-h-[44px] transition-colors"
              >
                Add Training
              </button>
            </div>
          </form>
        )}

        {/* Sessions list */}
        {loading ? (
          <LoadingState />
        ) : bookings.length === 0 ? (
          <EmptyState message="No sessions scheduled for this day." />
        ) : (
          <div className="flex flex-col gap-3">
            {[...bookings]
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((booking) => (
                <AdminBookingCard
                  key={booking.id}
                  booking={booking}
                  onUpdate={handleUpdate}
                />
              ))}
          </div>
        )}
      </div>
    </main>
  );
}
