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
      <div
        aria-hidden="true"
        className="hazard absolute inset-y-0 left-0 w-1 opacity-40"
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[1280px] flex-col p-6 md:min-h-[calc(100svh-6rem)] md:p-12">
        <div className="hud relative flex min-h-full flex-1 flex-col">
          <p className="mono-label flex items-center gap-2 text-accent">
            <span aria-hidden="true" className="hazard h-1 w-8" />
            Focus — {title}
          </p>

          <h2 className="mt-4 text-[clamp(2.4rem,7vw,5rem)] leading-[0.9]">
            {title}
          </h2>

          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.2em] text-danger">
            Minigame — TODO
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            This track does not have its interactive piece yet. The Control
            Systems track has the inverted pendulum — open it from the Focus
            section.
          </p>

          <p
            aria-hidden="true"
            className="pointer-events-none mt-8 select-none font-display text-[clamp(4rem,18vw,14rem)] leading-none tracking-tighter text-transparent"
            style={{ WebkitTextStroke: "1px rgba(201, 255, 63, 0.35)" }}
          >
            TODO
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-auto w-fit pt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
          >
            Close ×
          </button>
        </div>
      </div>
    </div>
  );
}
