# Starline Analytics Consent Design

## Goal

Do not load Yandex Metrika counter `111639949` until the visitor actively permits analytics.

## Approved interface

Show a fixed, non-modal banner with the text:

> Разрешить Яндекс Метрике собирать статистику посещений для улучшения сайта?

Actions:

- `Разрешить` — save consent and load Metrika.
- `Продолжить без аналитики` — save refusal and keep Metrika disabled.

There is no pre-selected checkbox. The visitor can continue using the page while the banner is visible.

## Architecture

`analytics-consent.js` owns consent state and the Yandex loader. It exposes a small controller for Node behavioral tests and initializes itself as a classic browser script. `index.html` contains only the banner and local script reference; it contains neither the remote Metrika loader nor the tracking-pixel fallback.

The choice is stored in `localStorage` under `starline:analytics-consent` as JSON with `status`, `version`, and `updatedAt`. Supported statuses are `accepted` and `declined`; unknown or malformed values are treated as no choice. If storage is unavailable, the current click still takes effect for the current page.

## Data flow

1. With no stored choice, show the banner and make no request to `mc.yandex.ru`.
2. On acceptance, save the versioned record, hide the banner, create the `ym` queue, initialize counter `111639949`, and inject the remote tag once.
3. On refusal, save the versioned record, hide the banner, and do not create or load Metrika.
4. On later visits, accepted state loads Metrika once; declined state keeps it disabled.

The form remains local-only. Add Yandex masking hooks to the form and its two inputs so Webvisor does not record lead-field contents after analytics is permitted.

## Failure handling

- A malformed stored record is ignored and the banner is shown.
- A `localStorage` read or write failure does not load analytics implicitly.
- Repeated initialization or clicks cannot inject or initialize the counter more than once.
- The page remains readable and usable if JavaScript is unavailable; analytics stays off.

## Verification

Behavioral tests cover unset, accepted, declined, malformed, unavailable-storage, and duplicate-loading states. Static tests verify the approved copy, both actions, the absence of eager remote tracking, and masking hooks. The Starline v4 verifier and local HTTP smoke check remain required.

## Residual legal risk

This is a practical consent gate, not a complete legal pack. Before production use, a qualified Russian lawyer should confirm the final privacy/cookie policy, operator details, legal basis, retention periods, cross-border-transfer disclosures, and the current Yandex Metrika configuration.
