# 🌙 Das Geheimland

Ein 3D-Detektiv-Abenteuer für Kinder (ab ca. 5 Jahren) – zu Fuß, schwimmend und später auch fliegend,
mit einem Fuchs als Begleiter. Teil von „Die Abenteuer von Joshi & Samu“. Konzept: [Konzept.md](Konzept.md).

**▶️ Spielen: https://workflow42.github.io/das_geheimland/**
(Chrome/Edge empfohlen, Controller oder Tastatur. Nach dem ersten vollständigen Laden auch offline spielbar, auf Tablets über
„Zum Startbildschirm hinzufügen“ als App installierbar.) Lokal: `index.html` im Browser öffnen.

**Committen:** `powershell -File tools/commit.ps1 "Nachricht"` – zählt die Cache-Version in `sw.js` hoch, sobald sich eine
gecachte Datei ändert (Modelle und Töne `*_glb.js` / `*_snd.js` haben einen eigenen Cache, der nur bei geänderten Modellen
hochgeht). Die Seite prüft jede Minute auf eine neue Version und lädt am Startbildschirm von selbst neu; mitten im Spiel erscheint
nur ein Hinweis. Der pre-commit-Hook (`cp tools/pre-commit .git/hooks/pre-commit`) ist das Sicherheitsnetz, falls die Version
vergessen wurde.

## Steuerung zu Fuß

| Controller | Tastatur | Aktion |
|---|---|---|
| linker Stick | Pfeiltasten | gehen (bis halber Ausschlag) bis rennen, drehen |
| A | Leertaste | springen – im Stand normaler Sprung, im Lauf Sprungrolle |
| B | B | hinknien / aufstehen (der Fuchs kommt zum Spielen) |
| X | X | Suchblick – der Fuchs findet wichtige Objekte (Stick bricht ab) |
| Y | Y | an einem entdeckten Objekt: Erzählerin erklärt es |
| rechter Stick vor / zurück | E / Q | im Wasser abtauchen / auftauchen |
| rechter Stick ↕ | W / S | im Segelboot: Schub stellen (bleibt stehen) · X / Shift = Vollgas · A / C = rückwärts |
| linker Stick | Pfeiltasten | im Segelboot: lenken · LB / RB = Blick zur Seite |
| rechter Stick | I J K L | umschauen |
| D-Pad ← | T | Hinweis: die Erzählerin sagt, was als Nächstes gut wäre |
| D-Pad ↑ | H | Pause (alles steht, auch Ton und Stimme) |
| D-Pad ↓ | N | Inventar: alle eingesammelten Dinge (das Spiel pausiert, nochmal = weiter) |

Steht die Figur eine Weile still, holt sie die Gitarre heraus.

## Aufbau

