import { useEffect, useRef } from "react";
import gsap from "gsap";
import { deviceTier } from "@/lib/motion";

/**
 * Cursor system.
 *
 * Three behaviours the old dot didn't have:
 *  - magnetism: elements marked [data-magnetic] pull toward the pointer and the
 *    ring snaps to their centre
 *  - context labels: [data-cursor="DRAG"] swaps the ring for a labelled disc
 *  - velocity stretch: the ring elongates along its direction of travel
 *
 * Skipped entirely on touch/low tier, where a custom cursor is dead weight.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (deviceTier() === 0) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.documentElement.classList.add("has-custom-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let prevX = mx;
    let prevY = my;

    let magnet: HTMLElement | null = null;

    const setX = gsap.quickSetter(ring, "x", "px");
    const setY = gsap.quickSetter(ring, "y", "px");
    const setDotX = gsap.quickSetter(dot, "x", "px");
    const setDotY = gsap.quickSetter(dot, "y", "px");

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;

      const el =
        (e.target as HTMLElement | null)?.closest<HTMLElement>(
          "[data-magnetic], a, button, [data-hover], [data-cursor]",
        ) ?? null;

      if (el !== magnet) {
        magnet = el;
        const cursorLabel = el?.dataset.cursor ?? "";
        label.textContent = cursorLabel;
        gsap.to(ring, {
          width: cursorLabel ? 74 : el ? 46 : 26,
          height: cursorLabel ? 74 : el ? 46 : 26,
          borderColor: el ? "rgba(0,180,216,0.9)" : "rgba(0,180,216,0.45)",
          backgroundColor: cursorLabel ? "rgba(0,180,216,0.12)" : "transparent",
          duration: 0.3,
          ease: "power3.out",
        });
        gsap.to(label, { opacity: cursorLabel ? 1 : 0, duration: 0.2 });
        gsap.to(dot, { opacity: cursorLabel ? 0 : 1, duration: 0.2 });
      }
    };

    const onLeave = () => {
      gsap.to([ring, dot], { opacity: 0, duration: 0.2 });
    };
    const onEnter = () => {
      gsap.to([ring, dot], { opacity: 1, duration: 0.2 });
    };

    const tick = () => {
      // Ring trails; dot is immediate. The gap is what reads as weight.
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;

      const vx = rx - prevX;
      const vy = ry - prevY;
      prevX = rx;
      prevY = ry;

      const speed = Math.min(Math.hypot(vx, vy), 40);
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;

      setX(rx);
      setY(ry);
      setDotX(mx);
      setDotY(my);

      // Stretch along the direction of travel.
      gsap.set(ring, {
        rotate: angle,
        scaleX: 1 + speed * 0.012,
        scaleY: 1 - speed * 0.006,
      });

      // Magnetic pull on the element itself.
      if (magnet && magnet.hasAttribute("data-magnetic")) {
        const r = magnet.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);
        const radius = Math.max(r.width, r.height) * 0.9 + 60;
        if (dist < radius) {
          const pull = (1 - dist / radius) * 0.35;
          gsap.to(magnet, {
            x: dx * pull,
            y: dy * pull,
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });
        } else {
          gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)", overwrite: "auto" });
        }
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    gsap.ticker.add(tick);

    // Release any element left mid-pull when the pointer leaves it.
    const onOut = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-magnetic]");
      if (el && el !== magnet) {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
      }
    };
    window.addEventListener("pointerout", onOut, { passive: true });

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] flex items-center justify-center rounded-full border"
        style={{
          width: 26,
          height: 26,
          marginLeft: -13,
          marginTop: -13,
          borderColor: "rgba(0,180,216,0.45)",
          willChange: "transform",
        }}
      >
        <span
          ref={labelRef}
          className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#00B4D8] opacity-0"
        />
      </div>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-[#00B4D8]"
        style={{ width: 5, height: 5, marginLeft: -2.5, marginTop: -2.5, willChange: "transform" }}
      />
    </>
  );
}
