import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.engine import CodeGuardianEngine

def test_engine():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    engine = CodeGuardianEngine(root)
    
    modes = ["plan", "code-build", "guardian", "audit", "review-delivery"]
    for m in modes:
        res = engine.run_mode(m)
        assert res["status"] == "SUCCESS", f"Modus {m} fehlgeschlagen!"
        
    print("[TEST PASS] Alle 5 Modi der Code Guardian Engine erfolgreich durchlaufen!")

if __name__ == "__main__":
    test_engine()
