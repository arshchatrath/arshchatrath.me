import { useEffect, useId, useRef, useState } from "react";

const REVEAL_IMAGE = "/img/hero-reveal.png";
const MAIN_IMAGE = "/img/hero-blue-shirt.png";
const TRAIL_LIFETIME = 1800;
const MAX_STROKES = 90;
type Point = { x: number; y: number };
type Stroke = { node: SVGPathElement; born: number; width: number };
type Bit = { node: SVGTextElement; born: number; x: number; y: number; drift: number };

/** Complementary masks swap the cutouts without leaving the first face underneath. */
export default function HeroPortrait() {
  const id = useId().replace(/:/g, "");
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trailRef = useRef<SVGGElement>(null);
  const binaryRef = useRef<SVGGElement>(null);
  const [readyToReveal, setReadyToReveal] = useState(false);
  const [mainLoaded, setMainLoaded] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const svg = svgRef.current;
    const trail = trailRef.current;
    if (!host || !svg || !trail) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    let strokes: Stroke[] = [];
    let bits: Bit[] = [];
    let previous: Point | null = null;
    let frame = 0;
    let ready = false;
    let disposed = false;
    let lastStamp = 0;
    let lastBit = 0;
    const image = new Image();

    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
      strokes.forEach(({ node }) => node.remove());
      strokes = [];
      bits.forEach(({ node }) => node.remove());
      bits = [];
      host.style.setProperty("--portrait-x", "0px");
      host.style.setProperty("--portrait-y", "0px");
    };
    const sync = () => {
      clear();
      setReadyToReveal(ready && !motion.matches && pointer.matches);
      if (!motion.matches && pointer.matches && !image.src) image.src = REVEAL_IMAGE;
    };
    image.onload = () => {
      if (disposed) return;
      ready = true;
      setReadyToReveal(!motion.matches && pointer.matches);
    };

    const tick = (now: number) => {
      strokes = strokes.filter((stroke) => {
        const age = (now - stroke.born) / TRAIL_LIFETIME;
        if (age >= 1) {
          stroke.node.remove();
          return false;
        }
        // Hold the image briefly, then taper the brush back into the portrait.
        const fade = Math.max(0, (age - 0.3) / 0.7);
        stroke.node.setAttribute("stroke-width", String(stroke.width * (1 - fade * fade)));
        stroke.node.setAttribute("opacity", String(1 - fade * fade));
        return true;
      });
      bits = bits.filter((bit) => {
        const age = (now - bit.born) / 1600;
        if (age >= 1) {
          bit.node.remove();
          return false;
        }
        bit.node.setAttribute("opacity", String(0.17 * Math.sin(Math.PI * age) * (1 - age)));
        bit.node.setAttribute("x", String(bit.x + bit.drift * age));
        bit.node.setAttribute("y", String(bit.y + age * 75));
        return true;
      });
      frame = strokes.length || bits.length ? requestAnimationFrame(tick) : 0;
    };

    const paint = (d: string, width: number, now: number) => {
      const node = document.createElementNS("http://www.w3.org/2000/svg", "path");
      node.setAttribute("d", d);
      node.setAttribute("stroke-width", String(width));
      trail.appendChild(node);
      strokes.push({ node, born: now, width });
      if (strokes.length > MAX_STROKES) strokes.shift()?.node.remove();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const section = host.closest(".hero-section");
    const follow = (event: Event) => {
      const e = event as PointerEvent;
      if (motion.matches || !pointer.matches || e.pointerType === "touch") return;
      const rect = section!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      host.style.setProperty("--portrait-x", `${x.toFixed(2)}px`);
      host.style.setProperty("--portrait-y", `${y.toFixed(2)}px`);
    };
    const resetPosition = () => {
      host.style.setProperty("--portrait-x", "0px");
      host.style.setProperty("--portrait-y", "0px");
    };

    const move = (event: PointerEvent) => {
      if (!ready || motion.matches || !pointer.matches || event.pointerType === "touch") return;
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      // Inverse transform keeps the trail aligned during the entrance animation.
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const now = performance.now();
      // This separate SVG sits below both photographs, so digits never cover a face.
      if (binaryRef.current && now - lastBit > 45) {
        for (let i = 0; i < 3; i++) {
          const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
          const x = point.x + (Math.random() - 0.5) * 220;
          const y = point.y + (Math.random() - 0.5) * 130;
          node.textContent = Math.random() > 0.5 ? "1" : "0";
          node.setAttribute("x", String(x));
          node.setAttribute("y", String(y));
          node.setAttribute("opacity", "0");
          binaryRef.current.appendChild(node);
          bits.push({ node, born: now, x, y, drift: (Math.random() - 0.5) * 90 });
          if (bits.length > 90) bits.shift()?.node.remove();
        }
        lastBit = now;
      }
      if (previous && now - lastStamp < 12) return;
      const start = previous ?? point;
      const distance = Math.hypot(point.x - start.x, point.y - start.y);
      const width = 310 + Math.min(distance * 0.9, 150) + Math.sin(now * 0.008) * 25;
      paint(`M ${start.x} ${start.y} L ${point.x + 0.01} ${point.y}`, width, now);
      previous = point;
      lastStamp = now;
    };
    const leave = () => { previous = null; };
    const visibility = () => {
      host.dataset.active = String(!document.hidden);
      if (document.hidden) clear();
    };
    const observer = new IntersectionObserver(([entry]) => {
      host.dataset.visible = String(entry.isIntersecting);
      if (!entry.isIntersecting) clear();
    });
    observer.observe(host);
    sync();
    visibility();
    section?.addEventListener("pointermove", follow, { passive: true });
    section?.addEventListener("pointerleave", resetPosition);
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    motion.addEventListener("change", sync);
    pointer.addEventListener("change", sync);
    document.addEventListener("visibilitychange", visibility);

    return () => {
      disposed = true;
      image.onload = null;
      clear();
      section?.removeEventListener("pointermove", follow);
      section?.removeEventListener("pointerleave", resetPosition);
      observer.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      motion.removeEventListener("change", sync);
      pointer.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return (
    <div ref={hostRef} className="hero-portrait" data-cursor-brush data-no-scan data-reveal-ready={readyToReveal && mainLoaded}>
      <svg className="hero-contours" viewBox="0 0 1080 1440" fill="none" aria-hidden="true">
        <g className="hero-contours-outer">
          <path d="M 520 70 C 900 -40 1080 380 970 620 S 1170 1040 860 1300 S 80 1320 110 1000 S -80 410 220 180 S 410 110 520 70 Z" />
          <path d="M 520 140 C 840 70 1010 400 910 630 S 1080 1010 820 1220 S 160 1260 180 1000 S 20 450 280 260 S 430 180 520 140 Z" />
        </g>
        <g className="hero-contours-inner">
          <path d="M 550 240 C 830 180 940 470 840 670 S 990 990 750 1150 S 260 1180 270 940 S 150 480 350 340 S 460 270 550 240 Z" />
          <path className="hero-contour-tracer" d="M 520 70 C 900 -40 1080 380 970 620 S 1170 1040 860 1300 S 80 1320 110 1000 S -80 410 220 180 S 410 110 520 70 Z" pathLength="100" />
        </g>
      </svg>
      <div className="hero-portrait-aura" aria-hidden="true" />
      <div className="hero-silhouette hero-silhouette-one" aria-hidden="true" />
      <div className="hero-silhouette hero-silhouette-two" aria-hidden="true" />
      <svg className="hero-binary-trail" viewBox="0 0 1080 1440" aria-hidden="true">
        <g ref={binaryRef} />
      </svg>
      <img
        src={MAIN_IMAGE}
        width={1080}
        height={1440}
        alt="Arsh Chatrath speaking at a microphone"
        className="hero-portrait-base block w-full h-auto"
        fetchPriority="high"
        decoding="async"
        draggable={false}
      />
      <svg ref={svgRef} className="hero-portrait-reveal" viewBox="0 0 1080 1440" aria-hidden="true">
        <defs>
          <g id={`${id}-strokes`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <g ref={trailRef} />
            <path className="hero-idle-reveal" d="M 80 410 Q 490 220 1000 530" pathLength="1" />
            <path className="hero-idle-reveal hero-idle-reveal-second" d="M 160 950 Q 590 610 960 820" pathLength="1" />
          </g>
          <mask id={`${id}-trail`} maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1440" style={{ maskType: "luminance" }}>
            <use href={`#${id}-strokes`} color="white" />
          </mask>
          <mask id={`${id}-base`} maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1440" style={{ maskType: "luminance" }}>
            <rect width="1080" height="1440" fill="white" />
            <use href={`#${id}-strokes`} color="black" />
          </mask>
        </defs>
        <image className="hero-main-layer" href={MAIN_IMAGE} width="1080" height="1440" preserveAspectRatio="xMidYMid meet" mask={`url(#${id}-base)`} onLoad={() => setMainLoaded(true)} />
        <image href={REVEAL_IMAGE} x="-100" y="80" width="1280" height="1650" preserveAspectRatio="xMidYMin meet" mask={`url(#${id}-trail)`} />
      </svg>
      <span className="hero-reveal-hint" aria-hidden="true"><span /> Hover to discover</span>
    </div>
  );
}
