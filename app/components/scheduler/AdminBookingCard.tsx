'use client';

import { useState } from 'react';
import type { Booking, BookingStatus } from '@/data/schedulerTypes';

type Props = {
  booking: Booking;
  onUpdate: (id: string, updates: Partial<Booking>) => Promise<void>;
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

export function AdminBookingCard({ booking, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTime, setEditTime] = useState(booking.time);
  const [editName, setEditName] = useState(booking.customerName);
  const [busy, setBusy] = useState(false);

  async function act(updates: Partial<Booking>) {
    setBusy(true);
    await onUpdate(booking.id, updates);
    setBusy(false);
  }

  async function saveEdit() {
    await act({ time: editTime, customerName: editName });
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
    setEditTime(booking.time);
    setEditName(booking.customerName);
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-gray-900">{booking.serviceName}</p>
          <p className="text-sm text-gray-500">{booking.providerName}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLES[booking.status]}`}>
          {booking.status}
        </span>
      </div>

      {/* Date / Time */}
      {editing ? (
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Date</p>
            <p className="text-sm font-medium text-gray-700">{formatDate(booking.date)}</p>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Time</label>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[36px]"
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 mb-1">
          {formatDate(booking.date)} at {formatTime(booking.time)}
        </p>
      )}

      {/* Customer info */}
      {editing ? (
        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">Customer Name</label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Customer name"
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[36px]"
          />
        </div>
      ) : (
        <div className="text-sm text-gray-600 space-y-0.5 mb-3">
          <p className="font-medium text-gray-800">{booking.customerName || '—'}</p>
          {booking.customerEmail && <p>{booking.customerEmail}</p>}
          {booking.customerPhone && <p>{booking.customerPhone}</p>}
          {booking.notes && <p className="text-gray-400 italic">&ldquo;{booking.notes}&rdquo;</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {editing ? (
          <>
            <button
              onClick={saveEdit}
              disabled={busy}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg px-3 py-2 min-h-[44px] transition-colors disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              onClick={cancelEdit}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 min-h-[44px]"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {booking.status === 'pending' && (
              <button
                onClick={() => act({ status: 'confirmed' })}
                disabled={busy}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg px-3 py-2 min-h-[44px] transition-colors disabled:opacity-50"
              >
                {busy ? '…' : 'Confirm'}
              </button>
            )}
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 min-h-[44px]"
            >
              Edit
            </button>
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => act({ status: 'cancelled' })}
                disabled={busy}
                className="px-3 py-2 text-sm text-red-500 hover:text-red-700 min-h-[44px] disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
