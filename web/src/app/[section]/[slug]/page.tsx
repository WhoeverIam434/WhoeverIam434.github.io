import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MarkdownBody from "@/components/MarkdownBody";
import {
  SECTIONS,
  getPost,
  getPosts,
  isSection,
  type SectionKey,
} from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(SECTIONS) as SectionKey[]).flatMap((section) =>
    getPosts(section).map((post) => ({ section, slug: post.slug })),
  );
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
  if (!isSection(rawSection)) notFound();

  const post = getPost(rawSection, slug);
  if (!post) notFound();

  const section = SECTIONS[rawSection];

  return (
    <main className="border-t border-line">
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
