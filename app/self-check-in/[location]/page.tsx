'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Stage = 'requesting' | 'checking' | 'done' | 'error';
type ScanResult = 'green' | 'yellow' | 'red';

type Result = {
  result: ScanResult;
  title: string;
  message: string;
  name: string | null;
  passType: 'membership' | 'punch' | null;
  punchesRemaining?: number;
};

const RESULT_BG: Record<ScanResult, string> = {
  green:  'bg-green-500',
  yellow: 'bg-yellow-400',
  red:    'bg-red-500',
};
const RESULT_RING: Record<ScanResult, string> = {
  green:  'ring-green-300',
  yellow: 'ring-yellow-200',
  red:    'ring-red-300',
};
const RESULT_ICON: Record<ScanResult, string> = {
  green: '✓',
  yellow: '!',
  red: '✕',
};
const RESULT_COLOR: Record<ScanResult, string> = {
  green:  'text-green-400',
  yellow: 'text-yellow-400',
  red:    'text-red-400',
};

export default function SelfCheckInPage() {
  const { location } = useParams<{ location: string }>();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>('requesting');
  const [result, setResult] = useState<Result | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!navigator.geolocation) {
      setErrorMsg('Your browser does not support location services. Please use a different browser.');
      setStage('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStage('checking');
        try {
          const res = await fetch('/api/self-check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              location,
            }),
          });

          if (res.status === 401) {
            router.replace(`/login?next=${encodeURIComponent(`/self-check-in/${location}`)}`);
            return;
          }

          const data = await res.json();

          if (res.status === 403 && data.error === 'too_far') {
            setErrorMsg("You don't appear to be at the park. You must be on-site to check in.");
            setStage('error');
            return;
          }

          if (!res.ok) {
            setErrorMsg('Something went wrong. Please try again.');
            setStage('error');
            return;
          }

          setResult(data as Result);
          setStage('done');
        } catch {
          setErrorMsg('Network error. Please check your connection and try again.');
          setStage('error');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg('Location access was denied. Please allow location access in your browser settings and try again.');
        } else {
          setErrorMsg('Could not determine your location. Please try again.');
        }
        setStage('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [location, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 select-none">

      {/* Requesting location */}
      {stage === 'requesting' && (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-green-500 animate-spin mx-auto mb-6" />
          <p className="text-white font-bold text-xl mb-2">Checking your location…</p>
          <p className="text-white/40 text-sm">Allow location access when prompted</p>
        </div>
      )}

      {/* Checking pass */}
      {stage === 'checking' && (
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-green-500 animate-spin mx-auto mb-6" />
          <p className="text-white font-bold text-xl mb-2">Validating pass…</p>
          <p className="text-white/40 text-sm">Just a moment</p>
        </div>
      )}

      {/* Error */}
      {stage === 'error' && (
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-full bg-red-500 ring-8 ring-red-300 ring-offset-4 ring-offset-[#0a0a0a] flex items-center justify-center mx-auto mb-8">
            <span className="text-white font-black text-4xl">✕</span>
          </div>
          <p className="text-red-400 font-bold text-xl mb-3">Check-In Failed</p>
          <p className="text-white/50 text-sm leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => { ran.current = false; setStage('requesting'); setErrorMsg(''); }}
            className="mt-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Result */}
      {stage === 'done' && result && (
        <div className="text-center max-w-sm w-full">
          <div className={`w-36 h-36 rounded-full ${RESULT_BG[result.result]} ring-8 ${RESULT_RING[result.result]} ring-offset-4 ring-offset-[#0a0a0a] flex items-center justify-center mx-auto mb-8 shadow-2xl`}>
            <span className="text-white font-black text-5xl">{RESULT_ICON[result.result]}</span>
          </div>

          {result.name && (
            <p className="text-white text-3xl font-black mb-2">{result.name}</p>
          )}

          <p className={`text-xl font-bold mb-2 ${RESULT_COLOR[result.result]}`}>
            {result.title}
          </p>

          <p className="text-white/50 text-base">{result.message}</p>

          {result.passType === 'punch' && result.punchesRemaining !== undefined && (
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {Array.from({ length: Math.min(result.punchesRemaining, 10) }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-green-500" />
              ))}
              {result.punchesRemaining > 10 && (
                <span className="text-white/40 text-sm">+{result.punchesRemaining - 10}</span>
              )}
            </div>
          )}

          <p className="text-white/15 text-xs mt-10 uppercase tracking-widest">
            Weber County Archery Park · Outdoor Range
          </p>
        </div>
      )}
    </div>
  );
}
