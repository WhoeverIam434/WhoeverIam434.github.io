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
 * Editorial section shell: a hairline top rule, an index + title on the left
 * and an optional lead paragraph on the right.
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
      <div className="mx-auto w-full max-w-[1120px] px-6 py-20 md:px-10 md:py-28">
        <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
          <div className="flex items-baseline gap-4">
            <span className="mono-label shrink-0 text-accent">{index}</span>
            <h2 className="text-3xl leading-[1.05] md:text-[2.75rem]">{title}</h2>
          </div>
          {intro ? (
            <p className="max-w-xl text-base leading-relaxed text-ink-soft md:text-[1.0625rem]">
              {intro}
            </p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}
