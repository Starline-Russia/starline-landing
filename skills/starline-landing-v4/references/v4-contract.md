# Starline Landing v4 contract

## Isolation

- Official repository branch: `v4`.
- Official project directory: `v4/` inside the worktree that has branch `v4` checked out.
- Never edit a same-named `v4/` directory from a `main`, `v3`, or feature checkout without first proving it contains the intended v4 HEAD.
- Preserve `v1`, `v2`, `v3`, and the `starline-landing-v3` skill.
- Work on one component at a time and wait for visual approval before starting the next.

## Stack and file boundaries

- Astro `7.0.9`, static output, strict TypeScript `6.0.3`, and ordinary CSS.
- Do not add React, Tailwind, CSS-in-JS, a UI kit, or an animation library unless the user explicitly changes the stack.
- Shared sections: `src/components/`.
- Typed copy/data: `src/data/site.ts`.
- Global visual system: root `tokens.css`, bridge `src/styles/tokens.css`, and `src/styles/global.css`.
- Progressive enhancement: `src/scripts/`; no server state, analytics, or form submission without separate authorization.
- Public logo artwork: `public/assets/logo/`.

## Approved visual DNA

- Structural/motion reference: `https://steep.app/`.
- Design reference: `https://styles.refero.design/style/75fdb89f-ca64-41b3-af36-7a78bd09448e`.
- Palette: warm paper/white, near-black ink, and restrained peach/sienna accents. Violet appears only as the semantic underlay in the hero reveal, not as general UI chrome.
- Typography: Source Serif 4 for display, Inter for interface/body.
- Macrostructure: Feature Stack; studied-DNA, editorial, austere.
- Prefer asymmetric editorial composition, thin rules, open spacing, and one purposeful interaction per component.
- Avoid generic card grids, nested cards, gradient text, fake browser chrome, decorative blobs, invented proof, `transition: all`, and unrelated motion.
- Keep Hallmark's stamp and `.hallmark/log.json` aligned with the actual rendered component.

## Locked hero checkpoint

- The page hero uses `Hero.astro` and `HeroLogoReveal.astro`.
- Top artwork: `public/assets/logo/8-1-peach.png`, SHA-256 `05b2aca8c70212b2cf6625e67b0b6809ad1246741de157f1a145b38ce3d818db`.
- Underlay: `public/assets/logo/8-1.png`, SHA-256 `11c6b2f96d1d4b6f40133462c80dfb7926bafd699e78099c510cabc465b05d00`.
- Both assets are 1024 × 1024 and must remain pixel-aligned with identical sizing and positioning.
- Pointer movement reveals the violet underlay through a CSS radial mask on the peach image.
- The full `/` route has no inspector.
- `/preview/hero/` exposes native radius, feather, intensity, and reset controls.
- Below 1280 px the inspector stays in flow; from 1280 px it is fixed upper-right below the header without covering the logo.
- Preserve keyboard-visible focus, reduced-motion fallback, coarse-pointer behavior, image error fallback, and no horizontal overflow.

## Component and preview convention

- A preview imports the same shared component used by the full page.
- Route: `/preview/<section>/`.
- Preview-only controls may be passed as explicit props; production `/` must not receive them.
- Keep preview helpers outside production data and do not fork the component markup.
- Preserve approved earlier checkpoints when adding a later component.

## Copy and claims

- Use only copy already present in `src/data/site.ts`, the approved v4 specs, or supplied by the user.
- Do not invent clients, guarantees, attribution results, market statistics, team facts, or performance claims.
- If the next section lacks approved copy, stop and request it rather than filling a template with placeholders presented as facts.

## Verification

- `npm test`: structural/source contract.
- `npm run check`: Astro and TypeScript diagnostics.
- `npm run build`: static production build and route generation.
- `git diff --check`: patch hygiene.
- Browser QA: full page plus the changed preview; desktop and mobile; console, overflow, focus, assets, pointer/touch, and reduced motion as applicable.
- Do not weaken unrelated assertions to make a new component pass.
