"use client";

import { useEffect, useRef, useState } from "react";

import InvertedPendulum from "@/components/minigames/InvertedPendulum";
import TodoMinigame from "@/components/minigames/TodoMinigame";
import { focusAreas } from "@/data/profile";
import { computeCharge, type ChargeState } from "@/lib/focusCharge";

type GameId = "robotics" | "embedded" | "control";

const GAME_BY_INDEX: Record<string, GameId> = {
  R: "robotics",
  E: "embedded",
  C: "control",
};

/**
 * Focus is a pinned section: the panel is sticky for one viewport, and the
 * extra section height acts as the charge you have to scroll through before
 * the page is released into the next section.
 */
export default function FocusSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [charge, setCharge] = useState<ChargeState>({
    progress: 0,
    pinned: false,
    complete: false,
  });
  const [game, setGame] = useState<GameId | null>(null);

  /* measure how far the pinned panel has been scrolled through */
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      setCharge(computeCharge(rect.top, rect.height, window.innerHeight));
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* lock the page while a minigame is open */
  useEffect(() => {
    if (!game) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [game]);

  /* Escape closes the minigame */
  useEffect(() => {
    if (!game) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGame(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game]);

  const percent = Math.round(charge.progress * 100);
  const activeGame = game;

  return (
    <section
      id="focus"
      ref={sectionRef}
      aria-labelledby="focus-title"
      className="relative border-t border-line"
      style={{ height: "calc(100svh + 70vh)" }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col px-6 pb-8 pt-24 md:px-10 md:pt-28">
          <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <div className="flex items-center gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-accent font-mono text-[10px] text-accent">
                01
              </span>
              <h2 id="focus-title" className="text-3xl leading-none md:text-4xl">
                Focus
              </h2>
              <span aria-hidden="true" className="hidden h-px w-16 bg-line sm:block" />
            </div>
            <p className="mono-label hidden md:block">
              // Select a track to open its minigame
            </p>
          </header>

          <div className="mt-6 flex min-h-0 flex-1 md:mt-8 md:items-center">
            <ul className="grid w-full grid-rows-3 gap-px bg-line md:h-[420px] md:grid-cols-3 md:grid-rows-1">
              {focusAreas.map((area) => {
                const gameId = GAME_BY_INDEX[area.index] ?? "robotics";
                const available = gameId === "control";
                return (
                  <li key={area.title} className="group relative min-h-0 bg-paper">
                    <button
                      type="button"
                      onClick={() => setGame(gameId)}
                      className="relative flex h-full w-full flex-col overflow-hidden px-5 py-5 text-left transition-[background-color,transform] duration-300 ease-out hover:z-10 hover:scale-[1.015] hover:bg-card focus-visible:bg-card md:px-7 md:py-8"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-px bg-line-strong transition-colors duration-300 group-hover:bg-accent"
                      />

                      <span
                        aria-hidden="true"
                        className="stroke-text pointer-events-none absolute -right-3 -top-8 font-display text-[7rem] leading-none tracking-tighter transition-colors duration-300 group-hover:[-webkit-text-stroke:1px_var(--color-accent)] md:text-[9rem]"
                      >
                        {area.index}
                      </span>

                      <div className="relative flex items-baseline justify-between gap-3">
                        <span className="mono-label text-accent">
                          / {area.index}
                        </span>
                        <span className="mono-label opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          {available ? "Open" : "TODO"}
                        </span>
                      </div>

                      <h3 className="relative mt-3 text-2xl md:mt-6 md:text-4xl">
                        {area.title}
                      </h3>
                      <p className="relative mt-2 line-clamp-2 max-w-[26ch] text-[13px] leading-snug text-ink-soft md:mt-3 md:max-w-none md:line-clamp-none md:text-sm md:leading-relaxed">
                        {area.description}
                      </p>

                      <ul className="relative mt-4 hidden flex-wrap gap-1.5 md:flex">
                        {area.tags.map((tag) => (
                          <li
                            key={tag}
                            className="border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted transition-colors group-hover:border-line-strong group-hover:text-ink-soft"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>

                      <span className="relative mt-auto inline-flex items-center gap-2 pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors group-hover:text-accent">
                        {available ? "Play the pendulum" : "Minigame — TODO"}
                        <span aria-hidden="true">↗</span>
                      </span>

                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            role="progressbar"
            aria-label="Scroll to leave the Focus section"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-6 shrink-0 md:mt-8"
          >
            <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
              <span className={charge.complete ? "text-accent" : "text-muted"}>
                {charge.complete
                  ? "Unlocked — keep scrolling"
                  : "Locked — charge to continue"}
              </span>
              <span className="tabular-nums text-ink-soft">{percent}%</span>
            </div>
            <div className="mt-2 h-1 w-full bg-line">
              <div
                className="h-1 bg-accent transition-[width] duration-150 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {activeGame === "control" ? (
        <InvertedPendulum onClose={() => setGame(null)} />
      ) : null}
      {activeGame === "robotics" ? (
        <TodoMinigame title="Robotics" onClose={() => setGame(null)} />
      ) : null}
      {activeGame === "embedded" ? (
        <TodoMinigame title="Embedded" onClose={() => setGame(null)} />
      ) : null}
    </section>
  );
}
