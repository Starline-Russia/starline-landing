# Starline Privacy Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a static Starline privacy policy, link it from the landing and analytics banner, and give visitors a working analytics-withdrawal control.

**Architecture:** Add one dependency-free `privacy.html` page that reuses `styles.css` and `analytics-consent.js`. Extend the existing consent controller with one optional withdrawal button; keep all site routes relative so the Cyberduck/NIC.RU deployment remains a plain file upload.

**Tech Stack:** Static HTML5, existing CSS, browser JavaScript, Node.js built-in test runner.

## Global Constraints

- Operator: ООО «СЛ Медиа», ИНН 7715018344, ОГРН 1027739134686.
- Registered address: 115280, г. Москва, вн. тер. г. муниципальный округ Даниловский, ул. Ленинская Слобода, д. 19, этаж 4, ком./офис 21У/4036.
- Privacy contact: `hi@starlinerussia.ru`.
- Yandex Metrica counter `111639949` must never load before active consent.
- Contact-form fields remain local-only and excluded from Metrica capture.
- No placeholders, new dependencies, server endpoints, payments, newsletters, or advertising consent.
- Preserve unrelated user changes in the dirty worktree; do not commit without an explicit request.

---

### Task 1: Static policy route and link contracts

**Files:**
- Create: `tests/privacy.test.mjs`
- Create: `privacy.html`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: existing `styles.css`, `analytics-consent.js`, logo asset, and relative root routes.
- Produces: `privacy.html`, `privacy.html#analytics`, footer policy links, and banner detail links.

- [ ] **Step 1: Write the failing route test**

Create a Node test that reads `index.html` and `privacy.html`, checks that each local `href` resolves to an existing file and anchor, and verifies that both the landing footer and analytics banner expose the policy route. The test must fail first because `privacy.html` does not exist.

- [ ] **Step 2: Verify the test fails for the missing route**

Run: `node --test tests/privacy.test.mjs`
Expected: FAIL because `privacy.html` cannot be read or resolved.

- [ ] **Step 3: Add the minimal static policy and navigation**

Create `privacy.html` with the confirmed operator details, the real data map from the design, the Yandex links, `id="analytics"`, and the same consent banner. Add `Политика конфиденциальности` to the landing footer and `Подробнее` to its banner. Add focused `.legal-*`, footer-link, and banner-link styles with responsive rules; bump the stylesheet query string on both pages to `privacy-v1`.

- [ ] **Step 4: Verify the route contract passes**

Run: `node --test tests/privacy.test.mjs`
Expected: PASS with all referenced local files and anchors present.

### Task 2: Analytics withdrawal behavior

**Files:**
- Modify: `tests/analytics-consent.test.mjs`
- Modify: `analytics-consent.js`
- Modify: `privacy.html`

**Interfaces:**
- Consumes: storage key `starline:analytics-consent`, consent version `analytics-consent-v1`, and optional selector `[data-analytics-withdraw]`.
- Produces: controller method `withdraw()` that stores `declined`, hides the banner, and calls `location.reload()` when available.

- [ ] **Step 1: Write the failing withdrawal test**

Extend the real controller fixture with a withdrawal button and reload counter. Assert that clicking the button stores this literal evidence and reloads once:

```js
{
  status: "declined",
  version: "analytics-consent-v1",
  updatedAt: "2026-08-17T10:00:00.000Z"
}
```

- [ ] **Step 2: Verify the test fails for the missing listener**

Run: `node --test tests/analytics-consent.test.mjs`
Expected: FAIL because the withdrawal button has no click handler and no reload occurs.

- [ ] **Step 3: Implement the minimal withdrawal handler**

Query `[data-analytics-withdraw]`, bind it once in `init()`, and implement `withdraw()` as:

```js
function withdraw() {
  saveChoice("declined");
  hideBanner();
  global.location?.reload?.();
}
```

Expose `withdraw` in the controller return object. Place a button with the selector in the policy analytics section.

- [ ] **Step 4: Verify withdrawal and existing consent branches**

Run: `node --test tests/analytics-consent.test.mjs tests/metrika.test.mjs`
Expected: PASS; acceptance still loads one Metrica script, decline and withdrawal do not enable it on the reloaded page.

### Task 3: Full verification and deployment inventory

**Files:**
- Verify: all changed runtime files and tests

**Interfaces:**
- Consumes: completed static route and consent behavior.
- Produces: a verified upload list for Cyberduck and evidence for the final handoff.

- [ ] **Step 1: Scan production files for placeholders and risky consent states**

Run:

```bash
rg '\[(OPERATOR|EMAIL|DOMAIN|INN|ADDRESS|PRODUCT|PRICE)\]|_____|TODO|FIXME|defaultChecked|checked=""' index.html privacy.html analytics-consent.js styles.css
```

Expected: no matches.

- [ ] **Step 2: Run all project tests**

Run: `node --test tests/*.test.mjs`
Expected: all tests pass with no warnings.

- [ ] **Step 3: Run the Starline v4 verifier**

Run: `bash /Users/papenov/.codex/skills/starline-landing-v4/scripts/verify-v4.sh /Users/papenov/Documents/Codex/open-design/.od/projects/80bf89b3-304b-4a4c-a52b-3886c3d205b6`
Expected: all 19 Starline v4 checks pass.

- [ ] **Step 4: Browser-check desktop and mobile**

Serve the project locally and inspect `/`, `/privacy.html`, `privacy.html#analytics`, footer links, focus states, consent choices, withdrawal reload, horizontal overflow, and the absence of Yandex requests before consent at desktop and 390px mobile widths.

- [ ] **Step 5: Report the exact Cyberduck upload set**

Report these runtime files as the minimal upload set:

```text
index.html
privacy.html
styles.css
analytics-consent.js
```

Also state that `app.js`, `palitra-cascade.js`, and assets do not need re-uploading unless the server copy differs from the already verified deployment.
