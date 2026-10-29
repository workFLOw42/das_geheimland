# Engine – Stand und Unterschiede

Das Geheimland nutzt die Engine des **Flugspiels** unverändert. `tools/build_engine.ps1` kopiert sie nach `engine/`. Die Spiellogik hängt sich über Wrapper ein: Eine Funktion der Engine wird durch eine eigene ersetzt, die meist die alte aufruft. Diese Datei hält fest, auf welchem Stand die Engine ist, wie sie sich von *Die Abenteuer von Samu* (Spiel_SFG) unterscheidet und welche Engine-Funktionen das Geheimland wo überschreibt.

## Stand (geprüft am 29.10.2026)

| | Geheimland (Spiel_JFG) | Samu (Spiel_SFG) |
|---|---|---|
| `engine/engine.js` | 985.789 Bytes, SHA-256 `7B0934F2…` | **identisch** (gleiche Prüfsumme) |
| gebaut aus | Flugspiel, Commit `1c71de3` (26.10.2026 14:13, „Eurofighter-Schatten am Boden heller“) | derselbe Stand |
| Dateien in `engine/` | 25 | 45 |

**Die Engine selbst ist in beiden Spielen gleich.** Die Unterschiede liegen nur darin, *was mitgeliefert* wird und *was jedes Spiel per Wrapper ändert*.

## Unterschied 1: mitgelieferte Engine-Modelle

Das Geheimland lässt Modelle weg, die es nie zeigt (`build_engine.ps1`, Analyse vom 23.10.2026). So passen auch die Danksagungen im README genau zu dem, was im Spiel ist. Alle Lader der Engine prüfen, ob die Datei da ist.

Nur in Spiel_SFG (im Geheimland bewusst nicht dabei):
`airbus`, `alphajet`, `asteroid`, `canadair`, `destroyer`, `dinghy`, `earth`, `enterprise`, `falcon`, `iss`, `marsground`, `mars`, `pad`, `razor`, `rocket`, `serenity`, `shuttle`, `sun`, `transall`, `xwing_alt` (je `*_glb.js`).

Dazu lässt das Geheimland den Todesstern (Lizenz CC-BY-NC-ND) und den Hangar weg. Für Etappe 5 (Mond) bringt es dagegen `crater_glb.js` und `moonbase_glb.js` mit.

## Unterschied 2: überschriebene Engine-Funktionen (Geheimland)

Wird eine dieser Funktionen im Flugspiel umbenannt, bricht der Wrapper still. `build_engine.ps1` prüft deshalb eine Liste (`$noetig`) und bricht laut ab, wenn eine fehlt.

| Engine-Funktion | überschrieben in |
|---|---|
| `buildIsland`, `islandBuildings`, `isOnRunway`, `rocketLocal`, `xwingLocal` | insel.js |
| `_islandInfoCalc` | insel.js, story.js |
| `buttonB` | hoehle.js, mond.js, wueste.js |
| `buttonY` | mond.js, steg.js, story.js |
| `driftKindNow` (Staub auf dem Mond aus, eigener in mond.js) | mond.js |
| `enterSpace` | observatorium_innen.js |
| `evaCanBoard` | wueste.js |
| `evaEnterDinghy` | hoehle_innen.js, huette_innen.js, observatorium_innen.js, steg.js, story.js |
| `evaExit` | hoehle.js, mond.js, observatorium_innen.js |
| `evaFootY`, `evaSolid` | hoehle_innen.js, huette_innen.js, kinderzimmer.js, mond.js (nur `evaFootY`), mondbasis_innen.js, observatorium_innen.js, steg.js, story.js, wueste.js |
| `hitsBuilding` | hoehle_innen.js, huette_innen.js, kinderzimmer.js, mondbasis_innen.js, objekte.js, observatorium_innen.js |
| `initAudio` | globus.js |
| `isOnBeach`, `isOnLand`, `seaFloorNeeded`, `seaYAt`, `evaCanBoard` | wueste.js |
| `isOpenWater` | hoehle_innen.js, huette_innen.js, observatorium_innen.js, steg.js, wueste.js |
| `loop` | ausruestung.js, globus.js, heimflug.js, heimkehr.js, segeln.js, story.js, teleskop.js, wasserspuren.js |
| `readInput` | segeln.js, story.js |
| `resetPlane` | hoehle.js, observatorium_innen.js |
| `schubBalken` | hoehle.js |
| `seabedY` | story.js, wueste.js |
| `islandInfo` (Speicher mit Zahlen-Schlüssel), `updateSea`, `updateShipsSea`, `updateOrcas`, `updateFish` (ruhen zu Fuß in Etappe 3 und in Innenwelten) | story.js |
| `buildUwCell`, `makeWeed`, `makeCoralBush`, `makeSponge`, `makeRock` (Bewuchs auf den gezeichneten Grund) | story.js |
| `showBeacon` (Leuchtsäule über der Mondbasis aus) | mond.js |
| `showSpaceHint` (keine Ortssymbole wie 🌙) | story.js |
| `stepGroundExact` (Mondboden ohne Raycaster – sonst ~25 MB/s Müll und Ruckler) | mond.js |
| `stepPhysics` (Anflug auf den Mond) | mond.js |
| `thrHold` | segeln.js |
| `updateAmbient` | hoehle.js, hoehle_innen.js, huette_innen.js, wueste.js |
| `updateCamera` | fallschirm.js, heimflug.js, heimkehr.js, hoehle_innen.js, huette_innen.js, kinderzimmer.js, mond.js, mondbasis_innen.js, observatorium_innen.js, steg.js, story.js |
| `updateEva` | steg.js, story.js, waldinsel.js |
| `updateOrcas` | objekte.js, observatorium_innen.js |
| `updatePads` (keine landenden Raumschiffe auf dem Mond) | mond.js |
| `updateSea` | observatorium_innen.js |
| `updateSpaceBlend` | hoehle.js, waldinsel.js |
| `updateStrandleben` | objekte.js |
| nur story.js | `_parkLocalCalc`, `aiFindFireIsland`, `carrierInfo`, `cycleModel`, `enterHangar`, `evaJump`, `evaStartJet`, `findStart`, `harborBoatLocal`, `harborSubNear`, `makeAstronaut`, `preloadFord`, `preloadHangar`, `preloadHarbor`, `showBig`, `showToggle`, `spawnFire`, `startEngineLoop`, `toggleHelp`, `toggleSound`, `untergrundAt`, `updateEngineSound`, `updateHUD`, `updateOvalShadow`, `updateShadow`, `updateTrafficAll` |

Außerdem fügt `build_engine.ps1` zwei Haken in den Boot-Block der Engine ein: `STORY_HOOK` (vor `updateIslands()`) und `STORY_START` (vor dem ersten `requestAnimationFrame(loop)`). Spiel_SFG macht das genauso.

## Wenn sich die Engine ändert

1. Im Flugspiel ändern und committen (die Engine nie in `engine/` von Hand ändern).
2. `powershell -File tools/build_engine.ps1` – kopiert die Engine neu, prüft die Liste `$noetig`.
3. Diese Datei aktualisieren: Stand, Prüfsumme, neue Wrapper.
4. Spiel_SFG gleich mitbauen, damit beide auf demselben Stand bleiben.
