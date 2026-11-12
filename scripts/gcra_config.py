"""
scripts/gcra_config.py — Konfiguration fuer den GCRA-Loop.

>>> from scripts.gcra_config import LoopConfig
>>> cfg = LoopConfig()
>>> cfg.max_iterations
5
"""

from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class LoopConfig:
    """Konfiguration fuer den Generate-Critique-Revise-Loop.

    >>> cfg = LoopConfig()
    >>> cfg.max_iterations
    5
    >>> cfg.critic_l1_score_threshold
    70
    >>> cfg.reviewer_model.startswith("ollama/")
    True
    >>> LoopConfig(max_iterations=0).max_iterations
    0
    """

    max_iterations: int = 5
    critic_l1_score_threshold: int = 70
    reviewer_model: str = field(default_factory=lambda: _env("REVIEWER_MODEL", "ollama/codellama:latest"))
    ollama_base_url: str = field(default_factory=lambda: _env("OLLAMA_BASE_URL", "http://127.0.0.1:11434"))
    verify_script: Path = field(default_factory=lambda: Path(__file__).parent / "verify.sh")
    codeguardian_dir: Path = field(default_factory=lambda: Path(__file__).parent.parent / "codeguardian")

    def __post_init__(self):
        if not self.codeguardian_dir.exists():
            self.codeguardian_dir.mkdir(parents=True, exist_ok=True)


def _env(key: str, default: str) -> str:
    """Leset Umgebungsvariable mit Fallback.

    >>> import os
    >>> os.environ["GCRA_TEST_VAR"] = "testwert"
    >>> _env("GCRA_TEST_VAR", "default")
    'testwert'
    >>> _env("GCRA_NONEXISTENT", "default")
    'default'
    """
    import os
    return os.environ.get(key, default)
