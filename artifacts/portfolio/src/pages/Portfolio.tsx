import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── Image mapping (extracted from PDF) ──────────────────────────────────────
import arshCrossedArm   from "@assets/extracted/img-017.png";   // Arsh_Crossed_Arm.png
import goldenTemple     from "@assets/extracted/img-063.png";   // Amritsar_golden_temple.png
import thaparUniversity from "@assets/extracted/img-034.jpg";   // Thapar_university_patiala.png
import monkeyThinking   from "@assets/extracted/img-040.png";   // Monkey_thinking.png
import monkeyRealising  from "@assets/extracted/img-045.png";   // Monkey_realising.png
import arshTalkeys      from "@assets/extracted/img-013.jpg";   // Arsh_presenting_talkeys.png
import arshWithMic      from "@assets/extracted/img-029.jpg";   // Arsh_with_mic.png
import arshHalftone     from "@assets/extracted/img-037.png";   // Arsh_smiling_with_mic_in_hand.png
import arshAudience     from "@assets/extracted/img-062.jpg";   // Arsh_with_mic_in_audience.png
import arshThumbsUp     from "@assets/extracted/img-057.png";   // Arsh_thumbs_up.png

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

// ── 3D tilt helpers ──────────────────────────────────────────────────────────
function attachTilt(el: HTMLElement) {
  const onMove = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotationX: -y * 14, rotationY: x * 14, transformPerspective: 900, ease: "power1.out", duration: 0.25 });
  };
  const onLeave = () => gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.5, ease: "power3.out" });
  el.addEventListener("mousemove", onMove as EventListener);
  el.addEventListener("mouseleave", onLeave);
  return () => {
    el.removeEventListener("mousemove", onMove as EventListener);
    el.removeEventListener("mouseleave", onLeave);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef    = useRef<HTMLDivElement>(null);

  // Custom cursor
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.12, ease: "power2.out" });
      }
    };
    const grow = () => cursorRef.current && gsap.to(cursorRef.current, { scale: 2.5, duration: 0.2 });
    const shrink = () => cursorRef.current && gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    window.addEventListener("mousemove", move);
    document.querySelectorAll("a,button,[data-hover]").forEach(el => {
      el.addEventListener("mouseenter", grow);
      el.addEventListener("mouseleave", shrink);
    });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // All GSAP animations
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {

      // ── SECTION 1: Hero ───────────────────────────────────────────────────
      // Letter-by-letter name stagger
      const chars = document.querySelectorAll<HTMLElement>(".hero-char");
      gsap.fromTo(chars,
        { y: "110%", opacity: 0 },
        { y: "0%", opacity: 1, stagger: 0.045, duration: 0.7, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(".hero-subtitle",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, delay: 1.4 }
      );
      HERO_LINES.forEach((_, i) => {
        gsap.fromTo(`.hero-line-${i}`,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, delay: 2 + i * 0.25 }
        );
      });

      // ── SECTION 2: Hello I'm Arsh ─────────────────────────────────────────
      gsap.fromTo(".about-left",
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.9, scrollTrigger: { trigger: ".about-section", start: "top 70%" } }
      );
      gsap.fromTo(".about-right",
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.9, scrollTrigger: { trigger: ".about-section", start: "top 70%" } }
      );
      document.querySelectorAll(".journey-line").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.6, delay: i * 0.15,
            scrollTrigger: { trigger: ".journey-lines", start: "top 80%" } }
        );
      });
      // SVG draw-on-scroll
      const path = document.querySelector<SVGPathElement>(".journey-path");
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0, ease: "none",
          scrollTrigger: { trigger: ".journey-map", start: "top 75%", end: "bottom 60%", scrub: 1 }
        });
      }

      // ── SECTION 3: PM Questions ───────────────────────────────────────────
      gsap.fromTo(".monkey-left",
        { opacity: 0, x: -60, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 1,
          scrollTrigger: { trigger: ".pm-section", start: "top 70%" } }
      );
      document.querySelectorAll(".pm-question").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.55, delay: i * 0.12,
            scrollTrigger: { trigger: ".pm-section", start: "top 70%" } }
        );
      });

      // ── SECTION 4: Realizations ───────────────────────────────────────────
      gsap.fromTo(".monkey-right",
        { opacity: 0, x: 60, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 1,
          scrollTrigger: { trigger: ".realize-section", start: "top 70%" } }
      );
      document.querySelectorAll(".realization").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.55, delay: i * 0.12,
            scrollTrigger: { trigger: ".realize-section", start: "top 70%" } }
        );
      });
      gsap.fromTo(".proof-callout",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8,
          scrollTrigger: { trigger: ".proof-callout", start: "top 80%" } }
      );

      // ── SECTION 5: Cards ─────────────────────────────────────────────────
      const cardEls = document.querySelectorAll<HTMLElement>(".case-card");
      const cleanups = Array.from(cardEls).map(el => attachTilt(el));
      return () => cleanups.forEach(fn => fn());

      // ── SECTION 6: Venn diagram ───────────────────────────────────────────
      // (handled separately below — GSAP context returns early from cleanup)
    }, containerRef);

    // Venn circles (outside ctx so cleanup is separate)
    const vennTl = gsap.timeline({
      scrollTrigger: { trigger: ".venn-section", start: "top 65%" }
    });
    vennTl
      .fromTo(".venn-c1", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.5)" })
      .fromTo(".venn-c2", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.5)" }, "-=0.35")
      .fromTo(".venn-c3", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.5)" }, "-=0.35");

    const arrowPath = document.querySelector<SVGPathElement>(".venn-arrow");
    if (arrowPath) {
      const len = arrowPath.getTotalLength();
      gsap.set(arrowPath, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(arrowPath, {
        strokeDashoffset: 0, duration: 1.2, ease: "power2.out",
        scrollTrigger: { trigger: ".venn-section", start: "top 55%" }
      });
    }

    // ── SECTION 7: Hire Me parallax ───────────────────────────────────────
    gsap.to(".parallax-left",  { y: -70, scrollTrigger: { trigger: ".hire-section", start: "top bottom", end: "bottom top", scrub: 1.5 } });
    gsap.to(".parallax-right", { y:  70, scrollTrigger: { trigger: ".hire-section", start: "top bottom", end: "bottom top", scrub: 1.5 } });

    // Generic section fade-up
    document.querySelectorAll(".fade-up").forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.75,
          scrollTrigger: { trigger: el, start: "top 82%" } }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#0a0a0a] text-[#f5f0e8] min-h-screen relative overflow-x-hidden" style={{ cursor: "none" }}>

      {/* ── Custom cursor ─────────────────────────────────────────────────── */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 rounded-full bg-[#00B4D8] pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
      />

      {/* ── Noise grain overlay ────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.045,
        }}
      />

      {/* ── Floating HIRE ME button ────────────────────────────────────────── */}
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
        <div
          className="hero-subtitle text-[#00B4D8] font-mono text-xl md:text-2xl tracking-[0.3em] uppercase mb-10 opacity-0"
        >
          Creative Builder
        </div>

        {/* 3 lines */}
        <div className="flex flex-col items-center gap-3 text-center max-w-2xl">
          {HERO_LINES.map((line, i) => (
            <p
              key={i}
              className={`hero-line-${i} opacity-0 text-[#f5f0e8]/60 font-light text-sm md:text-base tracking-wide`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <span className="font-mono text-xs tracking-widest" style={{ writingMode: "vertical-rl" }}>scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#00B4D8] to-transparent" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — HELLO I'M ARSH                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="about-section py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div className="about-left opacity-0">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1 }}>
              HELLO<br />I'M ARSH
            </h2>
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
                <div key={label} className="journey-line flex gap-3 items-start">
                  <span className="text-[#00B4D8] font-mono text-xs shrink-0 mt-1 uppercase tracking-wider">{label}</span>
                  <span className="text-[#f5f0e8]/80" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Polaroid photo */}
          <div className="about-right opacity-0 flex justify-center">
            <div
              className="bg-[#f5f0e8] p-4 pb-12 shadow-2xl"
              style={{ transform: "rotate(-3deg)", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}
            >
              <img src={arshCrossedArm} alt="Arsh Chatrath" className="w-64 md:w-80 object-cover grayscale" />
              <p className="text-center font-mono text-[10px] text-[#0a0a0a]/50 mt-4 tracking-[0.3em] uppercase">Arsh Chatrath</p>
            </div>
          </div>
        </div>

        {/* Journey map */}
        <div className="journey-map mt-24 flex items-end justify-between gap-8 max-w-3xl mx-auto relative">
          {/* Amritsar */}
          <div className="flex flex-col items-center gap-3 fade-up">
            <img src={goldenTemple} alt="Golden Temple, Amritsar" className="h-40 w-40 object-contain drop-shadow-xl" />
            <span className="font-mono text-xs tracking-widest uppercase text-[#f5f0e8]/50">Amritsar</span>
          </div>

          {/* Animated SVG curved arrow */}
          <div className="flex-1 relative h-24">
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
              <path
                className="journey-path"
                d="M 0 70 C 80 70 100 10 150 10 C 200 10 220 70 300 70"
                fill="none"
                stroke="#00B4D8"
                strokeWidth="2"
                strokeDasharray="8 5"
                strokeLinecap="round"
              />
              <polygon points="295,65 310,70 295,75" fill="#00B4D8" />
            </svg>
          </div>

          {/* Thapar */}
          <div className="flex flex-col items-center gap-3 fade-up">
            <img src={thaparUniversity} alt="Thapar University, Patiala" className="h-40 w-40 object-contain drop-shadow-xl" />
            <span className="font-mono text-xs tracking-widest uppercase text-[#f5f0e8]/50">Patiala</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — WHAT DOES IT TAKE TO BE A GREAT PM?                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pm-section py-24 px-6 md:px-16 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16 fade-up">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
              What does it take to be a great PM?
            </h2>
            <p className="text-[#00B4D8] italic text-lg mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>I asked myself:</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* LEFT — monkey */}
            <div className="monkey-left opacity-0 flex justify-center">
              <img
                src={monkeyThinking}
                alt="Thinking"
                className="h-80 md:h-96 object-contain"
                style={{ filter: "drop-shadow(0 0 40px rgba(0,180,216,0.08))" }}
              />
            </div>

            {/* RIGHT — questions */}
            <ul className="flex flex-col gap-5">
              {PM_QUESTIONS.map((q, i) => (
                <li
                  key={i}
                  className="pm-question opacity-0 flex gap-4 items-start"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span className="text-[#00B4D8] text-xl shrink-0">•</span>
                  <span className="text-[#f5f0e8]/85 text-base md:text-lg leading-snug">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — I REALIZED…                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="realize-section py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16 fade-up flex items-center gap-6">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
              I Realized…
            </h2>
            <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
              <path d="M 0 10 L 48 10" stroke="#00B4D8" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
              <polygon points="46,5 60,10 46,15" fill="#00B4D8" />
            </svg>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* LEFT — realizations */}
            <ul className="flex flex-col gap-6">
              {REALIZATIONS.map((r, i) => (
                <li
                  key={i}
                  className="realization opacity-0 flex gap-4 items-start"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span className="text-[#00B4D8] font-bold text-lg shrink-0">→</span>
                  <span className="text-[#f5f0e8]/85 text-base md:text-lg leading-snug">{r}</span>
                </li>
              ))}
            </ul>

            {/* RIGHT — monkey */}
            <div className="monkey-right opacity-0 flex justify-center">
              <img
                src={monkeyRealising}
                alt="Realising"
                className="h-80 md:h-96 object-contain"
                style={{ filter: "drop-shadow(0 0 40px rgba(0,180,216,0.08))" }}
              />
            </div>
          </div>

          {/* Bold callout */}
          <p
            className="proof-callout opacity-0 mt-24 text-center font-bold text-[#f5f0e8] leading-tight max-w-4xl mx-auto"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.2rem, 2.8vw, 2.2rem)" }}
          >
            THESE WEREN'T JUST REALIZATIONS. THESE WERE BATTLE TESTED LESSONS.
            AND HERE'S THE PROOF…
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — PROOF, NOT PROMISES                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#0d0d0d]">
        <div className="px-6 md:px-16 max-w-7xl mx-auto mb-12 fade-up">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 5.5rem)", letterSpacing: "-0.02em" }}>
            PROOF,<br />NOT PROMISES
          </h2>
        </div>

        {/* Horizontal scroll carousel */}
        <div
          className="flex gap-6 overflow-x-auto px-6 md:px-16 pb-8"
          style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="case-card shrink-0 w-[85vw] md:w-[42vw] lg:w-[32vw] bg-[#111] border border-[#222] rounded-sm overflow-hidden"
              style={{ scrollSnapAlign: "start", transformStyle: "preserve-3d", willChange: "transform" }}
            >
              {/* Card image */}
              <div className="h-56 overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>

              {/* Card content */}
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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — THE X-FACTOR                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="venn-section py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center mb-16 fade-up" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
            The X-Factor
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-0">
            {/* LEFT — Venn diagram */}
            <div className="relative w-80 h-72 shrink-0">
              {/* Circle 1: Technical — top left */}
              <div
                className="venn-c1 absolute w-52 h-52 rounded-full flex items-center justify-center"
                style={{
                  top: 0, left: 0,
                  background: "rgba(0,180,216,0.15)",
                  border: "1.5px solid rgba(0,180,216,0.5)",
                  transform: "scale(0)",
                }}
              >
                <span className="font-bold text-[#00B4D8] text-sm tracking-widest uppercase -translate-x-4 -translate-y-4">Technical</span>
              </div>

              {/* Circle 2: Product — top right */}
              <div
                className="venn-c2 absolute w-52 h-52 rounded-full flex items-center justify-center"
                style={{
                  top: 0, right: 0,
                  background: "rgba(150,150,160,0.12)",
                  border: "1.5px solid rgba(180,180,190,0.4)",
                  transform: "scale(0)",
                }}
              >
                <span className="font-bold text-[#f5f0e8]/70 text-sm tracking-widest uppercase translate-x-4 -translate-y-4">Product</span>
              </div>

              {/* Circle 3: Leadership — bottom center */}
              <div
                className="venn-c3 absolute w-52 h-52 rounded-full flex items-center justify-center"
                style={{
                  bottom: 0, left: "50%", transform: "translateX(-50%) scale(0)",
                  background: "rgba(0,100,120,0.2)",
                  border: "1.5px solid rgba(0,150,170,0.45)",
                }}
              >
                <span className="font-bold text-[#00B4D8]/80 text-sm tracking-widest uppercase translate-y-6">Leadership</span>
              </div>

              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-bold text-[#f5f0e8] text-xs tracking-widest uppercase bg-[#0a0a0a]/80 px-2 py-1 rounded">ME</span>
              </div>
            </div>

            {/* Animated dashed arrow + photo */}
            <div className="flex-1 flex items-center relative">
              {/* Arrow SVG */}
              <svg
                className="absolute left-0 top-1/2 -translate-y-1/2"
                width="120" height="20" viewBox="0 0 120 20"
                style={{ overflow: "visible" }}
              >
                <path
                  className="venn-arrow"
                  d="M 0 10 L 100 10"
                  fill="none"
                  stroke="#00B4D8"
                  strokeWidth="2"
                  strokeDasharray="8 5"
                  strokeLinecap="round"
                />
                <polygon points="98,5 115,10 98,15" fill="#00B4D8" />
              </svg>

              {/* Photo */}
              <div className="ml-32 flex justify-center relative">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(0,180,216,0.15) 0%, transparent 70%)", transform: "scale(1.4)" }}
                />
                <img
                  src={arshHalftone}
                  alt="Arsh Chatrath"
                  className="h-80 md:h-96 object-contain relative z-10"
                  style={{ filter: "drop-shadow(0 0 30px rgba(0,180,216,0.2))" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7 — HIRE ME                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="hire" className="hire-section min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0a] py-32">
        {/* Collage images */}
        <div
          className="parallax-left absolute left-0 bottom-0 h-[70vh] opacity-60 pointer-events-none select-none"
          style={{ transform: "rotate(-4deg)", transformOrigin: "bottom left" }}
        >
          <img src={arshAudience} alt="" className="h-full w-auto object-cover grayscale" />
        </div>
        <div
          className="parallax-right absolute right-0 bottom-0 h-[65vh] opacity-60 pointer-events-none select-none"
          style={{ transform: "rotate(4deg)", transformOrigin: "bottom right" }}
        >
          <img src={arshThumbsUp} alt="" className="h-full w-auto object-cover grayscale" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <h2
            className="fade-up"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(4rem, 14vw, 13rem)", lineHeight: 1, letterSpacing: "-0.04em" }}
          >
            HIRE ME&nbsp;
            <span className="text-[#00B4D8]">&lt;3</span>
          </h2>

          <div className="mt-12 flex flex-col gap-3 fade-up" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <a href="tel:+919888230798" data-hover className="text-[#f5f0e8]/70 text-lg hover:text-[#00B4D8] transition-colors">
              +91 98882 30798
            </a>
            <a href="mailto:achatrath_be23@thapar.edu" data-hover className="text-[#f5f0e8]/70 text-lg hover:text-[#00B4D8] transition-colors">
              achatrath_be23@thapar.edu
            </a>
          </div>

          <a
            href="mailto:achatrath_be23@thapar.edu"
            data-hover
            className="mt-10 fade-up inline-flex items-center gap-2 bg-[#00B4D8] text-[#0a0a0a] font-bold text-base uppercase tracking-widest px-8 py-4 rounded-full hover:scale-105 transition-transform duration-200"
            style={{
              animation: "pulse-cta 2.5s ease-in-out infinite",
              boxShadow: "0 0 30px rgba(0,180,216,0.35)",
            }}
          >
            Let's Talk →
          </a>
        </div>
      </section>

      <style>{`
        @keyframes pulse-cta {
          0%, 100% { box-shadow: 0 0 30px rgba(0,180,216,0.35); }
          50%       { box-shadow: 0 0 50px rgba(0,180,216,0.65); }
        }
        ::-webkit-scrollbar { height: 4px; background: #111; }
        ::-webkit-scrollbar-thumb { background: #00B4D8; border-radius: 2px; }
      `}</style>
    </div>
  );
}
