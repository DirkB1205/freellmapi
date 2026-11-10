---
tags: [Fehler, MoviePy, TextClip, API-Change, YouTube-Shorts]
created: 2026-11-07
updated: 2026-11-07
status: gelöst
Projekt: youtube-shorts-generator
Task: t-58be5c42a2
---

# Fehler: MoviePy 2.x `TextClip`-Signatur geändert

## Symptom

```
TypeError: argument 1 must be string, not NoneType
```

Beim Aufruf von `TextClip(text=text, font=get_font_path(), ...)` im Skript `generate_video.py`, Funktion `create_text_overlay()`.

## Kontext

- MoviePy 2.1.2 installiert
- `from moviepy.video.VideoClip import TextClip` (Zeile 30)
- Vor dem Upgrade auf MoviePy 2.x funktionierte der Aufruf mit `text` als erstem Positionsargument

## Ursache

MoviePy 2.x hat die `TextClip`-Signatur geändert:

```python
# MoviePy 1.x (alt)
TextClip(text, font=None, ...)

# MoviePy 2.x (neu)
TextClip(font, text=None, ...)
```

Das erste Positionsargument ist nun `font`, nicht `text`. Wird `text` als erstes Argument übergeben, wird es als `font` interpretiert — bei fehlendem Font-Wert (`None`) wirft Python einen `TypeError`.

## Lösung

`font` als erstes Positionsargument, `text` als Keyword übergeben:

```python
return TextClip(
    font=get_font_path(),
    text=text,
    font_size=font_size,
    size=(WIDTH - 120, None),
    method="caption",
    text_align="center",
    horizontal_align="center",
)
```

## Verifikation

- `python generate_video.py --max-seconds 1` → Exit-Code 0
- `media/output/short.mp4` → 133 KB, 1.0s
- Kein `TextClip`-Fehler mehr

## Lerneffekt

- MoviePy 2.x Breaking Changes immer prüfen: `TextClip`, `CompositeVideoClip`, Audio-Clip-API
- Signatur-Check vor Implementierung: `inspect.signature(TextClip)`

## Status

**Gelöst** — Fix implementiert, E2E-Test bestanden, Beleg dokumentiert.