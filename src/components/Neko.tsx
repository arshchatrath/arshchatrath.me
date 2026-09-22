import { useEffect, useRef } from "react";
import nekoSprite from "@imgs/oneko.gif";

/**
 * Oneko — the cat that chases the cursor.
 *
 * Sprite sheet is the original `oneko` bitmap (256x128, sixteen 32x32 frames),
 * which descends from the 1989 NEC PC-9801 `NEKO.COM` and is public domain.
 * Behaviour follows the classic script: the cat runs toward the pointer, and
 * when it catches up it idles, washes itself, gets tired and falls asleep.
 *
 * Tinted to the site palette rather than left as the raw black sprite, which
 * would be invisible on a near-black page.
 */

const SPRITES: Record<string, [number, number][]> = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [
    [-5, 0],
    [-6, 0],
    [-7, 0],
  ],
  scratchWallN: [
    [0, 0],
    [0, -1],
  ],
  scratchWallS: [
    [-7, -1],
    [-6, -2],
  ],
  scratchWallE: [
    [-2, -2],
    [-2, -3],
  ],
  scratchWallW: [
    [-4, 0],
    [-4, -1],
  ],
  tired: [[-3, -2]],
  sleeping: [
    [-2, 0],
    [-2, -1],
  ],
  N: [
    [-1, -2],
    [-1, -3],
  ],
  NE: [
    [0, -2],
    [0, -3],
  ],
  E: [
    [-3, 0],
    [-3, -1],
  ],
  SE: [
    [-5, -1],
    [-5, -2],
  ],
  S: [
    [-6, -3],
    [-7, -2],
  ],
  SW: [
    [-5, -3],
    [-6, -1],
  ],
  W: [
    [-4, -2],
    [-4, -3],
  ],
  NW: [
    [-1, 0],
    [-1, -1],
  ],
};

const SPEED = 10;
const FRAME_MS = 100;

export default function Neko() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // No pointer to chase, and it would sit stranded in a corner.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let nekoX = window.innerWidth - 120;
    let nekoY = window.innerHeight - 120;
    let mouseX = nekoX;
    let mouseY = nekoY;

    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation: string | null = null;
    let idleFrame = 0;
    let lastFrame = 0;
    let raf = 0;

    const setSprite = (name: string, frame: number) => {
      const set = SPRITES[name];
      const [x, y] = set[frame % set.length];
      el.style.backgroundPosition = `${x * 32}px ${y * 32}px`;
    };

    const resetIdle = () => {
      idleAnimation = null;
      idleFrame = 0;
    };

    const idle = () => {
      idleTime += 1;

      // Occasionally pick something to do while waiting.
      if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation === null) {
        const options = ["sleeping", "scratchSelf"];
        if (nekoX < 32) options.push("scratchWallW");
        if (nekoY < 32) options.push("scratchWallN");
        if (nekoX > window.innerWidth - 32) options.push("scratchWallE");
        if (nekoY > window.innerHeight - 32) options.push("scratchWallS");
        idleAnimation = options[Math.floor(Math.random() * options.length)];
      }

      switch (idleAnimation) {
        case "sleeping":
          if (idleFrame < 8) {
            setSprite("tired", 0);
            break;
          }
          setSprite("sleeping", Math.floor(idleFrame / 4));
          if (idleFrame > 192) resetIdle();
          break;
        case "scratchWallN":
        case "scratchWallS":
        case "scratchWallE":
        case "scratchWallW":
        case "scratchSelf":
          setSprite(idleAnimation, idleFrame);
          if (idleFrame > 9) resetIdle();
          break;
        default:
          setSprite("idle", 0);
          return;
      }
      idleFrame += 1;
    };

    const step = () => {
      frameCount += 1;
      const diffX = nekoX - mouseX;
      const diffY = nekoY - mouseY;
      const distance = Math.hypot(diffX, diffY);

      // Close enough — settle down.
      if (distance < SPEED || distance < 48) {
        idle();
        return;
      }

      resetIdle();
      idleTime = 0;

      if (idleAnimation === null) {
        let direction = diffY / distance > 0.5 ? "N" : "";
        direction += diffY / distance < -0.5 ? "S" : "";
        direction += diffX / distance > 0.5 ? "W" : "";
        direction += diffX / distance < -0.5 ? "E" : "";
        setSprite(direction || "idle", frameCount);
      }

      nekoX -= (diffX / distance) * SPEED;
      nekoY -= (diffY / distance) * SPEED;
      nekoX = Math.min(Math.max(16, nekoX), window.innerWidth - 16);
      nekoY = Math.min(Math.max(16, nekoY), window.innerHeight - 16);

      el.style.transform = `translate3d(${nekoX - 16}px, ${nekoY - 16}px, 0)`;
    };

    // The sprite animates at 10fps by design — running it at display rate makes
    // it look like it's skating rather than trotting.
    const loop = (now: number) => {
      if (now - lastFrame >= FRAME_MS) {
        lastFrame = now;
        step();
        el.style.transform = `translate3d(${nekoX - 16}px, ${nekoY - 16}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    el.style.transform = `translate3d(${nekoX - 16}px, ${nekoY - 16}px, 0)`;
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9996]"
      style={{
        width: 32,
        height: 32,
        imageRendering: "pixelated",
        backgroundImage: `url(${nekoSprite})`,
        // The raw sprite is a black cat — invisible on a near-black page.
        filter: "invert(1) drop-shadow(0 0 6px rgba(0,180,216,0.5))",
        willChange: "transform",
      }}
    />
  );
}
