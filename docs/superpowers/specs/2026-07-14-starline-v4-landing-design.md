# Starline Landing v4 — Design Specification

## Goal

Create a separate Starline v4 landing page for e-commerce decision makers. The page should use the public Steep style reference from Refero as its visual source, adapt Steep's editorial analytics language to Starline's growth-operator positioning, and drive one primary action: request a growth audit.

The page is a local prototype. It must not replace or modify v1, v2, or v3, and it must not be deployed without a separate user request.

## Confirmed Decisions

- Audience: owners, CEOs, CMOs, and e-commerce directors whose performance marketing is active but whose GMV growth is insufficient.
- Primary action: submit a compact request for a growth audit.
- Tone: editorial and austere; confident, analytical, quiet, and specific.
- Palette: paper white, ink black, and a rare blush-peach accent.
- Technology: Astro static output, plain CSS, CSS custom properties, and small vanilla JavaScript modules.
- No Tailwind, React, animation framework, or runtime-heavy UI library.
- Build process: one component group at a time, with a browser review checkpoint before the next group.

## Reference Lock

Primary visual source: the public Refero Steep design system.

Preserve:

- white editorial canvas;
- high-contrast roman serif display type paired with restrained sans-serif UI text;
- ink-black primary copy and actions;
- blush peach as the only chromatic surface, used once as a major editorial interruption;
- floating analytics artifacts with subtle elevation;
- quiet pill controls, generous whitespace, and hairline rules;
- product-like data fragments arranged around a strong typographic composition.

Adapt:

- Steep's product artifacts become Starline cohort, GMV, acquisition-channel, CPA, DRR, and new-customer artifacts;
- Steep's product feature story becomes Starline's acquisition → cohort measurement → scaling story;
- all copy, metrics, diagrams, and calls to action are Starline-specific.

Reject:

- pixel copying of Steep;
- italic display emphasis in headings;
- generic three-card feature grids;
- purple from v2/v3;
- gradients, glass decoration, radial glows, invented client logos, invented testimonials, or unsupported metrics;
- fake browser, phone, dashboard, or IDE chrome;
- multiple competing accent colors.

## Hallmark Fingerprint

- Previous project output: Marquee Hero · atmospheric violet · N1b navigation · Ft1 footer.
- v4 macrostructure: Feature Stack.
- v4 hero archetype: custom analytics illustration centerpiece, built from native HTML/CSS/SVG artifacts.
- v4 feature archetype: sticky-scroll stack with three narrative states.
- v4 navigation: N10 single-DOM navigation that morphs into a floating panel after the hero threshold.
- v4 footer: Ft2 single-line editorial footer.
- v4 theme route: studied Steep DNA, light paper band, high-contrast roman serif, warm peach accent.

## Architecture

The landing lives in its own `v4/` Astro project and produces static files in `v4/dist/`.

Expected source structure:

```text
v4/
  design-system/DESIGN.md
  public/assets/
  src/
    components/
    data/site.ts
    layouts/BaseLayout.astro
    pages/index.astro
    scripts/site.ts
    styles/tokens.css
    styles/global.css
  astro.config.mjs
  package.json
  tsconfig.json
```

`design-system/DESIGN.md` stores the v4-specific Refero Steep reference and does not become a root-level design system for v1–v3. `tokens.css` is the single source for every color, font, spacing, radius, shadow, timing, easing, rule, and z-index value used by v4. Components may only consume named tokens.

## Component Delivery Sequence

### Checkpoint 0 — Foundation

- Astro shell, layout, metadata, skip link, font loading, tokens, base styles, and test harness.
- Verify that the empty shell builds and has no impact on v1–v3.

### Checkpoint 1 — Navigation and Hero

- `SiteHeader.astro`: one DOM tree, edge-aligned at rest, morphing into a compact floating panel after the hero threshold.
- `Hero.astro`: large centered editorial statement, supporting copy, one primary CTA, one secondary text action, and four Starline analytics artifacts.
- Hero facts use only supported source facts: 10+ years, 50+ acquisition channels, 19 sales channels, and the latest-cohort focus.
- Review desktop composition, initial motion, focus order, and mobile collapse before continuing.

### Checkpoint 2 — Problem Scene

- `ProblemStatement.astro`: the page's single full peach surface.
- Core contrast: advertising metrics may improve while the business does not grow.
- No cards. The scene reads as one editorial spread with a compact supporting comparison.

### Checkpoint 3 — Growth Feature Stack

- `GrowthStack.astro`: sticky narrative pane plus three scrolling proof scenes.
- State 1: acquire new customers.
- State 2: measure the latest cohort and future revenue.
- State 3: scale channels with forecasted economics.
- On small screens the component becomes three linear text-and-visual pairs with no sticky behavior.

### Checkpoint 4 — Cohort and Economics

- `CohortModel.astro`: accessible cohort matrix with labels and a text summary; emphasis is not conveyed by color alone.
- `GrowthEconomics.astro`: GMV, CPA, DRR, new-customer share, and retargeting dependency presented as honest trade-offs.
- The `+20–50% GMV over 6–12 months` source-deck claim is presented only as a hypothesis or expected range requiring validation, never as a guarantee.

### Checkpoint 5 — Services and Process

