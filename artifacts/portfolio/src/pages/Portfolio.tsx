import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// ── Images (user-provided, transparent PNGs) ────────────────────────────────
import arshCrossedArm   from "@imgs/Arsh Crossed Arm.png";
import goldenTemple     from "@imgs/Amritsar golden temple.png";
import thaparUniversity from "@imgs/Thapar university patiala.png";
import monkeyThinking   from "@imgs/Monkey thinking.png";
import monkeyRealising  from "@imgs/Monkey realising.png";
import arshTalkeys      from "@imgs/Arsh presenting talkeys.png";
import arshWithMic      from "@imgs/Arsh with mic.png";
import arshHalftone     from "@imgs/Arsh smiling with mic in hand.png";
import arshAudience     from "@imgs/Arsh with mic in audience.png";
import arshThumbsUp     from "@imgs/Arsh thumbs up.png";

gsap.registerPlugin(ScrollTrigger);

// ── Static data ──────────────────────────────────────────────────────────────
const HERO_NAME = "ARSH CHATRATH";
const HERO_LINES = [
  "I find broken user experiences and fix them systematically",
  "Product & Operations @ Talkeys — 1000+ users, 60% growth",
  "Top 15 nationally @ Perplexity · IIT Roorkee winner · AMEX Top 3",
];
const PM_QUESTIONS = [
  "How do I know I'm solving the right problem?",
  "How do I balance user needs vs. business goals vs. technical feasibility?",
  "How to make decisions when there's no clear answer?",
  "How to measure if I'm actually creating impact?",
  "How do I lead without authority when I don't manage the team?",
];
const REALIZATIONS = [
  "You balance priorities by being ruthlessly data-driven.",
  "You make decisions by forming hypotheses and testing them quickly.",
  "You measure impact through metrics that matter, not vanity metrics.",
  "You lead by building trust, being the expert, and aligning everyone around the user.",
];
const CARDS = [
  {
    img: arshTalkeys,
    title: "TALKEYS COMMUNITY PLATFORM",
    problem: "Low event engagement, declining user participation",
    role: "Product & Operations Head — owned roadmap & execution",
    approach: "User research → A/B tested 3 engagement strategies → prioritized features by data",
    result: "60% increase in participation | Scaled to 1000+ active users",
  },
  {
    img: arshWithMic,
    title: "CAPSTONE TEAM FINDER PORTAL",
    problem: "Students struggled to find capstone teammates — fragmented WhatsApp chaos",
    role: "Product Builder — identified gap, built end-to-end solution",
    approach: "Identified pain point → built platform for project posting with tech requirements",
    result: "Transformed chaotic WhatsApp groups into centralized team formation",
  },
  {
    img: arshHalftone,
    title: "PERPLEXITY AI CAMPUS GROWTH",
    problem: "Drive product adoption in saturated student market",
    role: "VIP Campus Partner — growth & user acquisition",
    approach: "Segmented target users (CS + research students) → campus activations by need",
    result: "Engaged 1500+ students | Top 15 Partners nationwide",
  },
];

// Venn circle circumference for r=118
const VENN_CIRC = 741.4;

// ── 3D tilt helpers ──────────────────────────────────────────────────────────
function attachTilt(el: HTMLElement) {
  const onMove = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotationX: -y * 10, rotationY: x * 10, transformPerspective: 900, ease: "power1.out", duration: 0.25 });
    el.style.borderColor = "rgba(0,180,216,0.5)";
  };
  const onLeave = () => {
    gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.5, ease: "power3.out" });
    el.style.borderColor = "";
  };
  el.addEventListener("mousemove", onMove as EventListener);
  el.addEventListener("mouseleave", onLeave);
  return () => {
    el.removeEventListener("mousemove", onMove as EventListener);
    el.removeEventListener("mouseleave", onLeave);
  };
}

