import { profile } from "@/data/profile";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line">
      <div aria-hidden="true" className="hazard h-px w-24 opacity-70" />
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 md:px-10">
        <p className="mono-label">
          © {year} {profile.name}
        </p>
        <p className="mono-label hidden sm:block">
          // End of file · Next.js / Tailwind / TypeScript
        </p>
        <a
          href="#top"
          className="mono-label flex items-center gap-2 transition-colors hover:text-accent"
        >
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