Technische Basis ist die Engine des **[Flugspiel](https://github.com/workFLOw42/flightsimulator)** – sie bleibt
unverändert, die Spiellogik hängt sich per Wrapper ein (wie bei *Trip to Japan*).

| Datei | Inhalt |
|---|---|
| `index.html` | wird von `tools/build_engine.ps1` erzeugt |
| `engine/` | Flugspiel-Engine + Modelle, **unverändert** kopiert von `tools/build_engine.ps1` |
| `story.js` | Spiellogik: Welt, Nacht, Spielfigur, Schwimmen, Fuchs, Sprache, Startbildschirm |
| `texturen.js` | gemeinsame Texturen: Tapete, Holzverkleidung, Dielen, Straßen-Spielteppich |
| `sternbilder.js` | Sternbilder am Nachthimmel (Großer und Kleiner Bär, Kassiopeia, Orion) |
| `insel.js` | Etappe 1: kleine Insel, Hütte, Palmen, Lagerfeuer, Möwen |
| `steg.js` | Steg vor der Hütte (Sandplanken + Pfahlsteg, Grenzen) und Segelboot (einsteigen mit Y) |
| `objekte.js` | Objekt-Katalog: jedes Objekt einmal definieren (`story.typ`), in jede Welt setzen (`story.setze`); Grenzen in exakter Form, freier Platz beim Setzen, nie verhaken, Orcas |
| `huette_innen.js` | Innenraum der Hütte als eigene Welt (Blende an der Tür, innen größer als außen) |
| `ausruestung.js` | Notizbuch im Regal, Lupe/Kompass/Messer/Stift/Kamera auf dem Tisch – mit Y groß zeigen und in den Rucksack |
| `notizbuch.js` | Foto- und Skizzenstellen (blauer/roter Kreis), Bild mit Sucher bzw. Bleistift, ins Notizbuch kleben |
| `models/*.glb` | eigene Modelle; `build_engine.ps1` bettet sie als `*_glb.js` ein |
| `sounds/*.mp3` | eigene Töne; werden als `*_snd.js` eingebettet |

Neu bauen (nach Änderungen an Engine, Modellen oder Tönen): `powershell -File tools/build_engine.ps1`

**Spielfigur:** Mixamo-Rig, Clips (60 fps) `idle walk run jump roll kneel swim fly hang skate guitar drums look`.
Pipeline: Mixamo-FBX → `FBX2glTF --binary --anim-framerate bake60` → `_mixamo/merge_clips.py` → `models/figur.glb`.

## Quellen und Lizenzen

- Rigging und Animationen der Spielfigur: **[Mixamo](https://www.mixamo.com)** (Adobe)
- „Fox“ von [pxltiger](https://sketchfab.com/3d-models/fox-39f97fe58f0b47ce80b6e02814001dd7) – CC-BY-4.0
- „Stage Campfire“ von [daedaljs](https://sketchfab.com/3d-models/stage-campfire-82f37f8bf0f645768e32ab7185df13ca) – CC-BY-4.0
- „Ring-Billed Gull“ (sitzend und fliegend) von Oregon State University Ecampus – CC-BY-4.0
- „Sailboat“ von JinnMx (CC-BY-4.0)
- Ausrüstung (Sketchfab, CC-BY-4.0, fürs Spiel verkleinert): „Book – RealityScan“ von teddygbg, „Pencil“ von farooq.smurf, „Compass“ von EwanLejkowski, „Pocket Knife“ von Riccardo Daniello, „Magnifying Glass“ von Laura.Clarke, „Canon AT-1 Retro Camera“ von AleixoAlonso, „Backpack low-poly“ von dimaponomar2019
- „Wooden Fox Kit Figure“ von Yogensia (Sketchfab) – CC-BY-NC-SA-4.0 (der geschnitzte Holzfuchs)
- „Ulysses Butterfly“ von eb78 (Sketchfab) – CC-BY-SA-4.0 (Schmetterlinge, Lupe)
- Töne im Wald (Pixabay): „owl“ von freesound_community, „breaking wood“ von Dragon Studio, „silverback gorilla roar“ von flutie8211
- „Wooden Duck Toy“ von Ujjwal Chauhan (Sketchfab) – das Holzentchen (verkleinert)
- „Gorilla – Animated Low Poly“ von WildPoly3D (Sketchfab) – CC-BY-NC-4.0 (nur die gebrauchten Clips)
- Tiere am Festtisch der Waldinsel (Etappe 2): „Rabbit“, „Rabbit Baby“, „Owl“, „Moose“, „Gazelle“ (als Reh), „Bird 3“ und „Bird 4“ – Animated Low Poly von WildPoly3D (Sketchfab) – CC-BY-NC-4.0 (nur die gebrauchten Clips)
- Gitarren-Loop „Punk Rock Guitar Loop“ von idoberg ([Pixabay](https://pixabay.com)) – Pixabay-Lizenz
- Funkrauschen „Searching the Radio Noise“ von freesound_community (Pixabay) – Pixabay-Lizenz
- Modelle und Töne der Flugspiel-Engine: siehe Flugspiel-Repo