# Starline Landing v3 Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and install a self-contained personal `starline-landing-v3` skill from the approved Astro v3 snapshot.

**Architecture:** Assemble the skill in a writable staging directory, copy only portable v3 source files into a bundled starter, and make the starter tests independent from the source repository. Validate the staged skill and a copied starter before installing the verified directory into `~/.codex/skills`.

**Tech Stack:** Markdown skill instructions, Bash copy utility, Astro 7.0.9, strict TypeScript, Node test runner, Codex skill-creator validation.

## Global Constraints

- Do not modify `/Users/papenov/.codex/skills/starline-landing`, `v1`, `v2`, or the working `/Users/papenov/Documents/Starlinerussia.ru/v3` project.
- Install the new skill at `/Users/papenov/.codex/skills/starline-landing-v3`.
- Exclude `node_modules`, `dist`, `.astro`, `.hallmark`, logs, and temporary artifacts from the bundled starter.
- Keep Astro at `7.0.9`, TypeScript strict, and plain CSS without React, Tailwind, or UI libraries.
- Keep the v3 palette `#080817`, `#3F09B1`, `#C57DFB`, `#171027`, `#F7F6F9`, and white; do not use lime.
- Treat the installed starter as a stable snapshot; never synchronize it automatically from the working repository.

---

### Task 1: Initialize the staged skill and establish the failing baseline

**Files:**
- Create: `.skill-build/starline-landing-v3/SKILL.md`
- Create: `.skill-build/starline-landing-v3/agents/openai.yaml`
- Create: `.skill-build/starline-landing-v3/scripts/`
- Create: `.skill-build/starline-landing-v3/references/`
- Create: `.skill-build/starline-landing-v3/assets/`

**Interfaces:**
- Consumes: approved design at `docs/superpowers/specs/2026-07-15-starline-landing-v3-skill-design.md`.
- Produces: a skill-creator scaffold at `.skill-build/starline-landing-v3`.

- [ ] **Step 1: Verify the skill is absent before creation**

Run:

```bash
test ! -e .skill-build/starline-landing-v3
test ! -e /Users/papenov/.codex/skills/starline-landing-v3
```

Expected: both commands exit `0`.

- [ ] **Step 2: Observe the validation baseline fail**

Run:

```bash
python /Users/papenov/.codex/skills/.system/skill-creator/scripts/quick_validate.py .skill-build/starline-landing-v3
```

Expected: non-zero exit because the skill directory does not exist.

- [ ] **Step 3: Initialize the scaffold**

Run:

```bash
python /Users/papenov/.codex/skills/.system/skill-creator/scripts/init_skill.py starline-landing-v3 \
  --path .skill-build \
  --resources scripts,references,assets \
  --interface 'display_name=Starline Landing v3' \
  --interface 'short_description=Build and refine the Astro Starline v3 landing' \
  --interface 'default_prompt=Use $starline-landing-v3 to create or refine a Starline v3 landing section and verify it locally.'
```

Expected: scaffold created with `SKILL.md`, `agents/openai.yaml`, `scripts`, `references`, and `assets`.

### Task 2: Author the skill contract and portable starter

**Files:**
- Modify: `.skill-build/starline-landing-v3/SKILL.md`
- Create: `.skill-build/starline-landing-v3/references/v3-contract.md`
- Create: `.skill-build/starline-landing-v3/assets/starter/astro.config.mjs`
- Create: `.skill-build/starline-landing-v3/assets/starter/package.json`
- Create: `.skill-build/starline-landing-v3/assets/starter/package-lock.json`
- Create: `.skill-build/starline-landing-v3/assets/starter/tsconfig.json`
- Create: `.skill-build/starline-landing-v3/assets/starter/public/**`
- Create: `.skill-build/starline-landing-v3/assets/starter/src/**`
- Create: `.skill-build/starline-landing-v3/assets/starter/tests/v3-landing.test.mjs`
- Create: `.skill-build/starline-landing-v3/assets/starter/tests/v3-build.test.mjs`

**Interfaces:**
- Consumes: portable source from `v3/` and source tests from `tests/v3-*.test.mjs`.
- Produces: a self-contained Astro starter whose scripts resolve `tests/` from its own root.

- [ ] **Step 1: Copy only portable source files**

Run `rsync` with explicit exclusions:

```bash
rsync -a \
  --exclude node_modules \
  --exclude dist \
  --exclude .astro \
  --exclude .hallmark \
  v3/ .skill-build/starline-landing-v3/assets/starter/
mkdir -p .skill-build/starline-landing-v3/assets/starter/tests
cp tests/v3-landing.test.mjs tests/v3-build.test.mjs .skill-build/starline-landing-v3/assets/starter/tests/
```

Expected: starter contains configuration, `public`, `src`, and `tests`, with none of the excluded directories.

- [ ] **Step 2: Make package scripts self-contained**

Set these exact scripts in staged `package.json`:

```json
{
  "test": "node --test tests/v3-landing.test.mjs",
  "test:build": "node --test tests/v3-build.test.mjs"
}
```

Keep all other package fields and dependency versions unchanged.

- [ ] **Step 3: Make source tests use the copied project root**

Replace the repository-relative root calculation in `tests/v3-landing.test.mjs` with:

```js
const v3Root = process.cwd();
```

Replace the production fixture root in `tests/v3-build.test.mjs` with:

```js
const root = new URL("../", import.meta.url);
```

and change both production reads from `v3/dist/...` to `dist/...`.

