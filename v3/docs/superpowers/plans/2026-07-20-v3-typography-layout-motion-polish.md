# Starline v3 Typography, Layout, and Motion Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the twelve approved browser annotations with local responsive typography, safer industry spacing, delayed Palitra copy motion, and true full-width rendering.

**Architecture:** Keep the existing Astro components and central CSS architecture. Encode the approved visual values in source-contract tests first, then make local CSS changes; change only the Palitra cascade wrapper where the `100vw` full-bleed hack must be replaced by natural section width.

**Tech Stack:** Astro `7.0.9`, strict TypeScript, plain CSS, Node test runner.

## Global Constraints

- Preserve Astro `7.0.9`, strict TypeScript, and ordinary CSS.
- Do not add React, Tailwind, a UI library, dependencies, claims, copy, or assets.
- Preserve the section order, navigation, accordion, form, screenshot expansion, keyboard behavior, and reduced-motion fallback.
- Services supporting text is `22px` above `640px` and `17px` at `640px` and below.
- Industries remain three columns at `901px` and above, two columns from `641px` through `900px`, and one column at `640px` and below.
- The selected section eyebrows are `18px` above `640px` and `14px` at `640px` and below.
- The cascade message remains hidden until all screenshots have reached their final positions.
- Do not push or deploy without a separate explicit user request.

---

### Task 1: Services, Eyebrows, and Industry Grid

**Files:**
- Modify: `../tests/v3-landing.test.mjs`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: existing `.services`, `.industries`, `.market-problem`, `.cohorts`, `.economics`, `.palitra`, `.eyebrow`, `.industry-grid`, and `.industry-card h3` selectors.
- Produces: local responsive typography rules used only by the annotated sections.

- [ ] **Step 1: Write the failing source-contract assertions**

In the Services test, read `global.css` and assert the new local scale:

```js
const css = await readFile(path.join(v3Root, "src", "styles", "global.css"), "utf8");
assert.match(css, /\.services \.section-lead\s*\{[^}]*font-size:\s*22px/s);
assert.match(
  css,
  /@media \(max-width:\s*640px\)[\s\S]*?\.services \.section-lead\s*\{[^}]*font-size:\s*17px/s,
);
```

In the Industries test, add:

```js
assert.match(
  css,
  /\.industries \.eyebrow,\s*\.market-problem \.eyebrow,\s*\.cohorts \.eyebrow,\s*\.economics \.eyebrow,\s*\.palitra \.eyebrow\s*\{[^}]*font-size:\s*18px/s,
);
assert.match(
  css,
  /\.industry-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)[^}]*column-gap:\s*clamp\(28px,\s*3vw,\s*48px\)/s,
);
assert.match(
  css,
  /\.industry-card h3\s*\{[^}]*font-size:\s*clamp\(28px,\s*2\.5vw,\s*42px\)[^}]*line-height:\s*1\.12/s,
);
assert.match(
  css,
  /@media \(max-width:\s*640px\)[\s\S]*?\.industries \.eyebrow,\s*\.market-problem \.eyebrow,\s*\.cohorts \.eyebrow,\s*\.economics \.eyebrow,\s*\.palitra \.eyebrow\s*\{[^}]*font-size:\s*14px/s,
);
```

- [ ] **Step 2: Run the structural suite and verify RED**

Run:

```bash
npm test
```

Expected: the Services assertion fails on `18px`, the local eyebrow group is missing, the Industry grid has no explicit column gap, and the Industry title still uses `clamp(30px, 3.2vw, 52px)`.

- [ ] **Step 3: Implement the local CSS**

Change the relevant rules in `src/styles/global.css` to:

```css
.services { color: var(--white); background: var(--night); }
.services .section-lead { font-size: 22px; }

.industries .eyebrow,
.market-problem .eyebrow,
.cohorts .eyebrow,
.economics .eyebrow,
.palitra .eyebrow { font-size: 18px; }

.industry-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: clamp(28px, 3vw, 48px);
  margin-top: 72px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

.industry-card h3 {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: clamp(28px, 2.5vw, 42px);
  font-weight: 500;
  line-height: 1.12;
  transform-origin: left center;
  transition: color 180ms ease, transform 180ms ease;
}
```

Inside `@media (max-width: 640px)`, preserve the existing Services value and add the local eyebrow override:

```css
.services .section-lead { font-size: 17px; }
.industries .eyebrow,
.market-problem .eyebrow,
.cohorts .eyebrow,
.economics .eyebrow,
.palitra .eyebrow { font-size: 14px; }
```

- [ ] **Step 4: Run the structural suite and verify GREEN**

Run:

```bash
npm test
```

Expected: all source-contract tests pass.

- [ ] **Step 5: Commit**

```bash
git add ../tests/v3-landing.test.mjs src/styles/global.css
git commit -m "style(v3): refine section typography and industries"
```

---

### Task 2: Economics and Palitra Copy Scale

**Files:**
- Modify: `../tests/v3-landing.test.mjs`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: existing `.economics-heading > p:last-child`, `.palitra-heading h2`, and `.palitra-heading > p:last-child` selectors.
- Produces: approved desktop copy sizing while preserving the existing stacked breakpoint at `900px`.

