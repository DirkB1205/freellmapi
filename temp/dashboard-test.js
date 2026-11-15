const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== Dashboard Test Start ===');
  console.log('URL: http://localhost:8600/dashboard\n');

  try {
    // Schritt 1: Navigation
    await page.goto('http://localhost:8600/dashboard', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('✓ Seite geladen');

    // Schritt 2: Ideen-Block finden
    const ideenBlock = await page.$('.content-ideas-block, [data-testid="ideas-block"], .ideas-section');
    const ideenBlockVisible = ideenBlock !== null && await ideenBlock.isVisible();
    console.log(`Ideen-Block sichtbar: ${ideenBlockVisible ? '✓ JA' : '✗ NEIN'}`);

    // Schritt 3: Tabelle prüfen
    const table = await page.$('table.ideas-table, .ideas-table table, [data-testid="ideas-table"]');
    const tableVisible = table !== null && await table.isVisible();
    console.log(`Tabelle gerendert: ${tableVisible ? '✓ JA' : '✗ NEIN'}`);

    if (tableVisible) {
      // Spaltenüberschriften prüfen
      const headers = await page.$$eval('table th, .ideas-table th', ths => ths.map(th => th.textContent.trim()));
      console.log(`Tabellenspalten: ${headers.join(', ') || '(keine)'}`);

      // Datenzeilen prüfen
      const rows = await page.$$eval('table tbody tr, .ideas-table tbody tr', trs => trs.length);
      console.log(`Anzahl Ideen-Zeilen: ${rows}`);
    }

    // Schritt 4: Anzahl-Anzeige prüfen
    const countText = await page.$eval('.ideas-count, [data-testid="ideas-count"], h2, h3', 
      el => el.textContent.trim()).catch(() => null);
    console.log(`Anzeige-Text: ${countText || '(nicht gefunden)'}`);

    // Schritt 5: Fallback prüfen (wenn leer)
    const fallback = await page.$('.empty-state, .no-ideas, .fallback-message');
    const fallbackVisible = fallback !== null && await fallback.isVisible();
    console.log(`Fallback sichtbar: ${fallbackVisible ? '✓ JA' : '✗ NEIN (Daten vorhanden)'}`);

    // Screenshot für Dokumentation
    await page.screenshot({ path: 'E:\\AI-System 3.0\\temp\\dashboard-screenshot.png', fullPage: true });
    console.log('\n✓ Screenshot gespeichert: temp\\dashboard-screenshot.png');

    // Alle Probleme sammeln
    const problems = [];
    if (!ideenBlockVisible) problems.push('✗ Ideen-Block nicht sichtbar');
    if (!tableVisible) problems.push('✗ Tabelle nicht gerendert');
    if (!countText) problems.push('✗ Anzahl-Anzeige fehlt');

    console.log('\n=== Zusammenfassung ===');
    if (problems.length === 0) {
      console.log('✓ Alle Tests bestanden - Dashboard korrekt dargestellt');
    } else {
      console.log('Gefundene Probleme:');
      problems.forEach(p => console.log(`  ${p}`));
    }

  } catch (error) {
    console.error(`\n✗ Test fehlgeschlagen: ${error.message}`);
    console.error('Mögliche Ursachen:');
    console.error('  - Server läuft nicht auf Port 8600');
    console.error('  - Dashboard-Route nicht definiert');
    console.error('  - CORS-Fehler oder Netzwerkproblem');
  }

  await browser.close();
})();
