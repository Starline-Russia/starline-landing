# Starline v4 Hero Logo Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the v4 hero SVG with two pixel-aligned Starline logo layers, add a pointer-following CSS-mask reveal, and expose tuning controls only on `/preview/hero/`.

**Architecture:** `HeroLogoReveal.astro` owns the two-layer figure and optional inspector markup. `Hero.astro` passes a route-owned boolean prop, while `hero-logo-reveal.ts` progressively enhances every local reveal root with Pointer Events, animation-frame batching, clamped CSS custom properties, reset behavior, and image-error fallbacks. The `.hero__visual` wrapper keeps grid ownership and spans its available column; the inner surface preserves the current rendered logo width and responsive aspect ratio so the mobile inspector can remain readable below it.

**Tech Stack:** Astro 7.0.9 static output, TypeScript 6.0.3, plain CSS with existing design tokens, vanilla Pointer Events, Node's built-in test runner.

## Global Constraints

- Top source is `assets/logo/v8-1-peach.png`; bottom source is `assets/logo/v8-1.png`.
- Copy only those two approved 1024 × 1024 PNG files into `v4/public/assets/logo/`; leave all other untracked assets untouched.
- The peach image is physically above the violet image; do not simulate the relationship with recoloring or filters.
- Keep the existing rendered image width, grid placement, and responsive footprint; only its wrapper may span the available column for the preview inspector.
- Use `object-fit: contain`; never distort or crop the square sources at 4:3 breakpoints.
- The inspector exists only when the preview route passes `showLogoControls={true}`.
- Do not introduce Canvas, WebGL, React, Tailwind, animation libraries, runtime fetches, local storage, or new dependencies.
- Use only existing color, type, spacing, rule, radius, shadow, easing, duration, and z-index tokens.
- Animate only transform and opacity; the direct pointer mask update has no decorative easing or trailing loop.
- Preserve `prefers-reduced-motion`, touch scrolling, visible focus, 44 px targets, and `overflow-x: clip` behavior.
- Stop after this component checkpoint; do not start Starline v4 Checkpoint 2.

---

## File Map

- Create `v4/src/components/HeroLogoReveal.astro`: semantic layered figure and optional preview inspector.
- Create `v4/src/scripts/hero-logo-reveal.ts`: local progressive-enhancement controller.
- Create `v4/public/assets/logo/8-1-peach.png`: approved peach source copied byte-for-byte.
- Create `v4/public/assets/logo/8-1.png`: approved violet source copied byte-for-byte.
- Modify `v4/src/components/Hero.astro`: accept `showLogoControls?: boolean` and replace the SVG with `HeroLogoReveal`.
- Modify `v4/src/pages/preview/hero.astro`: opt into inspector controls.
- Modify `v4/src/scripts/site.ts`: initialize reveal components after the existing navigation setup.
- Modify `v4/src/styles/global.css`: append/replace only hero-visual rules needed for the layered image, mask, and inspector.
- Modify `tests/v4-landing.test.mjs`: add exact asset, markup, route, controller, CSS-mask, and dependency-boundary assertions.

---

### Task 1: Layered Logo Markup, Assets, and Route Ownership

**Files:**
- Create: `v4/src/components/HeroLogoReveal.astro`
- Create: `v4/public/assets/logo/8-1-peach.png`
- Create: `v4/public/assets/logo/8-1.png`
- Modify: `v4/src/components/Hero.astro`
- Modify: `v4/src/pages/preview/hero.astro`
- Test: `tests/v4-landing.test.mjs`

**Interfaces:**
- Consumes: approved local PNGs at `assets/logo/v8-1-peach.png` and `assets/logo/v8-1.png`.
- Produces: `HeroLogoReveal.astro` prop `showControls?: boolean`, default `false`.
- Produces: `Hero.astro` prop `showLogoControls?: boolean`, default `false`.
- Produces: DOM hooks `[data-logo-reveal]`, `[data-logo-reveal-surface]`, `[data-logo-layer]`, `[data-reveal-inspector]`, `[data-reveal-control]`, `[data-reveal-value]`, and `[data-reveal-reset]` for Task 2.

- [ ] **Step 1: Add the failing structure and exact-asset test**

