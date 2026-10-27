import Section from "@/components/Section";
import { education } from "@/data/profile";

export default function Education() {
  return (
    <Section
      id="education"
      index="05"
      title="Education"
      intro="Computer science with an AI major. However, I would say I learnt most of the embedded and robotics skills not in class, but in codes."
    >
      <div className="grid gap-px bg-line md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="bg-card px-5 py-7 md:px-8 md:py-9">
          <h3 className="text-2xl">{education.degree}</h3>
          <p className="mt-1 text-sm text-ink-soft">{education.extra}</p>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {education.school}
          </p>

          <p className="mono-label mt-8">Relevant coursework</p>
          <ul className="mt-3 space-y-2">
            {education.courses.map((course) => (
              <li
                key={course}
                className="flex gap-3 text-sm leading-relaxed text-ink-soft"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.65em] h-1 w-1 shrink-0 bg-line-strong"
                />
                {course}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card px-5 py-7 md:px-8 md:py-9">
          <p className="mono-label">Period</p>
          <p className="mt-2 font-mono text-sm">{education.period}</p>
          <p className="mt-1 text-xs text-muted">{education.note}</p>

          <p className="mono-label mt-8">Honours</p>
          <ul className="mt-3 space-y-2">
            {education.honors.map((honors) => (
              <li
                key={honors}
                className="flex gap-3 text-sm leading-relaxed text-ink-soft"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.65em] h-1 w-1 shrink-0 bg-line-strong"
                />
                {honors}
              </li>
            ))}
          </ul>

          <p className="mono-label mt-8">Location</p>
          <p className="mt-2 text-sm text-ink-soft">Hong Kong</p>
        </div>
      </div>
    </Section>
  );
}
