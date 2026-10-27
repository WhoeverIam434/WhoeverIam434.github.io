import { profile } from "@/data/profile";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-4 px-6 py-8 md:px-10">
        <p className="mono-label">
          © {year} {profile.name}
        </p>
        <p className="mono-label">Next.js · Tailwind CSS · TypeScript</p>
        <a
          href="#top"
          className="mono-label transition-colors hover:text-ink"
        >
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
