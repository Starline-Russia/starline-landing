# Palitra Official Logo Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the reconstructed Starline mark and text in the Palitra section core with the official Palitra logo from `palitraio/design-system`.

**Architecture:** Keep `Palitra.astro` as the only section implementation and add a standalone `/preview/palitra/` route that imports it. Render the official PNG as a decorative image inside the existing accessible `.palitra-core`; because the source PNG includes an opaque white canvas, CSS presents it as a circular badge without altering the asset. CSS continues to own its responsive size and glow.

**Tech Stack:** Astro `7.0.9`, strict TypeScript, ordinary CSS, Node test runner.

## Global Constraints

- Preserve Astro `7.0.9`, strict TypeScript, and ordinary CSS.
- Store the official logo in `public/assets/`.
- Do not recreate or recolor the Palitra mark.
- Do not change Palitra copy, areas, orbit geometry, or senior-control message.
- Keep the section readable without JavaScript.
- Keep all work local; do not push, deploy, or create a PR.

---

### Task 1: Render the official Palitra logo from the shared component

**Files:**
- Create: `src/pages/preview/palitra.astro`
- Modify: `src/components/Palitra.astro`
- Modify: `src/styles/global.css`
- Test: `../tests/v3-landing.test.mjs`
- Test: `../tests/v3-build.test.mjs`
- Verify existing asset: `public/assets/palitra-logo-512.png`

**Interfaces:**
- Consumes: public asset URL `/assets/palitra-logo-512.png`.
- Produces: `.palitra-logo` image rendered inside `.palitra-core` and preview route `/preview/palitra/`.

- [ ] **Step 1: Write the failing source-contract test**

Add this test to `../tests/v3-landing.test.mjs`:

```js
test("palitra uses the official logo and has a standalone preview", async () => {
  const component = await readFile(
    path.join(v3Root, "src", "components", "Palitra.astro"),
    "utf8",
  );
  const css = await readFile(path.join(v3Root, "src", "styles", "global.css"), "utf8");
  const logo = await readFile(
    path.join(v3Root, "public", "assets", "palitra-logo-512.png"),
  );
  const previewPath = path.join(v3Root, "src", "pages", "preview", "palitra.astro");
  const pageFiles = await collectFiles(path.join(v3Root, "src", "pages"), ".astro");

  assert.ok(logo.byteLength > 0, "official Palitra logo should exist");
  assert.match(component, /class="palitra-logo"/);
  assert.match(component, /src="\/assets\/palitra-logo-512\.png"/);
  assert.match(component, /width="512"/);
  assert.match(component, /height="512"/);
  assert.doesNotMatch(component, /class="star"|<strong>Palitra<\/strong>/);
  assert.match(css, /\.palitra-core \.palitra-logo\s*\{[^}]*object-fit:\s*contain/s);
  assert.ok(pageFiles.includes(previewPath), "standalone Palitra preview should exist");

  const preview = await readFile(previewPath, "utf8");
  assert.match(preview, /import Palitra from "\.\.\/\.\.\/components\/Palitra\.astro"/);
  assert.match(preview, /<Palitra\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Economics|Cases|SiteFooter/);
});
```

- [ ] **Step 2: Run the source-contract test and verify RED**

Run:

```bash
npm test
```

Expected: FAIL because `Palitra.astro` does not contain `.palitra-logo` and `src/pages/preview/palitra.astro` does not exist.

- [ ] **Step 3: Implement the minimal shared-component change**

Replace the existing `.palitra-core` contents in `src/components/Palitra.astro` with:

```astro
<div class="palitra-core" aria-label="Palitra">
  <img
    class="palitra-logo"
    src="/assets/palitra-logo-512.png"
    alt=""
    aria-hidden="true"
    width="512"
    height="512"
  />
</div>
```

Replace the obsolete `.palitra-core .star` and `.palitra-core strong` rules in `src/styles/global.css` with:

```css
.palitra-core .palitra-logo {
  width: 230px;
  height: 230px;
  border-radius: 50%;
  object-fit: contain;
  filter: drop-shadow(0 0 35px rgba(197, 125, 251, 0.38));
}
```

Replace the mobile `.palitra-core .star` rule with:

```css
.palitra-core .palitra-logo { width: 170px; height: 170px; }
```

Create `src/pages/preview/palitra.astro`:

```astro
---
import Palitra from "../../components/Palitra.astro";
import BaseLayout from "../../layouts/BaseLayout.astro";
---

<BaseLayout
  title="Starline v3 — Palitra preview"
  description="Изолированный предпросмотр Palitra в Starline v3."
>
  <main class="component-preview">
    <section class="scene palitra"><Palitra /></section>
  </main>
</BaseLayout>
```

- [ ] **Step 4: Run the source-contract test and verify GREEN**

Run:

```bash
npm test
```

Expected: all source and structural tests pass.

- [ ] **Step 5: Add the production HTML assertion**

Add to the first test in `../tests/v3-build.test.mjs`:

```js
assert.match(
  html,
  /<img\b[^>]*class="palitra-logo"[^>]*src="\/assets\/palitra-logo-512\.png"[^>]*width="512"[^>]*height="512"[^>]*>/,
);
```

- [ ] **Step 6: Run the complete verification cycle**

Run:

```bash
npm test
npm run check
npm run build
npm run test:build
```

Expected: each command exits with code `0`.

- [ ] **Step 7: Visually verify the shared component**

Run the local Astro server and inspect:

- `/preview/palitra/` at `1440×900`, tablet width, and `390×844`;
- `/` at the same widths;
- logo transparency, intrinsic aspect ratio, overflow, console errors, missing assets, and no-JavaScript readability.

- [ ] **Step 8: Commit**

Run from `/Users/papenov/Documents/Starlinerussia.ru/v3`:

```bash
git add \
  public/assets/palitra-logo-512.png \
  src/components/Palitra.astro \
  src/pages/preview/palitra.astro \
  src/styles/global.css \
  ../tests/v3-landing.test.mjs \
  ../tests/v3-build.test.mjs \
  docs/superpowers/plans/2026-07-17-v3-palitra-official-logo.md
git commit -m "feat(v3): use official Palitra logo"
```
