import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import matter from "gray-matter";

import { firstHeading, formatMonthYear, humanizeSlug, stripLeadingHeading } from "@/lib/postFormat";

/**
 * Blog sections. Each one is backed by a directory of Markdown files:
 *
 *   web/content/academic/*.md
 *   web/content/project/*.md
 *   web/content/personal/*.md
 *
 * Drop a file in, commit it, and the next build picks it up. The date shown on
 * the index is resolved in this order:
 *
 *   1. `date:` in the frontmatter (use this to backdate a post)
 *   2. the commit date of the file from git (this is "when you uploaded it")
 *   3. the file's mtime, for an uncommitted local build
 */

export const SECTIONS = {
  academic: {
    key: "academic",
    title: "Academic Stuffs",
    tagline:
      "Coursework, reading notes and papers — the things that started with a textbook.",
  },
  project: {
    key: "project",
    title: "Project Stuffs",
    tagline:
      "Build logs, post-mortems and notes from robots, firmware and everything in between.",
  },
  personal: {
    key: "personal",
    title: "Personal Stuffs",
    tagline:
      "Games, side quests and whatever else does not fit a CV.",
  },
} as const;

export type SectionKey = keyof typeof SECTIONS;

export type Post = {
  section: SectionKey;
  slug: string;
  title: string;
  summary: string;
  date: Date;
  dateLabel: string;
  content: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "content");

export function isSection(value: string): value is SectionKey {
  return Object.prototype.hasOwnProperty.call(SECTIONS, value);
}

export function sectionDir(section: SectionKey): string {
  return path.join(CONTENT_ROOT, section);
}

/** Commit date of the file — the closest thing to "when it was uploaded". */
function gitCommitDate(file: string): Date | null {
  try {
    const relative = path.relative(process.cwd(), file);
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", relative],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    if (!output) return null;
    const parsed = new Date(output);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

function resolveDate(
  frontmatterDate: unknown,
  absolutePath: string,
): Date {
  if (frontmatterDate instanceof Date) return frontmatterDate;
  if (typeof frontmatterDate === "string") {
    const parsed = new Date(frontmatterDate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const fromGit = gitCommitDate(absolutePath);
  if (fromGit) return fromGit;

  try {
    return fs.statSync(absolutePath).mtime;
  } catch {
    return new Date();
  }
}

function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#|]/g, " ")
    .replace(/^\s*[-+]\s+/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readPost(file: string, section: SectionKey): Post | null {
  const slug = path.basename(file, path.extname(file));

  try {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);

    const title =
      (typeof data.title === "string" && data.title.trim()) ||
      firstHeading(content) ||
      humanizeSlug(slug);

    const summary =
      (typeof data.summary === "string" && data.summary.trim()) ||
      (typeof data.description === "string" && data.description.trim()) ||
      plainText(content).slice(0, 180);

    const date = resolveDate(data.date, file);

    return {
      section,
      slug,
      title,
      summary,
      date,
      dateLabel: formatMonthYear(date),
      content: stripLeadingHeading(content),
    };
  } catch {
    return null;
  }
}

const cache = new Map<SectionKey, Post[]>();

export function getPosts(section: SectionKey): Post[] {
  const cached = cache.get(section);
  if (cached) return cached;

  const directory = sectionDir(section);
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(directory)
      .filter((name) => name.toLowerCase().endsWith(".md"))
      .map((name) => path.join(directory, name));
  } catch {
    files = [];
  }

  const posts = files
    .map((file) => readPost(file, section))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  cache.set(section, posts);
  return posts;
}

export function getPost(section: SectionKey, slug: string): Post | null {
  return getPosts(section).find((post) => post.slug === slug) ?? null;
}

export function getAllPosts(): Post[] {
  return (Object.keys(SECTIONS) as SectionKey[])
    .flatMap((section) => getPosts(section))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
