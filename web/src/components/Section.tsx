import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  index: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Editorial section shell with a technical header: index chip, condensed
 * title, accent rule and an optional lead paragraph.
 */
export default function Section({
  id,
  index,
  title,
  intro,
  children,
  className = "",
}: SectionProps) {
  return (
    <section id={id} className={`border-t border-line ${className}`}>
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
        <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-accent font-mono text-[10px] text-accent">
              {index}
            </span>
            <h2 className="text-3xl leading-none md:text-[2.75rem]">{title}</h2>
            <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted md:block">
              // Section {index}
            </span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="h-px w-16 bg-accent" />
            <span className="h-px flex-1 bg-line" />
          </div>

          {intro ? (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
              {intro}
            </p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}
