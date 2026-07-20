# Starline v3 typography, layout, and motion polish

## Goal

Apply the twelve approved browser annotations to the existing Astro landing without changing its section order, copy, content model, or component boundaries. Improve local type scale, industry-grid spacing, Palitra motion sequencing, and true full-width rendering while preserving the established responsive system.

## Scope

The implementation changes only:

- the Services supporting lead;
- the Industries eyebrow, grid spacing, and card-title scale;
- the Market Problem, Cohorts, Economics, and Palitra eyebrows;
- the Economics supporting paragraph alignment and type size;
- the Palitra heading and supporting paragraph scale;
- the Palitra screen-cascade timing and full-width structure;
- the footer full-width behavior;
- structural tests that own these requirements.

No copy, section order, navigation, claims, data, image assets, form behavior, or lightbox behavior changes.

## Typography

### Services

Set `.services .section-lead` to `22px` at tablet and desktop widths. Preserve `17px` at `640px` and below. Keep this local to Services rather than changing the shared `.section-lead` token.

### Section eyebrows

Set the eyebrows in Industries, Market Problem, Cohorts, Economics, and Palitra to `18px` above the mobile breakpoint. Set the same local group to `14px` at `640px` and below so uppercase labels remain compact and do not create awkward wrapping.

Do not change the shared `.eyebrow` size, because that would also alter unannotated labels such as Cases and Lead.

### Industries

Keep three columns at `901px` and above, two columns from `641px` through `900px`, and one column at `640px` and below.

At desktop:

- add a responsive column gap of `clamp(28px, 3vw, 48px)`;
- reduce industry titles to `clamp(28px, 2.5vw, 42px)`;
- use a slightly more open `1.12` line-height;
- preserve the current divider-based editorial treatment and hover color.

The smaller title range and explicit gap must prevent adjacent labels from visually touching while keeping all eight industries substantial.

### Economics

Set the right-side supporting paragraph to `19px`. At desktop, center it vertically against the left heading block with `align-self: center` and remove the bottom alignment offset. At `900px` and below, retain the existing stacked flow.

### Palitra

Reduce the main Palitra heading to `clamp(38px, 3.2vw, 54px)` so long Russian words do not collapse into repeated single-word lines. Set the supporting paragraph to `20px`. Keep the existing left/right layout and system diagram unchanged.

## Cascade motion

Keep the six-screen stagger and the existing final scale and edge-gap calculations.

Change the progress mapping so:

- all screens finish reaching their distributed positions by `68%` scene progress;
- the centered AI-director message remains hidden while screens move;
- the message fades from `0` to `1` between `76%` and `94%` progress.

This creates a deliberate pause between the completed screen distribution and the message reveal. Mobile and `prefers-reduced-motion: reduce` continue to show the ordinary static grid without motion dependence.

## Full-width rendering

Remove the `100vw` plus negative-margin full-bleed technique from the sticky cascade stage. Make the cascade component root naturally full-width, apply `.shell` only where content needs a capped reading width, and size the stage from its section using `width: 100%`.

Keep the screenshots centered inside a responsive capped canvas with normal inline gutters. This avoids scrollbar-width differences between browsers.

Set the footer to an explicit `width: 100%` while preserving its internal gutter padding. This overrides the inherited `.shell` cap on viewports wider than `1440px` and prevents the page background from appearing as side gaps.

## Responsive and accessibility behavior

- Desktop validation widths: `1600×900` and `1440×900`.
- Tablet validation width: `900px`.
- Mobile validation width: `390×844`.
- No horizontal overflow at any validation width.
- The full-width cascade and footer must touch both viewport edges.
- Existing keyboard access, screenshot expansion, Escape handling, focus restoration, mobile menu behavior, and no-JavaScript readability remain intact.
- Reduced-motion mode must keep the static screenshot grid and readable centered message.

## Testing

Update source-contract tests before implementation and confirm they fail for the old values and structure. Assertions must cover:

- local Services `22px`/`17px` scale;
- local `18px`/`14px` eyebrow group;
- three-column Industries gap and reduced title clamp;
- Economics `19px` centered supporting paragraph;
- Palitra heading and supporting paragraph scales;
- cascade screen-completion and delayed-copy thresholds;
- absence of the cascade `100vw` negative-margin hack;
- explicit full-width cascade and footer structure.

Then run the full project validation cycle:

1. `npm test`
2. `npm run check`
3. `npm run build`
4. `npm run test:build`

Finally inspect the isolated affected previews and the full page at the approved widths.