Add `createHash` to the imports and append this test to `tests/v4-landing.test.mjs`:

```js
import { createHash } from "node:crypto";

test("v4 hero uses the approved aligned logo pair and preview-only controls", async () => {
  const component = await source("v4/src/components/HeroLogoReveal.astro");
  const heroComponent = await source("v4/src/components/Hero.astro");
  const indexPage = await source("v4/src/pages/index.astro");
  const previewPage = await source("v4/src/pages/preview/hero.astro");
  const peach = await readFile(path.join(root, "v4/public/assets/logo/8-1-peach.png"));
  const violet = await readFile(path.join(root, "v4/public/assets/logo/8-1.png"));

  assert.equal(peach.readUInt32BE(16), 1024);
  assert.equal(peach.readUInt32BE(20), 1024);
  assert.equal(violet.readUInt32BE(16), 1024);
  assert.equal(violet.readUInt32BE(20), 1024);
  assert.equal(createHash("sha256").update(peach).digest("hex"), "05b2aca8c70212b2cf6625e67b0b6809ad1246741de157f1a145b38ce3d818db");
  assert.equal(createHash("sha256").update(violet).digest("hex"), "11c6b2f96d1d4b6f40133462c80dfb7926bafd699e78099c510cabc465b05d00");

  assert.match(component, /showControls\s*=\s*false/);
  assert.match(component, /data-logo-reveal/);
  assert.match(component, /data-logo-reveal-surface/);
  assert.match(component, /8-1\.png/);
  assert.match(component, /8-1-peach\.png/);
  assert.ok(component.indexOf("8-1.png") < component.indexOf("8-1-peach.png"));
  assert.match(component, /showControls\s*&&/);
  assert.match(component, /data-reveal-inspector/);

  assert.match(heroComponent, /import HeroLogoReveal/);
  assert.match(heroComponent, /showLogoControls\s*=\s*false/);
  assert.match(heroComponent, /<HeroLogoReveal\s+showControls=\{showLogoControls\}/);
  assert.doesNotMatch(heroComponent, /<svg\b/);
  assert.match(indexPage, /<Hero\s*\/>/);
  assert.doesNotMatch(indexPage, /showLogoControls/);
  assert.match(previewPage, /<Hero\s+showLogoControls=\{true\}\s*\/>/);
});
```

Replace the old hero test's SVG assertion with `assert.doesNotMatch(heroComponent, /<svg\b/);` so the earlier contract now reflects the approved replacement.

- [ ] **Step 2: Run the test and verify the red state**

Run:

```bash
node --test tests/v4-landing.test.mjs
```

Expected: FAIL with `ENOENT` for `v4/src/components/HeroLogoReveal.astro` or the public PNG path; all pre-existing tests still execute.

- [ ] **Step 3: Copy only the approved binary assets**

Run:

```bash
mkdir -p v4/public/assets/logo
cp assets/logo/v8-1-peach.png v4/public/assets/logo/8-1-peach.png
cp assets/logo/v8-1.png v4/public/assets/logo/8-1.png
```

Verify byte identity:

```bash
shasum -a 256 assets/logo/v8-1-peach.png v4/public/assets/logo/8-1-peach.png assets/logo/v8-1.png v4/public/assets/logo/8-1.png
```

Expected: the first pair both report `05b2aca8c70212b2cf6625e67b0b6809ad1246741de157f1a145b38ce3d818db`; the second pair both report `11c6b2f96d1d4b6f40133462c80dfb7926bafd699e78099c510cabc465b05d00`.

- [ ] **Step 4: Create the semantic reveal component**

Create `v4/src/components/HeroLogoReveal.astro`:

