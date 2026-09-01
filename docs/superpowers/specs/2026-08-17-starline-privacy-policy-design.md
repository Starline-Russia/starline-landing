# Starline Privacy Policy Design

**Date:** 2026-08-17
**Status:** Approved in conversation
**Site:** `starlinerussia.ru`

## Objective

Add one public privacy and personal-data policy that accurately describes the current static Starline v4 site. Link it from the footer and the analytics-consent banner without adding a separate cookie-policy page.

## Confirmed operator details

- Operator: ООО «СЛ Медиа»
- INN: 7715018344
- OGRN: 1027739134686
- Registered address: 115280, г. Москва, вн. тер. г. муниципальный округ Даниловский, ул. Ленинская Слобода, д. 19, этаж 4, ком./офис 21У/4036
- Privacy contact: `hi@starlinerussia.ru`

## Current data map

1. The web server and hosting infrastructure necessarily receive technical request data such as IP address, request date and time, requested URL, referrer, user-agent, and diagnostic information.
2. Yandex Metrica counter `111639949` loads only after active consent. Its current configuration includes Webvisor, clickmap, link tracking, bounce tracking, referrer, and page URL.
3. The contact form is local-only. Its name and contact values are written to `localStorage` under `starline:lead-draft`; they are not sent to ООО «СЛ Медиа» or Yandex. Metrica key and submit masking remain enabled.
4. The analytics choice is stored on the visitor's device under `starline:analytics-consent`, with status, consent version, and timestamp.
5. If a visitor emails `hi@starlinerussia.ru`, ООО «СЛ Медиа» receives the data contained in that message to answer the request.

## Approved experience

- Create `privacy.html` using the existing Starline visual system.
- Add a footer link titled `Политика конфиденциальности` on the landing and policy pages.
- Add a `Подробнее` link in the analytics banner pointing to `privacy.html#analytics`.
- Keep the same consent banner on the policy page so analytics remains consent-gated there too.
- Add an `Отключить аналитику` control in the policy. It records a declined choice and reloads the page, preventing Metrica from loading again.
- Keep all routes static and relative for NIC.RU FTP deployment.

## Policy structure

1. Scope and version.
2. Operator identity and contact details.
3. Categories of processed data and the explicit local-only form distinction.
4. Purposes and legal grounds.
5. Yandex Metrica, Webvisor, cookies, and local storage.
6. Processing conditions, recipients, retention, and deletion.
7. Visitor rights and withdrawal instructions.
8. Security, policy changes, and contact route.

## Legal constraints

- No placeholders may reach production.
- The policy must match actual site behavior and must not claim that the local form submits data.
- Analytics consent remains optional, active, and off by default.
- The policy must name Yandex and link to Yandex's current Metrica terms and privacy policy.
- Any future server-side form submission requires a separate active personal-data consent and its own evidence before release.
- The document is a practical compliance draft and requires final review by the operator's qualified Russian lawyer.

## Acceptance criteria

- `privacy.html` opens locally and has no broken local links.
- Landing footer and analytics banner link to the policy.
- Policy contains the confirmed operator details and no placeholders.
- Policy accurately states that the form draft stays on the device.
- Metrica remains absent before consent on both pages.
- The analytics-disable control stores `declined` and reloads.
- Node tests and the Starline v4 verifier pass.
