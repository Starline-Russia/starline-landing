# Economics Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy economics trade-off comparison with a readable three-step GMV growth explanation and an explicit non-guarantee caveat.

**Architecture:** Keep `Economics.astro` as the sole shared section rendered by both the page and a new isolated preview. The component owns semantic content; its section-only layout lives in `global.css`; the source test protects the approved copy, removed concepts, and preview isolation.

**Tech Stack:** Astro 7.0.9, strict TypeScript, plain CSS, Node test runner.

## Global Constraints

- Preserve Astro 7.0.9, strict TypeScript, and plain CSS; add no runtime dependency or JavaScript interaction.
- Use only the approved progression: `CPA вырастет`, `ДРР тоже вырастет`, `GMV вырастет ещё сильнее`.
- Show `+20–50% GMV за 6–12 месяцев` adjacent to text that it depends on starting economics, product, and market and is not a guarantee.
- Do not retain labels equivalent to `Допустимый компромисс` or `Целевой результат`, a symbolic arrow, or unsupported claims.
- Preview must import only `Economics.astro` inside `BaseLayout`; it must not include the header, footer, or neighboring sections.

---

### Task 1: Economics shared component and isolated preview

**Files:**
- Create: `src/pages/preview/economics.astro`
- Modify: `src/components/Economics.astro`
- Modify: `src/styles/global.css`
- Modify: `../tests/v3-landing.test.mjs`

**Interfaces:**
- Consumes: `BaseLayout` from `src/layouts/BaseLayout.astro` and the existing `scene economics` wrapper in `src/pages/index.astro`.
- Produces: static `Economics` markup with `.economics-flow`, `.economics-step`, `.economics-outcome`, and `.economics-caveat` hooks; `/preview/economics/` renders only that component.

- [x] **Step 1: Write the failing structural test**

  Add a `test("economics explains GMV growth with an explicit non-guarantee caveat", ...)` block that reads the component, CSS, and preview. Assert the three approved phrases, `+20–50% GMV за 6–12 месяцев`, the phrase `не является гарантией`, absence of the two legacy labels and `tradeoff-arrow`, the preview import/render, and stacked responsive CSS for `.economics-flow`.

- [x] **Step 2: Run the test to verify it fails**

  Run: `PATH=/Users/papenov/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test`

  Expected: FAIL because the existing component still contains the legacy labels and arrow and no economics preview exists.

- [x] **Step 3: Implement the minimal shared section**

  Replace the comparison markup with this semantic order:

  ```astro
  <div class="economics-flow" aria-label="Логика роста GMV">
    <p class="economics-step"><strong>01</strong><span>CPA вырастет</span></p>
    <p class="economics-step"><strong>02</strong><span>ДРР тоже вырастет</span></p>
    <p class="economics-step"><strong>03</strong><span>GMV вырастет ещё сильнее</span></p>
  </div>
  ```

  Add a distinct `.economics-outcome` area with the approved range, the existing three consequences, and caveat copy directly beside it. Add `src/pages/preview/economics.astro` using `BaseLayout`, `Economics`, and `<main class="component-preview"><section class="scene economics"><Economics /></section></main>`. Replace only economics CSS with a divider-led flow and responsive one-column rules; remove all arrow styling.

- [x] **Step 4: Run the test to verify it passes**

  Run: `PATH=/Users/papenov/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm test`

  Expected: all structural tests pass, including the new economics assertion.

- [x] **Step 5: Verify the production artifact and responsive preview**

  Run:

  ```bash
  PATH=/Users/papenov/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run check
  PATH=/Users/papenov/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run build
  PATH=/Users/papenov/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH npm run test:build
  ```

  Inspect `/preview/economics/` and the full page at 1440×900, tablet, and 390×844. Confirm no horizontal overflow, clipped content, runtime errors, or motion dependency.

- [x] **Step 6: Commit the focused change**

  ```bash
  git add ../tests/v3-landing.test.mjs src/components/Economics.astro src/pages/preview/economics.astro src/styles/global.css docs/superpowers/plans/2026-07-17-v3-economics.md
  git commit -m "feat(v3): clarify economics growth model"
  ```
