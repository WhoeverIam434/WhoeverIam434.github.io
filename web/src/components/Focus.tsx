import PendulumSimulator from "@/components/PendulumSimulator";
import Section from "@/components/Section";
import { focusAreas } from "@/data/profile";

export default function Focus() {
  return (
    <Section
      id="focus"
      index="01"
      title="Focus"
      intro="Three areas I keep coming back to. The third one is live below — tune it, break it, reset it."
    >
      <ul className="grid gap-px bg-line md:grid-cols-3">
        {focusAreas.map((area) => (
          <li key={area.title} className="bg-paper px-5 py-7 md:px-7 md:py-8">
            <span className="mono-label text-accent">{area.index}</span>
            <h3 className="mt-5 text-2xl">{area.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {area.description}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {area.tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <PendulumSimulator />
    </Section>
  );
}
