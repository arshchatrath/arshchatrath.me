import AsciiStory from "@/components/AsciiStory";
import monkeyThinking   from "@imgs/Monkey thinking.webp";
import monkeyRealising  from "@imgs/Monkey realising.webp";
import { PM_QUESTIONS, REALIZATIONS } from "./content";

export default function StorySection() {

  return (
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

            {/* in the same screen as the lessons, right under them */}
            <p className="proof-callout opacity-0 mt-[clamp(1rem,3svh,2rem)] text-center font-bold text-[#f5f0e8] leading-tight max-w-4xl mx-auto"
              style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(1.1rem, 2.3vw, 2rem)" }}>
              THESE WEREN'T JUST REALIZATIONS. THESE WERE BATTLE TESTED LESSONS.
              AND HERE'S THE PROOF…
            </p>
          </section>
        }
      />
  );
}
