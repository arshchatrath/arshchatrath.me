import { VENN_CIRC } from "./animation-constants";

export default function XFactorSection() {

  return (
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
                  src="/img/venn-halftone.png" width={1024} height={1536}
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
  );
}
