# Palitra cascade: hover focus and copy refinement

## Goal

Refine the existing desktop cascade without changing its scroll choreography or static fallbacks. A small final-state screen should become a temporary focal image when hovered, and the central message should be more compact with a purple opening phrase.

## Interaction

- Applies only when the enhanced desktop cascade is active (`data-cascade-ready="true"`).
- Hovering or keyboard-focusing any of the six screens raises that screen above the copy, moves it to the canvas centre, and returns it to its existing full display scale (`scale(1)`).
- The image may temporarily cover the message. Leaving hover or focus restores the current scroll-derived position, scale, and stacking order.
- The transition is short and smooth; reduced-motion users keep the static grid and receive no motion-dependent interaction.
- Each image becomes keyboard-focusable so the visual affordance is not mouse-only. It remains descriptive content, not a link or a modal trigger.

## Copy and visual treatment

- Split the copy into a phrase span and the remaining sentence.
- Render `AI-директор по маркетингу` in the existing violet token (`--violet`); retain the remaining copy in `--ink`.
- Reduce the desktop copy scale from the current 62px maximum to a 54px maximum while preserving the existing centred composition and responsive mobile scale.

## Boundaries and regressions

- Do not alter the six approved source assets, scroll progress calculation, final no-overlap geometry, section order, or no-JavaScript/mobile/reduced-motion grid.
- Keep the hover overlay clipped to the existing stage and above the copy only while the screen is hovered/focused.
- Add source and production contracts for the phrase span, compact type scale, focusability, and enhanced-only hover selector.
- Verify the isolated preview and full-page transition at 1440×900 plus the 390px baseline fallback; run source tests, Astro check, production build, and production HTML tests.

## Self-review

No placeholders or ambiguous interaction states remain. Hover and focus share the same temporary visual state; static and motion-reduced paths are explicitly unchanged.
