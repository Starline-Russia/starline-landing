document.documentElement.classList.add("js");

const header = document.querySelector<HTMLElement>("[data-site-header]");
const menuToggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const siteNavigation = document.querySelector<HTMLElement>("[data-site-nav]");

const closeMenu = () => {
  menuToggle?.setAttribute("aria-expanded", "false");
  if (siteNavigation) siteNavigation.dataset.open = "false";
};

menuToggle?.addEventListener("click", () => {
  const nextOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(nextOpen));
  if (siteNavigation) siteNavigation.dataset.open = String(nextOpen);
});

siteNavigation?.addEventListener("click", (event) => {
  if ((event.target as HTMLElement).closest("a")) closeMenu();
});

window.addEventListener(
  "scroll",
  () => header?.toggleAttribute("data-scrolled", window.scrollY > 16),
  { passive: true },
);

const serviceItems = Array.from(document.querySelectorAll<HTMLElement>(".service-item"));

serviceItems.forEach((item) => {
  const toggle = item.querySelector<HTMLButtonElement>("[data-service-toggle]");
  toggle?.addEventListener("click", () => {
    const willOpen = item.dataset.open !== "true";
    serviceItems.forEach((otherItem) => {
      otherItem.dataset.open = "false";
      otherItem.querySelector("[data-service-toggle]")?.setAttribute("aria-expanded", "false");
    });
    item.dataset.open = String(willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
  });
});

const leadForm = document.querySelector<HTMLFormElement>("[data-lead-form]");
const formStatus = document.querySelector<HTMLElement>("[data-form-status]");

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!leadForm.checkValidity()) {
    leadForm.reportValidity();
    return;
  }
  if (formStatus) formStatus.textContent = "Спасибо! Это локальный прототип. Данные никуда не отправлены.";
  leadForm.reset();
});

const cascadeMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const cascadeDesktopQuery = window.matchMedia("(min-width: 641px)");
const cascadeScenes = Array.from(document.querySelectorAll<HTMLElement>("[data-palitra-cascade]"));

for (const scene of cascadeScenes) {
  const stage = scene.querySelector<HTMLElement>("[data-palitra-cascade-stage]");
  const copy = scene.querySelector<HTMLElement>("[data-palitra-cascade-copy]");
  const screens = Array.from(scene.querySelectorAll<HTMLElement>("[data-cascade-screen]"));
  let frame = 0;

  const render = () => {
    frame = 0;
    const enabled = !cascadeMotionQuery.matches && cascadeDesktopQuery.matches;
    if (!stage || !copy || !enabled) {
      scene.removeAttribute("data-cascade-ready");
      return;
    }

    scene.dataset.cascadeReady = "true";
    const bounds = scene.getBoundingClientRect();
    const travel = Math.max(scene.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, -bounds.top / travel));

    screens.forEach((screen, index) => {
      const delay = index * 0.055;
      const local = Math.min(1, Math.max(0, (progress - delay) / (1 - delay)));
      const x = Number(screen.dataset.cascadeX ?? 0) * local;
      const y = Number(screen.dataset.cascadeY ?? 0) * local;
      const scale = 1 - local * 0.56;
      screen.style.setProperty("--cascade-x", `${x}px`);
      screen.style.setProperty("--cascade-y", `${y}px`);
      screen.style.setProperty("--cascade-scale", String(scale));
    });
    copy.style.setProperty("--cascade-copy-opacity", String(Math.min(1, Math.max(0, (progress - 0.34) / 0.42))));
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  cascadeMotionQuery.addEventListener("change", schedule);
  cascadeDesktopQuery.addEventListener("change", schedule);
  schedule();
}