// ── Section divider ──────────────────────────────────────────────────────────
function SectionDivider() {
  return (
    <div className="section-div px-6 md:px-16 py-1 pointer-events-none">
      <svg width="100%" height="2" viewBox="0 0 1000 2" preserveAspectRatio="none">
        <line
          className="div-line"
          x1="0" y1="1" x2="1000" y2="1"
          stroke="#00B4D8" strokeWidth="1" opacity="0.35"
          strokeDasharray="1000" strokeDashoffset="1000"
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const cursorRef     = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<HTMLDivElement>(null);
  const overlayRef    = useRef<HTMLDivElement>(null);
  const heroBlockRef  = useRef<HTMLDivElement>(null);

  // ── Lenis smooth scroll ───────────────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  // ── Preloader ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!overlayRef.current) return;
    gsap.to(overlayRef.current, { opacity: 0, duration: 1.2, delay: 0.1, ease: "power2.out",
      onComplete: () => { if (overlayRef.current) overlayRef.current.style.display = "none"; }
    });
  }, []);

  // ── Custom cursor with lerp + invert ─────────────────────────────────────
  useEffect(() => {
    const cur = cursorRef.current;
    if (!cur) return;
    let mx = 0, my = 0;
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const grow = () => gsap.to(cur, { width: 40, height: 40, duration: 0.25, ease: "power2.out" });
    const shrink = () => gsap.to(cur, { width: 12, height: 12, duration: 0.25, ease: "power2.out" });
    const ticker = () => gsap.to(cur, { x: mx, y: my, duration: 0.55, ease: "power3.out", overwrite: "auto" });
    window.addEventListener("mousemove", move);
    gsap.ticker.add(ticker);
    document.querySelectorAll("a, button, [data-hover]").forEach(el => {
      el.addEventListener("mouseenter", grow);
      el.addEventListener("mouseleave", shrink);
    });
    return () => {
      window.removeEventListener("mousemove", move);
      gsap.ticker.remove(ticker);
    };
  }, []);

  // ── Scroll progress bar ───────────────────────────────────────────────────
  useEffect(() => {
    if (!progressRef.current) return;
    gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "left center" });
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress });
      },
    });
  }, []);

  // ── All GSAP animations ───────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // ── Section divider draw-in ─────────────────────────────────────────────
    document.querySelectorAll(".div-line").forEach(el => {
      gsap.fromTo(el,
        { attr: { strokeDashoffset: 1000 } },
        { attr: { strokeDashoffset: 0 }, duration: 1.2, ease: "power2.out",
          scrollTrigger: { trigger: el.closest(".section-div"), start: "top 90%" } }
      );
    });

    // ── Section heading clip reveals ────────────────────────────────────────
    document.querySelectorAll(".reveal-heading").forEach(el => {
      gsap.fromTo(el,
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el.closest(".reveal-wrap") ?? el, start: "top 85%" } }
      );
    });

    // ── SECTION 1: Hero ─────────────────────────────────────────────────────
    const chars = document.querySelectorAll<HTMLElement>(".hero-char");
    gsap.fromTo(chars,
      { y: "110%", opacity: 0 },
      { y: "0%", opacity: 1, stagger: 0.045, duration: 0.7, ease: "power3.out", delay: 0.3 }
    );
    gsap.fromTo(".hero-subtitle",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8, delay: 1.5 }
    );
    HERO_LINES.forEach((_, i) => {
      gsap.fromTo(`.hero-line-${i}`,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, delay: 2.1 + i * 0.25 }
      );
    });
    // Floating hero text block after intro
    gsap.to(heroBlockRef.current, {
      y: -8, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3.5
    });

    // ── SECTION 2: Hello I'm Arsh ───────────────────────────────────────────
    gsap.fromTo(".about-left",
      { opacity: 0, x: -50 },
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
      el.addEventListener("mouseenter", () => gsap.to(el, { x: 8, duration: 0.2, ease: "power2.out" }));
      el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, duration: 0.35, ease: "power3.out" }));
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
      el.addEventListener("mouseenter", () => gsap.to(el, { x: -8, duration: 0.2, ease: "power2.out" }));
      el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, duration: 0.35, ease: "power3.out" }));
    });
    gsap.fromTo(".proof-callout",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: ".proof-callout", start: "top 80%" } }
    );

    // ── SECTION 5: Cards slide in from right ────────────────────────────────
    document.querySelectorAll<HTMLElement>(".case-card").forEach((el, i) => {
      gsap.fromTo(el,
        { x: 120, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, delay: i * 0.18, ease: "power3.out",
          scrollTrigger: { trigger: ".cards-scroll", start: "top 80%" } }
      );
    });
    const cardCleanups = Array.from(document.querySelectorAll<HTMLElement>(".case-card")).map(el => attachTilt(el));

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
    gsap.to(".parallax-left",  { y: -130, scrollTrigger: { trigger: ".hire-section", start: "top bottom", end: "bottom top", scrub: 1.2 } });
    gsap.to(".parallax-right", { y:  130, scrollTrigger: { trigger: ".hire-section", start: "top bottom", end: "bottom top", scrub: 1.2 } });

    // Typewriter contact details on section enter
    const typewriter = (selector: string, extraDelay = 0) => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return;
      const full = el.textContent || "";
      el.textContent = "";
      gsap.delayedCall(0, () => {
        ScrollTrigger.create({
          trigger: ".hire-section", start: "top 60%", once: true,
          onEnter: () => {
            let idx = 0;
            const step = () => {
              if (!el) return;
              el.textContent = full.slice(0, idx + 1);
              idx++;
              if (idx < full.length) setTimeout(step, 40);
            };
            setTimeout(step, extraDelay);
          }
        });
      });
    };
    typewriter(".contact-phone", 0);
    typewriter(".contact-email", 600);

    // ── Generic fade-up ─────────────────────────────────────────────────────
    document.querySelectorAll(".fade-up").forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.75, scrollTrigger: { trigger: el, start: "top 82%" } }
      );
    });

    return () => cardCleanups.forEach(fn => fn());
  }, []);

  return (
    <div ref={containerRef} className="bg-[#0a0a0a] text-[#f5f0e8] min-h-screen relative overflow-x-hidden" style={{ cursor: "none" }}>

      {/* ── Page-load overlay ────────────────────────────────────────────── */}
      <div ref={overlayRef} className="fixed inset-0 bg-[#0a0a0a] z-[99999] pointer-events-none" />

      {/* ── Scroll progress bar ──────────────────────────────────────────── */}
      <div ref={progressRef} className="fixed top-0 left-0 w-full h-[2px] bg-[#00B4D8] z-[9997] origin-left pointer-events-none" />

      {/* ── Custom cursor ────────────────────────────────────────────────── */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 rounded-full bg-[#00B4D8] pointer-events-none z-[9999] mix-blend-difference"
        style={{ width: 12, height: 12, transform: "translate(-50%, -50%)" }}
      />

      {/* ── Noise grain overlay ──────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }}
      />

      {/* ── Floating HIRE ME button ──────────────────────────────────────── */}
      <a
        href="#hire"
        data-hover
        className="fixed bottom-8 right-8 z-50 bg-[#00B4D8] text-[#0a0a0a] font-bold text-sm tracking-widest uppercase px-5 py-3 rounded-full hover:scale-110 transition-transform duration-200 shadow-[0_0_20px_rgba(0,180,216,0.4)]"
      >
        HIRE ME
      </a>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO                                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="h-screen flex flex-col items-center justify-center relative px-6 overflow-hidden">
        {/* Animated teal gradient noise BG */}
        <div className="absolute inset-0 pointer-events-none hero-glow-bg" />

        <div ref={heroBlockRef} className="flex flex-col items-center">
          {/* Name */}
          <div className="overflow-hidden mb-6">
            <h1
              className="flex flex-wrap justify-center"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(3rem, 10vw, 9rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
            >
              {HERO_NAME.split("").map((ch, i) =>
                ch === " "
                  ? <span key={i} className="hero-char inline-block" style={{ width: "0.3em" }}>&nbsp;</span>
                  : <span key={i} className="hero-char inline-block overflow-hidden">{ch}</span>
              )}
            </h1>
          </div>

          {/* Subtitle */}
          <div className="hero-subtitle text-[#00B4D8] font-mono text-xl md:text-2xl tracking-[0.3em] uppercase mb-10 opacity-0">
            Creative Builder
          </div>

          {/* 3 lines with hover underline */}
          <div className="flex flex-col items-center gap-3 text-center max-w-2xl">
            {HERO_LINES.map((line, i) => (
              <p
                key={i}
                className={`hero-line-${i} opacity-0 text-[#f5f0e8]/60 font-light text-sm md:text-base tracking-wide hero-bullet`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <span className="font-mono text-xs tracking-widest" style={{ writingMode: "vertical-rl" }}>scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#00B4D8] to-transparent" />
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — HELLO I'M ARSH                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="about-section py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div className="about-left opacity-0">
            <div className="reveal-wrap overflow-hidden">
              <h2 className="reveal-heading" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1 }}>
                HELLO<br />I'M ARSH
              </h2>
            </div>
            <p className="text-[#00B4D8] italic mt-3 mb-6 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Creative Builder
            </p>
            <p className="text-[#f5f0e8]/70 leading-relaxed mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              I find broken user experiences and fix them systematically. Campus partner @Perplexity & Product Head @Talkeys — 3000+ users, 60% growth. National competition winner (IIT Roorkee, AMEX, Amazon ML). I build products that transform chaos into systems.
            </p>

            {/* Journey lines */}
            <div className="journey-lines flex flex-col gap-4">
              {[
                ["Started as:", "Freshman with curiosity and ambition"],
                ["Turned into:", "A builder who ships products and leads winning teams"],
                ["Currently:", "Creating real-world impact through technology"],
              ].map(([label, text]) => (
                <div key={label} className="journey-line flex gap-3 items-stretch relative pl-4">
                  <div className="jl-border absolute left-0 top-0 w-0.5 bg-[#00B4D8]" style={{ height: "100%" }} />
                  <div className="jl-text flex gap-3 items-start opacity-0">
                    <span className="text-[#00B4D8] font-mono text-xs shrink-0 mt-1 uppercase tracking-wider">{label}</span>
                    <span className="text-[#f5f0e8]/80" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Photo */}
          <div className="about-right opacity-0 flex justify-center">
            <div style={{ transform: "rotate(-3deg)", filter: "drop-shadow(0 20px 50px rgba(0,180,216,0.12))" }}>
              <img src={arshCrossedArm} alt="Arsh Chatrath" className="w-64 md:w-80 object-contain" />
            </div>
          </div>
        </div>

        {/* Journey map */}
        <div className="journey-map mt-24 flex items-end justify-between gap-8 max-w-3xl mx-auto relative">
          {/* Amritsar */}
          <div className="flex flex-col items-center gap-3 fade-up">
            <img src={goldenTemple} alt="Golden Temple, Amritsar" className="h-56 w-56 object-contain drop-shadow-xl" />
            <span className="font-mono text-xs tracking-widest uppercase text-[#f5f0e8]/50">Amritsar</span>
          </div>

          {/* Traveling dashed SVG arrow */}
          <div className="flex-1 relative h-32">
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 300 90" preserveAspectRatio="none">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#00B4D8" />
                </marker>
              </defs>
              <path
                className="journey-path"
                d="M 10 78 C 60 78 90 12 150 12 C 210 12 240 78 292 78"
                fill="none"
                stroke="#00B4D8"
                strokeWidth="2.5"
                strokeDasharray="12 8"
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
              />
            </svg>
          </div>

          {/* Thapar */}
          <div className="flex flex-col items-center gap-3 fade-up">
            <img src={thaparUniversity} alt="Thapar University, Patiala" className="h-56 w-56 object-contain drop-shadow-xl" />
            <span className="font-mono text-xs tracking-widest uppercase text-[#f5f0e8]/50">Patiala</span>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — WHAT DOES IT TAKE TO BE A GREAT PM?                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pm-section py-24 px-6 md:px-16 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="reveal-wrap overflow-hidden">
              <h2 className="reveal-heading" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
                What does it take to be a great PM?
              </h2>
            </div>
            <p className="text-[#00B4D8] italic text-lg mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>I asked myself:</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="monkey-left opacity-0 flex justify-center">
              <img src={monkeyThinking} alt="Thinking" className="h-80 md:h-96 object-contain"
                style={{ filter: "drop-shadow(0 0 40px rgba(0,180,216,0.08))" }} />
            </div>

            <ul className="flex flex-col gap-5">
              {PM_QUESTIONS.map((q, i) => (
                <li key={i} className="pm-question opacity-0 flex gap-4 items-start"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span className="text-[#00B4D8] text-xl shrink-0">•</span>
                  <span className="text-[#f5f0e8]/85 text-base md:text-lg leading-snug">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — I REALIZED…                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="realize-section py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex items-center gap-6">
            <div className="reveal-wrap overflow-hidden">
              <h2 className="reveal-heading" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
                I Realized…
              </h2>
            </div>
            <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
              <path d="M 0 10 L 48 10" stroke="#00B4D8" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
              <polygon points="46,5 60,10 46,15" fill="#00B4D8" />
            </svg>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ul className="flex flex-col gap-6">
              {REALIZATIONS.map((r, i) => (
                <li key={i} className="realization opacity-0 flex gap-4 items-start"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span className="text-[#00B4D8] font-bold text-lg shrink-0">→</span>
                  <span className="text-[#f5f0e8]/85 text-base md:text-lg leading-snug">{r}</span>
                </li>
              ))}
            </ul>

            <div className="monkey-right opacity-0 flex justify-center">
              <img src={monkeyRealising} alt="Realising" className="h-80 md:h-96 object-contain"
                style={{ filter: "drop-shadow(0 0 40px rgba(0,180,216,0.08))" }} />
            </div>
          </div>

          <p className="proof-callout opacity-0 mt-24 text-center font-bold text-[#f5f0e8] leading-tight max-w-4xl mx-auto"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.2rem, 2.8vw, 2.2rem)" }}>
            THESE WEREN'T JUST REALIZATIONS. THESE WERE BATTLE TESTED LESSONS.
            AND HERE'S THE PROOF…
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — PROOF, NOT PROMISES                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0d0d0d]">
        <div className="px-6 md:px-16 max-w-7xl mx-auto mb-8">
          <div className="reveal-wrap overflow-hidden">
            <h2 className="reveal-heading" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 5.5rem)", letterSpacing: "-0.02em" }}>
              PROOF,<br />NOT PROMISES
            </h2>
          </div>
        </div>

        {/* Marquee ticker */}
        <div className="overflow-hidden py-3 border-y border-[#00B4D8]/20 mb-10">
          <div className="ticker-track flex gap-12 whitespace-nowrap">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="text-[#00B4D8] font-mono text-xs tracking-[0.35em] uppercase shrink-0">
                PROOF NOT PROMISES ·
              </span>
            ))}
          </div>
        </div>

        {/* Horizontal scroll carousel */}
        <div
          className="cards-scroll flex gap-6 overflow-x-auto px-6 md:px-16 pb-8"
          style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="case-card shrink-0 w-[85vw] md:w-[42vw] lg:w-[32vw] bg-[#111] border border-[#222] rounded-sm overflow-hidden transition-colors duration-300"
              style={{ scrollSnapAlign: "start", transformStyle: "preserve-3d", willChange: "transform" }}
            >
              <div className="card-img-wrap h-56 overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
                <img src={card.img} alt={card.title} className="w-full h-full object-contain object-center card-img-inner transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col gap-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <h3 className="text-[#00B4D8] font-bold text-sm tracking-widest uppercase">{card.title}</h3>
                {[
                  ["Problem", card.problem],
                  ["My Role", card.role],
                  ["Approach", card.approach],
                  ["Result", card.result],
                ].map(([label, text]) => (
                  <div key={label}>
                    <span className="text-[#f5f0e8]/40 font-mono text-[10px] uppercase tracking-widest block mb-1">{label}</span>
                    <p className="text-[#f5f0e8]/80 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — THE X-FACTOR                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="venn-section py-24 px-6 md:px-16 bg-[#0d0d0d] overflow-hidden">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#00B4D8] mb-3 fade-up">What sets me apart</p>
            <div className="reveal-wrap overflow-hidden">
              <h2 className="reveal-heading" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
                The X-Factor
              </h2>
            </div>
            <p className="text-[#f5f0e8]/40 mt-3 text-sm tracking-wider fade-up" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              I sit at the intersection of three rare skillsets
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-4">

            {/* LEFT — SVG Venn diagram */}
            <div className="w-full lg:w-[52%] flex justify-center items-center">
              <svg viewBox="0 0 420 400" className="w-full max-w-md" style={{ overflow: "visible" }}>
                <defs>
                  <radialGradient id="vg1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#00B4D8" stopOpacity="0.04" />
                  </radialGradient>
                  <radialGradient id="vg2" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#a0a0b8" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#a0a0b8" stopOpacity="0.03" />
                  </radialGradient>
                  <radialGradient id="vg3" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#008fa8" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#008fa8" stopOpacity="0.04" />
                  </radialGradient>
                </defs>

                {/* TECHNICAL — top-left (stroke drawn by GSAP) */}
                <circle className="venn-c1" cx="155" cy="150" r="118"
                  fill="url(#vg1)"
                  stroke="rgba(0,180,216,0.65)" strokeWidth="1.5"
                  strokeDasharray={VENN_CIRC} strokeDashoffset={VENN_CIRC}
                  opacity="0" />

                {/* PRODUCT — top-right */}
                <circle className="venn-c2" cx="265" cy="150" r="118"
                  fill="url(#vg2)"
                  stroke="rgba(160,160,185,0.5)" strokeWidth="1.5"
                  strokeDasharray={VENN_CIRC} strokeDashoffset={VENN_CIRC}
                  opacity="0" />

                {/* LEADERSHIP — bottom-center */}
                <circle className="venn-c3" cx="210" cy="238" r="118"
                  fill="url(#vg3)"
                  stroke="rgba(0,155,178,0.6)" strokeWidth="1.5"
                  strokeDasharray={VENN_CIRC} strokeDashoffset={VENN_CIRC}
                  opacity="0" />

                {/* Center glow dot */}
                <circle cx="210" cy="183" r="6" fill="#00B4D8" opacity="0.9" />
                <circle cx="210" cy="183" r="18" fill="#00B4D8" opacity="0.06" />

                {/* X-FACTOR center label */}
                <text x="210" y="172" textAnchor="middle"
                  fill="rgba(245,240,232,0.55)" fontSize="9"
                  fontFamily="'DM Mono', monospace" letterSpacing="3">
                  X-FACTOR
                </text>

                {/* Circle labels with guide lines — hoverable */}
                <text x="80" y="52" textAnchor="middle"
                  fill="#00B4D8" fontSize="12" fontFamily="'Space Grotesk', sans-serif"
                  fontWeight="700" letterSpacing="3" className="venn-label" style={{ cursor: "default" }}>TECHNICAL</text>
                <line x1="80" y1="58" x2="120" y2="88" stroke="rgba(0,180,216,0.3)" strokeWidth="1" strokeDasharray="3 3" />

                <text x="340" y="52" textAnchor="middle"
                  fill="rgba(200,200,220,0.8)" fontSize="12" fontFamily="'Space Grotesk', sans-serif"
                  fontWeight="700" letterSpacing="3" className="venn-label" style={{ cursor: "default" }}>PRODUCT</text>
                <line x1="340" y1="58" x2="300" y2="88" stroke="rgba(160,160,185,0.3)" strokeWidth="1" strokeDasharray="3 3" />

                <text x="210" y="393" textAnchor="middle"
                  fill="rgba(0,180,216,0.8)" fontSize="12" fontFamily="'Space Grotesk', sans-serif"
                  fontWeight="700" letterSpacing="3" className="venn-label" style={{ cursor: "default" }}>LEADERSHIP</text>
                <line x1="210" y1="385" x2="210" y2="360" stroke="rgba(0,155,178,0.3)" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* RIGHT — Photo + trait cards */}
            <div className="w-full lg:w-[48%] flex flex-col items-center gap-8">

              <div className="hidden lg:flex items-center gap-0 self-start mb-[-2rem] ml-[-3rem]">
                <svg width="80" height="20" viewBox="0 0 80 20" style={{ overflow: "visible" }}>
                  <path className="venn-arrow" d="M 0 10 L 65 10" fill="none"
                    stroke="#00B4D8" strokeWidth="2" strokeDasharray="7 5" strokeLinecap="round" />
                  <polygon points="62,5 80,10 62,15" fill="#00B4D8" />
                </svg>
              </div>

              {/* Photo with pulsing shadow */}
              <div className="relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(0,180,216,0.10) 0%, transparent 70%)" }} />
                <img
                  src={arshHalftone}
                  alt="Arsh Chatrath"
                  className="h-72 md:h-80 lg:h-[26rem] object-contain relative z-10 venn-photo"
                />
              </div>

              {/* 3 trait cards */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                {[
                  { label: "Technical", color: "#00B4D8", desc: "Full-stack + systems thinking" },
                  { label: "Product",   color: "rgba(200,200,215,0.85)", desc: "User-first, data-driven" },
                  { label: "Leader",    color: "rgba(0,180,216,0.75)", desc: "Aligns teams, ships fast" },
                ].map(({ label, color, desc }) => (
                  <div key={label} className="border border-white/8 rounded p-3 bg-white/[0.03]">
                    <div className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color }}>{label}</div>
                    <div className="text-[#f5f0e8]/50 text-[10px] leading-snug" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7 — HIRE ME                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="hire" className="hire-section min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0a] py-32">
        {/* Collage images */}
        <div className="parallax-left absolute left-0 bottom-0 h-[70vh] opacity-60 pointer-events-none select-none"
          style={{ transform: "rotate(-4deg)", transformOrigin: "bottom left" }}>
          <img src={arshAudience} alt="" className="h-full w-auto object-contain" />
        </div>
        <div className="parallax-right absolute right-0 bottom-0 h-[65vh] opacity-60 pointer-events-none select-none"
          style={{ transform: "rotate(4deg)", transformOrigin: "bottom right" }}>
          <img src={arshThumbsUp} alt="" className="h-full w-auto object-contain" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <h2
            className="overflow-visible"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(4rem, 14vw, 13rem)", lineHeight: 1, letterSpacing: "-0.04em", perspective: "1200px" }}
          >
            <span className="hire-w0 inline-block mr-[0.2em]" style={{ opacity: 0 }}>HIRE</span>
            <span className="hire-w1 inline-block mr-[0.2em]" style={{ opacity: 0 }}>ME</span>
            <span className="hire-w2 inline-block text-[#00B4D8]" style={{ opacity: 0 }}>&lt;3</span>
          </h2>

          <div className="mt-12 flex flex-col gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <a href="tel:+919888230798" data-hover className="contact-phone text-[#f5f0e8]/70 text-lg hover:text-[#00B4D8] transition-colors">+91 98882 30798</a>
            <a href="mailto:achatrath_be23@thapar.edu" data-hover className="contact-email text-[#f5f0e8]/70 text-lg hover:text-[#00B4D8] transition-colors">achatrath_be23@thapar.edu</a>
          </div>

          {/* Button with wipe + arrow nudge */}
          <a
            href="mailto:achatrath_be23@thapar.edu"
            data-hover
            className="lets-talk-btn mt-10 inline-flex items-center gap-2 text-[#0a0a0a] font-bold text-base uppercase tracking-widest px-8 py-4 rounded-full relative overflow-hidden group"
            style={{ background: "#00B4D8", boxShadow: "0 0 30px rgba(0,180,216,0.35)" }}
          >
            <span className="btn-wipe absolute inset-0 bg-[#f5f0e8] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 rounded-full" />
            <span className="relative z-10">Let's Talk</span>
            <span className="relative z-10 btn-arrow transition-transform duration-200 group-hover:translate-x-1.5">→</span>
          </a>
        </div>
      </section>

      <style>{`
        /* Hero gradient noise background */
        .hero-glow-bg {
          background: radial-gradient(ellipse at 50% 60%, rgba(0,70,90,0.18) 0%, transparent 65%);
          animation: heroGlow 8s ease-in-out infinite;
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.5; transform: scale(1) translateY(0); }
          50%       { opacity: 0.9; transform: scale(1.12) translateY(-15px); }
        }

        /* Hero bullet hover underline */
        .hero-bullet { position: relative; display: inline-block; }
        .hero-bullet::after {
          content: "";
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1px;
          background: #00B4D8;
          transition: width 0.4s ease;
        }
        .hero-bullet:hover::after { width: 100%; }

        /* Journey path traveling dash */
        .journey-path { animation: travelDash 1.2s linear infinite; }
        @keyframes travelDash {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -20; }
        }

        /* Marquee ticker */
        .ticker-track { animation: ticker 18s linear infinite; }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* Venn photo pulsing glow */
        .venn-photo {
          filter: drop-shadow(0 0 20px rgba(0,180,216,0.12));
          animation: photoGlow 3.5s ease-in-out infinite;
        }
        @keyframes photoGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(0,180,216,0.12)); }
          50%       { filter: drop-shadow(0 0 50px rgba(0,180,216,0.35)); }
        }

        /* Venn label hover scale + glow */
        .venn-label {
          transition: font-size 0.2s ease;
        }
        .venn-label:hover {
          fill: #00B4D8 !important;
          font-size: 13.5px !important;
          filter: drop-shadow(0 0 8px rgba(0,180,216,0.6));
        }

        /* Let's Talk button shadow lift */
        .lets-talk-btn:hover {
          box-shadow: 0 8px 40px rgba(0,180,216,0.55) !important;
          transform: translateY(-2px);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { height: 4px; background: #111; }
        ::-webkit-scrollbar-thumb { background: #00B4D8; border-radius: 2px; }

        /* Pulse CTA */
        @keyframes pulse-cta {
          0%, 100% { box-shadow: 0 0 30px rgba(0,180,216,0.35); }
          50%       { box-shadow: 0 0 50px rgba(0,180,216,0.65); }
        }
      `}</style>
    </div>
  );
}
