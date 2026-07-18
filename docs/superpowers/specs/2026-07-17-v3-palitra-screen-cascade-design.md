# Palitra screen cascade — design

## Goal

Extend the white Palitra chat moment with a scroll-driven scene that presents
six Palitra interface screens as one AI marketing director workspace. The scene
must retain the calm editorial look of the preceding chat section while making
the product scope tangible.

## Assets

Use these local copies from `Старлайн / Diz / palitra`:

1. `chat.jpg` — the existing front screen.
2. `ai-optimization.png`.
3. `llm-reporting.png`.
4. `content-generation.png`.
5. `mediaplans.png`.
6. `pipelines.png`.

`common.png` is intentionally out of scope.

## Placement and visual composition

- Add the section directly after `#palitra-chat` and before `#cases`.
- Use the same white background as the preceding section.
- Desktop and tablet use a tall scroll track with a sticky viewport scene.
- On entry, all six screens share the chat screen's center position. `chat.jpg`
  sits in front; the other screens remain fully hidden behind it.
- As the user scrolls, the screens reduce in size and move outward to form a
  frame around a centered message: two screens above, one at each side, and two
  below. The cards have equal final visual weight and preserve their intrinsic
  proportions, light border, 8px radius, and restrained shadow.
- The center copy fades in only after the cards begin to occupy their final
  positions:

  `ai-директор по маркетингу доступен 24/7 и знает всё о вашей рекламе и нашей работе над ней`

## Motion and interaction

- Keep the animation scroll-linked and reversible: scrolling upward returns the
  cards behind the front chat screen.
- Use one small progressive-enhancement controller that maps scene scroll
  progress to CSS custom properties. It must use `requestAnimationFrame`, a
  passive scroll listener, and no dependencies.
- Do not create an automatic animation, carousel, or controls.
- For `prefers-reduced-motion: reduce`, do not apply scroll-linked transforms
  or opacity transitions. Render the final readable frame directly.
- Without JavaScript, render the same final arrangement as ordinary document
  content, without hidden text or images.

## Responsive behavior

- At desktop and tablet widths, retain the sticky framed layout and centre copy.
- At small mobile widths, use a static two-column grid with the message between
  its rows. Avoid a sticky scene or scroll-linked motion that could make the
  page difficult to read.
- Every image uses Astro image optimization, intrinsic dimensions, Russian alt
  text, and lazy loading.

## Component and test boundaries

- Create one reusable `PalitraScreenCascade` component and a minimal isolated
  `/preview/palitra-screen-cascade/` page that imports only that component.
- Extend source and production tests to protect section order, six unique image
  assets, approved copy, static fallback markers, reduced-motion rules, and the
  preview contract.
- Preserve existing Palitra chat and cases tests.

## Acceptance checks

- The full landing order is `palitra`, `palitra-chat`, `palitra-screen-cascade`,
  then `cases`.
- At 1440×900 and 900×900, the cards are initially fully hidden behind chat and
  finish as a balanced frame around the message without horizontal overflow.
- At 390×844, all six screens and the message are readable without clipping.
- `npm test`, `npm run check`, `npm run build`, and `npm run test:build` pass.
