import sys
import os

sys.path.append(os.path.dirname(__file__))
from core.engine import CodeGuardianEngine

def main():
    workspace = "E:/AI-System 3.0"
    engine = CodeGuardianEngine(workspace)
    
    mode = sys.argv[1] if len(sys.argv) > 1 else "guardian"
    target = sys.argv[2] if len(sys.argv) > 2 else "."
    
    try:
        result = engine.run_mode(mode, target)
        print(f"[Guardian Success] {result}")
        sys.exit(0)
    except Exception as e:
        print(f"[Guardian Error] {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
