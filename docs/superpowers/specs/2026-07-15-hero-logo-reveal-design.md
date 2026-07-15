# Starline v4 Hero Logo Reveal — Design Specification

## Goal

Replace the analytical SVG in the existing Starline v4 hero with an interactive two-layer brand image. The peach logo remains the visible default. A soft area under the pointer reveals the pixel-aligned violet logo beneath it. The existing hero composition and visual footprint remain unchanged.

This is a single-component checkpoint. It does not begin the next landing-page section.

## Confirmed Decisions

- Top image: `assets/logo/v8-1-peach.png`.
- Bottom image: `assets/logo/v8-1.png`.
- Both source images are 1024 × 1024 and share the same geometry.
- Reveal technology: CSS mask controlled by CSS custom properties and a small vanilla TypeScript controller.
- The effect-control panel appears only on `/preview/hero/`.
- The production `/` route includes the reveal effect without the control panel.
- No Canvas, WebGL, animation library, React island, or additional runtime dependency.

## Reference Lock

The existing v4 design lock remains authoritative: warm paper, near-black ink, peach as the primary chromatic surface, Source Serif 4 + Inter, restrained motion, and the Steep/Refero editorial composition. The violet logo is not promoted to a general interface accent; it appears only as the concealed brand layer inside the reveal.

The interaction is the hero's memorable visual move. The inspector is a development aid, not a marketing component.

## Component Architecture

### `HeroLogoReveal.astro`

The new component owns the visual markup only:

- a semantic `figure` with an accessible title and description;
- a positioned bottom image containing the violet logo;
- a positioned top image containing the peach logo;
- optional inspector markup controlled by a `showControls` prop that defaults to `false`;
- data attributes used by the controller and tests.

The images occupy the same positioning context and use identical sizing rules, guaranteeing pixel-for-pixel alignment. The rendered image surface keeps the existing width, breakpoint sizing, grid placement, and aspect ratio. Its grid wrapper may span the available column so the mobile preview inspector can use a readable full width without resizing the logo. At 4:3 breakpoints, the square source images use `object-fit: contain` rather than distortion or destructive cropping.

`Hero.astro` continues to own the surrounding hero copy, actions, and facts. It renders `HeroLogoReveal` in place of the current SVG.

### Route behavior

- `src/pages/index.astro` renders the default component without inspector controls.
- `src/pages/preview/hero.astro` opts into `showControls={true}`.
- No route-name detection occurs inside the component; route ownership stays explicit.

### Controller

The vanilla controller:

- listens to pointer movement only while the pointer is over the reveal surface;
- converts pointer coordinates into local percentages;
- batches visual updates through `requestAnimationFrame`;
- writes only CSS custom properties and active-state data attributes;
- supports mouse, pen, and touch through Pointer Events;
- cleans up pending animation-frame work when the pointer leaves;
- binds preview sliders independently from the production effect.

The effect uses no continuous animation loop and never changes layout properties.

## Reveal Model

The violet image is the true lower layer. The peach image is the true upper layer. A radial CSS mask cuts a transparent opening into the peach layer at the current pointer coordinates, exposing the violet pixels below.

Default tuning values:

- radius: 112 px;
- feather: 36 px;
- violet intensity: 100%;
- resting position: centered;
- inactive state: no visible opening.

The CSS mask uses a transparent center, a configurable feather band, and an opaque outer region. The two layers remain otherwise static. Values are stored as named CSS custom properties so the approved preview settings can later be copied into the component defaults without rewriting the interaction.

## Preview Inspector

The inspector contains three labeled native range inputs:

1. `Радиус` — controls the revealed area size.
2. `Мягкость` — controls the feathered edge width.
3. `Интенсивность` — controls the opacity of the violet underlayer.

Each row displays its current numeric value. A `Сбросить` button restores the documented defaults.

