import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SECTIONS, getPosts, isSection, type SectionKey } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(SECTIONS) as SectionKey[]).map((section) => ({
    section,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  if (!isSection(section)) return {};
  return {
    title: `${SECTIONS[section].title} — Cheuk Hin Li`,
    description: SECTIONS[section].tagline,
  };
}

export default async function SectionIndexPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: rawSection } = await params;
  if (!isSection(rawSection)) notFound();

  const section = SECTIONS[rawSection];
  const posts = getPosts(rawSection);

  return (
    <main className="border-t border-line">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
        <header>
          <p className="mono-label text-accent">// Archive</p>
          <h1 className="mt-3 text-[clamp(2.4rem,7vw,5rem)] leading-[0.9]">
            {section.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
            {section.tagline}
          </p>

          <div className="mt-7 flex items-center gap-3">
            <span className="h-px w-16 bg-accent" />
            <span className="h-px flex-1 bg-line" />
            <span className="mono-label shrink-0">
              {posts.length} {posts.length === 1 ? "Entry" : "Entries"}
            </span>
          </div>
        </header>

        {posts.length === 0 ? (
          <p className="mono-label mt-16 border border-dashed border-line px-5 py-6">
            No entries yet — drop a .md file into content/{rawSection}/
          </p>
        ) : (
          <ul className="mt-12 border-t border-line">
            {posts.map((post) => (
              <li key={post.slug} className="border-b border-line">
                <a
                  href={`/${rawSection}/${post.slug}/`}
                  className="group flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:gap-3 md:py-5"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent md:w-[108px] md:shrink-0">
                    {post.dateLabel}
                  </span>
                  <span
                    aria-hidden="true"
                    className="hidden text-line-strong md:inline"
                  >
                    -
                  </span>
                  <span className="font-display text-xl uppercase tracking-wide text-ink transition-colors group-hover:text-accent md:text-2xl">
                    {post.title}
                  </span>
                  <span className="mono-label ml-auto hidden opacity-0 transition-opacity group-hover:opacity-100 md:block">
                    Read ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
