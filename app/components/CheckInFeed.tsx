'use client';

import { useEffect, useState, useCallback } from 'react';

type CheckIn = {
  id: string;
  memberName: string;
  passType: 'membership' | 'punch';
  result: 'green' | 'yellow' | 'red';
  note: string;
  checkedInAt: string;
};

type FeedData = { todayCount: number; recent: CheckIn[] };

const RESULT_COLORS: Record<string, string> = {
  green:  'bg-green-500',
  yellow: 'bg-yellow-400',
  red:    'bg-red-500',
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function CheckInFeed() {
  const [data, setData] = useState<FeedData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/checkins');
      if (res.ok) {
        setData(await res.json());
        setLastUpdated(new Date());
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetch_();
    const interval = setInterval(fetch_, 30_000);
    return () => clearInterval(interval);
  }, [fetch_]);

  if (!data) {
    return (
      <div className="w-full max-w-3xl mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 text-white/30 text-sm text-center">
        Loading check-ins…
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mt-8">
      {/* Today's count */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Today's Check-ins</p>
          <p className="text-5xl font-black text-white mt-1">{data.todayCount}</p>
        </div>
        <div className="text-right">
          <p className="text-white/20 text-xs">Auto-refreshes every 30s</p>
          {lastUpdated && (
            <p className="text-white/20 text-xs mt-0.5">
              Updated {timeAgo(lastUpdated.toISOString())}
            </p>
          )}
          <button
            onClick={fetch_}
            className="mt-2 text-green-400 hover:text-green-300 text-xs font-semibold transition-colors"
          >
            Refresh ↺
          </button>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Recent Activity</p>
        </div>
        {data.recent.length === 0 ? (
          <p className="text-white/20 text-sm text-center py-8">No check-ins yet today</p>
        ) : (
          <div className="divide-y divide-white/5">
            {data.recent.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${RESULT_COLORS[c.result] ?? 'bg-white/20'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{c.memberName}</p>
                  <p className="text-white/40 text-xs truncate">{c.note}</p>
                </div>
                <p className="text-white/30 text-xs shrink-0">{timeAgo(c.checkedInAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
