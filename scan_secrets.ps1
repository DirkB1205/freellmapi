# Secret- und Muster-Scan fuer 02_ECC (nur Dateinamen mit Treffern, max. 25)
$patterns = @(
    'sk-[a-zA-Z0-9]{20,}',
    'ghp_[a-zA-Z0-9]{30,}',
    'gho_[a-zA-Z0-9]{30,}',
    'AKIA[0-9A-Z]{16}',
    'AIza[0-9A-Za-z\-_]{30,}',
    'xox[baprs]-[0-9A-Za-z\-]{10,}',
    'BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY',
    'eyJ[A-Za-z0-9]{10,}\.[A-Za-z0-9]{10,}\.[A-Za-z0-9]{5,}'
)
$exts = @('.md','.json','.yaml','.yml','.js','.ts','.mjs','.py','.sh','.ps1')
$root = 'E:\AI-System 3.0\02_ECC'

Get-ChildItem $root -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $exts -contains $_.Extension } |
    ForEach-Object {
        $hits = Select-String -Path $_.FullName -Pattern $patterns -ErrorAction SilentlyContinue
        if ($hits) {
            [PSCustomObject]@{
                File   = $_.FullName.Substring($root.Length)
                Lines  = ($hits | ForEach-Object { $_.LineNumber }) -join ','
                Count  = $hits.Count
            }
        }
    } |
    Select-Object -First 25 |
    Format-Table -AutoSize

Write-Host '--- Secret-Scan abgeschlossen ---'
