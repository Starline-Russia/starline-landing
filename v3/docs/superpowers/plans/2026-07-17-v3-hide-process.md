# Hide Process Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Process section from the rendered v3 landing so Economics leads directly to Palitra while preserving the Process component, data, and CSS for later reuse.

**Architecture:** `src/pages/index.astro` remains the sole owner of full-page section composition. The change removes only the Process import and rendered section; the shared component and its supporting content stay untouched. Source and built-HTML tests define the revised ten-section contract.

**Tech Stack:** Astro `7.0.9`, strict TypeScript, plain CSS, Node.js test runner.

## Global Constraints

- Preserve Astro `7.0.9`, strict TypeScript, and plain CSS.
- Keep `src/components/Process.astro`, `processSteps` in `src/data/site.ts`, and existing Process CSS unchanged.
- Do not add replacement copy, a hidden Process node, a feature flag, dependencies, or JavaScript.
- Keep all work local; do not deploy, push, or create a pull request.
- Final page order: `hero`, `tasks`, `services`, `industries`, `market-problem`, `cohorts`, `economics`, `palitra`, `cases`, `lead`.

---

### Task 1: Remove Process from the rendered page contract

**Files:**
- Modify: `../tests/v3-landing.test.mjs`
- Modify: `../tests/v3-build.test.mjs`
- Modify: `src/pages/index.astro`
- Preserve unchanged: `src/components/Process.astro`
- Preserve unchanged: `src/data/site.ts`
- Preserve unchanged: `src/styles/global.css`

**Interfaces:**
- Consumes: section IDs emitted by `src/pages/index.astro`.
- Produces: a ten-section landing where the `economics` section is immediately followed by `palitra`.

- [x] **Step 1: Write the failing source and production contract expectations**

In `../tests/v3-landing.test.mjs`, replace the approved `sectionIds` array with:

```js
const sectionIds = [
  "hero",
  "tasks",
  "services",
  "industries",
  "market-problem",
  "cohorts",
  "economics",
  "palitra",
  "cases",
  "lead",
];
```

Read `src/pages/index.astro` directly and assert that Process is not imported or rendered:

```js
const indexPage = await readFile(
  path.join(v3Root, "src", "pages", "index.astro"),
  "utf8",
);

assert.doesNotMatch(indexPage, /import Process from/);
assert.doesNotMatch(indexPage, /id="process"|<Process\s*\/>/);
```

In `../tests/v3-build.test.mjs`, replace the expected built section array with:

```js
assert.deepEqual(sectionIds, [
  "hero",
  "tasks",
  "services",
  "industries",
  "market-problem",
  "cohorts",
  "economics",
  "palitra",
  "cases",
  "lead",
]);
assert.doesNotMatch(html, /<section\b[^>]*\bid="process"/);
```

- [x] **Step 2: Run the source test and verify RED**

Run:

```bash
npm test
```

Expected: FAIL in `v3 contains the approved section order and hero contract` because `src/pages/index.astro` still imports and renders Process.

- [x] **Step 3: Remove Process from the full-page composition**

In `src/pages/index.astro`, remove:

```astro
import Process from "../components/Process.astro";
```

and:

```astro
<section id="process" class="scene process"><Process /></section>
```

Keep the neighboring order exactly:

```astro
<section id="economics" class="scene economics"><Economics /></section>
<section id="palitra" class="scene palitra"><Palitra /></section>
```

- [x] **Step 4: Run the source test and verify GREEN**

Run:

```bash
npm test
```

Expected: all source and structural tests PASS.

- [x] **Step 5: Run the complete Starline v3 verification contract**

Run:

```bash
npm run check
npm run build
npm run test:build
```

Expected: Astro check reports zero errors, production build succeeds, and all built-HTML tests PASS.

- [x] **Step 6: Inspect the full-page transition**

Run the local Astro server and inspect `/` at `1440×900`, tablet width, and `390×844`. Confirm:

- Economics is followed directly by Palitra.
- There is no empty Process-sized gap or `section#process`.
- There is no horizontal overflow, clipped text, console error, missing asset, or unexpected request.
- Existing focus behavior, reduced-motion behavior, and no-JavaScript readability remain intact.

- [x] **Step 7: Commit the implementation**

```bash
git add ../tests/v3-landing.test.mjs ../tests/v3-build.test.mjs src/pages/index.astro docs/superpowers/plans/2026-07-17-v3-hide-process.md
git commit -m "feat(v3): hide process section"
```
