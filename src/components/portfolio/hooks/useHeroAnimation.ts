import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, DUR, STAGGER, prefersReducedMotion } from "@/lib/motion";
import { NAME_NOISE, LEAD_NOISE, getLensMap } from "../animation-constants";
gsap.registerPlugin(ScrollTrigger);

export function useHeroAnimation(intro: boolean, nameEngraved: RefObject<boolean>) {
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
      // intro words, for the spotlight (leadTick, below)
      const leadWords = gsap.utils.toArray<HTMLElement>(".lead-word").map((el) => ({
        el, base: el.classList.contains("em") ? 1 : 0.7, o: el.classList.contains("em") ? 1 : 0.7, y: 0, cx: 0, cy: 0,
      }));
      const cacheLead = () => leadWords.forEach((w) => {
        const r = w.el.getBoundingClientRect();
        w.cx = r.left + r.width / 2 + scrollX;
        w.cy = r.top + r.height / 2 + scrollY;
      });
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
        cacheLead();
      };

      // The name forms out of noise: every letter rises in as a random
      // character, flickers through a few more, and settles into place, left
      // to right. Each letter's slot is pinned to its final width meanwhile,
      // so the line doesn't jitter as the glyphs change.
      // (Skipped on a first visit: the laser opening has already engraved the
      // name in place, so it just appears inside its outline.)
      const engraved = nameEngraved.current;
      const finals = heroChars.map((el) => el.textContent ?? "");
      if (!engraved) {
        heroChars.forEach((el) => {
          el.style.width = `${el.getBoundingClientRect().width}px`;
          el.style.textAlign = "center";
        });
      }
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
      if (!engraved) scrambleStep();

      // The intro under the name decodes the same way: every character starts
      // as random ASCII and settles into place, left to right. Word widths
      // are pinned meanwhile, so the lines never reflow.
      const leadEls = gsap.utils.toArray<HTMLElement>(".lead-word");
      const leadFinal = leadEls.map((el) => el.textContent ?? "");
      const leadLen = leadFinal.reduce((n, w) => n + w.length, 0) || 1;
      leadEls.forEach((el) => {
        el.style.width = `${el.getBoundingClientRect().width}px`;
        el.style.whiteSpace = "nowrap";
      });
      const decode = { t: 0 };
      let lastDecode = -1;
      const decodeStep = () => {
        const flick = Math.floor(decode.t * 26);
        if (flick === lastDecode) return;
        lastDecode = flick;
        let k = 0;
        leadEls.forEach((el, wi) => {
          const w = leadFinal[wi];
          let out = "";
          for (let c = 0; c < w.length; c++, k++) {
            const settles = 0.1 + (k / leadLen) * 0.8;
            out += decode.t >= settles ? w[c] : LEAD_NOISE[(Math.random() * LEAD_NOISE.length) | 0];
          }
          el.textContent = out;
        });
      };
      const settleLead = () => {
        leadEls.forEach((el, i) => {
          el.textContent = leadFinal[i];
          el.style.width = "";
          el.style.whiteSpace = "";
        });
      };
      decodeStep();

      const heroTl = gsap.timeline({ defaults: { ease: EASE.out } });
      heroTl.fromTo(".hero-kicker", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: DUR.base }, 0);
      if (engraved) {
        heroTl.set(heroChars, { yPercent: 0, opacity: 1 }, 0);
      } else {
        heroTl
          .fromTo(heroChars, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: STAGGER.tight }, 0.05)
          .to(scramble, { t: 1, duration: 1.15, ease: "none", onUpdate: scrambleStep, onComplete: settleName }, 0.05);
      }
      heroTl
        // The portrait settles into place before the idle silhouettes begin.
        .fromTo(".hero-stamp", { scale: 0.96, y: 24 }, { scale: 1, y: 0, duration: 1.1, ease: EASE.out }, 0.3)
        .fromTo(".hero-lead", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.base }, 0.45)
        .to(decode, { t: 1, duration: 1.3, ease: "none", onUpdate: decodeStep, onComplete: settleLead }, 0.45)
        // the numbers rise out of their rule, like the letters of the name
        .fromTo(".hero-stats", { opacity: 0 }, { opacity: 1, duration: DUR.fast }, 0.55)
        .fromTo(".stat-num > span", { yPercent: 105 }, { yPercent: 0, duration: DUR.base, stagger: STAGGER.loose }, 0.55)
        .fromTo(".hero-cta", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: DUR.base }, 0.7)
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

      // Intro: a soft spotlight follows the pointer across the words. The
      // ones nearest it brighten and lift a hair, then ease back when it
      // moves on. Positions are cached with the letter centres.
      const leadTick = () => {
        for (const w of leadWords) {
          // distance squashed vertically, so the light spreads along a line
          const d = Math.hypot(hx - w.cx, (hy - w.cy) * 1.8);
          const t0 = Math.max(0, 1 - d / 150);
          const t = t0 * t0 * (3 - 2 * t0);
          const to = w.base + (1 - w.base) * t;
          const ty = -2.5 * t;
          if (w.o === to && w.y === ty) continue; // settled: no writes
          const close = Math.abs(to - w.o) < 0.004 && Math.abs(ty - w.y) < 0.05;
          w.o = close ? to : w.o + (to - w.o) * 0.16;
          w.y = close ? ty : w.y + (ty - w.y) * 0.16;
          w.el.style.opacity = w.o.toFixed(3);
          w.el.style.transform = `translate3d(0, ${w.y.toFixed(2)}px, 0)`;
        }
      };
      if (finePointer) gsap.ticker.add(leadTick);

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
        gsap.ticker.remove(leadTick);
        tagEl?.removeEventListener("pointerenter", onTagEnter);
        ripple?.kill();
        settleName();
        settleLead();
        if (nameEl) nameEl.style.filter = "";
        heroST.kill();
        heroTl.kill();
      };
    return heroCleanup;
  }, [intro]);
}
