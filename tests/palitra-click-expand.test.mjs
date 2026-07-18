import assert from "node:assert/strict";
import test from "node:test";

const sourceRect = { left: 120, top: 180, width: 320, height: 180 };
const viewport = { innerWidth: 1440, innerHeight: 900 };

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
    Object.defineProperty(this.values, name, {
      configurable: true,
      enumerable: !name.startsWith("--expand-target"),
      value,
      writable: true,
    });
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

function createFixture({ reducedMotion = false } = {}) {
  assert.equal(typeof setupPalitraClickExpand, "function");
  const scheduler = createScheduler();
  const documentElement = new FakeElement();
  const eventTarget = new FakeElement();
  const trigger = new FakeElement();
  const source = new FakeElement();
  source.rect = { ...sourceRect };
  source.currentSrc = "";
  source.src = "/screens/chat.webp";
  source.alt = "Чат Palitra";
  source.naturalWidth = 1600;
  source.naturalHeight = 900;
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

  return { documentElement, eventTarget, image, layer, scheduler, source, trigger };
}

test("opens from the source bounds and caps the target at 1180px", () => {
  const { documentElement, image, layer, scheduler, trigger } = createFixture();
  trigger.dispatch("click");
  assert.deepEqual(image.styleValues, {
    "--expand-left": "120px",
    "--expand-top": "180px",
    "--expand-width": "320px",
    "--expand-height": "180px",
  });
  scheduler.flushFrames();
  assert.equal(layer.dataset.open, "true");
  assert.equal(image.styleValues["--expand-target-width"], "1180px");
  assert.equal(documentElement.dataset.cascadeExpanded, "true");
  assert.equal(image.focusCount, 1);
});

test("second image click, backdrop, and Escape reverse to the latest source bounds", () => {
  const { eventTarget, image, layer, scheduler, source, trigger } = createFixture();
  trigger.dispatch("click");
  scheduler.flushFrames();
  source.rect = { left: 80, top: 90, width: 280, height: 158 };
  image.dispatch("click");
  assert.equal(image.styleValues["--expand-left"], "80px");
  assert.equal(image.styleValues["--expand-top"], "90px");
  scheduler.flushTimers();
  assert.equal(layer.hidden, true);
  assert.equal(trigger.focusCount, 1);

  trigger.dispatch("click");
  scheduler.flushFrames();
  layer.dispatch("click", { target: layer });
  scheduler.flushTimers();
  assert.equal(layer.hidden, true);

  trigger.dispatch("click");
  scheduler.flushFrames();
  eventTarget.dispatch("keydown", { key: "Escape" });
  scheduler.flushTimers();
  assert.equal(layer.hidden, true);
});

test("reduced motion opens and closes without scheduling travel frames", () => {
  const fixture = createFixture({ reducedMotion: true });
  fixture.trigger.dispatch("click");
  assert.equal(fixture.layer.dataset.open, "true");
  fixture.image.dispatch("click");
  assert.equal(fixture.layer.hidden, true);
  assert.equal(fixture.scheduler.frameCount(), 0);
});
