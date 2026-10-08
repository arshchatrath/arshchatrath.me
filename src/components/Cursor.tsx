import { useEffect, useRef } from "react";
import gsap from "gsap";
import { deviceTier } from "@/lib/motion";

/**
 * Cursor system.
 *
 * Over text, a highlighter grows out of the ring: a cream disc blended with
 * "difference", so the letters under it invert (cream text turns dark on a
 * light disc). It lives on its own layer that is always blended, so it can
 * grow in and shrink away smoothly instead of switching; a short grace period
 * keeps it from flickering across the gaps between words. Anywhere else the
 * cursor is a plain teal ring. The dot stays teal.
 *
 * Three behaviours the old dot didn't have:
 *  - magnetism: elements marked [data-magnetic] pull toward the pointer and the
 *    ring snaps to their centre
 *  - context labels: [data-cursor="DRAG"] swaps the ring for a labelled disc
 *  - velocity stretch: the ring elongates along its direction of travel
 *
 * Skipped entirely on touch/low tier, where a custom cursor is dead weight.
 */
/** Is the point over an actual glyph (not just inside a text element's box)? */
function overText(x: number, y: number): boolean {
  type CaretDoc = Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const d = document as CaretDoc;
  let node: Node | null = null;
  let offset = 0;
  if (d.caretPositionFromPoint) {
    const p = d.caretPositionFromPoint(x, y);
    node = p?.offsetNode ?? null;
    offset = p?.offset ?? 0;
  } else if (d.caretRangeFromPoint) {
    const r = d.caretRangeFromPoint(x, y);
    node = r?.startContainer ?? null;
    offset = r?.startOffset ?? 0;
  }
  if (!node || node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) return false;
  // The caret lands next to the nearest letter even in empty space beside a
  // line, so check the letters either side of it actually contain the point.
  const len = node.textContent.length;
  const range = document.createRange();
  range.setStart(node, Math.max(0, offset - 1));
  range.setEnd(node, Math.min(len, offset + 1));
  const pad = 3;
  return [...range.getClientRects()].some(
    (r) => x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad,
  );
}

