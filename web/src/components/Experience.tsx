import Section from "@/components/Section";
import { experience } from "@/data/profile";

export default function Experience() {
  return (
    <Section
      id="experience"
      index="02"
      title="Experience"
      intro="Where the firmware has actually shipped: a competition team, an internship, and a lab."
    >
      <ol className="border-t border-line">
        {experience.map((entry) => (
          <li
            key={`${entry.role}-${entry.org}`}
            className="grid gap-x-10 gap-y-6 border-b border-line py-9 md:grid-cols-[190px_minmax(0,1fr)] md:py-12"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                {entry.period}
              </p>
              <p className="mono-label mt-2">{entry.kind}</p>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl">{entry.role}</h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                {entry.org}
              </p>

              <ul className="mt-5 space-y-2.5">
                {entry.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-3 text-[15px] leading-relaxed text-ink-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.65em] h-1 w-1 shrink-0 bg-line-strong"
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <ul className="mt-5 flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <li
                    key={tag}
                    className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
