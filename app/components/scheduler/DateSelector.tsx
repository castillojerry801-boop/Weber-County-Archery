'use client';

import { useState } from 'react';
import type { DayOfWeek, TimeRange } from '@/data/schedulerTypes';

type Props = {
  businessHours: Record<DayOfWeek, TimeRange[]>;
  blockedDates: string[];
  selected: string | null;
  onSelect: (date: string) => void;
  onBack: () => void;
};

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW_KEYS: DayOfWeek[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

function toDateStr(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function isAvailable(
  date: Date,
  businessHours: Record<DayOfWeek, TimeRange[]>,
  blockedDates: string[],
): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  const dow = DOW_KEYS[date.getDay()];
  if (!businessHours[dow]?.length) return false;
  if (blockedDates.includes(toDateStr(date))) return false;
  return true;
}

export function DateSelector({ businessHours, blockedDates, selected, onSelect, onBack }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = firstDay.getDay();

  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Select a Date</h2>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
        >
          ←
        </button>
        <span className="font-semibold text-gray-800">{MONTHS[month]} {year}</span>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const dateStr = toDateStr(date);
          const available = isAvailable(date, businessHours, blockedDates);
          const isSelected = selected === dateStr;

          return (
            <button
              key={dateStr}
              disabled={!available}
              onClick={() => onSelect(dateStr)}
              className={`min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-green-600 text-white'
                  : !available
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-800 hover:bg-green-50 hover:text-green-700'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-gray-400">Grayed out = closed or unavailable</p>

      <button
        onClick={onBack}
        className="mt-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 min-h-[44px]"
      >
        ← Back
      </button>
    </div>
  );
}
