@echo off
cd /d "E:\AI-System 3.0"
echo [Guardian Service] Starte Guardian Daemon im Hintergrund...
start /b python projects/code-guardian-engine/scripts/guardian_daemon.py > projects/code-guardian-engine/guardian_daemon.log 2>&1
echo [Guardian Service] Daemon läuft im Hintergrund (Log: projects/code-guardian-engine/guardian_daemon.log).
