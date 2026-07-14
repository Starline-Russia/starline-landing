# Starline v3 Hero Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update only the v3 Hero content and spacing, remove its decorative stars, and expose the component on a standalone browser preview route.

**Architecture:** Keep `Hero.astro` as the single source of Hero markup. Render it both in the landing page and in a minimal `/preview/hero/` Astro page. Keep foundation tokens unchanged and scope all visual adjustments to existing `.hero` selectors.

**Tech Stack:** Astro 7.0.9, strict TypeScript, plain CSS, Node test runner.

## Global Constraints

- Preserve the current centered two-line Hero composition, night canvas, coordinate grid, orbital lines, violet headline accent, one CTA, and three metrics.
- Remove both decorative Hero stars; do not modify the header logo.
- Use `18px` metric labels on desktop with a smaller responsive value on mobile.
- Do not modify any section after Hero.
- The preview route must render Hero without the site header, later sections, or footer.

---

### Task 1: Lock the Hero contract with source tests

**Files:**
- Modify: `tests/v3-landing.test.mjs`
- Test: `tests/v3-landing.test.mjs`

**Interfaces:**
- Consumes: `v3/src/components/Hero.astro`, `v3/src/styles/global.css`, and `v3/src/pages/preview/hero.astro` as source text.
- Produces: a source-level contract for copy, absence of decorative stars, component-specific typography, spacing, and the isolated preview route.

- [ ] **Step 1: Write the failing test**

Replace the old `>19<` assertion and add a focused test:

```js
assert.match(markup, />100\+</);
assert.match(markup, /лет - средний опыт сотрудников/);
assert.match(markup, /проектов - совокупный опыт команды/);

test("hero has isolated responsive styling and a standalone preview", async () => {
  const hero = await readFile(path.join(v3Root, "src", "components", "Hero.astro"), "utf8");
  const css = await readFile(path.join(v3Root, "src", "styles", "global.css"), "utf8");
  const preview = await readFile(path.join(v3Root, "src", "pages", "preview", "hero.astro"), "utf8");

  assert.doesNotMatch(hero, /star-small|class="star/);
  assert.match(css, /\.hero-metrics dd\s*\{[^}]*font-size:\s*18px/s);
  assert.match(css, /\.hero h1\s*\{[^}]*margin-bottom:\s*36px/s);
  assert.match(css, /\.hero \.button-primary\s*\{[^}]*margin-top:\s*46px/s);
  assert.match(preview, /import Hero from "\.\.\/\.\.\/components\/Hero\.astro"/);
  assert.match(preview, /<Hero\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Tasks|SiteFooter/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd v3 && npm test`

Expected: FAIL because the current metric is `19`, the old labels and `star-small` remain, and the preview route does not exist.

- [ ] **Step 3: Commit the red test only after implementation is ready to follow**

The repository may be dirty with user-owned untracked files. Stage only `tests/v3-landing.test.mjs` together with the implementation in Task 2; do not stage unrelated paths.

### Task 2: Update Hero markup and component-scoped styles

**Files:**
- Modify: `v3/src/components/Hero.astro`
- Modify: `v3/src/styles/global.css`
- Create: `v3/src/pages/preview/hero.astro`
- Test: `tests/v3-landing.test.mjs`

**Interfaces:**
- Consumes: `BaseLayout` for global fonts/styles and `Hero` for shared component markup.
- Produces: `/preview/hero/` and the revised Hero on `/`.

- [ ] **Step 1: Apply the minimal Hero markup change**

Remove the decorative star element and use these metrics:

```astro
<dl class="hero-metrics" aria-label="Опыт Starline">
  <div><dt>10+</dt><dd>лет - средний опыт сотрудников</dd></div>
  <div><dt>50+</dt><dd>каналов привлечения</dd></div>
  <div><dt>100+</dt><dd>проектов - совокупный опыт команды</dd></div>
</dl>
```

- [ ] **Step 2: Apply Hero-only spacing and label typography**

Use these desktop values without changing global tokens:

```css
.hero h1 { margin-bottom: 36px; }
.hero .button-primary { margin-top: 46px; }
.hero-metrics { margin-top: 62px; }
.hero-metrics dd { min-height: 54px; font-size: 18px; line-height: 1.35; }
```

Under `@media (max-width: 760px)`, set `.hero-metrics dd` to `15px` with `min-height: 0`. Delete the unused `.star-small` rule while retaining the generic `.star` rule for other existing sections.

- [ ] **Step 3: Create the isolated preview route**

Create `v3/src/pages/preview/hero.astro`:

```astro
---
import Hero from "../../components/Hero.astro";
import BaseLayout from "../../layouts/BaseLayout.astro";
---

<BaseLayout
  title="Starline v3 — Hero preview"
  description="Изолированный предпросмотр первого экрана Starline v3."
>
  <main class="component-preview">
    <section class="scene hero"><Hero /></section>
  </main>
</BaseLayout>
```

- [ ] **Step 4: Run the source tests**

Run: `cd v3 && npm test`

Expected: all source tests PASS.

- [ ] **Step 5: Run type and production checks**

Run: `cd v3 && npm run check && npm run build`

Expected: Astro reports zero errors; the build creates both `dist/index.html` and `dist/preview/hero/index.html`.

- [ ] **Step 6: Commit only the Hero pass**

```bash
git add tests/v3-landing.test.mjs v3/src/components/Hero.astro v3/src/styles/global.css v3/src/pages/preview/hero.astro
git commit -m "Refine v3 hero component"
```

### Task 3: Browser verification

**Files:**
- Verify: `v3/src/components/Hero.astro`
- Verify: `v3/src/styles/global.css`
- Verify: `v3/src/pages/preview/hero.astro`

**Interfaces:**
- Consumes: running Astro dev server at `http://127.0.0.1:4322/preview/hero/`.
- Produces: approved visual behavior at desktop and mobile widths.

- [ ] **Step 1: Open the isolated preview at 1440×900**

Confirm the stars are absent, the increased gaps are visible, long metric labels wrap cleanly, and all metrics remain above the fold.

- [ ] **Step 2: Check the preview at 390×844**

Confirm the headline, CTA, and stacked metric rows do not overflow horizontally and labels remain readable.

- [ ] **Step 3: Check the main page at desktop width**

Confirm `/` uses the same Hero and every section after Hero is unchanged.
