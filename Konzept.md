# 🌙 KONZEPT: Das Geheimland

Ein interaktives 3D-Detektiv- und Aufräum-Abenteuer auf Basis von WebGL/Three.js – Teil von „Die Abenteuer von Joshi & Samu“.

**Spielen:** https://workflow42.github.io/das_geheimland/ · Repo: `workFLOw42/das_geheimland` · Stand: 14.10.2026 · Sprechtexte: [SPRECHTEXTE.md](SPRECHTEXTE.md)

## 👦 Zielgruppe & Spielfigur

- **Für ein fast 6-jähriges Kind:** Das Spiel muss ohne Lesen funktionieren. Alles wird über die Erzählstimme bzw. den Funk, Symbole, Schilder und Pfeile vermittelt. Die Steuerung ist einfach, es gibt kein Scheitern und keinen Zeitdruck.
- **Spielfigur:** 3D-Modell von Joshi (1,20 m, Mixamo-Rig). **Sie heißt im Spiel Joshi** (entschieden am 14.10.2026; im Code die Konstante `NAME`). Im Text unten steht „der Detektiv“ für seine Rolle.
- **Begleiter: ein Fuchs** (statt des früher geplanten Hundes). Er streift frei und neugierig umher und ist immer in der Nähe des Detektivs.

## 🎮 Steuerung (wie *Trip to Japan*)

| Controller | Tastatur | zu Fuß |
|---|---|---|
| linker Stick | Pfeiltasten | gehen (bis halber Ausschlag), darüber rennen, drehen |
| A | Leertaste | springen – im Stand normaler Sprung, im Lauf die Sprungrolle |
| B | B | hinknien / aufstehen |
| X | X | **Suchblick** (*Look Around*): der Fuchs schnüffelt nach Interaktionsobjekten – der Stick bricht ab |
| Y | Y | an einem entdeckten Interaktionsobjekt: es erklärt sich (Erzählerin) |
| rechter Stick | I J K L | Kamera umsehen |
| RT / LT | E / Q | im Wasser abtauchen / auftauchen |
| D-Pad ↓ | N | Ton an / aus |

## 🦊 Joshi & Fuchs – Verhalten

- **Stehen:** Ruhehaltung (`idle`). Steht Joshi länger als 12 s still, holt er die **Gitarre** heraus; dazu läuft leise ein Gitarren-Loop. Jede Bewegung beendet beides sofort.
- **Fuchs streift:** frei und neugierig um Joshi herum – schnuppert, setzt sich kurz, hüpft vor Freude; entfernt sich Joshi, kommt er hinterher. Ins Wasser geht er nicht (wartet am Ufer).
- **Zu Beginn** sitzt der Fuchs am Strand und schaut aufs Meer, bis Joshi zu ihm kommt.
- **Hinknien (B):** Der Fuchs rennt herbei, spielt vor Joshi (3 × mit den Pfoten) und setzt sich dann **links neben ihn**; nach 10 s Sitzen spielt er wieder, solange Joshi kniet. Die Kamera schwenkt dabei zur Seite und tiefer, damit Joshi den Fuchs nicht verdeckt.
- **Gitarre:** Der Fuchs rennt herbei und **tanzt 10 s** quer vor Joshi in etwa 5 m Abstand (hin und her, Hopser mit halber Drehung, Schwanzschlag, zwei Saltos), dann setzt er sich **genau vor ihn** und schaut ihn an; nach 10 s Sitzen beginnt der Tanz von vorn, solange Joshi spielt. Die Kamera geht dabei weiter zurück und **kreist langsam um beide** (eine Runde in etwa 40 s); der rechte Stick übernimmt.
- **Körper:** Joshi und der Fuchs haben je einen Kollisionskreis – sie laufen nicht durcheinander hindurch; der Fuchs läuft um Joshi herum.
- **Schatten:** beide haben einen weichen Bodenschatten.
- **Suchblick (X) und Interaktionsobjekte:** Für die Geschichte wichtige Objekte tun erst etwas, wenn Joshi sich mit **X** umschaut. Dann schnüffelt der Fuchs umher, macht vor jedem noch unentdeckten Objekt in der Nähe kurz einen Pfoten-Hopser, und das Objekt **leuchtet für einen Moment auf**. Geht Joshi danach an ein entdecktes Objekt heran, erscheint ein **„Y“** darüber (geht er weg, verschwindet es); **Y** lässt die Erzählerin etwas dazu sagen (Texte: SPRECHTEXTE.md). Ohne Suchblick erscheint kein Y, und es passiert nichts. **Info-Objekte** (z. B. Lagerfeuer, Hütte) erklären sich einmal, danach erscheint dort kein Y mehr; **bleibende Objekte** (z. B. das Funkgerät) behalten ihr Y und tun danach etwas anderes (Funkrauschen).
- **Für weitere Detektiv-Momente vorgesehen:** die Fuchs-Animationen *Sit_Yes* (nicken) und *Sit_No* (Kopf schütteln).