- `Services.astro`: tabular specification rather than a repeated card grid.
- Services are grouped by business job: acquisition, media/performance, analytics/cohort modeling, and sales-channel scaling.
- `Process.astro`: audit → pilot → scaling, expressed as a real operating sequence.

### Checkpoint 6 — Proof, Form, and Footer

- `Cases.astro`: only source-supported metrics, anonymized or caveated where confirmation is required.
- `LeadForm.astro`: visible labels, three required contact fields, optional context field, inline error placement, loading/success/error states, and `aria-live` feedback.
- Prototype submissions remain local and explicitly say that no data was sent.
- `SiteFooter.astro`: one-line editorial close with copyright and minimal navigation.

### Checkpoint 7 — Integrated Motion and Final QA

- Wire the three permitted motion systems across completed components.
- Run Hallmark's 58-gate slop test and pre-emit critique.
- Run accessibility, performance, responsive, and browser verification.

At every checkpoint, the implementation stops after verification so the user can inspect the current component group before the next one begins.

## Motion Model

The page uses only three motion primitives:

1. Hero assembly: analytics artifacts settle into their positions using transform and opacity.
2. Feature-stack synchronization: the narrative state changes as the corresponding proof scene becomes active.
3. Navigation morph: one header transitions from edge-aligned bar to floating compact panel.

Motion requirements:

- transform and opacity only;
- no scroll hijacking;
- animations are interruptible and never block input;
- micro-interactions stay in the 150–300 ms range;
- scroll-driven state is disabled below 640 px;
- `prefers-reduced-motion: reduce` removes spatial movement and keeps only short opacity transitions up to 150 ms;
- no continuous decorative loops.

## Typography and Tokens

The preferred free-font pairing is Source Serif 4 for display text and Inter for body/UI text. This preserves the Refero role pairing without assuming licenses for Signifier or Söhne.

All colors are declared in OKLCH tokens. The visible target remains equivalent to Refero's Steep roles:

- paper canvas equivalent to `#ffffff`;
- ink equivalent to `#17191c`;
- blush peach equivalent to `#fbe1d1`;
- sienna is restricted to text and chart strokes on peach surfaces;
- neutral gray roles cover muted copy, hairline rules, and quiet surfaces.

Headings are always roman. Emphasis comes from composition, scale, weight, rules, and peach color—not italic words.

## Content and Data Flow

All page copy and supported facts live in `src/data/site.ts`. Components receive typed content rather than embedding business claims throughout templates.

The lead form is progressive enhancement:

- native HTML validation remains functional without JavaScript;
- JavaScript enhances focus management, loading, and local prototype feedback;
- no request is made to an external endpoint in this prototype;
- a future backend integration can replace the submit adapter without rewriting the component markup.

## Responsive and Accessibility Requirements

- Verify at 320, 375, 414, 768, 1024, and 1440 px.
- No horizontal scrolling; `html` and `body` use `overflow-x: clip`.
- Display text uses `overflow-wrap: anywhere`, balanced wrapping, and safe minimum widths.
- All interactive targets are at least 44 × 44 px.
- Primary CTA labels remain on one line.
- Sticky layouts unstick below 960 px; scroll-linked behavior is disabled below 640 px.
- Body text is at least 16 px on mobile with readable line measure.
- Text contrast meets WCAG AA; visible focus rings meet at least 3:1 contrast.
- Charts and matrices include accessible labels and text summaries.
- The page includes a skip link, semantic landmarks, sequential headings, meaningful button labels, and explicit form labels.

## Error Handling

- Missing optional content hides the corresponding element without leaving empty visual shells.
- Unsupported case claims never render as confirmed facts.
- Form errors appear beside their fields and focus moves to the first invalid field after submission.
- Script failure leaves navigation anchors, content, and native form validation usable.
- Motion observers disconnect cleanly and do not run when reduced motion is requested.

## Verification

Each checkpoint requires:

- `npm run check`;
- targeted Node tests for document structure, required copy, token discipline, and interaction hooks;
- `npm run build`;
- browser review at desktop and the required mobile widths;
- console-error review;
- keyboard navigation and focus-order check;
- horizontal-overflow check;
- reduced-motion verification for motion-bearing checkpoints.

The final checkpoint additionally requires the Hallmark 58-gate slop test, UI/UX Pro Max accessibility/performance review, and confirmation that v1–v3 files remain unchanged.

## Non-Goals

- No deployment.
- No external form submission or CRM integration.
- No CMS.
- No Tailwind, React, or client-side application shell.
- No dark mode.
- No fabricated logos, testimonials, client names, or metrics.
- No redesign of v1, v2, or v3.

## Acceptance Criteria

- v4 is a separate Astro static project and builds successfully.
- The page is recognizably informed by Steep's editorial analytics system without copying its content or pixels.
- The page uses only white/neutral, ink, and the controlled peach/sienna accent roles.
- The hero and feature stack communicate Starline's positioning and cohort model with source-supported facts.
- Motion is meaningful, performant, interruptible, reduced-motion safe, and removed where it would harm mobile scrolling.
- The lead form is accessible and honestly local-only.
- All required breakpoints render without horizontal overflow or clipped interactive content.
- Hallmark and UI/UX Pro Max verification passes before handoff.

