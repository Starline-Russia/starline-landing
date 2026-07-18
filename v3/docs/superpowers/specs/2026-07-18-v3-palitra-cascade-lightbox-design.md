# Palitra Cascade: click-to-open lightbox

## Goal

Replace the current hover/focus enlargement of cascade screens with an explicit click-to-open fullscreen preview. The existing scroll cascade, static chat section, and current copy remain unchanged in this scoped refinement.

## Interaction

- In the enhanced desktop cascade, each of the six small screens is a semantic button with a `pointer` cursor and a restrained hover/focus affordance; it no longer grows on hover.
- Clicking a screen opens the matching approved screenshot in a viewport-covering lightbox above the page.
- The lightbox contains the full image, its Russian descriptive alt, a visible close button, and a dimmed backdrop.
- Close actions: close button, clicking the backdrop outside the image, or `Escape`.
- On close, focus returns to the same trigger button. The dialog manages focus while open and exposes `role="dialog"`, `aria-modal="true"`, and an accessible label.

## Responsive and motion behaviour

- The static mobile/no-JavaScript/reduced-motion grid remains readable; its cards are still clickable once JavaScript is available.
- Opening and closing use a short opacity transition; `prefers-reduced-motion: reduce` removes it.
- Opening a lightbox prevents background scrolling and restores the previous scroll position/overflow state on close.

## Boundaries and verification

- Do not change the six approved assets, the scroll geometry, final frame, section order, or Palitra copy.
- Remove the duplicate hover-overlay images and their hover/focus enlargement CSS; only one optimized image per screen remains in normal markup.
- Add source and production contracts for six buttons, the lightbox markup/hooks, and removal of hover enlargement.
- Test click/open/close lifecycle in the site script, keyboard Escape, focus restoration, no overflow, and reduced-motion fallback. Verify at desktop and mobile plus the full page.

## Self-review

The interaction is explicit rather than hover-dependent, works with keyboard input, and keeps existing cascade animation isolated from modal state. No unresolved behaviour or placeholder remains.