## 🧱 Technische Grundsätze

- **Innenräume sind eigene Welten.** Betreten oder Verlassen (Tür) = kurze Blende, danach steht man in einer anderen Welt. Jede Innenwelt ist durch ihre Außenwände begrenzt; durch Fenster sieht man höchstens ein Bild der Außenwelt, hinkommen kann man nicht. So gibt es nie Kameraprobleme in engen Räumen, ein Raum darf innen größer sein als außen („Tardis“), und beim Wechsel kann Speicher freigegeben werden. Häuser mit mehreren Räumen = mehrere verbundene Welten.
- **Kein HUD.** Radar, Gyroskop und linke Anzeige sind aus; den Weg zeigen Schilder und Pfeile. Falls doch eines gebraucht wird: nur der Name der Figur und ihr Gesicht als kleines Icon – kein Astronauten-Symbol, kein „Modell“.
- **Kein Flugverkehr am Himmel**, kein sichtbarer X-Wing, solange nicht geflogen wird. Fliegen kommt später (das Kind kennt und liebt das Flugspiel).
- **Basis ist die Flugspiel-Engine** (unverändert, Spiellogik per Wrapper – wie *Trip to Japan*). Damit stehen Fliegen, Boote, Mondrover und Weltraum für spätere Einsatzorte bereit.
- **Alles, was gezeichnet wird, hat eine Grenze in seinen echten Maßen** (`story.koerper`): Rechteck aus der Größe des Objekts, gedreht wie es, oder ein Kreis für runde Dinge; so hoch wie das Objekt – über Niedriges kann man springen. Ausnahmen von Hand: die Hütte (Wände mit Tür) und Palmen (nur der Stamm zählt, nicht die Wedel). Joshi und der Fuchs sind ebenfalls Körper.
- **Interaktionsobjekte sind global** (`story.interaktion`): Die Idee funktioniert überall gleich – aber nicht jedes Objekt ist in jeder Etappe wichtig; angemeldet wird je Etappe nur, was die Geschichte dort braucht. Auch in Innenräumen (in der Hütte folgen welche, noch offen).
- **Animationen mit 60 fps** (Mixamo, Pipeline siehe README).

## ✅ Umgesetzt: Etappe 1 – die Insel bei Nacht

