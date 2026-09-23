import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * ASCII morph: the thinking monkey erodes into pure noise and re-forms as the
 * realising monkey, scrubbed by scroll.
 *
 * Deliberately not WebGL. It's a single <pre> and one textContent write per
 * frame, which leaves the whole GPU budget to the ambient field.
 *
 * The thing that makes it cheap: both images are sampled to a luminance grid
 * once, on mount and on resize, and cached. Per frame we only read two cached
 * arrays, compare each cell against its fixed noise threshold and build one
 * string. At ~130x58 that is ~7.5k trivial ops — nothing.
 */

const RAMP = " .:-=+*#%@";
const NOISE_GLYPHS = "!<>-_\\/[]{}—=+*^?#01";
const MID_TEXT = "then it clicked";

type Grid = { cols: number; rows: number; a: Uint8Array; b: Uint8Array };

/** Draw an image into an offscreen canvas and read back per-cell luminance. */
function sampleImage(
  img: HTMLImageElement,
  cols: number,
  rows: number,
): Uint8Array {
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
  ctx.clearRect(0, 0, cols, rows);
  ctx.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h);

  const { data } = ctx.getImageData(0, 0, cols, rows);
  for (let i = 0; i < out.length; i++) {
    const o = i * 4;
    const alpha = data[o + 3] / 255;
    const lum =
      (0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]) / 255;
    // These are dark cutouts on transparency. Weighting by luminance alone put
    // most of the subject at the empty end of the ramp and the silhouette
    // vanished, so alpha carries the shape and luminance only modulates detail.
    out[i] = Math.round(255 * alpha * (0.34 + 0.66 * Math.pow(lum, 0.75)));
  }
  return out;
}

export default function AsciiMorph({
  from,
  to,
  className = "",
}: {
  from: string;
  to: string;
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gridRef = useRef<Grid | null>(null);
  const thresholdsRef = useRef<Float32Array>(new Float32Array(0));

  useEffect(() => {
    const section = sectionRef.current;
    const pre = preRef.current;
    if (!section || !pre) return;

    let disposed = false;
    let st: ScrollTrigger | null = null;

    const render = (p: number) => {
      const grid = gridRef.current;
      if (!grid || !preRef.current) return;
      const { cols, rows, a, b } = grid;
      const thresholds = thresholdsRef.current;

      // 0 -> 0.5 erode into noise, 0.5 -> 1 resolve into the second image.
      // The linear version never let a clean image show: by the time the stage
      // was on screen it was already mostly noise. Hold the image clean for the
      // first and last ~22% of the range, then erode.
      const dist = Math.abs(p - 0.5) * 2; // 0 at centre, 1 at the ends
      const t = Math.min(1, Math.max(0, (dist - 0.12) / (0.55 - 0.12)));
      const chaos = 1 - t * t * (3 - 2 * t);
      const showB = p > 0.5;
      const src = showB ? b : a;

      // The legible line surfaces in the static right at peak entropy.
      const midRow = Math.floor(rows / 2);
      const midStart = Math.floor((cols - MID_TEXT.length) / 2);
      const midVisible = chaos > 0.82;

      let out = "";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;

          if (midVisible && y === midRow && x >= midStart && x < midStart + MID_TEXT.length) {
            out += MID_TEXT[x - midStart];
            continue;
          }

          // Per-cell threshold gives a staggered, organic erosion instead of
          // every cell flipping on the same frame.
          if (chaos > thresholds[i]) {
            out += NOISE_GLYPHS[(i * 7 + ((p * 90) | 0)) % NOISE_GLYPHS.length];
          } else {
            const lum = src[i] / 255;
            out += RAMP[Math.min(RAMP.length - 1, (lum * RAMP.length) | 0)];
          }
        }
        out += "\n";
      }
      preRef.current.textContent = out;

      // Colour tracks the resolve: grey at peak noise, full teal at the ends.
      preRef.current.style.color = `rgba(0, 180, 216, ${0.28 + (1 - chaos) * 0.62})`;
      preRef.current.style.textShadow = chaos < 0.35 ? "0 0 22px rgba(0,180,216,0.35)" : "none";
    };

    const build = async () => {
      const el = preRef.current;
      if (!el) return;

      // Measure one character to derive the grid from the real font metrics.
      const cs = getComputedStyle(el);
      const probe = document.createElement("span");
      probe.textContent = "M";
      probe.style.cssText =
        "position:absolute;visibility:hidden;font-family:'DM Mono',monospace;";
      probe.style.fontSize = cs.fontSize;
      el.appendChild(probe);
      const charW = probe.getBoundingClientRect().width || 8;
      probe.remove();

      // Read the real line box rather than assuming a natural monospace aspect:
      // the stylesheet sets line-height to 0.58em, so deriving it from the glyph
      // width undercounted the rows and left the bottom third of the stage black.
      const lineH = parseFloat(cs.lineHeight) || charW / 0.55;
      const cols = Math.max(24, Math.min(190, Math.floor(el.clientWidth / charW)));
      const rows = Math.max(16, Math.min(170, Math.round(el.clientHeight / lineH)));

      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

      try {
        const [imgA, imgB] = await Promise.all([load(from), load(to)]);
        if (disposed) return;
        gridRef.current = {
          cols,
          rows,
          a: sampleImage(imgA, cols, rows),
          b: sampleImage(imgB, cols, rows),
        };
        const th = new Float32Array(cols * rows);
        for (let i = 0; i < th.length; i++) {
          // Bias thresholds by row so the erosion sweeps rather than fizzes.
          const y = Math.floor(i / cols) / rows;
          th[i] = Math.random() * 0.8 + y * 0.2;
        }
        thresholdsRef.current = th;

        if (prefersReducedMotion()) {
          render(1); // resolved end frame — a perfectly good still
          return;
        }

        // The stage holds with CSS sticky, so progress runs while it fills the
        // screen. Tied to enter->exit instead, peak noise landed when the stage
        // was centred and the clean images played out off-screen — backwards.
        st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
        });
        render(0);
      } catch {
        // Image decode failed — leave the block empty rather than throwing.
      }
    };

    build();

    const onResize = () => {
      gsap.delayedCall(0.2, build);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      st?.kill();
    };
  }, [from, to]);

  return (
    <div ref={sectionRef} aria-hidden="true" className={`ascii-morph relative ${className}`}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <pre
          ref={preRef}
          className="ascii-pre m-0 h-[86vh] w-full select-none whitespace-pre text-center"
        />
      </div>
    </div>
  );
}
