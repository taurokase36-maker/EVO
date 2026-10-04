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

graphify_ready() {
  command -v graphify >/dev/null 2>&1 || return 1
  graphify --version 2>/dev/null | grep -q "$GRAPHIFY_VERSION" || return 1
  # pdf/office extras let graphify read the PDFs and .xlsx files in this repo
  local py
  py=$(head -1 "$(command -v graphify)" | tr -d '#!')
  "$py" -c "import pypdf, openpyxl, docx" 2>/dev/null
}

if graphify_ready; then
  exit 0
fi

if ! command -v uv >/dev/null 2>&1; then
  pip install --quiet uv
fi

uv tool install --force "graphifyy[pdf,office] @ git+https://github.com/Graphify-Labs/graphify.git@v${GRAPHIFY_VERSION}"
