import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import { fieldState } from "@/gl/fieldState";

/**
 * The opening: sketch to shipped.
 *
 * The loader reads the real hero's boxes from the page (every element marked
 * `data-wire`), draws their outlines like a Figma frame with a small label on
 * each, and runs a build log. Then its background fades away so the real
 * content appears inside the outlines as the hero animates in, and the
 * outlines dissolve. It never lifts off the page: it becomes the page.
 *
 * Because the outlines are measured from the live layout, they match the
 * phone layout on a phone and the desktop layout on a desktop.
 *
 * Rules carried over from the earlier glitch fixes:
 *  - start states are applied before the first paint (layout effect), and
 *    only `.to()` tweens follow, so nothing renders a start state out of turn
 *  - the sequence runs once per mount; callbacks are read through a ref
 */

const LOG = ["v0.1  layout", "v0.4  copy", "v0.8  proof", "v1.0  shipped"];

export default function Preloader({
  onReveal,
  onDone,
}: {
  onReveal: () => void;
  onDone: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const cb = useRef({ onReveal, onDone });
  useLayoutEffect(() => {
    cb.current = { onReveal, onDone };
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const labels = labelsRef.current;
    const log = logRef.current;
    if (!root || !svg || !labels || !log) return;

    document.body.style.overflow = "hidden";
    let revealed = false;
    let finished = false;
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

    // ── Measure the real hero and draw its wireframe ─────────────────────────
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
    const rects: SVGRectElement[] = [];
    const tags: HTMLElement[] = [];
    document.querySelectorAll<HTMLElement>("[data-wire]").forEach((el) => {
      const r = el.getBoundingClientRect();
      // Only boxes actually on screen (a page restored mid-scroll gets none).
      if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > vh) return;
      const pad = 6;
      const x = Math.max(1, r.left - pad);
      const y = Math.max(1, r.top - pad);
      const w = Math.min(vw - 2, r.right + pad) - x;
      const h = r.height + pad * 2;
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(w));
      rect.setAttribute("height", String(h));
      rect.setAttribute("rx", "6");
      const perimeter = 2 * (w + h);
      rect.style.strokeDasharray = String(perimeter);
      rect.style.strokeDashoffset = String(perimeter);
      svg.appendChild(rect);
      rects.push(rect);

      const tag = document.createElement("span");
      tag.className = "pl-tag";
      tag.textContent = el.dataset.wire ?? "";
      // Tall boxes carry their label inside the top-left corner (like a
      // Figma frame); short ones get it just above. Stops the labels of
      // stacked boxes from colliding.
      const inside = h > 44 || y <= 30;
      tag.style.left = `${inside ? x + 8 : x}px`;
      tag.style.top = `${inside ? y + 8 : y - 18}px`;
      labels.appendChild(tag);
      tags.push(tag);
    });

    // One status line that updates in place, like a build indicator in a
    // toolbar. (Stacked lines collided with the button box on phones.)
    const status = log.querySelector<HTMLElement>(".pl-status");
    const step = (i: number) => () => {
      if (status) status.textContent = LOG[i];
    };
    fieldState.intensity = 0.25;

    const tl = gsap.timeline({ onComplete: release });
    tl
      // 1. the sketch draws itself
      .to(rects, { strokeDashoffset: 0, duration: 0.65, ease: EASE.inOut, stagger: 0.08 }, 0)
      .to(tags, { opacity: 1, duration: 0.3, stagger: 0.08 }, 0.1)
      .call(step(1), [], 0.35)
      .call(step(2), [], 0.6)
      // 2. hand over: the hero starts animating in under the outlines
      .add(reveal, 0.85)
      // 3. the paper goes, and the real content fills the sketch
      .to(bgRef.current, { opacity: 0, duration: 0.55, ease: EASE.out }, 0.9)
      .to({}, { duration: 0.01, onStart: () => { fieldState.intensity = 1; } }, 0.95)
      // shipped at the hand-over, then the status steps aside before the
      // real nav fades in underneath it
      .call(step(3), [], 0.8)
      .to(log, { color: "#00b4d8", duration: 0.15 }, 0.8)
      .to(log, { opacity: 0, duration: 0.25, ease: EASE.in }, 0.95)
      // 4. the sketch dissolves
      .to([svg, labels], { opacity: 0, duration: 0.45, ease: EASE.in }, 1.3)
      .set(root, { autoAlpha: 0 });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
      rects.forEach((r) => r.remove());
      tags.forEach((t) => t.remove());
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[99999]"
      role="status"
      aria-label="Loading"
    >
      <div ref={bgRef} className="absolute inset-0 bg-[#0a0a0a]" />
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="rgba(0,180,216,0.85)"
        strokeWidth="1"
      />
      <div ref={labelsRef} aria-hidden="true" className="absolute inset-0" />
      {/* Build status, top corner (the nav is hidden under the loader, so this
          spot is always free). Visible from the first frame. */}
      <div
        ref={logRef}
        aria-hidden="true"
        className="absolute top-[26px] right-[var(--gutter)] flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-[#f5f0e8]/55"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00b4d8]" />
        <span className="pl-status">{LOG[0]}</span>
      </div>
    </div>
  );
}
