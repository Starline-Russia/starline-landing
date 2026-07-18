export function setupPalitraLightbox(scene, options) {
  const {
    documentElement,
    eventTarget,
    motionQuery,
    requestAnimationFrame,
    cancelAnimationFrame,
    setTimeout,
    clearTimeout,
  } = options;
  const triggers = Array.from(scene.querySelectorAll("[data-cascade-lightbox-trigger]"));
  const lightbox = scene.querySelector("[data-cascade-lightbox]");
  const lightboxImage = scene.querySelector("[data-cascade-lightbox-image]");
  const closeButton = scene.querySelector("[data-cascade-lightbox-close]");
  let activeTrigger = null;
  let closeTimer = 0;
  let openFrame = 0;

  const cancelPendingOpen = () => {
    if (!openFrame) return;
    cancelAnimationFrame(openFrame);
    openFrame = 0;
  };

  const clearPendingClose = () => {
    if (!closeTimer) return;
    clearTimeout(closeTimer);
    closeTimer = 0;
  };

  const openLightbox = (trigger) => {
    const source = trigger.querySelector(".palitra-cascade-screen");
    if (!lightbox || !lightboxImage || !closeButton || !source) return;
    cancelPendingOpen();
    clearPendingClose();
    activeTrigger = trigger;
    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt;
    lightbox.hidden = false;
    documentElement.dataset.lightboxOpen = "true";
    openFrame = requestAnimationFrame(() => {
      openFrame = 0;
      if (lightbox.hidden || documentElement.dataset.lightboxOpen !== "true") return;
      lightbox.dataset.open = "true";
      closeButton.focus();
    });
  };

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    cancelPendingOpen();
    clearPendingClose();
    lightbox.removeAttribute("data-open");
    delete documentElement.dataset.lightboxOpen;
    const finish = () => {
      closeTimer = 0;
      lightbox.hidden = true;
      lightboxImage?.removeAttribute("src");
      activeTrigger?.focus();
      activeTrigger = null;
    };
    if (motionQuery.matches) finish();
    else closeTimer = setTimeout(finish, 220);
  };

  triggers.forEach((trigger) => trigger.addEventListener("click", () => openLightbox(trigger)));
  closeButton?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  eventTarget.addEventListener("keydown", (event) => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "Tab") {
      event.preventDefault();
      closeButton?.focus();
    }
  });

  return { closeLightbox, openLightbox };
}
