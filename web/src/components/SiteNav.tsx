"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { profile } from "@/data/profile";

const links = [
  { href: "/", label: "Index" },
  { href: "/academic/", label: "Academic Stuffs" },
  { href: "/project/", label: "Project Stuffs" },
  { href: "/personal/", label: "Personal Stuffs" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  const isActive = (href: string) => {
    const target = href.replace(/\/+$/, "") || "/";
    const current = pathname.replace(/\/+$/, "") || "/";
    if (target === "/") return current === "/";
    return current === target || current.startsWith(`${target}/`);
  };

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
        <a href="/" className="flex items-baseline gap-2">
          <span aria-hidden="true" className="font-mono text-sm text-accent">
            ///
          </span>
          <span className="font-display text-lg uppercase tracking-[0.04em]">
            {profile.name}
          </span>
        </a>

        <div className="ml-auto flex items-center gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`relative font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                    isActive(link.href)
                      ? "text-accent"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) ? (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1.5 left-0 h-px w-full bg-accent"
                    />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>

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
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-baseline justify-between border-b border-line py-3 font-mono text-xs uppercase tracking-[0.16em] transition-colors hover:text-accent ${
                    isActive(link.href) ? "text-accent" : "text-ink-soft"
                  }`}
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
