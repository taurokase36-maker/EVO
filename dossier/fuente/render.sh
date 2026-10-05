#!/bin/bash
# Requisitos: python3 + pymupdf (pip install pymupdf), node + playwright-core (npm install), Chrome/Chromium.
# En tu compu: CHROME="ruta/a/chrome" ./render.sh
cd "$(dirname "$0")"
python3 gen.py && node build.js && python3 merge.py
