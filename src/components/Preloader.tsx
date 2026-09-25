import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import { fieldState } from "@/gl/fieldState";
import { NAME_GLYPHS, NAME_UPM } from "./nameGlyphs";

/**
 * The opening: a laser engraves the name.
 *
 * On black, a laser tip warms up at the first letter, then slowly traces the
 * outline of the whole name as one continuous line: it follows each letter's
 * contour, travels over to the next letter without cutting, and carries on,
 * easing in at the start and out at the end. It leaves a very light blue
 * hairline. The stretch just
 * behind the tip glows hotter and cools as it moves on; a faint beam comes
 * down to the tip and a few sparks spray off it. Once the name is cut, the
 * outline flashes, the black lifts, and the real name is already sitting
 * inside the engraving (the outlines are drawn over the real letters'
 * measured positions), so the hand-off has no jump.
 *
 * The letter shapes are the font's real outlines (see nameGlyphs.ts). A hint
 * says how to skip; any click, key or scroll fast-forwards it; repeat visits
 * and reduced motion skip it.
 *
 * Rules carried over from the earlier glitch fixes:
 *  - start states are applied before the first paint (layout effect)
 *  - the sequence runs once per mount; callbacks are read through a ref
 */

const ENGRAVE_S = 4.2; // time to trace the whole name
const WARMUP_S = 0.45; // the tip glows at the first point before it cuts
const TRAVEL_UNITS = 220; // share of the trace spent moving between letters, font units
const HOT_UNITS = 140; // length of the glowing stretch behind the tip, font units