```astro
---
interface Props {
  showControls?: boolean;
}

const { showControls = false } = Astro.props;
---

<div class="hero__visual hero-logo-reveal" data-logo-reveal data-reveal>
  <figure
    class="hero-logo-reveal__surface"
    data-logo-reveal-surface
    role="img"
    aria-labelledby="hero-logo-title hero-logo-description"
  >
    <span id="hero-logo-title" class="visually-hidden">Знак Starline</span>
    <span id="hero-logo-description" class="visually-hidden">
      Персиковый знак Starline при наведении открывает фиолетовую версию под ним.
    </span>
    <img
      class="hero-logo-reveal__layer hero-logo-reveal__layer--violet"
      data-logo-layer="violet"
      src="/assets/logo/8-1.png"
      alt=""
      width="1024"
      height="1024"
      draggable="false"
      aria-hidden="true"
    />
    <img
      class="hero-logo-reveal__layer hero-logo-reveal__layer--peach"
      data-logo-layer="peach"
      src="/assets/logo/8-1-peach.png"
      alt=""
      width="1024"
      height="1024"
      draggable="false"
      aria-hidden="true"
    />
  </figure>

  {showControls && (
    <aside class="reveal-inspector" data-reveal-inspector aria-label="Настройка эффекта просвечивания">
      <div class="reveal-inspector__heading">
        <strong>Просвечивание</strong>
        <span>Hero preview</span>
      </div>

      <label class="reveal-inspector__control">
        <span>Радиус <output data-reveal-value="radius">112 px</output></span>
        <input data-reveal-control="radius" type="range" min="72" max="240" step="1" value="112" />
      </label>

      <label class="reveal-inspector__control">
        <span>Мягкость <output data-reveal-value="feather">36 px</output></span>
        <input data-reveal-control="feather" type="range" min="0" max="64" step="1" value="36" />
      </label>

      <label class="reveal-inspector__control">
        <span>Интенсивность <output data-reveal-value="intensity">100%</output></span>
        <input data-reveal-control="intensity" type="range" min="20" max="100" step="1" value="100" />
      </label>

      <button class="reveal-inspector__reset" data-reveal-reset type="button">Сбросить</button>
    </aside>
  )}
</div>
```

- [ ] **Step 5: Replace the SVG and make preview ownership explicit**

At the top of `v4/src/components/Hero.astro`, add the component import, prop contract, and default:

```astro
---
import HeroLogoReveal from "./HeroLogoReveal.astro";
import { hero, heroArtifacts } from "../data/site";

interface Props {
  showLogoControls?: boolean;
}

const { showLogoControls = false } = Astro.props;
---
```

Replace the existing `<figure class="hero__visual" ...>...</figure>` SVG block with:

```astro
<HeroLogoReveal showControls={showLogoControls} />
```

In `v4/src/pages/preview/hero.astro`, change only the hero invocation:

```astro
<Hero showLogoControls={true} />
```

Keep `v4/src/pages/index.astro` unchanged as `<Hero />`.

- [ ] **Step 6: Run the structural test and Astro type check**

Run:

```bash
node --test tests/v4-landing.test.mjs
cd v4 && npm run check
```

Expected: every Node test passes; Astro reports `0 errors`, `0 warnings`, and `0 hints`.

- [ ] **Step 7: Commit the static layered component**

```bash
git add tests/v4-landing.test.mjs v4/src/components/Hero.astro v4/src/components/HeroLogoReveal.astro v4/src/pages/preview/hero.astro v4/public/assets/logo/8-1-peach.png v4/public/assets/logo/8-1.png
git commit -m "feat(v4): layer hero logo artwork"
```

---

### Task 2: Pointer Reveal, Preview Inspector, and Responsive Styling

**Files:**
- Create: `v4/src/scripts/hero-logo-reveal.ts`
- Modify: `v4/src/scripts/site.ts`
- Modify: `v4/src/styles/global.css`
- Test: `tests/v4-landing.test.mjs`

**Interfaces:**
- Consumes: Task 1 data hooks and the `showControls`-scoped inspector markup.
- Produces: `initHeroLogoReveals(scope: ParentNode = document): void`.
- Produces CSS properties on each `[data-logo-reveal]`: `--reveal-x`, `--reveal-y`, `--reveal-radius`, `--reveal-feather`, and `--reveal-opacity`.
- Produces root states `data-active`, `data-underlay-available`, and `data-top-available`.

- [ ] **Step 1: Add the failing controller and CSS contract test**

Append to `tests/v4-landing.test.mjs`:

