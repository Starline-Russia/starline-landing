# Starline Landing v3 contract

## Stack and file boundaries

- Use Astro `7.0.9`, strict TypeScript, and ordinary CSS.
- Do not add React, Tailwind, or a UI library.
- Keep reusable sections in `src/components/`, typed content in `src/data/site.ts`, global design rules in `src/styles/global.css`, and minimal progressive-enhancement behavior in `src/scripts/site.ts`.
- Store public logos in `public/assets/`; store optimizable case art in `src/assets/cases/`.
- Build grid, glow, orbits, and interface icons with CSS or inline SVG when practical.

## Visual system

- Headings: Onest. Body: Inter.
- Core colors: night `#080817`, purple `#3F09B1`, lavender `#C57DFB`, plum `#171027`, off-white `#F7F6F9`, and white.
- Do not introduce lime.
- Prefer strong editorial scale, open spacing, thin dividers, restrained borders, and one clear focal point per section.
- Avoid nested card stacks, generic dashboard decoration, automatic marquees, and decorative motion that competes with the message.

## Page contract

The full page contains these section IDs in this order:

1. `hero`
2. `tasks`
3. `cohorts`
4. `services`
5. `industries`
6. `economics`
7. `process`
8. `palitra`
9. `cases`
10. `lead`

Navigation links: `Задачи`, `Подход`, `Услуги`, `Palitra`, `Кейсы`.

## Approved content constraints

### Hero

- H1: `Starline — оператор роста / для электронной коммерции`.
- Supporting message: Starline manages new-client acquisition, analytics, and sales channels so growth is measured in GMV rather than only CPA reports.
- Use one hero CTA only: `Оставить заявку`.
- Current proof metrics: `10+` years — average employee experience; `50+` acquisition channels; `100+` projects — combined team experience.
- Do not render a logo or decorative star inside the hero copy.

### Tasks

- Heading: `Реклама работает` / `Рост бизнеса буксует` without a period after the first phrase.
- Do not add an eyebrow above this heading.
- Render six task cards: insufficient sales, rising CPA, attribution/GMV gap, opaque channels, retargeting influence, and scaling risk.

### Cohorts

- Use the static v2-style content and matrix.
- Include `Когортный подход`, `Маркетинг должен растить последнюю когорту`, five accumulated cohort rows, and a visually distinct last cohort.
- Explain that business grows when new cohort revenue exceeds attrition from older cohorts.
- Keep the component accessible without scroll-triggered JavaScript.

### Services and industries

- Do not add an eyebrow above the services heading.
- Render six services: performance/new clients; media/CTV/OLV; retail media/marketplaces; mobile/sales channels; SEO/GEO; analytics/consulting.
- Accordion descriptions must remain readable without JavaScript; with JavaScript, expose `aria-expanded` and keep no more than one row open.
- Treat industries as substantial areas of client expertise, not tiny proof-rail text.
- Include seven industries: E-commerce, Fintech, Travel, Real estate, Fashion, Online services, Food delivery. Highlight E-commerce as the primary specialization.
- Do not use an automatic marquee.

### Economics and process

- Explain in words: `CPA вырастет`, `ДРР тоже вырастет`, and `GMV вырастет ещё сильнее`.
- Remove labels equivalent to `Допустимый компромисс` and `Целевой результат`.
- Present the `+20–50% GMV за 6–12 месяцев` range prominently only next to an explicit statement that it depends on starting economics, product, and market and is not a guarantee.
- Process contains audit, pilot, and scaling.

### Palitra

- Give Palitra a separate section covering optimization, content, reporting, forecasting, and senior control.
- Use approved local Palitra and Starline logo assets when available. Do not recreate client-specific marks from memory.

### Cases

- Preserve two asymmetric anonymous cases.
- First case: `5–10× CPA` and `15 тестов за 2 месяца`.
- Second case: `+30% GMV`.
- Keep category and title on the left; large metric, actions, and outcome quote on the right.
- Case images are local editorial illustrations: `4:3`, Russian descriptive alt, intrinsic `width` and `height`, `loading="lazy"`, Astro optimization, `8px` radius, no client logos or text baked into art.
- Case action lists use small Starline marks as bullets and `20px` text at desktop scale.

### Lead form

- Keep required fields `name` and `contact` only.
- Do not call `fetch`; show a local success state and disclose that data was not sent.

## Preview convention

- A preview page imports exactly one shared section component and renders it in `BaseLayout`.
- Route pattern: `/preview/<section>/`.
- Do not include site header, footer, or neighboring sections.
- Preview-specific canvas rules may set minimum height or background, but section markup and section styles remain shared with the full page.
- Existing previews: `hero`, `tasks`, `cohorts`. Add the next preview when beginning work on the next component.

## Accessibility and responsive QA

- All interactive elements must be reachable and visible by keyboard.
- Mobile menu updates `aria-expanded` and closes after an anchor selection.
- Maintain readable content without JavaScript.
- Avoid layout shifts by keeping intrinsic image dimensions.
- Desktop target: `1440×900`; mobile target: `390×844`; also check the tablet breakpoint.
- Verify no horizontal overflow, clipped type, inaccessible focus, console errors, missing assets, or unintended network requests.
- With `prefers-reduced-motion: reduce`, remove motion-dependent transitions and show any state sequence as ordinary content.

## Test contract

- `npm test`: source and structural contract.
- `npm run check`: Astro and TypeScript validation.
- `npm run build`: static production build.
- `npm run test:build`: production HTML contract.
- Update tests when the user approves a content or structure change; do not weaken unrelated assertions to make a change pass.

