(function initAiContourModule(globalScope) {
  function createMaskingDemoController(options) {
    const document = options.document;

    function setupDemo(root) {
      const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
      const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
      if (!tabs.length || tabs.length !== panels.length) return;

      function activate(index, moveFocus) {
        tabs.forEach((tab, tabIndex) => {
          const active = tabIndex === index;
          tab.setAttribute("aria-selected", String(active));
          tab.tabIndex = active ? 0 : -1;
          panels[tabIndex].hidden = !active;
        });

        if (moveFocus) {
          try {
            tabs[index].focus({ preventScroll: true });
          } catch (error) {
            tabs[index].focus();
          }
        }
      }

      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activate(index, false));
        tab.addEventListener("keydown", (event) => {
          let nextIndex = null;
          if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
          if (event.key === "Home") nextIndex = 0;
          if (event.key === "End") nextIndex = tabs.length - 1;
          if (nextIndex === null) return;
          event.preventDefault();
          activate(nextIndex, true);
        });
      });

      root.dataset.enhanced = "true";
      const selectedIndex = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));
      activate(selectedIndex, false);
    }

    function init() {
      for (const root of document.querySelectorAll("[data-mask-demo]")) setupDemo(root);
    }

    return { init, setupDemo };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createMaskingDemoController };
  }

  if (globalScope && globalScope.document) {
    createMaskingDemoController({ document: globalScope.document }).init();
  }
})(typeof window !== "undefined" ? window : globalThis);
