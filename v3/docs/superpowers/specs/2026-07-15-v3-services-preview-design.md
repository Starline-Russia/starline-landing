# Starline v3 — Services preview

## Scope

Continue the Astro v3 landing one shared section at a time by completing the Services checkpoint. The work is limited to the reusable `Services` component, its isolated preview route, the structural test, and any shared CSS required for that component. No content, markup, or behavior outside this checkpoint changes.

## Design

`Services.astro` remains the single source of the section markup. It presents the six approved service areas as an accordion: all descriptions are present in static HTML for no-JavaScript readability; JavaScript progressively keeps at most one item open and synchronizes each toggle's `aria-expanded` state.

The services heading contains no eyebrow. Its existing heading and supporting copy remain unchanged because they meet the approved content contract.

`/preview/services/` imports `Services` into `BaseLayout` and renders no header, footer, or neighboring section. Preview canvas rules may live at page level; section markup and visual styles stay shared.

## Verification

Before implementation, extend the structural test so it expects the preview route and verifies its one-component import boundary. Run it to demonstrate the missing preview failure. Then add the route and remove the services eyebrow. Completion requires `npm test`, `npm run check`, `npm run build`, and visual inspection of `/preview/services/` at desktop, tablet, and mobile widths.

## Constraints

Keep Astro 7.0.9, strict TypeScript, and plain CSS. Do not alter the local-only form, add dependencies, introduce client claims, or modify other landing sections.
