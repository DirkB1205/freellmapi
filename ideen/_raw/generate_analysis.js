const fs = require('fs');
const path = require('path');

const rawDir = 'E:/AI-System 3.0/ideen/_raw';
const outDir = 'E:/AI-System 3.0/ideen';

const REA_VID = '7494980446367911190';
const PHOTO_VID = '7694536344315464993';
const NO_REA_VID = '7243096934171381019';

const REA_SECTION = `
## REA-Konzept (Content-Repurposing-Engine)

**Passung zur REA-Strategie:**
- **Content-Repurposing**: Video-Inhalte automatisch in Blogposts, Twitter-Threads, YouTube-Shorts umwandeln. Titel als Seed für KI-Longform.
- **Influencer-Matcher**: Mikro-Influencer via Autoren-Metadaten identifizieren, provisionierte Marken-Deals vermitteln.
- **Trend-Radar**: Keyword-Analyse der Hashtags für Trend-Vorhersagen, Premium-Zugang verkaufen.
- **Engagement-Aggregator**: Drittanbieter-APIs für Views/Likes/Shares aggregieren, Dashboard für Marken.
- **Automatisierter Reporting-Bot**: Wöchentliche Performance-Berichte für Agenturen per PDF/Slack.`;

// Date patterns (ordered by priority)
const datePatterns = [
  /\·\s*(\d{4}-\d{1,2}-\d{1,2})\s*\n/,                        // Y-M-D
  /\·\s*(\d{1,2}-\d{1,2})(?:-\d{1,2})?\s*\n/,                 // M-D or M-D-Y
  /\·\s*Vor\s+([^\n]+)/,                                      // Vor X
];

const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.json')).sort();

for (const file of files) {
  const raw = JSON.parse(fs.readFileSync(path.join(rawDir, file), 'utf8'));
  const vid = raw.vid;
  const user = raw.user;
  const body = raw.body || '';

  // Parse date
  let date = '';
  let dateMatch = null;
  for (const dp of datePatterns) {
    const m = body.match(dp);
    if (m) { dateMatch = m; date = m[1].trim(); break; }
  }

  // Parse title: text after date line, before first # or newline
  let title = 'Unbekannt';
  if (dateMatch) {
    const after = body.slice(dateMatch.index + dateMatch[0].length);
    const hashIdx = after.indexOf('#');
    const lineIdx = after.indexOf('\n');
    const end = Math.max(0, Math.min(
      hashIdx === -1 ? Infinity : hashIdx,
      lineIdx === -1 ? Infinity : lineIdx
    ));
    const t = after.slice(0, end).trim();
    if (t.length > 1) {
      title = t.slice(0, 200);
    }
  }

  // Fallback: text after "mehr"
  if (title === 'Unbekannt') {
    const mi = body.indexOf('mehr');
    if (mi !== -1) {
      const after = body.slice(mi + 4);
      const bi = Math.min(
        after.indexOf('Kommentare') !== -1 ? after.indexOf('Kommentare') : Infinity,
        after.indexOf('Vielleicht') !== -1 ? after.indexOf('Vielleicht') : Infinity,
        after.indexOf('\n\n') !== -1 ? after.indexOf('\n\n') : Infinity
      );
      const t = after.slice(0, bi).trim();
      if (t.length > 1) title = t.slice(0, 200);
    }
  }

  // Parse hashtags
  const hashtags = (body.match(/#[\w\u00c0-\u024f]+/g) || []).slice(0, 10).join(', ');

  // Description = first 1500 chars of title if title known
  const desc = title !== 'Unbekannt' ? title.slice(0, 1500) : '';

  // Parse engagement stats — search after "mehr" for duration + 4 numbers,
  // allowing arbitrary lines in between (KI-Kennzeichnung, Song-Titel, etc.)
  let stats = '';
  let views = '', likes = '', comments = '', shares = '', dur = '';
  const mi = body.indexOf('mehr');
  if (mi !== -1) {
    const after = body.slice(mi);
    // Video: HH:MM / HH:MM followed by 4 numbers
    const sm = after.match(/(\d+:\d+)\s*\/\s*(\d+:\d+)\s*\n(\d+)\s*\n(\d+)\s*\n(\d+)\s*\n(\d+)/);
    if (sm) {
      dur = sm[2];
      views = sm[3]; likes = sm[4]; comments = sm[5]; shares = sm[6];
    } else {
      // Photo: 4 numbers without duration
      const pm = after.match(/(\d+)\s*\n(\d+)\s*\n(\d+)\s*\n(\d+)/);
      if (pm) {
        views = pm[1]; likes = pm[2]; comments = pm[3]; shares = pm[4];
      }
    }
  }

  if (views) {
    stats = `| Metrik | Wert |
|--------|------|
${dur ? `| Dauer | ${dur} |
` : ''}| Views | ${Number(views).toLocaleString('de-DE')} |
| Likes | ${Number(likes).toLocaleString('de-DE')} |
| Kommentare | ${Number(comments).toLocaleString('de-DE')} |
| Shares | ${Number(shares).toLocaleString('de-DE')} |`;
  }

  const isPhoto = vid === PHOTO_VID;
  const includeREA = vid === REA_VID;

  let md = `---
aliases: [${vid}, ${user}]
tags: [TikTok, Analyse${isPhoto ? ', Photo' : ''}]
created: 2026-11-08
---

# ${title}

`;

  if (isPhoto) {
    md += `> **Hinweis:** Dies ist ein **Photo-Post** (kein Video), behandelt als statische Inhalte-Analyse.\n\n`;
  }

  md += `## Metadaten

- **Video-ID:** \`${vid}\`
- **Nutzer:** ${user}
${date ? `- **Datum:** ${date}` : ''}
${hashtags ? `- **Hashtags:** ${hashtags}` : ''}

`;

  if (stats) {
    md += `## Engagement

${stats}

`;
  }

  if (desc) {
    md += `## Beschreibung

${desc}

`;
  }

  md += `## YouTube-Vergleich

- **Format-Transferbarkeit:** ${isPhoto ? 'Photo-Content weniger direkt auf YouTube Shorts übertragbar; stattdessen YouTube Community-Post oder Carousel-Style.' : 'Kurzes Vertical-Video (TikTok-Format) direkt als YouTube-Short nutzbar.'}
- **SEO-Potenzial:** TikTok-Hashtags sind flüchtiger; YouTube profitiert von suchbasiertem Traffic mit längerer Halbwertszeit.
- **Monetarisierung:** YouTube-Partnerprogramm ab 1.000 Abonnenten + 10M Short-Views; TikTok-Creator-Fonds ab 10K Follower + 10K Views/30T.
- **Empfehlung:** ${isPhoto ? 'Photo auf TikTok lassen, ggf. als Pinterest-Pin repurposen.' : 'Content parallel als YouTube-Short hochladen mit optimiertem Titel und Tags für Suchmaschinen.'}

`;

  if (includeREA) {
    md += REA_SECTION + '\n\n';
  }

  const outFile = path.join(outDir, `${vid}.md`);
  fs.writeFileSync(outFile, md, 'utf8');
  console.log(`OK ${vid} (${user}) - ${title.slice(0, 60)}`);
}

console.log(`\nFertig: ${files.length} Dateien erstellt.`);
