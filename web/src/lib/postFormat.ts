/**
 * Pure formatting helpers for the blog index. Kept separate from the
 * filesystem/git code so they can be unit-tested without a build environment.
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "Sep 2026" — UTC so a build in any timezone shows the same month. */
export function formatMonthYear(date: Date): string {
  const month = MONTHS[date.getUTCMonth()] ?? "Jan";
  return `${month} ${date.getUTCFullYear()}`;
}

/** File name → human readable title: "war-dragon_notes" → "War Dragon Notes". */
export function humanizeSlug(slug: string): string {
  return slug
    .replace(/\.md$/i, "")
    .replace(/^\d{4}[-_]\d{2}[-_]\d{2}[-_]?/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/** First Markdown H1 in the body, if any. */
export function firstHeading(markdown: string): string | null {
  const match = markdown.match(/^\s{0,3}#\s+(.+?)\s*#*\s*$/m);
  return match ? match[1].trim() : null;
}

/**
 * Drop a leading H1 from the body: the page already renders the post title, so
 * keeping the heading would show it twice.
 */
export function stripLeadingHeading(markdown: string): string {
  return markdown.replace(/^\s{0,3}#\s+[^\n]*\n+/, "");
}
