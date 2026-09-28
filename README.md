# arshchatrath.me

My portfolio site. Live at [arshchatrath.me](https://arshchatrath.me).

It's one long scroll: intro, about me, what I think it takes to be a good PM, case studies, the X-factor venn, an FAQ, and how to reach me. There are two other routes. `/resume` shows the PDF with a download button, and `/figma` embeds the Figma prototype version of the portfolio.

## Running it locally

You need pnpm (the preinstall script blocks npm and yarn) and a Node version Vite 7 is happy with, so 20.19 or newer.

```sh
pnpm install
pnpm dev
```

It runs on port 5173, or on `$PORT` if that's set (Replit sets it).

Other scripts:

```sh
pnpm build      # production build into dist/
pnpm serve      # preview the build
pnpm typecheck  # tsc, no emit
```

There are no tests, so `typecheck` and `build` are the checks.

## Stack

React 19, TypeScript, Vite 7, Tailwind 4. GSAP and ScrollTrigger for the animation, Lenis for smooth scrolling, OGL for the WebGL background, wouter for routing. Fonts are self-hosted from `public/fonts` (Bricolage Grotesque, Schibsted Grotesk, Fragment Mono).

## Where things are

`src/pages/Portfolio.tsx` is most of the site, and yes, it's over 2,000 lines. The project cards and FAQ answers are plain arrays near the top, so changing copy doesn't mean digging through JSX. The FAQ answers also go out as FAQPage structured data, so keep them accurate.

`src/gl/AmbientField.tsx` is the background. It's a single canvas that stays mounted across route changes. A value called `uOrder` goes from 0 at the top of the page to 1 at the bottom, and the field gets calmer as it rises, so the page starts noisy and settles as you read. It's loaded as its own chunk after first paint so it doesn't hold up the page.

`src/components/` has everything else that moves:

- `Preloader` is the opening, where lasers engrave my name
- `AsciiStory` is the questions/lessons section with the ASCII wall
- `BinaryRain` is the falling 0s and 1s behind the hero
- `Cursor`, `ImageScan` and `RouteTransition` handle the cursor, the hover scan on images, and the curtain between pages
- `Neko` is the cat

`src/lib/motion.ts` holds every easing and duration, so the animations all feel like they belong together. It also decides once how much the device can handle. Weak devices get a lighter version, and anyone with reduced motion turned on gets static fallbacks.

Images that the code imports live in `assets/`. Anything served as-is (fonts, `resume.pdf`, the link preview image, sitemap) is in `public/`.

## About the cat

It's oneko, the cat that chases your cursor. The sprite is the original public domain one, which goes back to a 1989 PC-98 program, recoloured so it shows up on a dark page. There's a "Do you like cats?" switch in the bottom right corner. Turn it off and the cat walks back to the switch and goes to sleep. On phones it just naps on the Resume button.

## Deploying

It's on Vercel. `vercel.json` has the build settings and a rewrite that sends every path to `index.html`, so refreshing on `/resume` doesn't 404.

Any hostname starting with `resume.` serves the resume page at `/`, so a resume subdomain can point at the same deployment.

If you add a route, add it to `public/sitemap.xml` too, and call `usePageMeta` in the page so it gets its own title, description and canonical URL.
