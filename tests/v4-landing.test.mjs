import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("v4 is an isolated static Astro project", async () => {
  const packageJson = JSON.parse(await source("v4/package.json"));
  const config = await source("v4/astro.config.mjs");

  assert.equal(packageJson.dependencies.astro, "7.0.9");
  assert.equal(packageJson.devDependencies.typescript, "6.0.3");
  assert.equal(packageJson.dependencies.react, undefined);
  assert.equal(packageJson.dependencies.tailwindcss, undefined);
  assert.match(packageJson.scripts.dev, /^ASTRO_TELEMETRY_DISABLED=1 astro dev$/);
  assert.match(packageJson.scripts.check, /^ASTRO_TELEMETRY_DISABLED=1 astro check$/);
  assert.match(packageJson.scripts.build, /^ASTRO_TELEMETRY_DISABLED=1 astro build$/);
  assert.match(config, /output:\s*["']static["']/);
  assert.match(config, /format:\s*["']directory["']/);
});

test("v4 locks the approved references and canonical design tokens", async () => {
  const design = await source("v4/DESIGN.md");
  const tokens = await source("v4/tokens.css");
  const tokenBridge = await source("v4/src/styles/tokens.css");

  assert.match(design, /steep\.app/);
  assert.match(design, /75fdb89f-ca64-41b3-af36-7a78bd09448e/);
  assert.match(design, /Feature Stack/);
  assert.match(tokens, /--color-paper:/);
  assert.match(tokens, /--color-ink:/);
  assert.match(tokens, /--color-peach:/);
  assert.match(tokens, /--font-display:/);
  assert.match(tokens, /--font-sans:/);
  assert.match(tokens, /--space-md:/);
  assert.match(tokens, /--ease-out:/);
  assert.match(tokens, /--dur-short:/);
  assert.match(tokenBridge, /@import\s+["']\.\.\/\.\.\/tokens\.css["']/);
});

test("v4 page shell exposes accessible metadata and assembles the hero checkpoint", async () => {
  const layout = await source("v4/src/layouts/BaseLayout.astro");
  const page = await source("v4/src/pages/index.astro");
  const css = await source("v4/src/styles/global.css");

  assert.match(layout, /lang="ru"/);
  assert.match(layout, /viewport-fit=cover/);
  assert.match(layout, /rel="icon"/);
  assert.match(layout, /href="\/assets\/logo\/8-1-peach\.png"/);
  assert.match(layout, /class="skip-link"/);
  assert.match(layout, /Source\+Serif\+4/);
  assert.match(layout, /family=Inter/);
  assert.match(page, /id="content"/);
  assert.match(page, /import SiteHeader from/);
  assert.match(page, /import Hero from/);
  assert.match(page, /<SiteHeader\s*\/>/);
  assert.match(page, /<Hero\s*\/>/);
  assert.match(page, /scripts\/site/);
  assert.match(css, /^\/\* Hallmark · pre-emit critique:/);
  assert.match(css, /theme: studied-DNA \(source:/);
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.skip-link:hover/);
  assert.match(css, /\.skip-link:active/);
  assert.match(css, /\.skip-link\[aria-disabled="true"\]/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
});

test("v4 records its Hallmark fingerprint inside the isolated project", async () => {
  const log = JSON.parse(await source("v4/.hallmark/log.json"));

  assert.equal(log[0].macrostructure, "Feature Stack");
  assert.equal(log[0].theme, "studied-DNA");
  assert.equal(log[0].nav, "N10");
  assert.equal(log[0].footer, "Ft2");
  assert.equal(log[0].enrichment, "aligned dual-logo cursor reveal");
});

test("v4 keeps navigation and hero copy in a typed site data module", async () => {
  const siteData = await source("v4/src/data/site.ts");

  assert.match(siteData, /export const navigation/);
  assert.match(siteData, /title:\s*["']Рост e-commerce — это система, а не набор каналов\.["']/);
  assert.match(siteData, /export const heroArtifacts/);
  assert.match(siteData, /10\+/);
  assert.match(siteData, /50\+/);
  assert.match(siteData, /19/);
  assert.match(siteData, /последн/i);
  assert.doesNotMatch(siteData, /50\+\s+(?:проект|клиент)/i);
});

test("v4 keeps the exact approved About copy in typed site data", async () => {
  const siteData = await source("v4/src/data/site.ts");
  const expectedCopy = [
    "Starline - команда профессионалов с опытом работы в ведущих performance-агентствах и западных технологических компаниях.",
    "За десятилетия работы каждый прошел путь с нуля до управленческих позиций.",
    "Знаем изнутри, как работать с крупнейшими рекламодателями в различных отраслях, все тонкости процессов создания и ведения рекламных кампаний, особенности проведения тендеров и нюансы клиентского сервиса.",
    "Понимаем, как performance встраивается в маркетинговую воронку, какие задачи решает и какие стратегии будут наиболее эффективны для поставленных задач.",
    "Впитав все лучшие подходы к построению команд, разработке стратегий, созданию лучшего клиентского сервиса мы горим желанием переосмыслить этот процесс и добавить свежий взгляд.",
    "2026 год - точка пересборки для многих компаний, поэтому мы находимся в правильное время в правильном месте.",
    "Агентство Старлайн создано в рамках гк Старлинк.",
    "Ресурсы, возможности и опыт группы компаний позволит реализовать все задуманные идеи в полной мере.",
  ];

  assert.match(siteData, /export const about/);
  assert.match(siteData, /title:\s*["']О нас["']/);
  for (const copy of expectedCopy) {
    assert.ok(siteData.includes(copy), `missing exact About copy: ${copy}`);
  }
});

test("v4 renders one shared responsive About component on the page and preview route", async () => {
  const component = await source("v4/src/components/About.astro");
  const page = await source("v4/src/pages/index.astro");
  const preview = await source("v4/src/pages/preview/about.astro");
  const css = await source("v4/src/styles/global.css");

  assert.match(component, /import\s+\{\s*about\s*\}\s+from\s+["']\.\.\/data\/site["']/);
  assert.match(component, /<section\s+class="about site-shell"\s+id="about"/);
  assert.match(component, /aria-labelledby="about-title"/);
  assert.match(component, /<h2\s+id="about-title"/);
  assert.match(component, /about\.story\.map/);
  assert.match(component, /about\.groupContext\.map/);

  assert.match(page, /import About from ["']\.\.\/components\/About\.astro["']/);
  assert.match(page, /<About\s*\/>/);
  assert.ok(page.indexOf("<Hero />") < page.indexOf("<About />"));

  assert.match(preview, /import About from ["']\.\.\/\.\.\/components\/About\.astro["']/);
  assert.match(preview, /<About\s*\/>/);
  assert.doesNotMatch(preview, /<section\s+class="about/);

  assert.match(css, /\.about\s*\{/);
  assert.match(css, /\.about__story\s*\{/);
  assert.match(
    css,
    /\.about__paragraph--lead\s*\{[^}]*min-width:\s*0[^}]*overflow-wrap:\s*anywhere/,
  );
  assert.match(css, /@media\s*\(min-width:\s*60rem\)[\s\S]*\.about__group/);
});

test("v4 header uses one accessible DOM tree for mobile menu and scroll morph", async () => {
  const header = await source("v4/src/components/SiteHeader.astro");
  const css = await source("v4/src/styles/global.css");

  assert.equal(header.match(/<header\b/g)?.length, 1);
  assert.equal(header.match(/<a\s+class="site-header__brand"(?=\s|>)/g)?.length, 1);
  assert.match(header, /data-site-header/);
  assert.match(header, /<img\s+class="site-header__brand-mark"/);
  assert.match(header, /src="\/assets\/logo\/8-1-peach\.png"/);
  assert.match(header, /alt=""/);
  assert.match(header, /data-nav-toggle/);
  assert.match(header, /aria-expanded="false"/);
  assert.match(header, /aria-controls="site-navigation"/);
  assert.match(header, /data-site-nav/);
  assert.match(header, /hero\.primaryAction\.label/);
  assert.doesNotMatch(header, /<header[\s\S]*<header/);
  assert.match(css, /\.site-header__brand-mark\s*\{[^}]*object-fit:\s*contain/);
});

test("v4 hero is semantic, factual, and uses the approved logo reveal", async () => {
  const heroComponent = await source("v4/src/components/Hero.astro");
  const logoReveal = await source("v4/src/components/HeroLogoReveal.astro");

  assert.equal(heroComponent.match(/<h1\b/g)?.length, 1);
  assert.match(heroComponent, /data-hero/);
  assert.doesNotMatch(heroComponent, /<svg\b/);
  assert.match(logoReveal, /data-logo-reveal-surface/);
  assert.match(logoReveal, /role="img"/);
  assert.match(logoReveal, /aria-labelledby=/);
  assert.match(heroComponent, /heroArtifacts\.map/);
  assert.match(heroComponent, /hero\.primaryAction\.label/);
  assert.doesNotMatch(heroComponent, /browser|traffic-light|dashboard chrome/i);
});

test("v4 controller limits motion to the menu, N10 morph, and initial assembly", async () => {
  const controller = await source("v4/src/scripts/site.ts");

  assert.match(controller, /aria-expanded/);
  assert.match(controller, /Escape/);
  assert.match(controller, /dataset\.floating/);
  assert.match(controller, /requestAnimationFrame/);
  assert.match(controller, /passive:\s*true/);
  assert.match(controller, /dataset\.ready/);
  assert.doesNotMatch(controller, /fetch\(|gsap|framer|lottie/i);
});

test("v4 ships a standalone hero preview and responsive component styles", async () => {
  const preview = await source("v4/src/pages/preview/hero.astro");
  const css = await source("v4/src/styles/global.css");

  assert.match(preview, /<SiteHeader\s*\/>/);
  assert.match(preview, /<Hero\s+showLogoControls=\{true\}\s*\/>/);
  assert.match(preview, /scripts\/site/);
  assert.match(css, /\.site-header\[data-floating="true"\]/);
  assert.match(css, /\.hero__visual/);
  assert.match(css, /@media\s*\(min-width:\s*60rem\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /transition:\s*all\b/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
});

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
  assert.match(
    css,
    /html\[data-enhanced\]\[data-ready="true"\]\s+\.hero__visual\s*\{[^}]*transform:\s*none\s*;/,
  );
  assert.doesNotMatch(css, /transition:\s*all\b/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
});
