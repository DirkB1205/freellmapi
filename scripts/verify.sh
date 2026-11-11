#!/usr/bin/env bash
# verify.sh — führt pytest mit Doctests aus, liefert Exit-Code für Plugin
# Nutzung: ./scripts/verify.sh [path-to-test-file-or-dir]

set -euo pipefail

TARGET="${1:-.}"

echo "=== verify.sh: Starte Doctest-Prüfung für $TARGET ==="

# Prüfen ob pytest verfügbar ist
if ! python -m pytest --version &> /dev/null; then
    echo "FEHLER: pytest nicht installiert. Installiere mit: pip install pytest"
    exit 1
fi

# Doctests ausführen
# --doctest-modules: alle .py Dateien auf Doctests prüfen
# -v: verbose
# --tb=short: kurze Tracebacks
# --ignore: Backup-Ordner und Venvs ausschliessen
EXIT_CODE=0
python -m pytest --doctest-modules -v --tb=short --capture=no \
  --ignore=_c-altlasten-backup-20261008 \
  --ignore=_c-altlasten-backup-20261008/Default-Project-kopien \
  --ignore=02_ECC/skills/research-agent \
  --ignore=open-webui-venv \
  --ignore=02_ECC/skills/skill-comply/tests \
  --ignore=02_ECC/tests \
  --ignore=02_ECC/skills/continuous-learning-v2/scripts \
  --ignore=code/skills/humanizer/scripts/validate-package.py \
  --ignore=code/social-media-automation \
  --ignore=Projekte/social-automation/auto_setup.py \
  --ignore=Projekte/social-automation/Video-Analysen \
  --ignore=Projekte/Epic-Tool \
  --ignore=code/orchestrator \
  --ignore=code/omni-dashboard/clean_state.py \
  --ignore=code/research-agent \
  --ignore=paperclip/packages/paperclip-runner/scripts \
  --ignore=02_ECC/ecc_dashboard.py \
  --ignore=02_ECC/skills/agent-self-evaluation/scripts \
  --ignore=02_ECC/skills/docs-governance/scripts \
  --ignore=02_ECC/skills/frontend-slides/scripts \
  --ignore=02_ECC/skills/manim-video/assets \
  --ignore=02_ECC/skills/skill-comply/scripts \
  --ignore=02_ECC/skills/taste-application/tests \
  --ignore=02_ECC/skills/taste-application/scripts \
  --ignore=02_ECC/skills/taste-distillation/scripts \
  --ignore=02_ECC/skills/videodb/scripts \
  --ignore=02_ECC/src/llm \
  --ignore=Projekte/ai-content-studio/app.py \
  --ignore=Projekte/ai-content-studio/avatar_manager.py \
  --ignore=check_api.py \
  --ignore=run_check.py \
  --ignore=Projekte/ai-content-studio/tests \
  --ignore=Projekte/ai-content-studio/trend_scanner.py \
  --ignore=paperclip \
  --ignore=projects/tiktok-analysis \
  --ignore=Projekte/galyarder-framework/integrations \
  --ignore=Projekte/galyarder-framework/scripts \
  --ignore=Projekte/galyarder-framework/skills \
  --ignore=inspect_db.py \
  --ignore=inspect_db2.py \
  --ignore=inspect_db3.py \
  --ignore=tmp_inspect_db.py \
  --ignore=Projekte/social-automation/generate_posts.py \
  --ignore=Projekte/social-automation/test_simple_preview.py \
  --ignore=Projekte/social-automation/tests \
  "$TARGET" || EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "=== verify.sh: ALLE DOCTESTS BESTANDEN ==="
else
    echo "=== verify.sh: DOCTESTS FEHLGESCHLAGEN (Exit: $EXIT_CODE) ==="
fi

exit $EXIT_CODE