- [ ] **Step 4: Write the minimal skill instructions**

Use this frontmatter:

```yaml
---
name: starline-landing-v3
description: Use when Codex needs to create, continue, redesign, review, or locally verify the Astro-based Starline v3 landing page, its isolated section previews, conversion copy, responsive layouts, or component system.
---
```

The body must require: copying the starter before editing; reading `references/v3-contract.md`; working one preview component at a time; updating tests before source; running test/check/build/browser QA; and explicit-only snapshot synchronization.

- [ ] **Step 5: Write the detailed v3 contract**

The reference must contain these concrete rules:

- Stack: Astro `7.0.9`, strict TypeScript, plain CSS, no React, Tailwind, or UI libraries.
- Tokens: Onest headings, Inter body, `#080817`, `#3F09B1`, `#C57DFB`, `#171027`, `#F7F6F9`, white, and no lime.
- Section order and IDs: `hero`, `tasks`, `cohorts`, `services`, `industries`, `economics`, `process`, `palitra`, `cases`, `lead`.
- Preview rule: one shared component per `/preview/<section>/` route without header, footer, or neighboring sections.
- Content: one hero CTA, six tasks, six services, seven industries, two anonymous cases, and a lead form with required `name` and `contact` fields only.
- Claims: show `+20–50% GMV за 6–12 месяцев` only next to an explicit non-guarantee caveat; never invent client names, team names, guarantees, or unsupported facts.
- Cases: local optimized `4:3` images with Russian alt text, intrinsic width and height, and lazy loading.
- Progressive enhancement: content remains available without JavaScript; mobile menu and accordion expose `aria-expanded`; reduced motion removes scroll-dependent presentation.

### Task 3: Add and test the safe starter copier

**Files:**
- Create: `.skill-build/starline-landing-v3/scripts/create-v3.sh`

**Interfaces:**
- Consumes: one target directory argument and `../assets/starter` relative to the script.
- Produces: an exact starter copy, exit `64` for bad arguments, exit `66` for a missing starter, and exit `73` for a non-empty target.

- [ ] **Step 1: Write the executable script**

Implement:

```bash
#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 TARGET_DIRECTORY" >&2
  exit 64
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
starter_dir="$(cd "$script_dir/../assets/starter" 2>/dev/null && pwd || true)"
target_dir="$1"

if [[ -z "$starter_dir" || ! -d "$starter_dir" ]]; then
  echo "Starter directory is missing" >&2
  exit 66
fi

if [[ -d "$target_dir" ]] && find "$target_dir" -mindepth 1 -maxdepth 1 -print -quit | grep -q .; then
  echo "Target directory must be empty: $target_dir" >&2
  exit 73
fi

mkdir -p "$target_dir"
cp -R "$starter_dir"/. "$target_dir"/
echo "Starline v3 starter created at $target_dir"
```

- [ ] **Step 2: Verify argument and overwrite protection**

Run:

```bash
bash .skill-build/starline-landing-v3/scripts/create-v3.sh
mkdir -p /tmp/starline-v3-nonempty
touch /tmp/starline-v3-nonempty/keep
bash .skill-build/starline-landing-v3/scripts/create-v3.sh /tmp/starline-v3-nonempty
```

Expected: first command exits `64`; second script invocation exits `73`; `/tmp/starline-v3-nonempty/keep` remains unchanged.

- [ ] **Step 3: Verify successful copying**

Run:

```bash
bash .skill-build/starline-landing-v3/scripts/create-v3.sh /tmp/starline-v3-starter-smoke
test -f /tmp/starline-v3-starter-smoke/package.json
test -f /tmp/starline-v3-starter-smoke/src/pages/preview/cohorts.astro
```

Expected: all commands exit `0`.

### Task 4: Validate, install, and revalidate the skill

**Files:**
- Create: `/Users/papenov/.codex/skills/starline-landing-v3/**`

**Interfaces:**
- Consumes: verified `.skill-build/starline-landing-v3`.
- Produces: discoverable personal skill at `/Users/papenov/.codex/skills/starline-landing-v3`.

- [ ] **Step 1: Run staged structural checks**

Run:

```bash
python /Users/papenov/.codex/skills/.system/skill-creator/scripts/quick_validate.py .skill-build/starline-landing-v3
test -z "$(find .skill-build/starline-landing-v3/assets/starter -type d \( -name node_modules -o -name dist -o -name .astro -o -name .hallmark \) -print -quit)"
```

Expected: validator reports success and the exclusion check exits `0`.

- [ ] **Step 2: Verify the copied starter with existing local dependencies**

Create a disposable copy using `create-v3.sh`, link the working `v3/node_modules` into it, then run:

```bash
npm test
npm run check
npm run build
npm run test:build
```

Expected: all source tests pass, Astro reports zero errors, build succeeds, and both production tests pass.

- [ ] **Step 3: Install the verified skill**

Copy the staged directory to:

```text
/Users/papenov/.codex/skills/starline-landing-v3
```

Do not overwrite an existing installation without reporting the conflict.

- [ ] **Step 4: Revalidate the installed skill**

Run:

```bash
python /Users/papenov/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/papenov/.codex/skills/starline-landing-v3
```

Expected: `Skill is valid!`.

- [ ] **Step 5: Report the installation**

Report the installed `SKILL.md`, bundled starter, validation results, and the explicit command for creating a fresh v3 project. State that the original `starline-landing`, `v1`, `v2`, and working `v3` remain unchanged.
