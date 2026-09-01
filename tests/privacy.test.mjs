import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

function localHrefs(html) {
  return [...html.matchAll(/\bhref=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((href) => !/^(?:https?:|mailto:|tel:|javascript:)/i.test(href));
}

async function assertLocalLinksResolve(sourceFile, html) {
  for (const href of localHrefs(html)) {
    const [rawFile, anchor = ""] = href.split("#", 2);
    const targetFile = rawFile.split("?", 1)[0] || sourceFile;
    const targetPath = path.join(projectRoot, targetFile);
    await access(targetPath);

    if (!anchor || !targetFile.endsWith(".html")) continue;

    const targetHtml = targetFile === sourceFile ? html : await readFile(targetPath, "utf8");
    const escapedAnchor = anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(
      targetHtml,
      new RegExp(`\\bid=["']${escapedAnchor}["']`),
      `${sourceFile} must link to an existing #${anchor} anchor in ${targetFile}`,
    );
  }
}

test("the landing exposes resolvable privacy and lead-consent routes", async () => {
  const [landing, privacy, consent, aiContour] = await Promise.all([
    readProjectFile("index.html"),
    readProjectFile("privacy.html"),
    readProjectFile("consent.html"),
    readProjectFile("ai-contour/index.html"),
  ]);

  assert.match(landing, /<footer[\s\S]*href="privacy\.html"[^>]*data-privacy-link/);
  assert.match(landing, /data-analytics-consent[\s\S]*href="privacy\.html#analytics"[^>]*data-privacy-details/);
  assert.match(landing, /href="consent\.html"/);
  assert.match(aiContour, /href="\.\.\/privacy\.html"/);
  assert.match(aiContour, /href="\.\.\/consent\.html"/);
  assert.match(privacy, /\bid="analytics"/);

  await Promise.all([
    assertLocalLinksResolve("index.html", landing),
    assertLocalLinksResolve("privacy.html", privacy),
    assertLocalLinksResolve("consent.html", consent),
  ]);
});
