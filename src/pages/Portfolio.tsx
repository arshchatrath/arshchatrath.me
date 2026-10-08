import { useEffect, useRef, useState } from "react";
import { usePageMeta } from "@/lib/page-meta";
import Preloader from "@/components/Preloader";
import PortfolioNavigation from "@/components/portfolio/PortfolioNavigation";
import HeroSection from "@/components/portfolio/HeroSection";
import AboutSection from "@/components/portfolio/AboutSection";
import StorySection from "@/components/portfolio/StorySection";
import WorkSection from "@/components/portfolio/WorkSection";
import XFactorSection from "@/components/portfolio/XFactorSection";
import FaqSection from "@/components/portfolio/FaqSection";
import ContactSection from "@/components/portfolio/ContactSection";
import { useHeroAnimation } from "@/components/portfolio/hooks/useHeroAnimation";
import { useSectionAnimations } from "@/components/portfolio/hooks/useSectionAnimations";
import { usePortfolioScroll } from "@/components/portfolio/hooks/usePortfolioScroll";
import portfolioStyles from "@/components/portfolio/portfolio.css?inline";

export default function Portfolio() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(false);
  // true when the laser opening has already put the name on screen
  const nameEngraved = useRef(false);
  // Separate from `intro`: the hero starts at the loader's snap, but the
  // overlay has to stay mounted until its columns have finished lifting.
  const [loaderGone, setLoaderGone] = useState(false);
  // True once the loader is gone and the browser has a free moment. The rest
  // of the page's animations are built then, not at the hand-over: building
  // all ten sections at once froze a slow phone for ~0.5s right as the loader
  // faded, so the fade skipped straight to its end.
  const [pageReady, setPageReady] = useState(false);
  const skewables = useRef<HTMLElement[]>([]);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  usePageMeta(
    "Arsh Chatrath · Product & Growth Builder",
    "Founding Product & Growth Associate at Talkeys (8,000+ users). Led Helix to 12,000+ registrations. ₹8.5L+ revenue for Perplexity. Seeking product & growth internships.",
    "/",
  );

  // The page reveal is gated on the preloader finishing. If that timeline ever
  // stalls, every `.opacity-0` element would stay hidden forever — so force the
  // gate open after a beat no matter what.
  useEffect(() => {
    const t = setTimeout(() => {
      setIntro(true);
      setLoaderGone(true);
    }, 9000);
    return () => clearTimeout(t);
  }, []);
  // Build the rest of the page once the loader has gone, in the browser's
  // next idle moment (with a ceiling, so a busy device still gets it soon).
  useEffect(() => {
    if (!loaderGone) return;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setPageReady(true), { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(() => setPageReady(true), 150);
    return () => window.clearTimeout(t);
  }, [loaderGone]);
  const lenisRef = usePortfolioScroll(progressRef, skewables, reduceMotion);
  useHeroAnimation(intro, nameEngraved);
  useSectionAnimations(pageReady, containerRef, skewables);

  return (
    <>
      {!loaderGone && (
        <Preloader
          onReveal={(engraved) => {
            nameEngraved.current = engraved;
            setIntro(true);
          }}
          onDone={() => setLoaderGone(true)}
        />
      )}

      <div
        ref={containerRef}
        className="text-[#f5f0e8] min-h-screen relative overflow-x-clip"
      >
        {/* Scroll progress */}
        <div ref={progressRef} className="fixed top-0 left-0 w-full h-[2px] bg-[#00B4D8] z-[9997] origin-left pointer-events-none" />

        <PortfolioNavigation lenisRef={lenisRef} />
        <HeroSection lenisRef={lenisRef} />
        <AboutSection />
        <StorySection />
        <WorkSection lenisRef={lenisRef} />
        <XFactorSection />
        <FaqSection />
        <ContactSection reduceMotion={reduceMotion} />
        {/* Keep page-specific styles mounted only while this route is active. */}
        <style>{portfolioStyles}</style>
      </div>
    </>
  );
}
