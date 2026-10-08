import { CATEGORIES, PROJECTS } from "./content";
import type { RefObject } from "react";
import type Lenis from "lenis";
type ScrollProps = { lenisRef: RefObject<Lenis | null> };


export default function WorkSection({ lenisRef }: ScrollProps) {
  // Work: jump to the first card of a category. The cards stack with CSS
  // sticky, so their on-screen position isn't where they sit in the page;
  // add up the cards before it instead, and stop where it would stick.
  const jumpToCategory = (cat: string) => {
    const cards = [...document.querySelectorAll<HTMLElement>(".work-card")];
    const i = cards.findIndex((c) => c.dataset.cat === cat);
    const list = cards[0]?.parentElement;
    if (i < 0 || !list) return;
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    let y = list.getBoundingClientRect().top + window.scrollY;
    for (let k = 0; k < i; k++) y += cards[k].offsetHeight + gap;
    const cs = getComputedStyle(cards[i]);
    const stick = cs.position === "sticky" ? parseFloat(cs.top) || 0 : 88;
    if (lenisRef.current) lenisRef.current.scrollTo(y - stick, { duration: 1.2 });
    else window.scrollTo({ top: y - stick, behavior: "smooth" });
  };
  return (
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
                  <button
                    key={c.name}
                    type="button"
                    data-hover
                    onClick={() => jumpToCategory(c.name)}
                    className="cat-item block w-full cursor-pointer text-left"
                    data-cat={c.name}
                  >
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
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
          {/* Below desktop the rail is hidden: the same jumps as chips */}
          <div className="work-chips lg:hidden mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => jumpToCategory(c.name)}
                className="rounded-full border border-white/15 px-3.5 py-2 font-mono text-xs uppercase tracking-[0.15em] text-[#f5f0e8]/80 transition-colors hover:border-[#00B4D8]/60 hover:text-[#00B4D8]"
              >
                {c.name} <span className="text-[#00B4D8]">{String(PROJECTS.filter((x) => x.category === c.name).length).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
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
        </div>
      </section>
  );
}
