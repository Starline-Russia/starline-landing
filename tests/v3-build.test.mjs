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
    "services",
    "industries",
    "market-problem",
    "cohorts",
    "economics",
    "palitra",
    "palitra-chat",
    "palitra-screen-cascade",
    "cases",
    "lead",
  ]);
  assert.doesNotMatch(html, /<section\b[^>]*\bid="process"/);
  assert.equal(count(html, /class="[^"]*\bhero-cta\b/g), 1);
  assert.equal(count(html, /class="[^"]*\btask-card\b/g), 6);
  assert.equal(count(html, /class="[^"]*\bservice-item\b/g), 6);
  assert.equal(count(html, /class="[^"]*\bindustry-card\b/g), 8);
  assert.equal(count(html, /class="market-signal"/g), 2);
  assert.equal(count(html, /class="[^"]*\bcase-study\b/g), 2);
  assert.equal(count(html, /<input\b/g), 2);
  assert.doesNotMatch(html, /Как растет GMV|Как растёт GMV/);
  assert.match(html, /Реклама может выглядеть эффективной, пока бизнес почти не растёт/);
  assert.match(html, /не является гарантией результата/);
  assert.match(
    html,
    /<img\b[^>]*class="palitra-logo"[^>]*src="\/assets\/palitra-logo-512\.png"[^>]*width="512"[^>]*height="512"[^>]*>/,
  );
  assert.match(html, /Новый подход к performance/);
  assert.match(
    html,
    /Используем <span>AI-платформу<\/span> для управления маркетинговыми процессами/,
  );
  assert.doesNotMatch(html, /для управления всеми маркетинговыми процессами/);
  assert.match(
    html,
    /Palitra ускоряет анализ, отчётность и распределение бюджетов — решения остаются под контролем специалиста/,
  );
  assert.equal(count(html, /class="palitra-area-bullet"/g), 4);
  assert.match(html, /Одобрение специалистом \(HITL\)/);
  assert.doesNotMatch(html, /Одобрение специалистом \(HEETL\)/);
  assert.doesNotMatch(html, /Senior-специалист контролирует AI-процессы/);
  assert.doesNotMatch(html, /palitra-orbit|orbit-horizontal|orbit-vertical/);
  assert.match(html, /Управление в привычном чате AI-агента/);
  const palitraChatImages = [
    ...html.matchAll(/<img\b[^>]*class="palitra-chat-screen"[^>]*>/g),
  ].map((match) => match[0]);
  assert.equal(palitraChatImages.length, 1);
  assert.match(palitraChatImages[0], /\bwidth="1280"/);
  assert.match(palitraChatImages[0], /\bheight="916"/);
  assert.match(
    palitraChatImages[0],
    /\balt="Интерфейс чата AI-агента Palitra"/,
  );
  assert.match(palitraChatImages[0], /\bloading="lazy"/);
  assert.match(html, /ai-директор по маркетингу доступен 24\/7 и знает всё о вашей рекламе и нашей работе над ней/);
  const cascadeImages = [...html.matchAll(/<img\b[^>]*class="palitra-cascade-screen"[^>]*>/g)].map((match) => match[0]);
  assert.equal(cascadeImages.length, 6);
  const cascadeSources = cascadeImages.map((image) => image.match(/\bsrc="([^"]+)"/)?.[1]);
  assert.ok(cascadeSources.every(Boolean));
  assert.equal(new Set(cascadeSources).size, 6);
  assert.doesNotMatch(html, /common\.png/);
  for (const image of cascadeImages) {
    assert.match(image, /\bwidth="\d+"/);
    assert.match(image, /\bheight="\d+"/);
    assert.match(image, /\balt="[А-Яа-яЁё][^"]+"/);
    assert.match(image, /\bloading="lazy"/);
  }
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