```js
test("v4 logo reveal uses local pointer state, CSS masking, and clamped preview controls", async () => {
  const controller = await source("v4/src/scripts/hero-logo-reveal.ts");
  const siteController = await source("v4/src/scripts/site.ts");
  const css = await source("v4/src/styles/global.css");

  assert.match(controller, /export function initHeroLogoReveals/);
  assert.match(controller, /pointerenter/);
  assert.match(controller, /pointermove/);
  assert.match(controller, /pointerleave/);
  assert.match(controller, /pointercancel/);
  assert.match(controller, /requestAnimationFrame/);
  assert.match(controller, /cancelAnimationFrame/);
  assert.match(controller, /style\.setProperty/);
  assert.match(controller, /Math\.min/);
  assert.match(controller, /Math\.max/);
  assert.match(controller, /data-reveal-reset/);
  assert.doesNotMatch(controller, /fetch\(|canvas|webgl|localStorage|gsap|framer|lottie/i);
  assert.match(siteController, /initHeroLogoReveals/);

  assert.match(css, /\.hero-logo-reveal__layer--peach/);
  assert.match(css, /mask-image:\s*radial-gradient/);
  assert.match(css, /-webkit-mask-image:\s*radial-gradient/);
  assert.match(css, /object-fit:\s*contain/);
  assert.match(css, /touch-action:\s*pan-y/);
  assert.match(css, /\.reveal-inspector/);
  assert.match(css, /position:\s*fixed/);
  assert.doesNotMatch(css, /transition:\s*all\b/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
});
```

- [ ] **Step 2: Run the test and verify the red state**

Run:

```bash
node --test tests/v4-landing.test.mjs
```

Expected: FAIL with `ENOENT` for `v4/src/scripts/hero-logo-reveal.ts`.

- [ ] **Step 3: Implement the local reveal controller**

Create `v4/src/scripts/hero-logo-reveal.ts`:

```ts
type ControlName = "radius" | "feather" | "intensity";

const defaults: Record<ControlName, number> = {
  radius: 112,
  feather: 36,
  intensity: 100,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const outputText = (name: ControlName, value: number) =>
  name === "intensity" ? `${value}%` : `${value} px`;

export function initHeroLogoReveals(scope: ParentNode = document): void {
  scope.querySelectorAll<HTMLElement>("[data-logo-reveal]").forEach((root) => {
    const surface = root.querySelector<HTMLElement>("[data-logo-reveal-surface]");
    const underlay = root.querySelector<HTMLImageElement>('[data-logo-layer="violet"]');
    const topLayer = root.querySelector<HTMLImageElement>('[data-logo-layer="peach"]');
    const inspector = root.querySelector<HTMLElement>("[data-reveal-inspector]");

    if (!surface) return;

    let frame = 0;
    let nextX = 50;
    let nextY = 50;

    const writePointer = () => {
      root.style.setProperty("--reveal-x", `${nextX}%`);
      root.style.setProperty("--reveal-y", `${nextY}%`);
      frame = 0;
    };

    const move = (event: PointerEvent) => {
      if (!event.isPrimary || root.dataset.underlayAvailable === "false") return;
      const bounds = surface.getBoundingClientRect();
      nextX = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
      nextY = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100);
      root.dataset.active = "true";
      if (!frame) frame = requestAnimationFrame(writePointer);
    };

    const close = () => {
      root.dataset.active = "false";
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    surface.addEventListener("pointerenter", move);
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerleave", close);
    surface.addEventListener("pointercancel", close);
    surface.addEventListener("pointerup", (event) => {
      if (event.pointerType !== "mouse") close();
    });

    underlay?.addEventListener("error", () => {
      root.dataset.underlayAvailable = "false";
      close();
    });

    topLayer?.addEventListener("error", () => {
      root.dataset.topAvailable = "false";
      close();
      if (inspector) inspector.hidden = true;
    });

    const setControl = (input: HTMLInputElement) => {
      const name = input.dataset.revealControl as ControlName | undefined;
      if (!name || !(name in defaults)) return;
      const value = clamp(Number(input.value), Number(input.min), Number(input.max));
      input.value = String(value);

      const cssValue = name === "intensity" ? String(value / 100) : `${value}px`;
      const output = inspector?.querySelector<HTMLOutputElement>(`[data-reveal-value="${name}"]`);
      root.style.setProperty(`--reveal-${name === "intensity" ? "opacity" : name}`, cssValue);
      if (output) output.value = outputText(name, value);
    };

    inspector?.querySelectorAll<HTMLInputElement>("[data-reveal-control]").forEach((input) => {
      input.addEventListener("input", () => setControl(input));
      setControl(input);
    });

    inspector?.querySelector<HTMLButtonElement>("[data-reveal-reset]")?.addEventListener("click", () => {
      inspector.querySelectorAll<HTMLInputElement>("[data-reveal-control]").forEach((input) => {
        const name = input.dataset.revealControl as ControlName | undefined;
        if (!name || !(name in defaults)) return;
        input.value = String(defaults[name]);
        setControl(input);
      });
    });
  });
}
```

