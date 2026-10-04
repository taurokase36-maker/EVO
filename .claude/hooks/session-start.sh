#!/bin/bash
# Installs the graphify CLI in Claude Code cloud sessions so the project's
# graphify skill (.claude/skills/graphify) and PreToolUse hooks work.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Keep in sync with .claude/skills/graphify/.graphify_version
GRAPHIFY_VERSION="0.9.75"

export PATH="$HOME/.local/bin:$PATH"
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$CLAUDE_ENV_FILE"
fi

if command -v graphify >/dev/null 2>&1 && graphify --version 2>/dev/null | grep -q "$GRAPHIFY_VERSION"; then
  exit 0
fi

if ! command -v uv >/dev/null 2>&1; then
  pip install --quiet uv
fi

uv tool install --force "git+https://github.com/Graphify-Labs/graphify.git@v${GRAPHIFY_VERSION}"
