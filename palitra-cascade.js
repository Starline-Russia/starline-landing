(function initPalitraModule(global) {
  function setupPalitraClickExpand(scene, options) {
    const {
      documentElement,
      eventTarget,
      motionQuery,
      viewport,
      requestAnimationFrame,
      cancelAnimationFrame,
      setTimeout,
      clearTimeout,
    } = options;
    const triggers = Array.from(scene.querySelectorAll("[data-cascade-expand-trigger]"));
    const expandLayer = scene.querySelector("[data-cascade-expand-layer]");
    const expandImage = scene.querySelector("[data-cascade-expand-image]");
    let activeTrigger = null;
    let activeSource = null;
    let animationFrame = 0;
    let closeTimer = 0;
    let isClosing = false;

    const clearPending = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (closeTimer) clearTimeout(closeTimer);
      animationFrame = 0;
      closeTimer = 0;
      isClosing = false;
    };

    const setRect = (prefix, rect) => {
      expandImage?.style.setProperty(`${prefix}-left`, `${rect.left}px`);
      expandImage?.style.setProperty(`${prefix}-top`, `${rect.top}px`);
      expandImage?.style.setProperty(`${prefix}-width`, `${rect.width}px`);
      expandImage?.style.setProperty(`${prefix}-height`, `${rect.height}px`);
    };

    const getViewportBounds = () => {
      const visualViewport = viewport.visualViewport;
      return {
        height: visualViewport?.height ?? viewport.innerHeight,
        left: visualViewport?.offsetLeft ?? 0,
        top: visualViewport?.offsetTop ?? 0,
        width: visualViewport?.width ?? viewport.innerWidth,
      };
    };

    const getTargetRect = (source) => {
      const viewportBounds = getViewportBounds();
      const ratio = source.naturalWidth / source.naturalHeight || source.clientWidth / source.clientHeight;
      const margin = Math.max(20, Math.min(56, viewportBounds.width * 0.04));
      const maxWidth = Math.min(1180, viewportBounds.width - margin * 2);
      const maxHeight = viewportBounds.height - margin * 2;
      const width = Math.min(maxWidth, maxHeight * ratio);
      const height = width / ratio;
      return {
        left: viewportBounds.left + (viewportBounds.width - width) / 2,
        top: viewportBounds.top + (viewportBounds.height - height) / 2,
        width,
        height,
      };
    };

    const updateTargetRect = () => {
      if (!expandLayer || expandLayer.hidden || !activeSource) return;
      setRect("--expand-target", getTargetRect(activeSource));
    };

    const finishClose = () => {
      if (!isClosing) return;
      isClosing = false;
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = 0;
      expandLayer.hidden = true;
      expandImage.removeAttribute("src");
      expandImage.removeAttribute("data-expanded");
      delete documentElement.dataset.cascadeExpanded;
      activeTrigger?.focus();
      activeTrigger = null;
      activeSource = null;
    };

    const closeExpanded = () => {
      if (!expandLayer || expandLayer.hidden || !expandImage || !activeSource) return;
      clearPending();
      isClosing = true;
      setRect("--expand", activeSource.getBoundingClientRect());
      expandLayer.removeAttribute("data-open");
      expandImage.removeAttribute("data-expanded");
      if (motionQuery.matches) finishClose();
      else closeTimer = setTimeout(finishClose, 450);
    };

    const openExpanded = (trigger) => {
      const source = trigger.querySelector(".palitra-cascade-screen");
      if (!expandLayer || !expandImage || !source) return;
      clearPending();
      activeTrigger = trigger;
      activeSource = source;
      expandImage.src = source.currentSrc || source.src;
      expandImage.alt = source.alt;
      setRect("--expand", source.getBoundingClientRect());
      setRect("--expand-target", getTargetRect(source));
      expandLayer.hidden = false;
      documentElement.dataset.cascadeExpanded = "true";
      if (motionQuery.matches) {
        expandLayer.dataset.open = "true";
        expandImage.dataset.expanded = "true";
        expandImage.focus();
        return;
      }
      animationFrame = requestAnimationFrame(() => {
        animationFrame = 0;
        if (expandLayer.hidden || isClosing) return;
        animationFrame = requestAnimationFrame(() => {
          animationFrame = 0;
          if (expandLayer.hidden || isClosing) return;
          expandLayer.dataset.open = "true";
          expandImage.dataset.expanded = "true";
          expandImage.focus();
        });
      });
    };

    triggers.forEach((trigger) => trigger.addEventListener("click", () => openExpanded(trigger)));
    expandImage?.addEventListener("click", closeExpanded);
    expandImage?.addEventListener("transitionend", (event) => {
      if (event.target === expandImage) finishClose();
    });
    expandLayer?.addEventListener("click", (event) => {
      if (event.target === expandLayer) closeExpanded();
    });
    viewport.addEventListener("resize", updateTargetRect, { passive: true });
    viewport.visualViewport?.addEventListener("resize", updateTargetRect, { passive: true });
    eventTarget.addEventListener("keydown", (event) => {
      if (!expandLayer || expandLayer.hidden) return;
      if (event.key === "Escape") closeExpanded();
      if (event.key === "Tab") {
        event.preventDefault();
        expandImage?.focus();
      }
    });

    return { closeExpanded, openExpanded };
  }

  function setupPalitraScrollCascade(documentElement, viewport) {
    const cascadeMotionQuery = viewport.matchMedia("(prefers-reduced-motion: reduce)");
    const cascadeDesktopQuery = viewport.matchMedia("(min-width: 641px)");
    const cascadeScenes = Array.from(documentElement.querySelectorAll("[data-palitra-cascade]"));
    const cascadeFinalScale = 0.2;
    const cascadeEdgeGap = 16;

    for (const scene of cascadeScenes) {
      const stage = scene.querySelector("[data-palitra-cascade-stage]");
      const copy = scene.querySelector("[data-palitra-cascade-copy]");
      const screensCanvas = scene.querySelector(".palitra-cascade-screens");
      const screens = Array.from(scene.querySelectorAll("[data-cascade-screen]"));
      let frame = 0;

      const render = () => {
        frame = 0;
        const enabled = !cascadeMotionQuery.matches && cascadeDesktopQuery.matches;
        if (!stage || !copy || !screensCanvas || !enabled) {
          scene.removeAttribute("data-cascade-ready");
          return;
        }

        scene.dataset.cascadeReady = "true";
        const bounds = scene.getBoundingClientRect();
        const travel = Math.max(scene.offsetHeight - viewport.innerHeight, 1);
        const progress = Math.min(1, Math.max(0, -bounds.top / travel));
        const copyHalfWidth = copy.clientWidth / 2;
        const copyHalfHeight = copy.clientHeight / 2;
        const canvasHalfWidth = screensCanvas.clientWidth / 2;
        const canvasHalfHeight = screensCanvas.clientHeight / 2;

        screens.forEach((screen, index) => {
          const delay = index * 0.055;
          const local = Math.min(1, Math.max(0, (progress - delay) / (1 - delay)));
          const screenHalfWidth = screen.clientWidth * cascadeFinalScale / 2;
          const screenHalfHeight = screen.clientHeight * cascadeFinalScale / 2;
          const horizontalDirection = Math.sign(Number(screen.dataset.cascadeX || 0));
          const verticalDirection = Math.sign(Number(screen.dataset.cascadeY || 0));
          const finalX = horizontalDirection * Math.min(copyHalfWidth + screenHalfWidth + cascadeEdgeGap, canvasHalfWidth - screenHalfWidth);
          const finalY = verticalDirection * Math.min(copyHalfHeight + screenHalfHeight + cascadeEdgeGap, canvasHalfHeight - screenHalfHeight);
          const x = finalX * local;
          const y = finalY * local;
          const scale = 1 - local * (1 - cascadeFinalScale);
          screen.style.setProperty("--cascade-x", `${x}px`);
          screen.style.setProperty("--cascade-y", `${y}px`);
          screen.style.setProperty("--cascade-scale", String(scale));
        });
        copy.style.setProperty("--cascade-copy-opacity", String(Math.min(1, Math.max(0, (progress - 0.34) / 0.42))));
      };

      const schedule = () => {
        if (!frame) frame = viewport.requestAnimationFrame(render);
      };

      viewport.addEventListener("scroll", schedule, { passive: true });
      viewport.addEventListener("resize", schedule, { passive: true });
      cascadeMotionQuery.addEventListener("change", schedule);
      cascadeDesktopQuery.addEventListener("change", schedule);
      schedule();
    }

    for (const scene of cascadeScenes) {
      setupPalitraClickExpand(scene, {
        documentElement: documentElement.documentElement,
        eventTarget: documentElement,
        motionQuery: cascadeMotionQuery,
        viewport,
        requestAnimationFrame: viewport.requestAnimationFrame.bind(viewport),
        cancelAnimationFrame: viewport.cancelAnimationFrame.bind(viewport),
        setTimeout: viewport.setTimeout.bind(viewport),
        clearTimeout: viewport.clearTimeout.bind(viewport),
      });
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { setupPalitraClickExpand, setupPalitraScrollCascade };
  }

  if (global && global.document) {
    setupPalitraScrollCascade(global.document, global);
  }
})(typeof window !== "undefined" ? window : globalThis);
