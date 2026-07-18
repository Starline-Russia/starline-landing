export function setupPalitraClickExpand(scene, options) {
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