const TEXT_GRACE_MS = 140;

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (deviceTier() === 0) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const fill = fillRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !fill || !label) return;

    document.documentElement.classList.add("has-custom-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let prevX = mx;
    let prevY = my;

    let magnet: HTMLElement | null = null;
    let onText = false;
    let lastTextAt = -Infinity;
    let seen = false;
    let onBrush = false;
    let fluidAngle = 0;
    let stretch = 0;
    let stretchVelocity = 0;
    let shear = 0;
    let shearVelocity = 0;
    let lastTick = performance.now();

    // Centre both on the pointer through GSAP itself. A CSS translate got
    // folded into GSAP's transform when it first read each element, and the
    // highlighter was 0px wide at that moment, so it lost its centring.
    gsap.set([ring, fill], { xPercent: -50, yPercent: -50 });
    const setX = gsap.quickSetter([ring, fill], "x", "px");
    const setY = gsap.quickSetter([ring, fill], "y", "px");
    const setDotX = gsap.quickSetter(dot, "x", "px");
    const setDotY = gsap.quickSetter(dot, "y", "px");

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;

      // First contact: appear under the pointer rather than flying in from
      // wherever the ring was parked.
      if (!seen) {
        seen = true;
        rx = prevX = mx;
        ry = prevY = my;
        gsap.to([ring, dot], { opacity: 1, duration: 0.3, ease: "power2.out" });
      }

      const now = performance.now();
      const brushHost = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor-brush]") ?? null;
      const brush = !!brushHost;

      const el =
        (e.target as HTMLElement | null)?.closest<HTMLElement>(
          "[data-magnetic], a, button, [data-hover], [data-cursor]",
        ) ?? null;
      const cursorLabel = el?.dataset.cursor ?? "";
      // A labelled disc can't invert (its label would too).
      const hit = !brush && !cursorLabel && overText(mx, my);
      if (hit) lastTextAt = now;
      // grace period: crossing the gap between two words isn't leaving text
      const text = !brush && (hit || (!cursorLabel && now - lastTextAt < TEXT_GRACE_MS));

      if (el !== magnet || text !== onText || brush !== onBrush) {
        magnet = el;
        onText = text;
        onBrush = brush;
        if (brush) lastTextAt = -Infinity;
        ring.dataset.brush = String(brush);
        label.textContent = cursorLabel;
        const size = brush ? Math.max(64, Math.min(150, brushHost!.getBoundingClientRect().width * 310 / 1080)) : cursorLabel ? 74 : text ? (el ? 58 : 40) : el ? 46 : 26;
        ring.style.backgroundImage = brush
          ? "radial-gradient(ellipse at 30% 32%, rgba(42,80,134,0.32), transparent 68%), radial-gradient(ellipse at 75% 70%, rgba(7,23,56,0.3), transparent 72%)"
          : "none";
        gsap.to(ring, {
          width: size,
          height: size,
          borderColor: brush ? "rgba(74,116,167,0)" : text ? "rgba(0,180,216,0)" : el ? "rgba(0,180,216,0.9)" : "rgba(0,180,216,0.45)",
          backgroundColor: brush ? "rgba(9,31,70,0.44)" : cursorLabel ? "rgba(0,180,216,0.12)" : "rgba(0,180,216,0)",
          ...(brush ? {} : { borderRadius: "50%" }),
          filter: brush ? "blur(0.7px)" : "blur(0px)",
          boxShadow: brush ? "inset 0 0 16px rgba(24,60,105,0.22), 0 0 10px rgba(9,31,70,0.12)" : "inset 0 0 0 rgba(24,60,105,0), 0 0 0 rgba(9,31,70,0)",
          duration: brush ? 0.32 : 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
        // the highlighter grows out of the dot, or melts back into it
        gsap.to(fill, {
          width: text ? size : 0,
          height: text ? size : 0,
          opacity: text ? 1 : 0,
          duration: text ? 0.7 : 0.6,
          ease: text ? "power2.out" : "power2.inOut",
          overwrite: "auto",
        });
        gsap.to(label, { opacity: cursorLabel ? 1 : 0, duration: 0.25 });
        gsap.to(dot, { opacity: cursorLabel || brush ? 0 : 1, duration: 0.25, overwrite: "auto" });
      }
    };

    // Resting on a gap between words sends no more pointer moves, so let the
    // grace period run out on its own.
    const graceCheck = window.setInterval(() => {
      if (!onText || performance.now() - lastTextAt < TEXT_GRACE_MS) return;
      if (overText(mx, my)) {
        lastTextAt = performance.now();
        return;
      }
      onText = false;
      const size = magnet ? 46 : 26;
      gsap.to(ring, { width: size, height: size, borderColor: magnet ? "rgba(0,180,216,0.9)" : "rgba(0,180,216,0.45)", duration: 0.55, ease: "power3.out", overwrite: "auto" });
      gsap.to(fill, { width: 0, height: 0, opacity: 0, duration: 0.6, ease: "power2.inOut", overwrite: "auto" });
    }, 120);

    const onLeave = () => {
      gsap.to([ring, dot], { opacity: 0, duration: 0.2 });
      onText = false;
      lastTextAt = -Infinity;
      gsap.to(fill, { width: 0, height: 0, opacity: 0, duration: 0.3, overwrite: "auto" });
    };
    const onEnter = () => {
      if (seen) {
        gsap.to(ring, { opacity: 1, duration: 0.2 });
        gsap.to(dot, { opacity: onBrush ? 0 : 1, duration: 0.2 });
      }
    };

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(Math.max((now - lastTick) / 1000, 1 / 240), 0.032);
      lastTick = now;
      // Ring trails; dot is immediate. The gap is what reads as weight.
      const follow = onBrush ? 1 - Math.exp(-13 * dt) : 0.16;
      rx += (mx - rx) * follow;
      ry += (my - ry) * follow;

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

      if (onBrush) {
        // Soft springs retain momentum after the pointer stops. A brief overshoot
        // makes the blob recoil, then settle over roughly 1–2 seconds.
        const motionSpeed = Math.min(Math.hypot(vx, vy) / (dt * 60), 40);
        const turn = gsap.utils.wrap(-180, 180, angle - fluidAngle);
        if (motionSpeed > 0.2) fluidAngle += turn * (1 - Math.exp(-5 * dt));
        const targetStretch = Math.min(motionSpeed / 27, 1.15);
        const targetShear = motionSpeed > 0.5 ? gsap.utils.clamp(-0.55, 0.55, turn / 160) : 0;
        // Small substeps keep the spring stable on slower displays.
        const steps = Math.ceil(dt / (1 / 120));
        const step = dt / steps;
        for (let i = 0; i < steps; i++) {
          stretchVelocity += ((targetStretch - stretch) * 30 - stretchVelocity * 6) * step;
          stretch += stretchVelocity * step;
          shearVelocity += ((targetShear - shear) * 24 - shearVelocity * 5.5) * step;
          shear += shearVelocity * step;
        }
        const t = now / 1000;
        const wobble = 2 + Math.min(Math.abs(stretchVelocity) * 3 + Math.abs(stretch) * 12, 20);
        const a = 48 + Math.sin(t * 2.1) * wobble + shear * 12;
        const b = 52 + Math.cos(t * 1.7 + 1) * wobble;
        const c = 46 + Math.sin(t * 1.8 + 2) * wobble;
        const d = 54 + Math.cos(t * 2.3) * wobble - shear * 12;
        ring.style.borderRadius = `${a}% ${100 - a}% ${b}% ${100 - b}% / ${c}% ${d}% ${100 - d}% ${100 - c}%`;
        gsap.set(ring, {
          rotate: fluidAngle,
          scaleX: Math.max(0.8, 1 + stretch * 0.8),
          scaleY: Math.max(0.55, 1 - stretch * 0.3),
          skewX: shear * 24,
        });
      } else {
        fluidAngle = angle;
        stretch = stretchVelocity = shear = shearVelocity = 0;
        gsap.set([ring, fill], {
          rotate: angle,
          scaleX: 1 + speed * 0.012,
          scaleY: 1 - speed * 0.006,
          skewX: 0,
        });
      }

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
      window.clearInterval(graceCheck);
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
          borderColor: "rgba(0,180,216,0.45)",
          opacity: 0,
          willChange: "transform",
        }}
      >
        <span
          ref={labelRef}
          className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#00B4D8] opacity-0"
        />
      </div>
      {/* The text highlighter: its own always-blended layer, so it can grow
          and shrink smoothly. Sits under the ring and the dot. */}
      <div
        ref={fillRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full"
        style={{
          width: 0,
          height: 0,
          backgroundColor: "#f5f0e8",
          mixBlendMode: "difference",
          opacity: 0,
          willChange: "transform",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-[#00B4D8]"
        style={{ width: 5, height: 5, marginLeft: -2.5, marginTop: -2.5, opacity: 0, willChange: "transform" }}
      />
    </>
  );
}
