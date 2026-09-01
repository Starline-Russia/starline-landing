import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

function sectionStart(html, id) {
  return html.indexOf(`id="${id}"`);
}

function formMarkup(html) {
  const start = html.indexOf("<form");
  const end = html.indexOf("</form>", start);
  return html.slice(start, end + "</form>".length);
}

function localReferences(html) {
  return [...html.matchAll(/\b(?:href|src|action)=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|mailto:|tel:|#|data:)/i.test(value));
}

test("/ai-contour/ exposes the approved security-first narrative and canonical", async () => {
  const html = await read("ai-contour/index.html");

  assert.match(html, /<link rel="canonical" href="https:\/\/starlineagency\.ru\/ai-contour\/">/);
  assert.match(html, /<h1[^>]*>\s*Дайте сотрудникам AI — не отдавая ему чувствительные данные компании\s*<\/h1>/);
  assert.match(html, /href="#contact"[^>]*>Запросить расчёт/);

  const orderedSections = [
    "risks",
    "request-flow",
    "benefits",
    "masking-levels",
    "delivery",
    "estimate",
    "team",
    "faq",
    "contact",
  ];
  let previous = -1;
  for (const id of orderedSections) {
    const current = sectionStart(html, id);
    assert.ok(current > previous, `#${id} must exist in the approved order`);
    previous = current;
  }
});

test("the sales page omits client identity, prices, timelines, and out-of-scope offers", async () => {
  const html = await read("ai-contour/index.html");

  assert.doesNotMatch(html, /OMI|ОМИ|Летуаль|L['’]?Etoile/i);
  assert.doesNotMatch(html, /\bRAG\b|AI[- ]?агент|ИИ[- ]?агент|инфраструктурн(?:ый|ые) тариф/i);
  assert.doesNotMatch(html, /\b\d[\d\s]*(?:₽|руб(?:\.|лей)?|USD|EUR|€|\$)/i);
  assert.doesNotMatch(html, /\b\d+\s*(?:рабочих\s+)?(?:дн(?:я|ей)|недел(?:я|и|ь)|месяц(?:а|ев)?)\b/i);
  assert.doesNotMatch(html, /гарантируем|гарантированн(?:ый|ая|ое)|\+\d+%|\d+×/i);
});

test("masking journey is an accessible progressively-enhanced tablist", async () => {
  const [html, script, css] = await Promise.all([
    read("ai-contour/index.html"),
    read("ai-contour/app.js"),
    read("ai-contour/styles.css"),
  ]);
  const flowStart = sectionStart(html, "request-flow");
  const flowEnd = html.indexOf("</section>", flowStart);
  const flow = html.slice(flowStart, flowEnd);

  assert.match(flow, /role="tablist"/);
  for (const label of ["Запрос сотрудника", "Что видит внешняя модель", "Ответ сотруднику"]) {
    assert.match(flow, new RegExp(`role="tab"[^>]*>${label}<`));
  }
  assert.equal((flow.match(/role="tabpanel"/g) || []).length, 3);
  assert.equal((flow.match(/role="tabpanel"[^>]*\bhidden\b/g) || []).length, 0, "all panels must remain readable without JavaScript");
  for (const token of ["[PROJECT_4]", "[ORG_12]", "[PERSON_7]"]) {
    assert.ok(flow.includes(token), `${token} must demonstrate deterministic masking`);
  }
  assert.match(script, /ArrowRight/);
  assert.match(script, /ArrowLeft/);
  assert.match(script, /Home/);
  assert.match(script, /End/);
  assert.match(script, /aria-selected/);
  assert.match(css, /\[data-mask-demo\]\[data-enhanced="true"\][\s\S]*\[role="tabpanel"\]\[hidden\]/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /html[\s\S]*overflow-x:\s*clip/);
  assert.match(css, /body[\s\S]*overflow-x:\s*clip/);
});

test("both lead forms share the same five-field POST contract", async () => {
  const [mainHtml, aiHtml] = await Promise.all([read("index.html"), read("ai-contour/index.html")]);
  const forms = [
    { html: formMarkup(mainHtml.slice(sectionStart(mainHtml, "contact"))), action: "send-lead.php", source: "main", consent: "consent.html", consentId: "lead-consent-main" },
    { html: formMarkup(aiHtml.slice(sectionStart(aiHtml, "contact"))), action: "../send-lead.php", source: "ai-contour", consent: "../consent.html", consentId: "lead-consent-ai-contour" },
  ];

  for (const { html, action, source, consent, consentId } of forms) {
    assert.match(html, /<form[^>]*\bdata-lead-form\b[^>]*>/);
    assert.match(html, /<form[^>]*\bym-disable-submit\b[^>]*>/);
    assert.match(html, new RegExp(`action="${action.replace(".", "\\.")}"`));
    assert.match(html, /method="post"/i);
    assert.equal((html.match(/name="name"/g) || []).length, 1);
    assert.equal((html.match(/name="contact"/g) || []).length, 1);
    assert.match(html, new RegExp(`name="source"[^>]*value="${source}"`));
    assert.match(html, /name="website"[^>]*autocomplete="off"[^>]*tabindex="-1"/);
    assert.match(html, new RegExp(`id="${consentId}"[^>]*name="personal_data_consent"[^>]*value="2026-08-28"[^>]*required`));
    assert.doesNotMatch(html, /name="personal_data_consent"[^>]*\bchecked\b/);
    assert.match(html, new RegExp(`<label[^>]*for="${consentId}"[^>]*>`));
    assert.match(html, new RegExp(`href="${consent.replace(".", "\\.")}"[^>]*target="_blank"[^>]*rel="noopener noreferrer"`));
    assert.doesNotMatch(html, /<label[^>]*>[\s\S]*?<a[^>]*href=["'][^"']*consent\.html["'][^>]*>[\s\S]*?<\/label>/);
    assert.match(html, /data-form-status[^>]*aria-live="polite"/);
    assert.equal((html.match(/class="[^"]*\bym-disable-keys\b[^"]*"/g) || []).length, 2);
  }

  assert.match(mainHtml, /<script src="lead-form\.js"><\/script>/);
  assert.match(aiHtml, /<script src="\.\.\/lead-form\.js"><\/script>/);
});

test("all local references from the new route resolve without root-relative URLs", async () => {
  const html = await read("ai-contour/index.html");
  assert.doesNotMatch(html, /\b(?:href|src|action)=["']\//, "GitHub Pages-safe references must stay relative");

  for (const reference of localReferences(html)) {
    const file = reference.split(/[?#]/, 1)[0];
    if (!file) continue;
    await access(path.resolve(projectRoot, "ai-contour", file));
  }
});

test("privacy and consent describe real lead handling without advertising consent", async () => {
  const [privacy, consent, endpoint] = await Promise.all([
    read("privacy.html"),
    read("consent.html"),
    read("send-lead.php"),
  ]);

  assert.doesNotMatch(privacy, /starline:lead-draft|не отправляет данные|только в браузере/i);
  assert.match(privacy, /заявк|обращен/i);
  assert.match(privacy, /хостинг|Руцентр/i);
  assert.match(privacy, /REG\.RU/);
  assert.doesNotMatch(privacy, /Руцентр|Региональный Сетевой Информационный Центр/);
  assert.match(privacy, /почт|email/i);
  assert.match(privacy, /тр[её]х лет|3 лет/i);
  assert.match(privacy, /маркетинг, автоматизац|AI-решени/i);

  assert.match(privacy, /Редакция от 28 августа 2026 года/);
  assert.match(privacy, /сайта <strong>starlineagency\.ru<\/strong>/);
  assert.match(privacy, /хостинг-инфраструктуру сайта starlineagency\.ru/);
  assert.match(privacy, /почтовую инфраструктуру корпоративного адреса[^.]*hi@starlinerussia\.ru/);
  assert.match(consent, /Редакция от 28 августа 2026 года/);
  assert.match(consent, /2026-08-28/);
  assert.match(consent, /REG\.RU/);
  assert.match(consent, /хостинг-инфраструктуры сайта starlineagency\.ru/);
  assert.match(consent, /почтовой инфраструктуры корпоративного адреса[^.]*hi@starlinerussia\.ru/);
  assert.match(consent, /Имя/);
  assert.match(consent, /Телефон или email/);
  assert.match(consent, /не включает[^.]*реклам|не является[^.]*рассыл/i);
  assert.match(consent, /hi@starlinerussia\.ru/);
  assert.doesNotMatch(endpoint, /REMOTE_ADDR|HTTP_USER_AGENT/);
});
