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
  # eigene PWA (manifest.json, sw.js, pwa.js - wie in Reise nach Japan): Manifest und Icon des Geheimlands statt des Flugspiels
  if($ln -match '<link rel="manifest"'){ $head += '<link rel="manifest" href="manifest.json">'; $head += '<link rel="apple-touch-icon" href="icon-192.png">'; continue }
  if($ln -match '<link rel="apple-touch-icon"'){ continue }
  $ln = $ln -replace '<meta name="theme-color" content="[^"]*">', '<meta name="theme-color" content="#0e1a3a">'
  # Engine-Modelle, die dieses Spiel nie zeigt (Analyse 23.10.2026: kein Weltall, kein Modellwechsel ...) - nicht mitliefern,
  # dann passen auch die Danksagungen (README) genau zu dem, was im Spiel ist. Alle Lader der Engine pruefen, ob die Datei da ist.
  if($ln -match '<script src="([a-z0-9_]+)_glb\.js"></script>' -and (' canadair alphajet airbus transall parachute falcon astronaut dinghy ford harbor xwing_alt earth crater mars sun spacedrive asteroid marsground moonbase iss shuttle razor serenity rover lunar destroyer enterprise rocket pad ' -match (' ' + $Matches[1] + ' '))){ continue }
  # Todesstern (Lizenz CC-BY-NC-ND): gehoert nicht zu diesem Spiel - die Datei wird gar nicht erst kopiert (story.js ohneTodesstern)
  if($ln -match '<script src="deathstar_glb\.js"></script>'){ continue }
  # Hangar: in diesem Spiel landet man nirgends im Hangar (story.js ohneTodesstern) - das Modell wird nicht kopiert
  if($ln -match '<script src="hangar_glb\.js"></script>'){ continue }
  if($ln -match '<script src="([^"]+)"></script>'){ $assets += $Matches[1]; $head += ($ln -replace 'src="', 'src="engine/'); continue }
  $ln = $ln -replace '<title>Flugspiel</title>', '<title>Das Geheimland</title>'
  $ln = $ln -replace 'content="Flugspiel"', 'content="Das Geheimland"'
  $head += $ln
}
foreach($a in $assets){ Copy-Item -Force (Join-Path $src $a) (Join-Path $dst $a) }

