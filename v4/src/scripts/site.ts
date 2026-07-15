import { initHeroLogoReveals } from "./hero-logo-reveal";

const root = document.documentElement;
root.dataset.enhanced = "true";
initHeroLogoReveals();

const header = document.querySelector<HTMLElement>("[data-site-header]");
const toggle = header?.querySelector<HTMLButtonElement>("[data-nav-toggle]");
const siteNavigation = header?.querySelector<HTMLElement>("[data-site-nav]");

const setMenuOpen = (open: boolean) => {
  if (!header || !toggle) return;
  header.dataset.navOpen = String(open);
  toggle.setAttribute("aria-expanded", String(open));
};

toggle?.addEventListener("click", () => {
  setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
});

siteNavigation?.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && header?.dataset.navOpen === "true") {
    setMenuOpen(false);
    toggle?.focus();
  }
});

document.addEventListener("click", (event) => {
  if (header?.dataset.navOpen !== "true") return;
  if (event.target instanceof Node && !header.contains(event.target)) setMenuOpen(false);
});

if (header) {
  const threshold = 80;
  let floating = false;
  let ticking = false;

  const updateHeader = () => {
    const next = window.scrollY > threshold;
    if (next !== floating) {
      floating = next;
      header.dataset.floating = String(floating);
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateHeader();
        ticking = false;
      });
    },
    { passive: true },
  );

  updateHeader();
}

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    root.dataset.ready = "true";
  });
});
