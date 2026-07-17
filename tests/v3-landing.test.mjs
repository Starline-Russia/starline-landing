import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";

const root =
  path.basename(process.cwd()) === "v3"
    ? path.dirname(process.cwd())
    : process.cwd();
const v3Root = path.join(root, "v3");

async function collectFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(fullPath, extension);
      return entry.name.endsWith(extension) ? [fullPath] : [];
    }),
  );
  return files.flat();
}

async function sourceBundle(extension) {
  const files = await collectFiles(path.join(v3Root, "src"), extension);
  const contents = await Promise.all(files.map((file) => readFile(file, "utf8")));
  return contents.join("\n");
}

test("v3 is an isolated Astro 7 project", async () => {
  const packageJson = JSON.parse(
    await readFile(path.join(v3Root, "package.json"), "utf8"),
  );
  const astroConfig = await readFile(
    path.join(v3Root, "astro.config.mjs"),
    "utf8",
  );

  assert.equal(packageJson.dependencies.astro, "7.0.9");
  assert.match(packageJson.scripts.check, /astro check/);
  assert.match(packageJson.scripts.build, /astro build/);
  assert.match(packageJson.scripts.test, /node --test/);
  assert.equal(packageJson.scripts["test:build"], "node --test ../tests/v3-build.test.mjs");
  assert.match(astroConfig, /output:\s*["']static["']/);
});

test("v3 contains the approved section order and hero contract", async () => {
  const markup = await sourceBundle(".astro");
  const indexPage = await readFile(
    path.join(v3Root, "src", "pages", "index.astro"),
    "utf8",
  );
  const sectionIds = [
    "hero",
    "tasks",
    "services",
    "industries",
    "market-problem",
    "cohorts",
    "economics",
    "palitra",
    "palitra-chat",
    "cases",
    "lead",
  ];

  let previousIndex = -1;
  for (const sectionId of sectionIds) {
    const sectionIndex = markup.indexOf(`id=\"${sectionId}\"`);
    assert.ok(sectionIndex > previousIndex, `${sectionId} should be in order`);
    previousIndex = sectionIndex;
  }

  assert.match(markup, /Starline — оператор роста/);
  assert.match(markup, /для электронной коммерции/);
  assert.match(markup, /10\+/);
  assert.match(markup, /50\+/);
  assert.match(markup, />100\+</);
  assert.match(markup, /лет - средний опыт сотрудников/);
  assert.match(markup, /проектов - совокупный опыт команды/);
  assert.equal((markup.match(/class=\"hero-cta[^\"]*\"/g) ?? []).length, 1);
  assert.doesNotMatch(markup, /Как растёт GMV/);
  assert.doesNotMatch(markup, /star-large/);
  assert.doesNotMatch(indexPage, /import Process from/);
  assert.doesNotMatch(indexPage, /id="process"|<Process\s*\/>/);
});

test("hero has isolated responsive styling and a standalone preview", async () => {
  const hero = await readFile(
    path.join(v3Root, "src", "components", "Hero.astro"),
    "utf8",
  );
  const css = await readFile(
    path.join(v3Root, "src", "styles", "global.css"),
    "utf8",
  );
  const previewPath = path.join(v3Root, "src", "pages", "preview", "hero.astro");
  const pageFiles = await collectFiles(path.join(v3Root, "src", "pages"), ".astro");

  assert.doesNotMatch(hero, /star-small|class=\"star/);
  assert.match(css, /\.hero-metrics dd\s*\{[^}]*font-size:\s*18px/s);
  assert.match(css, /\.hero h1\s*\{[^}]*margin-bottom:\s*36px/s);
  assert.match(css, /\.hero \.button-primary\s*\{[^}]*margin-top:\s*46px/s);
  assert.ok(pageFiles.includes(previewPath), "standalone Hero preview should exist");

  const preview = await readFile(previewPath, "utf8");
  assert.match(preview, /import Hero from \"\.\.\/\.\.\/components\/Hero\.astro\"/);
  assert.match(preview, /<Hero\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Tasks|SiteFooter/);
});

test("v3 renders six tasks, six services, and eight industries", async () => {
  const markup = await sourceBundle(".astro");
  const tasksMarkup = await readFile(
    path.join(v3Root, "src", "components", "Tasks.astro"),
    "utf8",
  );
  const data = await readFile(path.join(v3Root, "src", "data", "site.ts"), "utf8");
  const taskData = data.split("export const tasks")[1].split("export const services")[0];
  const serviceData = data.split("export const services")[1].split("export const industries")[0];
  const industryData = data.split("export const industries")[1].split("export const processSteps")[0];

  assert.match(markup, /tasks\.map/);
  assert.match(markup, /services\.map/);
  assert.match(markup, /industries\.map/);
  assert.equal((taskData.match(/icon:\s*\"(?:cart|cost|gmv|channels|retargeting|scale)\"/g) ?? []).length, 6);
  assert.equal((serviceData.match(/tools:\s*\[/g) ?? []).length, 6);
  assert.equal((industryData.match(/^  \"(?:Банки и финтех|Travel|Недвижимость|Fashion|Онлайн-сервисы|Food delivery|E-commerce|Beauty)\",$/gm) ?? []).length, 8);
  assert.match(tasksMarkup, /Реклама работает<br \/><span>Рост бизнеса буксует/);
  assert.doesNotMatch(tasksMarkup, /Задачи e-commerce|class=\"eyebrow/);
  assert.match(markup, /Все инструменты роста —[\s\S]*в одной системе/);
});

test("tasks has a standalone component preview", async () => {
  const previewPath = path.join(v3Root, "src", "pages", "preview", "tasks.astro");
  const pageFiles = await collectFiles(path.join(v3Root, "src", "pages"), ".astro");

  assert.ok(pageFiles.includes(previewPath), "standalone Tasks preview should exist");

  const preview = await readFile(previewPath, "utf8");
  assert.match(preview, /import Tasks from \"\.\.\/\.\.\/components\/Tasks\.astro\"/);
  assert.match(preview, /<Tasks\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Hero|Services|SiteFooter/);
});

test("services has no eyebrow and a standalone component preview", async () => {
  const services = await readFile(
    path.join(v3Root, "src", "components", "Services.astro"),
    "utf8",
  );
  const previewPath = path.join(v3Root, "src", "pages", "preview", "services.astro");
  const pageFiles = await collectFiles(path.join(v3Root, "src", "pages"), ".astro");

  assert.doesNotMatch(services, /class="eyebrow"/);
  assert.ok(pageFiles.includes(previewPath), "standalone Services preview should exist");

  const preview = await readFile(previewPath, "utf8");
  assert.match(preview, /import Services from "\.\.\/\.\.\/components\/Services\.astro"/);
  assert.match(preview, /<Services\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Hero|Tasks|Cohorts|Industries|SiteFooter/);
});

test("industries has an editorial grid and a standalone component preview", async () => {
  const industries = await readFile(
    path.join(v3Root, "src", "components", "Industries.astro"),
    "utf8",
  );
  const data = await readFile(path.join(v3Root, "src", "data", "site.ts"), "utf8");
  const css = await readFile(path.join(v3Root, "src", "styles", "global.css"), "utf8");
  const script = await readFile(path.join(v3Root, "src", "scripts", "site.ts"), "utf8");
  const previewPath = path.join(v3Root, "src", "pages", "preview", "industries.astro");
  const pageFiles = await collectFiles(path.join(v3Root, "src", "pages"), ".astro");
  const industryData = data.split("export const industries")[1].split("export const processSteps")[0];
  const industryNames = [...industryData.matchAll(/^  "([^"]+)",$/gm)].map((match) => match[1]);

  assert.deepEqual(industryNames, [
    "Банки и финтех",
    "Travel",
    "Недвижимость",
    "Fashion",
    "Онлайн-сервисы",
    "Food delivery",
    "E-commerce",
    "Beauty",
  ]);
  assert.ok(industries.includes('<p class="eyebrow">Digital-рынок</p>'));
  assert.match(industries, /Индустрии, в которых/);
  assert.match(industries, /имеем наибольшую экспертизу/);
  assert.match(industries, /Опыт команды позволяет максимально эффективно управлять привлечением клиентов на всех этапах воронки и непосредственно влиять на GMV/);
  assert.match(industries, /class="industry-grid"/);
  assert.doesNotMatch(industries, /data-industry-grid/);
  assert.match(industries, /class="industry-card"/);
  assert.doesNotMatch(industries, /data-primary/);
  assert.doesNotMatch(industries, /marquee|animation|scroll/i);
  assert.match(css, /\.industries-heading > p\s*\{[^}]*font-size:\s*22px/s);
  assert.match(css, /\.industry-grid\s*\{[^}]*border-top:/s);
  assert.match(css, /\.industry-card:hover h3\s*\{[^}]*color:\s*var\(--violet\)[^}]*transform:\s*scale\(1\.035\)/s);
  assert.doesNotMatch(css, /\.industry-grid::after|radial-gradient\(circle 20px at var\(--pointer-x\)/);
  assert.doesNotMatch(css, /\.industry-card\s*\{[^}]*border-radius/s);
  assert.doesNotMatch(script, /\[data-industry-grid\]|pointermove|--pointer-x/);
  assert.ok(pageFiles.includes(previewPath), "standalone Industries preview should exist");

  const preview = await readFile(previewPath, "utf8");
  assert.match(preview, /import Industries from "\.\.\/\.\.\/components\/Industries\.astro"/);
  assert.match(preview, /<Industries\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Hero|Tasks|Services|Economics|SiteFooter/);
});

test("market problem is a standalone light editorial section", async () => {
  const component = await readFile(
    path.join(v3Root, "src", "components", "MarketProblem.astro"),
    "utf8",
  );
  const previewPath = path.join(v3Root, "src", "pages", "preview", "market-problem.astro");
  const preview = await readFile(previewPath, "utf8");
  const css = await readFile(path.join(v3Root, "src", "styles", "global.css"), "utf8");

  assert.match(component, /Проблема рынка/);
  assert.match(component, /Реклама может выглядеть эффективной, пока бизнес почти не растёт/);
  assert.doesNotMatch(component, /market-index|aria-hidden/);
  assert.match(component, /class="market-signal"/);
  assert.match(component, /<h3>CPA оптимизирован<\/h3>/);
  assert.match(component, /Но рост бизнеса не появляется <strong>автоматически<\/strong>\./);
  assert.match(component, /<h3>Атрибуция улучшилась<\/h3>/);
  assert.match(component, /Но GMV может почти <strong>не измениться<\/strong>\./);
  assert.doesNotMatch(component, /<button|data-|marquee|animation/i);
  assert.match(preview, /import MarketProblem from "\.\.\/\.\.\/components\/MarketProblem\.astro"/);
  assert.match(preview, /<MarketProblem\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Industries|Cohorts|SiteFooter/);
  assert.match(css, /\.market-problem\s*\{[^}]*padding-block:\s*clamp\(96px,\s*8vw,\s*128px\)[^}]*background:\s*var\(--paper\)/s);
  assert.match(css, /\.market-problem-inner\s*\{[^}]*min-height:\s*0/s);
  assert.match(css, /\.section-heading h2, .economics-heading h2, .market-problem-copy h2, .lead h2\s*\{[^}]*font-size:\s*clamp\(42px,\s*5\.1vw,\s*78px\)/s);
  assert.match(css, /\.market-signal-list\s*\{[^}]*border-top:/s);
  assert.match(css, /\.market-signal-list\s*\{[^}]*align-self:\s*end/s);
  assert.match(css, /\.market-signal h3\s*\{[^}]*font-size:\s*clamp\(30px,\s*2\.7vw,\s*42px\)/s);
  assert.match(css, /\.market-signal strong\s*\{[^}]*font-family:\s*var\(--display\)[^}]*font-weight:\s*600/s);
  assert.doesNotMatch(css, /\.market-signal strong\s*\{[^}]*color:/s);
  assert.doesNotMatch(css, /\.market-index/);
});

test("services use the approved taxonomy, order, descriptions, and channel labels", async () => {
  const data = await readFile(path.join(v3Root, "src", "data", "site.ts"), "utf8");
  const serviceData = data.split("export const services")[1].split("export const industries")[0];
  const titles = [...serviceData.matchAll(/title:\s*"([^"]+)"/g)].map((match) => match[1]);
  const descriptions = [...serviceData.matchAll(/description:\s*"([^"]+)"/g)].map((match) => match[1]);
  const toolsets = [...serviceData.matchAll(/tools:\s*\[([^\]]*)\]/g)].map((match) =>
    [...match[1].matchAll(/"([^"]+)"/g)].map((tool) => tool[1]),
  );

  assert.deepEqual(titles, [
    "Performance",
    "Мобильная реклама",
    "Media и OLV",
    "Retail Media",
    "SEO и GEO",
    "AI-Assisted аналитика",
  ]);
  assert.deepEqual(descriptions, [
    "Строим привлечение вокруг качества последней когорты, а не только стоимости конверсии.",
    "Новые пользователи в ваше мобильное приложение",
    "Brandformance-подход для формирования верха воронки и повышения знания бренда",
    "Performance-продвижение карточек товара и outclick-реклама",
    "Растим органическую видимость в поиске и AI-ответах, где уже существует спрос.",
    "Создаем для каждого проекта интерактивные кастомизированные отчеты и дашборды в реальном времени",
  ]);
  assert.deepEqual(toolsets, [
    ["Яндекс.Директ", "ВК", "CPA"],
    ["inApp", "DSP", "ASO"],
    ["Programmatic", "Media", "Спецпроекты"],
    ["Ozon", "RWB", "X5 Media", "Magnit Ads"],
    ["SEO", "GEO", "Контент", "Техническая оптимизация"],
    ["LLM-Отчетность", "Дашборды", "BI", "Яндекс.Метрика"],
  ]);
});

test("services lead copy uses an explicit 18px desktop font size", async () => {
  const css = await readFile(path.join(v3Root, "src", "styles", "global.css"), "utf8");

  assert.match(css, /\.services \.section-lead\s*\{[^}]*font-size:\s*18px/s);
});

test("cohorts explains the latest cohort with an interactive matrix", async () => {
  const cohorts = await readFile(
    path.join(v3Root, "src", "components", "Cohorts.astro"),
    "utf8",
  );
  const css = await readFile(path.join(v3Root, "src", "styles", "global.css"), "utf8");

  assert.match(cohorts, /Когортный подход/);
  assert.match(cohorts, /Маркетинг должен растить последнюю когорту/);
  assert.match(cohorts, /Когортный бизнес принимает маркетинговые, продуктовые и коммерческие решения/);
  assert.match(cohorts, /Бизнес растёт, когда новая выручка выше оттока старых когорт(?!\.)/);
  assert.match(cohorts, /Задача маркетинга — <strong>рост последней когорты<\/strong>(?!\.)/);
  assert.ok(
    cohorts.indexOf("Бизнес растёт, когда новая выручка выше оттока старых когорт") <
      cohorts.indexOf("Задача маркетинга — <strong>рост последней когорты</strong>"),
    "the growth action should follow the business explanation",
  );
  assert.doesNotMatch(cohorts, /<span>0[12]<\/span>/);
  assert.equal((cohorts.match(/<b>К[1-5]<\/b>/g) ?? []).length, 5);
  assert.match(cohorts, /Накопленные когорты/);
  assert.match(cohorts, /Последняя когорта/);
  assert.match(cohorts, /class="cohort-cell-pointer"/);
  assert.match(cohorts, /class="cohort-cell-pointer-curve"/);
  assert.doesNotMatch(cohorts, /data-cohort-step|data-cohort-visual|cohort-sticky|gmv-line/);
  assert.match(css, /\.cohort-section-top > p\s*\{[^}]*align-self:\s*center[^}]*margin:\s*36px 0 0/s);
  assert.match(css, /\.cohort-layout\s*\{[^}]*margin-top:\s*48px/s);
  assert.match(css, /\.cohort-points\s*\{[^}]*margin-bottom:\s*42px/s);
  assert.match(css, /\.cohort-layout\s*\{[^}]*position:\s*relative/s);
  assert.match(css, /\.cohort-cell-pointer\s*\{[^}]*width:\s*calc\(47\.5% - 60px\)[^}]*height:\s*64px[^}]*pointer-events:\s*none/s);
  assert.match(css, /\.cohort-cell-pointer-curve\s*\{[^}]*stroke-linecap:\s*round/s);
  assert.match(css, /@media \(max-width: 900px\)\s*\{[\s\S]*?\.cohort-cell-pointer\s*\{[^}]*display:\s*none/s);
  assert.match(css, /\.matrix i, \.matrix em\s*\{[^}]*transition:\s*[^;]*transform/s);
  assert.match(css, /\.matrix i:hover\s*\{[^}]*transform:\s*scale\(1\.06\)/s);
  assert.match(css, /\.matrix i\.new:hover\s*\{[^}]*box-shadow:/s);
});

test("cohorts has a standalone component preview", async () => {
  const previewPath = path.join(v3Root, "src", "pages", "preview", "cohorts.astro");
  const pageFiles = await collectFiles(path.join(v3Root, "src", "pages"), ".astro");

  assert.ok(pageFiles.includes(previewPath), "standalone Cohorts preview should exist");

  const preview = await readFile(previewPath, "utf8");
  assert.match(preview, /import Cohorts from \"\.\.\/\.\.\/components\/Cohorts\.astro\"/);
  assert.match(preview, /<Cohorts\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Hero|Tasks|Services|SiteFooter/);
});

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
  assert.match(component, /<p class="eyebrow">Новый подход к performance<\/p>/);
  assert.match(
    component,
    /<h2>Используем <span>AI-платформу<\/span> для управления маркетинговыми процессами<\/h2>/,
  );
  assert.doesNotMatch(component, /для управления всеми маркетинговыми процессами/);
  assert.match(
    component,
    /Palitra ускоряет анализ, отчётность и распределение бюджетов — решения остаются под контролем специалиста<\/p>/,
  );
  assert.match(component, /class="palitra-area-bullet"/);
  assert.match(component, /src="\/assets\/starline-logo-v8-1\.png"/);
  assert.match(component, /width="1024"/);
  assert.match(component, /height="1024"/);
  assert.doesNotMatch(component, /padStart|palitra-orbit|orbit-horizontal|orbit-vertical/);
  assert.match(
    component,
    /<div class="palitra-system">[\s\S]*<p class="human-control">Одобрение специалистом \(HITL\)<\/p>\s*<\/div>/,
  );
  assert.doesNotMatch(component, /\(HEETL\)/);
  assert.doesNotMatch(component, /Senior-специалист контролирует AI-процессы/);
  assert.match(css, /\.palitra-core \.palitra-logo\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(css, /\.palitra-core \.palitra-logo\s*\{[^}]*border-radius:\s*50%/s);
  assert.match(css, /\.palitra-area-bullet\s*\{[^}]*width:\s*18px[^}]*height:\s*18px/s);
  assert.match(
    css,
    /\.palitra-area\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*18px minmax\(0,\s*1fr\)[^}]*column-gap:\s*10px/s,
  );
  assert.match(css, /\.palitra-area p\s*\{[^}]*grid-column:\s*2/s);
  assert.match(
    css,
    /\.palitra-system\s*\{[^}]*border:\s*1px dashed rgba\(255,\s*255,\s*255,\s*0\.42\)/s,
  );
  assert.match(
    css,
    /\.human-control\s*\{[^}]*position:\s*absolute[^}]*bottom:\s*20px[^}]*left:\s*50%/s,
  );
  assert.doesNotMatch(css, /\.palitra-area\s*\{[^}]*border-top:/s);
  assert.match(
    css,
    /\.palitra-heading h2\s*\{[^}]*font-size:\s*clamp\(42px,\s*4vw,\s*64px\)/s,
  );
  assert.doesNotMatch(css, /\.palitra-orbit|\.orbit-horizontal|\.orbit-vertical/);
  assert.ok(pageFiles.includes(previewPath), "standalone Palitra preview should exist");

  const preview = await readFile(previewPath, "utf8");
  assert.match(preview, /import Palitra from "\.\.\/\.\.\/components\/Palitra\.astro"/);
  assert.match(preview, /<Palitra\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Economics|Cases|SiteFooter/);
});

test("palitra chat presents the approved screenshot in a standalone light section", async () => {
  const componentPath = path.join(
    v3Root,
    "src",
    "components",
    "PalitraChat.astro",
  );
  const component = await readFile(componentPath, "utf8");
  const screenshot = await readFile(
    path.join(v3Root, "src", "assets", "palitra", "chat.jpg"),
  );
  const indexPage = await readFile(
    path.join(v3Root, "src", "pages", "index.astro"),
    "utf8",
  );
  const css = await readFile(
    path.join(v3Root, "src", "styles", "global.css"),
    "utf8",
  );
  const previewPath = path.join(
    v3Root,
    "src",
    "pages",
    "preview",
    "palitra-chat.astro",
  );
  const preview = await readFile(previewPath, "utf8");

  assert.ok(screenshot.byteLength > 0, "Palitra chat screenshot should exist");
  assert.match(component, /import \{ Image \} from "astro:assets"/);
  assert.match(component, /import chatScreenshot from "\.\.\/assets\/palitra\/chat\.jpg"/);
  assert.match(component, /<h2>Управление в привычном чате AI-агента<\/h2>/);
  assert.match(component, /class="palitra-chat-screen"/);
  assert.match(component, /src=\{chatScreenshot\}/);
  assert.match(component, /alt="Интерфейс чата AI-агента Palitra"/);
  assert.match(indexPage, /import PalitraChat from "\.\.\/components\/PalitraChat\.astro"/);
  assert.match(
    indexPage,
    /id="palitra"[\s\S]*id="palitra-chat"[\s\S]*id="cases"/,
  );
  assert.match(preview, /import PalitraChat from "\.\.\/\.\.\/components\/PalitraChat\.astro"/);
  assert.match(preview, /<PalitraChat\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Palitra\s+from|Cases|SiteFooter/);
  assert.match(
    css,
    /\.palitra-chat\s*\{[^}]*background:\s*var\(--white\)/s,
  );
  assert.match(
    css,
    /\.palitra-chat-screen\s*\{[^}]*width:\s*min\(100%,\s*1180px\)[^}]*border:\s*1px solid var\(--light-line\)[^}]*border-radius:\s*8px/s,
  );
  assert.doesNotMatch(component, /<button|<p|data-|script/i);
});

test("palitra screen cascade has six approved static screens and an isolated preview", async () => {
  const componentPath = path.join(v3Root, "src", "components", "PalitraScreenCascade.astro");
  const component = await readFile(componentPath, "utf8");
  const script = await readFile(path.join(v3Root, "src", "scripts", "site.ts"), "utf8");
  const css = await readFile(path.join(v3Root, "src", "styles", "global.css"), "utf8");
  const indexPage = await readFile(path.join(v3Root, "src", "pages", "index.astro"), "utf8");
  const previewPath = path.join(v3Root, "src", "pages", "preview", "palitra-screen-cascade.astro");
  const preview = await readFile(previewPath, "utf8");
  const sourceNames = ["chat.jpg", "ai-optimization.png", "llm-reporting.png", "content-generation.png", "mediaplans.png", "pipelines.png"];

  for (const sourceName of sourceNames) {
    const source = await readFile(path.join(v3Root, "src", "assets", "palitra", sourceName));
    assert.ok(source.byteLength > 0, `${sourceName} should exist`);
  }
  const cascadeAssetImports = [...component.matchAll(/import\s+\w+\s+from\s+"\.\.\/assets\/palitra\/([^"]+)";/g)].map((match) => match[1]);
  assert.deepEqual([...cascadeAssetImports].sort(), [...sourceNames].sort());
  assert.equal(new Set(cascadeAssetImports).size, 6);
  assert.doesNotMatch(component, /common\.png/);
  assert.match(component, /data-palitra-cascade/);
  assert.match(component, /data-palitra-cascade-stage/);
  assert.match(component, /data-palitra-cascade-copy/);
  assert.match(component, /class="palitra-cascade-screens"/);
  assert.equal((component.match(/class="palitra-cascade-screen"(?=\s)/g) ?? []).length, 2);
  assert.match(component, /screens\.slice\(0,\s*3\)\.map/);
  assert.match(component, /screens\.slice\(3\)\.map/);
  assert.match(component, /доступен 24\/7 и знает всё о вашей рекламе и нашей работе над ней/);
  assert.match(component, /<span class="palitra-cascade-copy-accent">\s*AI-директор по маркетингу\s*<\/span>/);
  assert.match(component, /class="palitra-cascade-screen"[^>]*tabindex="0"/);
  assert.match(indexPage, /import PalitraScreenCascade from "\.\.\/components\/PalitraScreenCascade\.astro"/);
  assert.match(indexPage, /id="palitra-chat"[\s\S]*id="palitra-screen-cascade"[\s\S]*id="cases"/);
  assert.match(preview, /import PalitraScreenCascade from "\.\.\/\.\.\/components\/PalitraScreenCascade\.astro"/);
  assert.match(preview, /<PalitraScreenCascade\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|PalitraChat|Cases|SiteFooter/);
  assert.match(script, /\[data-palitra-cascade\]/);
  assert.match(script, /data-cascade-ready/);
  assert.match(script, /requestAnimationFrame/);
  assert.match(script, /passive:\s*true/);
  assert.match(script, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.palitra-screen-cascade\s*\{[^}]*background:\s*var\(--white\)/s);
  assert.match(css, /\[data-cascade-ready="true"\]\s+\.palitra-cascade-stage\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /\[data-palitra-cascade\]\[data-cascade-ready="true"\]\s+\.palitra-cascade-stage/);
  assert.match(css, /\.palitra-cascade-screen\s*\{[^}]*border-radius:\s*8px[^}]*box-shadow:/s);
  assert.match(css, /\.palitra-cascade-copy\s*\{[^}]*clamp\(32px,\s*3\.5vw,\s*54px\)/s);
  assert.match(css, /\.palitra-cascade-copy-accent\s*\{[^}]*color:\s*var\(--violet\)/s);
  assert.match(css, /\[data-palitra-cascade\]\[data-cascade-ready="true"\]\s+\.palitra-cascade-screen:is\(:hover,\s*:focus-visible\)\s*\{[^}]*z-index:\s*8[^}]*transform:\s*translate\(-50%,\s*-50%\)\s*scale\(1\)/s);
  assert.match(css, /@media \(max-width:\s*640px\)[\s\S]*\.palitra-cascade-row\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.palitra-cascade-screens\s*\{[^}]*display:\s*grid/s);
  assert.match(script, /const cascadeFinalScale = 0\.2;/);
  assert.match(script, /const cascadeEdgeGap = 16;/);
  assert.match(script, /const screensCanvas = scene\.querySelector<HTMLElement>\("\.palitra-cascade-screens"\);/);
  assert.match(script, /const copyHalfWidth = copy\.clientWidth \/ 2;/);
  assert.match(script, /const canvasHalfWidth = screensCanvas\.clientWidth \/ 2;/);
  assert.match(script, /const finalX = horizontalDirection \* Math\.min\(copyHalfWidth \+ screenHalfWidth \+ cascadeEdgeGap, canvasHalfWidth - screenHalfWidth\);/);
  assert.match(script, /const finalY = verticalDirection \* Math\.min\(copyHalfHeight \+ screenHalfHeight \+ cascadeEdgeGap, canvasHalfHeight - screenHalfHeight\);/);
  assert.match(css, /\[data-palitra-cascade\]\[data-cascade-ready="true"\] \.palitra-cascade-stage\s*\{[^}]*width:\s*100vw[^}]*margin-left:\s*calc\(50% - 50vw\)/s);
  assert.doesNotMatch(css, /\.palitra-screen-cascade\s*\{[^}]*min-height:\s*280svh/s);
  assert.doesNotMatch(css, /\.palitra-cascade-shell\s*\{[^}]*min-height:/s);
  assert.match(css, /\[data-palitra-cascade\]\[data-cascade-ready="true"\]\s*\{[^}]*min-height:\s*280svh/s);
});

test("cases preserve v2 content and use two local optimized images", async () => {
  const markup = await sourceBundle(".astro");
  const data = await readFile(path.join(v3Root, "src", "data", "site.ts"), "utf8");
  const caseData = data.split("export const cases")[1];

  assert.match(markup, /cases\.map/);
  assert.equal((caseData.match(/imageAlt:/g) ?? []).length, 2);
  assert.equal((caseData.match(/width:\s*1448/g) ?? []).length, 2);
  assert.equal((caseData.match(/height:\s*1086/g) ?? []).length, 2);
  assert.match(caseData, /5–10×/);
  assert.match(caseData, /15 тестов за 2 месяца/);
  assert.match(caseData, /\+30%/);
  assert.match(markup, /alt=\{caseStudy\.imageAlt\}/);
  assert.doesNotMatch(markup, /Детский мир|Перекр[её]сток/);
});

test("local interactions cover menu, services, and lead form", async () => {
  const script = await readFile(
    path.join(v3Root, "src", "scripts", "site.ts"),
    "utf8",
  );

  assert.match(script, /aria-expanded/);
  assert.match(script, /data-service-toggle/);
  assert.doesNotMatch(script, /IntersectionObserver|data-cohort-step|data-cohort-visual/);
  assert.match(script, /checkValidity/);
  assert.match(script, /Данные никуда не отправлены/);
  assert.doesNotMatch(script, /fetch\s*\(/);
});

test("lead form has only name and contact fields plus the GMV caveat", async () => {
  const markup = await sourceBundle(".astro");

  assert.equal((markup.match(/<input/g) ?? []).length, 2);
  assert.match(markup, /name=\"name\"/);
  assert.match(markup, /name=\"contact\"/);
  assert.match(markup, /\+20–50%/);
  assert.match(markup, /не является гарантией/);
  assert.doesNotMatch(markup, /id=\"team\"|id=\"technology\"/);
});

test("economics explains GMV growth with an explicit non-guarantee caveat", async () => {
  const economics = await readFile(
    path.join(v3Root, "src", "components", "Economics.astro"),
    "utf8",
  );
  const css = await readFile(path.join(v3Root, "src", "styles", "global.css"), "utf8");
  const previewPath = path.join(v3Root, "src", "pages", "preview", "economics.astro");
  const pageFiles = await collectFiles(path.join(v3Root, "src", "pages"), ".astro");

  assert.match(economics, /CPA вырастет/);
  assert.match(economics, /ДРР тоже вырастет/);
  assert.match(economics, /GMV вырастет ещё сильнее/);
  assert.match(economics, /\+20–50% GMV за 6–12 месяцев/);
  assert.match(economics, /не является гарантией/);
  assert.equal(
    (economics.match(/src="\/assets\/starline-logo-v8-1\.png"/g) ?? []).length,
    3,
    "each economics step should use the approved Starline logo asset instead of a numeric index",
  );
  assert.doesNotMatch(economics, /<strong>0[1-3]<\/strong>/);
  assert.match(
    economics,
    /\/Диапазон зависит от исходной экономики, продукта и рынка и не является гарантией результата\//,
  );
  assert.match(
    economics,
    /<div class="economics-heading-copy">\s*<p class="eyebrow dark">Экономика подхода<\/p>\s*<h2>/,
  );
  assert.ok(
    economics.indexOf("CPA вырастет") < economics.indexOf("ДРР тоже вырастет") &&
      economics.indexOf("ДРР тоже вырастет") < economics.indexOf("GMV вырастет ещё сильнее"),
    "the economics flow should read from CPA through GMV",
  );
  assert.doesNotMatch(economics, /Допустимый компромисс|Целевой результат|tradeoff-arrow|GMV ↑↑/);
  assert.ok(pageFiles.includes(previewPath), "standalone Economics preview should exist");

  const preview = await readFile(previewPath, "utf8");
  assert.match(preview, /import Economics from "\.\.\/\.\.\/components\/Economics\.astro"/);
  assert.match(preview, /<Economics\s*\/>/);
  assert.doesNotMatch(preview, /SiteHeader|Cohorts|Process|SiteFooter/);
  assert.match(css, /\.economics-flow\s*\{[^}]*border-top:/s);
  assert.match(css, /\.economics-step\s*\{[^}]*border-bottom:/s);
  assert.match(css, /\.economics-bullet\s*\{[^}]*width:\s*24px/s);
  assert.match(css, /\.star\s*\{[^}]*url\(["']?\/assets\/starline-logo-v8-1\.png["']?\)/s);
  assert.doesNotMatch(css, /\.star\s*\{[^}]*clip-path:/s);
  assert.match(css, /@media \(max-width: 900px\)\s*\{[\s\S]*?\.economics-layout\s*\{[^}]*grid-template-columns:\s*1fr/s);
});
