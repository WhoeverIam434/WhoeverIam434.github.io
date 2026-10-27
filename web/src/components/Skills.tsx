import Section from "@/components/Section";
import { skillGroups } from "@/data/profile";

export default function Skills() {
  return (
    <Section
      id="skills"
      index="04"
      title="Technical proficiencies"
      intro="The tools I reach for, grouped the way I actually use them."
    >
      <dl className="border-t border-line">
        {skillGroups.map((group) => (
          <div
            key={group.label}
            className="grid gap-3 border-b border-line py-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-baseline md:gap-10"
          >
            <dt className="text-xl">{group.label}</dt>
            <dd className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="border border-line px-2.5 py-1 font-mono text-[11px] text-ink-soft"
                >
                  {item}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
