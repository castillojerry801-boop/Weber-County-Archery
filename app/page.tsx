import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/app/components/Logo';

export const metadata: Metadata = {
  title: 'Weber County Archery Park',
  description: 'Indoor & outdoor archery ranges in Ogden, Utah. Training sessions available by appointment.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">

      {/* ── Nav ── */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5">
        <Logo size={52} />
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Member Login
          </Link>
          <Link
            href="/staff"
            className="text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/50 rounded-lg px-4 py-2 transition-all"
          >
            Staff Login
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero.jpg')" }}
        />
        {/* Dark overlay — left heavy so text pops */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
        {/* Bottom fade into body */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0d0d] to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-16 text-left">
          <span className="inline-block bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Ogden, Utah · Est. 2020
          </span>

          <h1 className="text-5xl sm:text-7xl font-black leading-none tracking-tight mb-6">
            Weber County<br />
            <span className="text-green-400">Archery Park</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-lg mb-4">
            11 acres. Indoor &amp; outdoor ranges. 60+ bag targets. Classes, leagues,
            and private lessons for all skill levels.
          </p>

          <div className="inline-flex items-center gap-2 text-white/50 text-sm mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Training sessions are by appointment only
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:8013944035"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-8 py-4 text-base transition-colors min-h-[56px]"
            >
              📞 (801) 394-4035
            </a>
            <a
              href="mailto:parksandrecinfo@co.weber.ut.us"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl px-8 py-4 text-base transition-colors min-h-[56px]"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-[#111] border-y border-white/10 px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '11', unit: 'Acres', label: 'Facility' },
            { value: '60+', unit: 'Targets', label: 'Outdoor Range' },
            { value: '16–18', unit: 'Lanes', label: 'Indoor Range' },
            { value: '100+', unit: 'Yards', label: 'Max Distance' },
          ].map(({ value, unit, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-white">{value}</p>
              <p className="text-green-400 text-xs font-bold uppercase tracking-widest">{unit}</p>
              <p className="text-white/40 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section className="px-6 py-16 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">Training</p>
          <h2 className="text-3xl font-black text-center mb-10">Sessions by Appointment</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ServiceCard
              title="Private Lesson"
              price="$60"
              duration="1 hr"
              desc="One-on-one coaching tailored to your skill level. Beginner to advanced welcome."
            />
            <ServiceCard
              title="Group Lesson"
              price="$30/person"
              duration="1 hr"
              desc="Small group sessions for 2–6 people. Perfect for families or friends."
              featured
            />
            <ServiceCard
              title="Beginner Intro"
              price="$45"
              duration="90 min"
              desc="Never shot a bow? Covers safety, form, and basic technique from the ground up."
            />
          </div>

          <p className="text-center text-white/40 text-sm mt-8">
            Call <a href="tel:8013944035" className="text-green-400 hover:text-green-300 font-semibold">(801) 394-4035</a> to schedule with an instructor.
          </p>
        </div>
      </section>

      {/* ── Day Pass Pricing ── */}
      <section className="px-6 py-16 bg-[#111]">
        <div className="max-w-4xl mx-auto">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">Range Access</p>
          <h2 className="text-3xl font-black text-center mb-10">Passes &amp; Memberships</h2>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-left px-5 py-4 font-bold text-white/60 uppercase text-xs tracking-wide">Pass Type</th>
                  <th className="px-5 py-4 font-bold text-white/60 uppercase text-xs tracking-wide">Adult</th>
                  <th className="px-5 py-4 font-bold text-white/60 uppercase text-xs tracking-wide">Senior / Military</th>
                  <th className="px-5 py-4 font-bold text-white/60 uppercase text-xs tracking-wide">Youth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { type: 'Day Pass', adult: '$9', senior: '$5', youth: '$5' },
                  { type: 'Monthly', adult: '$70', senior: '$40', youth: '$20' },
                  { type: 'Annual', adult: '$175', senior: '$130', youth: '$75' },
                  { type: 'Household Annual', adult: '$275', senior: '$230', youth: '—' },
                ].map((row) => (
                  <tr key={row.type} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 font-semibold text-white">{row.type}</td>
                    <td className="px-5 py-4 text-center text-green-400 font-bold">{row.adult}</td>
                    <td className="px-5 py-4 text-center text-white/70">{row.senior}</td>
                    <td className="px-5 py-4 text-center text-white/70">{row.youth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-white/30 text-xs mt-4">
            Equipment rental available · $5 includes bow, arrows &amp; armguard
          </p>
        </div>
      </section>

      {/* ── Hours & Location ── */}
      <section className="px-6 py-16 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <InfoCard icon="🕐" title="Indoor Hours">
            <p className="text-white/60 text-sm leading-relaxed">
              Tue – Fri: <span className="text-white">11am – 8pm</span><br />
              Sat – Sun: <span className="text-white">9am – 3pm</span><br />
              Mon: <span className="text-white/40">Closed</span>
            </p>
          </InfoCard>
          <InfoCard icon="☀️" title="Outdoor Range">
            <p className="text-white/60 text-sm leading-relaxed">
              Open <span className="text-white">dawn to dusk</span><br />
              7 days a week<br />
              <span className="text-white/40">Honor box payment available</span>
            </p>
          </InfoCard>
          <InfoCard icon="📍" title="Location">
            <p className="text-white/60 text-sm leading-relaxed">
              <span className="text-white">2840 F Avenue</span><br />
              Ogden, UT 84401<br />
              <a href="tel:8013944035" className="text-green-400 hover:text-green-300">(801) 394-4035</a>
            </p>
          </InfoCard>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-transparent to-[#0d0d0d]" />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-3">Ready to Hit the Range?</h2>
          <p className="text-white/50 mb-8">
            Training sessions are by appointment. Give us a call and we&apos;ll get you set up with one of our instructors.
          </p>
          <a
            href="tel:8013944035"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl px-10 py-4 text-lg transition-colors"
          >
            📞 Call (801) 394-4035
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-xs">
          <p>© {new Date().getFullYear()} Weber County Parks &amp; Recreation · Ogden, UT</p>
          <div className="flex gap-4">
            <a href="https://www.wcparksrec.com/wcarchery" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
              Official Site
            </a>
            <Link href="/trainer" className="hover:text-white/60 transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

function ServiceCard({
  title, price, duration, desc, featured,
}: {
  title: string; price: string; duration: string; desc: string; featured?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-6 border transition-all ${
      featured
        ? 'bg-green-500/10 border-green-500/40'
        : 'bg-white/5 border-white/10 hover:border-white/20'
    }`}>
      {featured && (
        <span className="inline-block text-xs font-bold text-green-400 uppercase tracking-widest mb-3">
          Popular
        </span>
      )}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-white text-lg leading-tight">{title}</h3>
        <span className={`font-black text-lg shrink-0 ml-2 ${featured ? 'text-green-400' : 'text-green-400'}`}>
          {price}
        </span>
      </div>
      <p className="text-white/50 text-sm leading-relaxed mb-3">{desc}</p>
      <p className="text-white/30 text-xs font-semibold uppercase tracking-wide">{duration}</p>
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-bold text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}
