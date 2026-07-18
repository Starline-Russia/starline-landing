# Starline v3: Palitra click-to-expand design

## Goal

Remove the repeated standalone Palitra chat screen and make the animated screenshot cascade the only presentation of this material. Clicking any screenshot should animate that screenshot from its current cascade position into a large centered view on the same white page background.

## Page structure

- Remove the standalone `PalitraChat` section from the full landing page.
- Keep `PalitraScreenCascade` as the single shared component for this sequence.
- Add the heading `Управление в привычном чате AI-агента` at the beginning of the cascade component.
- At the start of the scroll sequence, the chat screenshot remains the single large focal screenshot directly below the heading.
- As the user scrolls, the existing six-screen cascade animation continues and the central AI-director message appears as it does now.
- Keep the isolated cascade preview based on the same shared component.

## Click expansion

- Replace the dark lightbox with a FLIP-style transition driven by the clicked screenshot’s measured position and size.
- The expanded screenshot is a visual clone placed in a fixed white overlay so it can animate without disturbing the cascade layout.
- The clone starts at the clicked screenshot’s exact visible bounds, then moves and scales to the centered expanded bounds.
- The expanded bounds must:
  - preserve the screenshot’s intrinsic aspect ratio;
  - show the screenshot completely without cropping;
  - never exceed the original large chat screenshot width of `1180px`;
  - never exceed the available viewport height after comfortable white margins;
  - leave white space above and below or at the sides when the aspect ratios differ.
- The overlay background is the same white as the page. There is no dark scrim, framed modal, or separate close button.
- The source screenshot remains in place beneath the clone so the reverse animation can return to it accurately.

## Closing behavior

- Close on a second click on the enlarged screenshot.
- Close on a click on the surrounding white background.
- Close on `Escape`.
- Closing reverses the FLIP animation back to the source screenshot’s current on-screen bounds.
- Restore focus to the source screenshot trigger after closing.
- Lock page scrolling only while the expanded view is open.

## Interaction and accessibility

- Screenshot triggers remain real buttons with pointer cursors and visible keyboard focus.
- The white expansion layer uses dialog semantics and announces the screenshot’s existing alt text.
- Keyboard focus moves to the enlarged screenshot while open.
- Tab remains contained within the expanded view.
- When `prefers-reduced-motion: reduce` is enabled, show and hide the enlarged screenshot without movement while preserving all click and keyboard behavior.
- If JavaScript is unavailable, all six screenshots and both text messages remain readable as ordinary page content.

## Responsive behavior

- Desktop target: `1440 × 900`.
- Mobile target: `390 × 844`.
- The expanded screenshot is capped by both the `1180px` design maximum and the current viewport with responsive white margins.
- No state may create horizontal page overflow.

## Verification

- Structural tests confirm the standalone `PalitraChat` section is absent from the full page and the heading lives in `PalitraScreenCascade`.
- Executable interaction tests cover open, reverse close, background close, repeated-click close, `Escape`, focus return, scroll lock, and reduced motion.
- Run `npm test`, `npm run check`, `npm run build`, and `npm run test:build`.
- Inspect the full landing and isolated preview at desktop and mobile widths, including the beginning and end of the scroll sequence and click expansion from multiple cascade positions.
