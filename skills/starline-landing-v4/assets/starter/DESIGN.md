# Starline v4 design lock

## Sources

- Motion and structural reference: https://steep.app/
- Refero style: https://styles.refero.design/style/75fdb89f-ca64-41b3-af36-7a78bd09448e
- Approved project specification: ../docs/superpowers/specs/2026-07-14-starline-v4-landing-design.md

These sources are design evidence, not pixel-copy targets. Starline content, diagrams, and interaction details remain original.

## Direction

- Macrostructure: Feature Stack.
- Genre and tone: editorial, austere, analytical.
- Navigation: N10, one DOM tree morphing from an edge-aligned bar into a floating panel.
- Footer: Ft2, a single inline editorial close.
- Paper role: visually white, with a trace of warm chroma rather than a sterile pure white.
- Ink role: near-black primary copy and action color.
- Peach role: one major editorial field, not a repeated card accent.
- Sienna role: focus, active data lines, and small analytical marks only.
- Display type: Source Serif 4, roman only.
- Interface type: Inter for prose, labels, controls, and data.

## Design-system terms

CSS custom properties are named values declared with the `--name` syntax and read with `var(--name)`. They let the browser reuse a value throughout the page.

Design tokens are the semantic layer built with those variables. A token such as `--color-peach` describes a role, so a component does not need to know or repeat the underlying OKLCH value.

Tailwind v4 is a utility-first CSS framework that generates styles from short classes and CSS configuration. This project deliberately does not use it: the approved direction needs a small bespoke stylesheet and a transparent token system.

## Composition rules

- Use asymmetric editorial composition and hairline rules instead of repeated card grids.
- Use native HTML, CSS, and small inline SVG diagrams instead of fake dashboard or browser chrome.
- Keep headings roman; use scale, weight, rules, and spatial rhythm for emphasis.
- Keep exactly three motion primitives across the finished page: hero assembly, feature-stack synchronization, and navigation morph.
- Never invent metrics, client logos, testimonials, or guarantees.
