# Starline Analytics Consent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate Yandex Metrika counter `111639949` behind explicit visitor consent without changing the Starline v4 page structure or local-only lead flow.

**Architecture:** A dedicated dependency-free `analytics-consent.js` controller reads and writes a versioned local choice, owns the only remote Metrika injection path, and auto-initializes in the browser. Static HTML contains the accessible banner; Node tests exercise controller behavior through injected DOM and storage dependencies.

**Tech Stack:** Semantic HTML, ordinary CSS, classic dependency-free browser JavaScript, Node test runner.

## Global Constraints

- Metrika must not load or initialize before active consent.
- The exact banner copy is `Разрешить Яндекс Метрике собирать статистику посещений для улучшения сайта?`.
- Buttons are `Разрешить` and `Продолжить без аналитики`.
- Preserve all existing Starline v4 sections, local-only form behavior, assets, and responsive contracts.
- Do not add fetch/XHR, dependencies, a production form submission, or publishing.

---

### Task 1: Consent controller contract

**Files:**
- Create: `tests/analytics-consent.test.mjs`
- Create: `analytics-consent.js`

**Interfaces:**
- Consumes: injected `{ document, storage, global, now }` browser dependencies.
- Produces: `createAnalyticsConsentController(options)` with `init()`, `accept()`, `decline()`, and `loadMetrika()` methods.

- [ ] **Step 1: Write failing behavioral tests**

Cover unset state, stored acceptance, stored refusal, active acceptance, active refusal, malformed storage, unavailable storage, and duplicate initialization. Assert visible banner state, stored literal records, appended script URLs, and real `ym` queue entries.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/analytics-consent.test.mjs`

Expected: failure because `analytics-consent.js` does not exist.

- [ ] **Step 3: Implement the minimal controller**

Use storage key `starline:analytics-consent`, version `analytics-consent-v1`, counter `111639949`, and loader URL `https://mc.yandex.ru/metrika/tag.js?id=111639949`. Ignore malformed states, catch storage failures, and guard Metrika initialization from duplication.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/analytics-consent.test.mjs`

Expected: all consent-controller tests pass.

### Task 2: Banner markup, privacy masking, and styling

**Files:**
- Modify: `tests/metrika.test.mjs`
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `analytics-consent.js` selectors `[data-analytics-consent]`, `[data-analytics-accept]`, and `[data-analytics-decline]`.
- Produces: accessible fixed banner and form masking hooks.

- [ ] **Step 1: Replace the eager-loader static test with the consent-gate contract**

Assert that HTML has the exact question and both buttons, references `analytics-consent.js`, has no inline Metrika loader or tracking pixel, and marks the form with `ym-disable-submit` plus both inputs with `ym-disable-keys`.

- [ ] **Step 2: Run the static test and verify RED**

Run: `node --test tests/metrika.test.mjs`

Expected: failure because the eager loader and tracking pixel still exist and the banner is absent.

- [ ] **Step 3: Apply the smallest HTML and CSS patch**

Remove the head loader and body tracking pixel, add the banner after `.page`, add the local consent script, add masking classes, and style desktop/mobile/focus states using existing Starline tokens.

- [ ] **Step 4: Run both focused tests and verify GREEN**

Run: `node --test tests/metrika.test.mjs tests/analytics-consent.test.mjs`

Expected: all focused tests pass.

### Task 3: Regression and local verification

**Files:**
- Verify: all modified runtime and test files.

**Interfaces:**
- Consumes: completed consent gate.
- Produces: verification evidence only; no publishing.

- [ ] **Step 1: Run the full Node suite**

Run: `node --test tests/*.test.mjs`

Expected: consent tests pass; report any pre-existing unrelated failure separately.

- [ ] **Step 2: Run the Starline v4 verifier**

Run: `bash /Users/papenov/.codex/skills/starline-landing-v4/scripts/verify-v4.sh "$PWD"`

Expected: verifier passes or identifies a baseline-contract mismatch with exact evidence.

- [ ] **Step 3: Run syntax and diff checks**

Run: `node --check analytics-consent.js && git diff --check`

Expected: exit code `0`.

- [ ] **Step 4: Serve and smoke-test through localhost**

Start a local static server, verify `index.html`, `styles.css`, `analytics-consent.js`, and existing scripts return HTTP `200`, then stop the server.
