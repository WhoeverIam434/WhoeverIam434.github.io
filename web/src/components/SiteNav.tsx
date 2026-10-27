"use client";

import { useEffect, useState } from "react";

import { profile } from "@/data/profile";

const links = [
  { id: "focus", label: "Focus" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

export default function SiteNav() {
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-accent via-accent/30 to-transparent"
      />

      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6 md:px-10"
      >
        <a href="#top" className="flex items-baseline gap-2">
          <span aria-hidden="true" className="font-mono text-sm text-accent">
            ///
          </span>
          <span className="font-display text-lg uppercase tracking-[0.04em]">
            {profile.name}
          </span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                aria-current={active === link.id ? "true" : undefined}
                className={`relative font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  active === link.id
                    ? "text-accent"
                    : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
                {active === link.id ? (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-0 h-px w-full bg-accent"
                  />
                ) : null}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={profile.cv}
            download
            className="cut-corner-sm hidden items-center gap-2 border border-line-strong px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-accent hover:text-accent md:inline-flex"
          >
            CV
            <span aria-hidden="true">↓</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] border border-line-strong transition-colors hover:border-accent md:hidden"
          >
            <span
              className={`block h-px w-4 transition-transform ${
                open ? "translate-y-[3px] rotate-45 bg-accent" : "bg-ink"
              }`}
            />
            <span
              className={`block h-px w-4 transition-transform ${
                open ? "-translate-y-[3px] -rotate-45 bg-accent" : "bg-ink"
              }`}
            />
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id="nav-menu"
          className="min-h-[calc(100dvh-4rem)] border-t border-line bg-paper md:hidden"
        >
          <div aria-hidden="true" className="hazard h-1 w-full opacity-60" />
          <ul className="mx-auto max-w-[1200px] px-6 py-4">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between border-b border-line py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-accent"
                >
                  {link.label}
                  <span aria-hidden="true" className="text-muted">
                    ↗
                  </span>
                </a>
              </li>
            ))}
            <li>
              <a
                href={profile.cv}
                download
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between py-3 font-mono text-xs uppercase tracking-[0.16em] text-accent"
              >
                Download CV
                <span aria-hidden="true">↓</span>
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
