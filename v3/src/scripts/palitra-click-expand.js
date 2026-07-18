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

  const clearPending = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (closeTimer) clearTimeout(closeTimer);
    animationFrame = 0;
    closeTimer = 0;
  };

  const setRect = (prefix, rect) => {
    expandImage?.style.setProperty(`${prefix}-left`, `${rect.left}px`);
    expandImage?.style.setProperty(`${prefix}-top`, `${rect.top}px`);
    expandImage?.style.setProperty(`${prefix}-width`, `${rect.width}px`);
    expandImage?.style.setProperty(`${prefix}-height`, `${rect.height}px`);
  };

  const getTargetRect = (source) => {
    const ratio = source.naturalWidth / source.naturalHeight || source.clientWidth / source.clientHeight;
    const margin = Math.max(20, Math.min(56, viewport.innerWidth * 0.04));
    const maxWidth = Math.min(1180, viewport.innerWidth - margin * 2);
    const maxHeight = viewport.innerHeight - margin * 2;
    const width = Math.min(maxWidth, maxHeight * ratio);
    const height = width / ratio;
    return {
      left: (viewport.innerWidth - width) / 2,
      top: (viewport.innerHeight - height) / 2,
      width,
      height,
    };
  };

  const finishClose = () => {
    closeTimer = 0;
    expandLayer.hidden = true;
    expandImage.removeAttribute("src");
    expandImage.removeAttribute("data-expanded");
    activeTrigger?.focus();
    activeTrigger = null;
    activeSource = null;
  };

  const closeExpanded = () => {
    if (!expandLayer || expandLayer.hidden || !expandImage || !activeSource) return;
    clearPending();
    setRect("--expand", activeSource.getBoundingClientRect());
    expandLayer.removeAttribute("data-open");
    expandImage.removeAttribute("data-expanded");
    delete documentElement.dataset.cascadeExpanded;
    if (motionQuery.matches) finishClose();
    else closeTimer = setTimeout(finishClose, 360);
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
      if (expandLayer.hidden) return;
      expandLayer.dataset.open = "true";
      expandImage.dataset.expanded = "true";
      expandImage.focus();
    });
  };

  triggers.forEach((trigger) => trigger.addEventListener("click", () => openExpanded(trigger)));
  expandImage?.addEventListener("click", closeExpanded);
  expandLayer?.addEventListener("click", (event) => {
    if (event.target === expandLayer) closeExpanded();
  });
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
