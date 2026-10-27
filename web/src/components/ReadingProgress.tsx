"use client";

import { useEffect, useState } from "react";

/** Thin light progress bar under the nav, for article pages. */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      setProgress(
        scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0,
      );
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-16 z-40 h-px bg-white/10"
    >
      <div
        className="h-px bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
