# Starline v3 — Hero revision

## Scope

Revise only the `Hero` component and its component-specific styles. All later sections remain visually and structurally unchanged.

## Reference lock

- Primary reference: the current v3 hero composition approved in the browser.
- Preserve: centered two-line headline, night background, coordinate grid, restrained orbital lines, violet gradient on the second headline line, one primary CTA, and three metrics beneath it.
- Remove: both decorative hero stars. The Starline header logo remains unchanged.
- Reject: new illustrations, extra CTAs, badges, cards, or changes to global heading styles.
- Tokens: continue using the existing Starline color, font, grid, and radius tokens. Hero-only typography and spacing values must not become global tokens.

## Content changes

- Keep the headline and explanatory paragraph unchanged.
- First metric: `10+` / `лет - средний опыт сотрудников`.
- Second metric: `50+` / `каналов привлечения`.
- Third metric: `100+` / `проектов - совокупный опыт команды`.

## Layout and typography

- Increase the vertical gap between the headline, explanatory paragraph, CTA, and metrics without pushing the metrics out of a 1440×900 viewport.
- Metric labels use 18 px on desktop and reduce responsively on narrow screens.
- Longer first and third metric labels may wrap to two lines; all three metric columns remain visually aligned.
- Mobile keeps the existing stacked metric rows and uses a smaller responsive label size.

## Component boundary

- Markup changes stay in `v3/src/components/Hero.astro`.
- Hero-specific values stay under `.hero` selectors in `v3/src/styles/global.css` for this iteration.
- No global `h1`, `h2`, `.section-heading`, or section-spacing token is changed.
- A later cleanup may move section styles into component-local files, but that refactor is outside this component pass.

## Accessibility and fallback

- The single CTA remains a normal anchor to `#lead`.
- Metrics remain a semantic description list.
- Removing decorative stars has no accessibility impact because they are already hidden from assistive technology.
- The hero remains fully usable without JavaScript.

## Verification

- Structural tests assert the new metric copy, `100+`, a single Hero CTA, and absence of hero star elements.
- Run `npm test`, `npm run check`, and `npm run build` in `v3/`.
- Verify the rendered Hero at desktop 1440×900 and mobile 390×844 for wrapping, spacing, overflow, and visible metrics.