# Eigene Modelle als eingebettete GLBs (wie die Flugspiel-Modelle): models/<name>.glb -> <name>_glb.js
$modelle = [ordered]@{ figur = 'FIGUR_GLB'; fuchs = 'FUCHS_GLB'; lagerfeuer = 'LAGERFEUER_GLB'; segelboot = 'SEGELBOOT_GLB';
             notizbuch = 'NOTIZBUCH_GLB'; stift = 'STIFT_GLB'; kompass = 'KOMPASS_GLB'; messer = 'MESSER_GLB'; lupe = 'LUPE_GLB'; kamera = 'KAMERA_GLB'; rucksack = 'RUCKSACK_GLB';
             holzfuchs = 'HOLZFUCHS_GLB'; schmetterling = 'SCHMETTERLING_GLB';
             # Waldinsel (Etappe 2): Tiere am Festtisch (WildPoly3D, nur die gebrauchten Clips - C:\tmp\gt\tiere.mjs)
             gorilla = 'GORILLA_GLB'; entchen = 'ENTCHEN_GLB'; hase = 'HASE_GLB'; hasenbaby = 'HASENBABY_GLB'; eule = 'EULE_GLB'; elch = 'ELCH_GLB'; reh = 'REH_GLB'; vogel_blau = 'VOGEL_BLAU_GLB'; vogel_meise = 'VOGEL_MEISE_GLB';
             # Wueste (Etappe 4): das Observatorium des Hamsters ("Welcome to the Observatory" von XelaDoesArt, CC-BY-4.0)
             observatorium = 'OBSERVATORIUM_GLB';
             # Im Observatorium: Teleskop ("Telescope realistic" von Raphael Grimm) und der Hamster (josephineburns, CC-BY-4.0)
             teleskop = 'TELESKOP_GLB'; hamster = 'HAMSTER_GLB';
             # Durch das Teleskop: Sonne, Mond, Planeten und Pluto (Akshat, CC-BY-4.0; die Erde fehlt – auf ihr steht man)
             planet_sonne = 'PLANET_SONNE_GLB'; planet_merkur = 'PLANET_MERKUR_GLB'; planet_venus = 'PLANET_VENUS_GLB'; planet_mond = 'PLANET_MOND_GLB';
             planet_mars = 'PLANET_MARS_GLB'; planet_jupiter = 'PLANET_JUPITER_GLB'; planet_saturn = 'PLANET_SATURN_GLB'; planet_uranus = 'PLANET_URANUS_GLB';
             planet_neptun = 'PLANET_NEPTUN_GLB'; planet_pluto = 'PLANET_PLUTO_GLB';
             # Draussen: der Schluessel fuer das Raumschiff des Hamsters ("Key Wooden" von Sam, CC-BY-4.0)
             schluessel = 'SCHLUESSEL_GLB';
             # See der Oase: Meeresschildkroete und Baby (Low Poly, animiert, WildPoly3D, CC-BY-NC-4.0)
             meeresschildkroete = 'MEERESSCHILDKROETE_GLB'; meeresschildkroete_baby = 'MEERESSCHILDKROETE_BABY_GLB' }
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
# eule, holz: Waldgeraeusche der Waldinsel (Pixabay: freesound_community 'owl', Dragon Studio 'breaking wood')
# gorilla: Brummen aus der Hoehle (Pixabay: flutie8211 'silverback gorilla roar')
# schnitzen: Schnitzgeraeusch (Pixabay: pineframestudios 'carving wood')
# voegel: Vogelgezwitscher im hellen Waldweg (Pixabay: oliviaaydin 'birds singing')
# wuestenwind: leichter Wind in der Oase, Etappe 4 (Pixabay: tanweraman 'Desert Wind 2', wie Trip to Japan Etappe 2)
foreach($n in @('gitarre', 'funk', 'eule', 'holz', 'gorilla', 'schnitzen', 'voegel', 'wuestenwind')){
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
$skripte += 'pwa.js'
$skripte += 'objekte.js'
$skripte += 'sternbilder.js'
$skripte += 'texturen.js'
$skripte += 'insel.js'
$skripte += 'steg.js'
$skripte += 'huette_innen.js'
$skripte += 'ausruestung.js'
$skripte += 'joshi_kopf.js'
$skripte += 'segeln.js'
$skripte += 'wasserspuren.js'
$skripte += 'globus.js'
$skripte += 'notizbuch.js'
$skripte += 'waldinsel.js'
$skripte += 'hoehle.js'
$skripte += 'hoehle_innen.js'
$skripte += 'fallschirm.js'      # Fallschirmsprung als Baustein (Etappe 4: zum Hamster)
$skripte += 'wueste.js'          # Etappe 4: die Wueste mit der Oase des Hamsters
$skripte += 'observatorium_innen.js'   # Etappe 4: im Observatorium des Hamsters
$skripte += 'teleskop.js'              # Etappe 4: durch das Teleskop (Nachthimmel, Planeten, Sternbilder)

# Startbild schon waehrend des Ladens (statt des blauen Engine-HUDs) – direkt nach <body>; story.js zeigt spaeter den Knopf
$ladebild = [IO.File]::ReadAllText((Join-Path $root 'tools/ladebild.html'), $utf8).Trim()
$head = $head | ForEach-Object { if($_ -eq '<body>'){ $_; $ladebild } else { $_ } }
$out = ($head -join "`n") + "`n" +
  (($skripte | ForEach-Object { '<script src="' + $_ + '"></script>' }) -join "`n") + "`n" +
  '<script src="engine/engine.js"></script>' + "`n" +
  "</body>`n</html>`n"
[IO.File]::WriteAllText((Join-Path $root 'index.html'), $out, $utf8)
"engine.js: $([math]::Round($engine.Length/1KB)) KB, $($assets.Count) Assets kopiert, $($skripte.Count - 6) Modelle/Toene, index.html erzeugt"
