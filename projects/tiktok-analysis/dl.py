#!/usr/bin/env python
"""Download TikTok videos from OMNI-INBOX.md links."""
import subprocess
import sys
import re
from pathlib import Path

INBOX = Path("E:/AI-System 3.0/code/OMNI-INBOX.md")
OUTDIR = Path("E:/AI-System 3.0/projects/tiktok-analysis/downloads")
OUTDIR.mkdir(exist_ok=True)

text = INBOX.read_text(encoding="utf-8")
urls = re.findall(r'https://vm\.tiktok\.com/\S+', text)

print(f"Found {len(urls)} TikTok URLs")

for idx, url in enumerate(urls[:10]):
    outtmpl = str(OUTDIR / f"video{idx}.tmp.%(ext)s")
    cmd = [sys.executable, "-m", "yt_dlp",
           "-f", "bestvideo+bestaudio/best",
           "-o", outtmpl,
           "--no-playlist",
           "--quiet",
           url]
    try:
        subprocess.run(cmd, timeout=90, check=True)
        print(f"OK {idx}: {url}")
    except subprocess.TimeoutExpired:
        print(f"TIMEOUT {idx}: {url}")
    except Exception as e:
        print(f"FAIL {idx}: {url} - {e}")

print(f"\nDownloaded to: {OUTDIR}")
