"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "top", label: "Intro" },
  { id: "focus", label: "Focus" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "directory", label: "Directory" },
  { id: "contact", label: "Contact" },
];

/**
 * Fixed right-hand section rail: a light vertical progress line plus one tick
 * per section. The active tick is highlighted and every label links to its
 * section, so the rail doubles as a table of contents.
 */
export default function SectionRail() {
  const [active, setActive] = useState<string>("top");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      setProgress(
        scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0,
      );

      const threshold = window.innerHeight * 0.42;
      let current = sections[0].id;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= threshold) {
          current = section.id;
        }
      }
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
        current = sections[sections.length - 1].id;
      }
      setActive(current);
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === active),
  );

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <p className="mono-label mb-3 text-right tabular-nums text-ink-soft">
        {String(activeIndex + 1).padStart(2, "0")}
        <span className="mx-1 text-white/25">/</span>
        {String(sections.length).padStart(2, "0")}
      </p>

      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-[2px] bg-white/15"
        />
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 w-[2px] bg-accent transition-[height] duration-150 ease-out"
          style={{ height: `${progress * 100}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute -right-[3px] h-2 w-2 border border-paper bg-accent transition-[top] duration-150 ease-out"
          style={{ top: `calc(${progress * 100}% - 4px)` }}
        />

        <ul className="relative flex flex-col items-end gap-3">
          {sections.map((section) => {
            const isActive = section.id === active;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex items-center justify-end gap-2 py-0.5"
                >
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                      isActive
                        ? "text-accent"
                        : "text-ink-soft/85 group-hover:text-ink"
                    }`}
                  >
                    {section.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`h-px transition-all duration-200 ${
                      isActive
                        ? "w-5 bg-accent"
                        : "w-2.5 bg-white/30 group-hover:w-4 group-hover:bg-white/70"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
