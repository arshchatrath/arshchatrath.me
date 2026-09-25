import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Binary rain for the right side of the hero: a quiet texture of 0s and 1s
 * falling behind the stamp. The canvas fades out towards the left (a CSS
 * mask), so it fills the empty side and never reaches the text.
 *
 * Kept deliberately subtle:
 *  - each column has a depth: far columns are smaller-looking (dimmer) and
 *    slower, near ones brighter and quicker, which reads as depth, not noise
 *  - only some columns are falling at any moment; the rest wait a while
 *  - heads are only a little brighter than their trails
 *
 * Trails fade by erasing a little of the whole canvas each tick
 * ("destination-out"), which keeps it transparent: the page shows through.
 * ~22 ticks a second at 1x pixel density, only while the hero is on screen,
 * only on wide screens (the layout with an empty right side), never with
 * reduced motion.
 */

const FS = 12; // glyph size, CSS px
const TICK_MS = 45;
const WIDE = "(min-width: 1024px), (orientation: landscape)";

type Drop = { row: number; speed: number; wait: number; char: string; head: string; body: string };

export default function BinaryRain({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || prefersReducedMotion()) return;

    const family = getComputedStyle(document.documentElement).getPropertyValue("--ff-mono").trim() || "monospace";
    let drops: Drop[] = [];
    let cw = 0;
    let ch = 0;
    let rows = 0;
    let raf = 0;
    let last = 0;
    let onScreen = false;

    const bit = () => (Math.random() < 0.5 ? "0" : "1");
    const reset = (d: Drop, first: boolean) => {
      const z = 0.3 + Math.random() * 0.7; // depth: 0.3 far .. 1 near
      d.row = first ? Math.random() * rows : -2;
      d.speed = (0.12 + Math.random() * 0.22) * (0.5 + z * 0.5); // cells per tick
      d.wait = first ? Math.random() * 40 : 10 + Math.random() * 90; // ticks before it falls
      d.char = bit();
      d.head = `rgba(170, 236, 250, ${(0.65 * z).toFixed(2)})`;
      d.body = `rgba(0, 180, 216, ${(0.48 * z).toFixed(2)})`;
    };

    const size = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      cw = Math.round(FS * 1.5);
      ch = Math.round(FS * 1.35);
      rows = Math.ceil(canvas.height / ch);
      ctx.font = `${FS}px ${family}`;
      ctx.textBaseline = "top";
      drops = Array.from({ length: Math.ceil(canvas.width / cw) }, () => {
        const d = { row: 0, speed: 0, wait: 0, char: "0", head: "", body: "" };
        reset(d, true);
        return d;
      });
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < TICK_MS) return;
      last = now;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.045)"; // lower = longer, softer trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      drops.forEach((d, i) => {
        if (d.wait > 0) {
          d.wait -= 1;
          return;
        }
        const before = Math.floor(d.row);
        d.row += d.speed;
        const after = Math.floor(d.row);
        if (after === before) return;
        const x = i * cw;
        // the old head settles into the trail...
        if (before >= 0) {
          ctx.clearRect(x, before * ch, cw, ch);
          ctx.fillStyle = d.body;
          ctx.fillText(d.char, x, before * ch);
        }
        // ...and a new bit lands below it
        d.char = bit();
        ctx.fillStyle = d.head;
        ctx.fillText(d.char, x, after * ch);
        if (after > rows) reset(d, false);
      });
    };

    const wide = window.matchMedia(WIDE);
    const sync = () => {
      const run = onScreen && wide.matches && !document.hidden;
      if (run && !raf) {
        if (!drops.length) size();
        canvas.style.opacity = "";
        raf = requestAnimationFrame(tick);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const seen = new IntersectionObserver((entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      sync();
    });
    seen.observe(canvas);
    const resized = new ResizeObserver(() => {
      if (drops.length) size();
    });
    resized.observe(canvas);
    wide.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelAnimationFrame(raf);
      seen.disconnect();
      resized.disconnect();
      wide.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`binary-rain ${className}`} style={{ opacity: 0 }} />;
}
