import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const storageKey = "starline:analytics-consent";
const consentVersion = "analytics-consent-v1";
const now = "2026-08-17T10:00:00.000Z";

function loadConsentModule() {
  try {
    return require(path.join(projectRoot, "analytics-consent.js"));
  } catch (error) {
    assert.fail(`analytics consent module must be loadable: ${error.code || error.message}`);
  }
}

class FakeElement {
  constructor() {
    this.async = false;
    this.dataset = {};
    this.hidden = false;
    this.listeners = new Map();
    this.src = "";
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  click() {
    for (const listener of this.listeners.get("click") || []) listener({ currentTarget: this });
  }
}

function createFixture({ storedValue = null, readError = null, writeError = null } = {}) {
  const banner = new FakeElement();
  const acceptButton = new FakeElement();
  const declineButton = new FakeElement();
  const withdrawButton = new FakeElement();
  const scripts = [];
  const values = new Map();
  const navigation = { reloadCount: 0 };
  if (storedValue !== null) values.set(storageKey, storedValue);

  const document = {
    referrer: "https://source.example/",
    head: {
      appendChild(element) {
        scripts.push(element);
        return element;
      },
    },
    createElement(tagName) {
      assert.equal(tagName, "script");
      return new FakeElement();
    },
    querySelector(selector) {
      if (selector === "[data-analytics-consent]") return banner;
      if (selector === "[data-analytics-accept]") return acceptButton;
      if (selector === "[data-analytics-decline]") return declineButton;
      if (selector === "[data-analytics-withdraw]") return withdrawButton;
      if (selector === 'script[data-yandex-metrika="112146684"]') {
        return scripts.find((script) => script.dataset.yandexMetrika === "112146684") || null;
      }
      return null;
    },
  };
  const storage = {
    getItem(key) {
      if (readError) throw readError;
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (writeError) throw writeError;
      values.set(key, value);
    },
  };
  const global = {
    location: {
      href: "https://starlineagency.ru/",
      reload() {
        navigation.reloadCount += 1;
      },
    },
  };

  return { acceptButton, banner, declineButton, document, global, navigation, scripts, storage, values, withdrawButton };
}

function createController(fixture) {
  const { createAnalyticsConsentController } = loadConsentModule();
  return createAnalyticsConsentController({
    document: fixture.document,
    global: fixture.global,
    now: () => now,
    storage: fixture.storage,
  });
}

function queuedMetrikaCalls(global) {
  return (global.ym?.a || []).map((args) => Array.from(args));
}

test("an undecided visitor sees the banner without loading analytics", () => {
  const fixture = createFixture();

  createController(fixture).init();

  assert.equal(fixture.banner.hidden, false);
  assert.equal(fixture.scripts.length, 0);
  assert.equal(fixture.global.ym, undefined);
});

test("the accept action stores evidence and initializes Metrika once", () => {
  const fixture = createFixture();
  const controller = createController(fixture);
  controller.init();

  fixture.acceptButton.click();
  fixture.acceptButton.click();
  controller.init();

  assert.equal(fixture.banner.hidden, true);
  assert.deepEqual(JSON.parse(fixture.values.get(storageKey)), {
    status: "accepted",
    version: consentVersion,
    updatedAt: now,
  });
  assert.equal(fixture.scripts.length, 1);
  assert.equal(fixture.scripts[0].src, "https://mc.yandex.ru/metrika/tag.js?id=112146684");
  assert.equal(fixture.scripts[0].async, true);
  assert.equal(fixture.scripts[0].dataset.yandexMetrika, "112146684");
  assert.deepEqual(queuedMetrikaCalls(fixture.global), [[
    112146684,
    "init",
    {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: "dataLayer",
      referrer: "https://source.example/",
      url: "https://starlineagency.ru/",
      accurateTrackBounce: true,
      trackLinks: true,
    },
  ]]);
});

test("the decline action stores the refusal and never creates Metrika", () => {
  const fixture = createFixture();
  createController(fixture).init();

  fixture.declineButton.click();

  assert.equal(fixture.banner.hidden, true);
  assert.deepEqual(JSON.parse(fixture.values.get(storageKey)), {
    status: "declined",
    version: consentVersion,
    updatedAt: now,
  });
  assert.equal(fixture.scripts.length, 0);
  assert.equal(fixture.global.ym, undefined);
});

test("stored acceptance loads analytics while stored refusal keeps it disabled", () => {
  for (const [status, expectedScripts] of [["accepted", 1], ["declined", 0]]) {
    const fixture = createFixture({
      storedValue: JSON.stringify({ status, version: consentVersion, updatedAt: now }),
    });

    createController(fixture).init();

    assert.equal(fixture.banner.hidden, true, `${status} must hide the decided banner`);
    assert.equal(fixture.scripts.length, expectedScripts, `${status} must control analytics loading`);
  }
});

test("malformed or unreadable consent never enables analytics", () => {
  for (const options of [
    { storedValue: "{not-json" },
    { readError: new Error("storage blocked") },
  ]) {
    const fixture = createFixture(options);

    createController(fixture).init();

    assert.equal(fixture.banner.hidden, false);
    assert.equal(fixture.scripts.length, 0);
    assert.equal(fixture.global.ym, undefined);
  }
});

test("acceptance still applies to the current page when storage writes fail", () => {
  const fixture = createFixture({ writeError: new Error("storage full") });
  createController(fixture).init();

  fixture.acceptButton.click();

  assert.equal(fixture.banner.hidden, true);
  assert.equal(fixture.scripts.length, 1);
  assert.equal(queuedMetrikaCalls(fixture.global).length, 1);
});

test("the withdrawal control stores refusal and reloads into an analytics-free page", () => {
  const fixture = createFixture({
    storedValue: JSON.stringify({ status: "accepted", version: consentVersion, updatedAt: now }),
  });
  createController(fixture).init();
  assert.equal(fixture.scripts.length, 1, "stored acceptance starts the current page with analytics");

  fixture.withdrawButton.click();

  assert.deepEqual(JSON.parse(fixture.values.get(storageKey)), {
    status: "declined",
    version: consentVersion,
    updatedAt: now,
  });
  assert.equal(fixture.navigation.reloadCount, 1);

  const reloadedFixture = createFixture({ storedValue: fixture.values.get(storageKey) });
  createController(reloadedFixture).init();
  assert.equal(reloadedFixture.scripts.length, 0, "the reloaded page must keep analytics disabled");
});
