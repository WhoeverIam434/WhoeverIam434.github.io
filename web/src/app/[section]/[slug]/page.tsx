import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MarkdownBody from "@/components/MarkdownBody";
import ReadingProgress from "@/components/ReadingProgress";
import {
  SECTIONS,
  getPost,
  getPosts,
  isSection,
  type SectionKey,
} from "@/lib/posts";

export const dynamicParams = false;

/**
 * A placeholder route is generated when every archive is empty: with
 * `output: "export"` Next.js refuses to build a dynamic route with zero
 * params, and an empty content folder should not break the deploy.
 */
const EMPTY_SLUG = "__empty";

export function generateStaticParams() {
  const params = (Object.keys(SECTIONS) as SectionKey[]).flatMap((section) =>
    getPosts(section).map((post) => ({ section, slug: post.slug })),
  );

  if (params.length > 0) return params;
  return [{ section: "academic" as const, slug: EMPTY_SLUG }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}): Promise<Metadata> {
  const { section, slug } = await params;
  if (!isSection(section)) return {};
  const post = getPost(section, slug);
  if (!post) return {};
  return {
    title: `${post.title} — Cheuk Hin Li`,
    description: post.summary,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section: rawSection, slug } = await params;

  if (slug === EMPTY_SLUG) {
    return (
      <main className="border-t border-line">
        <div className="mx-auto w-full max-w-[860px] px-6 py-24 md:px-10 md:py-32">
          <p className="mono-label text-accent">// Archive</p>
          <h1 className="mt-3 text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[0.95]">
            No posts yet
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Drop a Markdown file into{" "}
            <span className="font-mono text-[13px] text-ink">
              web/content/&lt;section&gt;/
            </span>
            , commit it, and the next build will list it in the matching
            archive.
          </p>
          <ul className="mt-10 flex flex-wrap gap-3">
            {(Object.keys(SECTIONS) as SectionKey[]).map((key) => (
              <li key={key}>
                <a
                  href={`/${key}/`}
                  className="inline-flex border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-accent hover:text-accent"
                >
                  {SECTIONS[key].title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  if (!isSection(rawSection)) notFound();

  const post = getPost(rawSection, slug);
  if (!post) notFound();

  const section = SECTIONS[rawSection];

  return (
    <main className="border-t border-line">
      <ReadingProgress />
      <article className="mx-auto w-full max-w-[860px] px-6 py-20 md:px-10 md:py-28">
        <a
          href={`/${rawSection}/`}
          className="mono-label inline-flex items-center gap-2 transition-colors hover:text-accent"
        >
          <span aria-hidden="true">←</span> {section.title}
        </a>

        <p className="mono-label mt-10 text-accent">
          {post.dateLabel} <span className="text-line-strong">//</span>{" "}
          {section.title}
        </p>
        <h1 className="mt-3 text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[0.95]">
          {post.title}
        </h1>
        {post.summary ? (
          <p className="mt-5 text-base leading-relaxed text-ink-soft">
            {post.summary}
          </p>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px w-16 bg-accent" />
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="mt-10">
          <MarkdownBody content={post.content} />
        </div>

        <div className="mt-16 border-t border-line pt-6">
          <a
            href={`/${rawSection}/`}
            className="mono-label inline-flex items-center gap-2 transition-colors hover:text-accent"
          >
            <span aria-hidden="true">←</span> Back to {section.title}
          </a>
        </div>
      </article>
    </main>
  );
}
