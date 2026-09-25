import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The story scene: the questions turn into the lessons.
 *
 * Both panels sit in one frame that holds still (CSS sticky) while you scroll.
 * The thinking monkey's ASCII spreads until a wall of characters covers the
 * whole screen, "then it clicked" decodes in the middle, the panels swap
 * underneath, and the wall pulls back into the realising monkey, leaving the
 * lessons behind.
 *
 * The wall is a canvas of character cells. Each cell has a fixed threshold
 * (its distance from the monkey, plus a little noise for a ragged edge), so a
 * frame only compares numbers and repaints the cells whose state changed.
 *
 * Reduced motion, or a screen too short to hold a panel: the panels just
 * stack in the page with a still "then it clicked" between them.
 */

const RAMP = " .:-=+*#%@";
const NOISE = "!<>-_/[]{}=+*^?#01\\";
const CLICK = "then it clicked";

// The scene's scroll, as fractions of its length.
const COVER = [0.1, 0.44] as const; // the wall spreads from the first monkey
const PEAK = 0.5; // panels swap under the full wall
const UNCOVER = [0.56, 0.9] as const; // the wall pulls back into the second monkey
const PHRASE = [0.42, 0.47, 0.53, 0.58] as const; // fade in, hold, fade out
const BAND = 0.06; // how far behind the moving edge cells stay bright

const BG = "#070707";
const FRONT = "#c9f6ff";
const INKS = ["rgba(0,180,216,0.2)", "rgba(0,180,216,0.38)", "rgba(0,180,216,0.6)", "rgba(0,180,216,0.85)"];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

const images = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string) {
  let p = images.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    images.set(src, p);
  }
  return p;
}

/** Draw an image into an offscreen canvas and read back per-cell luminance. */
function sampleImage(img: HTMLImageElement, cols: number, rows: number): Uint8Array {
  const c = document.createElement("canvas");
  c.width = cols;
  c.height = rows;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  const out = new Uint8Array(cols * rows);
  if (!ctx) return out;

  // Contain the image in the grid so it isn't distorted.
  const scale = Math.min(cols / img.width, rows / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h);

  const { data } = ctx.getImageData(0, 0, cols, rows);
  for (let i = 0; i < out.length; i++) {
    const o = i * 4;
    const alpha = data[o + 3] / 255;
    const lum = (0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]) / 255;
    // These are dark cutouts on transparency: alpha carries the silhouette,
    // luminance only modulates the detail inside it.
    out[i] = Math.round(255 * alpha * (0.34 + 0.66 * Math.pow(lum, 0.75)));
  }
  return out;
}

/** A still ASCII rendering of an image, sized to its box (set in CSS). */
export function AsciiArt({ src, className = "" }: { src: string; className?: string }) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const pre = ref.current;
    if (!pre) return;
    let disposed = false;
    let lastSize = "";

    const build = async () => {
      const w = pre.clientWidth;
      const h = pre.clientHeight;
      if (!w || !h || `${w}x${h}` === lastSize) return;
      lastSize = `${w}x${h}`;

      // Measure the real glyph box rather than assuming monospace proportions.
      const probe = document.createElement("span");
      probe.textContent = "MMMMMMMMMM";
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
      pre.appendChild(probe);
      const charW = probe.getBoundingClientRect().width / 10 || 4;
      probe.remove();
      const lineH = parseFloat(getComputedStyle(pre).lineHeight) || charW;
      const cols = Math.max(12, Math.floor(w / charW));
      const rows = Math.max(8, Math.floor(h / lineH));

      const img = await loadImage(src).catch(() => null);
      if (disposed || !img) return;
      const lum = sampleImage(img, cols, rows);
      let out = "";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          out += RAMP[Math.min(RAMP.length - 1, ((lum[y * cols + x] / 255) * RAMP.length) | 0)];
        }
        out += "\n";
      }
      pre.textContent = out;
    };

    // Built when it's about a screen and a half away, and again if its box
    // changes size.
    const resized = new ResizeObserver(() => build());
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        near.disconnect();
        resized.observe(pre);
      },
      { rootMargin: "150% 0px" },
    );
    near.observe(pre);
    return () => {
      disposed = true;
      near.disconnect();
      resized.disconnect();
    };
  }, [src]);

  return <pre ref={ref} aria-hidden="true" className={`ascii-art ${className}`} />;
}

