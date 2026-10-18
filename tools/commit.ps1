# Commit mit automatisch hochgezaehlter PWA-Cache-Version (sw.js) - wie in "Reise nach Japan".
# Aufruf:  powershell -File tools/commit.ps1 "Commit-Nachricht"
#      oder powershell -File tools/commit.ps1 -Datei nachricht.txt   (mehrzeilig)
# Zaehlt nur hoch, wenn sich eine gecachte Datei (nicht Doku/Tools/Modelle) aendert; den Modell-Cache nur,
# wenn sich ein Modell oder grosser Sound (*_glb.js, *_snd.js) aendert.
param([string]$Nachricht, [string]$Datei)
if(-not $Nachricht -and -not $Datei){ throw 'Nachricht oder -Datei angeben' }
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
git add -A
$staged = git diff --cached --name-only
if(-not $staged){ 'Nichts zu committen.'; exit 0 }
$relevant = $staged | Where-Object { $_ -notmatch '^([^/]*\.md|\.gitignore|\.nojekyll|sw\.js|tools/.*|models/.*)$' }
if($relevant){
  $sw = Join-Path $root 'sw.js'
  $utf8 = New-Object Text.UTF8Encoding $false
  $t = [IO.File]::ReadAllText($sw, $utf8)
  $headT = ''; if(git ls-tree --name-only HEAD sw.js){ $headT = (git show HEAD:sw.js) -join "`n" }   # gibt es sw.js schon in HEAD?
  # erster Commit mit sw.js (kein HEAD-Stand): die Version in der Datei gilt so, wie sie ist
  $alt = if($headT){ [int]([regex]::Match($headT, 'das-geheimland-v(\d+)').Groups[1].Value) } else { [int]([regex]::Match($t, 'das-geheimland-v(\d+)').Groups[1].Value) - 1 }
  $neu = $alt + 1
  $t = [regex]::Replace($t, 'das-geheimland-v\d+', "das-geheimland-v$neu")
  [IO.File]::WriteAllText($sw, $t, $utf8)
  if($headT -and ($staged | Where-Object { $_ -match '_(glb|snd)\.js$' })){
    $t = [IO.File]::ReadAllText($sw, $utf8)
    $mAlt = [int]([regex]::Match($headT, 'das-geheimland-modelle-v(\d+)').Groups[1].Value)
    $t = [regex]::Replace($t, 'das-geheimland-modelle-v\d+', "das-geheimland-modelle-v$($mAlt + 1)")
    [IO.File]::WriteAllText($sw, $t, $utf8)
    "Modell-Cache: v$mAlt -> v$($mAlt + 1)"
  }
  git add sw.js
  "PWA-Cache: v$alt -> v$neu"
}
if($Datei){ git commit -q -F $Datei } else { git commit -q -m $Nachricht }
git log --oneline -1
