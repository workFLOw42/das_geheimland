# Baut die Engine aus dem Flugspiel-Repo nach engine/ und erzeugt index.html (Vorbild: Spiel_SFG).
# Aufruf aus dem Projektordner:  powershell -File tools/build_engine.ps1
# Die Engine bleibt UNVERAENDERT – die Spiellogik haengt sich in story.js per Wrapper ein.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path (Split-Path -Parent $root) 'Flugspiel'
$dst  = Join-Path $root 'engine'
$utf8 = New-Object Text.UTF8Encoding $false
New-Item -ItemType Directory -Force $dst | Out-Null

$html  = [IO.File]::ReadAllText((Join-Path $src 'Flugspiel.html'), $utf8)
$lines = $html -split "`r?`n"

# Der grosse Inline-Script-Block (der erste <script> ohne src) = die Engine
$start = -1; $end = -1
for($i = 0; $i -lt $lines.Count; $i++){
  if($start -lt 0 -and $lines[$i].Trim() -eq '<script>'){ $start = $i; continue }
  if($start -ge 0 -and $lines[$i].Trim() -eq '</script>'){ $end = $i; break }
}
if($start -lt 0 -or $end -lt 0){ throw 'Engine-Script-Block nicht gefunden' }
# Story-Hooks in den Boot-Block (Ende der Engine) einfuegen:
#   STORY_HOOK  – vor updateIslands(): Wrapper setzen, bevor Inseln/Startplatz berechnet werden
#   STORY_START – vor dem ersten requestAnimationFrame(loop): Startszene setzen
$body = $lines[($start+1)..($end-1)]
$iIsl = -1; $iRaf = -1
for($i = $body.Count-1; $i -ge 0; $i--){
  if($iRaf -lt 0 -and $body[$i] -eq 'requestAnimationFrame(loop);'){ $iRaf = $i }
  if($iIsl -lt 0 -and $body[$i] -eq 'updateIslands();'){ $iIsl = $i }
}
if($iIsl -lt 0 -or $iRaf -lt 0 -or $iIsl -gt $iRaf){ throw 'Boot-Block nicht gefunden' }
$body = @($body[0..($iIsl-1)]) + 'if(window.STORY_HOOK) STORY_HOOK();' + @($body[$iIsl..($iRaf-1)]) +
        'if(window.STORY_START) STORY_START();' + @($body[$iRaf..($body.Count-1)])
$engine = "// AUTOMATISCH ERZEUGT aus ../Flugspiel/Flugspiel.html (tools/build_engine.ps1) – nicht von Hand aendern`n" +
          ($body -join "`n") + "`n"

# Engine-Funktionen, die story.js per Namen ersetzt (Spiel_SFG ENGINE_RISIKEN R16): benennt das
# Flugspiel eine davon um, bricht der Wrapper still – deshalb hier laut abbrechen.
$noetig = 'loop','updateEva','makeAstronaut','findStart','placeAtStart','evaExit','updateHUD','updateSpaceBlend',
          'cycleModel','spawnFire','aiFindFireIsland','_islandInfoCalc','carrierInfo','preloadHarbor','preloadHangar',
          'preloadFord','enterHangar','harborSubNear','harborBoatLocal','evaStartJet','evaFootY','islandInfo',
          'isOnLand','hitsBuilding','toggleSound','flashFade'
$fehlt = $noetig | Where-Object { $engine -notmatch ('(?m)^function ' + [regex]::Escape($_) + '\(') }
if($fehlt){ throw ('Engine-Funktionen fehlen (umbenannt?): ' + ($fehlt -join ', ')) }
[IO.File]::WriteAllText((Join-Path $dst 'engine.js'), $engine, $utf8)

# Kopf + HUD-Markup (alles vor dem Engine-Block), Script-Pfade auf engine/ umbiegen
$head = @()
$assets = @()
foreach($ln in $lines[0..($start-1)]){
  if($ln -match '<link rel="manifest"'){ continue }          # noch keine eigene PWA
  if($ln -match '<script src="([^"]+)"></script>'){ $assets += $Matches[1]; $head += ($ln -replace 'src="', 'src="engine/'); continue }
  $ln = $ln -replace '<title>Flugspiel</title>', '<title>Das Geheimland</title>'
  $ln = $ln -replace 'content="Flugspiel"', 'content="Das Geheimland"'
  $head += $ln
}
foreach($a in $assets){ Copy-Item -Force (Join-Path $src $a) (Join-Path $dst $a) }

# Eigene Modelle als eingebettete GLBs (wie die Flugspiel-Modelle): models/<name>.glb -> <name>_glb.js
$modelle = [ordered]@{ figur = 'FIGUR_GLB'; fuchs = 'FUCHS_GLB'; lagerfeuer = 'LAGERFEUER_GLB'; segelboot = 'SEGELBOOT_GLB';
             notizbuch = 'NOTIZBUCH_GLB'; stift = 'STIFT_GLB'; kompass = 'KOMPASS_GLB'; messer = 'MESSER_GLB'; lupe = 'LUPE_GLB'; kamera = 'KAMERA_GLB'; rucksack = 'RUCKSACK_GLB' }
$skripte = @()
foreach($n in $modelle.Keys){
  $p = Join-Path $root "models\$n.glb"
  if(-not (Test-Path $p)){ Write-Warning "models\$n.glb fehlt"; continue }
  $b = [IO.File]::ReadAllBytes($p)
  [IO.File]::WriteAllText((Join-Path $root "${n}_glb.js"),
    "window.$($modelle[$n]) = `"data:model/gltf-binary;base64," + [Convert]::ToBase64String($b) + "`";`n", $utf8)
  $skripte += "${n}_glb.js"
}
# Toene: sounds/<name>.mp3 -> <name>_snd.js (window.<NAME>_SND)
foreach($n in @('gitarre', 'funk')){
  $p = Join-Path $root "sounds\$n.mp3"
  if(-not (Test-Path $p)){ Write-Warning "sounds\$n.mp3 fehlt"; continue }
  $b = [IO.File]::ReadAllBytes($p)
  [IO.File]::WriteAllText((Join-Path $root "${n}_snd.js"),
    "window.$($n.ToUpper())_SND = `"data:audio/mpeg;base64," + [Convert]::ToBase64String($b) + "`";`n", $utf8)
  $skripte += "${n}_snd.js"
}
# Moewen kommen fertig aus Spiel_SFG (moewe_glb.js, MOEWE_SITZ_GLB + MOEWE_FLUG_GLB)
if(Test-Path (Join-Path $root 'moewe_glb.js')){ $skripte += 'moewe_glb.js' }
$skripte += 'story.js'
$skripte += 'objekte.js'
$skripte += 'sternbilder.js'
$skripte += 'texturen.js'
$skripte += 'insel.js'
$skripte += 'steg.js'
$skripte += 'huette_innen.js'
$skripte += 'ausruestung.js'

$out = ($head -join "`n") + "`n" +
  (($skripte | ForEach-Object { '<script src="' + $_ + '"></script>' }) -join "`n") + "`n" +
  '<script src="engine/engine.js"></script>' + "`n" +
  "</body>`n</html>`n"
[IO.File]::WriteAllText((Join-Path $root 'index.html'), $out, $utf8)
"engine.js: $([math]::Round($engine.Length/1KB)) KB, $($assets.Count) Assets kopiert, $($skripte.Count - 6) Modelle/Toene, index.html erzeugt"
