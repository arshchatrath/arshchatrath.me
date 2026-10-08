import arshCrossedArm   from "@imgs/Arsh Crossed Arm.webp";
import goldenTemple     from "@imgs/Amritsar golden temple.webp";
import thaparUniversity from "@imgs/Thapar university patiala.webp";

export default function AboutSection() {

  return (
      <section id="about" className="about-section skewable section-pad max-w-7xl mx-auto">
        {/* A crisscross: photo | intro on top, journey lines | map below.
            Phones read it in order: intro, photo, lines, map. From tablet up
            the top row sits on the seam and the bottom row hangs from it, so
            each picture is close to the text under or over it. */}
        <div className="grid md:grid-cols-2 gap-x-[var(--space-block)] gap-y-[clamp(1.25rem,2.5vw,1.75rem)] items-center">
          {/* Intro (top right) */}
          <div className="about-left opacity-0 md:col-start-2 md:row-start-1 md:self-end">
            <div className="reveal-wrap overflow-hidden">
              <h2 className="reveal-heading" style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1 }}>
                HELLO<br />I'M ARSH
              </h2>
            </div>
            <p className="text-[#00B4D8] font-mono text-xs uppercase tracking-[0.3em] mt-4 mb-6">
              Thapar Institute, Patiala
            </p>
            <p className="reveal-copy text-[#f5f0e8]/70 leading-relaxed" style={{ fontFamily: "var(--ff-body)" }}>
              Most of what I have built started as something that annoyed me. A community
              nobody was showing up to. A capstone scramble spread across WhatsApp groups.
              A job hunt eating an hour every morning. I research it, test it, measure it,
              and ship. Then I do it again. First of 250+ teams at IIT Roorkee's
              InnoQuest, Top 15 nationally at AMEX, and in the top 1% picked for
              Amazon ML School.
            </p>
          </div>

          {/* Photo (top left) */}
          <div className="about-right opacity-0 flex justify-center md:col-start-1 md:row-start-1 md:self-end">
            <div style={{ transform: "rotate(-3deg)", filter: "drop-shadow(0 20px 50px rgba(0,180,216,0.12))" }}>
              <img src={arshCrossedArm} width={528} height={660} alt="Arsh Chatrath, arms crossed" className="w-[min(18rem,72vw)] md:w-[min(26rem,40vw)] h-auto object-contain" loading="lazy" decoding="async" />
            </div>
          </div>

          {/* Journey lines (bottom left) */}
          <div className="journey-lines flex flex-col gap-4 w-fit max-w-full mx-auto md:col-start-1 md:row-start-2 md:self-start">
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

          {/* Amritsar to Patiala (bottom right) */}
          <div className="journey-map w-full max-w-[36rem] flex items-end justify-between gap-3 relative md:col-start-2 md:row-start-2 md:self-start">
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
      </section>
  );
}
