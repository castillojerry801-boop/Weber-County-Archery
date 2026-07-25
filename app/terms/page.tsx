import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Weber County Archery Park',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">

        <Link href="/" className="text-white/30 hover:text-white/60 text-sm transition-colors">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-black mt-8 mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-12">
          Weber County Archery Park · Last updated July 2026
        </p>

        <div className="flex flex-col gap-10 text-white/70 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Overview</h2>
            <p>
              These Terms of Service govern your use of the Weber County Archery Park
              membership system at webercountyarchery.com, operated by Weber County Parks
              &amp; Recreation. By creating an account or purchasing a pass, you agree to
              these terms. If you have questions, call us at{' '}
              <a href="tel:8013944035" className="text-green-400 hover:text-green-300">(801) 394-4035</a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Membership Accounts</h2>
            <ul className="list-disc list-inside space-y-2 text-white/60">
              <li>You must provide accurate information when creating an account.</li>
              <li>You are responsible for keeping your login credentials secure.</li>
              <li>Accounts are personal and may not be shared with others.</li>
              <li>You must be 18 or older to create an account. Youth members must have a parent or guardian create the account on their behalf.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms or park rules.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Pass Types &amp; Duration</h2>
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white font-semibold mb-1">Day Pass — $6</p>
                <p className="text-white/50">Single-day access to the facility. Valid for the calendar day of purchase only. No account required.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white font-semibold mb-1">Monthly Pass</p>
                <p className="text-white/50">Valid for 30 days from the date of purchase. Provides unlimited range access during that period.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white font-semibold mb-1">Annual Pass</p>
                <p className="text-white/50">Valid for 12 months from the date of purchase. Provides unlimited range access during that period.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white font-semibold mb-1">Household Annual Pass</p>
                <p className="text-white/50">Valid for 12 months. Covers all immediate household members listed on the account at time of purchase.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white font-semibold mb-1">Punch Passes (10, 20, or 30 visits)</p>
                <p className="text-white/50">Each check-in deducts one punch. Punch passes do not expire. One punch is used per visit, per person.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Check-In &amp; Access</h2>
            <ul className="list-disc list-inside space-y-2 text-white/60">
              <li>Members must check in each visit using their QR code at the front desk kiosk or the outdoor range self check-in.</li>
              <li>Your QR code is tied to your account. Do not share it with others.</li>
              <li>A valid, active pass is required for entry. Expired passes or accounts with no remaining punches will be denied access.</li>
              <li>Staff may ask for photo ID to verify your identity at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Pricing</h2>
            <p>
              Current pricing is listed on the{' '}
              <Link href="/" className="text-green-400 hover:text-green-300">home page</Link>.
              Prices are subject to change. Passes purchased before a price change will
              honor the price paid for their full duration.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Refund Policy</h2>
            <p className="mb-3">
              Passes are generally non-refundable once purchased. Exceptions may be made at
              the discretion of Weber County Parks &amp; Recreation staff in the following cases:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60">
              <li>Extended facility closure</li>
              <li>Documented medical circumstance preventing use</li>
              <li>Billing error</li>
            </ul>
            <p className="mt-4">
              To request a refund, contact us at{' '}
              <a href="mailto:parksandrecinfo@co.weber.ut.us" className="text-green-400 hover:text-green-300">
                parksandrecinfo@co.weber.ut.us
              </a>{' '}
              or call{' '}
              <a href="tel:8013944035" className="text-green-400 hover:text-green-300">(801) 394-4035</a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Park Rules &amp; Safety</h2>
            <ul className="list-disc list-inside space-y-2 text-white/60">
              <li>All facility rules and safety guidelines posted on-site must be followed at all times.</li>
              <li>Follow all instructions from Weber County Parks &amp; Recreation staff.</li>
              <li>Only approved equipment may be used on the range.</li>
              <li>Never approach the range while others are shooting.</li>
              <li>Violations of safety rules may result in immediate removal and account suspension without refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Assumption of Risk</h2>
            <p>
              Archery involves inherent risks. By using the facility, you acknowledge and
              accept these risks. Weber County Parks &amp; Recreation is not liable for
              injuries sustained while using the facility when all posted safety rules are
              being followed. Participants under 18 must have a parent or guardian
              acknowledge this on their behalf.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Changes to These Terms</h2>
            <p>
              We may update these terms at any time. The date at the top of this page
              reflects the most recent revision. Continued use of the membership system
              after changes are posted constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Contact</h2>
            <p>
              Weber County Parks &amp; Recreation<br />
              2840 F Avenue, Ogden, UT 84401<br />
              <a href="tel:8013944035" className="text-green-400 hover:text-green-300">(801) 394-4035</a>
              {' · '}
              <a href="mailto:parksandrecinfo@co.weber.ut.us" className="text-green-400 hover:text-green-300">
                parksandrecinfo@co.weber.ut.us
              </a>
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex gap-6 text-white/30 text-xs">
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
        </div>

      </div>
    </div>
  );
}
