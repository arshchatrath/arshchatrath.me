import gsap from "gsap";
import React, { useEffect, useRef } from "react";

interface AnimatedGradientBackgroundProps {
  /** Initial size of the radial gradient, defining the starting width. @default 125 */
  startingGap?: number;
  /** Enables or disables the breathing animation effect. @default false */
  Breathing?: boolean;
  /** Colors used in the radial gradient; pairs index-wise with `gradientStops`. */
  gradientColors?: string[];
  /** Percentage stops (0-100) matching `gradientColors`. */
  gradientStops?: number[];
  /** Speed of the breathing animation. Lower is slower. @default 0.02 */
  animationSpeed?: number;
  /** How far the gradient expands and contracts, in percentage points. @default 5 */
  breathingRange?: number;
  /** Extra inline styles for the gradient container. */
  containerStyle?: React.CSSProperties;
  /** Extra class names for the gradient container. */
  containerClassName?: string;
  /** Extra top offset, for finer control over the gradient shape. @default 0 */
  topOffset?: number;
}

/**
 * AnimatedGradientBackground
 *
 * Customizable animated radial gradient with an optional breathing effect.
 * Entrance is a GSAP tween; the gradient itself is a plain CSS radial-gradient.
 *
 * Two deliberate changes from the original: it uses GSAP rather than pulling in
 * framer-motion for a single fade, and the rAF loop only runs while `Breathing`
 * is on — otherwise the gradient is painted once and left alone.
 */
const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  startingGap = 125,
  Breathing = false,
  gradientColors = [
    "#0A0A0A",
    "#2979FF",
    "#FF80AB",
    "#FF6D00",
    "#FFD600",
    "#00E676",
    "#3D5AFE",
  ],
  gradientStops = [35, 50, 60, 70, 80, 90, 100],
  animationSpeed = 0.02,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = "",
}) => {
  if (gradientColors.length !== gradientStops.length) {
    throw new Error(
      `GradientColors and GradientStops must have the same length.
     Received gradientColors length: ${gradientColors.length},
     gradientStops length: ${gradientStops.length}`,
    );
  }

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const tween = gsap.fromTo(
      wrapperRef.current,
      { opacity: 0, scale: 1.5 },
      { opacity: 1, scale: 1, duration: 2, ease: "power2.out" },
    );
    return () => {
      tween.kill();
    };
  }, []);

  useEffect(() => {
    const stops = gradientStops
      .map((stop, index) => `${gradientColors[index]} ${stop}%`)
      .join(", ");

    const paint = (width: number) => {
      if (containerRef.current) {
        containerRef.current.style.background = `radial-gradient(${width}% ${
          width + topOffset
        }% at 50% 20%, ${stops})`;
      }
    };

    // Static: paint once, no loop.
    if (!Breathing) {
      paint(startingGap);
      return;
    }

    let animationFrame: number;
    let width = startingGap;
    let directionWidth = 1;

    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1;
      if (width <= startingGap - breathingRange) directionWidth = 1;
      width += directionWidth * animationSpeed;
      paint(width);
      animationFrame = requestAnimationFrame(animateGradient);
    };

    animationFrame = requestAnimationFrame(animateGradient);
    return () => cancelAnimationFrame(animationFrame);
  }, [
    startingGap,
    Breathing,
    gradientColors,
    gradientStops,
    animationSpeed,
    breathingRange,
    topOffset,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={`absolute inset-0 overflow-hidden ${containerClassName}`}
    >
      <div
        ref={containerRef}
        style={containerStyle}
        className="absolute inset-0 transition-transform"
      />
    </div>
  );
};

export default AnimatedGradientBackground;
