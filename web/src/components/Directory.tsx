import Section from "@/components/Section";
import { SECTIONS, getPosts, type SectionKey } from "@/lib/posts";

/**
 * The home page doubles as the directory: one card per Markdown-backed archive.
 */
export default function Directory() {
  const entries = (Object.keys(SECTIONS) as SectionKey[]).map((key) => ({
    ...SECTIONS[key],
    count: getPosts(key).length,
  }));

  return (
    <Section
      id="directory"
      index="06"
      title="Directory"
      intro="Three archives. Drop a Markdown file into the matching folder and it shows up here."
    >
      <ul className="grid gap-px bg-line md:grid-cols-3">
        {entries.map((entry, index) => (
          <li key={entry.key} className="group relative bg-paper">
            <a
              href={`/${entry.key}/`}
              className="relative flex h-full flex-col overflow-hidden px-5 py-7 md:px-7 md:py-9"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-line-strong transition-colors group-hover:bg-accent"
              />

              <div className="flex items-baseline justify-between gap-3">
                <span className="mono-label text-accent">
                  / {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mono-label">
                  {entry.count} {entry.count === 1 ? "entry" : "entries"}
                </span>
              </div>

              <h3 className="mt-4 text-2xl md:text-3xl">{entry.title}</h3>
              <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-ink-soft">
                {entry.tagline}
              </p>

              <span className="mt-auto inline-flex items-center gap-2 pt-7 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors group-hover:text-accent">
                Browse archive <span aria-hidden="true">↗</span>
              </span>

              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full"
              />
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
