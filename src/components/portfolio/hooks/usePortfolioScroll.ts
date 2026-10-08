import { useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE } from "@/lib/motion";
import { fieldState } from "@/gl/fieldState";
gsap.registerPlugin(ScrollTrigger);

export function usePortfolioScroll(progressRef: RefObject<HTMLDivElement | null>, skewables: RefObject<HTMLElement[]>, reduceMotion: boolean) {
  const lenisRef = useRef<Lenis | null>(null);
  // ── Lenis smooth scroll ───────────────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;
    // Lenis moves the page on its own clock. Without this line ScrollTrigger
    // only hears native scroll events, so scrubbed/pinned effects never track
    // the real position — they look like they simply don't run.
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // ── Scroll progress + the global order/velocity signal ────────────────────
  // uOrder is the spine of the whole site: 0 at the top, 1 at the bottom. The
  // ambient field reads it and resolves from turbulent to laminar as you read.
  useEffect(() => {
    if (progressRef.current) {
      gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "left center" });
    }

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress });
        fieldState.order = self.progress;
        // Normalised, clamped scroll velocity — drives the field, the marquee
        // and the global skew.
        const v = gsap.utils.clamp(-1, 1, self.getVelocity() / 2600);
        fieldState.velocity = v;
        if (!reduceMotion && skewables.current.length) {
          gsap.to(skewables.current, {
            skewY: v * 2.2,
            duration: 0.5,
            ease: EASE.out,
            overwrite: "auto",
          });
        }
      },
    });
    return () => st.kill();
  }, []);
  return lenisRef;
}
