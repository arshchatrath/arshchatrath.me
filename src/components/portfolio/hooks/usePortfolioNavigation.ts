import { useEffect, useRef, useState, type RefObject } from "react";
import type Lenis from "lenis";

export function usePortfolioNavigation(lenisRef: RefObject<Lenis | null>) {
  // phone menu (the section links don't fit in the bar on phones)
  const [menuOpen, setMenuOpen] = useState(false);
  // phones: a floating Resume button, once the hero's own link is off screen
  const [showResumeFab, setShowResumeFab] = useState(false);
  useEffect(() => {
    const cta = document.querySelector(".hero-cta");
    if (!cta) return;
    const io = new IntersectionObserver(([e]) => setShowResumeFab(!e.isIntersecting));
    io.observe(cta);
    return () => io.disconnect();
  }, []);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  // Phone menu: freeze the page behind it, close on Escape, and hand focus
  // back to the button when it closes.
  useEffect(() => {
    if (!menuOpen) return;
    const lenis = lenisRef.current;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
      menuBtnRef.current?.focus({ preventScroll: true });
    };
  }, [menuOpen]);
  return { menuOpen, setMenuOpen, showResumeFab, menuBtnRef };
}
