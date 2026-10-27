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
      setCharge(
        computeCharge(rect.top, rect.height, window.innerHeight),
      );
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
        <div className="mx-auto flex h-full w-full max-w-[1120px] flex-col px-6 pb-8 pt-24 md:px-10 md:pt-28">
          <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <div className="flex items-baseline gap-4">
              <span className="mono-label text-accent">01</span>
              <h2 id="focus-title" className="text-3xl md:text-4xl">
                Focus
              </h2>
            </div>
            <p className="mono-label hidden md:block">
              Click a track to open its minigame
            </p>
          </header>

          <div className="mt-6 flex min-h-0 flex-1 md:mt-0 md:items-center">
            <ul className="grid w-full grid-rows-3 gap-px bg-line md:h-[400px] md:grid-cols-3 md:grid-rows-1">
              {focusAreas.map((area) => {
                const gameId = GAME_BY_INDEX[area.index] ?? "robotics";
                const available = gameId === "control";
                return (
                  <li key={area.title} className="min-h-0 bg-paper">
                    <button
                      type="button"
                      onClick={() => setGame(gameId)}
                      className="group flex h-full w-full flex-col px-5 py-4 text-left transition-[transform,background-color] duration-300 ease-out hover:z-10 hover:scale-[1.035] hover:bg-card focus-visible:scale-[1.035] focus-visible:bg-card md:px-7 md:py-8"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="mono-label text-accent">
                          {area.index}
                        </span>
                        <span className="mono-label opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          {available ? "Open" : "TODO"}
                        </span>
                      </div>

                      <h3 className="mt-2 text-xl md:mt-6 md:text-3xl">
                        {area.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-ink-soft md:mt-3 md:line-clamp-none md:text-sm md:leading-relaxed">
                        {area.description}
                      </p>

                      <span className="mt-auto inline-flex items-center gap-2 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors group-hover:text-ink md:pt-5">
                        {available ? "Play the pendulum" : "Minigame — TODO"}
                        <span aria-hidden="true">→</span>
                      </span>
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
            <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              <span>
                {charge.complete
                  ? "Unlocked — keep scrolling"
                  : "Locked — keep scrolling to continue"}
              </span>
              <span className="tabular-nums text-ink-soft">{percent}%</span>
            </div>
            <div className="mt-2 h-[2px] w-full overflow-hidden bg-line">
              <div
                className={`h-full transition-[width] duration-150 ease-out ${
                  charge.complete ? "bg-accent" : "bg-ink"
                }`}
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
