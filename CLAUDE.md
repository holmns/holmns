# CLAUDE.md

Personal portfolio of Nawat "Holmes" Suangburanakul (holmns) — a single-page, cinematic
"camera HUD × code" site. Dark theme, REC-red accent, film grain, viewfinder motifs.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build + typecheck; must pass clean before handing work back
- `npm start` — serve the production build
- `npm run lint` — ESLint

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 — CSS-first config; design tokens live in `src/app/globals.css`
  (`:root` vars mapped through `@theme inline`), there is no `tailwind.config`
- GSAP 3.15 — all plugins are free since 3.13 (ScrollTrigger, ScrollSmoother, SplitText)
- Three.js (vanilla, no react-three-fiber)

## Architecture

- `src/app/page.tsx` renders `<Experience>` (client), which composes the whole page:
  Preloader → Cursor → Nav → SmoothScroll(main: Hero, Marquee, About, Crafts, Works + Footer) → grain overlay.
- **Preloader handoff**: Preloader's `onComplete` flips `ready` state; Nav and Hero intros
  are gated on `ready`. The preloader covers the first paint, so components can set hidden
  initial states without flashing.
- **SmoothScroll** wraps scrollable content in `#smooth-wrapper` / `#smooth-content`
  (ScrollSmoother, disabled for touch + reduced-motion). Fixed overlays (Nav, Cursor,
  Preloader, grain) must live OUTSIDE the wrapper or they'll be transformed away.
- Anchor navigation goes through `ScrollSmoother.get()?.scrollTo(...)` with a
  `scrollIntoView` fallback (see Nav).
- **`src/lib/gsap.ts` is the only place GSAP plugins are registered.** Components import
  `gsap`/plugins from there, never from `"gsap"` directly. It also exports
  `prefersReducedMotion()` and `isTouchDevice()`.
- Every animated component follows the same pattern: bail out early on
  `prefersReducedMotion()` (animations are `from`/`fromTo` tweens, so the final visible
  state is the no-JS/reduced default), wrap tweens in `gsap.context(..., rootRef)`, revert
  on unmount. A function returned from the context callback runs on revert (used for
  SplitText cleanup).
- SplitText must run after `document.fonts.ready`, or line breaks are measured wrong.
- **All site content** (name, socials, nav links, crafts, projects) lives in
  `src/data/site.ts`; tech icon metadata in `src/data/techMap.ts`. Components render from
  data — copy changes should not require touching components.

## Design system

- Tokens: `--bg #0a0a09`, `--fg #ecebe5`, `--muted #8b887d`, `--accent #ff3d24` (REC red),
  `--line` hairlines. Fonts: Anton (`font-display`, headlines), Geist (`font-sans`),
  Geist Mono (`font-mono`, HUD labels: uppercase + wide tracking).
- Recurring motifs: viewfinder corner brackets, blinking REC dot, mono "01 — ABOUT" section
  labels (see `SectionHeading`), `.text-outline` stroked type, `.grain` overlay.
- z-index map: mobile menu 40 < nav 50 < preloader 90 < grain 100 < cursor 150.

## Gotchas (learned the hard way)

- **Never set the CSS `scale` property on an element GSAP translates.** Individual
  transform properties multiply the whole `transform` matrix — translation included — so
  the element renders at scaled coordinates. The Cursor solves this structurally: outer
  element owns translation (quickTo x/y), inner element owns scale + blur.
- **`gsap.quickTo(el, "scale")` silently does nothing** — `resetTo` can't retarget `scale`
  because GSAP splits it into scaleX/scaleY prop-tweens. Use a plain `gsap.to` with
  `overwrite: "auto"` for discrete scale changes.
- HeroCanvas (Three.js): pause the RAF loop via IntersectionObserver + `visibilitychange`;
  dispose geometry/material/renderer in cleanup — React StrictMode double-mounts effects in
  dev, and the cleanup path is what keeps it to one canvas.
- Photographic assets go in `public/` as optimized JPEGs (`sips -s format jpeg`); don't
  commit or ship multi-MB originals — they'd be publicly downloadable once deployed.
- Project card images for unreleased apps are composed, not screenshots: dark typographic
  HTML cards rendered with headless Chrome (app icon + one-glance product story), kept
  visually consistent with the site (corners, mono caption bar, accent).

## Verification

UI work here is verified with headless Chrome driven over the DevTools Protocol (Node 22's
built-in WebSocket — no puppeteer dependency): screenshots at 1440 / 390 / 320 widths,
console + exception capture, FPS sampling via rAF counts, `Input.dispatchMouseEvent` for
cursor/hover behavior, and horizontal-overflow checks
(`document.documentElement.scrollWidth > window.innerWidth`). Animated states need explicit
waits (preloader ≈ 2.7s + intro) before capturing.
