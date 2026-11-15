# Ollama-Hintergrundverbesserung: Modelle aktuell halten, benchmarken, warmhalten.
# Parameter:
#   -Full   : auch große Modelle (30b/27b/26b) pullen (wöchentlich empfohlen)
# Laeuft geplant (Task Scheduler, täglich 03:00) oder manuell.
param([switch]$Full)

$ErrorActionPreference = "Continue"
$root = "E:\AI-System 3.0"
$logDir = Join-Path $root "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
$log = Join-Path $logDir "ollama-improve.log"
$ollama = "C:\Users\DirkBieler\AppData\Local\Programs\Ollama\ollama.exe"
$pullTimeoutSec = 300

function Log($msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg"
    Add-Content -Path $log -Value $line -Encoding UTF8
    Write-Host $line
}

Log "=== Start Ollama-Verbesserungslauf (Full=$Full) ==="

# Schnelle Notfall-Modelle (immer)
$fastModels = @("qwen3.5:2b", "qwen3-vl:2b", "codellama:latest")
# Große Modelle (nur mit -Full)
$bigModels = @("qwen3-coder:30b", "qwen3.8:27b", "gemma4:26b", "coder-optimized:latest", "coder-fast:latest")

$models = $fastModels
if ($Full) { $models += $bigModels }

# 1) Modelle aktualisieren (inkrementell, mit Timeout)
foreach ($m in $models) {
    Log "Pull: $m"
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $ollama
        $psi.Arguments = "pull $m"
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.UseShellExecute = $false
        $psi.CreateNoWindow = $true
        $p = [System.Diagnostics.Process]::Start($psi)
        if (-not $p.WaitForExit($pullTimeoutSec * 1000)) {
            try { $p.Kill() } catch {}
            Log "  TIMEOUT nach ${pullTimeoutSec}s - abgebrochen"
            continue
        }
        $out = $p.StandardOutput.ReadToEnd() + "`n" + $p.StandardError.ReadToEnd()
        $last = ($out -split "`n" | Where-Object { $_.Trim() } | Select-Object -Last 1)
        if (-not $last) { $last = "exit $($p.ExitCode)" }
        Log "  -> $last"
    } catch {
        Log "  FEHLER beim Pull $m : $($_.Exception.Message)"
    }
}

# 2) Warmup + Benchmark der schnellen Modelle
Log "--- Warmup (schnelle Modelle) ---"
foreach ($m in $fastModels) {
    try {
        $body = @{ model = $m; prompt = "warmup"; stream = $false; keep_alive = "24h" } | ConvertTo-Json -Compress
        Invoke-RestMethod "http://127.0.0.1:11434/api/generate" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 180 | Out-Null
        Log "  $m warmup OK"
    } catch {
        Log "  $m warmup FEHLER: $($_.Exception.Message)"
    }
}

Log "--- Benchmark (schnelle Modelle) ---"
$results = @()
foreach ($m in $fastModels) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $body = @{ model = $m; prompt = "Antworte mit einem Wort: OK"; stream = $false } | ConvertTo-Json -Compress
        $r = Invoke-RestMethod "http://127.0.0.1:11434/api/generate" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 180
        $sw.Stop()
        $ms = $sw.ElapsedMilliseconds
        $txt = ($r.response -replace "`n"," ").Trim()
        Log "  $m : ${ms}ms -> $txt"
        $results += [pscustomobject]@{ Model = $m; Ms = $ms; Ok = $true }
    } catch {
        $sw.Stop()
        Log "  $m : FEHLER $($_.Exception.Message)"
        $results += [pscustomobject]@{ Model = $m; Ms = 999999; Ok = $false }
    }
}

# 3) Schnellstes funktionierendes Modell warmhalten (keep_alive 24h)
$fastest = $results | Where-Object { $_.Ok } | Sort-Object Ms | Select-Object -First 1
if ($fastest) {
    Log "Warmhalte schnellstes Modell: $($fastest.Model) ($($fastest.Ms)ms)"
    try {
        $body = @{ model = $fastest.Model; prompt = "warmup"; stream = $false; keep_alive = "24h" } | ConvertTo-Json -Compress
        Invoke-RestMethod "http://127.0.0.1:11434/api/generate" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 120 | Out-Null
        Log "  Warmup OK"
    } catch {
        Log "  Warmup FEHLER: $($_.Exception.Message)"
    }
}

Log "=== Ende ==="
Log ""
