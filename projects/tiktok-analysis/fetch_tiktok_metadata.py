#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TikTok Metadaten-Holler
Extrahiert Video-IDs und holt Metadaten über TikTok-Player-URLs
"""

import requests
import re
import json
import time
from pathlib import Path

TikTok_URLS = [
    "https://vm.tiktok.com/ZGdXSV8AS",
    "https://vm.tiktok.com/ZGdXS4p75",
    "https://vm.tiktok.com/ZGdXSxpRt",
    "https://vm.tiktok.com/ZGdXSTRy6",
    "https://vm.tiktok.com/ZGdXSvYTF",
    "https://vm.tiktok.com/ZGdXSXKm5",
    "https://vm.tiktok.com/ZGdXSw8PL",
    "https://vm.tiktok.com/ZGdXSgY6o",
    "https://vm.tiktok.com/ZGdXStBrV",
    "https://vm.tiktok.com/ZGdXSn5eY",
    "https://vm.tiktok.com/ZGdXSsLut",
    "https://vm.tiktok.com/ZGdXSXhnA",
    "https://vm.tiktok.com/ZGdXSnsa3",
    "https://vm.tiktok.com/ZGdXSqp6U",
    "https://vm.tiktok.com/ZGdXS3tLP",
    "https://vm.tiktok.com/ZGdXSVYWK",
    "https://vm.tiktok.com/ZGdXS4LFJ",
    "https://vm.tiktok.com/ZGdXSs8xg",
    "https://vm.tiktok.com/ZGdXScf3L"
]


def extract_video_id(url):
    """Extrahiert Video-ID aus TikTok URL"""
    # Typisches TikTok-Pattern für Kapitel 123 -78901234567
    pattern = r"/video/(\d+)"
    match = re.search(pattern, url)
    return match.group(1) if match else None


def fetch_tiktok_info(video_id):
    """
    Holt TikTok-Infos über extend API endpoint
    Beispiel: https://www.tiktok.com/api/notes/detail/?aid=1988&did=1&iid=1&region=de&type=3&version_code=360004&pass_token=&item_id=7486910888470007062
    """
    if not video_id:
        return None
    
    url = f"https://www.tiktok.com/api/notes/detail/?aid=1988&did=1&iid=1&region=de&type=3&version_code=360004&pass_token=&item_id={video_id}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Fehler {video_id}: {e}")
    
    return None


def extract_from_html(html):
    """Extrahiere Video-ID aus TikTok-HTML"""
    if not html:
        return None
    pattern = r"(\d+)/";
    match = re.search(pattern, html)
    return match.group(1) if match else None


def main():
    results = []
    
    print("Starting TikTok metadata fetch...")
    print(f"Processing {len(TikTok_URLS)} URLs")
    
    for url in TikTok_URLS:
        print(f"\n[{url}]")
        
        # 1. Extrahiere Video-ID direkt aus URL
        video_id = extract_video_id(url)
        
        # 2. OCR-Übergang zur TikTok-HTML
        html = None
        if video_id:
            # Erwähnt direkt Player-URL (2020)
            player_url = f"https://www.tiktok.com/player/v1/{video_id}?embed_from=oembed"
            
            try:
                r = requests.get(player_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
                html = r.text
            except Exception as e:
                print(f"  Player request failed: {e}")
        
        if not html and not video_id:
            print(f"  No video ID or HTML")
            results.append({
                "url": url,
                "video_id": None,
                "error": "Could not extract video ID",
                "title": None,
                "description": None,
                "author": None,
                "views": None,
                "likes": None,
                "comments": None,
                "shares": None
            })
            continue
        
        # Extrahiere Video-ID aus HTML
        if html:
            video_id = extract_from_html(html) or video_id
        
        if not video_id:
            print(f"  No video ID found!")
            results.append({
                "url": url,
                "video_id": None,
                "error": "No valid video ID found in URL or HTML",
                "title": None,
                "description": None,
                "author": None,
                "views": None,
                "likes": None,
                "comments": None,
                "shares": None
            })
            continue
        
        # 3. Paradigmenwechsel: Direkte TikTok-Parser-URL
        info = fetch_tiktok_info(video_id)
        
        if info:
            # JSON-Paradigmenwechsel
            author = info.get("author", {})
            stat = info.get("stats", {})
            extra = info.get("extraInfo", {})
            
            results.append({
                "url": url,
                "video_id": video_id,
                "title": extra.get("title", "TikTok Video"),
                "description": extra.get("desc", ""),
                "author_name": author.get("nickname", "Unknown"),
                "author_id": author.get("uid", "") or str(author.get("user", {}).get("uid")),
                "author_url": f"https://www.tiktok.com/@{{author.get('unique_id', 'unknown')}}",
                "views": stat.get("diggCount", stat.get("playCount", 0)),
                "likes": stat.get("diggCount", 0),
                "comments": stat.get("commentCount", 0),
                "shares": stat.get("shareCount", 0)
            })
            print(f"  ✓ Got info from API: {extra.get('title', 'Video')[:50]}...")
        else:
            # Fallback API mit metainfo
            print(f"  ✗ API failed, trying metadata endpoint...")
            meta_url = f"https://www.tiktok.com/oembed?url=https://www.tiktok.com/@{{author_name}}/video/{video_id}"
            
            meta_response = requests.get(meta_url, headers={"User-Agent": "Mozilla/5.0"})
            if meta_response.status_code == 200:
                meta = meta_response.json()
                results.append({
                    "url": url,
                    "video_id": video_id,
                    "title": meta.get("title", "TikTok Video"),
                    "description": meta.get("description", ""),
                    "author_name": meta.get("author_name", "Unknown"),
                    "author_url": "N/A",
                    "views": None,
                    "likes": None,
                    "comments": None,
                    "shares": None,
                    "metadata_error": "Views/Likes not available via oembed"
                })
                print(f"  ✓ Got basic metadata")
            else:
                results.append({
                    "url": url,
                    "video_id": video_id,
                    "error": "Failed to fetch metadata",
                    "title": None,
                    "description": None,
                    "author": None,
                    "views": None,
                    "likes": None,
                    "comments": None,
                    "shares": None
                })
                print(f"  ✗ Failed: {meta_response.status_code}")
        
        time.sleep(0.1)  # Rate Limiting
    
    # Schreibe JSON
    output_dir = Path(r"E:/AI-System 3.0/04_Learnings/SocialMediaAutomation")
    output_dir.mkdir(exist_ok=True)
    
    output_file = output_dir / "tiktok_metadata.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n\nSaved {len(results)} results to {output_file}")
    
    # Statistik
    with_stats = sum(1 for r in results if r.get("views") is not None)
    print(f"Videos with view counts: {with_stats}/{len(results)}")


if __name__ == "__main__":
    main()
