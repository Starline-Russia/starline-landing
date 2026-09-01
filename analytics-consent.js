(function initAnalyticsConsentModule(globalScope) {
  const counterId = 112146684;
  const storageKey = "starline:analytics-consent";
  const consentVersion = "analytics-consent-v1";
  const loaderUrl = "https://mc.yandex.ru/metrika/tag.js?id=112146684";

  function createAnalyticsConsentController(options) {
    const document = options.document;
    const storage = options.storage;
    const global = options.global;
    const now = options.now;
    const banner = document.querySelector("[data-analytics-consent]");
    const acceptButton = document.querySelector("[data-analytics-accept]");
    const declineButton = document.querySelector("[data-analytics-decline]");
    const withdrawButton = document.querySelector("[data-analytics-withdraw]");
    let listenersBound = false;
    let metrikaLoaded = false;

    function readChoice() {
      if (!storage) return null;

      try {
        const saved = JSON.parse(storage.getItem(storageKey));
        if (saved?.version !== consentVersion) return null;
        if (saved.status !== "accepted" && saved.status !== "declined") return null;
        return saved.status;
      } catch (error) {
        return null;
      }
    }

    function saveChoice(status) {
      if (!storage) return;

      try {
        storage.setItem(storageKey, JSON.stringify({
          status,
          version: consentVersion,
          updatedAt: now(),
        }));
      } catch (error) {
        // The current choice still applies even when storage is unavailable.
      }
    }

    function hideBanner() {
      if (banner) banner.hidden = true;
    }

    function showBanner() {
      if (banner) banner.hidden = false;
    }

    function loadMetrika() {
      if (metrikaLoaded) return;
      if (document.querySelector('script[data-yandex-metrika="112146684"]')) {
        metrikaLoaded = true;
        return;
      }

      metrikaLoaded = true;
      global.ym = global.ym || function () {
        (global.ym.a = global.ym.a || []).push(arguments);
      };
      global.ym.l = Date.now();
      global.ym(counterId, "init", {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        referrer: document.referrer || "",
        url: global.location?.href || "",
        accurateTrackBounce: true,
        trackLinks: true,
      });

      const script = document.createElement("script");
      script.async = true;
      script.src = loaderUrl;
      script.dataset.yandexMetrika = String(counterId);
      document.head.appendChild(script);
    }

    function accept() {
      saveChoice("accepted");
      hideBanner();
      loadMetrika();
    }

    function decline() {
      saveChoice("declined");
      hideBanner();
    }

    function withdraw() {
      saveChoice("declined");
      hideBanner();
      global.location?.reload?.();
    }

    function init() {
      if (!listenersBound) {
        acceptButton?.addEventListener("click", accept);
        declineButton?.addEventListener("click", decline);
        withdrawButton?.addEventListener("click", withdraw);
        listenersBound = true;
      }

      const choice = readChoice();
      if (choice === "accepted") {
        hideBanner();
        loadMetrika();
      } else if (choice === "declined") {
        hideBanner();
      } else {
        showBanner();
      }
    }

    return { accept, decline, init, loadMetrika, withdraw };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createAnalyticsConsentController };
  }

  if (globalScope && globalScope.document) {
    let storage = null;
    try {
      storage = globalScope.localStorage;
    } catch (error) {
      storage = null;
    }

    createAnalyticsConsentController({
      document: globalScope.document,
      global: globalScope,
      now: function () { return new Date().toISOString(); },
      storage,
    }).init();
  }
})(typeof window !== "undefined" ? window : globalThis);