type Wall = {
  cols: number;
  rows: number;
  cw: number;
  ch: number;
  t1: Float32Array; // cover threshold
  t2: Float32Array; // uncover threshold
  st: Uint8Array; // 0 clear, 1 covered, 2 covered and bright (near the edge)
  glyph: Uint8Array;
  ink: Uint8Array;
};

export default function AsciiStory({ first, second }: { first: ReactNode; second: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const clickRef = useRef<HTMLParagraphElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pinned, setPinned] = useState(() => !prefersReducedMotion());

  // Hold the scene only if both panels fit the screen. Measured in the held
  // layout before paint, again once fonts are in, and when the width changes
  // (a height-only resize is the phone toolbar sliding, which svh ignores).
  useLayoutEffect(() => {
    const root = rootRef.current;
    const frame = frameRef.current;
    if (!root || !frame) return;
    let was: boolean | null = null;
    const decide = () => {
      let fits = !prefersReducedMotion();
      if (fits) {
        root.classList.add("story--pinned");
        fits = [aRef.current, bRef.current].every((p) => !!p && p.scrollHeight <= frame.clientHeight + 1);
      }
      root.classList.toggle("story--pinned", fits);
      // Dropping to the stacked layout changes the page height under every
      // other trigger. (Going the other way, the scene's effect refreshes.)
      if (was === true && !fits) ScrollTrigger.refresh();
      was = fits;
      setPinned(fits);
    };
    decide();
    let lastW = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      decide();
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(decide);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    const root = rootRef.current;
    const frame = frameRef.current;
    const a = aRef.current;
    const b = bRef.current;
    const click = clickRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !frame || !a || !b || !click || !canvas || !ctx) return;

    let wall: Wall | null = null;
    let progress = 0;
    let phraseText = "";

    const paint = (i: number, s: number) => {
      if (!wall) return;
      const { cols, cw, ch } = wall;
      const x = (i % cols) * cw;
      const y = ((i / cols) | 0) * ch;
      if (s === 0) {
        ctx.clearRect(x, y, cw, ch);
        return;
      }
      ctx.fillStyle = BG;
      ctx.fillRect(x, y, cw, ch);
      ctx.fillStyle = s === 2 ? FRONT : INKS[wall.ink[i]];
      ctx.fillText(NOISE[wall.glyph[i]], x, y + ch / 2);
    };

    const render = (p: number) => {
      progress = p;
      const before = p < PEAK;
      a.style.opacity = before ? "1" : "0";
      b.style.opacity = before ? "0" : "1";

      // "then it clicked": decodes letter by letter as it fades in
      const [i0, i1, o0, o1] = PHRASE;
      const vis = p < i0 || p > o1 ? 0 : p < i1 ? (p - i0) / (i1 - i0) : p > o0 ? 1 - (p - o0) / (o1 - o0) : 1;
      click.style.opacity = vis.toFixed(3);
      const solved = Math.floor(clamp01((p - i0) / (PEAK - i0)) * CLICK.length);
      const text = CLICK.split("")
        .map((c, k) => (k < solved || c === " " ? c : NOISE[(k * 7 + ((p * 300) | 0)) % NOISE.length]))
        .join("");
      if (text !== phraseText) click.textContent = phraseText = text;

      if (!wall) return;
      const c1 = smooth(clamp01((p - COVER[0]) / (COVER[1] - COVER[0])));
      const c2 = smooth(clamp01((p - UNCOVER[0]) / (UNCOVER[1] - UNCOVER[0])));
      const { t1, t2, st } = wall;
      for (let i = 0; i < st.length; i++) {
        let s = 0;
        if (c1 > t1[i] && c2 <= t2[i]) s = c1 - t1[i] < BAND || t2[i] - c2 < BAND ? 2 : 1;
        if (s !== st[i]) {
          st[i] = s;
          paint(i, s);
        }
      }
    };

    const build = async () => {
      const w = frame.clientWidth;
      const h = frame.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const fs = (w < 768 ? 11 : 13) * dpr;
      const family = getComputedStyle(document.documentElement).getPropertyValue("--ff-mono").trim() || "monospace";
      await document.fonts?.load(`${fs}px ${family}`).catch(() => undefined);

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.font = `${fs}px ${family}`;
      ctx.textBaseline = "middle";
      // Whole device pixels per cell, so neighbouring cells never leave seams.
      const cw = Math.max(2, Math.round(ctx.measureText("M").width));
      const ch = Math.round(fs * 1.12);
      const cols = Math.ceil(canvas.width / cw);
      const rows = Math.ceil(canvas.height / ch);
      const n = cols * rows;

      // Spread from the thinking monkey; pull back into the realising one.
      const fr = frame.getBoundingClientRect();
      const centre = (panel: HTMLElement) => {
        const art = panel.querySelector(".ascii-art")?.getBoundingClientRect();
        return art
          ? { x: (art.left + art.width / 2 - fr.left) * dpr, y: (art.top + art.height / 2 - fr.top) * dpr }
          : { x: canvas.width / 2, y: canvas.height / 2 };
      };
      const A = centre(a);
      const B = centre(b);
      const far = (o: { x: number; y: number }) =>
        Math.max(Math.hypot(o.x, o.y), Math.hypot(canvas.width - o.x, o.y), Math.hypot(o.x, canvas.height - o.y), Math.hypot(canvas.width - o.x, canvas.height - o.y));
      const farA = far(A);
      const farB = far(B);

      const t1 = new Float32Array(n);
      const t2 = new Float32Array(n);
      const glyph = new Uint8Array(n);
      const ink = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const x = (i % cols) * cw + cw / 2;
        const y = ((i / cols) | 0) * ch + ch / 2;
        const dA = Math.hypot(x - A.x, y - A.y) / farA;
        const dB = Math.hypot(x - B.x, y - B.y) / farB;
        // Thresholds stay inside (0, 0.9) and (0.1, 1) so a finished wall has
        // no cells left in the bright band.
        t1[i] = 0.9 * clamp01(dA * 0.85 + Math.random() * 0.15);
        t2[i] = 0.1 + 0.899 * clamp01((1 - dB) * 0.85 + Math.random() * 0.15);
        glyph[i] = (Math.random() * NOISE.length) | 0;
        ink[i] = (Math.random() * INKS.length) | 0;
      }
      wall = { cols, rows, cw, ch, t1, t2, st: new Uint8Array(n), glyph, ink };
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      render(progress);
    };

    // A covered wall that never changes reads as a still image, so a few
    // cells swap glyphs each frame while any of it is up.
    const flicker = () => {
      if (!wall || progress <= COVER[0] || progress >= UNCOVER[1]) return;
      const n = wall.st.length;
      for (let k = (n / 70) | 0; k > 0; k--) {
        const i = (Math.random() * n) | 0;
        if (wall.st[i] !== 1) continue;
        wall.glyph[i] = (Math.random() * NOISE.length) | 0;
        paint(i, 1);
      }
    };
    gsap.ticker.add(flicker);

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });

    // The wall is built when the scene is about a screen and a half away,
    // then rebuilt if the frame changes size.
    let rebuild: gsap.core.Tween | null = null;
    const resized = new ResizeObserver(() => {
      rebuild?.kill();
      rebuild = gsap.delayedCall(0.15, build);
    });
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        near.disconnect();
        resized.observe(frame);
      },
      { rootMargin: "150% 0px" },
    );
    near.observe(root);
    render(st.progress);
    ScrollTrigger.refresh();

    return () => {
      near.disconnect();
      resized.disconnect();
      rebuild?.kill();
      gsap.ticker.remove(flicker);
      st.kill();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      a.style.opacity = "";
      b.style.opacity = "";
      click.style.opacity = "";
      click.textContent = CLICK;
    };
  }, [pinned]);

  return (
    <div ref={rootRef} className={pinned ? "story story--pinned" : "story"}>
      <div ref={frameRef} className="story-frame">
        <div ref={aRef} className="story-panel story-a">{first}</div>
        <p ref={clickRef} className="story-click" aria-hidden="true">{CLICK}</p>
        <div ref={bRef} className="story-panel story-b">{second}</div>
        <canvas ref={canvasRef} className="story-curtain" aria-hidden="true" />
      </div>
      {/* Scroll ranges for the nav's chapter readout (positioned in CSS) */}
      <span className="story-mark story-mark-q" aria-hidden="true" />
      <span className="story-mark story-mark-turn" aria-hidden="true" />
      <span className="story-mark story-mark-l" aria-hidden="true" />
    </div>
  );
}
