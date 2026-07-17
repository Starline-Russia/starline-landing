# Economics section — v3 design

## Goal

Replace the legacy trade-off labels and symbolic GMV arrow with a clear editorial explanation of why a higher CPA and ДРР can be justified only when GMV grows faster. Keep the approved `+20–50% GMV за 6–12 месяцев` range explicitly non-guaranteed.

## Scope

- Update the existing shared `Economics.astro` component and its structural contract test.
- Add `/preview/economics/`, importing that component alone through `BaseLayout`.
- Update only the local section styles required in `global.css`; keep the existing Astro, TypeScript, and plain-CSS stack.

## Content and hierarchy

1. Keep the eyebrow and the heading about predictable economics.
2. Replace the two labelled comparison columns with a readable, left-to-right progression:
   - `CPA вырастет`;
   - `ДРР тоже вырастет`;
   - `GMV вырастет ещё сильнее`.
3. Do not use labels equivalent to `Допустимый компромисс` or `Целевой результат`, symbolic arrows, or unsupported performance claims.
4. Present `+20–50% GMV за 6–12 месяцев` next to wording that the range depends on starting economics, product, and market and is not a guarantee.
5. Retain the supporting consequences: more new clients, less dependence on retargeting, and more predictable economics.

## Official logo asset

- The three flow bullets use only the approved Starline mark from Google Drive: `Старлайн/Diz/logo/v8-1.png` ([Drive file](https://drive.google.com/file/d/1fqIxVrM0_CutV9DXDj_oNWZIgaXGJjQ0/view?usp=drivesdk), ID `1fqIxVrM0_CutV9DXDj_oNWZIgaXGJjQ0`).
- The local copy is `public/assets/starline-logo-v8-1.png`. The shared `.star` CSS class also renders this file; do not recreate the mark with `clip-path`, a gradient, or another improvised shape.

## Layout and responsive behavior

- Use one light editorial section with an open heading area, a three-step economics flow, and a distinct outcome/range area.
- Desktop places the progression in a deliberate reading order without nested cards; tablet and mobile stack it in the same semantic order.
- Use thin dividers, restrained lavender/purple emphasis, and no automatic or scroll-driven motion.
- The content stays fully readable without JavaScript. No new interaction is required.

## Verification

- Add structural assertions for the three approved statements, absence of removed labels and arrow-dependent language, the caveat, and the standalone shared-component preview.
- Run the updated test first and observe it fail before implementation.
- Complete `npm test`, `npm run check`, `npm run build`, and `npm run test:build`.
- Inspect `/preview/economics/` and the full page at 1440×900, tablet, and 390×844 for focus visibility, overflow, clipped type, console errors, reduced-motion behavior, and no-JavaScript readability.
