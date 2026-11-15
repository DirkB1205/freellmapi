import sys
import json
import re
import os

def load_config():
    config_path = os.path.join(os.path.dirname(__file__), "../config/guardian.json")
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def check_command(cmd):
    config = load_config()
    gates = config.get("gates", {})
    
    if gates.get("destruction", {}).get("enabled", True):
        for blocked in gates["destruction"]["blockCommands"]:
            if blocked.lower() in cmd.lower():
                print(f"[Guardian ERROR] Destruktiver Befehl blockiert: '{blocked}' gefunden in '{cmd}'")
                return False
                
    print(f"[Guardian OK] Befehl freigegeben: {cmd}")
    return True

if __name__ == "__main__":
    test_cmd = sys.argv[1] if len(sys.argv) > 1 else "echo Test"
    success = check_command(test_cmd)
    sys.exit(0 if success else 1)
