import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

function count(markup, pattern) {
  return [...markup.matchAll(pattern)].length;
}

test("v3 production HTML preserves the landing contract", async () => {
  const html = await read("v3/dist/index.html");
  const sectionIds = [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(sectionIds, [
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
  ]);
  assert.equal(count(html, /class="[^"]*\bhero-cta\b/g), 1);
  assert.equal(count(html, /class="[^"]*\btask-card\b/g), 6);
  assert.equal(count(html, /class="[^"]*\bservice-item\b/g), 6);
  assert.equal(count(html, /class="[^"]*\bindustry-name\b/g), 7);
  assert.equal(count(html, /class="[^"]*\bcase-study\b/g), 2);
  assert.equal(count(html, /<input\b/g), 2);
  assert.doesNotMatch(html, /Как растет GMV|Как растёт GMV/);
  assert.match(html, /не является гарантией результата/);
});

test("v3 production cases include intrinsic image metadata and Russian alt text", async () => {
  const html = await read("v3/dist/index.html");
  const images = [...html.matchAll(/<img\b[^>]*class="case-image"[^>]*>/g)].map((match) => match[0]);

  assert.equal(images.length, 2);
  for (const image of images) {
    assert.match(image, /\bwidth="\d+"/);
    assert.match(image, /\bheight="\d+"/);
    assert.match(image, /\balt="[А-Яа-яЁё][^"]+"/);
    assert.match(image, /\bloading="lazy"/);
  }
});
