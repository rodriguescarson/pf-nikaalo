#!/usr/bin/env bash
# Run one Codex task from .codex/prompts/<name>.md, commit its work with a Codex co-author trailer,
# and append a verifiable entry to CODEX_LOG.md.  Usage: scripts/codex-task.sh <name> [model]
set -euo pipefail
name="${1:?prompt name}"; model="${2:-${CODEX_MODEL:-}}"
root="$(cd "$(dirname "$0")/.." && pwd)"; cd "$root"
prompt=".codex/prompts/$name.md"; [ -f "$prompt" ] || { echo "no $prompt"; exit 1; }
before="$(git rev-parse HEAD)"
mkdir -p .codex/out
args=(exec --skip-git-repo-check -s workspace-write -C "$root" -o ".codex/out/$name.md" -c 'approval_policy="never"')
[ -n "$model" ] && args+=(-m "$model")
start="$(date -u +%FT%TZ)"
codex "${args[@]}" - < "$prompt" 2> ".codex/out/$name.stderr" || echo "codex exited non-zero (see .codex/out/$name.stderr)"
end="$(date -u +%FT%TZ)"
git add -A
if git diff --cached --quiet; then echo "codex($name): no changes"; exit 0; fi
git commit -q -m "codex($name): $(head -1 "$prompt" | sed 's/^# *//')" -m "Co-authored-by: Codex <codex@openai.com>"
sha="$(git rev-parse --short HEAD)"
{
  echo "## $name — $start → $end"
  echo "- prompt: \`$prompt\`  · model: \`${model:-default}\`"
  echo "- commit: \`$sha\` (parent \`${before:0:7}\`)"
  echo "- files:"; git diff --stat "$before" HEAD | sed 's/^/  /'
  echo
} >> CODEX_LOG.md
git add CODEX_LOG.md && git commit -q -m "docs(codex): log session $name"
echo "codex($name) committed as $sha"
