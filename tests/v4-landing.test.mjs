import assert from "node:assert/strict";
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

test("v4 foundation exposes accessible metadata and a visible token proof", async () => {
  const layout = await source("v4/src/layouts/BaseLayout.astro");
  const page = await source("v4/src/pages/index.astro");
  const css = await source("v4/src/styles/global.css");

  assert.match(layout, /lang="ru"/);
  assert.match(layout, /viewport-fit=cover/);
  assert.match(layout, /class="skip-link"/);
  assert.match(layout, /Source\+Serif\+4/);
  assert.match(layout, /family=Inter/);
  assert.match(page, /id="content"/);
  assert.match(page, /Paper/);
  assert.match(page, /Ink/);
  assert.match(page, /Peach/);
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
