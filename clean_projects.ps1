# clean_projects.ps1
# Verschiebt alle nicht-mehr-benoetigten .md-Dateien aus Projekte/ (inkl. Unterordner)
# in Projekte_Altlasten/ mit erhaltener Struktur.
# Die 14 bereits migrierten Dateien in 01_Projekte/ bleiben unangetastet.

$keep = @(
    "AI-SYSTEM.md",
    "AI-SYSTEM-MASTERPLAN-INDEX.md",
    "AI-SYSTEM-CLUSTER-PHASE-B-C.md",
    "AI-SYSTEM-REPO-HYGIENE-2026-10-11.md",
    "AI-SYSTEM-CLIENT-VERSION-AUFTRAG.md",
    "AI-SYSTEM-3-0-Ist-Audit-2026-09-30.md",
    "_STATUS-AUFTRAG-2026-10-28.md",
    "Social-Media-Automation-Monetarisierung-Dashboard.md",
    "PROJEKT-MONITOR.md",
    "ECC-analyse.md",
    "ORCHESTRATOR.md",
    "AI-SYSTEM-CLUSTER-RAEUME-AUFTRAG.md",
    "STAND-2026-09-17_tiktok-app-setup.md",
    "galyarder-framework.md"
)

$src = "E:\AI-System 3.0\Projekte"
$backup = "E:\AI-System 3.0\Projekte_Altlasten"

New-Item -ItemType Directory -Force -Path $backup | Out-Null

$moved = 0
$kept = 0

Get-ChildItem $src -Recurse -File -Filter *.md | ForEach-Object {
    $relPath = $_.FullName.Substring($src.Length).TrimStart('\')
    $destPath = Join-Path $backup $relPath
    $destDir = Split-Path $destPath -Parent
    $isTopLevel = ($_.Directory.FullName -eq $src)

    if ($isTopLevel -and $keep -contains $_.Name) {
        $kept++
    } else {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        Move-Item $_.FullName $destPath -Force
        $moved++
    }
}

Write-Host "Aufraeumen abgeschlossen."
Write-Host "Bleiben behalten (bereits migriert): $kept"
Write-Host "Verschoben nach Projekte_Altlasten: $moved"