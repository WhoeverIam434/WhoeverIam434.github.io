/**
 * Scroll-charge helper for the pinned Focus section.
 *
 * The section is taller than the viewport; its inner viewport-sized panel is
 * `position: sticky`, so the panel stays put while the extra height scrolls by.
 * That extra travel is the "charge" the visitor has to scroll through before
 * the page is released into the next section.
 */

export type ChargeState = {
  /** 0 → 1 as the pinned panel is scrolled through */
  progress: number;
  /** true while the panel is pinned in front of the visitor */
  pinned: boolean;
  /** true once the charge is full and the next section can take over */
  complete: boolean;
};

export function computeCharge(
  sectionTop: number,
  sectionHeight: number,
  viewportHeight: number,
): ChargeState {
  const travel = Math.max(sectionHeight - viewportHeight, 1);
  const scrolled = Math.min(Math.max(-sectionTop, 0), travel);

  return {
    progress: scrolled / travel,
    pinned: sectionTop <= 0 && sectionTop >= -travel,
    complete: scrolled >= travel,
  };
}
