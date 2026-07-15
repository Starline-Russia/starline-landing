import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";

const v3Root = process.cwd();

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
  assert.match(astroConfig, /output:\s*["']static["']/);
});

test("v3 contains the approved section order and hero contract", async () => {
  const markup = await sourceBundle(".astro");
  const sectionIds = [
    "hero",
    "tasks",
    "cohorts",
    "services",
    "industries",
    "economics",
    "process",
    "palitra",
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

test("v3 renders six tasks, six services, and seven industries", async () => {
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
  assert.equal((industryData.match(/^  \"(?:E-commerce|Fintech|Travel|Real estate|Fashion|Online services|Food delivery)\",$/gm) ?? []).length, 7);
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

test("cohorts reproduces the static v2 content and matrix", async () => {
  const cohorts = await readFile(
    path.join(v3Root, "src", "components", "Cohorts.astro"),
    "utf8",
  );

  assert.match(cohorts, /Когортный подход/);
  assert.match(cohorts, /Маркетинг должен растить последнюю когорту/);
  assert.match(cohorts, /Когортный бизнес принимает маркетинговые, продуктовые и коммерческие решения/);
  assert.match(cohorts, /Задача маркетинга — рост последней когорты\./);
  assert.match(cohorts, /Бизнес растёт, когда новая выручка выше оттока старых когорт\./);
  assert.equal((cohorts.match(/<b>К[1-5]<\/b>/g) ?? []).length, 5);
  assert.match(cohorts, /Накопленные когорты/);
  assert.match(cohorts, /Последняя когорта/);
  assert.doesNotMatch(cohorts, /data-cohort-step|data-cohort-visual|cohort-sticky|gmv-line/);
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

test("economics states CPA and DRR growth in words", async () => {
  const markup = await sourceBundle(".astro");

  assert.match(markup, /CPA вырастет/);
  assert.match(markup, /ДРР тоже вырастет/);
  assert.doesNotMatch(markup, /CPA ↑|ДРР ↑/);
});
