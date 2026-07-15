---
name: starline-landing-v4
description: Use when Codex needs to create, continue, redesign, review, or locally verify the isolated Astro-based Starline v4 landing, its one-component previews, white/black/peach visual system, hero logo reveal, responsive layouts, or component checkpoints.
---

# Starline Landing v4

## Core rule

Treat v4 as a separate product line. Never resolve the project from the repository root by assumption, and never copy components, styles, tests, or content rules from v3.

Read [references/v4-contract.md](references/v4-contract.md) before changing copy, structure, tokens, motion, interactions, claims, or assets.

For visual work, **REQUIRED SUB-SKILLS:** use `refero-design`, `hallmark`, and `ui-ux-pro-max`. For behavior changes, use `superpowers:test-driven-development`; before completion, use `superpowers:verification-before-completion`.

## Resolve the correct checkout

When working in the Starlinerussia.ru repository:

1. Run `git worktree list --porcelain` from the repository.
2. Find the worktree whose checked-out branch is exactly `v4`.
3. Set the project directory to `<that-worktree>/v4`.
4. Confirm `git -C <that-worktree> branch --show-current` returns `v4` and `git status --short` is understood before editing.

If no v4 worktree exists, stop and ask whether to create one. Do not fall back to a `v4/` directory inside a checkout of `main`, `v3`, or another branch: that directory may be stale.

## Start a standalone project

For a new copy outside the existing repository, run:

```bash
bash scripts/create-v4.sh /absolute/path/to/new-v4
cd /absolute/path/to/new-v4
npm install
```

The starter is immutable. Copy it; never edit `assets/starter/` for ordinary landing work.

## One-component workflow

1. Identify the single requested section and inspect the current v4 contract, tokens, typed data, shared component, page assembly, and structural tests.
2. Preserve every approved component checkpoint. The hero and `/preview/hero/` are locked unless the user explicitly asks to change them.
3. Add or update a focused structural test first and confirm RED for the intended missing behavior.
4. Implement one shared component in `src/components/`; keep content in `src/data/site.ts` and styles in the existing token/global CSS system.
5. Render that same component in the full page and `/preview/<section>/`. Do not duplicate preview markup.
6. Confirm GREEN, then run `npm test`, `npm run check`, `npm run build`, and `git diff --check`.
7. Inspect the isolated preview and full page at 320, 375, 414, 768, 1280, 1440, and 1920 px when layout changes. Check overflow, focus, reduced motion, console errors, missing assets, and no-JavaScript readability where relevant.

Do not begin the next component until the user approves the current preview.

## Completion contract

Report the exact v4 worktree and branch, preview URL, changed files, and verification results. Passing visual review without tests, Astro check, and production build is incomplete.