At the top of `v4/src/scripts/site.ts`, import the initializer:

```ts
import { initHeroLogoReveals } from "./hero-logo-reveal";
```

Call it once after setting `root.dataset.enhanced`:

```ts
initHeroLogoReveals();
```

- [ ] **Step 4: Replace only the hero visual rules and append inspector styles**

In `v4/src/styles/global.css`, keep the existing Hallmark stamp and all unrelated rules. Replace the old `.hero__visual` and `.hero-diagram*` block with:

```css
.hero__visual {
  --reveal-x: 50%;
  --reveal-y: 50%;
  --reveal-radius: 112px;
  --reveal-feather: 36px;
  --reveal-opacity: 1;
  display: grid;
  width: 100%;
  justify-self: stretch;
  margin: 0;
}

.hero-logo-reveal__surface {
  position: relative;
  width: min(40vw, 12rem);
  aspect-ratio: 1;
  justify-self: end;
  margin: 0;
  overflow: hidden;
  background: var(--color-paper);
  clip-path: polygon(0 8%, 91% 0, 100% 87%, 8% 100%);
  touch-action: pan-y;
}

.hero-logo-reveal__layer {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

.hero-logo-reveal__layer--violet {
  opacity: var(--reveal-opacity);
}

.hero-logo-reveal[data-active="true"] .hero-logo-reveal__layer--peach {
  -webkit-mask-image: radial-gradient(
    circle at var(--reveal-x) var(--reveal-y),
    transparent calc(var(--reveal-radius) - var(--reveal-feather)),
    var(--color-ink) calc(var(--reveal-radius) + var(--reveal-feather))
  );
  mask-image: radial-gradient(
    circle at var(--reveal-x) var(--reveal-y),
    transparent calc(var(--reveal-radius) - var(--reveal-feather)),
    var(--color-ink) calc(var(--reveal-radius) + var(--reveal-feather))
  );
}

.reveal-inspector {
  display: grid;
  gap: var(--space-md);
  margin-block-start: var(--space-md);
  padding: var(--space-md);
  border: var(--rule-thin) solid var(--color-rule);
  border-radius: var(--radius-medium);
  color: var(--color-ink);
  background: var(--color-paper);
  box-shadow: var(--shadow-nav);
  font-family: var(--font-sans);
}

.reveal-inspector__heading,
.reveal-inspector__control > span {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-sm);
}

.reveal-inspector__heading strong,
.reveal-inspector__heading span,
.reveal-inspector__control,
.reveal-inspector__reset {
  font-size: var(--text-xs);
}

.reveal-inspector__heading span,
.reveal-inspector__control output {
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}

.reveal-inspector__control {
  display: grid;
  gap: var(--space-xs);
  min-height: 2.75rem;
}

.reveal-inspector__control input {
  width: 100%;
  accent-color: var(--color-sienna);
}

.reveal-inspector__reset {
  min-height: 2.75rem;
  padding-inline: var(--space-md);
  border: var(--rule-thin) solid var(--color-ink);
  color: var(--color-paper);
  background: var(--color-ink);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: transform var(--dur-micro) var(--ease-out);
}

.reveal-inspector__reset:hover {
  transform: translateY(calc(var(--rule-thin) * -1));
}

.reveal-inspector__reset:active {
  transform: translateY(var(--rule-thin));
}
```

