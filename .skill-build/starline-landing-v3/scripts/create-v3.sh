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