On desktop, the inspector is a narrow fixed panel at the lower-right edge of the preview viewport so it does not change the hero visual's size or grid. At small widths, it becomes an in-flow panel after the visual so it cannot cover the hero content. It uses the existing paper, ink, rule, spacing, typography, focus, and button tokens; it does not introduce a new card language or violet UI chrome.

## Interaction States

- Default: peach logo only.
- Hover/pointer active: a soft violet reveal follows the pointer.
- Pointer leave: the opening closes immediately without decorative trailing motion.
- Touch/pen: the opening follows the active pointer position and closes on pointer end or cancel.
- Focus: preview controls receive the existing visible focus ring.
- Disabled: not applicable to the reveal surface; native disabled styling remains available for inspector controls in tests.
- Reduced motion: pointer tracking remains functional because it is a direct manipulation, but all optional entry transitions remain disabled.
- Script failure: the peach logo remains fully visible and meaningful.

## Accessibility

- The figure announces that the peach Starline mark reveals its violet version under the pointer.
- The duplicate decorative image layer is hidden from assistive technology.
- Inspector inputs have explicit labels, visible values, keyboard control, and at least 44 px interaction height.
- Color is not required to understand page content; the reveal is decorative brand enrichment.
- No hover-only information or action is hidden inside the effect.
- Pointer tracking never captures or hijacks page scrolling on touch devices.

## Assets

Implementation copies the two already-exported local source files into the isolated v4 public asset tree, leaving the originals untouched:

```text
v4/public/assets/logo/8-1-peach.png
v4/public/assets/logo/8-1.png
```

Only those two files are added to the checkpoint. Other untracked files in `assets/` remain untouched and unstaged.

Google Drive search does not expose these names as standalone indexed files, which is consistent with the images being embedded in a presentation. The available local exports are the approved 1024 × 1024 source pair.

## Testing

Targeted source tests cover:

- both image paths and their stacking order;
- `showControls` defaulting to false;
- preview-only opt-in for the inspector;
- no SVG diagram remaining in the hero;
- pointer events, `requestAnimationFrame`, CSS custom-property updates, and reset behavior;
- absence of Canvas, WebGL, animation libraries, and runtime fetches;
- token-only component colors and transform/opacity-only transitions.

Browser verification covers:

- exact alignment of both logo layers;
- reveal position at the pointer;
- radius, feather, intensity, and reset controls;
- no inspector on `/`;
- inspector present on `/preview/hero/`;
- 320, 375, 414, 768, 1280, 1440, and 1920 px widths;
- no horizontal overflow or console errors;
- keyboard control of all inspector inputs;
- touch scrolling and `prefers-reduced-motion` behavior.

## Error Handling

- If the violet image fails, the peach logo remains visible and the reveal produces no broken-image chrome.
- If the peach image fails, the component must not expose misleading controls; the browser's normal image failure is caught during build/browser verification rather than hidden with fabricated fallback art.
- Out-of-range inspector values are clamped to documented limits before being written to CSS variables.
- Multiple reveal components, if added later, bind independently through local container queries rather than global IDs.

## Non-Goals

- No redesign of the hero layout or copy.
- No change to the hero visual's outer dimensions.
- No permanent inspector on the production route.
- No violet additions to buttons, navigation, typography, or page surfaces.
- No persistence to local storage or a backend.
- No deployment and no work on Checkpoint 2.

## Acceptance Criteria

- The current SVG is replaced by the two approved Starline logo images.
- The peach layer is visually on top and the violet layer is physically underneath.
- The two images remain pixel-aligned at every responsive size.
- A soft reveal follows mouse, pen, and touch input without scroll hijacking.
- The hero visual keeps its existing responsive footprint.
- `/preview/hero/` exposes working radius, feather, intensity, and reset controls.
- `/` contains no inspector markup.
- The component remains accessible, progressively enhanced, reduced-motion safe, and dependency-free.
- Tests, Astro check, static build, responsive browser QA, and Hallmark checks pass before handoff.