- [ ] **Step 1: Write the failing source-contract assertions**

Add to the Economics test:

```js
assert.match(
  css,
  /\.economics-heading > p:last-child\s*\{[^}]*align-self:\s*center[^}]*margin-bottom:\s*0[^}]*font-size:\s*19px/s,
);
```

Add to the Palitra component test:

```js
assert.match(
  css,
  /\.palitra-heading h2\s*\{[^}]*font-size:\s*clamp\(38px,\s*3\.2vw,\s*54px\)/s,
);
assert.match(
  css,
  /\.palitra-heading > p:last-child\s*\{[^}]*font-size:\s*20px/s,
);
```

Replace the old Palitra heading assertion for `clamp(42px, 4vw, 64px)` with the new assertion rather than keeping contradictory requirements.

- [ ] **Step 2: Run the structural suite and verify RED**

Run:

```bash
npm test
```

Expected: Economics fails on the missing center alignment and `18px`; Palitra fails on the old heading clamp and `18px` supporting copy.

- [ ] **Step 3: Implement the local CSS**

Change the rules to:

```css
.economics-heading > p:last-child {
  align-self: center;
  max-width: 520px;
  margin-bottom: 0;
  color: var(--muted);
  font-size: 19px;
}

.palitra-heading h2 {
  margin-bottom: 26px;
  font-size: clamp(38px, 3.2vw, 54px);
  font-weight: 500;
  line-height: 1.04;
}

.palitra-heading > p:last-child {
  max-width: 510px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 20px;
}
```

Inside `@media (max-width: 900px)`, make the stacked paragraph use normal flow:

```css
.economics-heading > p:last-child { align-self: auto; }
```

- [ ] **Step 4: Run the structural suite and verify GREEN**

Run:

```bash
npm test
```

Expected: all source-contract tests pass.

- [ ] **Step 5: Commit**

```bash
git add ../tests/v3-landing.test.mjs src/styles/global.css
git commit -m "style(v3): rebalance economics and Palitra copy"
```

---

### Task 3: Delayed Cascade Message and Natural Full Width

**Files:**
- Modify: `../tests/v3-landing.test.mjs`
- Modify: `src/components/PalitraScreenCascade.astro`
- Modify: `src/scripts/site.ts`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: existing `data-palitra-cascade`, `data-palitra-cascade-stage`, `data-palitra-cascade-copy`, and screenshot-expansion hooks.
- Produces: `cascadeSpreadEnd = 0.68`, `cascadeCopyStart = 0.76`, `cascadeCopyEnd = 0.94`, a full-width cascade root, and a capped inner screenshot canvas.

- [ ] **Step 1: Replace obsolete assertions with failing requirements**

In the cascade test, replace the old `100vw` assertion with:

```js
assert.match(component, /class="palitra-cascade-shell" data-palitra-cascade/);
assert.match(component, /class="palitra-cascade-heading shell"/);
assert.doesNotMatch(component, /class="palitra-cascade-shell shell"/);
assert.match(
  css,
  /\[data-palitra-cascade\]\[data-cascade-ready="true"\] \.palitra-cascade-stage\s*\{[^}]*width:\s*100%/s,
);
assert.doesNotMatch(
  css,
  /\[data-palitra-cascade\]\[data-cascade-ready="true"\] \.palitra-cascade-stage\s*\{[^}]*width:\s*100vw|margin-left:\s*calc\(50% - 50vw\)/s,
);
assert.match(
  css,
  /\.palitra-cascade-screens\s*\{[^}]*width:\s*min\(calc\(100% - \(var\(--gutter\) \* 2\)\),\s*1280px\)[^}]*margin-inline:\s*auto/s,
);
assert.match(css, /\.site-footer\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/s);
```

Add motion-timing assertions:

```js
assert.match(siteScript, /const cascadeSpreadEnd = 0\.68;/);
assert.match(siteScript, /const cascadeCopyStart = 0\.76;/);
assert.match(siteScript, /const cascadeCopyEnd = 0\.94;/);
assert.match(
  siteScript,
  /const local = Math\.min\(1, Math\.max\(0, \(progress - delay\) \/ \(cascadeSpreadEnd - delay\)\)\);/,
);
assert.match(
  siteScript,
  /const copyProgress = \(progress - cascadeCopyStart\) \/ \(cascadeCopyEnd - cascadeCopyStart\);/,
);
```

- [ ] **Step 2: Run the structural suite and verify RED**

Run:

```bash
npm test
```

Expected: the component still has `.palitra-cascade-shell shell`, the sticky stage still uses `100vw` and a negative margin, the footer is capped by `.shell`, and the timing constants do not exist.

- [ ] **Step 3: Make the cascade root naturally full width**

In `src/components/PalitraScreenCascade.astro`, change only the two wrapper class attributes:

```astro
<div class="palitra-cascade-shell" data-palitra-cascade>
  <div class="palitra-cascade-heading shell">
```

