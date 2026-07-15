type ControlName = "radius" | "feather" | "intensity";

const defaults: Record<ControlName, number> = {
  radius: 112,
  feather: 36,
  intensity: 100,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const outputText = (name: ControlName, value: number) =>
  name === "intensity" ? `${value}%` : `${value} px`;

export function initHeroLogoReveals(scope: ParentNode = document): void {
  scope.querySelectorAll<HTMLElement>("[data-logo-reveal]").forEach((root) => {
    const surface = root.querySelector<HTMLElement>("[data-logo-reveal-surface]");
    const underlay = root.querySelector<HTMLImageElement>('[data-logo-layer="violet"]');
    const topLayer = root.querySelector<HTMLImageElement>('[data-logo-layer="peach"]');
    const inspector = root.querySelector<HTMLElement>("[data-reveal-inspector]");

    if (!surface) return;

    let frame = 0;
    let nextX = 50;
    let nextY = 50;

    const writePointer = () => {
      root.style.setProperty("--reveal-x", `${nextX}%`);
      root.style.setProperty("--reveal-y", `${nextY}%`);
      frame = 0;
    };

    const move = (event: PointerEvent) => {
      if (!event.isPrimary || root.dataset.underlayAvailable === "false") return;
      const bounds = surface.getBoundingClientRect();
      nextX = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
      nextY = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100);
      root.dataset.active = "true";
      if (!frame) frame = requestAnimationFrame(writePointer);
    };

    const close = () => {
      root.dataset.active = "false";
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    surface.addEventListener("pointerenter", move);
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerleave", close);
    surface.addEventListener("pointercancel", close);
    surface.addEventListener("pointerup", (event) => {
      if (event.pointerType !== "mouse") close();
    });

    underlay?.addEventListener("error", () => {
      root.dataset.underlayAvailable = "false";
      close();
    });

    topLayer?.addEventListener("error", () => {
      root.dataset.topAvailable = "false";
      close();
      if (inspector) inspector.hidden = true;
    });

    const setControl = (input: HTMLInputElement) => {
      const name = input.dataset.revealControl as ControlName | undefined;
      if (!name || !(name in defaults)) return;
      const value = clamp(Number(input.value), Number(input.min), Number(input.max));
      input.value = String(value);

      const cssValue = name === "intensity" ? String(value / 100) : `${value}px`;
      const output = inspector?.querySelector<HTMLOutputElement>(`[data-reveal-value="${name}"]`);
      root.style.setProperty(`--reveal-${name === "intensity" ? "opacity" : name}`, cssValue);
      if (output) output.value = outputText(name, value);
    };

    inspector?.querySelectorAll<HTMLInputElement>("[data-reveal-control]").forEach((input) => {
      input.addEventListener("input", () => setControl(input));
      setControl(input);
    });

    inspector?.querySelector<HTMLButtonElement>("[data-reveal-reset]")?.addEventListener("click", () => {
      inspector.querySelectorAll<HTMLInputElement>("[data-reveal-control]").forEach((input) => {
        const name = input.dataset.revealControl as ControlName | undefined;
        if (!name || !(name in defaults)) return;
        input.value = String(defaults[name]);
        setControl(input);
      });
    });
  });
}
