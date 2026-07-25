import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Weber County Archery Park',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">

        <Link href="/" className="text-white/30 hover:text-white/60 text-sm transition-colors">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-black mt-8 mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-12">
          Weber County Archery Park · Last updated July 2026
        </p>

        <div className="flex flex-col gap-10 text-white/70 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Who We Are</h2>
            <p>
              Weber County Archery Park is operated by Weber County Parks &amp; Recreation,
              located at 2840 F Avenue, Ogden, UT 84401. You can reach us at{' '}
              <a href="tel:8013944035" className="text-green-400 hover:text-green-300">(801) 394-4035</a>{' '}
              or{' '}
              <a href="mailto:parksandrecinfo@co.weber.ut.us" className="text-green-400 hover:text-green-300">
                parksandrecinfo@co.weber.ut.us
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">What We Collect</h2>
            <p className="mb-3">When you create a member account, we collect:</p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Password (stored as a one-way hash — we never see your actual password)</li>
            </ul>
            <p className="mt-4">
              When you use the facility, we also record check-in logs tied to your account.
              These include the date and time of each visit and which pass type was used.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">How We Use It</h2>
            <p className="mb-3">We use your information solely to operate the membership program:</p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60">
              <li>Verify your identity and pass status when you check in</li>
              <li>Track pass usage (punch pass remaining visits, membership expiration)</li>
              <li>Allow staff to look up your account at the front desk</li>
              <li>Contact you about your membership if needed</li>
            </ul>
            <p className="mt-4">
              We do not use your information for marketing, and we do not sell or share it
              with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">How We Store It</h2>
            <p>
              Your account data is stored in a secure cloud database (Supabase) hosted on
              servers in the United States. Passwords are hashed using bcrypt before storage
              and cannot be recovered.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Cookies &amp; Sessions</h2>
            <p>
              When you sign in, we place a single session cookie on your device. This cookie
              keeps you logged in for up to 30 days. It contains only an identifier — no
              personal data is stored in the cookie itself. You can clear it at any time by
              signing out or clearing your browser cookies.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Location Data</h2>
            <p>
              If you use the outdoor range self check-in feature, your device's GPS
              coordinates are sent to our server to verify you are on-site. We use this only
              to confirm your location at the time of check-in and do not store or track your
              precise GPS coordinates beyond that verification.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Security Services</h2>
            <p>
              Our registration and login forms are protected by Cloudflare Turnstile, a
              bot-detection service. Turnstile may collect minimal technical data (such as
              browser information) to distinguish humans from automated bots. See{' '}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300"
              >
                Cloudflare's Privacy Policy
              </a>{' '}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Your Rights</h2>
            <p className="mb-3">You may request to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60">
              <li>View the personal information we hold on your account</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
            </ul>
            <p className="mt-4">
              To make any of these requests, contact us at the email or phone number above.
              As a Weber County government entity, we are also subject to the Utah Government
              Records Access and Management Act (GRAMA).
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. The date at the top of this page
              reflects the most recent revision. Continued use of the membership system after
              changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Contact</h2>
            <p>
              Questions about this policy? Contact Weber County Parks &amp; Recreation:<br />
              <a href="tel:8013944035" className="text-green-400 hover:text-green-300">(801) 394-4035</a>
              {' · '}
              <a href="mailto:parksandrecinfo@co.weber.ut.us" className="text-green-400 hover:text-green-300">
                parksandrecinfo@co.weber.ut.us
              </a>
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex gap-6 text-white/30 text-xs">
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
        </div>

      </div>
    </div>
  );
}
