'use client';

import type { Service, Provider, SchedulerStep } from '@/data/schedulerTypes';

type Props = {
  service: Service;
  provider: Provider | null;
  date: string;
  time: string;
  customerInfo: Record<string, string>;
  onEdit: (step: SchedulerStep) => void;
  onConfirm: () => void;
  onBack: () => void;
  submitting: boolean;
};

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

function Row({
  label, value, onEdit,
}: {
  label: string; value: string; onEdit: () => void;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
      </div>
      <button
        onClick={onEdit}
        className="text-xs text-green-600 hover:text-green-800 min-h-[44px] px-2"
      >
        Edit
      </button>
    </div>
  );
}

export function BookingReview({
  service, provider, date, time, customerInfo, onEdit, onConfirm, onBack, submitting,
}: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Your Booking</h2>

      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 mb-6">
        <Row label="Service" value={`${service.name} — $${service.price}`} onEdit={() => onEdit('service')} />
        {provider && (
          <Row label="Instructor" value={provider.name} onEdit={() => onEdit('provider')} />
        )}
        <Row label="Date" value={formatDate(date)} onEdit={() => onEdit('date')} />
        <Row label="Time" value={formatTime(time)} onEdit={() => onEdit('time')} />
        <Row label="Name" value={customerInfo.name || '—'} onEdit={() => onEdit('info')} />
        <Row label="Email" value={customerInfo.email || '—'} onEdit={() => onEdit('info')} />
        <Row label="Phone" value={customerInfo.phone || '—'} onEdit={() => onEdit('info')} />
        {customerInfo.notes && (
          <Row label="Notes" value={customerInfo.notes} onEdit={() => onEdit('info')} />
        )}
      </div>

      <p className="text-xs text-gray-400 mb-4 text-center">
        This submits a booking request. You&apos;ll be contacted to confirm.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-4 text-sm text-gray-500 hover:text-gray-700 min-h-[44px]"
        >
          ← Back
        </button>
        <button
          onClick={onConfirm}
          disabled={submitting}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg px-4 min-h-[44px] transition-colors"
        >
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>
    </div>
  );
}
