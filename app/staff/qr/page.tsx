'use client';

import QRCode from 'react-qr-code';
import Link from 'next/link';

const BASE_URL = 'https://webercountyarchery.com';

const LOCATIONS = [
  {
    slug: 'outdoor-range',
    label: 'Outdoor Range',
    description: 'Walkable outdoor range — pedestal at entrance',
  },
];

export default function QRCodesPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 print:hidden">
        <div>
          <h1 className="font-bold text-white">Pedestal QR Codes</h1>
          <p className="text-white/40 text-xs mt-0.5">Print and laminate for each range entrance</p>
        </div>
        <Link href="/staff" className="text-white/40 hover:text-white text-sm transition-colors">
          ← Staff Portal
        </Link>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-8">
        {LOCATIONS.map((loc) => {
          const url = `${BASE_URL}/self-check-in/${loc.slug}`;
          return (
            <div key={loc.slug} className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6 print:shadow-none print:rounded-none">
              {/* Print header */}
              <div className="text-center text-black">
                <p className="font-black text-2xl tracking-tight">Weber County Archery Park</p>
                <p className="text-gray-500 text-sm mt-1">{loc.label}</p>
              </div>

              <QRCode
                value={url}
                size={220}
                bgColor="#ffffff"
                fgColor="#0d0d0d"
              />

              <div className="text-center text-black">
                <p className="font-bold text-lg mb-1">Self Check-In</p>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                  Scan with your phone camera, then allow location access. Your pass will be logged automatically.
                </p>
              </div>

              <div className="w-full border-t border-gray-200 pt-4 text-center">
                <p className="text-gray-400 text-xs font-mono break-all">{url}</p>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => window.print()}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl py-3 transition-colors print:hidden"
        >
          Print QR Code
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 print:hidden">
          <p className="text-white/60 text-sm font-semibold mb-2">How it works</p>
          <ul className="text-white/40 text-xs space-y-1.5 leading-relaxed">
            <li>1. Print this page and laminate it for the pedestal</li>
            <li>2. Member opens their phone camera and scans the QR code</li>
            <li>3. Their browser opens the check-in page and requests location</li>
            <li>4. If they&apos;re within ½ mile of the park and have a valid pass, they&apos;re logged in</li>
            <li>5. Check-ins appear in the Staff Portal dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
