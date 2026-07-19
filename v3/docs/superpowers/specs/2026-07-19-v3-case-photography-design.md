# Starline v3 Case Photography Design

## Scope

Replace only the two editorial illustrations in the existing `Cases` section with real photographs. Preserve the approved case content, order, metrics, quotes, structure, and responsive layout.

## Selected photographs

### Fintech

- Use the selected Pexels photograph: [Business professional analyzing financial charts on monitors and tablet](https://www.pexels.com/photo/man-in-white-shirt-sitting-in-front-of-computer-with-multiple-screens-while-holding-a-tablet-5831260/).
- Download the original photograph into `src/assets/cases/` so the production page has no runtime dependency on Pexels.
- Name the local source file `fintech.jpg`.
- Use a Russian descriptive alternative text that describes a specialist analysing financial data on several screens.

### Real estate

- Use the existing local file `src/assets/cases/real-estate.png`.
- Do not rename or re-encode the user-provided file.
- Use a Russian descriptive alternative text that describes the Moscow City skyline and modern high-rise buildings.

## Presentation

- Continue rendering both photographs through Astro's `Image` component.
- Preserve the existing visible `4:3` frame, `8px` corner radius, lazy loading, responsive image widths, and Astro image optimisation.
- Preserve intrinsic `width` and `height` metadata from each source image.
- Let the existing `object-fit: cover` rule make the small crop needed by the `4:3` frame. Do not bake text, logos, overlays, gradients, or client identifiers into either photograph.

## Component and data boundaries

- Keep `Cases.astro` structurally unchanged unless a test requires a photography-specific attribute adjustment.
- Update only the image imports, image references, alternative text, and intrinsic dimensions in `src/data/site.ts`.
- Add the selected Fintech photograph to `src/assets/cases/`.
- Add an isolated `/preview/cases/` route using the shared `Cases` component inside `BaseLayout`; do not duplicate section markup.

## Testing and verification

- Update the source contract first so it expects the selected local filenames and the `/preview/cases/` route.
- Verify the updated expectation fails before implementation.
- Run `npm test`, `npm run check`, `npm run build`, and `npm run test:build`.
- Inspect `/preview/cases/` and the full page at `1440×900`, `390×844`, and a tablet width.
- Confirm that both photographs load locally, crop cleanly to `4:3`, have Russian alt text and intrinsic dimensions, and introduce no horizontal overflow or external image requests.

## Out of scope

- No changes to case copy, metrics, order, layout, typography, or interaction.
- No generated imagery.
- No client names or logos.
- No deployment, push, or pull request.
