import { useEffect, useRef } from "react";
import gsap from "gsap";
import { deviceTier } from "@/lib/motion";

/**
 * Cursor system.
 *
 * Over text, the ring becomes a highlighter: a cream disc blended with
 * "difference", so the letters under it invert (cream text turns dark on a
 * light disc). Anywhere else it stays a plain teal ring. The dot stays teal.
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
    let onText = false;
    let seen = false;

    const setX = gsap.quickSetter(ring, "x", "px");
    const setY = gsap.quickSetter(ring, "y", "px");
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

      const el =
        (e.target as HTMLElement | null)?.closest<HTMLElement>(
          "[data-magnetic], a, button, [data-hover], [data-cursor]",
        ) ?? null;
      const cursorLabel = el?.dataset.cursor ?? "";
      // A labelled disc can't invert (its label would too).
      const text = !cursorLabel && overText(mx, my);

      if (el !== magnet || text !== onText) {
        magnet = el;
        onText = text;
        label.textContent = cursorLabel;
        if (text) {
          ring.style.mixBlendMode = "difference";
        } else {
          // leaving text: drop the fill at once so it never flashes as a
          // solid cream disc on its way out
          ring.style.mixBlendMode = "normal";
          gsap.set(ring, { backgroundColor: cursorLabel ? "rgba(0,180,216,0.12)" : "rgba(245,240,232,0)" });
        }
        gsap.to(ring, {
          width: cursorLabel ? 74 : text ? (el ? 58 : 38) : el ? 46 : 26,
          height: cursorLabel ? 74 : text ? (el ? 58 : 38) : el ? 46 : 26,
          borderColor: text ? "rgba(0,180,216,0)" : el ? "rgba(0,180,216,0.9)" : "rgba(0,180,216,0.45)",
          backgroundColor: cursorLabel ? "rgba(0,180,216,0.12)" : text ? "rgba(245,240,232,1)" : "rgba(245,240,232,0)",
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
      if (seen) gsap.to([ring, dot], { opacity: 1, duration: 0.2 });
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
          // centred with a percentage, so it stays centred as it grows
          translate: "-50% -50%",
          borderColor: "rgba(0,180,216,0.45)",
          backgroundColor: "rgba(245,240,232,0)",
          opacity: 0,
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
        style={{ width: 5, height: 5, marginLeft: -2.5, marginTop: -2.5, opacity: 0, willChange: "transform" }}
      />
    </>
  );
}
