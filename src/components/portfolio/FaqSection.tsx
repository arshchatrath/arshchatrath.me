import { useState, type MouseEvent as ReactMouseEvent } from "react";
import { FAQS } from "./content";

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

export default function FaqSection() {

  return (
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
  );
}
