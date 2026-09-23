import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { SplitText } from "gsap/SplitText";
import { usePageMeta } from "@/lib/page-meta";
import { EASE, DUR, STAGGER, deviceTier, prefersReducedMotion } from "@/lib/motion";
import { fieldState } from "@/gl/AmbientField";
import Preloader from "@/components/Preloader";
import AsciiMorph from "@/components/AsciiMorph";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

// ── Images (user-provided, transparent PNGs) ────────────────────────────────
import arshCrossedArm   from "@imgs/Arsh Crossed Arm.webp";
import goldenTemple     from "@imgs/Amritsar golden temple.webp";
import thaparUniversity from "@imgs/Thapar university patiala.webp";
import monkeyThinking   from "@imgs/Monkey thinking.webp";
import monkeyRealising  from "@imgs/Monkey realising.webp";
import arshWithMic      from "@imgs/Arsh with mic.webp";
import arshHalftone     from "@imgs/Arsh smiling with mic in hand.webp";
import arshAudience     from "@imgs/Arsh with mic in audience.webp";
import arshThumbsUp     from "@imgs/Arsh thumbs up.webp";
import banner1          from "@imgs/1.webp";
import banner2          from "@imgs/2.webp";
import banner3          from "@imgs/3.webp";

gsap.registerPlugin(ScrollTrigger, SplitText);

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
type Project = {
  index: string;
  category: "PRODUCT" | "AI / ML" | "AUTOMATION";
  title: string;
  problem: string;
  role: string;
  approach: string;
  result: string;
  stack: string[];
  img?: string;
  /** Monospace schematic for projects that have no banner artwork. */
  flow?: string[];
  links?: { label: string; href: string }[];
};

const PROJECTS: Project[] = [
  {
    index: "01",
    category: "PRODUCT",
    img: banner1,
    title: "Talkeys Community Platform",
    problem: "Low event engagement, declining user participation",
    role: "Product & Operations Head — owned roadmap & execution",
    approach: "User research → A/B tested 3 engagement strategies → prioritised features by data",
    result: "60% increase in participation · scaled to 1000+ active users",
    stack: ["Product", "A/B testing", "Ops"],
  },
  {
    index: "02",
    category: "PRODUCT",
    img: banner2,
    title: "Capstone Team Finder Portal",
    problem: "Students struggled to find capstone teammates — fragmented WhatsApp chaos",
    role: "Product Builder — identified the gap, built end to end",
    approach: "Found the pain point → built a platform for posting projects with tech requirements",
    result: "Turned scattered WhatsApp groups into one place teams actually form",
    stack: ["Full-stack", "Product"],
  },
  {
    index: "03",
    category: "PRODUCT",
    img: banner3,
    title: "Perplexity AI Campus Growth",
    problem: "Drive product adoption in a saturated student market",
    role: "VIP Campus Partner — growth & user acquisition",
    approach: "Segmented target users (CS + research students) → ran campus activations by need",
    result: "Engaged 1500+ students · Top 15 Campus Partners nationwide",
    stack: ["Growth", "GTM", "Community"],
  },
  {
    index: "04",
    category: "AI / ML",
    title: "SafeSpace AI",
    flow: ["ESP32 WEARABLE", "VOICE", "DASS-21", "→ LATE FUSION →", "XAI EXPLANATION"],
    problem: "Stress detection is either self-reported and unreliable, or a model nobody can question",
    role: "Built end to end — wearable firmware, ML stack and API",
    approach: "Fused ECG/EDA/EMG/temp biosignals, voice and the DASS-21 survey by late fusion, with SHAP and LIME explaining every prediction in plain language",
    result: "88.3% accuracy / 0.97 AUC on WESAD physiological data; fusion lifted reliability on medium stress",
    stack: ["Python", "FastAPI", "TensorFlow", "ESP32", "SHAP / LIME"],
    links: [
      { label: "Live", href: "https://safespaceai.vercel.app" },
      { label: "Code", href: "https://github.com/arshchatrath/SafeSpace" },
    ],
  },
  {
    index: "05",
    category: "AI / ML",
    title: "Two-Hand Gesture Mouse",
    flow: ["WEBCAM", "MEDIAPIPE", "→ 2-HAND STATE →", "SYSTEM CURSOR"],
    problem: "Hands-free cursor control almost always stops at a browser demo",
    role: "Solo build — computer vision, input layer and UI",
    approach: "Two-hand MediaPipe tracking: left hand open drives the cursor, a fist switches to scroll, pinching thumb+index or thumb+middle fires left and right click",
    result: "Controls Windows system-wide — over Chrome, VS Code, Figma, Explorer. Losing tracking never emits a stray input",
    stack: ["Python", "MediaPipe", "OpenCV"],
    links: [{ label: "Code", href: "https://github.com/arshchatrath/gestured-mouse" }],
  },
  {
    index: "06",
    category: "AUTOMATION",
    title: "AI Job Search Agent",
    flow: ["SERPAPI JOBS", "BATCH x5", "→ LLM SCORE 1-10 →", "DAILY DIGEST"],
    problem: "Finding the few listings worth applying to means scrolling job boards every day",
    role: "Solo build — workflow design and prompt engineering",
    approach: "An n8n workflow pulls listings, batches them five at a time and has a model score each 1–10 against a target profile with a one-line reason; anything under 7 is dropped",
    result: "One daily email of only the listings worth applying to. AI is used for the single judgment step; everything else stays rule-based",
    stack: ["n8n", "SerpApi", "Groq", "Gmail"],
    links: [{ label: "Workflow", href: "https://github.com/arshchatrath/n8n" }],
  },
  {
    index: "07",
    category: "AUTOMATION",
    title: "Daily LeetCode Agent",
    flow: ["DAILY + TOPIC", "LLM SOLUTION", "→ SUBMIT / JUDGE →", "SELF-CORRECT x5"],
    problem: "Daily practice dies the moment the streak breaks",
    role: "Solo build — agent loop, API client and tracking",
    approach: "Fetches the daily challenge plus one problem from a rotating topic list, generates a solution, submits it, then feeds the judge's failure detail back and retries up to five times",
    result: "Runs unattended once a day and tracks streak, success rate and average attempts to accept",
    stack: ["Python", "Claude Code CLI"],
    links: [{ label: "Code", href: "https://github.com/arshchatrath/leetcode-agent" }],
  },
];