In the existing `@media (min-width: 40rem)` block, move the aspect ratio from `.hero__visual` to the surface:

```css
.hero-logo-reveal__surface {
  width: min(56vw, 26rem);
  aspect-ratio: 4 / 3;
}
```

In the existing `@media (min-width: 60rem)` block, preserve the current grid placement and width. Keep the inspector in flow at this breakpoint:

```css
.hero__visual {
  grid-column: 7 / 13;
  width: 100%;
  justify-self: stretch;
}

.hero-logo-reveal__surface {
  width: min(100%, 34rem);
  justify-self: stretch;
}

```

Add a separate wide-desktop breakpoint so the fixed panel uses whitespace above the logo instead of intercepting its pointer area:

```css
@media (min-width: 80rem) {
  .reveal-inspector {
    position: fixed;
    inset-block-start: calc(var(--header-height) + var(--space-lg));
    inset-inline-end: var(--space-lg);
    z-index: var(--z-sticky);
    width: min(18rem, calc(100vw - (var(--space-lg) * 2)));
    margin: 0;
  }
}
```

Add `.reveal-inspector__reset` to the existing reduced-motion transition reset list.

- [ ] **Step 5: Run targeted tests and type checking**

Run:

```bash
node --test tests/v4-landing.test.mjs
cd v4 && npm run check
```

Expected: all Node tests pass; Astro reports `0 errors`, `0 warnings`, and `0 hints`.

- [ ] **Step 6: Build and perform source-quality checks**

Run:

```bash
cd v4 && npm run build
cd .. && git diff --check
rg -n "transition:\s*all|#[0-9a-fA-F]{3,8}\b|fetch\(|canvas|webgl|localStorage|gsap|framer|lottie" v4/src tests/v4-landing.test.mjs
```

Expected: static build succeeds for `/` and `/preview/hero/`; `git diff --check` is silent; the source scan returns only intentional negative-test patterns inside `tests/v4-landing.test.mjs`, not production source.

- [ ] **Step 7: Verify the browser behavior before committing**

Serve `v4/dist` on the existing local preview port and inspect both routes.

For `/preview/hero/` verify:

- the `.hero-logo-reveal__surface` has the same computed width, height, grid column placement, and breakpoint aspect ratio as the pre-change hero visual;
- peach is the default visible layer;
- pointer center maps to approximately `50% 50%` and reveals the same logo geometry in violet;
- radius 72–240 px, feather 0–64 px, and intensity 20–100% update live;
- reset returns `112 px`, `36 px`, and `100%`;
- keyboard arrow keys adjust every native range input;
- Escape/menu behavior from Checkpoint 1 remains unchanged;
- 320, 375, 414, 768, 1280, 1440, and 1920 px widths have no horizontal overflow;
- touch emulation can scroll vertically and closes the reveal on pointer end;
- reduced-motion mode shows no hero entry transform;
- console contains no errors or warnings.

For `/` verify:

- the reveal works;
- `[data-reveal-inspector]` is absent from the DOM;
- no layout shift or control panel is visible.

- [ ] **Step 8: Run final verification and commit the interaction checkpoint**

Run fresh after the browser pass:

```bash
node --test tests/v4-landing.test.mjs
cd v4 && npm run check && npm run build
cd .. && git diff --check
```

Expected: all tests pass, Astro reports `0 errors`, `0 warnings`, and `0 hints`, both routes build, and `git diff --check` is silent.

Stage only the Task 2 files and any intentional Task 1 follow-up fixes:

```bash
git add tests/v4-landing.test.mjs v4/src/scripts/hero-logo-reveal.ts v4/src/scripts/site.ts v4/src/styles/global.css v4/src/components/Hero.astro v4/src/components/HeroLogoReveal.astro v4/src/pages/preview/hero.astro
git commit -m "feat(v4): add interactive logo reveal controls"
```

Do not stage root `assets/`, v1/v2/v3 files, or unrelated untracked work.

---

## Completion Boundary

Stop after Task 2 is committed and verified. Return the `/preview/hero/` URL, test/build evidence, responsive QA results, the two commit hashes, and the final inspector defaults. Ask the user to approve this hero checkpoint before changing any other landing section.