- **Kleine Insel** (etwa 2/3 kleiner als die Flugspiel-Inseln): Gras, Sandstrand, verteilte Palmen, Meer mit Wellen.
- **Hütte** kurz vor dem Strand: Holz mit Strohdach, Tür und Fenstern vorne und an den Seiten, innen tapeziert (man sieht die Sternentapete auch von außen durch Tür und Fenster). Man läuft gegen die Wände und durch die Tür hinein. **Innen** (eigene Welt, größer als außen): Sternentapete, Holzverkleidung, Dielen, Balkendecke, Bett, Tisch mit Laterne, Regal voller bunter **Bücher** (Platz für die späteren Trophäen), Tisch mit zwei Stühlen und **Taschenmesser, Kompass und Lupe**, **Straßen-Spielteppich**, ein gelber Spielzeug-**Bagger** auf einem kleinen Wandbord (einfaches Objekt), (Straßen, Kreuzung, Zebrastreifen, Kreisel, Häuschen, Teich – deckt nur einen Teil des Bodens), gemalte Fenster mit Mond.
- **Vor der Hütte** zwei Palmen, dazwischen das animierte **Lagerfeuer** (Grenze = Steinrand, so hoch wie die Flamme), daneben das rote **Kurbel-Funkgerät** auf einer Kiste (Grenze = die Kiste).
- **Sternklare Nacht** (keine Wolken – nachts wirkten sie wie schwebende Steine): gedämpfte Hintergrundsterne, die Milchstraße, ein gedämpfter Mond mit Lichthof.
- **Sternbilder**, hell und mit ganz dezenten Linien, gut sichtbar statt astronomisch exakt platziert: **Großer Bär** (mit dem Großen Wagen, dazu Kopf und Beine) und **Kleiner Bär** (Kleiner Wagen mit dem Polarstern) sowie **Kassiopeia** im Norden über der Hütte, **Orion** im Süden über dem Meer. Grundlage für das spätere Wissens-Thema Sternbilder.
- **Möwen:** fliegen über der Insel, ein paar sitzen am Strand (fliegen auf, wenn man ihnen zu nahe kommt). Meeresrauschen und Möwengeschrei kommen aus der Engine.
- **Schwimmen und Waten** wie in *Trip to Japan*: am Strand flach, dann schwimmen; tauchen mit RT / LT.
- **Startbildschirm** „🌙 Das Geheimland“ mit großem „▶ Los geht's“ (schaltet Ton und Stimme frei).
- **Interaktionsobjekte:** draußen Lagerfeuer, Hütte und Funkgerät; in der Hütte Bücherregal und Tisch (Taschenmesser, Kompass, Lupe – am Tisch ein Objekt, später auch einzeln). Per Suchblick (X) entdecken, dann Y. Hier
- **Funk-Durchsage** ist gebaut, aber vorerst **ausgeschaltet** (Text kommt später).

## 💡 1. Rahmenhandlung & Einstieg

- **Der Auftakt:** Der Detektiv erwacht nachts in seinem 3D-Kinderzimmer. Neben seinem Bett sitzt sein treuer Begleiter, der Fuchs. *(noch nicht gebaut)*
- **Die Zaubertür:** Durch die Zimmertür gelangt er an einen nächtlichen Tropenstrand vor eine gemütliche Hütte mit Lagerfeuer. *(Strand, Hütte, Feuer: gebaut)*
- **Die Ausrüstung (Auftakt in der Hütte):** Bevor das Abenteuer losgeht, holt Joshi seine Ausrüstung: **ein bestimmtes Buch aus dem Bücherregal** *(welches Buch und was darin steht: kommt noch)* und **die drei Sachen vom Tisch** – Taschenmesser, Kompass und Lupe (dafür werden sie einzeln gebraucht). Erst wenn er alles hat, geht es weiter.
- **Der Funkspruch:** Sobald Joshi das Buch und die drei Sachen genommen hat, **kommt ein Funkspruch herein** – das Funkgerät am Lagerfeuer meldet sich. Joshi geht hin und **nimmt ihn mit Y an**; damit **beginnt das Abenteuer**.
- **Das Mysterium:** Im Geheimland herrscht großes Chaos. Über Funk kommt die Durchsage (Hörspiel-Stimme):
  > „Achtung, Detektiv Joshi! Im Geheimland wurde Chaos angerichtet! Schnapp dir deine Kamera, folge den Hinweisen und löse das Rätsel!“