Do not change data attributes, buttons, image markup, dialog markup, or accessible labels.

- [ ] **Step 4: Replace the viewport-width hack and uncap the footer**

Change the static canvas and sticky stage CSS to:

```css
.palitra-cascade-screens {
  display: grid;
  gap: clamp(28px, 4vw, 58px);
  width: min(calc(100% - (var(--gutter) * 2)), 1280px);
  margin-inline: auto;
}

[data-palitra-cascade][data-cascade-ready="true"] .palitra-cascade-stage {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100svh;
  overflow: clip;
}

[data-palitra-cascade][data-cascade-ready="true"] .palitra-cascade-screens {
  position: relative;
  display: block;
  height: min(76svh, 720px);
}

.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  width: 100%;
  max-width: none;
  padding-top: 34px;
  padding-bottom: 34px;
  color: rgba(255, 255, 255, 0.62);
  background: var(--night);
  border-top: 1px solid var(--line);
  font-size: 12px;
}
```

- [ ] **Step 5: Delay the centered copy until distribution is complete**

In `src/scripts/site.ts`, add:

```ts
const cascadeSpreadEnd = 0.68;
const cascadeCopyStart = 0.76;
const cascadeCopyEnd = 0.94;
```

Replace the screen progress mapping with:

```ts
const delay = index * 0.055;
const local = Math.min(1, Math.max(0, (progress - delay) / (cascadeSpreadEnd - delay)));
```

Replace the copy-opacity calculation with:

```ts
const copyProgress = (progress - cascadeCopyStart) / (cascadeCopyEnd - cascadeCopyStart);
copy.style.setProperty("--cascade-copy-opacity", String(Math.min(1, Math.max(0, copyProgress))));
```

- [ ] **Step 6: Run the structural suite and verify GREEN**

Run:

```bash
npm test
```

Expected: all source-contract tests pass, including the new structure, timing, and width assertions.

- [ ] **Step 7: Commit**

```bash
git add ../tests/v3-landing.test.mjs src/components/PalitraScreenCascade.astro src/scripts/site.ts src/styles/global.css
git commit -m "fix(v3): stabilize Palitra cascade layout and timing"
```

---

### Task 4: Full Validation and Responsive Evidence

**Files:**
- Verify: `src/styles/global.css`
- Verify: `src/components/PalitraScreenCascade.astro`
- Verify: `src/scripts/site.ts`
- Verify: `../tests/v3-landing.test.mjs`

**Interfaces:**
- Consumes: the completed source changes from Tasks 1–3.
- Produces: fresh structural, type, build, and responsive evidence for handoff.

- [ ] **Step 1: Run the full automated validation cycle**

Run:

```bash
npm test
npm run check
npm run build
npm run test:build
```

Expected:

- `npm test`: all source-contract tests pass;
- `npm run check`: zero errors, warnings, and hints;
- `npm run build`: twelve static pages build successfully;
- `npm run test:build`: all production HTML contract tests pass.

- [ ] **Step 2: Check generated assets and paths**

Run:

```bash
rg -n "Управляем маркетингом|Собираем каналы|AI-директор по маркетингу" dist/index.html dist/preview/services/index.html dist/preview/palitra-screen-cascade/index.html
rg -n "100vw|50vw|cascadeSpreadEnd|cascadeCopyStart" src/styles/global.css src/scripts/site.ts
```

Expected: approved copy exists in generated HTML; the cascade CSS contains no `100vw`/`50vw` full-bleed hack; the script contains the approved timing constants.

- [ ] **Step 3: Inspect responsive geometry**

Use the approved browser surface when local navigation is permitted, otherwise wait for an explicitly authorized deployment before production visual QA. At `1600×900`, `1440×900`, `900×900`, and `390×844`, record:

```js
({
  viewport: window.innerWidth,
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  footer: (() => {
    const rect = document.querySelector(".site-footer").getBoundingClientRect();
    return { left: rect.left, right: rect.right, width: rect.width };
  })(),
  cascade: (() => {
    const rect = document.querySelector(".palitra-cascade-stage").getBoundingClientRect();
    return { left: rect.left, right: rect.right, width: rect.width };
  })(),
})
```

Expected: `scrollWidth === clientWidth`; footer and cascade left/right edges match the viewport at wide widths; Industries use 3/2/1 columns at the approved breakpoints; Services is `22px` except `17px` on mobile; selected eyebrows are `18px` except `14px` on mobile.

- [ ] **Step 4: Inspect motion and accessibility**

At desktop width, scroll through the cascade and confirm screen transforms have reached their final values before `--cascade-copy-opacity` rises above `0`. In reduced-motion mode and at mobile width, confirm the six screenshots remain an ordinary readable grid and the centered message is visible. Activate one screenshot by keyboard, close with `Escape`, and confirm focus returns to the source button.

- [ ] **Step 5: Review the final diff**

Run:

```bash
git diff --check 6109add^..HEAD
git status --short
git log -6 --oneline
```

Expected: no whitespace errors; only the approved specification, plan, tests, component, CSS, and script changes are tracked; unrelated user files remain untouched.
