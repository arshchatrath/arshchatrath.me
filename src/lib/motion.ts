/**
 * The site's motion vocabulary.
 *
 * Every tween pulls its easing and duration from here. Before this existed each
 * animation invented its own numbers, which is the main reason the page read as
 * a pile of effects rather than one authored thing.
 */

export const EASE = {
  /** Default for things entering. Decisive, no bounce. */
  out: "power3.out",
  /** Things leaving, or collapsing inward. */
  in: "power2.in",
  /** Scrubbed / two-way motion. */
  inOut: "power2.inOut",
  /** The one place we allow overshoot: an arrival that should feel physical. */
  pop: "back.out(1.7)",
} as const;

export const DUR = {
  fast: 0.35,
  base: 0.7,
  slow: 1.2,
} as const;

/** Stagger presets, so sequencing is consistent across sections. */
export const STAGGER = {
  tight: 0.035,
  base: 0.08,
  loose: 0.14,
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export type Tier = 0 | 1 | 2;

/**
 * Device capability tier, decided once.
 *   2 — full effects
 *   1 — reduced: lower DPR, calmer field
 *   0 — no WebGL / reduced-motion: static fallbacks only
 *
 * A 3D hero that drops to 18fps on a mid-range phone is worse than no 3D hero,
 * so we decide up front rather than hoping.
 */
let cachedTier: Tier | null = null;

export function deviceTier(): Tier {
  if (cachedTier !== null) return cachedTier;
  if (typeof window === "undefined") return (cachedTier = 0);
  if (prefersReducedMotion()) return (cachedTier = 0);

  // No WebGL at all -> tier 0.
  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl");
    if (!gl) return (cachedTier = 0);
  } catch {
    return (cachedTier = 0);
  }

  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  if (mem <= 4 || cores <= 4 || (coarse && window.innerWidth < 900)) {
    return (cachedTier = 1);
  }
  return (cachedTier = 2);
}
