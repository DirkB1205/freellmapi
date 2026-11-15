#!/usr/bin/env python3
"""verify.py — führt pytest mit Doctests aus, liefert Exit-Code für Plugin.
Cross-platform Ersatz für verify.sh (Windows/Linux/macOS).

Nutzung:
    python scripts/verify.py [path-to-test-file-or-dir]
"""
import subprocess
import sys
from pathlib import Path


def main():
    TARGET = sys.argv[1] if len(sys.argv) > 1 else "."
    TIMEOUT_SECONDS = 120  # Gesamt-Timeout für verify.py

    print(f"=== verify.py: Starte Doctest-Prüfung für {TARGET} (Timeout: {TIMEOUT_SECONDS}s) ===")

    # Prüfen ob pytest verfügbar ist
    try:
        subprocess.run([sys.executable, "-m", "pytest", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("FEHLER: pytest nicht installiert. Installiere mit: pip install pytest")
        sys.exit(1)

    # Prüfen ob pytest-timeout verfügbar ist
    try:
        has_timeout = "--timeout" in subprocess.run(
            [sys.executable, "-m", "pytest", "--help"], capture_output=True, text=True
        ).stdout
    except (subprocess.CalledProcessError, FileNotFoundError):
        has_timeout = False

    if not has_timeout:
        print("WARNUNG: pytest-timeout nicht installiert. Tests können unbegrenzt laufen.")
        print("Installiere mit: pip install pytest-timeout")

    IGNORES = [
        "_c-altlasten-backup-20261008",
        "_c-altlasten-backup-20261008/Default-Project-kopien",
        "02_ECC/skills/research-agent",
        "open-webui-venv",
        "02_ECC/skills/skill-comply/tests",
        "02_ECC/tests",
        "02_ECC/skills/continuous-learning-v2/scripts",
        "code/skills/humanizer/scripts/validate-package.py",
        "code/social-media-automation",
        "code/video-analyse",
        "Projekte/social-automation/auto_setup.py",
        "Projekte/social-automation/Video-Analysen",
        "Projekte/Epic-Tool",
        "code/orchestrator",
        "code/omni-dashboard/clean_state.py",
        "code/research-agent",
        "paperclip/packages/paperclip-runner/scripts",
        "02_ECC/ecc_dashboard.py",
        "02_ECC/skills/agent-self-evaluation/scripts",
        "02_ECC/skills/docs-governance/scripts",
        "02_ECC/skills/frontend-slides/scripts",
        "02_ECC/skills/manim-video/assets",
        "02_ECC/skills/skill-comply/scripts",
        "02_ECC/skills/taste-application/tests",
        "02_ECC/skills/taste-application/scripts",
        "02_ECC/skills/taste-distillation/scripts",
        "02_ECC/skills/videodb/scripts",
        "02_ECC/src/llm",
        "Projekte/ai-content-studio/app.py",
        "Projekte/ai-content-studio/avatar_manager.py",
        "check_api.py",
        "run_check.py",
        "Projekte/ai-content-studio/tests",
        "Projekte/ai-content-studio/trend_scanner.py",
        "paperclip",
        "projects/tiktok-analysis",
        "Projekte/galyarder-framework/integrations",
        "Projekte/galyarder-framework/scripts",
        "Projekte/galyarder-framework/skills",
        "inspect_db.py",
        "inspect_db2.py",
        "inspect_db3.py",
        "tmp_inspect_db.py",
        "Projekte/social-automation/generate_posts.py",
        "Projekte/social-automation/test_simple_preview.py",
        "Projekte/social-automation/tests",
        "scripts/verify.py",  # verhindert rekursive Selbst-Invokation bei Doctest-Collection
    ]

    cmd = [
        sys.executable, "-m", "pytest",
        "--doctest-modules", "-v", "--tb=short", "--capture=no",
        "--timeout=30",  # pytest-timeout: max 30s pro Test
    ] + [f"--ignore={i}" for i in IGNORES] + [TARGET]

    try:
        result = subprocess.run(cmd, timeout=TIMEOUT_SECONDS)
    except subprocess.TimeoutExpired:
        print(f"=== verify.py: TIMEOUT nach {TIMEOUT_SECONDS}s — Abbruch ===")
        sys.exit(1)

    EXIT_CODE = result.returncode

    if EXIT_CODE == 0:
        print("=== verify.py: ALLE DOCTESTS BESTANDEN ===")
    else:
        print(f"=== verify.py: DOCTESTS FEHLGESCHLAGEN (Exit: {EXIT_CODE}) ===")

    sys.exit(EXIT_CODE)


if __name__ == "__main__":
    main()