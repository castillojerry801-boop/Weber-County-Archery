import Link from 'next/link';
import { Logo } from '@/app/components/Logo';
import { CheckInFeed } from '@/app/components/CheckInFeed';

export default function StaffPage() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 text-center">
        <p className="text-white/30 text-xs uppercase tracking-widest">Staff Portal</p>
        <p className="text-white/20 text-xs mt-1">Weber County Archery Park</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
        {/* Trainer card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
          <Logo size={128} showText={false} href="" />
          <div>
            <h2 className="text-white font-bold text-xl">Trainer</h2>
            <p className="text-white/40 text-sm mt-1">View and manage your schedule</p>
          </div>
          <Link
            href="/trainer"
            className="w-full block bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl py-3 text-center transition-colors"
          >
            Trainer Login
          </Link>
        </div>

        {/* Kiosk card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
          <Logo size={128} showText={false} href="" />
          <div>
            <h2 className="text-white font-bold text-xl">Kiosk</h2>
            <p className="text-white/40 text-sm mt-1">Front desk check-in scanner</p>
          </div>
          <Link
            href="/kiosk"
            className="w-full block bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl py-3 text-center transition-colors"
          >
            Open Kiosk
          </Link>
        </div>

        {/* Point of Sale card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
          <Logo size={128} showText={false} href="" />
          <div>
            <h2 className="text-white font-bold text-xl">Point of Sale</h2>
            <p className="text-white/40 text-sm mt-1">Cash &amp; Square walk-in sales</p>
          </div>
          <Link
            href="/square"
            className="w-full block bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl py-3 text-center transition-colors"
          >
            Open Register
          </Link>
        </div>
      </div>

      <CheckInFeed />

      <Link
        href="/admin"
        className="text-white/20 hover:text-white/40 text-xs mt-10 transition-colors"
      >
        Admin Panel
      </Link>

      <Link href="/" className="text-white/20 hover:text-white/40 text-xs mt-2 transition-colors">
        ← Back to home
      </Link>
    </main>
  );
}
