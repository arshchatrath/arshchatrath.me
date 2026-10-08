import { NAV_LINKS } from "./content";
import { usePortfolioNavigation } from "./hooks/usePortfolioNavigation";
import type { RefObject } from "react";
import type Lenis from "lenis";
type ScrollProps = { lenisRef: RefObject<Lenis | null> };


export default function PortfolioNavigation({ lenisRef }: ScrollProps) {
  const { menuOpen, setMenuOpen, showResumeFab, menuBtnRef } = usePortfolioNavigation(lenisRef);
  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed top-0 left-0 w-full z-40 flex items-center justify-between gutter-x py-4 sm:py-5 backdrop-blur-md bg-[#0a0a0a]/70 sm:bg-[#0a0a0a]/50 border-b border-white/5"
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
          01 / 09 &middot; intro
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
            className="hidden sm:inline font-mono text-xs tracking-[0.3em] uppercase text-[#f5f0e8]/70 hover:text-[#00B4D8] transition-colors"
          >
            Resume
          </a>
          <a
            href="/figma"
            data-hover
            data-magnetic
            data-cursor="OPEN"
            className="hidden sm:inline-block font-mono text-xs tracking-[0.3em] uppercase text-[#0a0a0a] bg-[#00B4D8] px-4 py-2 rounded-full hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(0,180,216,0.25)]"
          >
            Figma
          </a>
          {/* Phones: one Menu button instead of a squashed row of links */}
          <button
            ref={menuBtnRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="phone-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="menu-btn sm:hidden inline-flex items-center gap-3 font-mono text-xs tracking-[0.3em] uppercase text-[#f5f0e8]/85"
          >
            {menuOpen ? "Close" : "Menu"}
            <span className="menu-icon" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </nav>

      {/* Phones: a floating Resume button in the bottom-right corner (where
          the cat switch sits on bigger screens). Shows once the hero's own
          Resume link has scrolled away; hidden while the menu is open. */}
      <a
        href="/resume"
        className={`resume-fab${showResumeFab && !menuOpen ? " on" : ""}`}
        tabIndex={showResumeFab && !menuOpen ? 0 : -1}
        aria-hidden={!(showResumeFab && !menuOpen)}
      >
        Resume <span aria-hidden="true">↗</span>
      </a>

      {/* Phone menu: every section, the resume and the Figma file, big and
          easy to tap. Under the bar, so the button stays reachable. */}
      <div id="phone-menu" className={`phone-menu sm:hidden${menuOpen ? " open" : ""}`} inert={!menuOpen}>
        <ul>
          {[...NAV_LINKS, { href: "/resume", label: "Resume" }, { href: "/figma", label: "Figma" }].map((l, i) => (
            <li key={l.href} style={{ transitionDelay: menuOpen ? `${90 + i * 45}ms` : "0ms" }}>
              <a
                href={l.href}
                onClick={(e) => {
                  setMenuOpen(false);
                  if (!l.href.startsWith("#")) return;
                  e.preventDefault();
                  // after the page is unfrozen
                  requestAnimationFrame(() => lenisRef.current?.scrollTo(l.href, { offset: -64 }));
                }}
              >
                <span className="phone-menu-idx">{String(i + 1).padStart(2, "0")}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="mailto:achatrath_be23@thapar.edu" className="phone-menu-mail">achatrath_be23@thapar.edu</a>
      </div>
    </>
  );
}
