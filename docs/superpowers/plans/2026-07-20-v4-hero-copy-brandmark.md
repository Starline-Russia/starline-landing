# v4 Hero Copy and Brand Mark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the approved v4 hero title and replace the header's peach square with the official peach logo asset.

**Architecture:** Keep the hero copy in `src/data/site.ts`. Keep the header as one accessible link, replacing only its decorative mark span with a presentational image from the existing locked asset pair. The full page and `/preview/hero/` continue to import the same header and hero components.

**Tech Stack:** Astro 7.0.9, TypeScript 6.0.3, ordinary CSS, Node test runner.

## Global Constraints

- Work only in branch `v4` and its `v4/` project directory.
- Use the user-supplied title exactly: `Performance-маркетинг в эпоху AI`.
- Use the approved `public/assets/logo/8-1-peach.png` asset without changing it.
- Preserve the locked hero reveal and the existing responsive header structure.
- Do not add dependencies, animations, or fabricated claims.

---

### Task 1: Update shared hero copy and header brand mark

**Files:**
- Modify: `v4/src/data/site.ts`
- Modify: `v4/src/components/SiteHeader.astro`
- Modify: `v4/src/styles/global.css`
- Test: `tests/v4-landing.test.mjs`

**Interfaces:**
- Consumes: `hero.title`, `brand`, and the approved peach PNG at `/assets/logo/8-1-peach.png`.
- Produces: One shared title for `Hero.astro` and one decorative peach asset inside the existing header link.

- [ ] **Step 1: Write the failing structural test**

```js
assert.match(siteData, /title:\s*["']Performance-маркетинг в эпоху AI["']/);
assert.match(header, /src="\/assets\/logo\/8-1-peach\.png"/);
assert.match(header, /class="site-header__brand-logo"/);
```

- [ ] **Step 2: Run the v4 test suite and verify RED**

Run: `node --test ../tests/v4-landing.test.mjs`

Expected: the new title assertion fails because the previous e-commerce title is still present.

- [ ] **Step 3: Implement the minimal shared changes**

```ts
export const hero = {
  title: "Performance-маркетинг в эпоху AI",
  // existing properties remain unchanged
} as const;
```

```astro
<img class="site-header__brand-logo" src="/assets/logo/8-1-peach.png" alt="" width="1024" height="1024" aria-hidden="true" />
```

```css
.site-header__brand-logo {
  width: 2rem;
  aspect-ratio: 1;
  object-fit: contain;
}
```

- [ ] **Step 4: Run the v4 test suite and verify GREEN**

Run: `node --test ../tests/v4-landing.test.mjs`

Expected: all tests pass.

- [ ] **Step 5: Run full verification**

Run: `npm test`, `npm run check`, `npm run build`, and `git diff --check`.

Expected: no test failures, Astro diagnostics, build failures, or whitespace errors.
