import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { fieldState } from "@/gl/AmbientField";

/**
 * Route transitions.
 *
 * Before this, /resume and /figma were plain <a href> hard navigations: white
 * flash, full reload, the ambient field destroyed and rebuilt. Now any internal
 * link is intercepted, a curtain wipes in, wouter swaps the route behind it,
 * and the curtain wipes out. The canvas survives the whole thing.
 */
export default function RouteTransition() {
  const [, navigate] = useLocation();
  const curtainRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    const curtain = curtainRef.current;
    const label = labelRef.current;
    if (!curtain || !label) return;

    const go = (href: string, title: string) => {
      if (busy.current) return;
      busy.current = true;

      if (prefersReducedMotion()) {
        navigate(href);
        window.scrollTo(0, 0);
        busy.current = false;
        return;
      }

      label.textContent = title;
      fieldState.intensity = 0.4;

      gsap
        .timeline({
          onComplete: () => {
            busy.current = false;
            fieldState.intensity = 1;
          },
        })
        .set(curtain, { display: "flex", transformOrigin: "bottom center", scaleY: 0 })
        .to(curtain, { scaleY: 1, duration: 0.55, ease: "expo.inOut" })
        .fromTo(label, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3 }, "-=0.2")
        .add(() => {
          navigate(href);
          window.scrollTo(0, 0);
        })
        .to(label, { opacity: 0, duration: 0.25 }, "+=0.15")
        .set(curtain, { transformOrigin: "top center" })
        .to(curtain, { scaleY: 0, duration: 0.6, ease: "expo.inOut" })
        .set(curtain, { display: "none" });
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!a) return;

      const href = a.getAttribute("href") ?? "";
      // Only internal page routes. Hashes, mailto/tel, downloads and anything
      // off-site keep their normal behaviour.
      if (!href.startsWith("/")) return;
      if (a.hasAttribute("download") || a.target === "_blank") return;
      if (href === window.location.pathname) return;

      e.preventDefault();
      go(href, a.dataset.transitionLabel ?? a.textContent?.trim().slice(0, 28) ?? "");
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[99998] hidden items-center justify-center bg-[#00B4D8]"
      style={{ transform: "scaleY(0)" }}
    >
      <span
        ref={labelRef}
        className="font-mono text-xs uppercase tracking-[0.4em] text-[#0a0a0a] opacity-0"
      />
    </div>
  );
}
