#!/usr/bin/env python
"""Analyze TikTok videos for monetization potential."""
import json
import subprocess
from pathlib import Path

DOWNLOADS = Path("E:/AI-System 3.0/projects/tiktok-analysis/downloads")
OUTPUT = Path("E:/AI-System 3.0/04_Learnings/SocialMediaAutomation")
OUTPUT.mkdir(exist_ok=True)

def analyze_video(video_path):
    """Run ffmpeg analysis on a video file."""
    cmd = [
        "ffprobe",
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,fps,codec_name",
        "-of", "json",
        str(video_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

def analyze_all_videos():
    """Analyze all downloaded videos and save results."""
    results = {}
    for video_file in DOWNLOADS.glob("video*.mp4"):
        try:
            analysis = analyze_video(video_file)
            results[video_file.stem] = json.loads(analysis)
        except Exception as e:
            results[video_file.stem] = {"error": str(e)}
    
    # Save results
    output_file = OUTPUT / "tiktok_analysis.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    analyze_all_videos()
    print(f"Analysis complete. Results saved to: {OUTPUT}")
