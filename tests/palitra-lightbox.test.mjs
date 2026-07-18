import assert from "node:assert/strict";
import test from "node:test";

let setupPalitraLightbox;
try {
  ({ setupPalitraLightbox } = await import("../v3/src/scripts/palitra-lightbox.js"));
} catch {
  setupPalitraLightbox = undefined;
}

class FakeElement {
  constructor() {
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.hidden = false;
    this.focusCount = 0;
    this.src = "";
    this.alt = "";
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type, event = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener({ target: this, ...event });
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "data-open") delete this.dataset.open;
    if (name === "src") this.src = "";
  }

  focus() {
    this.focusCount += 1;
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
  };
}

function createFixture() {
  const scheduler = createScheduler();
  const documentElement = new FakeElement();
  const eventTarget = new FakeElement();
  const trigger = new FakeElement();
  const source = new FakeElement();
  source.currentSrc = "";
  source.src = "/screens/chat.webp";
  source.alt = "Чат Palitra";
  trigger.querySelector = () => source;
  const lightbox = new FakeElement();
  lightbox.hidden = true;
  const lightboxImage = new FakeElement();
  const closeButton = new FakeElement();
  const scene = new FakeElement();
  scene.querySelectorAll = () => [trigger];
  scene.querySelector = (selector) => ({
    "[data-cascade-lightbox]": lightbox,
    "[data-cascade-lightbox-image]": lightboxImage,
    "[data-cascade-lightbox-close]": closeButton,
  })[selector] ?? null;

  setupPalitraLightbox(scene, {
    documentElement,
    eventTarget,
    motionQuery: { matches: false },
    ...scheduler,
  });

  return { closeButton, documentElement, eventTarget, lightbox, lightboxImage, scheduler, trigger };
}

test("lightbox cancels a pending open frame when Escape closes immediately", () => {
  assert.equal(typeof setupPalitraLightbox, "function");
  const { documentElement, eventTarget, lightbox, lightboxImage, scheduler, trigger } = createFixture();

  trigger.dispatch("click");
  assert.equal(documentElement.dataset.lightboxOpen, "true");
  assert.equal(lightboxImage.src, "/screens/chat.webp");

  eventTarget.dispatch("keydown", { key: "Escape" });
  scheduler.flushFrames();

  assert.equal(documentElement.dataset.lightboxOpen, undefined);
  assert.equal(lightbox.dataset.open, undefined);
  assert.equal(lightbox.hidden, false);

  scheduler.flushTimers();
  assert.equal(lightbox.hidden, true);
  assert.equal(lightboxImage.src, "");
  assert.equal(trigger.focusCount, 1);
});

test("lightbox routes close button and backdrop through the delayed close lifecycle", () => {
  assert.equal(typeof setupPalitraLightbox, "function");
  const { closeButton, documentElement, lightbox, lightboxImage, scheduler, trigger } = createFixture();

  trigger.dispatch("click");
  scheduler.flushFrames();
  assert.equal(closeButton.focusCount, 1);
  assert.equal(documentElement.dataset.lightboxOpen, "true");
  assert.equal(lightbox.dataset.open, "true");

  closeButton.dispatch("click");
  assert.equal(documentElement.dataset.lightboxOpen, undefined);
  assert.equal(lightbox.hidden, false);
  scheduler.flushTimers();
  assert.equal(lightbox.hidden, true);
  assert.equal(trigger.focusCount, 1);

  trigger.dispatch("click");
  scheduler.flushFrames();
  lightbox.dispatch("click", { target: lightbox });
  scheduler.flushTimers();
  assert.equal(lightbox.hidden, true);
  assert.equal(lightboxImage.src, "");
  assert.equal(trigger.focusCount, 2);
});

test("lightbox clears a pending close timer before reopening", () => {
  assert.equal(typeof setupPalitraLightbox, "function");
  const { closeButton, documentElement, lightbox, scheduler, trigger } = createFixture();

  trigger.dispatch("click");
  scheduler.flushFrames();
  closeButton.dispatch("click");
  trigger.dispatch("click");
  scheduler.flushFrames();
  scheduler.flushTimers();

  assert.equal(documentElement.dataset.lightboxOpen, "true");
  assert.equal(lightbox.dataset.open, "true");
  assert.equal(lightbox.hidden, false);
});
