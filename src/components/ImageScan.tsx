import { useEffect } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Image hover: a laser scan, echoing the opening.
 *
 * Point at any picture and a thin teal laser line sweeps down it once,
 * leaving a short glowing trail. While you stay, a soft highlight follows the
 * pointer and the picture leans a few pixels towards it and grows 3%.
 *
 * The scan and the highlight live on an overlay laid exactly over the image
 * (same box, same transform) and masked by the image itself, so on cut-outs
 * they follow the silhouette instead of drawing a rectangle.
 *
 * One overlay at a time, created on hover and removed after. Fine pointers
 * only; nothing with reduced motion.
 */

const MIN_SIZE = 48; // ignore icons and tiny images

type Active = { img: HTMLImageElement; overlay: HTMLDivElement; scan: gsap.core.Tween };

export default function ImageScan() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;

    let active: Active | null = null;

    const overlayFor = (img: HTMLImageElement) => {
      const cs = getComputedStyle(img);
      const o = document.createElement("div");
      o.className = "img-scan";
      o.setAttribute("aria-hidden", "true");
      const src = `url("${img.currentSrc || img.src}")`;
      const fit = cs.objectFit === "contain" ? "contain" : cs.objectFit === "cover" ? "cover" : "100% 100%";
      const z = parseInt(cs.zIndex, 10);
      Object.assign(o.style, {
        left: `${img.offsetLeft}px`,
        top: `${img.offsetTop}px`,
        width: `${img.offsetWidth}px`,
        height: `${img.offsetHeight}px`,
        transform: cs.transform === "none" ? "" : cs.transform,
        transformOrigin: cs.transformOrigin,
        rotate: cs.rotate,
        zIndex: Number.isNaN(z) ? "1" : String(z + 1),
        maskImage: src,
        maskSize: fit,
        maskPosition: cs.objectPosition,
        maskRepeat: "no-repeat",
        webkitMaskImage: src,
        webkitMaskSize: fit,
        webkitMaskPosition: cs.objectPosition,
        webkitMaskRepeat: "no-repeat",
      });
      img.insertAdjacentElement("afterend", o);
      return o;
    };

    const lean = (img: HTMLImageElement, o: HTMLDivElement, e: PointerEvent) => {
      const r = img.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      o.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      o.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      const t = `${((px - 0.5) * 8).toFixed(1)}px ${((py - 0.5) * 8).toFixed(1)}px`;
      img.style.translate = o.style.translate = t;
    };

    const leave = () => {
      if (!active) return;
      const { img, overlay, scan } = active;
      active = null;
      scan.kill();
      img.style.scale = img.style.translate = "";
      overlay.style.scale = overlay.style.translate = "";
      overlay.classList.remove("on");
      window.setTimeout(() => {
        overlay.remove();
        if (active?.img !== img) img.classList.remove("img-scan-host");
      }, 650);
    };

    const onOver = (e: PointerEvent) => {
      const img = (e.target as Element | null)?.closest?.("img");
      if (!(img instanceof HTMLImageElement) || img === active?.img) return;
      if (img.offsetWidth < MIN_SIZE || img.offsetHeight < MIN_SIZE || img.closest("[data-no-scan]")) return;
      leave();
      const overlay = overlayFor(img);
      img.classList.add("img-scan-host");
      // one frame later, so the transitions have a starting point
      requestAnimationFrame(() => {
        overlay.classList.add("on");
        img.style.scale = overlay.style.scale = "1.03";
      });
      const scan = gsap.fromTo(overlay, { "--scan": "-12%" }, { "--scan": "118%", duration: 0.9, ease: "power2.inOut" });
      active = { img, overlay, scan };
      lean(img, overlay, e);
    };

    const onMove = (e: PointerEvent) => {
      if (active && e.target === active.img) lean(active.img, active.overlay, e);
    };

    const onOut = (e: PointerEvent) => {
      if (active && e.target === active.img && e.relatedTarget !== active.img) leave();
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      leave();
    };
  }, []);

  return null;
}
