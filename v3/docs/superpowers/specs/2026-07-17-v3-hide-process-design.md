# Hide Process section — v3 design

## Goal

Temporarily remove the generic process section from the published landing flow so the economics argument leads directly into the Palitra AI platform. Preserve the existing Process component and content for possible later reuse.

## Page structure

The main page section order becomes:

1. `hero`
2. `tasks`
3. `services`
4. `industries`
5. `market-problem`
6. `cohorts`
7. `economics`
8. `palitra`
9. `cases`
10. `lead`

`src/pages/index.astro` will no longer import or render `Process.astro`. No replacement transition block or new copy is introduced. Navigation remains unchanged because it has no Process link.

## Preserved work

Keep `src/components/Process.astro`, `processSteps` in `src/data/site.ts`, and the existing Process CSS unchanged. This makes the decision reversible without leaving hidden markup in production HTML.

## Verification

Update the source structural test and production HTML contract to expect the ten approved section IDs with `economics` followed immediately by `palitra`. Use a test-first cycle: change the expectations, confirm they fail because Process is still rendered, then remove the import and section from the page.

Run `npm test`, `npm run check`, `npm run build`, and `npm run test:build`. Confirm the built home page has no `section#process` and preserves the Palitra section after Economics.
