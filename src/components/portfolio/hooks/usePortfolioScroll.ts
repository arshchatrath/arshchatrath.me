import { useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, deviceTier } from "@/lib/motion";
import { fieldState } from "@/gl/fieldState";
gsap.registerPlugin(ScrollTrigger);

export function usePortfolioScroll(progressRef: RefObject<HTMLDivElement | null>, skewables: RefObject<HTMLElement[]>, reduceMotion: boolean) {
  const lenisRef = useRef<Lenis | null>(null);
  // ── Lenis smooth scroll ───────────────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: !reduceMotion && deviceTier() === 2 });
    lenisRef.current = lenis;
    // Lenis moves the page on its own clock. Without this line ScrollTrigger
    // only hears native scroll events, so scrubbed/pinned effects never track
    // the real position — they look like they simply don't run.
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
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

    // Only lean sections that can actually be seen. Reuse tweens instead of
    // allocating a new tween for the entire page on every scroll event.
    const visible = new Set<HTMLElement>();
    const setters = new Map<HTMLElement, ReturnType<typeof gsap.quickTo>>();
    const observer = !reduceMotion && deviceTier() === 2 && window.matchMedia("(pointer: fine)").matches
      ? new IntersectionObserver((entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            const el = target as HTMLElement;
            if (isIntersecting) visible.add(el);
            else { visible.delete(el); setters.get(el)?.(0); }
          });
        })
      : null;
    if (observer) {
      document.querySelectorAll<HTMLElement>(".skewable").forEach((el) => {
        setters.set(el, gsap.quickTo(el, "skewY", { duration: 0.5, ease: EASE.out }));
        observer.observe(el);
      });
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
        visible.forEach((el) => setters.get(el)?.(v * 2.2));
      },
    });
    return () => {
      st.kill();
      observer?.disconnect();
      setters.forEach((set) => set.tween.kill());
    };
  }, []);
  return lenisRef;
}
