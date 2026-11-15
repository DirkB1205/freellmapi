# powershell_set_gitbash.ps1 — .sh auf Git Bash setzen
# Führt Git Bash mit dem Pfad aus, Windows ohne App-Di-Box.

$ErrorActionPreference = 'Stop'

$gbpath = if (Get-Command "git-bash.exe" -ErrorAction SilentlyContinue) {
  (Get-Command "git-bash.exe").Source
} elseif (Get-Command "bash.exe" -ErrorAction SilentlyContinue) {
  (Get-Command "bash.exe").Source
} elseif (Test-Path "C:\Program Files\Git\bin\bash.exe") {
  "C:\Program Files\Git\bin\bash.exe"
} elseif (Test-Path "C:\Program Files\Git\git-bash.exe") {
  "C:\Program Files\Git\git-bash.exe"
} else {
  Write-Warning "Git Bash nicht gefunden. Bitte manuell installieren."
  exit 1
}

Write-Output "Git Bash: $gbpath"

# Registry: HKCU\Software\Classes\.sh\shell\GitBash\command
# %1 = Dateipfad, den Windows bei Doppelklick übergibt
$RegPath = "HKCU:\Software\Classes\.sh\shell\GitBash\command"
$Command = "`"$gbpath`" `"%1`""

Remove-Item $RegPath -Force -ErrorAction SilentlyContinue
New-Item -Path $RegPath -Force | Out-Null
Set-ItemProperty -Path $RegPath -Value $Command

# Icon definieren
$IconPath = "C:\Program Files\Git\git.ico"
if (-not (Test-Path $IconPath)) {
  $IconPath = "C:\Program Files\Git\mingw64\share\git\git-for-windows.ico"
}
Set-ItemProperty -Path $RegPath -Icon $IconPath

Write-Output "Fertig. `.sh`-Dateien starten ab sofort per Doppelklick in Git Bash."
