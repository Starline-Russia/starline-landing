# V3 Market signal emphasis design

## Scope

Refine only the two signal rows in `MarketProblem.astro`; keep the section layout, spacing, and the surrounding copy unchanged.

## Content and hierarchy

1. The first signal headline becomes `CPA оптимизирован`.
   Its sentence becomes `Но рост бизнеса не появляется автоматически.`, with `автоматически` receiving a secondary emphasis.
2. The second signal headline becomes `Атрибуция улучшилась`.
   Its sentence becomes `Но GMV может почти не измениться.`, with `не измениться` receiving a secondary emphasis.
3. Signal headlines remain the primary row-level emphasis, but use a compact responsive scale so both phrases stay readable in the right rail.
4. Secondary emphasis uses semantic `strong` within the sentence: purple and semibold, without the headline scale or a separate interactive treatment.

## Accessibility and validation

- Preserve each signal as an `article` with an `h3` followed by a readable paragraph; the full sentence remains available as ordinary text without JavaScript.
- Update the structural test before the component and CSS change, including the new copy and semantic emphasis.
- Verify the isolated preview and full landing at `1440×900` and `390×844`, checking text wrapping, horizontal overflow, and console errors.
