import { Fragment } from "react";
import BinaryRain from "@/components/BinaryRain";
import HeroPortrait from "./HeroPortrait";
import { HERO_NAME, HERO_TAGLINE, HERO_LEAD, HERO_LEAD_WORDS, HERO_PROOF } from "./content";
import type { RefObject } from "react";
import type Lenis from "lenis";
type ScrollProps = { lenisRef: RefObject<Lenis | null> };


export default function HeroSection({ lenisRef }: ScrollProps) {

  return (
      <section className="hero-section relative min-h-[100svh] flex items-center gutter-x pt-[calc(var(--nav-h)+var(--space-stack))] pb-[var(--space-block)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none hero-glow-bg" />
        {/* Binary rain on the right, fading out towards the text (wide screens) */}
        <BinaryRain />

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
          <p className="hero-kicker opacity-0 w-fit font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#00B4D8]">
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

          {/* The portrait anchors the hero. Visible
              from the first frame (it is the page's largest element). */}
          <div className="hero-stamp">
            <HeroPortrait />

          </div>

          <div className="hero-copy">
            <p
             
              className="hero-lead opacity-0 leading-snug text-[#f5f0e8] max-w-[36rem]"
              style={{ fontFamily: "var(--ff-body)" }}
            >
              <span className="sr-only">{HERO_LEAD.replace(/[[\]]/g, "")}</span>
              <span aria-hidden="true">
                {HERO_LEAD_WORDS.map((t, i) => (
                  <Fragment key={i}>
                    <span className={t.em ? "lead-word em" : "lead-word"}>{t.w}</span>{" "}
                  </Fragment>
                ))}
              </span>
            </p>

            {/* A scoreboard, not badges: big numbers in the headline face,
                a hairline above, a plain label under each. */}
            <ul className="hero-stats opacity-0 grid grid-cols-3 max-w-[38rem] border-t border-white/20">
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

            <div className="hero-cta opacity-0 flex flex-wrap items-center gap-x-7 gap-y-3" style={{ fontFamily: "var(--ff-body)" }}>
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
  );
}