## 📸 2. Das Spuren- & Gameplay-Prinzip (Der 3-Klang)

Jeder Einsatzort folgt einer klaren, handlungsorientierten Struktur:

1. **Aktiv handeln & aufräumen (Action & Mini-Game):**
   - **Müllwagen:** Umgestürzte Mülltonnen leeren, Müll einsaugen und in 3 Fächer (Papier, Plastik, Bio) sortieren.
   - **Löschboot / Löschpumpe:** Wasserstrahl auf Brandherde richten (z. B. ein Waldfeuer löschen, das durch den Brennglas-Effekt einer von der Sonne gebündelten Glasscherbe entstanden ist).
   - **Mondrover:** Umgekipptes Fahrzeug wieder aufrichten und säubern.
2. **Spurensicherung (Die Polaroid-Kamera):** Mit dem Fadenkreuz der Polaroid-Kamera die Sachbeschädigung oder Bodenspur (Schrammen, Kratzer, Wühllöcher) anvisieren und ein Foto schießen. Das Bild wandert ins Ermittlungsbuch.
3. **Die organische Rätsel-Kette (von Ort zu Ort):** An jedem Einsatzort liegt ein verloren gegangener Gegenstand, der logisch zum nächsten Ziel führt (z. B. Satellitenschrott mit Eicheln → Mond-Station mit Eichhörnchen → Seegras am Mondrover → Ozean/Boot).

## 🕵️‍♂️ 3. Das Finale am Fotobrett: Die Foto-Analyse

> ⚠️ **Offen:** Der Fuchs ist jetzt der Begleiter des Detektivs – als Täter passt er so nicht mehr. Täter und Auflösung werden noch neu entschieden; der Text unten ist der bisherige Stand.

- **Das Spurenbrett:** Der Detektiv kehrt an den Strand zurück und legt alle 6 geschossenen Polaroid-Fotos nebeneinander auf das Ermittler-Brett.
- **Die Überlagerung:** Er legt ein transparentes Pfoten-Messraster seines eigenen Fuchses über die Schrammen und Abdrücke auf den 6 Bildern. Die Maße stimmen zu 100 % überein!
- **Die Auflösung:** Der Detektiv stellt den Fuchs zur Rede. Der Fuchs schaut verlegen, läuft hinter die Hütte und zieht stolz seinen vergrabenen Lieblingsknochen hervor. Auf der Suche nach seinem Knochen hat er versehentlich das Chaos angerichtet!

## 🎲 4. Der Täter-Generator (Wiederspielwert)

> ⚠️ **Offen:** Täter A (bisher der Hund, jetzt der Fuchs) wird noch neu entschieden – siehe Abschnitt 3.

Damit das Spiel auch beim 2. oder 3. Durchlauf spannend bleibt, rotiert das System beim Neustart Täter und Motiv:

| Täter | Motiv | Spuren |
|---|---|---|
| **A – Der Fuchs** (der eigene Begleiter) | sucht seinen vergrabenen Knochen | Wühl- & Scharrspuren |
| **B – Der Blaurabe** | hat seine geliebte, glitzernde Taschenuhr verloren und sucht verzweifelt danach | Federn, gelockerte Schrauben, Lametta |
| **C – Der Feldhamster** | sucht Vorräte für den Winter | Nagespuren an Kisten, Hamsterkäufe |

## 🏠 5. Belohnungssystem & Erwachen

- **Das Erwachen:** Der Detektiv schließt die Hüttentür mit dem Kristall-Schlüssel auf und erwacht wieder im 3D-Kinderzimmer.
- **Trophäen-Regal:** Auf dem Schreibtisch und dem Regal (im Hütten-Innenraum schon vorhanden) liegen die gesammelten Souvenirs und Polaroid-Fotos. Je öfter das Spiel gelöst wird, desto mehr Trophäen werden freigeschaltet (z. B. Goldener Knochen im Körbchen, Plüsch-Rabe auf der Lampe, Meister-Detektiv-Mütze für Fuchs und Spieler).

