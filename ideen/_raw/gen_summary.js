const fs = require('fs');
const dir = 'E:/AI-System 3.0/ideen';
const ids = fs.readdirSync(dir)
  .filter(f => f.endsWith('.md') && f !== 'gesamtsummary.md')
  .sort();

const rows = [];
for (const id of ids) {
  const md = fs.readFileSync(dir + '/' + id, 'utf8');
  const lines = md.split('\n');
  // Titel ist die erste Zeile, die mit "# " beginnt (nach Frontmatter)
  let title = '';
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) {
      title = lines[i].replace(/^#\s*/, '').trim();
      break;
    }
  }
  const views = md.match(/\| Views \| ([\d.]+) \|/)[1];
  const likes = md.match(/\| Likes \| ([\d.]+) \|/)[1];
  const comments = md.match(/\| Kommentare \| ([\d.]+) \|/)[1];
  const shares = md.match(/\| Shares \| ([\d.]+) \|/)[1];
  const escTitle = title.replace(/\|/g, '\\|');
  rows.push('| `' + id + '` | ' + escTitle + ' | ' + views + ' | ' + likes + ' | ' + comments + ' | ' + shares + ' |');
}

const header = '# Gesamtsummary — TikTok-Shortlink-Analyse\n\n';
const sub = 'Analysezeitpunkt: 2026-11-08 · 19 Videos · Quelle: TikTok-DOM-Daten (keine Downloads)\n\n';
const table = '| Video-ID | Titel | Views | Likes | Kommentare | Shares |\n|-----------|-------|-------|-------|------------|--------|\n' + rows.join('\n') + '\n';
const footer = '\n## Hinweis\n\n- Titel mit Pipe-Zeichen (`|`) wurden in der Markdown-Tabelle als `\\|` escapet.\n- Metriken stammen aus den DOM-Daten der jeweiligen TikTok-Seite.\n- Alle Analysen enthalten einen YouTube-Vergleich (Format-Transferbarkeit, SEO-Potenzial, Monetarisierung, Empfehlung).\n';

fs.writeFileSync(dir + '/gesamtsummary.md', header + sub + table + footer, 'utf8');
console.log('Gesamtsummary geschrieben: ' + rows.length + ' Zeilen');