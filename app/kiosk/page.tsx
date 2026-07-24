'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type ScanResult = 'green' | 'yellow' | 'red';

type ScanResponse = {
  result: ScanResult;
  title: string;
  message: string;
  name: string | null;
  passType: 'membership' | 'punch' | null;
  punchesRemaining?: number;
};

const IDLE_TIMEOUT_MS = 4000;
// Set NEXT_PUBLIC_KIOSK_PIN in env to change (default 9472)
const KIOSK_PIN = process.env.NEXT_PUBLIC_KIOSK_PIN ?? '9472';

const RESULT_STYLES: Record<ScanResult, {
  bg: string; ring: string; title: string; icon: string; textColor: string;
}> = {
  green:  { bg: 'bg-green-500',  ring: 'ring-green-300',  title: 'text-green-100', icon: '✓', textColor: 'text-green-50'  },
  yellow: { bg: 'bg-yellow-400', ring: 'ring-yellow-200', title: 'text-yellow-900', icon: '!', textColor: 'text-yellow-800' },
  red:    { bg: 'bg-red-500',    ring: 'ring-red-300',    title: 'text-red-100',   icon: '✕', textColor: 'text-red-50'    },
};

function KioskPinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  function handleKey(digit: string) {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === KIOSK_PIN.length) {
      if (next === KIOSK_PIN) {
        sessionStorage.setItem('kiosk_unlocked', '1');
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 800);
      }
    }
  }

  function handleClear() { setPin(''); setError(false); }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 select-none">
      <div className="text-center">
        <p className="text-white/20 text-xs uppercase tracking-widest mb-2">Staff Kiosk</p>
        <p className="text-white/60 text-lg font-semibold">Enter PIN to unlock</p>
      </div>

      {/* PIN dots */}
      <div className="flex gap-3">
        {Array.from({ length: KIOSK_PIN.length }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-colors ${
              i < pin.length
                ? error ? 'bg-red-500 border-red-500' : 'bg-white border-white'
                : 'bg-transparent border-white/20'
            }`}
          />
        ))}
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3">
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key) => (
          <button
            key={key}
            onClick={() => key === '⌫' ? handleClear() : key ? handleKey(key) : null}
            className={`w-20 h-20 rounded-2xl text-2xl font-bold transition-colors ${
              key === ''
                ? 'pointer-events-none'
                : 'bg-white/5 hover:bg-white/15 active:bg-white/20 text-white border border-white/10'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <a
        href="/trainer"
        className="text-white/20 hover:text-white/40 text-xs mt-2 transition-colors"
      >
        ← Back to Staff Portal
      </a>
    </div>
  );
}

export default function KioskPage() {
  const [unlocked, setUnlocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [scanning, setScanning] = useState(false);
  const [idle, setIdle] = useState(true);

  // Check sessionStorage for existing unlock on mount
  useEffect(() => {
    if (sessionStorage.getItem('kiosk_unlocked') === '1') setUnlocked(true);
  }, []);

  const resetToIdle = useCallback(() => {
    setScan(null);
    setScanning(false);
    setIdle(true);
    bufferRef.current = '';
    inputRef.current?.focus();
  }, []);

  const processCode = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setScanning(true);
    setIdle(false);

    try {
      const res = await fetch(`/api/scan/${encodeURIComponent(trimmed)}`, { method: 'POST' });
      const data: ScanResponse = await res.json();
      setScan(data);
      setScanning(false);

      // Auto-reset after 4 seconds
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(resetToIdle, IDLE_TIMEOUT_MS);
    } catch {
      setScan({ result: 'red', title: 'Error', message: 'Could not connect. Try again.', name: null, passType: null });
      setScanning(false);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(resetToIdle, IDLE_TIMEOUT_MS);
    }
  }, [resetToIdle]);

  // Keep input focused at all times
  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    focus();
    document.addEventListener('click', focus);
    return () => document.removeEventListener('click', focus);
  }, []);

  // Handle USB scanner keyboard input
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const code = bufferRef.current;
      bufferRef.current = '';
      if (timerRef.current) clearTimeout(timerRef.current);
      processCode(code);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    bufferRef.current = e.target.value;
    // Clear buffer after 500ms of no input (catches stray characters)
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { bufferRef.current = ''; }, 500);
  }

  const s = scan ? RESULT_STYLES[scan.result] : null;

  if (!unlocked) return <KioskPinGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] select-none overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Hidden scanner input — always focused */}
      <input
        ref={inputRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        aria-hidden="true"
        autoFocus
        autoComplete="off"
      />

      {/* Idle state */}
      {idle && !scanning && (
        <div className="text-center px-8 animate-pulse">
          <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center mx-auto mb-8">
            <span className="text-5xl">📷</span>
          </div>
          <p className="text-white/30 text-2xl font-bold uppercase tracking-widest">Ready to Scan</p>
          <p className="text-white/15 text-sm mt-3">Hold QR code up to the scanner</p>
        </div>
      )}

      {/* Scanning */}
      {scanning && (
        <div className="text-center">
          <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white/50 text-xl font-bold">Checking…</p>
        </div>
      )}

      {/* Result */}
      {scan && s && (
        <div className="text-center px-8 w-full max-w-sm">
          {/* Big colored circle */}
          <div
            className={`w-40 h-40 rounded-full ${s.bg} ring-8 ${s.ring} ring-offset-4 ring-offset-[#0a0a0a] flex items-center justify-center mx-auto mb-8 shadow-2xl`}
          >
            <span className={`text-6xl font-black ${s.title}`}>{s.icon}</span>
          </div>

          {/* Member name */}
          {scan.name && (
            <p className="text-white text-3xl font-black mb-2">{scan.name}</p>
          )}

          {/* Title */}
          <p className={`text-xl font-bold mb-2 ${
            scan.result === 'green' ? 'text-green-400'
            : scan.result === 'yellow' ? 'text-yellow-400'
            : 'text-red-400'
          }`}>
            {scan.title}
          </p>

          {/* Message */}
          <p className="text-white/50 text-base">{scan.message}</p>

          {/* Punch dots if punch pass */}
          {scan.passType === 'punch' && scan.punchesRemaining !== undefined && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.min(scan.punchesRemaining, 10) }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-green-500" />
              ))}
              {scan.punchesRemaining > 10 && (
                <span className="text-white/40 text-sm">+{scan.punchesRemaining - 10}</span>
              )}
            </div>
          )}

          {/* Auto-reset indicator */}
          <p className="text-white/15 text-xs mt-10 uppercase tracking-widest">
            Resetting in {Math.ceil(IDLE_TIMEOUT_MS / 1000)}s
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6">
        <p className="text-white/10 text-xs uppercase tracking-widest">Weber County Archery Park · Kiosk</p>
        <a href="/trainer" className="text-white/10 hover:text-white/30 text-xs transition-colors">
          ← Staff Portal
        </a>
      </div>
    </div>
  );
}
