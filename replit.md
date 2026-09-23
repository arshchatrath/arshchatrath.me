# arshchatrath.me

Personal portfolio for Arsh Chatrath — a single animated page plus a resume
and a Figma prototype route.

## Run & Operate

- `pnpm dev` — dev server (defaults to :5173; Replit supplies `PORT`)
- `pnpm build` — production build to `dist/`
- `pnpm typecheck` — `tsc --noEmit`
- No env vars required. No backend, no database.

## Stack

- Vite 7 + React 19 + TypeScript, Tailwind v4
- wouter for routing, Lenis for smooth scroll
- GSAP (ScrollTrigger + SplitText) for all motion
- OGL for the ambient WebGL field

## Where things live

- `src/pages/Portfolio.tsx` — the entire one-pager. Sections, copy and the
  GSAP timelines all live here.
- `src/gl/AmbientField.tsx` — the persistent background shader.
- `src/lib/motion.ts` — easings, durations, staggers, device tiering. Pull
  motion values from here rather than inventing new ones.
- `src/components/` — Preloader, Cursor, Neko, AsciiMorph, RouteTransition.
- `assets/` — images imported through the `@imgs` alias.

## Architecture decisions

- **One shader for the whole page.** `fieldState.order` runs 0→1 with scroll
  and the background resolves from turbulent to calm. Sections deliberately
  carry no background of their own — adding one puts a hard seam across it.
- **Nothing animation-related goes through React state.** Scroll handlers
  write straight to `fieldState` and to DOM/uniforms.
- **`overflow-x: clip`, never `hidden`.** `hidden` computes `overflow-y: auto`,
  which makes the element a scroll container and silently breaks every
  `position: sticky` and ScrollTrigger pin inside it.
- **Lenis must call `ScrollTrigger.update`.** Without it, scrubbed and pinned
  animations look like they simply don't run.
- The page reveal is gated on the preloader; there is a 4.5s failsafe so a
  stalled timeline can never leave the site blank.

## Gotchas

- `prefers-reduced-motion` has a real path through every component — check it
  when adding motion, or elements stay at `opacity-0` forever.
- Screenshots for visual checks: `msedge --headless --screenshot`, or
  playwright-core driving the installed Edge.
