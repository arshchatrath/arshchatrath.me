import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import arshAudience     from "@imgs/Arsh with mic in audience.webp";
import arshThumbsUp     from "@imgs/Arsh thumbs up.webp";

export default function ContactSection({ reduceMotion }: { reduceMotion: boolean }) {

  return (
      <section id="hire" className="hire-section flex items-center justify-center relative overflow-hidden section-y">
        {/* Animated gradient wash behind the sign-off. Its top edge fades out
            (.hire-wash) so it melts into the page instead of starting on a
            hard line. */}
        <AnimatedGradientBackground
          containerClassName="hire-wash"
          Breathing={!reduceMotion}
          startingGap={125}
          breathingRange={16}
          animationSpeed={1}
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
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 items-center gap-x-3 gap-y-8 md:gap-12 relative z-10">
          
          {/* LEFT — Arsh with mic in audience */}
          {/* Phones: the two photos sit side by side above the sign-off,
              tilted towards each other; from tablet up they flank it. */}
          <div className="parallax-left flex justify-end select-none h-[clamp(9rem,44vw,12rem)] md:h-[300px] pointer-events-none col-start-1 row-start-1 -rotate-3 md:rotate-0">
            <img src={arshAudience} width={496} height={620} alt="" aria-hidden="true" className="h-full w-auto object-contain" loading="lazy" decoding="async" />
          </div>

          {/* CENTER — content */}
          <div className="col-span-2 row-start-2 md:row-start-1 md:col-start-2 flex flex-col items-center text-center">
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
          <div className="parallax-right flex justify-start select-none h-[clamp(9rem,44vw,12rem)] md:h-[300px] pointer-events-none col-start-2 row-start-1 md:col-start-4 rotate-3 md:rotate-0">
            <img src={arshThumbsUp} width={496} height={620} alt="" aria-hidden="true" className="h-full w-auto object-contain" loading="lazy" decoding="async" />
          </div>

        </div>
      </section>
  );
}
