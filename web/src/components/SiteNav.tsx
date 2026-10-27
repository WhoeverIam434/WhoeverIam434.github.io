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
      .filter((el): el is HTMLElement => el !== null);

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-6 md:px-10"
      >
        <a href="#top" className="font-display text-lg tracking-tight">
          {profile.name}
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                aria-current={active === link.id ? "true" : undefined}
                className={`font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                  active === link.id
                    ? "text-accent"
                    : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={profile.cv}
            download
            className="hidden items-center gap-2 border border-line-strong px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors hover:border-ink hover:bg-ink hover:text-paper md:inline-flex"
          >
            CV
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" />
            </svg>
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] border border-line-strong md:hidden"
          >
            <span
              className={`block h-px w-4 bg-ink transition-transform ${
                open ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-4 bg-ink transition-transform ${
                open ? "-translate-y-[3px] -rotate-45" : ""
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
          <ul className="mx-auto max-w-[1120px] px-6 py-4">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink-soft last:border-b-0"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={profile.cv}
                download
                onClick={() => setOpen(false)}
                className="block py-3 font-mono text-xs uppercase tracking-[0.16em] text-accent"
              >
                Download CV
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
