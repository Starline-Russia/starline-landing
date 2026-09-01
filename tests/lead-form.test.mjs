import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

function loadModule() {
  try {
    return require(path.join(projectRoot, "lead-form.js"));
  } catch (error) {
    assert.fail(`lead-form.js must be loadable: ${error.code || error.message}`);
  }
}

class FakeControl {
  constructor({ value = "", checked = false } = {}) {
    this.value = value;
    this.checked = checked;
    this.disabled = false;
    this.attributes = new Map();
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }
}

class FakeForm {
  constructor(values = {}) {
    this.controls = new Map([
      ["name", new FakeControl({ value: values.name ?? "Антон" })],
      ["contact", new FakeControl({ value: values.contact ?? "anton@example.ru" })],
      ["source", new FakeControl({ value: values.source ?? "ai-contour" })],
      ["website", new FakeControl({ value: values.website ?? "" })],
      ["personal_data_consent", new FakeControl({ value: "2026-08-28", checked: values.consent ?? true })],
    ]);
    this.elements = { namedItem: (name) => this.controls.get(name) || null };
    this.status = { textContent: "", dataset: {} };
    this.submitButton = new FakeControl();
    this.listeners = new Map();
    this.attributes = new Map();
    this.resetCount = 0;
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  getAttribute(name) {
    if (name === "action") return "../send-lead.php";
    if (name === "method") return "post";
    return this.attributes.get(name) || null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  querySelector(selector) {
    if (selector === "[data-form-status]") return this.status;
    if (selector === 'button[type="submit"]') return this.submitButton;
    return null;
  }

  reset() {
    this.resetCount += 1;
  }

  async submit() {
    let prevented = false;
    const event = { preventDefault() { prevented = true; } };
    const result = this.listeners.get("submit")?.(event);
    await result;
    assert.equal(prevented, true, "enhanced submit must prevent native navigation");
  }
}

function response(payload, ok = true) {
  return { ok, async json() { return payload; } };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, reject, resolve };
}

function setup({ values, fetchImpl } = {}) {
  const form = new FakeForm(values);
  const calls = [];
  const fetcher = fetchImpl || (async (...args) => {
    calls.push(args);
    return response({ ok: true, message: "Спасибо! Заявка отправлена. Мы свяжемся с вами." });
  });
  const { createLeadFormController } = loadModule();
  const controller = createLeadFormController({
    document: { querySelectorAll: () => [form] },
    fetchImpl: async (...args) => {
      calls.push(args);
      return fetcher(...args);
    },
    createFormData: (target) => ({ target, values: Object.fromEntries([...target.controls].map(([key, control]) => [key, control.value])) }),
  });
  controller.init();
  return { calls, controller, form };
}

test("enhancement moves validation into the accessible live region", () => {
  const { form } = setup();

  assert.equal(form.attributes.has("novalidate"), true);
});

test("client validation stops empty submissions before the network", async () => {
  const { calls, form } = setup({ values: { name: "   " } });

  await form.submit();

  assert.equal(calls.length, 0);
  assert.equal(form.status.textContent, "Укажите имя и телефон или email.");
  assert.equal(form.controls.get("name").attributes.get("aria-invalid"), "true");
});

test("explicit personal-data consent is required", async () => {
  const { calls, form } = setup({ values: { consent: false } });

  await form.submit();

  assert.equal(calls.length, 0);
  assert.equal(form.status.textContent, "Подтвердите согласие на обработку персональных данных.");
  assert.equal(form.controls.get("personal_data_consent").attributes.get("aria-invalid"), "true");
});

test("pending state blocks a repeated submit and resolves to the approved success message", async () => {
  const pending = deferred();
  const { calls, form } = setup({ fetchImpl: () => pending.promise });

  const first = form.submit();
  await Promise.resolve();
  assert.equal(form.submitButton.disabled, true);
  assert.equal(form.attributes.get("aria-busy"), "true");
  assert.equal(form.status.textContent, "Отправляем заявку…");

  await form.submit();
  assert.equal(calls.length, 1, "a pending form must not make a second request");

  pending.resolve(response({ ok: true, message: "Спасибо! Заявка отправлена. Мы свяжемся с вами." }));
  await first;

  assert.equal(form.status.textContent, "Спасибо! Заявка отправлена. Мы свяжемся с вами.");
  assert.equal(form.status.dataset.state, "success");
  assert.equal(form.resetCount, 1);
  assert.equal(form.submitButton.disabled, false);
  assert.equal(form.attributes.has("aria-busy"), false);
  const [url, options] = calls[0];
  assert.equal(url, "../send-lead.php");
  assert.equal(options.method, "POST");
  assert.equal(options.headers.Accept, "application/json");
  assert.ok(options.body);
});

test("an endpoint rejection keeps the form data and shows its accessible error", async () => {
  const { form } = setup({ fetchImpl: async () => response({ ok: false, message: "Не удалось отправить письмо." }, false) });

  await form.submit();

  assert.equal(form.status.textContent, "Не удалось отправить письмо.");
  assert.equal(form.status.dataset.state, "error");
  assert.equal(form.resetCount, 0);
  assert.equal(form.submitButton.disabled, false);
});

test("a network failure returns the reusable fallback and restores the button", async () => {
  const { form } = setup({ fetchImpl: async () => { throw new Error("offline"); } });

  await form.submit();

  assert.equal(form.status.textContent, "Не удалось отправить заявку. Попробуйте ещё раз или напишите на hi@starlinerussia.ru.");
  assert.equal(form.status.dataset.state, "error");
  assert.equal(form.submitButton.disabled, false);
  assert.equal(form.resetCount, 0);
});
