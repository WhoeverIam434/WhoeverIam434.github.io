import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  download?: boolean;
  external?: boolean;
  className?: string;
};

const base =
  "inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors";

const variants = {
  primary: "cut-corner-sm bg-accent text-paper hover:bg-ink",
  secondary:
    "border border-line-strong text-ink hover:border-accent hover:text-accent",
  quiet: "text-muted hover:text-accent",
} as const;

export default function ButtonLink({
  href,
  children,
  variant = "primary",
  download = false,
  external = false,
  className = "",
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      download={download || undefined}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
