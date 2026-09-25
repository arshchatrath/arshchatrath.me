import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { prefersReducedMotion } from "@/lib/motion";
import { fieldState } from "@/gl/fieldState";

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * The opening.
 *
 * Three beats, ~2.4s total, and it never leaves the dark:
 *   1. a hairline grows from the centre while a counter runs 000 → 100
 *   2. at 100 the line snaps to the full width of the screen
 *   3. the overlay splits into columns that lift away left to right
 *
 * Deliberately no full-screen colour fill. The previous version flashed a
 * solid teal panel over everything for two and a half seconds — a chained
 * `fromTo` whose "from" state (scaleY: 1) rendered immediately at time zero.
 * Every initial state here is set with `gsap.set`, and every animation is a
 * plain `.to()`, so nothing can render a start state before its turn.
 *
 * Start states also live in the markup. React runs effects *after* the
 * browser paints, so a start state applied only in JS showed the line at full
 * width and the label at full opacity for ~250ms (longer on slow devices —
 * the WebGL shader compiles on the same thread), then snapped them away.
 *
 * `onReveal` fires at the snap, before the columns lift, so the hero builds
 * itself as the curtain rises. `onDone` fires once the overlay is gone.
 */
export default function Preloader({
  onReveal,
  onDone,
}: {
  onReveal: () => void;
  onDone: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // The sequence runs exactly once per mount. The callbacks are read through a
  // ref so the effect has no dependencies: `onReveal` makes the parent
  // re-render, which hands us fresh function identities — with them as deps,
  // that re-render killed the timeline and replayed the whole opening.
  const cb = useRef({ onReveal, onDone });
  useLayoutEffect(() => {
    cb.current = { onReveal, onDone };
  });

  // Layout effect: runs before paint, so GSAP owns these elements from the
  // first frame the browser draws.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.body.style.overflow = "hidden";
    let finished = false;
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      cb.current.onReveal();
    };
    const release = () => {
      if (finished) return;
      finished = true;
      reveal();
      document.body.style.overflow = "";
      fieldState.intensity = 1;
      fieldState.introDone = true;
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch {
        /* ignore */
      }
      cb.current.onDone();
    };

    // Seen it already this session (a reload, or back from /resume)? Go
    // straight to the page; the opening is for first impressions only.
    let seen = false;
    try {
      seen = sessionStorage.getItem("intro-seen") === "1";
    } catch {
      /* storage blocked: just play it */
    }

    if (prefersReducedMotion() || seen) {
      gsap.set(root, { autoAlpha: 0 });
      release();
      return;
    }

    const cols = root.querySelectorAll<HTMLElement>(".pl-col");
    const counter = { v: 0 };

    // Every start state is declared up front rather than inside a tween.
    gsap.set(cols, { yPercent: 0 });
    gsap.set(lineRef.current, { scaleX: 0, opacity: 1 });
    fieldState.intensity = 0.25;

    // How far the line has to stretch to span the viewport from 44vw.
    const fullStretch = 1 / 0.44;

    const tl = gsap.timeline({ onComplete: release });

    tl
      // ── 1. the measure ────────────────────────────────────────────────
      .to(labelRef.current, {
        duration: 1.1,
        scrambleText: { text: "ARSH CHATRATH", chars: "upperCase", speed: 0.45 },
      }, 0.2)
      .to(lineRef.current, {
        scaleX: 1,
        duration: 1.25,
        ease: "power2.inOut",
      }, 0.2)
      .to(counter, {
        v: 100,
        duration: 1.25,
        ease: "power1.inOut",
        onUpdate: () => {
          if (countRef.current) {
            countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
          }
          fieldState.intensity = 0.25 + (counter.v / 100) * 0.45;
        },
      }, 0.2)

      // ── 2. the snap ───────────────────────────────────────────────────
      // Hand over here, not at the end: the page's heavier setup runs while
      // only a hairline is moving, and the hero entrance then plays out under
      // the lifting columns instead of after them.
      .add(reveal, 1.5)
      .to(lineRef.current, {
        scaleX: fullStretch,
        duration: 0.5,
        ease: "expo.out",
      }, 1.5)
      .to([countRef.current, labelRef.current], {
        opacity: 0,
        y: -10,
        duration: 0.35,
        ease: "power2.in",
      }, 1.62)

      // ── 3. the lift ───────────────────────────────────────────────────
      .to(lineRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      }, 1.92)
      .to(cols, {
        yPercent: -100,
        duration: 0.95,
        ease: "expo.inOut",
        stagger: { each: 0.055, from: "start" },
      }, 1.95)
      .to({}, {
        duration: 0.01,
        onStart: () => { fieldState.intensity = 1; },
      }, 2.1)
      .set(root, { autoAlpha: 0 });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[99999] overflow-hidden"
      role="status"
      aria-label="Loading"
    >
      {/* Columns that lift away, rather than one panel that fills the screen */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="pl-col h-full flex-1 bg-[#0a0a0a]" />
        ))}
      </div>

      {/* The measure */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[44vw] -translate-x-1/2 -translate-y-1/2">
        <div
          ref={lineRef}
          className="h-px w-full origin-center bg-[#00B4D8]"
          style={{ boxShadow: "0 0 18px rgba(0,180,216,0.55)", transform: "scaleX(0)" }}
        />
      </div>

      <span
        ref={labelRef}
        className="absolute bottom-10 left-6 font-mono text-xs uppercase tracking-[0.42em] text-[#f5f0e8]/45 md:left-16"
      >
        ARSH CHATRATH
      </span>
      <span
        ref={countRef}
        className="absolute bottom-10 right-6 font-mono text-xs tracking-[0.3em] text-[#00B4D8] md:right-16"
      >
        000
      </span>
    </div>
  );
}