const CATEGORIES = [
  { name: "PRODUCT", blurb: "Shipped to real users" },
  { name: "AI / ML", blurb: "Models that explain themselves" },
  { name: "AUTOMATION", blurb: "Work that runs without me" },
] as const;

// Answers double as FAQPage structured data — keep them factual.
const FAQS = [
  {
    q: "What kind of roles are you looking for?",
    a: "Product and growth internships. I'm most useful where a product has real users, messy feedback and no one has decided what to build next.",
  },
  {
    q: "What have you actually shipped?",
    a: "The Talkeys community platform (scaled to 1000+ active users, 60% lift in participation), a capstone team-finder portal that replaced fragmented WhatsApp groups, and campus growth for Perplexity AI reaching 1500+ students.",
  },
  {
    q: "Are you technical?",
    a: "Yes — I build full-stack, so I scope with engineers instead of throwing specs over the wall. That's the overlap the X-Factor section describes: technical, product and leadership.",
  },
  {
    q: "Where are you based?",
    a: "Patiala, Punjab — I'm at Thapar Institute of Engineering and Technology. I'm from Amritsar originally.",
  },
  {
    q: "What's the fastest way to reach you?",
    a: "Email: achatrath_be23@thapar.edu. Phone works too, and my full resume is one click away.",
  },
];

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#faq", label: "FAQ" },
  { href: "#hire", label: "Contact" },
];

// Venn circle circumference for r=118
const VENN_CIRC = 741.4;

