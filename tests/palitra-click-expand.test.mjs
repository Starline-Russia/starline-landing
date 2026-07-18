import assert from "node:assert/strict";
import test from "node:test";

const sourceRect = { left: 120, top: 180, width: 320, height: 180 };

let setupPalitraClickExpand;
try {
  ({ setupPalitraClickExpand } = await import("../v3/src/scripts/palitra-click-expand.js"));
} catch {
  setupPalitraClickExpand = undefined;
}

class FakeStyle {
  constructor() {
    this.values = {};
  }

  setProperty(name, value) {
    this.values[name] = value;
  }

  removeProperty(name) {
    delete this.values[name];
  }
}

class FakeElement {
  constructor() {
    this.attributes = new Map();
    this.children = [];
    this.dataset = {};
    this.focusCount = 0;
    this.hidden = false;
    this.listeners = new Map();
    this.style = new FakeStyle();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  append(...children) {
    this.children.push(...children);
  }

  dispatch(type, event = {}) {
    const dispatchedEvent = {
      preventDefault() {},
      target: this,
      ...event,
    };
    for (const listener of this.listeners.get(type) ?? []) listener(dispatchedEvent);
  }

  focus() {
    this.focusCount += 1;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "data-expanded") delete this.dataset.expanded;
    if (name === "data-open") delete this.dataset.open;
    if (name === "src") this.src = "";
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
}

function createScheduler() {
  let nextId = 1;
  const frames = new Map();
  const timers = new Map();

  return {
    requestAnimationFrame(callback) {
      const id = nextId++;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
    },
    setTimeout(callback) {
      const id = nextId++;
      timers.set(id, callback);
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    flushFrames() {
      for (const [id, callback] of [...frames]) {
        frames.delete(id);
        callback();
      }
    },
    flushTimers() {
      for (const [id, callback] of [...timers]) {
        timers.delete(id);
        callback();
      }
    },
    frameCount() {
      return frames.size;
    },
  };
}

function createFixture({
  innerHeight = 900,
  innerWidth = 1440,
  naturalHeight = 900,
  naturalWidth = 1600,
  reducedMotion = false,
} = {}) {
  assert.equal(typeof setupPalitraClickExpand, "function");
  const scheduler = createScheduler();
  const documentElement = new FakeElement();
  const eventTarget = new FakeElement();
  const viewport = new FakeElement();
  viewport.innerWidth = innerWidth;
  viewport.innerHeight = innerHeight;
  viewport.visualViewport = new FakeElement();
  viewport.visualViewport.width = innerWidth;
  viewport.visualViewport.height = innerHeight;
  viewport.visualViewport.offsetLeft = 0;
  viewport.visualViewport.offsetTop = 0;
  const trigger = new FakeElement();
  const source = new FakeElement();
  source.rect = { ...sourceRect };
  source.currentSrc = "";
  source.src = "/screens/chat.webp";
  source.alt = "Чат Palitra";
  source.naturalWidth = naturalWidth;
  source.naturalHeight = naturalHeight;
  source.clientWidth = 320;
  source.clientHeight = 180;
  trigger.querySelector = () => source;

  const layer = new FakeElement();
  layer.hidden = true;
  const image = new FakeElement();
  Object.defineProperty(image, "styleValues", {
    get() {
      return image.style.values;
    },
  });

  const scene = new FakeElement();
  scene.querySelectorAll = () => [trigger];
  scene.querySelector = (selector) => ({
    "[data-cascade-expand-layer]": layer,
    "[data-cascade-expand-image]": image,
  })[selector] ?? null;

  setupPalitraClickExpand(scene, {
    documentElement,
    eventTarget,
    motionQuery: { matches: reducedMotion },
    viewport,
    ...scheduler,
  });

  return { documentElement, eventTarget, image, layer, scheduler, source, trigger, viewport };
}

test("opens from the source bounds and caps the target at 1180px", () => {
  const { documentElement, image, layer, scheduler, trigger } = createFixture();
  trigger.dispatch("click");
  assert.deepEqual(image.styleValues, {
    "--expand-left": "120px",
    "--expand-top": "180px",
    "--expand-width": "320px",
    "--expand-height": "180px",
    "--expand-target-left": "130px",
    "--expand-target-top": "118.125px",
    "--expand-target-width": "1180px",
    "--expand-target-height": "663.75px",
  });
  scheduler.flushFrames();
  assert.equal(layer.dataset.open, "true");
  assert.equal(image.styleValues["--expand-target-width"], "1180px");
  assert.equal(documentElement.dataset.cascadeExpanded, "true");
  assert.equal(image.focusCount, 1);
  assert.equal(image.src, "/screens/chat.webp");
  assert.equal(image.alt, "Чат Palitra");
});

function assertTargetRect(image, expected) {
  for (const [property, value] of Object.entries(expected)) {
    const actual = Number.parseFloat(image.styleValues[`--expand-target-${property}`]);
    assert.ok(Math.abs(actual - value) < 1e-9, `${property}: expected ${value}, received ${actual}`);
  }
  const width = Number.parseFloat(image.styleValues["--expand-target-width"]);
  const height = Number.parseFloat(image.styleValues["--expand-target-height"]);
  return { height, width };
}

test("recomputes a height-capped portrait target after window and visual viewport resize", () => {
  const fixture = createFixture({
    innerHeight: 500,
    innerWidth: 390,
    naturalHeight: 1600,
    naturalWidth: 900,
  });

  fixture.trigger.dispatch("click");
  let target = assertTargetRect(fixture.image, {
    left: 65.625,
    top: 20,
    width: 258.75,
    height: 460,
  });
  assert.equal(target.width / target.height, 900 / 1600);

  fixture.viewport.innerWidth = 844;
  fixture.viewport.innerHeight = 390;
  fixture.viewport.visualViewport.width = 844;
  fixture.viewport.visualViewport.height = 390;
  fixture.viewport.dispatch("resize");
  target = assertTargetRect(fixture.image, {
    left: 331.3025,
    top: 33.76,
    width: 181.395,
    height: 322.48,
  });
  assert.ok(Math.abs(target.width / target.height - 900 / 1600) < 1e-12);

  fixture.viewport.visualViewport.width = 780;
  fixture.viewport.visualViewport.height = 360;
  fixture.viewport.visualViewport.offsetLeft = 12;
  fixture.viewport.visualViewport.offsetTop = 8;
  fixture.viewport.visualViewport.dispatch("resize");
  target = assertTargetRect(fixture.image, {
    left: 318.3,
    top: 39.2,
    width: 167.4,
    height: 297.6,
  });
  assert.ok(Math.abs(target.width / target.height - 900 / 1600) < 1e-12);
});

test("image click, backdrop, and Escape reverse, retain scroll lock, and return focus", () => {
  const { documentElement, eventTarget, image, layer, scheduler, source, trigger } = createFixture();
  trigger.dispatch("click");
  scheduler.flushFrames();
  source.rect = { left: 80, top: 90, width: 280, height: 158 };
  image.dispatch("click");
  assert.equal(image.styleValues["--expand-left"], "80px");
  assert.equal(image.styleValues["--expand-top"], "90px");
  assert.equal(documentElement.dataset.cascadeExpanded, "true");
  assert.equal(layer.hidden, false);
  assert.equal(image.src, "/screens/chat.webp");
  scheduler.flushTimers();
  assert.equal(layer.hidden, true);
  assert.equal(documentElement.dataset.cascadeExpanded, undefined);
  assert.equal(image.src, "");
  assert.equal(trigger.focusCount, 1);

  trigger.dispatch("click");
  scheduler.flushFrames();
  layer.dispatch("click", { target: layer });
  assert.equal(documentElement.dataset.cascadeExpanded, "true");
  scheduler.flushTimers();
  assert.equal(layer.hidden, true);
  assert.equal(documentElement.dataset.cascadeExpanded, undefined);
  assert.equal(trigger.focusCount, 2);

  trigger.dispatch("click");
  scheduler.flushFrames();
  eventTarget.dispatch("keydown", { key: "Escape" });
  assert.equal(documentElement.dataset.cascadeExpanded, "true");
  scheduler.flushTimers();
  assert.equal(layer.hidden, true);
  assert.equal(documentElement.dataset.cascadeExpanded, undefined);
  assert.equal(trigger.focusCount, 3);
});

test("Tab remains inside the expanded dialog", () => {
  const { eventTarget, image, scheduler, trigger } = createFixture();
  let preventDefaultCount = 0;
  trigger.dispatch("click");
  scheduler.flushFrames();

  eventTarget.dispatch("keydown", {
    key: "Tab",
    preventDefault() {
      preventDefaultCount += 1;
    },
  });

  assert.equal(preventDefaultCount, 1);
  assert.equal(image.focusCount, 2);
});

test("Escape before the open frame cannot reopen the layer", () => {
  const { documentElement, eventTarget, image, layer, scheduler, trigger } = createFixture();
  trigger.dispatch("click");
  eventTarget.dispatch("keydown", { key: "Escape" });

  scheduler.flushFrames();
  assert.equal(layer.dataset.open, undefined);
  assert.equal(image.dataset.expanded, undefined);
  assert.equal(documentElement.dataset.cascadeExpanded, "true");
  scheduler.flushTimers();
  assert.equal(layer.hidden, true);
  assert.equal(documentElement.dataset.cascadeExpanded, undefined);
  assert.equal(trigger.focusCount, 1);
});

test("reopening before the close timer cancels the stale close", () => {
  const { documentElement, image, layer, scheduler, trigger } = createFixture();
  trigger.dispatch("click");
  scheduler.flushFrames();
  image.dispatch("click");
  trigger.dispatch("click");
  scheduler.flushFrames();
  scheduler.flushTimers();

  assert.equal(layer.hidden, false);
  assert.equal(layer.dataset.open, "true");
  assert.equal(image.dataset.expanded, "true");
  assert.equal(documentElement.dataset.cascadeExpanded, "true");
  assert.equal(image.src, "/screens/chat.webp");
});

test("reduced motion opens and closes without scheduling travel frames", () => {
  const fixture = createFixture({ reducedMotion: true });
  fixture.trigger.dispatch("click");
  assert.equal(fixture.layer.dataset.open, "true");
  fixture.image.dispatch("click");
  assert.equal(fixture.layer.hidden, true);
  assert.equal(fixture.documentElement.dataset.cascadeExpanded, undefined);
  assert.equal(fixture.image.src, "");
  assert.equal(fixture.trigger.focusCount, 1);
  assert.equal(fixture.scheduler.frameCount(), 0);
});
