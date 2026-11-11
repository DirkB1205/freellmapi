#!/usr/bin/env python3
"""
verify.py — Windows-kompatibler Ersatz für verify.sh
Führt pytest mit Doctests aus, liefert Exit-Code für Plugin.
Nutzung: python scripts/verify.py [path-to-test-file-or-dir]
"""

import sys
import subprocess
from pathlib import Path


# Schritt 1: Geänderte .py-Dateien aus dem Git-Working-Tree ermitteln
def get_changed_py_files(repo: Path) -> list[str]:
    """
    Return list of changed .py files from git status, excluding known problem files.

    Args:
        repo: Path to the repository root.

    Returns:
        List of relative file paths ending with .py.

    Example:
        >>> from pathlib import Path
        >>> import tempfile
        >>> with tempfile.TemporaryDirectory() as d:
        ...     repo = Path(d)
        ...     # No git repo -> empty list
        ...     get_changed_py_files(repo)
        []
    """
    try:
        # Getrackte Änderungen + ungetrackte Dateien, aber ohne bekannte Problem-Dateien
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True, cwd=repo
        )
    except FileNotFoundError:
        return []
    files: list[str] = []
    exclude_prefixes = ("orch/", "code/orchestrator/", "open-webui-venv/", ".venv/", "venv/")
    # Explizit ausschließen: inspect_db*.py, check_api.py, check_providers.py (haben module-level Side-Effects)
    exclude_files = ("inspect_db.py", "inspect_db2.py", "inspect_db3.py", "tmp_inspect_db.py",
                     "check_api.py", "check_providers.py", "run_check.py", "remove_duplicates.py")
    for line in result.stdout.splitlines():
        path = line[3:].strip().strip('"')
        if path.lower().endswith(".py") and not any(path.lower().startswith(p) for p in exclude_prefixes) and path not in exclude_files:
            files.append(path)
    return files


def main() -> int:
    # Schritt 2: Ziel-Dateien bestimmen (CLI-Argument oder Git-Diff, Fallback: alles)
    repo = Path(__file__).parent.parent
    if len(sys.argv) > 1:
        target = sys.argv[1]
        target_args = [target]
    else:
        changed = get_changed_py_files(repo)
        if not changed:
            print("=== verify.py: Keine geänderten .py-Dateien — nichts zu tun ===")
            return 0
        target_args = changed
        target = ", ".join(changed)

    print(f"=== verify.py: Starte Doctest-Prüfung für {target} ===")

    # Schritt 3: pytest mit Doctests aufrufen
    cmd = [
        sys.executable, "-m", "pytest",
        "--doctest-modules",
        "-v",
        "--tb=short",
        "--capture=no",  # Windows-Fix: verhindert I/O operation on closed file
        "--ignore=.git"
    ] + target_args

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=Path(__file__).parent.parent)
    except FileNotFoundError:
        print("FEHLER: pytest nicht installiert. Installiere mit: pip install pytest", file=sys.stderr)
        return 1

    # Output ausgeben (wie bei verify.sh)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)

    exit_code = result.returncode

    if exit_code == 0:
        print("=== verify.py: ALLE DOCTESTS BESTANDEN ===")
    else:
        print(f"=== verify.py: DOCTESTS FEHLGESCHLAGEN (Exit: {exit_code}) ===")

    return exit_code


if __name__ == "__main__":
    sys.exit(main())