export default function Preloader({
  onReveal,
  onDone,
}: {
  /** `engraved`: the name is already on screen, so the hero shouldn't animate it in again */
  onReveal: (engraved: boolean) => void;
  onDone: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  const cb = useRef({ onReveal, onDone });
  useLayoutEffect(() => {
    cb.current = { onReveal, onDone };
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !svg || !canvas || !ctx) return;

    document.body.style.overflow = "hidden";
    let revealed = false;
    let finished = false;
    let engraved = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      cb.current.onReveal(engraved);
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

    fieldState.intensity = 0.25;
    let disposed = false;
    let tl: gsap.core.Timeline | null = null;
    let raf = 0;
    const made: Element[] = [];

    // Fast-forward on any sign of impatience.
    const hurry = () => tl?.timeScale(6);
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, hurry, { passive: true }));

    const start = () => {
      if (disposed) return;
      const chars = [...document.querySelectorAll<HTMLElement>(".hero-char")];
      if (!chars.length) {
        tl = gsap.timeline({ onComplete: release }).to(root, { autoAlpha: 0, duration: 0.3 });
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Where each real letter sits: its box's left edge is the glyph origin,
      // and a zero-size probe on the line gives the exact baseline.
      const scale = parseFloat(getComputedStyle(chars[0]).fontSize) / NAME_UPM;
      const baselines = new Map<Element, number>();
      const baselineOf = (line: Element) => {
        let y = baselines.get(line);
        if (y === undefined) {
          const probe = document.createElement("span");
          probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
          line.appendChild(probe);
          y = probe.getBoundingClientRect().top;
          probe.remove();
          baselines.set(line, y);
        }
        return y;
      };

      const NS = "http://www.w3.org/2000/svg";
      type Glyph = { cut: SVGPathElement; glow: SVGPathElement; hot: SVGPathElement; len: number; x: number; y: number };
      const glyphs: Glyph[] = [];
      chars.forEach((el) => {
        const d = NAME_GLYPHS[el.textContent ?? ""];
        if (!d || !el.parentElement) return;
        const x = el.getBoundingClientRect().left;
        const y = baselineOf(el.parentElement);
        const g = document.createElementNS(NS, "g");
        g.setAttribute("transform", `translate(${x} ${y}) scale(${scale} ${-scale})`);
        const cut = document.createElementNS(NS, "path");
        const glow = document.createElementNS(NS, "path");
        const hot = document.createElementNS(NS, "path");
        [cut, glow, hot].forEach((el) => el.setAttribute("d", d));
        cut.setAttribute("class", "pl-cut");
        glow.setAttribute("class", "pl-glow");
        hot.setAttribute("class", "pl-hot");
        g.append(glow, cut, hot);
        svg.appendChild(g);
        made.push(g);
        const len = cut.getTotalLength();
        cut.style.strokeDasharray = glow.style.strokeDasharray = `${len}`;
        cut.style.strokeDashoffset = glow.style.strokeDashoffset = `${len}`;
        hot.style.strokeDasharray = `${HOT_UNITS} ${len + HOT_UNITS}`;
        hot.style.strokeDashoffset = `${HOT_UNITS}`;
        glyphs.push({ cut, glow, hot, len, x, y });
      });
      // Screen position of a point along a letter's outline.
      const at = (g: Glyph, len: number) => {
        const p = g.cut.getPointAtLength(len);
        return { x: g.x + p.x * scale, y: g.y - p.y * scale };
      };

      // The whole trace as one line: cut a letter, travel to the next, cut it...
      type Seg = { from: number; len: number; g: number; travel: boolean };
      const segs: Seg[] = [];
      let total = 0;
      glyphs.forEach((g, i) => {
        segs.push({ from: total, len: g.len, g: i, travel: false });
        total += g.len;
        if (i < glyphs.length - 1) {
          segs.push({ from: total, len: TRAVEL_UNITS, g: i, travel: true });
          total += TRAVEL_UNITS;
        }
      });

      // The laser: where the tip is, how big its glow is, whether it's
      // cutting (sparks) or just moving, and its sparks.
      const first = at(glyphs[0], 0);
      const tip = { x: first.x, y: first.y, on: false, cutting: false, size: 0 };
      type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number };
      const sparks: Spark[] = [];
      let current = 0;

      const cutLetter = (g: Glyph) => {
        g.cut.style.strokeDashoffset = g.glow.style.strokeDashoffset = "0";
        g.hot.style.opacity = "0";
      };
      const engraveTo = (dist: number) => {
        while (current < segs.length - 1 && dist >= segs[current + 1].from) {
          if (!segs[current].travel) cutLetter(glyphs[segs[current].g]);
          current++;
        }
        const seg = segs[current];
        const local = Math.min(seg.len, Math.max(0, dist - seg.from));
        if (seg.travel) {
          // between letters: glide over to the next one's starting point
          const a = at(glyphs[seg.g], glyphs[seg.g].len);
          const b = at(glyphs[seg.g + 1], 0);
          const t = local / seg.len;
          const e = t * t * (3 - 2 * t);
          tip.x = a.x + (b.x - a.x) * e;
          tip.y = a.y + (b.y - a.y) * e;
          tip.cutting = false;
          return;
        }
        const g = glyphs[seg.g];
        g.cut.style.strokeDashoffset = g.glow.style.strokeDashoffset = `${g.len - local}`;
        g.hot.style.strokeDashoffset = `${HOT_UNITS - local}`;
        const p = at(g, local);
        tip.x = p.x;
        tip.y = p.y;
        tip.cutting = true;
      };

      const draw = () => {
        raf = requestAnimationFrame(draw);
        ctx.clearRect(0, 0, vw, vh);
        if (tip.on) {
          // faint beam from above
          const beam = ctx.createLinearGradient(tip.x, 0, tip.x, tip.y);
          beam.addColorStop(0, "rgba(160, 230, 255, 0)");
          beam.addColorStop(1, "rgba(190, 240, 255, 0.35)");
          ctx.strokeStyle = beam;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tip.x, 0);
          ctx.lineTo(tip.x, tip.y);
          ctx.stroke();
          // the tip's glow (smaller while it's only moving)
          const r = Math.max(1, 16 * tip.size * (tip.cutting ? 1 : 0.6));
          const glow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, r);
          glow.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          glow.addColorStop(0.25, "rgba(190, 240, 255, 0.55)");
          glow.addColorStop(1, "rgba(0, 180, 216, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(tip.x, tip.y, r, 0, Math.PI * 2);
          ctx.fill();
          for (let n = tip.cutting ? 2 : 0; n > 0; n--) {
            sparks.push({
              x: tip.x,
              y: tip.y,
              vx: (Math.random() - 0.5) * 5,
              vy: -Math.random() * 3.2 - 0.4,
              life: 0,
              max: 14 + Math.random() * 20,
            });
          }
        }
        // sparks: short streaks that arc down and fade
        ctx.lineWidth = 1;
        for (let s = sparks.length - 1; s >= 0; s--) {
          const k = sparks[s];
          k.life += 1;
          if (k.life > k.max) {
            sparks.splice(s, 1);
            continue;
          }
          k.vy += 0.22;
          k.x += k.vx;
          k.y += k.vy;
          ctx.strokeStyle = `rgba(210, 245, 255, ${(1 - k.life / k.max).toFixed(2)})`;
          ctx.beginPath();
          ctx.moveTo(k.x, k.y);
          ctx.lineTo(k.x - k.vx * 1.6, k.y - k.vy * 1.6);
          ctx.stroke();
        }
        if (!tip.on && !sparks.length) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      };
      raf = requestAnimationFrame(draw);

      const cutAll = () => {
        glyphs.forEach(cutLetter);
        tip.on = false;
        engraved = true;
      };

      const pos = { d: 0 };
      tl = gsap.timeline({ onComplete: release });
      tl
        // 1. the laser warms up at the first point...
        .add(() => { tip.on = true; })
        .to(tip, { size: 1, duration: WARMUP_S, ease: "power2.out" })
        // ...then slowly traces the whole name as one line, easing in and out
        .to(pos, { d: total, duration: ENGRAVE_S, ease: "sine.inOut", onUpdate: () => engraveTo(pos.d) })
        .to(hintRef.current, { opacity: 1, duration: 0.6 }, 1.2)
        .add(cutAll, WARMUP_S + ENGRAVE_S)
        // 2. the finished engraving flashes once...
        .to(".pl-cut", { stroke: "rgba(235, 251, 255, 1)", duration: 0.14, yoyo: true, repeat: 1, ease: "sine.inOut" })
        // 3. ...and the page comes up under it, the real name already in place
        .add(reveal, "-=0.05")
        .to(hintRef.current, { opacity: 0, duration: 0.2 }, "<")
        .to(bgRef.current, { opacity: 0, duration: 0.6, ease: EASE.out }, "<")
        .to(svg, { opacity: 0, duration: 0.55, ease: EASE.in }, "<0.2")
        .to({}, { duration: 0.01, onStart: () => { fieldState.intensity = 1; } }, "<")
        .set(root, { autoAlpha: 0 });
    };

    // Measure only once the headline font is in, or the outline would be
    // placed against the fallback font's letters.
    const fontReady = document.fonts?.load
      ? Promise.race([
          document.fonts.load(`100px "Bricolage Grotesque"`),
          new Promise((r) => setTimeout(r, 1500)),
        ])
      : Promise.resolve();
    fontReady.then(start, start);

    return () => {
      disposed = true;
      tl?.kill();
      cancelAnimationFrame(raf);
      events.forEach((e) => window.removeEventListener(e, hurry));
      document.body.style.overflow = "";
      made.forEach((g) => g.remove());
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[99999]"
      role="status"
      aria-label="Loading"
    >
      <div ref={bgRef} className="absolute inset-0 bg-[#050606]" />
      <svg ref={svgRef} aria-hidden="true" className="pl-engraving absolute inset-0 h-full w-full" fill="none" />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      <p
        ref={hintRef}
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 text-center font-mono text-xs uppercase tracking-[0.25em] text-[#f5f0e8]/40 opacity-0"
      >
        {typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? "Tap to skip" : "Press any key to skip"}
      </p>
    </div>
  );
}
