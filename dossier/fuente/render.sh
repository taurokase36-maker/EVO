#!/bin/bash
# Genera ../EVO_Press_Kit_2026.pdf a partir de data.json + gen.py + style.css
cd "$(dirname "$0")"
python3 gen.py || exit 1
CHROME="${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}"
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw --virtual-time-budget=5000 \
  --print-to-pdf=../EVO_Press_Kit_2026.pdf index.html 2>&1 | grep -E "written"
