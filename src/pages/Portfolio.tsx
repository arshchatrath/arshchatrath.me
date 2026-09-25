import { Fragment, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { SplitText } from "gsap/SplitText";
import { usePageMeta } from "@/lib/page-meta";
import { EASE, DUR, STAGGER, deviceTier, prefersReducedMotion } from "@/lib/motion";
import { fieldState } from "@/gl/fieldState";
import Preloader from "@/components/Preloader";
import AsciiStory from "@/components/AsciiStory";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

// ── Images (user-provided, transparent PNGs) ────────────────────────────────
import arshCrossedArm   from "@imgs/Arsh Crossed Arm.webp";
import goldenTemple     from "@imgs/Amritsar golden temple.webp";
import thaparUniversity from "@imgs/Thapar university patiala.webp";
import monkeyThinking   from "@imgs/Monkey thinking.webp";
import monkeyRealising  from "@imgs/Monkey realising.webp";
import arshHalftone     from "@imgs/Arsh smiling with mic in hand.webp";
import arshAudience     from "@imgs/Arsh with mic in audience.webp";
import arshThumbsUp     from "@imgs/Arsh thumbs up.webp";
import banner1          from "@imgs/1.webp";
import banner2          from "@imgs/2.webp";
import banner3          from "@imgs/3.webp";

gsap.registerPlugin(ScrollTrigger, SplitText);

// ── Static data ──────────────────────────────────────────────────────────────
const HERO_NAME = "ARSH CHATRATH";
const HERO_TAGLINE = "Product & Growth Builder";
// What the name flickers through before it settles (kept to narrowish glyphs,
// so a letter's slot never has to hold a W).
const NAME_NOISE = "ABCDEFGHKLNOPRSTUVXYZ0123456789#%&*";
// Water-drop hover: a displacement map for a round lens, drawn once. Red and
// green hold how far to pull each pixel towards the centre (128 = stay put),
// fading to nothing at the rim, so the edge of the drop is seamless.
let lensMap = "";
function getLensMap() {
  if (lensMap) return lensMap;
  const n = 128;
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(n, n);
  const peak = 0.2862; // max of u(1-u^2)^2, so the strongest pull maps to full range
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const u = (x + 0.5) / n * 2 - 1;
      const v = (y + 0.5) / n * 2 - 1;
      const r2 = u * u + v * v;
      const g = r2 < 1 ? (1 - r2) * (1 - r2) / peak : 0;
      const o = (y * n + x) * 4;
      img.data[o] = Math.round(128 - 127 * u * g);
      img.data[o + 1] = Math.round(128 - 127 * v * g);
      img.data[o + 2] = 128;
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return (lensMap = c.toDataURL());
}

// Three numbers under the intro. `s` is the suffix, drawn in teal.
const HERO_PROOF = [
  { n: "8,000", s: "+", v: "users on Talkeys" },
  { n: "12,000", s: "+", v: "Helix signups" },
  { n: "Top 1", s: "%", v: "Amazon ML School '25" },
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
    role: "Founding Product & Growth Associate · owned the roadmap and prioritisation",
    approach: "User research → A/B tested 3 engagement strategies → prioritised features by data",
    result: "60% lift in participation · 8,000+ users on the platform",
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
    result: "₹8.5L+ in revenue · Top 15 Campus Partners nationwide",
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
    result: "73% accuracy on 500+ samples · 3rd place at the Indian-Israeli Hackathon",
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
    a: "The Talkeys community platform (8,000+ users, 60% lift in participation), a capstone team-finder portal that replaced fragmented WhatsApp groups, and ₹8.5L+ in revenue as a Perplexity Campus Partner.",
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
                fontFamily: "var(--ff-display)",
                fontWeight: 800,
                fontSize: "13rem",
                color: "rgba(0,180,216,0.07)",
              }}
            >
              {i + 1}
            </span>

            {/* Index — always visible, anchors the card while it resizes */}
            <span
              className={`absolute top-4 left-4 z-10 font-mono text-xs tracking-[0.25em] transition-colors duration-500 ${
                open ? "text-[#00B4D8]" : "text-[#f5f0e8]/55"
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

// ─────────────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<HTMLDivElement>(null);
  const lenisRef      = useRef<Lenis | null>(null);
  const [intro, setIntro] = useState(false);
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
    }, 4500);
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

  // ── Hero: entrance and the living name ───────────────────────────────────
  // Runs the moment the loader hands over, on its own, so nothing heavier
  // competes with it while the loader fades.
  useEffect(() => {
    if (!intro || prefersReducedMotion()) return;

      // ── SECTION 1: Hero ─────────────────────────────────────────────────────
      // Each letter of the name has two live font axes: width (75 to 100) and
      // weight. heroState holds the current values and a ticker eases them toward
      // targets set by the pointer (letters near it widen), the scroll (the name
      // thins as it leaves) and a single breath after the entrance.
      const heroChars = gsap.utils.toArray<HTMLElement>(".hero-char");
      const heroState = heroChars.map(() => ({ w: 75, g: 760, breath: 0 }));
      let heroCenters: { x: number; y: number }[] = [];
      let heroRadius = 150;
      const nameEl = document.querySelector<HTMLElement>(".hero-name");
      const nameBox = { x: 0, y: 0, w: 0, h: 0 };
      const cacheHeroCenters = () => {
        const nb = nameEl?.getBoundingClientRect();
        if (nb) Object.assign(nameBox, { x: nb.left + scrollX, y: nb.top + scrollY, w: nb.width, h: nb.height });
        heroCenters = heroChars.map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY };
        });
        heroRadius = (parseFloat(getComputedStyle(heroChars[0]).fontSize) || 120) * 1.15;
      };

      // The name forms out of noise: every letter rises in as a random
      // character, flickers through a few more, and settles into place, left
      // to right. Each letter's slot is pinned to its final width meanwhile,
      // so the line doesn't jitter as the glyphs change.
      const finals = heroChars.map((el) => el.textContent ?? "");
      heroChars.forEach((el) => {
        el.style.width = `${el.getBoundingClientRect().width}px`;
        el.style.textAlign = "center";
      });
      const scramble = { t: 0 };
      let lastFlick = -1;
      const scrambleStep = () => {
        const flick = Math.floor(scramble.t * 24); // about 20 glyph changes a second
        if (flick === lastFlick) return;
        lastFlick = flick;
        heroChars.forEach((el, i) => {
          const settles = 0.3 + (i / heroChars.length) * 0.62;
          el.textContent = scramble.t >= settles ? finals[i] : NAME_NOISE[(Math.random() * NAME_NOISE.length) | 0];
        });
      };
      const settleName = () => {
        heroChars.forEach((el, i) => {
          el.textContent = finals[i];
          el.style.width = "";
          el.style.textAlign = "";
        });
      };
      scrambleStep();

      const heroTl = gsap.timeline({ defaults: { ease: EASE.out } });
      heroTl
        .fromTo(".hero-kicker", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: DUR.base }, 0)
        .fromTo(heroChars, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: STAGGER.tight }, 0.05)
        .to(scramble, { t: 1, duration: 1.15, ease: "none", onUpdate: scrambleStep, onComplete: settleName }, 0.05)
        // the one allowed overshoot on the page: the stamp lands
        .fromTo(".hero-stamp", { scale: 1.14, rotate: 6 }, { scale: 1, rotate: 0, duration: 0.8, ease: EASE.pop }, 0.3)
        .fromTo(".hero-lead", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.base }, 0.45)
        // the numbers rise out of their rule, like the letters of the name
        .fromTo(".hero-stats", { opacity: 0 }, { opacity: 1, duration: DUR.fast }, 0.55)
        .fromTo(".stat-num > span", { yPercent: 105 }, { yPercent: 0, duration: DUR.base, stagger: STAGGER.loose }, 0.55)
        .fromTo(".hero-cta", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: DUR.base }, 0.7)
        // and the postmark is struck over the stamp's corner
        .fromTo(".hero-postmark", { opacity: 0, scale: 1.45, rotate: -24 }, { opacity: 1, scale: 1, rotate: -12, duration: 0.32, ease: "power4.in" }, 0.95)
        .fromTo(".hero-stamp img", { y: 0 }, { y: 3, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.out" }, 1.27)
        .add(cacheHeroCenters)
        // one breath through the letters, so the name reads as alive before
        // anyone touches it (and on phones, where nobody can hover)
        .to(heroState, { breath: 1, duration: 0.45, ease: EASE.ambient, yoyo: true, repeat: 1, stagger: 0.05 }, 1.1);

      const finePointer = window.matchMedia("(pointer: fine)").matches;
      let hx = -1e5;
      let hy = -1e5;
      const onHeroPointer = (e: PointerEvent) => {
        hx = e.clientX + scrollX;
        hy = e.clientY + scrollY;
      };
      if (finePointer) window.addEventListener("pointermove", onHeroPointer, { passive: true });

      // Tagline: a small ripple through the letters, from wherever the
      // pointer comes in. Once after the entrance (so phones see it too),
      // then on hover.
      const tagEl = document.querySelector<HTMLElement>(".hero-kicker");
      const tagChars = gsap.utils.toArray<HTMLElement>(".tag-char");
      let ripple: gsap.core.Tween | null = null;
      const rippleTag = (from: number) => {
        if (ripple?.isActive()) return;
        ripple = gsap.fromTo(tagChars, { y: 0, color: "#00B4D8" }, {
          y: -3, color: "#f5f0e8", duration: 0.2, ease: "sine.out", yoyo: true, repeat: 1,
          stagger: { each: 0.025, from },
        });
      };
      heroTl.call(() => rippleTag(0), [], 1.35);
      const onTagEnter = (e: PointerEvent) => {
        const r = tagEl?.getBoundingClientRect();
        if (!r) return;
        rippleTag(Math.round(((e.clientX - r.left) / r.width) * (tagChars.length - 1)));
      };
      if (finePointer) tagEl?.addEventListener("pointerenter", onTagEnter);

      let heroThin = 0; // 0 at the top of the page, 1 once the hero has left
      const heroST = ScrollTrigger.create({
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => { heroThin = self.progress; },
      });

      const heroTick = () => {
        if (heroThin >= 1 || !heroCenters.length) return;
        for (let i = 0; i < heroChars.length; i++) {
          const st = heroState[i];
          let near = 0;
          if (finePointer) {
            const c = heroCenters[i];
            const t = Math.max(0, 1 - Math.hypot(hx - c.x, hy - c.y) / heroRadius);
            near = t * t * (3 - 2 * t);
          }
          const lift = Math.max(near, st.breath * 0.8);
          const tw = 75 + 17 * lift;
          const tg = 760 + 40 * lift - 300 * heroThin;
          const nw = st.w + (tw - st.w) * 0.16;
          const ng = st.g + (tg - st.g) * 0.2;
          // Only touch the page when something visibly changed: an idle hero
          // costs nothing per frame.
          if (Math.abs(nw - st.w) > 0.05 || Math.abs(ng - st.g) > 0.5) {
            st.w = nw;
            st.g = ng;
            heroChars[i].style.fontVariationSettings = `"wdth" ${nw.toFixed(1)}, "wght" ${ng.toFixed(0)}`;
          }
        }
      };
      gsap.ticker.add(heroTick);

      // Water drop: hovering the name puts a drop of water under the pointer
      // that magnifies the letters beneath it. It trails the pointer, swells
      // and stretches the way you move (so it drags, a little sticky), and
      // dries up when you leave. The filter is only attached while it's there.
      const liquid = document.getElementById("hero-liquid");
      const lens = liquid?.querySelector("feImage");
      const disp = liquid?.querySelector("feDisplacementMap");
      if (lens && finePointer) lens.setAttribute("href", getLensMap());
      let wet = 0;
      let lx = hx;
      let ly = hy;
      let prevX = hx;
      let prevY = hy;
      let sx = 0; // smoothed speed, per axis
      let sy = 0;
      let wetOn = false;
      const liquidTick = () => {
        if (!nameEl || !lens || !disp || !nameBox.w) return;
        const vx = Math.abs(hx - prevX);
        const vy = Math.abs(hy - prevY);
        prevX = hx;
        prevY = hy;
        sx += (Math.min(vx, 60) - sx) * 0.15;
        sy += (Math.min(vy, 60) - sy) * 0.15;
        const pad = heroRadius * 0.3;
        const over = hx > nameBox.x - pad && hx < nameBox.x + nameBox.w + pad && hy > nameBox.y - pad && hy < nameBox.y + nameBox.h + pad;
        const target = over && heroThin < 0.5 ? 0.6 + 0.4 * Math.min(1, (sx + sy) / 30) : 0;
        wet += (target - wet) * (target > wet ? 0.18 : 0.08);
        lx += (hx - lx) * 0.22; // trails the pointer, like a drag through liquid
        ly += (hy - ly) * 0.22;
        if (wet < 0.01) {
          if (wetOn) {
            nameEl.style.filter = "";
            wetOn = false;
          }
          return;
        }
        if (!wetOn) {
          nameEl.style.filter = "url(#hero-liquid)";
          wetOn = true;
        }
        const r = heroRadius * 0.62 * (0.55 + 0.45 * wet);
        const w = r * 2 * (1 + sx / 45);
        const h = r * 2 * (1 + sy / 45);
        lens.setAttribute("x", (lx - nameBox.x - w / 2).toFixed(1));
        lens.setAttribute("y", (ly - nameBox.y - h / 2).toFixed(1));
        lens.setAttribute("width", w.toFixed(1));
        lens.setAttribute("height", h.toFixed(1));
        disp.setAttribute("scale", (wet * r * 0.55).toFixed(1));
      };
      if (finePointer) gsap.ticker.add(liquidTick);

      const onHeroResize = () => { gsap.delayedCall(0.2, cacheHeroCenters); };
      window.addEventListener("resize", onHeroResize);
      const heroCleanup = () => {
        window.removeEventListener("pointermove", onHeroPointer);
        window.removeEventListener("resize", onHeroResize);
        gsap.ticker.remove(heroTick);
        gsap.ticker.remove(liquidTick);
        tagEl?.removeEventListener("pointerenter", onTagEnter);
        ripple?.kill();
        settleName();
        if (nameEl) nameEl.style.filter = "";
        heroST.kill();
        heroTl.kill();
      };
    return heroCleanup;
  }, [intro]);

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
    };
  }, [pageReady]);

  return (
    <>
      {!loaderGone && (
        <Preloader onReveal={() => setIntro(true)} onDone={() => setLoaderGone(true)} />
      )}

      <div
        ref={containerRef}
        className="text-[#f5f0e8] min-h-screen relative overflow-x-clip"
      >
        {/* Scroll progress */}
        <div ref={progressRef} className="fixed top-0 left-0 w-full h-[2px] bg-[#00B4D8] z-[9997] origin-left pointer-events-none" />

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav
        aria-label="Primary"
        className="fixed top-0 left-0 w-full z-40 flex items-center justify-between gutter-x py-5 backdrop-blur-md bg-[#0a0a0a]/50 border-b border-white/5"
      >
        <div className="flex items-center gap-5">
          <a
          href="#top"
          data-hover
          onClick={(e) => { e.preventDefault(); lenisRef.current?.scrollTo(0); }}
          className="font-mono text-xs tracking-[0.3em] uppercase text-[#f5f0e8]/80 hover:text-[#00B4D8] transition-colors"
          style={{ fontFamily: "var(--ff-body)" }}
        >
          Arsh Chatrath
        </a>
          <span className="nav-chapter hidden lg:block font-mono text-xs tracking-[0.3em] uppercase text-[#f5f0e8]/55">
          01 / 09 &mdash; intro
        </span>
        </div>
        <div className="flex items-center gap-4 md:gap-7">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              data-hover
              onClick={(e) => { e.preventDefault(); lenisRef.current?.scrollTo(href, { offset: -72 }); }}
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
      <section className="hero-section relative min-h-[100svh] flex items-center gutter-x pt-[calc(var(--nav-h)+var(--space-stack))] pb-[var(--space-block)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none hero-glow-bg" />

        {/* Water drop: a lens (set from the effect) laid on a flat grey map.
            Grey means "don't move"; sRGB keeps that grey the exact midpoint. */}
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <filter id="hero-liquid" x="-5%" y="-25%" width="110%" height="150%" colorInterpolationFilters="sRGB">
            <feFlood floodColor="rgb(128,128,128)" result="flat" />
            <feImage x="0" y="0" width="0" height="0" preserveAspectRatio="none" result="lens" />
            <feMerge result="map">
              <feMergeNode in="flat" />
              <feMergeNode in="lens" />
            </feMerge>
            <feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        <div className="hero-inner relative w-full max-w-[1600px] mx-auto">
          <p data-wire="Text / kicker" className="hero-kicker opacity-0 w-fit font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#00B4D8]">
            <span className="sr-only">{HERO_TAGLINE}</span>
            <span aria-hidden="true">
              {HERO_TAGLINE.split("").map((c, i) => (
                <span key={i} className="tag-char inline-block">{c === " " ? "\u00a0" : c}</span>
              ))}
            </span>
          </p>

          {/* Sized in CSS from the width and the height (see .hero-inner). The
              h1's aria-label carries the name; the letters are presentational. */}
          <h1
            data-wire="H1 / name"
            aria-label="Arsh Chatrath"
            className="hero-name mt-3 w-fit whitespace-nowrap"
            style={{ fontFamily: "var(--ff-display)", fontWeight: 800, lineHeight: 0.82, letterSpacing: "-0.02em" }}
          >
            <span aria-hidden="true" className="contents">
              {HERO_NAME.split(" ").map((word, wi) => (
                <Fragment key={word}>
                  {wi > 0 && <span className="name-gap" />}
                  <span className="name-line">
                    {word.split("").map((ch, i) => (
                      <span key={i} className="hero-char opacity-0 inline-block">{ch}</span>
                    ))}
                  </span>
                </Fragment>
              ))}
            </span>
          </h1>

          {/* The stamp: overlaps the name like a stamp on an envelope. Visible
              from the first frame (it is the page's largest element). */}
          <div data-wire="Image / portrait" className="hero-stamp">
            <img
              src="/img/hero-800.webp"
              srcSet="/img/hero-320.webp 320w, /img/hero-480.webp 480w, /img/hero-800.webp 800w, /img/hero-1080.webp 1080w"
              sizes="(min-width: 1024px) 22vw, 42vw"
              width={1080}
              height={1350}
              alt="Arsh Chatrath speaking at a microphone"
              className="block w-full h-auto rotate-[4deg] drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]"
              fetchPriority="high"
              decoding="async"
            />
            {/* Postmark: says "open to internships" in the stamp's own
                language. Decorative; the intro says the same in plain text. */}
            <svg className="hero-postmark opacity-0" viewBox="0 0 240 120" aria-hidden="true">
              <defs>
                <path id="pm-ring" d="M 60 60 m -41 0 a 41 41 0 1 1 82 0 a 41 41 0 1 1 -82 0" />
                <filter id="pm-ink" x="-5%" y="-5%" width="110%" height="110%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
                  <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.7" />
                  <feComposite in="SourceGraphic" operator="in" />
                </filter>
              </defs>
              <g filter="url(#pm-ink)" fill="none" stroke="currentColor">
                <circle cx="60" cy="60" r="54" strokeWidth="3" />
                <circle cx="60" cy="60" r="31" strokeWidth="1.5" />
                <text fill="currentColor" stroke="none" fontSize="10.5" letterSpacing="1.6" style={{ fontFamily: "var(--ff-mono)" }}>
                  <textPath href="#pm-ring" textLength="252" lengthAdjust="spacing">OPEN TO INTERNSHIPS · PATIALA · INDIA ·</textPath>
                </text>
                <text x="60" y="57" textAnchor="middle" fill="currentColor" stroke="none" fontSize="12" style={{ fontFamily: "var(--ff-mono)" }}>PB</text>
                <text x="60" y="72" textAnchor="middle" fill="currentColor" stroke="none" fontSize="11" style={{ fontFamily: "var(--ff-mono)" }}>147004</text>
                {[34, 48, 62, 76, 90].map((y) => (
                  <path key={y} strokeWidth="2.5" d={`M 122 ${y} q 14 -8 28 0 t 28 0 t 28 0 t 28 0`} />
                ))}
              </g>
            </svg>
          </div>

          <div className="hero-copy">
            <p
              data-wire="Text / intro"
              className="hero-lead opacity-0 leading-snug text-[#f5f0e8]/75 max-w-[38rem]"
              style={{ fontFamily: "var(--ff-body)" }}
            >
              Founding Product &amp; Growth Associate at <span className="text-[#f5f0e8]">Talkeys</span>,
              studying CS &amp; Business Systems at <span className="text-[#f5f0e8]">Thapar</span>.
              Looking for product and growth internships.
            </p>

            {/* A scoreboard, not badges: big numbers in the headline face,
                a hairline above, a plain label under each. */}
            <ul data-wire="List / proof" className="hero-stats opacity-0 grid grid-cols-3 max-w-[38rem] border-t border-white/20">
              {HERO_PROOF.map((p) => (
                <li key={p.v} className="hero-stat pt-3 pr-2 [&+&]:border-l [&+&]:border-white/10 [&+&]:pl-3 md:[&+&]:pl-5">
                  <span className="stat-num block overflow-hidden">
                    <span className="block">
                      {p.n}<span className="text-[#00B4D8]">{p.s}</span>
                    </span>
                  </span>
                  <span className="mt-1.5 block font-mono text-xs uppercase leading-snug tracking-[0.08em] text-[#f5f0e8]/60">{p.v}</span>
                </li>
              ))}
            </ul>

            <div data-wire="Button / CTA" className="hero-cta opacity-0 flex flex-wrap items-center gap-x-7 gap-y-3" style={{ fontFamily: "var(--ff-body)" }}>
              <a
                href="#hire"
                data-hover
                data-magnetic
                onClick={(e) => { e.preventDefault(); lenisRef.current?.scrollTo("#hire", { offset: -72 }); }}
                className="hero-btn group inline-flex items-center gap-3 rounded-[3px] bg-[#00B4D8] px-5 py-3 text-base font-semibold text-[#0a0a0a]"
              >
                Hire me
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
              <a
                href="/resume"
                data-hover
                className="text-base font-medium text-[#f5f0e8]/85 underline decoration-[#f5f0e8]/30 decoration-1 underline-offset-[7px] transition-colors hover:text-[#00B4D8] hover:decoration-[#00B4D8]"
              >
                Resume <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — HELLO I'M ARSH                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="about-section skewable section-pad max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-[var(--space-block)] items-center">
          {/* LEFT */}
          <div className="about-left opacity-0">
            <div className="reveal-wrap overflow-hidden">
              <h2 className="reveal-heading" style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1 }}>
                HELLO<br />I'M ARSH
              </h2>
            </div>
            <p className="text-[#00B4D8] font-mono text-xs uppercase tracking-[0.3em] mt-4 mb-6">
              Thapar Institute, Patiala
            </p>
            <p className="reveal-copy text-[#f5f0e8]/70 leading-relaxed mb-8" style={{ fontFamily: "var(--ff-body)" }}>
              Most of what I have built started as something that annoyed me. A community
              nobody was showing up to. A capstone scramble spread across WhatsApp groups.
              A job hunt eating an hour every morning. I research it, test it, measure it,
              and ship. Then I do it again. First of 250+ teams at IIT Roorkee's
              InnoQuest, Top 15 nationally at AMEX, and in the top 1% picked for
              Amazon ML School.
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
                    <span className="text-[#f5f0e8]/80" style={{ fontFamily: "var(--ff-body)" }}>{text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photo, with the Amritsar to Patiala map right under it. Shown on
              the left from tablet up (text first on phones, for reading order). */}
          <div className="md:order-first flex flex-col items-center gap-[var(--space-stack)]">
            <div className="about-right opacity-0 flex justify-center">
              <div style={{ transform: "rotate(-3deg)", filter: "drop-shadow(0 20px 50px rgba(0,180,216,0.12))" }}>
                <img src={arshCrossedArm} width={528} height={660} alt="Arsh Chatrath, arms crossed" className="w-[min(16rem,62vw)] md:w-80 h-auto object-contain" loading="lazy" decoding="async" />
              </div>
            </div>

            {/* Journey map */}
            <div className="journey-map w-full max-w-[36rem] flex items-end justify-between gap-3 relative">
              {/* Amritsar */}
              <div className="flex flex-col items-center gap-2 fade-up">
                <img src={goldenTemple} width={318} height={188} alt="Golden Temple, Amritsar" className="w-[clamp(7.5rem,15vw,13rem)] h-auto object-contain drop-shadow-xl" loading="lazy" decoding="async" />
                <span className="font-mono text-xs tracking-widest uppercase text-[#f5f0e8]/50">Amritsar</span>
              </div>

              {/* Traveling dashed SVG arrow */}
              <div className="flex-1 min-w-[3rem] self-center relative h-14 md:h-16">
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
              <div className="flex flex-col items-center gap-2 fade-up">
                <img src={thaparUniversity} width={368} height={222} alt="Thapar University, Patiala" className="w-[clamp(7.5rem,15vw,13rem)] h-auto object-contain drop-shadow-xl" loading="lazy" decoding="async" />
                <span className="font-mono text-xs tracking-widest uppercase text-[#f5f0e8]/50">Patiala</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTIONS 3-4 — THE QUESTIONS TURN INTO THE LESSONS                  */}
      {/* One held scene: an ASCII wall spreads from the thinking monkey,     */}
      {/* covers everything, and pulls back into the realising monkey.        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <AsciiStory
        first={
          <section className="pm-section section-pad overflow-x-clip">
            <div className="story-grid max-w-7xl mx-auto">
              <div className="sg-head">
                <div className="reveal-wrap overflow-hidden">
                  <h2 className="reveal-heading" style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
                    What does it take to be a great PM?
                  </h2>
                </div>
                <p className="text-[#00B4D8] font-mono text-xs uppercase tracking-[0.3em] mt-3">I asked myself:</p>
              </div>

              <div className="sg-art monkey-left opacity-0">
                <img src={monkeyThinking} width={624} height={780} alt="" data-story-origin
                  className="story-img" loading="lazy" decoding="async" />
              </div>

              <ul className="sg-text flex flex-col gap-3 md:gap-5">
                {PM_QUESTIONS.map((q, i) => (
                  <li key={i} className="pm-question opacity-0 flex gap-4 items-start"
                    style={{ fontFamily: "var(--ff-body)" }}>
                    <span className="text-[#00B4D8] text-xl shrink-0 leading-none mt-0.5">•</span>
                    <span className="text-[#f5f0e8]/85 text-base md:text-lg leading-snug">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        }
        second={
          <section className="realize-section section-pad overflow-x-clip">
            <div className="story-grid story-grid--flip max-w-7xl mx-auto">
              <div className="sg-head flex items-center gap-6">
                <div className="reveal-wrap overflow-hidden">
                  <h2 className="reveal-heading" style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
                    I Realized…
                  </h2>
                </div>
                <svg width="60" height="20" viewBox="0 0 60 20" fill="none" aria-hidden="true" className="hidden sm:block shrink-0">
                  <path d="M 0 10 L 48 10" stroke="#00B4D8" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
                  <polygon points="46,5 60,10 46,15" fill="#00B4D8" />
                </svg>
              </div>

              <ul className="sg-text flex flex-col gap-3 md:gap-6">
                {REALIZATIONS.map((r, i) => (
                  <li key={i} className="realization opacity-0 flex gap-4 items-start"
                    style={{ fontFamily: "var(--ff-body)" }}>
                    <span className="text-[#00B4D8] font-bold text-lg shrink-0 leading-none mt-0.5">→</span>
                    <span className="text-[#f5f0e8]/85 text-base md:text-lg leading-snug">{r}</span>
                  </li>
                ))}
              </ul>

              <div className="sg-art monkey-right opacity-0">
                <img src={monkeyRealising} width={624} height={780} alt="" data-story-origin
                  className="story-img" loading="lazy" decoding="async" />
              </div>
            </div>
          </section>
        }
      />

      <div className="gutter-x pb-[var(--space-section)] pt-[var(--space-block)]">
        <p className="proof-callout opacity-0 text-center font-bold text-[#f5f0e8] leading-tight max-w-4xl mx-auto"
          style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(1.2rem, 2.8vw, 2.2rem)" }}>
          THESE WEREN'T JUST REALIZATIONS. THESE WERE BATTLE TESTED LESSONS.
          AND HERE'S THE PROOF…
        </p>
      </div>


      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 — PROOF, NOT PROMISES                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="work" className="work-section relative section-pad">
        {/* Heading left. The ticker runs out from behind it to the right
            edge, fading in where it meets the heading, so it never crosses
            the text. On phones the heading is full width: ticker below it. */}
        <div className="work-head max-w-7xl mx-auto w-full md:flex md:items-center md:gap-6">
          <div className="reveal-wrap overflow-hidden shrink-0">
            <h2 className="reveal-heading" style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 3.8rem)", letterSpacing: "-0.02em" }}>
              PROOF, NOT JUST PROMISES
            </h2>
          </div>
          <div aria-hidden="true" className="work-ticker mt-4 md:mt-0 min-w-0 md:flex-1 overflow-hidden border-y border-[#00B4D8]/20 bg-[#00B4D8]/[0.03] py-1.5 mx-[calc((100%-100vw)/2)] md:ml-0">
            <div className="ticker-track flex gap-12 whitespace-nowrap">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="text-[#00B4D8] font-mono text-xs tracking-[0.35em] uppercase shrink-0">
                  SEVEN PROJECTS · THREE DISCIPLINES ·
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full mt-[var(--space-block)] grid lg:grid-cols-[190px_minmax(0,1fr)] gap-10">
          {/* Category rail — tracks which discipline you are reading */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 flex flex-col gap-7" style={{ fontFamily: "var(--ff-body)" }}>
              {CATEGORIES.map((c) => {
                const count = PROJECTS.filter((x) => x.category === c.name).length;
                return (
                  <div key={c.name} className="cat-item" data-cat={c.name}>
                    <div className="flex items-baseline gap-2">
                      <span className="cat-dot h-1.5 w-1.5 rounded-full bg-[#00B4D8]/30 transition-colors" />
                      <span className="cat-name font-mono text-xs uppercase tracking-[0.22em] text-[#f5f0e8]/55 transition-colors">
                        {c.name}
                      </span>
                      <span className="font-mono text-xs text-[#f5f0e8]/55">{String(count).padStart(2, "0")}</span>
                    </div>
                    <p className="cat-blurb mt-1 pl-3.5 text-xs leading-snug text-[#f5f0e8]/55 transition-colors">
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
                className="work-card group opacity-0 md:sticky rounded-2xl border border-white/12 bg-[#0b0b0b] overflow-hidden shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.9),0_30px_80px_-40px_rgba(0,0,0,1)]"
                style={{ top: "calc(7.5rem + " + i * 10 + "px)" }}
              >
                {/* Media strip — banner art stays at its designed 120px */}
                <div className="relative flex items-center justify-center overflow-hidden border-b border-white/8" style={{ height: 120, background: "#161616" }}>
                  {proj.img ? (
                    <img src={proj.img} width={1000} height={194} alt={proj.title} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                  ) : (
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-6 text-center">
                      {proj.flow?.map((f) => (
                        <span
                          key={f}
                          className={
                            "font-mono text-xs md:text-xs tracking-[0.25em] " +
                            (f.startsWith("→") ? "text-[#00B4D8]" : "text-[#f5f0e8]/45")
                          }
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="absolute top-3 right-4 font-mono text-xs tracking-[0.25em] text-[#f5f0e8]/55">
                    {proj.index} / 07
                  </span>
                </div>

                <span className="block h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[#00B4D8] via-[#00B4D8]/40 to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100" />

                <div className="p-6 md:p-8" style={{ fontFamily: "var(--ff-body)" }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-xs uppercase tracking-[0.28em] text-[#00B4D8]">
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
                            className="font-mono text-xs uppercase tracking-[0.22em] text-[#f5f0e8]/55 underline-offset-4 transition-colors hover:text-[#00B4D8] hover:underline"
                          >
                            {l.label} ↗
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <h3 className="mt-3 text-[#f5f0e8] font-bold leading-tight" style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(1.4rem, 2.6vw, 2.1rem)" }}>
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
                          <dt className="font-mono text-xs uppercase tracking-[0.2em] text-[#00B4D8]/70">{label}</dt>
                          <dd className="mt-1 text-[13px] leading-relaxed text-[#f5f0e8]/85">{text}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="flex flex-col gap-4">
                      <div className="rounded-lg border border-[#00B4D8]/25 bg-[#00B4D8]/[0.07] px-4 py-3">
                        <span className="block font-mono text-xs uppercase tracking-[0.2em] text-[#00B4D8]">Result</span>
                        <p className="mt-1 text-[14px] font-semibold leading-relaxed text-[#f5f0e8]">{proj.result}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {proj.stack.map((t) => (
                          <span key={t} className="rounded-full border border-white/12 px-3 py-1 font-mono text-xs uppercase tracking-[0.15em] text-[#f5f0e8]/50">
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


      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 — THE X-FACTOR                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="xfactor" className="venn-section skewable section-pad overflow-hidden">
        <div className="xf-grid max-w-7xl mx-auto">

          <div className="xf-head">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#00B4D8] mb-3 fade-up">What sets me apart</p>
            <div className="reveal-wrap overflow-hidden">
              <h2 className="reveal-heading" style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
                The X-Factor
              </h2>
            </div>
            <p className="text-[#f5f0e8]/55 mt-3 text-sm tracking-wider fade-up" style={{ fontFamily: "var(--ff-body)" }}>
              I sit at the intersection of three rare skillsets
            </p>
          </div>

            {/* Venn diagram, under the header */}
            <div className="xf-venn flex justify-center items-center">
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
                  letterSpacing="3" style={{ fontFamily: "var(--ff-mono)" }}>
                  X-FACTOR
                </text>

                {/* Circle labels with guide lines — hoverable */}
                <text x="80" y="52" textAnchor="middle"
                  fill="#00B4D8" fontSize="12" fontFamily="var(--ff-body)"
                  fontWeight="700" letterSpacing="3" className="venn-label" style={{ cursor: "default", fontFamily: "var(--ff-body)" }}>TECHNICAL</text>
                <line x1="80" y1="58" x2="120" y2="88" stroke="rgba(0,180,216,0.3)" strokeWidth="1" strokeDasharray="3 3" />

                <text x="340" y="52" textAnchor="middle"
                  fill="rgba(200,200,220,0.8)" fontSize="12" fontFamily="var(--ff-body)"
                  fontWeight="700" letterSpacing="3" className="venn-label" style={{ cursor: "default", fontFamily: "var(--ff-body)" }}>PRODUCT</text>
                <line x1="340" y1="58" x2="300" y2="88" stroke="rgba(160,160,185,0.3)" strokeWidth="1" strokeDasharray="3 3" />

                <text x="210" y="393" textAnchor="middle"
                  fill="rgba(0,180,216,0.8)" fontSize="12" fontFamily="var(--ff-body)"
                  fontWeight="700" letterSpacing="3" className="venn-label" style={{ cursor: "default", fontFamily: "var(--ff-body)" }}>LEADERSHIP</text>
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

              {/* Photo, up beside the header */}
              <div className="xf-photo relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(18rem,120%)] aspect-square rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(0,180,216,0.10) 0%, transparent 70%)" }} />
                <img
                  src={arshHalftone} width={680} height={850}
                  alt="Arsh Chatrath"
                  className="w-full h-auto object-contain relative z-10 venn-photo"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* 3 trait cards, under the photo */}
              <div className="xf-cards grid grid-cols-3 gap-3 w-full max-w-sm">
                {[
                  { label: "Technical", color: "#00B4D8", desc: "Full-stack + systems thinking" },
                  { label: "Product",   color: "rgba(200,200,215,0.85)", desc: "User-first, data-driven" },
                  { label: "Leader",    color: "rgba(0,180,216,0.75)", desc: "Aligns teams, ships fast" },
                ].map(({ label, color, desc }) => (
                  <div key={label} className="border border-white/8 rounded p-2.5 lg:p-3 bg-white/[0.03]">
                    <div className="font-mono text-xs uppercase tracking-normal lg:tracking-widest mb-1" style={{ color }}>{label}</div>
                    <div className="text-[#f5f0e8]/50 text-xs leading-snug" style={{ fontFamily: "var(--ff-body)" }}>{desc}</div>
                  </div>
                ))}
              </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7 - FAQ */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="faq-section skewable section-y overflow-hidden">
        <div className="max-w-7xl mx-auto gutter-x">
          <div className="text-center block-gap">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#00B4D8] mb-3 fade-up">Before you ask</p>
            <div className="reveal-wrap overflow-hidden">
              <h2 className="reveal-heading" style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 4rem)" }}>
                Questions I get a lot
              </h2>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto gutter-x" style={{ fontFamily: "var(--ff-body)" }}>
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


      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SECTION 8 — HIRE ME                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="hire" className="hire-section flex items-center justify-center relative overflow-hidden section-y">
        {/* Animated gradient wash behind the sign-off. Its top edge fades out
            (.hire-wash) so it melts into the page instead of starting on a
            hard line. */}
        <AnimatedGradientBackground
          containerClassName="hire-wash"
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
            <img src={arshAudience} width={496} height={620} alt="" aria-hidden="true" className="h-full w-auto object-contain" loading="lazy" decoding="async" />
          </div>

          {/* CENTER — content */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-center text-center">
            <h2
              className="overflow-visible whitespace-nowrap"
              style={{ fontFamily: "var(--ff-display)", fontWeight: 800, fontSize: "clamp(2.5rem, 7vw, 7rem)", lineHeight: 1.1, letterSpacing: "-0.04em", perspective: "1200px" }}
            >
              <span className="hire-w0 inline-block mr-[0.2em]" style={{ opacity: 0 }}>HIRE</span>
              <span className="hire-w1 inline-block mr-[0.2em]" style={{ opacity: 0 }}>ME</span>
              <span className="hire-w2 inline-block text-[#00B4D8]" style={{ opacity: 0 }}>&lt;3</span>
            </h2>

            <div className="mt-8 flex flex-col gap-3" style={{ fontFamily: "var(--ff-body)" }}>
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
            <img src={arshThumbsUp} width={496} height={620} alt="" aria-hidden="true" className="h-full w-auto object-contain" loading="lazy" decoding="async" />
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

        /* Hero: the poster name. Its font size is computed so the name fills
           the width exactly: "ARSH CHATRATH" measures 5.10em on one line and
           "CHATRATH" 3.18em (width axis 75). The 0.93 leaves room for letters
           to widen under the cursor. Portrait phones and tablets stack it on
           two lines; wide or landscape screens set it on one. */
        /* The hero, buttons included, must fit the first screen. So the name
           is sized from the width (a share of it) and capped by the height,
           and the gaps shrink on short screens. 3.1753em and 5.1025em are the
           measured widths of "CHATRATH" and "ARSH CHATRATH". */
        .hero-inner { --name-fs: min(calc((min(100vw, 1600px) - 2 * var(--gutter)) * 0.72 / 3.1753), 11svh); }
        .hero-name { font-size: var(--name-fs); }
        .name-line { display: block; overflow: hidden; padding-bottom: 0.04em; }
        .name-gap { display: none; }
        .hero-char { font-variation-settings: "wdth" 75, "wght" 760; }
        .hero-stamp { position: relative; z-index: 2; width: clamp(110px, min(34vw, 23svh), 240px); margin: calc(var(--name-fs) * -0.3) 0 0 auto; }
        .hero-copy { margin-top: clamp(0.75rem, 2.5svh, 1.5rem); }
        .hero-lead { font-size: clamp(1.02rem, 0.9rem + 0.55vw, 1.4rem); }
        .hero-stats { margin-top: clamp(0.75rem, 2.5svh, 1.5rem); }
        .hero-cta { margin-top: clamp(1rem, 3.5svh, 2.25rem); }
        .stat-num { font-family: var(--ff-display); font-size: clamp(1.45rem, 0.8rem + 2.4vw, 2.75rem); line-height: 0.95; letter-spacing: -0.01em; color: #f5f0e8; font-variation-settings: "wdth" 75, "wght" 760; }
        .hero-btn { transition: background-color .25s, box-shadow .25s; }
        .hero-btn:hover { background: #f5f0e8; box-shadow: 4px 4px 0 #00B4D8; }
        .hero-postmark { position: absolute; left: -34%; bottom: 8%; width: 80%; color: rgba(0, 180, 216, 0.92); pointer-events: none; transform: rotate(-12deg); }
        @media (min-width: 1024px), (orientation: landscape) {
          /* --stamp-x centres the stamp in the space right of the name
             (5.1025em is the name's width), without passing the edge */
          .hero-inner {
            --name-fs: min(calc((min(100vw, 1600px) - 2 * var(--gutter)) * 0.7 / 5.1025), 19svh);
            --stamp-w: clamp(170px, min(27vw, 46svh), 440px);
            --stamp-x: min(calc((var(--name-fs) * 5.1025 + 100% - var(--stamp-w)) / 2), calc(100% - var(--stamp-w)));
          }
          .name-line { display: inline-block; vertical-align: top; }
          .name-gap { display: inline-block; width: 0.22em; }
          .hero-stamp { position: absolute; left: var(--stamp-x); top: 50%; margin: calc(var(--stamp-w) * -0.625) 0 0; width: var(--stamp-w); }
          /* the copy stops short of the stamp and its postmark */
          .hero-copy { max-width: min(58%, 40rem, calc(var(--stamp-x) - var(--stamp-w) * 0.3 - 1.5rem)); margin-top: clamp(1rem, 4svh, 3rem); }
          .hero-postmark { left: -26%; bottom: -9%; width: 88%; }
        }
        /* Portrait tablets: the intro wraps beside the stamp, magazine style,
           instead of leaving a blank block to its left. */
        @media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
          .hero-stamp { float: right; width: clamp(180px, min(34vw, 26svh), 300px); margin: calc(var(--name-fs) * -0.28) 0 1rem 2rem; }
          /* the intro wraps beside the stamp here, so keep the postmark on it */
          .hero-postmark { left: -10%; bottom: -5%; width: 66%; }
          .hero-copy { margin-top: clamp(1rem, 3svh, 2rem); }
          .hero-inner::after { content: ""; display: block; clear: both; }
        }

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

        /* X-Factor: header top-left, photo beside it, Venn under the header,
           cards under the photo */
        .xf-grid { display: grid; grid-template-columns: minmax(0, 1fr) clamp(8.5rem, 38vw, 13rem); grid-template-areas: "head photo" "venn venn" "cards cards"; column-gap: 1rem; row-gap: var(--space-stack); align-items: center; }
        .xf-head { grid-area: head; }
        .xf-venn { grid-area: venn; }
        .xf-photo { grid-area: photo; }
        .xf-cards { grid-area: cards; justify-self: center; }
        .venn-arrow { display: none; }
        @media (min-width: 768px) {
          .xf-grid { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); grid-template-areas: "head photo" "venn photo" "venn cards"; column-gap: var(--space-block); align-items: start; }
          .xf-photo { justify-self: center; width: min(100%, 22rem); }
          .venn-arrow { display: inline; }
        }
        @media (min-width: 1024px) { .xf-photo { width: min(100%, 27rem); } }
        @media (min-width: 768px) { .work-ticker { -webkit-mask-image: linear-gradient(to right, transparent, #000 5rem); mask-image: linear-gradient(to right, transparent, #000 5rem); } }
        .hire-wash { -webkit-mask-image: linear-gradient(to bottom, transparent, #000 38%); mask-image: linear-gradient(to bottom, transparent, #000 38%); }

        /* Story scene (AsciiStory). Default is the stacked layout: reduced
           motion, short screens, and the moment before the fit check. */
        .story { position: relative; --story-track: 180svh; }
        .story-click { width: fit-content; margin: 0 auto; font-family: var(--ff-mono); font-size: clamp(1rem, 0.8rem + 1.2vw, 1.75rem); letter-spacing: 0.08em; white-space: pre; color: #f2b544; }
        .story-curtain, .story-mark { display: none; }
        .story-img { display: block; width: auto; max-width: 100%; margin-inline: auto; object-fit: contain; filter: drop-shadow(0 0 40px rgba(0, 180, 216, 0.08)); }
        .story-grid { display: grid; grid-template-columns: minmax(0, 1fr) clamp(7.5rem, 36vw, 12rem); grid-template-areas: "head art" "text text"; column-gap: 1rem; row-gap: clamp(1rem, 3svh, 2rem); align-items: center; }
        .sg-head { grid-area: head; }
        .sg-art { grid-area: art; }
        .sg-text { grid-area: text; }
        .sg-art .story-img { height: clamp(8rem, 44vw, 15rem); }
        @media (min-width: 768px) {
          .story-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-areas: "head head" "art text"; column-gap: var(--space-block); }
          .story-grid--flip { grid-template-areas: "head head" "text art"; }
          .sg-art .story-img { height: clamp(12rem, 46svh, 30rem); }
        }
        /* held: one screen-tall frame that sticks while the scene plays */
        .story--pinned { height: calc(100svh + var(--story-track)); }
        .story--pinned .story-frame { position: sticky; top: 0; height: 100svh; overflow: hidden; }
        .story--pinned .story-panel { position: absolute; inset: 0; display: flex; align-items: center; padding-top: var(--nav-h); }
        .story--pinned .story-panel > section { width: 100%; padding-block: clamp(0.75rem, 3svh, 2rem); }
        .story--pinned .story-b { opacity: 0; }
        .story--pinned .story-click { position: absolute; z-index: 3; left: 50%; top: calc(50% + var(--nav-h) / 2); transform: translate(-50%, -50%); opacity: 0; padding: 0.45em 0.9em; background: #070707; pointer-events: none; }
        .story--pinned .story-curtain { display: block; position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; pointer-events: none; }
        .story--pinned .story-mark { display: block; position: absolute; left: 0; width: 1px; pointer-events: none; }
        .story-mark-q { top: 0; height: calc(0.45 * var(--story-track) + 55svh); }
        .story-mark-turn { top: calc(0.45 * var(--story-track) + 55svh); height: calc(0.1 * var(--story-track)); }
        .story-mark-l { top: calc(0.55 * var(--story-track) + 55svh); bottom: 0; }

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
