import { useEffect, useRef } from "react";
import gsap from "gsap";
import { EASE, prefersReducedMotion } from "@/lib/motion";
import { fieldState } from "@/gl/AmbientField";

/**
 * The opening statement.
 *
 * A 00 -> 100 counter runs while the letters of the name sit scattered and
 * rotated — the field is at maximum chaos and you can see it. On 100 the
 * letters snap to the baseline, a teal wipe clears the overlay, and the hero
 * takes over. One continuous move from first paint to hero; no separate fade.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Hold the page still while the loader owns the screen.
    document.body.style.overflow = "hidden";
    const release = () => {
      document.body.style.overflow = "";
      onDone();
    };

    if (prefersReducedMotion()) {
      gsap.set(root, { autoAlpha: 0 });
      fieldState.intensity = 1;
      release();
      return;
    }

    const letters = lettersRef.current?.querySelectorAll<HTMLElement>(".pl-char") ?? [];
    const counter = { v: 0 };
    fieldState.intensity = 0.35;

    const tl = gsap.timeline({ onComplete: release });

    // Letters start scattered: chaos, stated literally.
    tl.set(letters, {
      y: () => gsap.utils.random(-140, 140),
      x: () => gsap.utils.random(-70, 70),
      rotate: () => gsap.utils.random(-70, 70),
      opacity: 0,
      filter: "blur(10px)",
    })
      .to(letters, {
        opacity: 1,
        duration: 0.5,
        stagger: { each: 0.02, from: "random" },
        ease: EASE.out,
      }, 0)
      // The count is the clock everything else is pinned to.
      .to(counter, {
        v: 100,
        duration: 1.9,
        ease: "power1.inOut",
        onUpdate: () => {
          if (countRef.current) {
            countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
          }
          // The field calms in step with the count.
          fieldState.intensity = 0.35 + (counter.v / 100) * 0.65;
        },
      }, 0)
      // 100: everything snaps into the grid.
      .to(letters, {
        x: 0,
        y: 0,
        rotate: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "expo.out",
        stagger: { each: 0.025, from: "center" },
      }, 1.55)
      .to([countRef.current, ".pl-label"], {
        opacity: 0,
        y: -14,
        duration: 0.4,
        ease: EASE.in,
      }, 2.2)
      // Teal wipe hands off to the hero.
      .set(wipeRef.current, { transformOrigin: "bottom center" })
      .fromTo(wipeRef.current,
        { scaleY: 0, transformOrigin: "bottom center" },
        { scaleY: 1, duration: 0.5, ease: "expo.inOut" }, 2.45)
      .set(root, { backgroundColor: "transparent" })
      .set(letters, { opacity: 0 })
      .fromTo(wipeRef.current,
        { transformOrigin: "top center", scaleY: 1 },
        { scaleY: 0, duration: 0.6, ease: "expo.inOut" }, ">")
      .set(root, { autoAlpha: 0 });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [onDone]);

  const NAME = "ARSH CHATRATH";

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#0a0a0a]"
    >
      <div
        ref={lettersRef}
        className="flex flex-nowrap justify-center px-4"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          fontSize: "clamp(1.5rem, 6vw, 6rem)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {NAME.split("").map((ch, i) =>
          ch === " " ? (
            <span key={i} className="pl-char inline-block" style={{ width: "0.3em" }} />
          ) : (
            <span key={i} className="pl-char inline-block text-[#f5f0e8]">
              {ch}
            </span>
          ),
        )}
      </div>

      <div className="pl-label absolute bottom-10 left-6 font-mono text-[10px] uppercase tracking-[0.4em] text-[#f5f0e8]/40 md:left-16">
        loading
      </div>
      <span
        ref={countRef}
        className="absolute bottom-10 right-6 font-mono text-[10px] tracking-[0.3em] text-[#00B4D8] md:right-16"
      >
        000
      </span>

      <div
        ref={wipeRef}
        className="pointer-events-none absolute inset-0 origin-bottom bg-[#00B4D8]"
        style={{ transform: "scaleY(0)" }}
      />
    </div>
  );
}
