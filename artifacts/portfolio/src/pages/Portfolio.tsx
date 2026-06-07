import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import arshMicCutout from "@assets/extracted/img-037.png";
import arshPortrait from "@assets/extracted/img-017.png";
import arshPresenting from "@assets/extracted/img-020.png";
import arshSideProfile from "@assets/extracted/img-057.png";
import arshCollage from "@assets/extracted/img-062.jpg";
import arshPodium from "@assets/extracted/img-013.jpg";
import botanical from "@assets/extracted/img-001.png";
import butterfly from "@assets/extracted/img-005.png";
import stampFrame from "@assets/extracted/img-009.png";
import magnifyingGlass from "@assets/extracted/img-030.png";
import thinkingMonkey from "@assets/extracted/img-040.png";
import pointingMonkey from "@assets/extracted/img-045.png";
import laptopHands from "@assets/extracted/img-025.png";
import tornNewspaper from "@assets/extracted/img-023.png";
import universityBuilding from "@assets/extracted/img-034.jpg";

// Ensure GSAP registers the plugin
gsap.registerPlugin(ScrollTrigger);

export default function Portfolio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Custom cursor logic
    const moveCursor = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleHoverStart = () => setIsHovering(true);
    const handleHoverEnd = () => setIsHovering(false);

    window.addEventListener("mousemove", moveCursor);

    const interactiveElements = document.querySelectorAll('a, button, [data-interactive="true"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleHoverStart);
      el.addEventListener('mouseleave', handleHoverEnd);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // 1. Hero Animations
      const chars = document.querySelectorAll('.hero-name .char');
      gsap.fromTo(chars, 
        { y: '100%' },
        { y: '0%', duration: 1, stagger: 0.08, ease: "power4.out", delay: 0.2 }
      );

      gsap.fromTo('.hero-tagline',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 1.5 }
      );
      
      gsap.fromTo('.hero-sub',
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 2 }
      );

      // Section headers reveal
      const headers = document.querySelectorAll('.section-header');
      headers.forEach(header => {
        gsap.fromTo(header,
          { clipPath: 'inset(100% 0 0 0)' },
          { 
            clipPath: 'inset(0% 0 0 0)', 
            ease: "power3.out", 
            scrollTrigger: {
              trigger: header,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      // About section bullets
      const bullets = document.querySelectorAll('.about-bullet');
      gsap.fromTo(bullets,
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          stagger: 0.1, 
          scrollTrigger: {
            trigger: '.about-section',
            start: "top 70%",
          }
        }
      );

      // Philosophy quotes
      const quotes = document.querySelectorAll('.quote-card');
      gsap.fromTo(quotes,
        { opacity: 0, y: 50, rotation: -2 },
        { 
          opacity: 1, 
          y: 0, 
          rotation: (i) => i % 2 === 0 ? 1 : -1,
          stagger: 0.2, 
          scrollTrigger: {
            trigger: '.philosophy-section',
            start: "top 70%",
          }
        }
      );

      const realizations = document.querySelectorAll('.realization-card');
      gsap.fromTo(realizations,
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          stagger: 0.1, 
          scrollTrigger: {
            trigger: '.realizations-wrapper',
            start: "top 70%",
          }
        }
      );

      // Case Studies Horizontal Scroll
      const caseSection = document.querySelector('.case-section');
      const caseWrapper = document.querySelector('.case-wrapper');
      
      if (caseSection && caseWrapper) {
        // Calculate total scroll amount needed
        const scrollAmount = caseWrapper.scrollWidth - window.innerWidth + 80; // 80 is roughly padding
        
        gsap.to(caseWrapper, {
          x: -scrollAmount,
          ease: "none",
          scrollTrigger: {
            trigger: caseSection,
            start: "top top",
            end: `+=${scrollAmount}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      }

      // X-Factor Venn Diagram
      const circles = document.querySelectorAll('.venn-circle');
      gsap.fromTo(circles,
        { scale: 0, opacity: 0 },
        { 
          scale: 1, 
          opacity: 0.35, 
          stagger: 0.3, 
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: '.venn-section',
            start: "top 60%",
          }
        }
      );

      gsap.fromTo('.venn-label',
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.2, 
          delay: 0.5,
          scrollTrigger: {
            trigger: '.venn-section',
            start: "top 60%",
          }
        }
      );

      // Achievements
      const wins = document.querySelectorAll('.win-item');
      gsap.fromTo(wins,
        { opacity: 0, x: -50 },
        { 
          opacity: 1, 
          x: 0, 
          stagger: 0.1, 
          scrollTrigger: {
            trigger: '.wins-section',
            start: "top 70%",
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Tilt effect for cards
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `rotateX(0deg) rotateY(0deg)`;
  };

  return (
    <div ref={containerRef} className="relative w-full bg-background text-foreground min-h-screen">
      {/* Custom Cursor */}
      <div 
        ref={cursorRef}
        className={`cursor ${isHovering ? 'cursor-hover' : ''}`}
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      />

      {/* Floating CTA */}
      <a 
        href="#contact" 
        className="fixed bottom-8 right-8 z-50 bg-primary text-primary-foreground font-mono font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform"
        data-interactive="true"
      >
        HIRE ME
      </a>

      {/* 1. Hero */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative px-6 overflow-hidden">
        {/* Botanical decoration top-left */}
        <img
          src={botanical}
          alt=""
          className="absolute -top-16 -left-16 w-80 opacity-15 pointer-events-none select-none"
          style={{ filter: 'invert(1)' }}
        />

        {/* Arsh halftone mic cutout — large, right side */}
        <img
          src={arshMicCutout}
          alt="Arsh Chatrath"
          className="absolute bottom-0 right-0 h-[85vh] object-contain object-bottom opacity-60 pointer-events-none select-none"
          style={{ mixBlendMode: 'luminosity' }}
        />

        {/* Butterfly decoration */}
        <img
          src={butterfly}
          alt=""
          className="absolute top-24 right-8 w-24 opacity-20 pointer-events-none select-none rotate-12"
        />

        <div className="text-center z-10 flex flex-col items-center relative">
          <h1 className="hero-name text-[12vw] leading-none font-bold uppercase tracking-tighter z-20">
            {'ARSH CHATRATH'.split('').map((char, i) => (
              char === ' '
              ? <span key={i} className="char-wrap inline-block w-[4vw]">&nbsp;</span>
              : <span key={i} className="char-wrap inline-block overflow-hidden"><span className="char inline-block">{char}</span></span>
            ))}
          </h1>

          <div className="hero-tagline mt-6 inline-block border-2 border-primary text-primary px-6 py-2 rounded-full font-mono text-xl uppercase tracking-widest font-semibold bg-background/50 backdrop-blur-sm">
            Creative Builder
          </div>

          <p className="hero-sub mt-8 text-muted-foreground font-mono text-sm tracking-widest uppercase">
            CS Student · Product Builder · Thapar University
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50 animate-bounce">
          <span className="font-mono text-xs tracking-widest mb-2" style={{ writingMode: 'vertical-rl' }}>SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* 2. About */}
      <section className="about-section min-h-screen w-full py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col justify-center">
        <h2 className="section-header text-6xl md:text-8xl font-bold uppercase mb-16 tracking-tighter">Hello /<br/>I'm /<br/>Arsh</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div className="inline-block bg-primary text-primary-foreground px-4 py-1 font-mono text-sm uppercase transform -rotate-2">
              POV: If I pitched myself in Shark Tank
            </div>
            
            <ul className="space-y-6 font-mono text-lg text-muted-foreground">
              <li className="about-bullet flex gap-4">
                <span className="text-primary">→</span>
                <span>I find broken user experiences and fix them systematically</span>
              </li>
              <li className="about-bullet flex gap-4">
                <span className="text-primary">→</span>
                <span>Campus partner @perplexity & @Talkeys — 3000+ users, 60% growth</span>
              </li>
              <li className="about-bullet flex gap-4">
                <span className="text-primary">→</span>
                <span>National competition winner — IIT Roorkee, AMEX, Amazon ML, TIET</span>
              </li>
              <li className="about-bullet flex gap-4">
                <span className="text-primary">→</span>
                <span>Built products that transformed chaos into systems</span>
              </li>
            </ul>

            <div className="about-bullet font-mono text-sm border-l-2 border-secondary pl-4 py-2">
              <span className="opacity-50">Amritsar</span> → <span className="opacity-75">Patiala</span> → <span className="text-primary font-bold">Currently building at Thapar</span>
            </div>
          </div>
          
          <div className="relative flex flex-col items-center gap-8">
            {/* Main portrait in stamp frame */}
            <div className="relative group">
              <img
                src={stampFrame}
                alt=""
                className="absolute inset-0 w-full h-full object-fill pointer-events-none z-10 scale-110"
                style={{ filter: 'invert(1) brightness(0.15)' }}
              />
              <div className="relative w-72 h-80 mx-auto overflow-hidden bg-muted transform -rotate-2 transition-transform group-hover:rotate-0 duration-500">
                <img
                  src={arshPortrait}
                  alt="Arsh Chatrath"
                  className="w-full h-full object-cover object-top grayscale"
                />
              </div>
              <p className="text-center font-mono text-xs mt-3 tracking-widest opacity-50">ARSH CHATRATH — BUILDER</p>
            </div>

            {/* University building */}
            <div className="relative w-full max-w-xs">
              <img
                src={universityBuilding}
                alt="Thapar University"
                className="w-full grayscale opacity-50 rounded"
              />
              <span className="absolute bottom-2 right-2 font-mono text-xs bg-background/80 px-2 py-1 text-muted-foreground">THAPAR UNIVERSITY, PATIALA</span>
            </div>

            {/* Butterfly decoration */}
            <img src={butterfly} alt="" className="absolute -bottom-8 -right-8 w-20 opacity-30 pointer-events-none rotate-45" />
          </div>
        </div>
      </section>

      {/* 3. Philosophy */}
      <section className="philosophy-section w-full py-32 px-6 md:px-12 bg-card relative overflow-hidden">
        {/* Torn newspaper background decoration */}
        <img
          src={tornNewspaper}
          alt=""
          className="absolute top-8 right-0 w-96 opacity-10 pointer-events-none select-none"
          style={{ mixBlendMode: 'luminosity' }}
        />
        {/* Thinking monkey — sits near the questions */}
        <img
          src={thinkingMonkey}
          alt=""
          className="absolute bottom-48 right-8 w-48 opacity-25 pointer-events-none select-none"
          style={{ mixBlendMode: 'luminosity' }}
        />

        <div className="max-w-7xl mx-auto relative">
          <h2 className="section-header text-5xl md:text-7xl font-bold uppercase mb-24 max-w-4xl tracking-tighter leading-tight">
            What does it take to be a <span className="text-primary">great PM?</span>
          </h2>

          {/* Magnifying glass illustration */}
          <img
            src={magnifyingGlass}
            alt=""
            className="absolute top-0 right-0 w-64 opacity-30 pointer-events-none select-none hidden lg:block"
            style={{ mixBlendMode: 'luminosity' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
            {[
              "How do I know I'm solving the right problem?",
              "How do I balance user needs vs. business goals vs. technical feasibility?",
              "How to make decisions when there's no clear answer?",
              "How to measure if I'm actually creating impact?",
              "How do I lead without authority when I don't manage the team?"
            ].map((q, i) => (
              <div key={i} className="quote-card bg-background border border-border p-8 shadow-xl">
                <p className="font-mono text-lg">{q}</p>
              </div>
            ))}
          </div>

          <div className="realizations-wrapper relative">
            <div className="flex items-center gap-6 mb-16">
              <h3 className="text-3xl font-bold uppercase">I Realized...</h3>
              <div className="h-px flex-1 bg-border"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                "You balance priorities by being ruthlessly data-driven.",
                "You make decisions by forming hypotheses and testing them quickly.",
                "You measure impact through metrics that matter, not vanity metrics.",
                "You lead by building trust, being the expert, and aligning everyone around the user."
              ].map((r, i) => (
                <div key={i} className="realization-card border-l-4 border-primary pl-6 py-2">
                  <p className="font-sans text-xl md:text-2xl leading-relaxed text-muted-foreground">{r}</p>
                </div>
              ))}
            </div>

            <div className="mt-32 border-y border-border py-16">
              <h4 className="text-4xl md:text-6xl font-bold text-center tracking-tighter uppercase">
                These weren't just realizations.<br/>
                <span className="text-secondary">These were battle-tested lessons.</span>
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Case Studies */}
      <section className="case-section h-screen w-full flex flex-col justify-center bg-background overflow-hidden relative">
        {/* Laptop hands decoration */}
        <img
          src={laptopHands}
          alt=""
          className="absolute bottom-0 left-0 w-64 opacity-10 pointer-events-none select-none"
          style={{ mixBlendMode: 'luminosity' }}
        />

        <div className="px-6 md:px-12 mb-12 shrink-0">
          <h2 className="section-header text-6xl md:text-8xl font-bold uppercase tracking-tighter">Proof, Not Promises</h2>
        </div>

        <div className="case-wrapper flex gap-8 px-6 md:px-12 w-max items-center">
          {[
            {
              id: "01",
              title: "TALKEYS COMMUNITY PLATFORM",
              company: "Talkeys",
              role: "Product & Operations Head",
              problem: "Low event engagement, declining user participation",
              approach: "User research, A/B tested 3 engagement strategies, prioritized features based on data",
              result: "60% increase in participation | Scaled to 1000+ active users",
              img: arshPresenting,
              imgAlt: "Arsh presenting Talkeys at BizQuiz"
            },
            {
              id: "02",
              title: "CAPSTONE TEAM FINDER PORTAL",
              company: "Independent",
              role: "Product Builder",
              problem: "Students relied on fragmented hostel groups, couldn't reach whole college",
              approach: "Identified pain point, built platform for posting projects with tech requirements",
              result: "Transformed WhatsApp chaos into centralized, systematic team formation",
              img: arshPodium,
              imgAlt: "Arsh at podium"
            },
            {
              id: "03",
              title: "PERPLEXITY AI CAMPUS GROWTH",
              company: "Perplexity AI",
              role: "VIP Campus Partner",
              problem: "Drive product adoption in saturated student market",
              approach: "Targeted CS students and research-focused users, designed campus activations",
              result: "Engaged 1500+ students | Top 25 Partners nationwide",
              img: null,
              imgAlt: ""
            }
          ].map((study) => (
            <div
              key={study.id}
              className="perspective-container shrink-0 w-[85vw] md:w-[680px] h-[65vh] max-h-[640px]"
              data-interactive="true"
            >
              <div
                className="tilt-card w-full h-full bg-card border border-border flex flex-col relative overflow-hidden group"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                {/* Card image strip */}
                {study.img && (
                  <div className="h-40 w-full overflow-hidden shrink-0 relative">
                    <img
                      src={study.img}
                      alt={study.imgAlt}
                      className="w-full h-full object-cover object-center grayscale opacity-60 group-hover:opacity-80 transition-opacity duration-500 scale-105 group-hover:scale-100 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
                  </div>
                )}

                <div className={`flex flex-col flex-1 p-8 md:p-10 ${!study.img ? 'pt-8' : ''}`}>
                  <div className="absolute top-0 right-0 p-6 text-8xl font-bold text-muted opacity-20 group-hover:text-primary group-hover:opacity-10 transition-colors pointer-events-none">
                    {study.id}
                  </div>

                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 border border-border text-xs font-mono uppercase tracking-wider mb-3 rounded-full bg-background">
                      {study.company}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">{study.title}</h3>
                    <p className="text-secondary font-mono text-sm mt-2">{study.role}</p>
                  </div>

                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div>
                      <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">Problem</h4>
                      <p className="text-base leading-relaxed">{study.problem}</p>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">Approach</h4>
                      <p className="text-base leading-relaxed">{study.approach}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="font-mono text-xs text-primary uppercase tracking-widest mb-2">Result</h4>
                    <p className="text-lg font-bold">{study.result}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. X-Factor */}
      <section className="venn-section py-32 w-full px-6 md:px-12 bg-card min-h-screen flex flex-col items-center justify-center">
        <h2 className="section-header text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-24 text-center">The X-Factor</h2>
        
        <div className="relative w-full max-w-[600px] aspect-square mx-auto flex items-center justify-center">
          {/* Circles */}
          <div className="venn-circle absolute top-[15%] left-[50%] -translate-x-1/2 w-[60%] aspect-square rounded-full mix-blend-screen" style={{ backgroundColor: '#7B2FBE' }}></div>
          <div className="venn-circle absolute bottom-[20%] left-[20%] w-[60%] aspect-square rounded-full mix-blend-screen" style={{ backgroundColor: '#00B4D8' }}></div>
          <div className="venn-circle absolute bottom-[20%] right-[20%] w-[60%] aspect-square rounded-full mix-blend-screen" style={{ backgroundColor: '#F59E0B' }}></div>
          
          {/* Labels */}
          <div className="venn-label absolute top-[5%] left-[50%] -translate-x-1/2 font-mono text-xl md:text-2xl font-bold tracking-widest text-[#7B2FBE] bg-background/80 px-2">TECHNICAL</div>
          <div className="venn-label absolute bottom-[10%] left-[10%] font-mono text-xl md:text-2xl font-bold tracking-widest text-[#00B4D8] bg-background/80 px-2">PRODUCT</div>
          <div className="venn-label absolute bottom-[10%] right-[10%] font-mono text-xl md:text-2xl font-bold tracking-widest text-[#F59E0B] bg-background/80 px-2">LEADERSHIP</div>
          
          <div className="venn-label absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-4xl md:text-6xl font-bold tracking-tighter z-10 drop-shadow-[0_0_15px_rgba(0,0,0,1)]">ARSH</div>
        </div>
      </section>

      {/* 6. Achievements */}
      <section className="wins-section py-32 w-full px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative">
          {/* Arsh side profile — large decorative cutout */}
          <img
            src={arshSideProfile}
            alt=""
            className="absolute -right-16 top-0 h-full max-h-[600px] object-contain object-top opacity-20 pointer-events-none select-none"
            style={{ mixBlendMode: 'luminosity' }}
          />
          {/* Pointing monkey for #1 achievement */}
          <img
            src={pointingMonkey}
            alt=""
            className="absolute -left-8 bottom-16 w-32 opacity-20 pointer-events-none select-none"
            style={{ mixBlendMode: 'luminosity' }}
          />

          <h2 className="section-header text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-16">The Wins</h2>

          <div className="space-y-4">
            {[
              { rank: "1ST", title: "IIT Roorkee National Competition" },
              { rank: "TOP 3", title: "American Express Competition" },
              { rank: "SELECT", title: "Amazon ML School" },
              { rank: "TOP 25", title: "Perplexity AI Campus Partners Nationwide" },
              { rank: "10K+", title: "Helix Event Registrations" },
              { rank: "60%", title: "Talkeys Growth | 3000+ Users" }
            ].map((win, i) => (
              <div key={i} className="win-item group flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-4 hover:border-primary transition-colors">
                <h3 className="text-2xl md:text-4xl font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{win.title}</h3>
                <span className="font-mono text-xl md:text-2xl text-secondary mt-2 md:mt-0">{win.rank}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Contact CTA */}
      <section id="contact" className="h-screen w-full flex flex-col items-center justify-center bg-card relative px-6 text-center overflow-hidden">
        {/* Arsh halftone collage — left side atmospheric */}
        <img
          src={arshCollage}
          alt=""
          className="absolute left-0 bottom-0 h-[70vh] object-contain object-bottom opacity-20 pointer-events-none select-none"
          style={{ mixBlendMode: 'luminosity' }}
        />
        {/* Botanical — top right */}
        <img
          src={botanical}
          alt=""
          className="absolute -top-8 -right-8 w-64 opacity-10 pointer-events-none select-none"
          style={{ filter: 'invert(1)' }}
        />

        <h2 className="text-4xl md:text-6xl font-mono uppercase tracking-widest text-muted-foreground mb-4 relative z-10">Let's Build</h2>
        <h1 className="text-[15vw] leading-none font-bold uppercase tracking-tighter text-primary mb-12 hover:scale-105 transition-transform duration-500 relative z-10">
          Hire Me
        </h1>

        <div className="space-y-6 font-mono text-xl md:text-2xl relative z-10">
          <a href="tel:+919888230798" className="block hover:text-primary transition-colors" data-interactive="true">+91 98882 30798</a>
          <a href="mailto:achatrath_be23@thapar.edu" className="block hover:text-primary transition-colors" data-interactive="true">achatrath_be23@thapar.edu</a>
        </div>

        <div className="mt-16 flex gap-6 relative z-10">
          <a href="mailto:achatrath_be23@thapar.edu" className="border-2 border-foreground px-8 py-4 font-mono font-bold uppercase hover:bg-foreground hover:text-background transition-colors" data-interactive="true">
            Email Me
          </a>
          <a href="tel:+919888230798" className="bg-primary text-primary-foreground px-8 py-4 font-mono font-bold uppercase hover:bg-primary/80 transition-colors" data-interactive="true">
            Call Me
          </a>
        </div>

        <footer className="absolute bottom-8 font-mono text-sm text-muted-foreground z-10">
          © 2026 Arsh Chatrath — Built with intent
        </footer>
      </section>
    </div>
  );
}
