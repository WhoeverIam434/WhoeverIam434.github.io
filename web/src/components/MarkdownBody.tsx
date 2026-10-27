"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown rendering happens on the client so the same component can be used
 * from server pages; raw HTML in the source is not rendered (react-markdown
 * ignores it), which keeps the static export free of injected markup.
 */
export default function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="post-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
