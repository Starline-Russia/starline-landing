# Starline Landing v4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan.

**Goal:** Build a separate static Astro v4 landing page for Starline with Steep-inspired motion and structure, a white/black/peach Refero-derived visual system, and an anti-AI-slop editorial character.

**Architecture:** Create an isolated `v4/` Astro project that renders static HTML at build time. Keep page copy and repeated business content in one typed data module, compose the page from section components, and use one small vanilla TypeScript controller for navigation, sticky-stack synchronization, reveal motion, and local form feedback. Every component group gets its own preview route and approval checkpoint before integration continues.

**Tech Stack:** Astro 7.0.9, TypeScript 6.0.3, native CSS with CSS custom properties, vanilla browser APIs, Node test runner, static output.

## Global Constraints

- Treat the approved spec at `docs/superpowers/specs/2026-07-14-starline-v4-landing-design.md` as the source of truth.
- Keep `v1/`, `v2/`, and `v3/` unchanged.
- Do not add Tailwind, React, a component library, a CMS, analytics, or network form submission.
- Use only the named tokens from `v4/src/styles/tokens.css` inside components.
- Use Source Serif 4 only for large editorial display text and Inter for navigation, body text, controls, and data.
- Use the peach field as a structural background, not as a repeated card accent.
- Use warm sienna only for thin chart lines, focus rings, and active micro-states.
- Do not use italics, faux-browser chrome, floating rounded pills, invented testimonials, fabricated metrics, or generic AI-gradient decoration.
- Keep exactly three recurring motion primitives: hero assembly, feature-stack synchronization, and the floating navigation morph.
- Disable sticky and scroll-linked behavior below the specified breakpoints and respect `prefers-reduced-motion`.
- Stop after every checkpoint for browser review and explicit approval.

## File Structure

```text
v4/
├── DESIGN.md
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
└── src/
    ├── components/
    │   ├── SiteHeader.astro
    │   ├── Hero.astro
    │   ├── ProblemScene.astro
    │   ├── GrowthStack.astro
    │   ├── CohortPanel.astro
    │   ├── EconomicsStrip.astro
    │   ├── Services.astro
    │   ├── ProcessRail.astro
    │   ├── Cases.astro
    │   ├── LeadForm.astro
    │   └── SiteFooter.astro
    ├── data/
    │   └── site.ts
    ├── layouts/
    │   └── BaseLayout.astro
    ├── pages/
    │   ├── index.astro
    │   └── preview/
    │       ├── hero.astro
    │       ├── problem.astro
    │       ├── growth-stack.astro
    │       ├── cohort-economics.astro
    │       ├── services-process.astro
    │       └── close.astro
    ├── scripts/
    │   └── site.ts
    └── styles/
        ├── tokens.css
        └── global.css
tests/
└── v4-landing.test.mjs
```

### Task 1: Create the isolated Astro foundation

**Files:**
- Create: `v4/package.json`
- Create: `v4/astro.config.mjs`
- Create: `v4/tsconfig.json`
- Create: `v4/DESIGN.md`
- Create: `v4/src/styles/tokens.css`
- Create: `v4/src/styles/global.css`
- Create: `v4/src/layouts/BaseLayout.astro`
- Create: `v4/src/pages/index.astro`
- Create: `tests/v4-landing.test.mjs`

**Step 1: Write the failing foundation test**

