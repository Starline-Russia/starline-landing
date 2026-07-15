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
});

test("v4 keeps navigation and hero copy in a typed site data module", async () => {
  const siteData = await source("v4/src/data/site.ts");

  assert.match(siteData, /export const navigation/);
  assert.match(siteData, /export const heroArtifacts/);
  assert.match(siteData, /10\+/);
  assert.match(siteData, /50\+/);
  assert.match(siteData, /19/);
  assert.match(siteData, /последн/i);
  assert.doesNotMatch(siteData, /50\+\s+(?:проект|клиент)/i);
});

test("v4 header uses one accessible DOM tree for mobile menu and scroll morph", async () => {
  const header = await source("v4/src/components/SiteHeader.astro");

  assert.equal(header.match(/<header\b/g)?.length, 1);
  assert.match(header, /data-site-header/);
  assert.match(header, /data-nav-toggle/);
  assert.match(header, /aria-expanded="false"/);
  assert.match(header, /aria-controls="site-navigation"/);
  assert.match(header, /data-site-nav/);
  assert.match(header, /hero\.primaryAction\.label/);
  assert.doesNotMatch(header, /<header[\s\S]*<header/);
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
