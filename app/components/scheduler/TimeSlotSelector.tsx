'use client';

import { useMemo } from 'react';
import type { DayOfWeek, TimeRange } from '@/data/schedulerTypes';
import { EmptyState } from './EmptyState';

type Props = {
  date: string;
  businessHours: Record<DayOfWeek, TimeRange[]>;
  slotDurationMinutes: number;
  bufferMinutes: number;
  selected: string | null;
  onSelect: (time: string) => void;
  onBack: () => void;
};

const DOW_KEYS: DayOfWeek[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

function generateSlots(hours: TimeRange[], slotDuration: number, buffer: number): string[] {
  const slots: string[] = [];
  for (const range of hours) {
    const [sh, sm] = range.start.split(':').map(Number);
    const [eh, em] = range.end.split(':').map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    while (cur + slotDuration <= end) {
      slots.push(
        `${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`,
      );
      cur += slotDuration + buffer;
    }
  }
  return slots;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function TimeSlotSelector({
  date, businessHours, slotDurationMinutes, bufferMinutes, selected, onSelect, onBack,
}: Props) {
  const dateObj = new Date(date + 'T00:00:00');
  const dow = DOW_KEYS[dateObj.getDay()];
  const hours = businessHours[dow] ?? [];

  const slots = useMemo(
    () => generateSlots(hours, slotDurationMinutes, bufferMinutes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [date, slotDurationMinutes, bufferMinutes],
  );

  const dateLabel = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Select a Time</h2>
      <p className="text-sm text-gray-500 mb-4">{dateLabel}</p>

      {slots.length === 0 ? (
        <EmptyState message="No available times on this date." />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              className={`min-h-[44px] rounded-lg text-sm font-medium border-2 transition-colors ${
                selected === slot
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50'
              }`}
            >
              {formatTime(slot)}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 min-h-[44px]"
      >
        ← Back
      </button>
    </div>
  );
}