## 🎓 6. Lerneffekte

- **Kritisches Denken & Beweisführung:** Nicht den ersten Verdächtigen beschuldigen, sondern alle Fakten per Foto-Analyse prüfen.
- **Natur & Umwelt:** Mülltrennung begreifen, Waldbrand-Prävention (Brennglas-Effekt von Altglas verstehen) und aufräumen.
- **Empathie:** Verstehen, dass Missgeschicke aus Missverständnissen entstehen können und Verzeihen dazugehört.

## 🗺️ Nächste Schritte

1. **Kinderzimmer** als Einstieg (eigene Innenwelt) mit Bett und Zaubertür → Blende → Strand.
2. **Ausrüstung und Funkspruch:** Buch aus dem Regal (Buch und Text kommen noch) und Taschenmesser, Kompass, Lupe vom Tisch nehmen → Funkspruch kommt herein → am Funkgerät mit Y annehmen → Durchsage, das Abenteuer beginnt.
3. **Polaroid-Kamera** mit Fadenkreuz, Fotos ins Ermittlungsbuch.
4. **Erster Einsatzort:** Müllwagen-Minispiel (Modell vorhanden: `garbage_truck_by_Lung_ong.glb`), Mülltonnen, Sortieren.
5. **Täter neu festlegen** (der Fuchs ist Begleiter, siehe Abschnitt 3 und 4).
6. **Fehlende Modelle:** Kinderzimmer-Möbel, Polaroid-Kamera, Mülltonnen, Blaurabe, Feldhamster, Knochen (Eichhörnchen: liegt in `3d Modelle\Spiele`).

## 📚 Quellen

Mixamo (Rigging, Animationen) · „Fox“ von pxltiger (CC-BY-4.0) · „Stage Campfire“ von daedaljs (CC-BY-4.0) · „Ring-Billed Gull“ von Oregon State University Ecampus (CC-BY-4.0) · Gitarren-Loop von idoberg (Pixabay) · Modelle/Töne der Flugspiel-Engine. Modelle liegen in `3d Modelle\Spiele`, Töne in `Software\Musik`.

---

## 📦 Anhang: Frühere Idee „Joshis Traum der Geheimwelt“ (01.10.2026)

Ursprünglich ausgelagert aus `Spiel_SFG/Konzept.md`. Ideen daraus können ins Geheimland einfließen.

- **Grundidee:** Joshi schläft abends ein und erwacht in seinem Traum, in dem er so schlau, groß und selbstständig ist wie ein Erwachsener. Mit seinem Hund erkundet er die Welt, lernt Naturphänomene kennen und baut sich einen Schlafplatz.
- **Begleiter-Hund:** folgt auf Schritt und Tritt, schnüffelt an interessanten Orten, schlägt leise an, wenn Holz oder Ziel-Objekte nahe sind.
- **Natur & Wildnis:** Holz & Stöcke für ein Lagerfeuer sammeln, Äste/Zweige für einen Schlafplatz suchen, mit dem Ruderboot über Flüsse paddeln.
- **Wissensvermittlung:** Erzählerstimme erklärt Naturphänomene (Dachs-Spuren, Bienen, Bäume, Sternbilder); einfache Mitmach-Fragen mit Symbolen oder Hinlaufen beantworten.
- **Traum-Rucksack:** Taschenlampe, Kompass, Schiffssteuer, Sternenkarte durch gelöste Aufgaben sammeln.
- **Finale:** Er legt sich im Traum schlafen, wacht morgens auf, und die Kamera schwenkt durchs Kinderzimmer, wo alle gesammelten Gegenstände auf Regalen, Schreibtisch und Teppich liegen.
- **Lerneffekte:** Aufmerksamkeit & Entdeckung (Tierspuren), Selbstständigkeit & Geborgenheit, Ursache-Wirkung (Holz sammeln → Lagerfeuer).
