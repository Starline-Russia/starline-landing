# Starline v3 — Industries

## Scope

Turn the current Industries proof rail into one substantial, reusable expertise section. The checkpoint is limited to `Industries.astro`, its isolated preview route, the structural test, and shared CSS required by that component. Existing Services changes remain outside scope.

## Design

`Industries.astro` remains the sole source of the section markup. It uses a dark editorial field with a two-part composition:

- a section heading and short explanation that position the listed areas as substantial expertise;
- an asymmetrical industry grid in which E-commerce is the primary, visually dominant area and the six remaining approved industries form secondary areas.

The grid is static HTML and has no automatic marquee, scroll-triggered behavior, or client-specific proof claims. The existing typed `industries` array remains the canonical list and preserves its approved seven-item order: E-commerce, Fintech, Travel, Real estate, Fashion, Online services, Food delivery.

At tablet widths the grid condenses while retaining E-commerce prominence. At 640px and below it becomes a single, readable column. The section uses no interactive controls, so it remains fully meaningful without JavaScript.

`/preview/industries/` imports only `Industries` into `BaseLayout`, renders no site chrome or neighbouring sections, and uses shared component markup and styles.

## Verification

Before implementation, extend the Node structural test to expect the standalone preview, the `industries.map` source, a primary E-commerce treatment, and the absence of marquee behavior. Run the test to demonstrate the preview failure, then add the component markup, styles, and route.

Completion requires `npm test`, `npm run check`, `npm run build`, `npm run test:build`, and inspection of the shared section at 1440×900, tablet, and 390×844 in both the isolated preview and full page. Check keyboard focus where applicable, responsive overflow, reduced-motion safety, static readability, console output, assets, and unintended network requests.

## Constraints

Keep Astro 7.0.9, strict TypeScript, and ordinary CSS. Do not alter the local-only form, add dependencies, change approved industry names or order, introduce client claims, invent performance facts, or modify unrelated sections.
