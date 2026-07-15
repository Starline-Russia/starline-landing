---
name: starline-landing-v3
description: Use when Codex needs to create, continue, redesign, review, or locally verify the Astro-based Starline v3 landing page, its isolated section previews, conversion copy, responsive layouts, or component system.
---

# Starline Landing v3

## Core rule

Treat the bundled Astro project as an immutable starter snapshot. Copy it into a working directory before editing. Keep each section independently previewable and verify the shared component rather than maintaining separate preview markup.

Read [references/v3-contract.md](references/v3-contract.md) before changing copy, structure, visual tokens, interactions, or claims.

## Start a project

Run:

```bash
bash scripts/create-v3.sh /absolute/path/to/new-v3
cd /absolute/path/to/new-v3
npm install
```

If the user already has a v3 project, inspect it and work there. Never replace it with the bundled starter.

## Component workflow

1. Identify the requested section and its shared component in `src/components/`.
2. Open or create `/preview/<section>/` using that component alone inside `BaseLayout`.
3. Update the relevant structural test before changing implementation. Run it and confirm the new expectation fails for the intended reason.
4. Change the component, typed data, and global CSS needed for that section. Do not duplicate its markup in the preview page.
5. Run `npm test`, `npm run check`, and `npm run build`.
6. Inspect the isolated preview and the full page at desktop and mobile widths. Check focus, overflow, reduced motion, and no-JavaScript readability when relevant.

Work on one component at a time unless a shared token or interface requires a coordinated change.

## Guardrails

- Preserve Astro `7.0.9`, strict TypeScript, and plain CSS unless the user explicitly changes the stack.
- Preserve `v1`, `v2`, and the existing `starline-landing` skill.
- Do not invent client names, team members, guarantees, or unsupported performance facts.
- Keep the lead form local-only unless the user separately authorizes a backend or integration.
- Do not add `node_modules`, `dist`, `.astro`, `.hallmark`, logs, or generated previews to the skill starter.
- Synchronize a later working project back into this skill only after an explicit request and a fresh validation cycle.

## Completion contract

Report the section preview URL, files changed, and exact verification results. A visual approval without passing structural tests, Astro check, and production build is not completion.