// ── FAQ card ─────────────────────────────────────────────────────────────────
// Native <details> can't animate its own height, so this holds the open state
// and lets GSAP tween height:auto. The spotlight follows the pointer.
function FaqBoard() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  // Spotlight follows the pointer across whichever card it is over.
  const trackPointer = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div className="faq-board flex flex-col md:flex-row gap-2.5 h-[clamp(24rem,56vh,30rem)] md:h-[clamp(16rem,42vh,20rem)]">
      {FAQS.map(({ q, a }, i) => {
        const open = i === active;
        return (
          <button
            key={q}
            type="button"
            data-hover
            aria-expanded={open}
            onClick={() => setActive(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onMouseMove={trackPointer}
            style={{ flexGrow: open ? 4.2 : hovered === i ? 1.3 : 1 }}
            className={`faq-card opacity-0 relative basis-0 min-w-0 min-h-0 overflow-hidden rounded-lg border text-left ${
              open
                ? "border-[#00B4D8]/45 bg-[#00B4D8]/[0.06]"
                : "border-white/10 bg-white/[0.02] hover:border-[#00B4D8]/30"
            }`}
          >
            <span className="faq-spot" aria-hidden="true" />

            {/* Oversized index sitting in the open card's empty space */}
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute -bottom-10 right-1 select-none leading-none transition-opacity duration-700 ${
                open ? "opacity-100 delay-200" : "opacity-0"
              }`}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 900,
                fontSize: "13rem",
                color: "rgba(0,180,216,0.07)",
              }}
            >
              {i + 1}
            </span>

            {/* Index — always visible, anchors the card while it resizes */}
            <span
              className={`absolute top-4 left-4 z-10 font-mono text-[10px] tracking-[0.25em] transition-colors duration-500 ${
                open ? "text-[#00B4D8]" : "text-[#f5f0e8]/35"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            {/* Collapsed label — vertical on desktop, a normal row on mobile */}
            <span
              className={`absolute inset-0 z-10 flex items-end p-4 pt-12 transition-opacity duration-300 ${
                open ? "opacity-0" : "opacity-100 delay-200"
              }`}
              aria-hidden={open}
            >
              <span className="text-[#f5f0e8]/80 text-xs md:text-sm font-medium leading-snug md:mx-auto md:[writing-mode:vertical-rl]">
                {q}
              </span>
            </span>

            {/* Expanded panel — fixed width so the text doesn't reflow mid-animation */}
            <span
              className={`absolute left-0 inset-y-0 z-10 flex w-[86vw] md:w-[min(32rem,40vw)] flex-col justify-center gap-3 px-5 pt-12 pb-5 transition-[opacity,transform] duration-500 ${
                open ? "opacity-100 translate-y-0 delay-200" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
              aria-hidden={!open}
            >
              <span className="text-[#f5f0e8] text-lg md:text-2xl font-semibold leading-snug">{q}</span>
              <span className="h-px w-10 bg-[#00B4D8]/50" aria-hidden="true" />
              <span className="text-[#f5f0e8]/65 text-sm md:text-base leading-relaxed">{a}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
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
  const progressRef   = useRef<HTMLDivElement>(null);
  const heroBlockRef  = useRef<HTMLDivElement>(null);
  const lenisRef      = useRef<Lenis | null>(null);
  const [intro, setIntro] = useState(false);
  const skewables = useRef<HTMLElement[]>([]);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  usePageMeta(
    "Arsh Chatrath — Product Builder & Campus Partner @Perplexity",
    "Product Builder. Campus Partner @Perplexity, Product & Operations Head @Talkeys (1000+ users, 60% growth). IIT Roorkee winner. Looking for product & growth internships.",
    "/",
  );

  // The page reveal is gated on the preloader finishing. If that timeline ever
  // stalls, every `.opacity-0` element would stay hidden forever — so force the
  // gate open after a beat no matter what.
  useEffect(() => {
    const t = setTimeout(() => setIntro(true), 4500);
    return () => clearTimeout(t);
  }, []);

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
        if (skewables.current.length) {
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

  // ── All GSAP animations ───────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    if (!intro) return; // hold everything until the preloader hands over

    // Sections that lean with scroll velocity. Cheap, and it's what makes the
    // page feel like it has mass rather than snapping between states.
    skewables.current = gsap.utils.toArray<HTMLElement>(".skewable");

    // Reduced motion: reveal everything at rest instead of animating it in.
    // Without this, every `.opacity-0` element stays invisible forever.
    if (prefersReducedMotion()) {
      gsap.set(".opacity-0, .hire-w0, .hire-w1, .hire-w2", { opacity: 1 });
      gsap.set(".venn-c1, .venn-c2, .venn-c3", { opacity: 1, attr: { strokeDashoffset: 0 } });
      gsap.set(".div-line", { attr: { strokeDashoffset: 0 } });
      return;
    }

    // ── Section divider draw-in ─────────────────────────────────────────────
    document.querySelectorAll(".div-line").forEach(el => {
      gsap.fromTo(el,
        { attr: { strokeDashoffset: 1000 } },
        { attr: { strokeDashoffset: 0 }, duration: 1.2, ease: "power2.out",
          scrollTrigger: { trigger: el.closest(".section-div"), start: "top 90%" } }
      );
    });

    // ── Section headings: masked per-line reveal ────────────────────────────
    // SplitText with autoSplit re-splits on resize, so lines stay correct when
    // the layout reflows. This replaces the old whole-block fade.
    const splits: SplitText[] = [];
    document.querySelectorAll<HTMLElement>(".reveal-heading").forEach(el => {
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
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

    // ── SECTION 1: Hero ─────────────────────────────────────────────────────
    // Hero image slides in from right
    gsap.fromTo(".hero-img",
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 0.9, ease: "power3.out", delay: 0.8 }
    );

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

    // ── TRANSITION: questions dissolve, realizations wipe in ────────────────
    // Deliberately no pin and no sticky. This only reads where the two real
    // sections are and paints two overlays that already sit inside them, so
    // there is nothing to mis-measure and nothing extra to scroll through.
    const pmScrim   = document.querySelector<HTMLElement>(".pm-scrim");
    const rzCurtain = document.querySelector<HTMLElement>(".rz-curtain");
    const rzSeam    = document.querySelector<HTMLElement>(".rz-seam");

    const transitionST = ScrollTrigger.create({
      trigger: ".realize-section",
      start: "top bottom",
      end: "top 35%",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        // the questions sink into the dark behind you
        if (pmScrim) gsap.set(pmScrim, { opacity: p * 0.92 });
        // the answers are uncovered from the top down
        if (rzCurtain) gsap.set(rzCurtain, { scaleY: 1 - p });
        // a light seam rides the moving edge of the wipe
        if (rzSeam) {
          gsap.set(rzSeam, {
            top: `${p * 100}%`,
            opacity: p > 0.02 && p < 0.98 ? 1 : 0,
          });
        }
      },
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
        name?.classList.toggle("text-[#f5f0e8]/40", !on);
        item.querySelector(".cat-blurb")?.classList.toggle("text-[#f5f0e8]/55", on);
        item.querySelector(".cat-blurb")?.classList.toggle("text-[#f5f0e8]/25", !on);
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
    gsap.to(".parallax-left",  { y: -130, scrollTrigger: { trigger: ".hire-section", start: "top bottom", end: "bottom top", scrub: 1.2 } });
    gsap.to(".parallax-right", { y:  130, scrollTrigger: { trigger: ".hire-section", start: "top bottom", end: "bottom top", scrub: 1.2 } });

    // Contact details fade in. (They used to type out character by character,
    // which meant the phone and email were absent from the DOM until scrolled to.)
    gsap.fromTo([".contact-phone", ".contact-email"],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.15,
        scrollTrigger: { trigger: ".hire-section", start: "top 60%" } }
    );

    // ── Chapter readout in the nav ──────────────────────────────────────────
    const chapters: Array<[string, string]> = [
      [".hero-section", "intro"],
      [".about-section", "about"],
      [".pm-section", "questions"],
      [".ascii-stage", "the turn"],
      [".realize-section", "lessons"],
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
          ).padStart(2, "0")} — ${label}`;
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
      const marquee = () => {
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
      vennSvg.addEventListener("mousemove", onVennMove);
      vennSvg.addEventListener("mouseleave", onVennLeave);

      vennSvg.querySelectorAll<SVGTextElement>(".venn-label").forEach((labelEl, i) => {
        labelEl.addEventListener("mouseenter", () => {
          circles.forEach((c, j) => c && gsap.to(c, { opacity: j === i ? 1 : 0.25, duration: 0.3 }));
        });
        labelEl.addEventListener("mouseleave", () => {
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
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      splits.forEach(sp => sp.revert());
      tickers.forEach(fn => gsap.ticker.remove(fn));
      transitionST.kill();
    };
  }, [intro]);

  return (
    <>
      {!intro && <Preloader onDone={() => setIntro(true)} />}

      <div
        ref={containerRef}
        className="text-[#f5f0e8] min-h-screen relative overflow-x-clip"
      >
        {/* Scroll progress */}
        <div ref={progressRef} className="fixed top-0 left-0 w-full h-[2px] bg-[#00B4D8] z-[9997] origin-left pointer-events-none" />

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav
        aria-label="Primary"
        className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-6 md:px-16 py-5 backdrop-blur-md bg-[#0a0a0a]/50 border-b border-white/5"
      >
        <a
          href="#top"
          data-hover
          onClick={(e) => { e.preventDefault(); lenisRef.current?.scrollTo(0); }}
          className="font-mono text-xs tracking-[0.3em] uppercase text-[#f5f0e8]/80 hover:text-[#00B4D8] transition-colors"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Arsh Chatrath
        </a>
        <span className="nav-chapter hidden lg:block font-mono text-[10px] tracking-[0.3em] uppercase text-[#f5f0e8]/35">
          01 / 09 &mdash; intro
        </span>
        <div className="flex items-center gap-4 md:gap-7">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              data-hover
              onClick={(e) => { e.preventDefault(); lenisRef.current?.scrollTo(href); }}
              className="hidden sm:inline font-mono text-xs tracking-[0.3em] uppercase text-[#f5f0e8]/70 hover:text-[#00B4D8] transition-colors"
            >
              {label}
            </a>
          ))}
          <a
            href="/resume"
            data-hover
            data-cursor="OPEN"
            className="font-mono text-xs tracking-[0.3em] uppercase text-[#f5f0e8]/70 hover:text-[#00B4D8] transition-colors"
          >
            Resume
          </a>
          <a
            href="/figma"
            data-hover
            data-magnetic
            data-cursor="OPEN"
            className="font-mono text-xs tracking-[0.3em] uppercase text-[#0a0a0a] bg-[#00B4D8] px-4 py-2 rounded-full hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(0,180,216,0.25)]"
          >
            Figma
          </a>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO                                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="hero-section h-screen flex items-center justify-center relative px-6 md:px-16 overflow-hidden">
        {/* Animated teal gradient noise BG */}
        <div className="absolute inset-0 pointer-events-none hero-glow-bg" />

        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-6 md:gap-12">
          {/* LEFT — text */}
          <div ref={heroBlockRef} className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
            {/* Name */}
            <div className="overflow-hidden mb-6">
              <h1
                aria-label={HERO_NAME}
                className="flex flex-nowrap justify-center md:justify-start whitespace-nowrap"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(1.8rem, 6vw, 9rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
              >
                {/* Split for the stagger; the h1's aria-label carries the real
                    name so assistive tech doesn't spell it out letter by letter. */}
                <span aria-hidden="true" className="contents">
                  {HERO_NAME.split("").map((ch, i) =>
                    ch === " "
                      ? <span key={i} className="hero-char inline-block" style={{ width: "0.3em" }}>&nbsp;</span>
                      : <span key={i} className="hero-char inline-block overflow-hidden">{ch}</span>
                  )}
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <div className="hero-subtitle text-[#00B4D8] font-mono text-lg md:text-2xl tracking-[0.3em] uppercase mb-8 opacity-0">
              Creative Builder
            </div>

            {/* 3 lines with hover underline */}
            <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left max-w-xl">
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

            {/* Primary CTA — above the fold */}
            <div className="hero-cta flex flex-wrap items-center justify-center md:justify-start gap-3 mt-8"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <a
                href="#hire"
                data-hover
                onClick={(e) => { e.preventDefault(); lenisRef.current?.scrollTo("#hire"); }}
                data-magnetic
                className="lets-talk-btn inline-flex items-center gap-2 text-[#0a0a0a] font-bold text-sm uppercase tracking-widest px-6 py-3.5 rounded-full"
                style={{ background: "#00B4D8", boxShadow: "0 0 30px rgba(0,180,216,0.35)" }}
              >
                Hire me <span aria-hidden="true">→</span>
              </a>
              <a
                href="/resume"
                data-hover
                className="inline-flex items-center gap-2 border border-white/20 text-[#f5f0e8]/85 font-bold text-sm uppercase tracking-widest px-6 py-3.5 rounded-full hover:border-[#00B4D8] hover:text-[#00B4D8] transition-colors"
              >
                View resume
              </a>
            </div>
          </div>

          {/* RIGHT — Arsh with mic image */}
          <div className="hero-img opacity-0 flex-shrink-0 flex items-end justify-center">
            <img
              src={arshWithMic}
              alt="Arsh Chatrath"
              className="h-[50vh] md:h-[70vh] object-contain object-bottom"
              style={{ maxHeight: "70vh" }}
              fetchPriority="high"
              decoding="async"
            />
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
      <section id="about" className="about-section skewable py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div className="about-left opacity-0">
            <div className="reveal-wrap overflow-hidden">
              <h2 className="reveal-heading" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1 }}>
                HELLO<br />I'M ARSH
              </h2>
            </div>
            <p className="text-[#00B4D8] italic mt-3 mb-6 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Thapar Institute, Patiala
            </p>
            <p className="reveal-copy text-[#f5f0e8]/70 leading-relaxed mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Most of what I have built started as something that annoyed me. A community
              nobody was showing up to. A capstone scramble spread across WhatsApp groups.
              A job hunt eating an hour every morning. I research it, test it, measure it,
              and ship — then I do it again. National competition winner at IIT Roorkee,
              AMEX and Amazon ML.
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
              <img src={arshCrossedArm} alt="Arsh Chatrath" className="w-64 md:w-80 object-contain" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>

        {/* Journey map */}
        <div className="journey-map mt-24 flex items-end justify-between gap-8 max-w-3xl mx-auto relative">
          {/* Amritsar */}
          <div className="flex flex-col items-center gap-3 fade-up">
            <img src={goldenTemple} alt="Golden Temple, Amritsar" className="h-56 w-56 object-contain drop-shadow-xl" loading="lazy" decoding="async" />
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
                d="M 10 78 Q 150 44 292 78"
                fill="none"
                stroke="#00B4D8"
                strokeWidth="2.5"
                strokeDasharray="12 8"
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
              />
              <circle className="journey-dot" r="4" fill="#00B4D8" opacity="0"
                style={{ filter: "drop-shadow(0 0 6px rgba(0,180,216,0.9))" }} />
            </svg>
          </div>

          {/* Thapar */}
          <div className="flex flex-col items-center gap-3 fade-up">
            <img src={thaparUniversity} alt="Thapar University, Patiala" className="h-56 w-56 object-contain drop-shadow-xl" loading="lazy" decoding="async" />
            <span className="font-mono text-xs tracking-widest uppercase text-[#f5f0e8]/50">Patiala</span>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — WHAT DOES IT TAKE TO BE A GREAT PM?                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pm-section skewable relative overflow-hidden py-24 px-6 md:px-16">
        {/* darkens as you leave the questions behind */}
        <div className="pm-scrim pointer-events-none absolute inset-0 z-20 bg-[#050505] opacity-0" />
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
              <img src={monkeyThinking} alt="" aria-hidden="true" className="h-80 md:h-96 object-contain"
                style={{ filter: "drop-shadow(0 0 40px rgba(0,180,216,0.08))" }} loading="lazy" decoding="async" />
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



      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ASCII MORPH - the thinking monkey erodes into noise and re-forms */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <AsciiMorph
        from={monkeyThinking}
        to={monkeyRealising}
        className="ascii-stage h-[240vh] px-4"
      />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — I REALIZED…                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="realize-section skewable relative overflow-hidden py-24 px-6 md:px-16">
        {/* curtain retracts downward to uncover the answers; resting state is
            fully retracted, so if the scroll driver never runs you just see the
            section normally rather than a blank panel */}
        <div
          className="rz-curtain pointer-events-none absolute inset-0 z-20 origin-bottom bg-[#070707]"
          style={{ transform: "scaleY(0)" }}
        />
        <div
          className="rz-seam pointer-events-none absolute left-0 right-0 z-30 h-px opacity-0"
          style={{
            top: "0%",
            background: "linear-gradient(90deg, transparent, #00B4D8 35%, #ffffff 50%, #00B4D8 65%, transparent)",
            boxShadow: "0 0 26px 5px rgba(0,180,216,0.55)",
          }}
        />
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
              <img src={monkeyRealising} alt="" aria-hidden="true" className="h-80 md:h-96 object-contain"
                style={{ filter: "drop-shadow(0 0 40px rgba(0,180,216,0.08))" }} loading="lazy" decoding="async" />
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
      <section id="work" className="work-section relative px-6 md:px-16 pt-28 pb-24">
        <div className="max-w-7xl mx-auto w-full">
          <div className="reveal-wrap overflow-hidden">
            <h2 className="reveal-heading text-center" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 3.8rem)", letterSpacing: "-0.02em" }}>
              PROOF, NOT JUST PROMISES
            </h2>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden border-y border-[#00B4D8]/20 py-1.5 mt-8">
          <div className="ticker-track flex gap-12 whitespace-nowrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="text-[#00B4D8] font-mono text-xs tracking-[0.35em] uppercase shrink-0">
                SEVEN PROJECTS · THREE DISCIPLINES ·
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full mt-14 grid lg:grid-cols-[190px_minmax(0,1fr)] gap-10">
          {/* Category rail — tracks which discipline you are reading */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 flex flex-col gap-7" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {CATEGORIES.map((c) => {
                const count = PROJECTS.filter((x) => x.category === c.name).length;
                return (
                  <div key={c.name} className="cat-item" data-cat={c.name}>
                    <div className="flex items-baseline gap-2">
                      <span className="cat-dot h-1.5 w-1.5 rounded-full bg-[#00B4D8]/30 transition-colors" />
                      <span className="cat-name font-mono text-[11px] uppercase tracking-[0.22em] text-[#f5f0e8]/40 transition-colors">
                        {c.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#f5f0e8]/25">{String(count).padStart(2, "0")}</span>
                    </div>
                    <p className="cat-blurb mt-1 pl-3.5 text-[11px] leading-snug text-[#f5f0e8]/25 transition-colors">
                      {c.blurb}
                    </p>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* The pile: each panel sticks a little lower than the last, so they
              stack into an ordered deck instead of scrolling past. */}
          <div className="flex flex-col gap-8">
            {PROJECTS.map((proj, i) => (
              <article
                key={proj.index}
                data-cat={proj.category}
                className="work-card group opacity-0 sticky rounded-2xl border border-white/12 bg-[#0b0b0b] overflow-hidden shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.9),0_30px_80px_-40px_rgba(0,0,0,1)]"
                style={{ top: "calc(7.5rem + " + i * 10 + "px)" }}
              >
                {/* Media strip — banner art stays at its designed 120px */}
                <div className="relative flex items-center justify-center overflow-hidden border-b border-white/8" style={{ height: 120, background: "#161616" }}>
                  {proj.img ? (
                    <img src={proj.img} alt={proj.title} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                  ) : (
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 text-center">
                      {proj.flow?.map((f) => (
                        <span
                          key={f}
                          className={
                            "font-mono text-[10px] md:text-xs tracking-[0.25em] " +
                            (f.startsWith("→") ? "text-[#00B4D8]" : "text-[#f5f0e8]/45")
                          }
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="absolute top-3 right-4 font-mono text-[10px] tracking-[0.25em] text-[#f5f0e8]/30">
                    {proj.index} / 07
                  </span>
                </div>

                <span className="block h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[#00B4D8] via-[#00B4D8]/40 to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100" />

                <div className="p-6 md:p-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00B4D8]">
                      {proj.category}
                    </span>
                    {proj.links && (
                      <div className="flex gap-4">
                        {proj.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            data-hover
                            data-cursor="OPEN"
                            className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5f0e8]/55 underline-offset-4 transition-colors hover:text-[#00B4D8] hover:underline"
                          >
                            {l.label} ↗
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <h3 className="mt-3 text-[#f5f0e8] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.4rem, 2.6vw, 2.1rem)" }}>
                    {proj.title}
                  </h3>

                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <dl className="flex flex-col gap-4">
                      {[
                        ["Problem", proj.problem],
                        ["My Role", proj.role],
                        ["Approach", proj.approach],
                      ].map(([label, text]) => (
                        <div key={label} className="border-l border-white/12 pl-4">
                          <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00B4D8]/70">{label}</dt>
                          <dd className="mt-1 text-[13px] leading-relaxed text-[#f5f0e8]/85">{text}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="flex flex-col gap-4">
                      <div className="rounded-lg border border-[#00B4D8]/25 bg-[#00B4D8]/[0.07] px-4 py-3">
                        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#00B4D8]">Result</span>
                        <p className="mt-1 text-[14px] font-semibold leading-relaxed text-[#f5f0e8]">{proj.result}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {proj.stack.map((t) => (
                          <span key={t} className="rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#f5f0e8]/50">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — THE X-FACTOR                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="xfactor" className="venn-section skewable py-24 px-6 md:px-16 overflow-hidden">
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
              <svg viewBox="0 0 420 400" className="venn-svg w-full max-w-md" style={{ overflow: "visible" }}>
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

                {/* Arrow from centroid → photo (centroid ≈ average of 3 circle centers) */}
                <defs>
                  <marker id="venn-ah" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#00B4D8" />
                  </marker>
                </defs>
                <line
                  className="venn-arrow"
                  x1="215" y1="179" x2="520" y2="179"
                  stroke="#00B4D8" strokeWidth="2"
                  strokeDasharray="7 5" strokeLinecap="round"
                  markerEnd="url(#venn-ah)"
                />
              </svg>
            </div>

            {/* RIGHT — Photo + trait cards */}
            <div className="w-full lg:w-[48%] flex flex-col items-center gap-8">

              {/* Photo with pulsing shadow */}
              <div className="relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(0,180,216,0.10) 0%, transparent 70%)" }} />
                <img
                  src={arshHalftone}
                  alt="Arsh Chatrath"
                  className="h-72 md:h-80 lg:h-[26rem] object-contain relative z-10 venn-photo"
                  loading="lazy"
                  decoding="async"
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
      {/* SECTION 7 - FAQ */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="faq-section skewable py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="text-center mb-12">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#00B4D8] mb-3 fade-up">Before you ask</p>
            <div className="reveal-wrap overflow-hidden">
              <h2 className="reveal-heading" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
                Questions I get a lot
              </h2>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-16" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <FaqBoard />
        </div>

        {/* FAQ rich result - mirrors the visible answers above */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQS.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            }),
          }}
        />
      </section>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 8 — HIRE ME                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="hire" className="hire-section min-h-[60vh] flex items-center justify-center relative overflow-hidden py-24">
        {/* Animated gradient wash behind the sign-off */}
        <AnimatedGradientBackground
          Breathing={!reduceMotion}
          startingGap={125}
          breathingRange={9}
          animationSpeed={0.02}
          gradientColors={[
            "#0a0a0a",
            "#08222a",
            "#0d4a5a",
            "#00849e",
            "#00B4D8",
            "#5fd8ef",
            "#0a0a0a",
          ]}
          gradientStops={[35, 52, 64, 74, 84, 92, 100]}
        />
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 items-center gap-12 relative z-10">
          
          {/* LEFT — Arsh with mic in audience */}
          <div className="parallax-left hidden md:flex justify-end select-none h-[300px] pointer-events-none">
            <img src={arshAudience} alt="" aria-hidden="true" className="h-full w-auto object-contain" loading="lazy" decoding="async" />
          </div>

          {/* CENTER — content */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-center text-center">
            <h2
              className="overflow-visible whitespace-nowrap"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(2.5rem, 7vw, 7rem)", lineHeight: 1.1, letterSpacing: "-0.04em", perspective: "1200px" }}
            >
              <span className="hire-w0 inline-block mr-[0.2em]" style={{ opacity: 0 }}>HIRE</span>
              <span className="hire-w1 inline-block mr-[0.2em]" style={{ opacity: 0 }}>ME</span>
              <span className="hire-w2 inline-block text-[#00B4D8]" style={{ opacity: 0 }}>&lt;3</span>
            </h2>

            <div className="mt-8 flex flex-col gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <a href="tel:+919888230798" data-hover className="contact-phone text-[#f5f0e8]/70 text-lg hover:text-[#00B4D8] transition-colors">+91 98882 30798</a>
              <a href="mailto:achatrath_be23@thapar.edu" data-hover className="contact-email text-[#f5f0e8]/70 text-lg hover:text-[#00B4D8] transition-colors">achatrath_be23@thapar.edu</a>
            </div>

            {/* Button with wipe + arrow nudge */}
            <a
              href="mailto:achatrath_be23@thapar.edu"
              data-hover
              data-magnetic
              className="lets-talk-btn mt-8 inline-flex items-center gap-2 text-[#0a0a0a] font-bold text-base uppercase tracking-widest px-8 py-4 rounded-full relative overflow-hidden group"
              style={{ background: "#00B4D8", boxShadow: "0 0 30px rgba(0,180,216,0.35)" }}
            >
              <span className="btn-wipe absolute inset-0 bg-[#f5f0e8] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 rounded-full" />
              <span className="relative z-10">Let's Talk</span>
              <span className="relative z-10 btn-arrow transition-transform duration-200 group-hover:translate-x-1.5">→</span>
            </a>
          </div>

          {/* RIGHT — Arsh thumbs up */}
          <div className="parallax-right hidden md:flex justify-start select-none h-[300px] pointer-events-none">
            <img src={arshThumbsUp} alt="" aria-hidden="true" className="h-full w-auto object-contain" loading="lazy" decoding="async" />
          </div>

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

        /* FAQ board — one screen, cards expand instead of scrolling */
        .faq-card {
          flex-basis: 0;
          transition:
            flex-grow 0.62s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.4s ease,
            background-color 0.4s ease;
        }
        .faq-card:focus-visible {
          outline: 2px solid #00B4D8;
          outline-offset: 2px;
        }
        /* Spotlight that follows the pointer across the card */
        .faq-spot {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
          background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%),
                      rgba(0,180,216,0.13), transparent 68%);
        }
        .faq-card:hover .faq-spot { opacity: 1; }

        /* Teal edge marking the open card */
        .faq-card::after {
          content: "";
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #00B4D8, rgba(0,180,216,0.12));
          transform: scaleY(0);
          transform-origin: top center;
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .faq-card[aria-expanded="true"]::after,
        .faq-card:hover::after { transform: scaleY(1); }

        @media (prefers-reduced-motion: reduce) {
          .faq-card, .faq-card span, .faq-card::after { transition: none !important; }
        }

        /* ASCII morph stage */
        .ascii-stage .ascii-pre {
          font-family: 'DM Mono', ui-monospace, monospace;
          font-size: clamp(4px, 0.92vw, 11px);
          line-height: 0.58em;
          letter-spacing: 0.02em;
          color: rgba(0, 180, 216, 0.9);
        }

        /* Section-to-section transition overlays */
        .rz-curtain, .pm-scrim { will-change: transform, opacity; }

        /* Respect the OS reduced-motion setting */
        @media (prefers-reduced-motion: reduce) {
          .hero-glow-bg, .journey-path, .ticker-track, .venn-photo {
            animation: none !important;
          }
          * { scroll-behavior: auto !important; }
        }
      `}</style>
      </div>
    </>
  );
}
