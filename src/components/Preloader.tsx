import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import { fieldState } from "@/gl/fieldState";
import { NAME_GLYPHS, NAME_UPM } from "./nameGlyphs";

/**
 * The opening: a laser engraves the name.
 *
 * On black, a laser tip traces the outline of every letter of the hero name,
 * one after another, leaving a very light blue hairline. The stretch just
 * behind the tip glows hotter and cools as it moves on; a faint beam comes
 * down to the tip and a few sparks spray off it. Once the name is cut, the
 * outline flashes, the black lifts, and the real name is already sitting
 * inside the engraving (the outlines are drawn over the real letters'
 * measured positions), so the hand-off has no jump.
 *
 * The letter shapes are the font's real outlines (see nameGlyphs.ts). Any
 * click, key or scroll fast-forwards it; repeat visits and reduced motion
 * skip it.
 *
 * Rules carried over from the earlier glitch fixes:
 *  - start states are applied before the first paint (layout effect)
 *  - the sequence runs once per mount; callbacks are read through a ref
 */

const ENGRAVE_S = 1.5; // time to cut the whole name
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
      const starts: number[] = [];
      let total = 0;
      glyphs.forEach((g) => {
        starts.push(total);
        total += g.len;
      });

      // The laser: where the tip is, whether it's cutting, and its sparks.
      const tip = { x: vw / 2, y: -40, on: false };
      type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number };
      const sparks: Spark[] = [];
      let current = -1;

      const engraveTo = (dist: number) => {
        let i = current < 0 ? 0 : current;
        while (i < glyphs.length - 1 && dist >= starts[i + 1]) i++;
        // letters finished since the last frame are fully cut, their glow gone
        for (let k = Math.max(0, current); k < i; k++) {
          glyphs[k].cut.style.strokeDashoffset = glyphs[k].glow.style.strokeDashoffset = "0";
          glyphs[k].hot.style.opacity = "0";
        }
        current = i;
        const g = glyphs[i];
        const local = Math.min(g.len, dist - starts[i]);
        g.cut.style.strokeDashoffset = g.glow.style.strokeDashoffset = `${g.len - local}`;
        g.hot.style.strokeDashoffset = `${HOT_UNITS - local}`;
        const p = g.cut.getPointAtLength(local);
        tip.x = g.x + p.x * scale;
        tip.y = g.y - p.y * scale;
        tip.on = true;
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
          // the tip's glow
          const glow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 16);
          glow.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          glow.addColorStop(0.25, "rgba(190, 240, 255, 0.55)");
          glow.addColorStop(1, "rgba(0, 180, 216, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(tip.x, tip.y, 16, 0, Math.PI * 2);
          ctx.fill();
          for (let n = 0; n < 3; n++) {
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
        glyphs.forEach((g) => {
          g.cut.style.strokeDashoffset = g.glow.style.strokeDashoffset = "0";
          g.hot.style.opacity = "0";
        });
        tip.on = false;
        engraved = true;
      };

      const pos = { d: 0 };
      tl = gsap.timeline({ onComplete: release });
      tl
        // 1. the laser cuts the name, letter by letter
        .to(pos, { d: total, duration: ENGRAVE_S, ease: "none", onUpdate: () => engraveTo(pos.d) })
        .add(cutAll)
        // 2. the finished engraving flashes once...
        .to(".pl-cut", { stroke: "rgba(235, 251, 255, 1)", duration: 0.14, yoyo: true, repeat: 1, ease: "sine.inOut" })
        // 3. ...and the page comes up under it, the real name already in place
        .add(reveal, "-=0.05")
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
    </div>
  );
}
