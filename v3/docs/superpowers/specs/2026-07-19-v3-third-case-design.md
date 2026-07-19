# Starline v3 Third Case Design

## Scope

Add one anonymous e-commerce case to the existing `Cases` section. Preserve the shared case component, the current editorial layout, and the content of the first two cases.

## Approved content

- Category: `E-commerce`.
- Title: `Интернет-магазин детских товаров`.
- Primary metric: `+27%`.
- Metric label: `рост CAGR в 2026 году`.
- Actions:
  1. `С Q4 2025 перестроили рекламные кампании на привлечение новых клиентов`.
  2. `Пессимизировали ретаргетинг`.
  3. `Сфокусировались на росте GMV всего бизнеса, а не отдельного направления`.
- Outcome: `Впервые за последние 5 лет e-com направление выросло одновременно с общим GMV бизнеса.`

The case remains anonymous. Do not add a client or brand name, logo, guarantee, or any performance claim beyond the approved copy above.

## Image

- Use the existing local file `src/assets/cases/toys.jpg`.
- Render it through the same Astro `Image` component as the other case photographs.
- Preserve the visible `4:3` frame, `8px` radius, lazy loading, responsive widths, Astro optimisation, and intrinsic source dimensions.
- Use the descriptive Russian alternative text `Детские игрушки на полках магазина`.
- Do not fetch the image at runtime or add logos, text, gradients, or client identifiers to it.

## Component and data boundaries

- Add the third entry to the typed `cases` array in `src/data/site.ts`.
- Continue rendering all cases through the existing loop in `src/components/Cases.astro`.
- Do not create a separate component or a special visual treatment for the third case.
- Keep the isolated `/preview/cases/` route based on the shared `Cases` component. If that route is not yet present in the working tree, add it as part of the implementation.

## Responsive presentation

- The third case follows the same desktop, tablet, and mobile layout as the first two.
- Preserve category and title on the left and the metric, action list, and outcome on the right.
- Preserve the established spacing, typography, divider treatment, and `4:3` photograph crop.
- Do not add new interaction or motion.

## Testing and verification

- Update the source structural contract first so it expects three case entries and the approved third-case content and local image metadata.
- Run the focused structural test and confirm it fails because the third case is not implemented.
- Add the third case with the minimum production change required to pass.
- Update the production HTML contract to expect three rendered case articles and three optimised case images.
- Run `npm test`, `npm run check`, `npm run build`, and `npm run test:build`.
- Inspect `/preview/cases/` and the full page at `1440×900`, `390×844`, and a tablet width.
- Confirm correct crop, readable text, no horizontal overflow, no missing image, and no external image request.

## Out of scope

- No redesign of the Cases section.
- No copy or layout changes to the first two cases.
- No generated imagery.
- No backend, deployment, push, or pull request.
