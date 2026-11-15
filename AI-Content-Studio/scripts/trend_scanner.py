#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Trendscanner & Viralitäts-Score Rechner für AI-Content-Studio.
Durchsucht lokale RSS-Feeds und APIs, bewertet nach Virality-Score (40% Engagement, 25% Shares, 20% Kommentare, 10% Likes, 5% Aktualität).
"""

import json
import os
from datetime import datetime

def calculate_virality_score(engagement, shares, comments, likes, freshness_hours):
    # Score 0-100
    score = (
        min(engagement / 1000.0, 1.0) * 40 +
        min(shares / 500.0, 1.0) * 25 +
        min(comments / 200.0, 1.0) * 20 +
        min(likes / 2000.0, 1.0) * 10 +
        max(0.0, (1.0 - freshness_hours / 72.0)) * 5
    )
    return round(score, 2)

if __name__ == "__main__":
    print("AI-Content-Studio Trendscanner gestartet.")
    sample_trend = {
        "title": "Lokale LLMs mit Qwen 2.5 & Ollama unter Windows 11",
        "platform": "Reddit",
        "engagement": 1500,
        "shares": 300,
        "comments": 150,
        "likes": 2500,
        "freshness_hours": 12
    }
    score = calculate_virality_score(
        sample_trend["engagement"],
        sample_trend["shares"],
        sample_trend["comments"],
        sample_trend["likes"],
        sample_trend["freshness_hours"]
    )
    sample_trend["virality_score"] = score
    
    os.makedirs("E:/AI-System 3.0/AI-Content-Studio/trends", exist_ok=True)
    out_path = "E:/AI-System 3.0/AI-Content-Studio/trends/latest_trends.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump([sample_trend], f, indent=2, ensure_ascii=False)
    print(f"Trendanalyse gespeichert in {out_path} (Score: {score})")