Create `tests/v4-landing.test.mjs` with this initial contract:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const v4 = path.join(root, "v4");

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("v4 is an isolated static Astro project", async () => {
  const packageJson = JSON.parse(await source("v4/package.json"));
  const config = await source("v4/astro.config.mjs");

  assert.equal(packageJson.dependencies.astro, "7.0.9");
  assert.equal(packageJson.devDependencies.typescript, "6.0.3");
  assert.match(config, /output:\s*["']static["']/);
  assert.match(config, /format:\s*["']directory["']/);
});

test("v4 locks the visual reference and named design tokens", async () => {
  const design = await source("v4/DESIGN.md");
  const tokens = await source("v4/src/styles/tokens.css");

  assert.match(design, /75fdb89f-ca64-41b3-af36-7a78bd09448e/);
  assert.match(design, /Steep/);
  assert.match(tokens, /--color-paper:/);
  assert.match(tokens, /--color-ink:/);
  assert.match(tokens, /--color-peach:/);
  assert.match(tokens, /--font-display:/);
  assert.match(tokens, /--font-sans:/);
});
```

**Step 2: Run the test to verify it fails**

Run: `node --test tests/v4-landing.test.mjs`

Expected: FAIL with `ENOENT` for `v4/package.json`.

**Step 3: Add the project configuration**

Create `v4/package.json`:

```json
{
  "name": "starline-landing-v4",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "check": "astro check",
    "test": "node --test ../tests/v4-landing.test.mjs"
  },
  "dependencies": {
    "astro": "7.0.9"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.9",
    "typescript": "6.0.3"
  }
}
```

Create `v4/astro.config.mjs`:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  build: {
    format: "directory"
  }
});
```

Create `v4/tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
```

**Step 4: Lock the visual source and tokens**

Create `v4/DESIGN.md`:

```md
# Starline v4 design lock

## Sources

- Structural and motion reference: https://steep.app/
- Refero style: https://styles.refero.design/style/75fdb89f-ca64-41b3-af36-7a78bd09448e
- Approved product spec: ../docs/superpowers/specs/2026-07-14-starline-v4-landing-design.md

## Visual roles

- Paper: #ffffff
- Ink: #17191c
- Peach field: #fbe1d1
- Warm line accent: sienna, restricted to charts, focus, and active micro-states
- Display type: Source Serif 4
- Interface type: Inter

## Composition rules

- Editorial feature stack, not a grid of interchangeable cards
- Oversized serif statements paired with restrained sans-serif labels
- Custom analytical diagrams made from semantic HTML, CSS, and small inline SVG
- One continuous narrative from problem to growth system to evidence to audit request
- Three recurring motion primitives only: hero assembly, synchronized sticky stack, floating navigation morph
- No italics, fake browser chrome, generic gradients, excessive pills, or decorative glass effects
```

Create `v4/src/styles/tokens.css`:

```css
:root {
  --color-paper: oklch(1 0 0);
  --color-ink: oklch(0.205 0.006 264);
  --color-peach: oklch(0.93 0.035 55);
  --color-peach-soft: oklch(0.97 0.018 57);
  --color-line: oklch(0.88 0.012 60);
  --color-muted: oklch(0.51 0.015 260);
  --color-sienna: oklch(0.46 0.105 42);
  --font-display: "Source Serif 4", Georgia, serif;
  --font-sans: Inter, Arial, sans-serif;
  --space-1: 0.5rem;
  --space-2: 0.75rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
  --space-6: 3rem;
  --space-7: 4.5rem;
  --space-8: 7rem;
  --radius-small: 0.375rem;
  --radius-medium: 0.75rem;
  --measure-text: 44rem;
  --measure-wide: 78rem;
  --shadow-nav: 0 0.75rem 2.5rem oklch(0.205 0.006 264 / 0.11);
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 180ms;
  --duration-medium: 520ms;
}
```

**Step 5: Add the minimal layout and global shell**

Create `v4/src/styles/global.css` with the Hallmark stamp as its first non-empty line:

```css
/* Feature Stack · genre editorial · N10 · Ft2 */
@import "./tokens.css";

* {
  box-sizing: border-box;
}

html {
  color: var(--color-ink);
  background: var(--color-paper);
  font-family: var(--font-sans);
  scroll-behavior: smooth;
}

body {
  min-width: 20rem;
  margin: 0;
  overflow-x: clip;
}

a {
  color: inherit;
}

button,
input,
select,
textarea {
  font: inherit;
}

.site-shell {
  width: min(calc(100% - 2rem), var(--measure-wide));
  margin-inline: auto;
}

.skip-link {
  position: fixed;
  inset: var(--space-3) auto auto var(--space-3);
  z-index: 100;
  padding: var(--space-2) var(--space-3);
  color: var(--color-paper);
  background: var(--color-ink);
  transform: translateY(-200%);
}

.skip-link:focus {
  transform: translateY(0);
}

:focus-visible {
  outline: 0.125rem solid var(--color-sienna);
  outline-offset: 0.25rem;
}
```

Create `v4/src/layouts/BaseLayout.astro`:

```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap"
    />
    <title>{title}</title>
  </head>
  <body>
    <a class="skip-link" href="#content">К содержанию</a>
    <slot />
  </body>
</html>
```

Create `v4/src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout
  title="Starline — система роста e-commerce"
  description="Стратегия, продукт и performance-маркетинг для роста e-commerce."
>
  <main id="content" class="site-shell">
    <h1>Рост e-commerce — это система, а не набор каналов.</h1>
  </main>
</BaseLayout>
```

**Step 6: Install dependencies and verify the foundation**

Run: `cd v4 && npm install`

Run: `node --test tests/v4-landing.test.mjs`

Expected: 2 tests pass.

Run: `cd v4 && npm run check && npm run build`

Expected: Astro reports zero errors and writes `v4/dist/index.html`.

**Step 7: Commit the foundation**

```bash
git add v4 tests/v4-landing.test.mjs
git commit -m "feat(v4): establish Astro design foundation"
```

**Checkpoint 0:** Open the minimal page at 320px and 1440px. Confirm typography loads, horizontal overflow is absent, and the white/black/peach token system is correct before proceeding.

### Task 2: Add the typed content contract

**Files:**
- Create: `v4/src/data/site.ts`
- Modify: `tests/v4-landing.test.mjs`

**Step 1: Add the failing content-contract test**

Append:

```js
test("v4 keeps repeated business content in one typed module", async () => {
  const data = await source("v4/src/data/site.ts");

  assert.match(data, /export interface GrowthStep/);
  assert.match(data, /export interface CaseStudy/);
  assert.match(data, /export const navigation/);
  assert.match(data, /export const growthSteps/);
  assert.match(data, /export const services/);
  assert.match(data, /export const processSteps/);
  assert.match(data, /export const cases/);
  assert.doesNotMatch(data, /lorem ipsum/i);
});
```

**Step 2: Run the test to verify it fails**

Run: `node --test tests/v4-landing.test.mjs`

Expected: FAIL with `ENOENT` for `v4/src/data/site.ts`.

**Step 3: Create the complete content module**

Create `v4/src/data/site.ts` with these exported types and collections:

```ts
export interface NavigationItem {
  label: string;
  href: string;
}

export interface HeroArtifact {
  value: string;
  label: string;
}

export interface GrowthStep {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  signal: string;
}

export interface Service {
  title: string;
  description: string;
}

export interface ProcessStep {
  index: string;
  title: string;
  description: string;
}

export interface CaseStudy {
  category: string;
  title: string;
  result: string;
  caveat: string;
}

export const navigation: NavigationItem[] = [
  { label: "Система", href: "#system" },
  { label: "Экономика", href: "#economics" },
  { label: "Практика", href: "#cases" }
];

export const heroArtifacts: HeroArtifact[] = [
  { value: "10+", label: "лет в e-commerce" },
  { value: "50+", label: "проектов в портфеле" },
  { value: "19", label: "рынков в географии команды" }
];

export const problemSignals = [
  "Каналы работают отдельно от продуктовой экономики.",
  "Команда оптимизирует метрики, но не общий результат.",
  "Рост держится на ручном управлении и разовых гипотезах."
];

export const growthSteps: GrowthStep[] = [
  {
    id: "economy",
    index: "01",
    eyebrow: "Экономика",
    title: "Сначала собираем модель роста.",
    description: "Связываем маржинальность, повторные покупки, стоимость привлечения и потенциал категорий в одну управляемую картину.",
    signal: "Unit economics → growth model"
  },
  {
    id: "experience",
    index: "02",
    eyebrow: "Продукт",
    title: "Убираем трение в покупательском пути.",
    description: "Проверяем структуру каталога, карточки, поиск, checkout и сервисные сценарии — там, где теряется намерение купить.",
    signal: "Journey → conversion"
  },
  {
    id: "demand",
    index: "03",
    eyebrow: "Спрос",
    title: "Синхронизируем медиа с продуктом.",
    description: "Строим performance-контур вокруг реальной доступности, маржи и LTV, а не вокруг отчётности отдельных кабинетов.",
    signal: "Demand → profitable scale"
  },
  {
    id: "rhythm",
    index: "04",
    eyebrow: "Управление",
    title: "Создаём ритм решений.",
    description: "Вводим единый набор сигналов, очередь экспериментов и регулярные решения, чтобы рост не зависел от героизма команды.",
    signal: "Signals → operating rhythm"
  }
];

export const cohortRows = [
  { cohort: "Янв", m0: 100, m1: 38, m2: 27, m3: 22 },
  { cohort: "Фев", m0: 100, m1: 41, m2: 31, m3: 25 },
  { cohort: "Мар", m0: 100, m1: 46, m2: 35, m3: 29 },
  { cohort: "Апр", m0: 100, m1: 49, m2: 39, m3: 33 }
];

export const economics = [
  { label: "LTV", value: "ценность клиента" },
  { label: "CAC", value: "стоимость роста" },
  { label: "Margin", value: "пространство для масштаба" },
  { label: "Repeat", value: "качество удержания" }
];

export const services: Service[] = [
  { title: "Growth-стратегия", description: "Модель роста, приоритеты и карта решений." },
  { title: "E-commerce продукт", description: "Покупательский путь, интерфейсы и конверсия." },
  { title: "Performance", description: "Спрос, медиамикс и управляемое масштабирование." },
  { title: "Аналитика", description: "Сигналы, когорты и единая логика измерения." }
];

export const processSteps: ProcessStep[] = [
  { index: "01", title: "Диагностика", description: "Собираем факты и ограничения бизнеса." },
  { index: "02", title: "Фокус", description: "Выбираем точки с наибольшим потенциалом." },
  { index: "03", title: "Спринты", description: "Запускаем решения короткими циклами." },
  { index: "04", title: "Система", description: "Передаём команде рабочий ритм роста." }
];

export const cases: CaseStudy[] = [
  {
    category: "Marketplace",
    title: "Пересобрали экономику продвижения и ассортиментный фокус.",
    result: "Рост выручки в 5–10 раз по отдельным направлениям.",
    caveat: "Диапазон из материалов Starline; результат зависит от категории и периода."
  },
  {
    category: "Fashion e-commerce",
    title: "Связали продуктовые изменения и performance-контур.",
    result: "+30% к ключевому бизнес-показателю.",
    caveat: "Показатель из материалов Starline; детали проекта обезличены."
  }
];
```

**Step 4: Run the test and typecheck**

Run: `node --test tests/v4-landing.test.mjs && cd v4 && npm run check`

Expected: all tests pass and Astro reports zero errors.

**Step 5: Commit the content contract**

```bash
git add v4/src/data/site.ts tests/v4-landing.test.mjs
git commit -m "feat(v4): add typed landing content"
```

### Task 3: Build the navigation and hero checkpoint

**Files:**
- Create: `v4/src/components/SiteHeader.astro`
- Create: `v4/src/components/Hero.astro`
- Create: `v4/src/scripts/site.ts`
- Create: `v4/src/pages/preview/hero.astro`
- Modify: `v4/src/pages/index.astro`
- Modify: `v4/src/styles/global.css`
- Modify: `tests/v4-landing.test.mjs`

**Step 1: Add the failing navigation and hero tests**

Append:

```js
test("v4 hero is componentized and has a dedicated preview", async () => {
  const page = await source("v4/src/pages/index.astro");
  const header = await source("v4/src/components/SiteHeader.astro");
  const hero = await source("v4/src/components/Hero.astro");
  const preview = await source("v4/src/pages/preview/hero.astro");

  assert.match(page, /<SiteHeader\s*\/>/);
  assert.match(page, /<Hero\s*\/>/);
  assert.match(header, /aria-expanded="false"/);
  assert.match(header, /data-site-nav/);
  assert.match(hero, /data-hero-visual/);
  assert.match(hero, /Запросить аудит роста/);
  assert.match(preview, /<Hero\s*\/>/);
});
```

**Step 2: Run the test to verify it fails**

Run: `node --test tests/v4-landing.test.mjs`

Expected: FAIL with `ENOENT` for `SiteHeader.astro`.

**Step 3: Implement the header**

Create `SiteHeader.astro` with one semantic header, one navigation list generated from `navigation`, one audit link, and one mobile menu button. Add `data-site-header`, `data-nav-toggle`, and `data-site-nav` hooks. Keep the same DOM for desktop and mobile; CSS changes only the layout and visibility.

Required rendered structure:

```astro
---
import { navigation } from "../data/site";
---

<header class="site-header" data-site-header>
  <a class="brand" href="/" aria-label="Starline, на главную">STARLINE</a>
  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
    <span>Меню</span>
  </button>
  <nav id="site-nav" class="site-nav" aria-label="Основная навигация" data-site-nav>
    {navigation.map((item) => <a href={item.href}>{item.label}</a>)}
    <a class="nav-action" href="#lead">Аудит роста</a>
  </nav>
</header>
```

**Step 4: Implement the hero**

Create `Hero.astro` with:

- one editorial `h1`;
- one primary text link to `#lead` and one secondary link to `#system`;
- a bespoke analytical visual made from three labeled axes, one SVG curve, and the `heroArtifacts` data;
- no browser frame, dashboard shell, or floating pill cards;
- initial `data-reveal` attributes for the assembly motion.

Use this semantic core:

```astro
---
import { heroArtifacts } from "../data/site";
---

<section class="hero site-shell" aria-labelledby="hero-title">
  <div class="hero-copy" data-reveal>
    <p class="eyebrow">Starline / e-commerce growth</p>
    <h1 id="hero-title">Рост e-commerce — это система, а не набор каналов.</h1>
    <p class="hero-intro">Соединяем стратегию, продукт, performance и аналитику, чтобы рост стал управляемым.</p>
    <div class="hero-actions">
      <a class="text-action text-action--primary" href="#lead">Запросить аудит роста</a>
      <a class="text-action" href="#system">Посмотреть систему</a>
    </div>
  </div>
  <div class="hero-visual" data-hero-visual data-reveal aria-label="Система роста связывает экономику, продукт и спрос">
    <svg class="hero-curve" viewBox="0 0 640 360" role="img" aria-labelledby="hero-curve-title">
      <title id="hero-curve-title">Кривая управляемого роста</title>
      <path d="M24 310 C145 302 180 248 272 238 C378 226 420 150 616 52" />
    </svg>
    <span class="hero-axis hero-axis--economy">Экономика</span>
    <span class="hero-axis hero-axis--product">Продукт</span>
    <span class="hero-axis hero-axis--demand">Спрос</span>
  </div>
  <dl class="hero-facts" data-reveal>
    {heroArtifacts.map((item) => <div><dt>{item.value}</dt><dd>{item.label}</dd></div>)}
  </dl>
</section>
```

**Step 5: Add the first interaction controller**

Create `v4/src/scripts/site.ts`:

```ts
const header = document.querySelector<HTMLElement>("[data-site-header]");
const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
const nav = document.querySelector<HTMLElement>("[data-site-nav]");

toggle?.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  nav?.toggleAttribute("data-open", !open);
});

nav?.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLAnchorElement)) return;
  toggle?.setAttribute("aria-expanded", "false");
  nav.removeAttribute("data-open");
});

const updateHeader = () => header?.toggleAttribute("data-floating", window.scrollY > 48);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

document.documentElement.dataset.enhanced = "true";
```

**Step 6: Integrate the checkpoint and style it**

Update `index.astro` to render `SiteHeader` and `Hero`, and load the controller once:

```astro
---
import Hero from "../components/Hero.astro";
import SiteHeader from "../components/SiteHeader.astro";
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="Starline — система роста e-commerce" description="Стратегия, продукт и performance-маркетинг для роста e-commerce.">
  <SiteHeader />
  <main id="content">
    <Hero />
  </main>
  <script>
    import "../scripts/site";
  </script>
</BaseLayout>
```

Create `preview/hero.astro` with the same layout, `SiteHeader`, and `Hero`. Add exact responsive CSS for `.site-header`, `.site-nav`, `.hero`, `.hero-copy`, `.hero-visual`, `.hero-curve`, `.hero-axis`, `.hero-facts`, and `.text-action`. Use a two-column hero only at `min-width: 60rem`; below it, stack copy, visual, and facts in document order. Animate only opacity and transform for the initial assembly.

**Step 7: Verify and commit**

Run: `node --test tests/v4-landing.test.mjs && cd v4 && npm run check && npm run build`

Expected: all tests pass and both `/` and `/preview/hero/` build.

```bash
git add v4/src tests/v4-landing.test.mjs
git commit -m "feat(v4): build floating nav and editorial hero"
```

**Checkpoint 1:** Review only `/preview/hero/` at 320px, 768px, and 1440px. Approve the hero composition, type scale, custom analytical visual, and navigation morph before proceeding.

### Task 4: Build the problem scene

**Files:**
- Create: `v4/src/components/ProblemScene.astro`
- Create: `v4/src/pages/preview/problem.astro`
- Modify: `v4/src/pages/index.astro`
- Modify: `v4/src/styles/global.css`
- Modify: `tests/v4-landing.test.mjs`

**Step 1: Add a failing component test**

Append a test that requires `ProblemScene.astro`, checks that it imports `problemSignals`, exposes `id="problem"`, renders a single `h2`, and exists in `preview/problem.astro`.

**Step 2: Run the test to verify it fails**

Run: `node --test tests/v4-landing.test.mjs`

Expected: FAIL because `ProblemScene.astro` does not exist.

**Step 3: Implement the component**

Create a full-width peach scene with one oversized display statement and a single diagram line connecting the three `problemSignals`. Render the signals as an ordered list, not cards. Use this copy:

```astro
<section id="problem" class="problem-scene" aria-labelledby="problem-title">
  <div class="site-shell problem-layout">
    <p class="eyebrow">Почему рост останавливается</p>
    <h2 id="problem-title">Бизнес видит десятки метрик. Системы решений между ними нет.</h2>
    <ol class="problem-signals">
      {problemSignals.map((signal, index) => (
        <li><span>{String(index + 1).padStart(2, "0")}</span><p>{signal}</p></li>
      ))}
    </ol>
  </div>
</section>
```

Style it as one continuous peach field with thin horizontal rules. Do not wrap list items in rounded containers.

**Step 4: Integrate and preview**

Render `<ProblemScene />` immediately after `<Hero />`. Create `preview/problem.astro` that renders the hero tail and the entire problem scene so the transition can be judged.

**Step 5: Verify and commit**

Run: `node --test tests/v4-landing.test.mjs && cd v4 && npm run check && npm run build`

```bash
git add v4/src tests/v4-landing.test.mjs
git commit -m "feat(v4): add peach problem scene"
```

**Checkpoint 2:** Approve the transition from white hero to peach problem field, the copy density, and the absence of card-grid styling.

### Task 5: Build the synchronized growth feature stack

**Files:**
- Create: `v4/src/components/GrowthStack.astro`
- Create: `v4/src/pages/preview/growth-stack.astro`
- Modify: `v4/src/pages/index.astro`
- Modify: `v4/src/scripts/site.ts`
- Modify: `v4/src/styles/global.css`
- Modify: `tests/v4-landing.test.mjs`

**Step 1: Add failing stack tests**

Append a test that checks:

```js
test("growth stack is data-driven and progressively enhanced", async () => {
  const component = await source("v4/src/components/GrowthStack.astro");
  const script = await source("v4/src/scripts/site.ts");

  assert.match(component, /growthSteps\.map/);
  assert.match(component, /data-growth-step/);
  assert.match(component, /data-growth-visual/);
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /data-active/);
});
```

**Step 2: Run the test to verify it fails**

Run: `node --test tests/v4-landing.test.mjs`

Expected: FAIL because `GrowthStack.astro` does not exist.

**Step 3: Implement the semantic stack**

Create a section with `id="system"`. On desktop, place a sticky visualization on the left and four long-form steps on the right. The visualization must contain four SVG/HTML layers keyed by the exact step ids `economy`, `experience`, `demand`, and `rhythm`. Each text step gets `data-growth-step={step.id}`; each visual layer gets `data-growth-visual={step.id}`. The full content remains visible in source order without JavaScript.

**Step 4: Add synchronization without scroll hijacking**

Extend `site.ts` with one `IntersectionObserver` using `rootMargin: "-35% 0px -45% 0px"` and threshold `0.05`. When a step intersects, set `data-active` on the matching step and visual layer and remove it from the others. Do not call `preventDefault`, change scroll position, or use animation libraries.

**Step 5: Add responsive and reduced-motion behavior**

- Apply `position: sticky` only above `60rem`.
- Below `60rem`, place each relevant visual directly below its text step and show all visual layers.
- Below `40rem`, remove decorative motion and shorten vertical gaps.
- Under `prefers-reduced-motion: reduce`, remove transitions and reveal transforms.

**Step 6: Integrate, preview, verify, and commit**

Render the stack after the problem scene. Create `/preview/growth-stack/` with enough leading and trailing space to test entering and leaving sticky mode.

Run: `node --test tests/v4-landing.test.mjs && cd v4 && npm run check && npm run build`

```bash
git add v4/src tests/v4-landing.test.mjs
git commit -m "feat(v4): add synchronized growth feature stack"
```

**Checkpoint 3:** Approve the story rhythm and synchronization at 1024px and 1440px, then confirm the same content is clear and static at 375px.

### Task 6: Build cohort evidence and economics strip

**Files:**
- Create: `v4/src/components/CohortPanel.astro`
- Create: `v4/src/components/EconomicsStrip.astro`
- Create: `v4/src/pages/preview/cohort-economics.astro`
- Modify: `v4/src/pages/index.astro`
- Modify: `v4/src/styles/global.css`
- Modify: `tests/v4-landing.test.mjs`

**Step 1: Add failing evidence tests**

Append tests that require both components, verify that `CohortPanel` maps `cohortRows`, that a real `<table>` is present, that `EconomicsStrip` maps `economics`, and that neither component contains a hardcoded hex color.

**Step 2: Run the test to verify it fails**

Run: `node --test tests/v4-landing.test.mjs`

Expected: FAIL because the evidence components do not exist.

**Step 3: Implement the cohort panel**

Render an accessible table with columns `Когорта`, `M0`, `M1`, `M2`, `M3`. Use each numeric value both as visible text and as a CSS custom property `--retention` that controls a warm sienna cell line. Add a caption explaining that the values are an illustrative model of how the team reads retention, not a client result.

**Step 4: Implement the economics strip**

Render `economics` as a definition list in one horizontal ruled strip. Keep every item rectangular and text-led; do not use badges or individual cards.

**Step 5: Integrate and preview**

Wrap both components in one `section id="economics"` directly after the feature stack. Create `/preview/cohort-economics/` to show them together on paper white.

**Step 6: Verify and commit**

Run: `node --test tests/v4-landing.test.mjs && cd v4 && npm run check && npm run build`

```bash
git add v4/src tests/v4-landing.test.mjs
git commit -m "feat(v4): add cohort and economics evidence"
```

**Checkpoint 4:** Confirm the panel feels like an editorial analytical artifact, not a dashboard screenshot, and that the caveat is visible.

### Task 7: Build services and process rail

**Files:**
- Create: `v4/src/components/Services.astro`
- Create: `v4/src/components/ProcessRail.astro`
- Create: `v4/src/pages/preview/services-process.astro`
- Modify: `v4/src/pages/index.astro`
- Modify: `v4/src/styles/global.css`
- Modify: `tests/v4-landing.test.mjs`

**Step 1: Add failing services tests**

Append a test that checks both components map their typed collections, use ordered heading levels, and expose no more than one rounded action element.

**Step 2: Run the test to verify it fails**

Run: `node --test tests/v4-landing.test.mjs`

Expected: FAIL because `Services.astro` does not exist.

**Step 3: Implement services as an editorial index**

Render the four services as full-width ruled rows with an index, heading, and description. On desktop, use a three-column row; on mobile, use natural document flow. Avoid icons and card backgrounds.

**Step 4: Implement the process rail**

Render the four process steps as an ordered horizontal rail above `60rem` and a vertical ruled list below it. Use one continuous line with step markers rather than four individual cards.

**Step 5: Integrate and preview**

Place services before the process rail and create `/preview/services-process/` showing the combined block.

**Step 6: Verify and commit**

Run: `node --test tests/v4-landing.test.mjs && cd v4 && npm run check && npm run build`

```bash
git add v4/src tests/v4-landing.test.mjs
git commit -m "feat(v4): add services index and process rail"
```

**Checkpoint 5:** Approve scanning speed, information density, and mobile reading order.

### Task 8: Build cases, lead form, and inline footer

**Files:**
- Create: `v4/src/components/Cases.astro`
- Create: `v4/src/components/LeadForm.astro`
- Create: `v4/src/components/SiteFooter.astro`
- Create: `v4/src/pages/preview/close.astro`
- Modify: `v4/src/pages/index.astro`
- Modify: `v4/src/scripts/site.ts`
- Modify: `v4/src/styles/global.css`
- Modify: `tests/v4-landing.test.mjs`

**Step 1: Add failing close-section tests**

Append:

```js
test("cases are caveated and the audit form works locally", async () => {
  const cases = await source("v4/src/components/Cases.astro");
  const form = await source("v4/src/components/LeadForm.astro");
  const script = await source("v4/src/scripts/site.ts");

  assert.match(cases, /caseItem\.caveat/);
  assert.match(form, /name="name"/);
  assert.match(form, /name="company"/);
  assert.match(form, /name="contact"/);
  assert.match(form, /data-lead-form/);
  assert.doesNotMatch(script, /fetch\s*\(/);
});
```

**Step 2: Run the test to verify it fails**

Run: `node --test tests/v4-landing.test.mjs`

Expected: FAIL because `Cases.astro` does not exist.

**Step 3: Implement cases without invented social proof**

Render two large case bands from `cases`. Each band contains category, title, result, and visible caveat. Use a restrained line diagram as the visual marker; do not use logos, portraits, testimonials, or client names not present in source material.

**Step 4: Implement the audit form**

Create `section id="lead"` with a concise promise, privacy note, status region, and fields for `name`, `company`, and `contact`. Use native labels, `required`, suitable `autocomplete` values, and a submit button with at least a 44px touch target.

Extend `site.ts` with a local submit handler:

```ts
const leadForm = document.querySelector<HTMLFormElement>("[data-lead-form]");
const leadStatus = document.querySelector<HTMLElement>("[data-lead-status]");

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!leadForm.checkValidity()) {
    leadForm.reportValidity();
    return;
  }
  leadForm.reset();
  if (leadStatus) leadStatus.textContent = "Спасибо. Заявка сохранена в локальном прототипе.";
});
```

**Step 5: Implement the Ft2 footer**

Render one inline footer row with the Starline wordmark, current year, email link, and a short legal note. Stack the same items on narrow screens without introducing footer columns.

**Step 6: Integrate and preview**

Place cases after the process rail, then the lead form, then the footer outside `main`. Create `/preview/close/` with those three pieces.

**Step 7: Verify and commit**

Run: `node --test tests/v4-landing.test.mjs && cd v4 && npm run check && npm run build`

```bash
git add v4/src tests/v4-landing.test.mjs
git commit -m "feat(v4): complete cases audit form and footer"
```

**Checkpoint 6:** Submit the form with empty and valid values, check keyboard focus order, and approve the page closing sequence.

### Task 9: Integrate motion, responsive rules, and anti-slop QA

**Files:**
- Modify: `v4/src/scripts/site.ts`
- Modify: `v4/src/styles/global.css`
- Modify: `tests/v4-landing.test.mjs`
- Create: `.hallmark/log.json`

**Step 1: Add failing integration tests**

Append:

```js
test("v4 preserves section order and motion constraints", async () => {
  const page = await source("v4/src/pages/index.astro");
  const script = await source("v4/src/scripts/site.ts");
  const css = await source("v4/src/styles/global.css");

  const order = ["<Hero", "<ProblemScene", "<GrowthStack", "<CohortPanel", "<EconomicsStrip", "<Services", "<ProcessRail", "<Cases", "<LeadForm"];
  let cursor = -1;
  for (const marker of order) {
    const next = page.indexOf(marker);
    assert.ok(next > cursor, `${marker} is out of order`);
    cursor = next;
  }

  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media\s*\(max-width:\s*39\.99rem\)/);
  assert.match(css, /@media\s*\(min-width:\s*60rem\)/);
  assert.doesNotMatch(css, /font-style:\s*italic/);
  assert.doesNotMatch(script, /gsap|locomotive|lenis/i);
});

test("v4 component styles use named color tokens", async () => {
  const css = await source("v4/src/styles/global.css");
  const withoutStamp = css.replace(/Feature Stack[^\n]*/, "");
  assert.doesNotMatch(withoutStamp, /#[0-9a-f]{3,8}\b/i);
});
```

**Step 2: Run the test to verify any missing constraints fail**

Run: `node --test tests/v4-landing.test.mjs`

Expected: FAIL until the complete page order, reduced-motion block, and breakpoints are present.

**Step 3: Finish the three motion primitives**

- Hero assembly: reveal copy, analytical curve, and facts once on load with staggered opacity and translate only.
- Feature stack: keep the existing observer synchronization; use opacity and transform only on visual layers.
- Navigation morph: transition the same header from full-width top state to a compact floating state after 48px of scroll.
- Add no fourth recurring animation pattern.

**Step 4: Complete responsive and accessibility rules**

Add exact coverage for 320, 375, 414, 768, 1024, and 1440 widths. Ensure:

- no horizontal overflow;
- minimum 44px touch targets on menu, navigation action, and form submit;
- sticky layout only at `min-width: 60rem`;
- scroll-linked visual changes disabled below `40rem`;
- all transitions and smooth scrolling disabled inside `prefers-reduced-motion: reduce`;
- all text meets WCAG AA contrast against paper and peach;
- heading hierarchy remains `h1` followed by section `h2`s and item `h3`s.

**Step 5: Record Hallmark decisions**

Create `.hallmark/log.json`:

```json
{
  "project": "Starline landing v4",
  "timestamp": "2026-07-14T00:00:00+03:00",
  "stamp": "Feature Stack · genre editorial · N10 · Ft2",
  "design_critique": {
    "composition": "The page uses an asymmetric editorial hero, one peach narrative interruption, and a sticky feature stack instead of a repeated card grid.",
    "hierarchy": "Large Source Serif statements establish the argument while Inter labels, rules, and data provide a restrained operating layer.",
    "template_avoidance": "Custom analytical diagrams, ruled indexes, and one continuous process rail replace faux dashboards, pill clouds, and generic SaaS cards.",
    "theme": "White, ink, and peach are assigned structural roles; sienna is restricted to data lines, focus, and active micro-states.",
    "typography": "Source Serif 4 is limited to editorial display text and Inter handles all interface and data content without italics.",
    "mobile": "Sticky behavior is removed below 960px, content returns to document order, motion is reduced below 640px, and touch targets remain at least 44px."
  }
}
```

**Step 6: Run automated verification**

Run: `node --test tests/v4-landing.test.mjs`

Expected: all tests pass.

Run: `cd v4 && npm run check && npm run build`

Expected: zero Astro or TypeScript errors and a complete static build.

**Step 7: Run browser QA**

Run: `cd v4 && npm run dev -- --host 127.0.0.1`

Inspect `/`, every `/preview/*/` route, and the following widths: 320, 375, 414, 768, 1024, 1440. Verify menu open/close, anchor links, nav morph, feature synchronization, reduced motion, keyboard navigation, visible focus, form validation, local success message, and absence of console errors.

**Step 8: Run the final Hallmark slop test**

Load the Hallmark `slop-test.md` reference only now. Audit the rendered page against its checklist and fix every flagged issue without adding new visual motifs.

**Step 9: Commit the integrated result**

```bash
git add v4 tests/v4-landing.test.mjs .hallmark/log.json
git commit -m "feat(v4): finalize motion responsive and accessibility QA"
```

**Checkpoint 7:** Present the complete page and verification evidence. Do not deploy or replace another version without a separate user instruction.
