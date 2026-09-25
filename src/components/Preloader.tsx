import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import { fieldState } from "@/gl/fieldState";
import { NAME_GLYPHS, NAME_UPM } from "./nameGlyphs";

/**
 * The opening: a laser show engraves the name.
 *
 *  1. Emitters light up along the top of a black screen and fan their beams
 *     down onto the name, laid out in the middle of the screen.
 *  2. One laser per letter, all at once: each tip slowly works its way round
 *     its own letter's outline (hot trail behind it, sparks off it), so the
 *     whole name is cut in about two seconds.
 *  3. The beams fade out.
 *  4. The name glides from the centre to its place in the hero, the black
 *     lifts, and the real name is already sitting inside the outline (the
 *     outlines are built on the real letters' measured positions), so the
 *     hand-off has no jump.
 *
 * Letter shapes are the font's real outlines (nameGlyphs.ts). A hint says how
 * to skip; any click, key or scroll fast-forwards. Repeat visits and reduced
 * motion skip it entirely.
 *
 * Rules carried over from the earlier glitch fixes:
 *  - start states are applied before the first paint (layout effect)
 *  - the sequence runs once per mount; callbacks are read through a ref
 */

const LOCK_S = 0.35; // beams reach down to the letters
const CUT_S = 1.6; // how long each laser takes round its letter
const STAGGER_S = 0.035; // lasers start one after another, left to right
const HOT_UNITS = 150; // glowing stretch behind each tip, font units

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

      // ── Build the outlines on the real letters' final positions ────────────
      // Each letter's box's left edge is its glyph origin; a zero-size probe
      // on the line gives the exact baseline.
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
      const stage = document.createElementNS(NS, "g"); // moves the whole name
      svg.appendChild(stage);
      made.push(stage);
      type Glyph = { cut: SVGPathElement; glow: SVGPathElement; hot: SVGPathElement; len: number; x: number; y: number };
      const glyphs: Glyph[] = [];
      const box = { l: Infinity, t: Infinity, r: -Infinity, b: -Infinity };
      chars.forEach((el) => {
        const d = NAME_GLYPHS[el.textContent ?? ""];
        if (!d || !el.parentElement) return;
        const rect = el.getBoundingClientRect();
        box.l = Math.min(box.l, rect.left);
        box.t = Math.min(box.t, rect.top);
        box.r = Math.max(box.r, rect.right);
        box.b = Math.max(box.b, rect.bottom);
        const x = rect.left;
        const y = baselineOf(el.parentElement);
        const g = document.createElementNS(NS, "g");
        g.setAttribute("transform", `translate(${x} ${y}) scale(${scale} ${-scale})`);
        const cut = document.createElementNS(NS, "path");
        const glow = document.createElementNS(NS, "path");
        const hot = document.createElementNS(NS, "path");
        [cut, glow, hot].forEach((p) => p.setAttribute("d", d));
        cut.setAttribute("class", "pl-cut");
        glow.setAttribute("class", "pl-glow");
        hot.setAttribute("class", "pl-hot");
        // widths in screen px, converted to the letters' units
        cut.setAttribute("stroke-width", `${1.2 / scale}`);
        glow.setAttribute("stroke-width", `${6 / scale}`);
        hot.setAttribute("stroke-width", `${2.2 / scale}`);
        g.append(glow, cut, hot);
        stage.appendChild(g);
        const len = cut.getTotalLength();
        cut.style.strokeDasharray = glow.style.strokeDasharray = `${len}`;
        cut.style.strokeDashoffset = glow.style.strokeDashoffset = `${len}`;
        hot.style.strokeDasharray = `${HOT_UNITS} ${len + HOT_UNITS}`;
        hot.style.strokeDashoffset = `${HOT_UNITS}`;
        glyphs.push({ cut, glow, hot, len, x, y });
      });

      // ── The stage: centred (and a touch larger) while it's cut ─────────────
      // k = 1 centred, k = 0 at its place in the hero.
      const cx = (box.l + box.r) / 2;
      const cy = (box.t + box.b) / 2;
      const big = Math.min(1.2, (vw * 0.86) / (box.r - box.l));
      const stagePos = { k: 1 };
      const toScreen = (x: number, y: number) => {
        const k = stagePos.k;
        const s = 1 + (big - 1) * k;
        return { x: cx + (vw / 2 - cx) * k + (x - cx) * s, y: cy + (vh / 2 - cy) * k + (y - cy) * s };
      };
      const placeStage = () => {
        const k = stagePos.k;
        const s = 1 + (big - 1) * k;
        stage.setAttribute(
          "transform",
          `translate(${cx + (vw / 2 - cx) * k} ${cy + (vh / 2 - cy) * k}) scale(${s}) translate(${-cx} ${-cy})`,
        );
      };
      placeStage();

      // ── The lasers ─────────────────────────────────────────────────────────
      // A few emitters along the top; each letter takes the nearest one, so
      // the beams fan down onto the name.
      const emitterCount = vw < 700 ? 3 : 5;
      const emitters = Array.from({ length: emitterCount }, (_, i) => ({ x: ((i + 0.5) / emitterCount) * vw, y: 4 }));
      const lasers = glyphs.map((g) => {
        const p = g.cut.getPointAtLength(0);
        const s = toScreen(g.x + p.x * scale, g.y - p.y * scale);
        const e = emitters.reduce((a, b) => (Math.abs(b.x - s.x) < Math.abs(a.x - s.x) ? b : a));
        return { e, x: s.x, y: s.y, cutting: false, done: false, t: 0 };
      });
      const beams = { reach: 0, on: 1 };

      type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number };
      const sparks: Spark[] = [];

      const engrave = (i: number) => {
        const g = glyphs[i];
        const L = lasers[i];
        const local = g.len * L.t;
        g.cut.style.strokeDashoffset = g.glow.style.strokeDashoffset = `${g.len - local}`;
        g.hot.style.strokeDashoffset = `${HOT_UNITS - local}`;
        const p = g.cut.getPointAtLength(local);
        const s = toScreen(g.x + p.x * scale, g.y - p.y * scale);
        L.x = s.x;
        L.y = s.y;
        L.cutting = L.t > 0 && L.t < 1;
        if (L.t >= 1 && !L.done) {
          L.done = true;
          g.hot.style.opacity = "0";
        }
      };

      const draw = () => {
        raf = requestAnimationFrame(draw);
        ctx.clearRect(0, 0, vw, vh);
        const on = beams.on * beams.reach;
        if (on > 0.01) {
          // emitters: a small plain dot each, no glow
          ctx.fillStyle = `rgba(215, 247, 255, ${0.9 * on})`;
          for (const e of emitters) {
            ctx.beginPath();
            ctx.arc(e.x, e.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
          for (const L of lasers) {
            // beams reach down from the emitter to the tip
            const tx = L.e.x + (L.x - L.e.x) * beams.reach;
            const ty = L.e.y + (L.y - L.e.y) * beams.reach;
            const beam = ctx.createLinearGradient(L.e.x, L.e.y, tx, ty);
            beam.addColorStop(0, `rgba(160, 230, 255, ${0.05 * on})`);
            beam.addColorStop(1, `rgba(200, 245, 255, ${0.45 * on})`);
            ctx.strokeStyle = beam;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(L.e.x, L.e.y);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            if (L.done) continue;
            // the tip
            const r = L.cutting ? 11 : 7;
            const glow = ctx.createRadialGradient(tx, ty, 0, tx, ty, r);
            glow.addColorStop(0, `rgba(255, 255, 255, ${0.95 * on})`);
            glow.addColorStop(0.3, `rgba(190, 240, 255, ${0.5 * on})`);
            glow.addColorStop(1, "rgba(0, 180, 216, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(tx, ty, r, 0, Math.PI * 2);
            ctx.fill();
            if (L.cutting && Math.random() < 0.7) {
              sparks.push({ x: tx, y: ty, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 2.8 - 0.3, life: 0, max: 12 + Math.random() * 16 });
            }
          }
        }
        // sparks: short streaks that arc down and fade (drawn in 3 alpha
        // bands, one stroke each, so hundreds of them stay cheap)
        const bands: Path2D[] = [new Path2D(), new Path2D(), new Path2D()];
        for (let s = sparks.length - 1; s >= 0; s--) {
          const k = sparks[s];
          k.life += 1;
          if (k.life > k.max) {
            sparks.splice(s, 1);
            continue;
          }
          k.vy += 0.2;
          k.x += k.vx;
          k.y += k.vy;
          const band = bands[Math.min(2, Math.floor((k.life / k.max) * 3))];
          band.moveTo(k.x, k.y);
          band.lineTo(k.x - k.vx * 1.5, k.y - k.vy * 1.5);
        }
        ctx.lineWidth = 1;
        [0.85, 0.5, 0.2].forEach((a, i) => {
          ctx.strokeStyle = `rgba(215, 247, 255, ${a})`;
          ctx.stroke(bands[i]);
        });
        if (on <= 0.01 && !sparks.length && stagePos.k <= 0) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      };
      raf = requestAnimationFrame(draw);

      const cutAll = () => {
        glyphs.forEach((g, i) => {
          lasers[i].t = 1;
          engrave(i);
        });
        engraved = true;
      };

      const buildEnd = LOCK_S + (glyphs.length - 1) * STAGGER_S + CUT_S; // ~2.3s
      tl = gsap.timeline({ onComplete: release });
      // 1. emitters light and the beams reach down onto the letters
      tl.to(beams, { reach: 1, duration: LOCK_S, ease: "power2.out" }, 0);
      // 2. every letter has its own laser, working slowly round its outline
      lasers.forEach((L, i) => {
        tl!.to(L, { t: 1, duration: CUT_S, ease: "sine.inOut", onUpdate: () => engrave(i) }, LOCK_S + i * STAGGER_S);
      });
      tl.to(hintRef.current, { opacity: 1, duration: 0.5 }, 1)
        .add(cutAll, buildEnd)
        // 3. the beams fade out...
        .to(beams, { on: 0, duration: 0.3, ease: EASE.in }, buildEnd)
        // 4. ...the name glides from the centre to its place in the hero...
        .to(stagePos, { k: 0, duration: 0.85, ease: EASE.inOut, onUpdate: placeStage }, buildEnd + 0.15)
        .to(hintRef.current, { opacity: 0, duration: 0.2 }, buildEnd + 0.15)
        // ...and the page comes up around it, the real name already in place
        .add(reveal, buildEnd + 0.92)
        .to(bgRef.current, { opacity: 0, duration: 0.6, ease: EASE.out }, buildEnd + 0.92)
        .to({}, { duration: 0.01, onStart: () => { fieldState.intensity = 1; } }, buildEnd + 0.92)
        .to(svg, { opacity: 0, duration: 0.5, ease: EASE.in }, buildEnd + 1.1)
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
      <svg ref={svgRef} aria-hidden="true" className="absolute inset-0 h-full w-full" fill="none" />
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
