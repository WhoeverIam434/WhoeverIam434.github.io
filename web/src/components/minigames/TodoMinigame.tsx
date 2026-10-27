"use client";

/**
 * Placeholder minigame for the tracks that do not have one yet.
 * Same full-screen shell as the pendulum so the interaction feels consistent.
 */
export default function TodoMinigame({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} minigame (not implemented yet)`}
      className="fixed inset-0 z-[100] overflow-y-auto bg-paper"
    >
      <div aria-hidden="true" className="hero-grid absolute inset-0" />

      <div className="relative mx-auto flex min-h-full w-full max-w-[1280px] flex-col p-6 md:p-12">
        <p className="mono-label">Focus — {title}</p>

        <h2 className="mt-4 text-[clamp(2.4rem,6vw,4.25rem)] leading-[0.94]">
          {title}
        </h2>

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
          Minigame — TODO
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          This track does not have its interactive piece yet. The Control
          Systems track has the inverted pendulum — open it from the Focus
          section.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-auto w-fit font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
        >
          Close ×
        </button>
      </div>
    </div>
  );
}
