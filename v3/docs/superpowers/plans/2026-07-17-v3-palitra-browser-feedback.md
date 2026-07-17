# Palitra Browser Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved browser annotations to Palitra copy, area bullets, and decorative line treatment.

**Architecture:** Keep all markup in the shared `Palitra.astro` component so `/preview/palitra/` and the landing update together. Reuse the approved Starline logo asset for four decorative bullets and remove the two orbit elements and their CSS entirely.

**Tech Stack:** Astro `7.0.9`, strict TypeScript, ordinary CSS, Node test runner.

## Global Constraints

- Preserve Astro `7.0.9`, strict TypeScript, and ordinary CSS.
- Use `/assets/starline-logo-v8-1.png` for every area bullet.
- Preserve the official Palitra logo without recoloring or editing the source PNG.
- Do not change the four Palitra area titles or descriptions.
- Do not add JavaScript, motion, or replacement decorative lines.

---

### Task 1: Lock the reviewed Palitra contract

**Files:**
- Modify: `../tests/v3-landing.test.mjs`
- Modify: `../tests/v3-build.test.mjs`
- Modify: `docs/superpowers/specs/2026-07-17-v3-palitra-orbit-intersections-design.md`

**Interfaces:**
- Consumes: the browser comments supplied by the user.
- Produces: source and production assertions for final Palitra copy, four Starline bullets, and zero orbit elements.

- [x] Add source assertions for:
  - `Новый подход к performance`;
  - `Используем AI-платформу для управления маркетинговыми процессами`;
  - the approved description ending in `специалиста`;
  - four `.palitra-area-bullet` images using `/assets/starline-logo-v8-1.png`;
  - absence of numbered `padStart` markup and `palitra-orbit` markup/CSS.

- [x] Run `npm test` and confirm the new assertions fail on the previous component.

### Task 2: Apply the shared component changes

**Files:**
- Modify: `src/components/Palitra.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `palitraAreas` and `/assets/starline-logo-v8-1.png`.
- Produces: the reviewed heading copy and `.palitra-area-bullet` markup without orbit elements.

- [x] Replace the heading content with:

```astro
<p class="eyebrow">Новый подход к performance</p>
<h2>Используем <span>AI-платформу</span> для управления маркетинговыми процессами</h2>
<p>Palitra ускоряет анализ, отчётность и распределение бюджетов — решения остаются под контролем специалиста</p>
```

- [x] Remove both `.palitra-orbit` elements.

- [x] Replace each numeric span with:

```astro
<img
  class="palitra-area-bullet"
  src="/assets/starline-logo-v8-1.png"
  alt=""
  aria-hidden="true"
  width="1024"
  height="1024"
/>
```

- [x] Add an `18px` desktop Starline bullet rule, tighten the longer heading to `clamp(42px, 4vw, 64px)`, and remove every orbit rule from desktop and mobile CSS.

- [x] Follow-up browser feedback: remove `всеми` from the heading and align each Starline bullet to the left of its title and description with a two-column grid.

- [x] Follow-up browser feedback: add a square-cornered dashed border around `.palitra-system`, move the human-control label inside its bottom edge, and replace its copy with `Одобрение специалистом (HITL)`.

- [x] Follow-up browser feedback: remove every horizontal divider from the four Palitra areas while retaining the dashed outer frame.

- [x] Run `npm test` and confirm all source tests pass.

### Task 3: Verify production and responsive rendering

**Files:**
- Verify: `src/pages/preview/palitra.astro`
- Verify: `src/components/Palitra.astro`
- Verify: `src/styles/global.css`

- [x] Run:

```bash
npm test
npm run check
npm run build
npm run test:build
```

- [x] Inspect `/preview/palitra/` and `/#palitra` at `1440×900`, tablet, and `390×844`.

- [x] Confirm there is no horizontal overflow, no visible runtime error, all four Starline bullets render, and no orbit line remains.
