import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, DUR, STAGGER, prefersReducedMotion } from "@/lib/motion";
import { SplitText } from "gsap/SplitText";
import { fieldState } from "@/gl/fieldState";
import { VENN_CIRC } from "../animation-constants";
gsap.registerPlugin(ScrollTrigger, SplitText);

export function useSectionAnimations(pageReady: boolean, containerRef: RefObject<HTMLDivElement | null>, skewables: RefObject<HTMLElement[]>) {
  // ── All GSAP animations ───────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    if (!pageReady) return; // built once the loader has gone (see pageReady)

    // Sections that lean with scroll velocity. Cheap, and it's what makes the
    // page feel like it has mass rather than snapping between states.
    skewables.current = gsap.utils.toArray<HTMLElement>(".skewable");

    // Reduced motion: reveal everything at rest instead of animating it in.
    // Without this, every `.opacity-0` element stays invisible forever.
    if (prefersReducedMotion()) {
      // Reveal content only. A blanket reveal also un-hid the FAQ cards'
      // folded/unfolded text (overlapping), which is meant to stay hidden.
      const root = containerRef.current;
      const content = gsap.utils
        .toArray<HTMLElement>(root.querySelectorAll(".opacity-0, .hire-w0, .hire-w1, .hire-w2"))
        .filter((el) => !el.parentElement?.closest(".faq-card"));
      gsap.set(content, { opacity: 1 });
      gsap.set(".venn-c1, .venn-c2, .venn-c3", { opacity: 1, attr: { strokeDashoffset: 0 } });
      return;
    }

    const context = gsap.context(() => {
    const listeners: Array<() => void> = [];
    const listen = (el: Element, event: string, handler: EventListener) => {
      el.addEventListener(event, handler);
      listeners.push(() => el.removeEventListener(event, handler));
    };
    // ── Section headings: masked per-line reveal ────────────────────────────
    // SplitText with autoSplit re-splits on resize, so lines stay correct when
    // the layout reflows. This replaces the old whole-block fade.
    const splits: SplitText[] = [];
    document.querySelectorAll<HTMLElement>(".reveal-heading").forEach(el => {
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        aria: "none",
        linesClass: "reveal-line",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 115,
            rotate: 2,
            duration: DUR.slow,
            ease: EASE.out,
            stagger: STAGGER.base,
            scrollTrigger: { trigger: el.closest(".reveal-wrap") ?? el, start: "top 85%" },
          });
        },
      });
      splits.push(split);
    });

    // Body copy gets the same grammar, one notch quieter.
    document.querySelectorAll<HTMLElement>(".reveal-copy").forEach(el => {
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        aria: "none",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 100,
            opacity: 0,
            duration: DUR.base,
            ease: EASE.out,
            stagger: STAGGER.tight,
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        },
      });
      splits.push(split);
    });

    // ── SECTION 2: Hello I'm Arsh ───────────────────────────────────────────
    // the text sits on the right now, so it slides in from the right
    gsap.fromTo(".about-left",
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.9, scrollTrigger: { trigger: ".about-section", start: "top 70%" } }
    );
    // Polaroid bounce
    gsap.fromTo(".about-right",
      { opacity: 0, y: -60 },
      { opacity: 1, y: 0, duration: 1.1, ease: "back.out(2)", scrollTrigger: { trigger: ".about-section", start: "top 70%" } }
    );
    // Journey lines: left border grows then text fades in
    document.querySelectorAll<HTMLElement>(".journey-line").forEach((el, i) => {
      const border = el.querySelector<HTMLElement>(".jl-border");
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".journey-lines", start: "top 80%" }, delay: i * 0.22 });
      if (border) tl.fromTo(border, { scaleY: 0, transformOrigin: "top center" }, { scaleY: 1, duration: 0.35, ease: "power2.out" });
      tl.fromTo(el.querySelector(".jl-text"), { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" }, "-=0.1");
    });

    // ── SECTION 3: PM Questions ─────────────────────────────────────────────
    gsap.fromTo(".monkey-left",
      { opacity: 0, x: -60, scale: 0.85, rotation: -3 },
      { opacity: 1, x: 0, scale: 1, rotation: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".pm-section", start: "top 70%" } }
    );
    document.querySelectorAll<HTMLElement>(".pm-question").forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.55, delay: i * 0.12,
          scrollTrigger: { trigger: ".pm-section", start: "top 70%" } }
      );
      listen(el, "mouseenter", () => { gsap.to(el, { x: 8, duration: 0.2, ease: "power2.out" }); });
      listen(el, "mouseleave", () => { gsap.to(el, { x: 0, duration: 0.35, ease: "power3.out" }); });
    });

    // ── SECTION 4: Realizations ─────────────────────────────────────────────
    gsap.fromTo(".monkey-right",
      { opacity: 0, x: 60, scale: 0.85, rotation: 3 },
      { opacity: 1, x: 0, scale: 1, rotation: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".realize-section", start: "top 70%" } }
    );
    document.querySelectorAll<HTMLElement>(".realization").forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.55, delay: i * 0.12,
          scrollTrigger: { trigger: ".realize-section", start: "top 70%" } }
      );
      listen(el, "mouseenter", () => { gsap.to(el, { x: -8, duration: 0.2, ease: "power2.out" }); });
      listen(el, "mouseleave", () => { gsap.to(el, { x: 0, duration: 0.35, ease: "power3.out" }); });
    });
    gsap.fromTo(".proof-callout",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: ".proof-callout", start: "top 80%" } }
    );

    // ── SECTION 5: the work deck ────────────────────────────────────────────
    // Panels are stacked with CSS sticky; this only reveals them and keeps the
    // category rail in step with whichever discipline you're reading.
    gsap.utils.toArray<HTMLElement>(".work-card").forEach((card) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: DUR.base, ease: EASE.out,
          scrollTrigger: { trigger: card, start: "top 92%" } }
      );
    });

    const railItems = gsap.utils.toArray<HTMLElement>(".cat-item");
    const setActiveCat = (cat: string | null) => {
      railItems.forEach((item) => {
        const on = item.dataset.cat === cat;
        item.querySelector(".cat-dot")?.classList.toggle("bg-[#00B4D8]", on);
        item.querySelector(".cat-dot")?.classList.toggle("bg-[#00B4D8]/30", !on);
        const name = item.querySelector(".cat-name");
        name?.classList.toggle("text-[#00B4D8]", on);
        name?.classList.toggle("text-[#f5f0e8]/55", !on);
        item.querySelector(".cat-blurb")?.classList.toggle("text-[#f5f0e8]/55", on);
        item.querySelector(".cat-blurb")?.classList.toggle("text-[#f5f0e8]/55", !on);
      });
    };
    gsap.utils.toArray<HTMLElement>(".work-card").forEach((card) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top 60%",
        end: "bottom 40%",
        onToggle: (self) => { if (self.isActive) setActiveCat(card.dataset.cat ?? null); },
      });
    });


    // ── SECTION 6: Venn diagram ─────────────────────────────────────────────
    const vennTl = gsap.timeline({ scrollTrigger: { trigger: ".venn-section", start: "top 65%" } });
    // Draw each circle stroke (strokeDashoffset → 0) simultaneously growing fill
    vennTl
      .fromTo(".venn-c1",
        { attr: { strokeDashoffset: VENN_CIRC }, opacity: 0 },
        { attr: { strokeDashoffset: 0 }, opacity: 1, duration: 1.4, ease: "power2.out" })
      .fromTo(".venn-c2",
        { attr: { strokeDashoffset: VENN_CIRC }, opacity: 0 },
        { attr: { strokeDashoffset: 0 }, opacity: 1, duration: 1.4, ease: "power2.out" }, "-=1.0")
      .fromTo(".venn-c3",
        { attr: { strokeDashoffset: VENN_CIRC }, opacity: 0 },
        { attr: { strokeDashoffset: 0 }, opacity: 1, duration: 1.4, ease: "power2.out" }, "-=1.0");

    const arrowPath = document.querySelector<SVGPathElement>(".venn-arrow");
    if (arrowPath) {
      const len = arrowPath.getTotalLength();
      gsap.set(arrowPath, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(arrowPath, {
        strokeDashoffset: 0, duration: 1.4, ease: "power2.out",
        scrollTrigger: { trigger: ".venn-section", start: "top 55%" }
      });
    }

    // ── SECTION 7: Hire Me ──────────────────────────────────────────────────
    // Word flip for HIRE ME <3
    gsap.fromTo([".hire-w0", ".hire-w1", ".hire-w2"],
      { rotateX: 90, opacity: 0, transformPerspective: 1200, transformOrigin: "bottom center" },
      { rotateX: 0, opacity: 1, stagger: 0.28, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".hire-section", start: "top 70%" } }
    );

    // Parallax (0.4 ratio — more pronounced)
    const drift = () => (window.innerWidth < 768 ? 28 : 130);
    gsap.to(".parallax-left",  { y: () => -drift(), scrollTrigger: { trigger: ".hire-section", start: "top bottom", end: "bottom top", scrub: 1.2, invalidateOnRefresh: true } });
    gsap.to(".parallax-right", { y: () =>  drift(), scrollTrigger: { trigger: ".hire-section", start: "top bottom", end: "bottom top", scrub: 1.2, invalidateOnRefresh: true } });

    // Contact details fade in. (They used to type out character by character,
    // which meant the phone and email were absent from the DOM until scrolled to.)
    gsap.fromTo([".contact-phone", ".contact-email"],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.15,
        scrollTrigger: { trigger: ".hire-section", start: "top 60%" } }
    );

    // ── Chapter readout in the nav ──────────────────────────────────────────
    // ponytail: read once; if a rotation flips the story layout the readout
    // keeps the old ranges until reload (cosmetic only)
    const storyHeld = !!document.querySelector(".story--pinned");
    const chapters: Array<[string, string]> = [
      [".hero-section", "intro"],
      [".about-section", "about"],
      // held story scene: its stages are scroll ranges (see .story-mark)
      [storyHeld ? ".story-mark-q" : ".pm-section", "questions"],
      [storyHeld ? ".story-mark-turn" : ".story-click", "the turn"],
      [storyHeld ? ".story-mark-l" : ".realize-section", "lessons"],
      [".work-section", "work"],
      [".venn-section", "x-factor"],
      [".faq-section", "faq"],
      [".hire-section", "contact"],
    ];
    const chapterEl = document.querySelector<HTMLElement>(".nav-chapter");
    chapters.forEach(([sel, label], i) => {
      const el = document.querySelector(sel);
      if (!el || !chapterEl) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (!self.isActive) return;
          chapterEl.textContent = `${String(i + 1).padStart(2, "0")} / ${String(
            chapters.length,
          ).padStart(2, "0")} · ${label}`;
        },
      });
    });

    // ── Marquee driven by scroll velocity ───────────────────────────────────
    // A constant-speed marquee reads as dead. This one accelerates with the
    // scroll and reverses when you scroll back up.
    const tickers: Array<() => void> = [];
    const track = document.querySelector<HTMLElement>(".ticker-track");
    if (track) {
      track.style.animation = "none";
      const half = track.scrollWidth / 2 || 1;
      const wrap = gsap.utils.wrap(-half, 0);
      let x = 0;
      let onScreen = false;
      const seen = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; });
      seen.observe(track);
      listeners.push(() => seen.disconnect());
      const marquee = () => {
        if (!onScreen || document.hidden) return;
        const v = fieldState.velocity;
        const dir = v < -0.02 ? 1 : -1;
        x += dir * (0.5 + Math.abs(v) * 16);
        gsap.set(track, { x: wrap(x) });
      };
      gsap.ticker.add(marquee);
      tickers.push(marquee);
    }

    // ── Journey path drawn on scroll, with a travelling marker ──────────────
    const path = document.querySelector<SVGPathElement>(".journey-path");
    const marker = document.querySelector<SVGCircleElement>(".journey-dot");
    if (path) {
      path.style.animation = "none";
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".journey-map",
          start: "top 85%",
          end: "bottom 60%",
          scrub: 0.8,
          onUpdate: (self) => {
            if (!marker) return;
            const pt = path.getPointAtLength(len * self.progress);
            gsap.set(marker, { attr: { cx: pt.x, cy: pt.y }, opacity: self.progress > 0.02 ? 1 : 0 });
          },
        },
      });
    }

    // ── Venn: parallax to pointer, isolate a lobe on hover ──────────────────
    const vennSvg = document.querySelector<SVGSVGElement>(".venn-svg");
    if (vennSvg) {
      const circles = [".venn-c1", ".venn-c2", ".venn-c3"].map((sel) =>
        vennSvg.querySelector<SVGCircleElement>(sel),
      );
      const onVennMove = (e: MouseEvent) => {
        const r = vennSvg.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        circles.forEach((c, i) => {
          if (!c) return;
          const depth = 8 + i * 5;
          gsap.to(c, { x: dx * depth, y: dy * depth, duration: 0.7, ease: EASE.out, overwrite: "auto" });
        });
      };
      const onVennLeave = () => {
        circles.forEach((c) => c && gsap.to(c, { x: 0, y: 0, duration: 0.9, ease: EASE.out }));
      };
      listen(vennSvg, "mousemove", onVennMove as EventListener);
      listen(vennSvg, "mouseleave", onVennLeave);

      vennSvg.querySelectorAll<SVGTextElement>(".venn-label").forEach((labelEl, i) => {
        listen(labelEl, "mouseenter", () => {
          circles.forEach((c, j) => c && gsap.to(c, { opacity: j === i ? 1 : 0.25, duration: 0.3 }));
        });
        listen(labelEl, "mouseleave", () => {
          circles.forEach((c) => c && gsap.to(c, { opacity: 1, duration: 0.4 }));
        });
      });
    }

    // ── FAQ cards: deal in left to right ────────────────────────────────────
    gsap.fromTo(".faq-card",
      { opacity: 0, x: 80, rotateY: -28, transformPerspective: 1000, transformOrigin: "left center" },
      { opacity: 1, x: 0, rotateY: 0, duration: 0.75, ease: "power3.out",
        stagger: { each: 0.11, from: "start" },
        // drop the inline transform afterwards so the CSS hover lift can apply
        clearProps: "transform",
        scrollTrigger: { trigger: ".faq-section", start: "top 75%" } }
    );

    // ── Generic fade-up ─────────────────────────────────────────────────────
    document.querySelectorAll(".fade-up").forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.75, scrollTrigger: { trigger: el, start: "top 82%" } }
      );
    });

    // Images and webfonts land after this effect runs and shift every trigger's
    // start/end. Without a refresh the scrubbed sections can sit at the wrong
    // progress — which looks exactly like "the animation isn't running".
    let mounted = true;
    const refresh = () => { if (mounted) ScrollTrigger.refresh(); };
    window.addEventListener("load", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    return () => {
      mounted = false;
      listeners.forEach(remove => remove());
      window.removeEventListener("load", refresh);
      splits.forEach(sp => sp.revert());
      tickers.forEach(fn => gsap.ticker.remove(fn));
    };
    }, containerRef);
    return () => context.revert();
  }, [pageReady]);

}
