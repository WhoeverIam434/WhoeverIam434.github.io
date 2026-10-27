import ButtonLink from "@/components/ButtonLink";
import { profile, stats } from "@/data/profile";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="hero-grid pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-16 pt-24 md:px-10 md:pb-24 md:pt-32">
        {/* status strip */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line pb-3">
          <p className="mono-label flex items-center gap-2 text-accent">
            <span className="inline-block h-1.5 w-1.5 bg-accent" />
            {profile.availability}
          </p>
          <p className="mono-label hidden sm:block">
            {profile.location} // {profile.timezone}
          </p>
          <p className="mono-label hidden md:block">FILE · CHL-2026</p>
        </div>

        <div className="mt-10 flex flex-wrap items-start justify-between gap-10 md:mt-14">
          <div className="min-w-0 flex-1">
            <p className="mono-label text-accent">// Robotics Engineer</p>

            <h1 className="mt-3 text-[clamp(3rem,10vw,7.5rem)] leading-[0.82] tracking-[-0.02em]">
              Cheuk Hin Li<span className="text-accent">_</span>
            </h1>

            <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.24em] text-muted">
              Embedded firmware · Motion control · Localisation
            </p>

            <p className="mt-8 max-w-[58ch] text-base leading-relaxed text-ink-soft md:text-lg">
              {profile.summary}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href={profile.cv} download>
                Download CV
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" />
                </svg>
              </ButtonLink>
              <ButtonLink href={`mailto:${profile.email}`} variant="secondary">
                Email
              </ButtonLink>
              <a
                href={`tel:${profile.phoneHref}`}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                {profile.phone}
              </a>
            </div>
          </div>

          {/* technical decoration */}
          <div className="hidden shrink-0 flex-col items-end gap-3 self-stretch lg:flex">
            <div aria-hidden="true" className="hazard h-1.5 w-24" />
            <div
              aria-hidden="true"
              className="barcode h-24 w-10 text-line-strong"
            />
            <p className="mono-label [writing-mode:vertical-rl] tracking-[0.4em]">
              Signal // Stable
            </p>
          </div>
        </div>

        {/* stats */}
        <dl className="hud mt-14 grid grid-cols-2 gap-px border border-line bg-line md:mt-20 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-paper px-4 py-6 transition-colors hover:bg-card md:px-6"
            >
              <dt className="font-display text-4xl leading-none tracking-tight md:text-5xl">
                {stat.value}
              </dt>
              <dd className="mono-label mt-3 pr-2 leading-relaxed">
                {stat.label}
              </dd>
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full"
              />
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
