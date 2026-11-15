import os
import sys
import subprocess

def main():
    print("[Multi-Agent Guardian Runner] Starte automatisierte Prüfungen für alle Sub-Projekte...")
    
    root_dir = "E:/AI-System 3.0"
    projects = [d for d in os.listdir(os.path.join(root_dir, "projects")) if os.path.isdir(os.path.join(root_dir, "projects", d))]
    
    for proj in projects:
        proj_path = os.path.join(root_dir, "projects", proj)
        print(f"\n--- Prüfe Projekt: {proj} ---")
        cmd = [sys.executable, os.path.join(root_dir, "projects/code-guardian-engine/guardian.py"), "audit", proj_path]
        result = subprocess.run(cmd, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)

    print("\n[Multi-Agent Guardian Runner] Alle Projekte erfolgreich durch den Guardian geprüft!")

if __name__ == "__main__":
    main()
