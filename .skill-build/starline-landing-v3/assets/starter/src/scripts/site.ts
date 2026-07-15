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
