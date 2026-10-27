import ButtonLink from "@/components/ButtonLink";
import { profile, stats } from "@/data/profile";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="hero-grid pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto w-full max-w-[1120px] px-6 pb-16 pt-32 md:px-10 md:pb-24 md:pt-40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="mono-label flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 bg-accent" />
            {profile.availability}
          </p>
          <p className="mono-label hidden sm:block">
            {profile.location} · {profile.timezone}
          </p>
        </div>

        <h1 className="mt-10 text-[clamp(2.9rem,9vw,6.5rem)] leading-[0.9] tracking-[-0.03em]">
          {profile.name}
        </h1>

        <p className="mt-6 max-w-2xl font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-ink-soft md:text-xs">
          {profile.role}
        </p>

        <p className="mt-10 max-w-3xl text-lg leading-relaxed text-ink-soft md:text-xl md:leading-[1.65]">
          {profile.summary}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ButtonLink href={profile.cv} download>
            Download CV
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
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
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            {profile.phone}
          </a>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px border-y border-line bg-line md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-paper px-1 py-6 md:px-6">
              <dt className="font-display text-3xl tabular-nums md:text-4xl">
                {stat.value}
              </dt>
              <dd className="mono-label mt-2 pr-2 leading-relaxed">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
