import time
import subprocess
import sys
import os

DAEMON_INTERVAL = 60  # Prüfintervall in Sekunden

def main():
    print("[Guardian Daemon] Gestartet. Überwache Projekte und Inbox im Hintergrund...")
    while True:
        try:
            print("[Guardian Daemon] Führe automatischen Rundum-Audit aus...")
            subprocess.run([sys.executable, "projects/code-guardian-engine/scripts/run_all_agents.py"], check=True)
        except Exception as e:
            print(f"[Guardian Daemon Fehler] {e}")
        
        time.sleep(DAEMON_INTERVAL)

if __name__ == "__main__":
    main()
