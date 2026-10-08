import banner1          from "@imgs/1.webp";
import banner2          from "@imgs/2.webp";
import banner3          from "@imgs/3.webp";

export const HERO_NAME = "ARSH CHATRATH";
export const HERO_TAGLINE = "Product & Growth Builder";
// The intro under the name. [Bracketed] words are the bright ones.
export const HERO_LEAD =
  "Founding Product & Growth Associate at [Talkeys], studying CS & Business Systems at [Thapar]. " +
  "Looking for product and growth opportunities.";
export const HERO_LEAD_WORDS = HERO_LEAD.split(" ").map((w) =>
  w.startsWith("[") ? { w: w.replace(/[[\]]/g, ""), em: true } : { w, em: false },
);

export const HERO_PROOF = [
  { n: "8,000", s: "+", v: "users on Talkeys" },
  { n: "12,000", s: "+", v: "Helix signups" },
  { n: "Top 1", s: "%", v: "Amazon ML School '25" },
];
export const PM_QUESTIONS = [
  "How do I know I'm solving the right problem?",
  "How do I balance user needs vs. business goals vs. technical feasibility?",
  "How to make decisions when there's no clear answer?",
  "How to measure if I'm actually creating impact?",
  "How do I lead without authority when I don't manage the team?",
];
export const REALIZATIONS = [
  "You balance priorities by being ruthlessly data-driven.",
  "You make decisions by forming hypotheses and testing them quickly.",
  "You measure impact through metrics that matter, not vanity metrics.",
  "You lead by building trust, being the expert, and aligning everyone around the user.",
];
export type Project = {
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

export const PROJECTS: Project[] = [
  {
    index: "01",
    category: "PRODUCT",
    img: banner3,
    title: "Perplexity AI Campus Growth",
    problem: "Drive product adoption in a saturated student market",
    role: "VIP Campus Partner · growth & user acquisition",
    approach: "Segmented target users (CS + research students) → ran campus activations by need",
    result: "₹8.5L+ in revenue · Top 15 Campus Partners nationwide",
    stack: ["Growth", "GTM", "Community"],
  },
  {
    index: "02",
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
    index: "03",
    category: "PRODUCT",
    img: banner2,
    title: "Capstone Team Finder Portal",
    problem: "Students struggled to find capstone teammates amid fragmented WhatsApp chaos",
    role: "Product Builder · identified the gap, built end to end",
    approach: "Found the pain point → built a platform for posting projects with tech requirements",
    result: "Turned scattered WhatsApp groups into one place teams actually form",
    stack: ["Full-stack", "Product"],
  },
  {
    index: "04",
    category: "AI / ML",
    title: "SafeSpace AI",
    flow: ["ESP32 WEARABLE", "VOICE", "DASS-21", "→ LATE FUSION →", "XAI EXPLANATION"],
    problem: "Stress detection is either self-reported and unreliable, or a model nobody can question",
    role: "Built end to end · wearable firmware, ML stack and API",
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
    role: "Solo build · computer vision, input layer and UI",
    approach: "Two-hand MediaPipe tracking: left hand open drives the cursor, a fist switches to scroll, pinching thumb+index or thumb+middle fires left and right click",
    result: "Controls Windows system-wide, across Chrome, VS Code, Figma and Explorer. Losing tracking never emits a stray input",
    stack: ["Python", "MediaPipe", "OpenCV"],
    links: [{ label: "Code", href: "https://github.com/arshchatrath/gestured-mouse" }],
  },
  {
    index: "06",
    category: "AUTOMATION",
    title: "AI Job Search Agent",
    flow: ["SERPAPI JOBS", "BATCH x5", "→ LLM SCORE 1-10 →", "DAILY DIGEST"],
    problem: "Finding the few listings worth applying to means scrolling job boards every day",
    role: "Solo build · workflow design and prompt engineering",
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
    role: "Solo build · agent loop, API client and tracking",
    approach: "Fetches the daily challenge plus one problem from a rotating topic list, generates a solution, submits it, then feeds the judge's failure detail back and retries up to five times",
    result: "Runs unattended once a day and tracks streak, success rate and average attempts to accept",
    stack: ["Python", "Claude Code CLI"],
    links: [{ label: "Code", href: "https://github.com/arshchatrath/leetcode-agent" }],
  },
];

export const CATEGORIES = [
  { name: "PRODUCT", blurb: "Shipped to real users" },
  { name: "AI / ML", blurb: "Models that explain themselves" },
  { name: "AUTOMATION", blurb: "Work that runs without me" },
] as const;

// Answers double as FAQPage structured data — keep them factual.
export const FAQS = [
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
    a: "Yes. I build full-stack, so I scope with engineers instead of throwing specs over the wall. That's the overlap the X-Factor section describes: technical, product and leadership.",
  },
  {
    q: "Where are you based?",
    a: "Patiala, Punjab. I'm at Thapar Institute of Engineering and Technology. I'm from Amritsar originally.",
  },
  {
    q: "What's the fastest way to reach you?",
    a: "Email: achatrath_be23@thapar.edu. Phone works too, and my full resume is one click away.",
  },
];

export const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#faq", label: "FAQ" },
  { href: "#hire", label: "Contact" },
];
