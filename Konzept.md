# 🌙 KONZEPT: Das Geheimland

Ein interaktives 3D-Detektiv- und Aufräum-Abenteuer auf Basis von WebGL/Three.js – Teil von „Die Abenteuer von Joshi & Samu“.

## 👦 Zielgruppe & Spielfigur

- **Für ein fast 6-jähriges Kind:** Das Spiel muss ohne Lesen funktionieren. Alles wird über die Erzähl-/Radiostimme, Symbole und Bilder vermittelt. Die Steuerung ist einfach, es gibt kein Scheitern und keinen Zeitdruck.
- **Spielfigur:** 3D-Modell von Joshi (1,20 m, Mixamo-Rig, Rohdaten `3d Modelle/JFG/JFG_Joshi_mixamo.zip`). **Im Spiel bekommt die Figur einen eigenen Namen – noch offen** (im Text unten: „der Detektiv“).
- **Begleiter:** ein Fuchs. Er streift frei und neugierig umher, spielt beim Hinknien vor der Figur (2 x Pfoten/Schwanz) und setzt sich links neben sie, tanzt zur Gitarre 5 m vor ihr und setzt sich danach vor sie. Figur und Fuchs sind Körper (laufen nicht durcheinander hindurch).

## 🧱 Technische Grundsätze

- **Innenräume sind eigene Welten.** Betreten oder Verlassen (Tür) = kurze Blende, danach steht man in einer anderen Welt. Jede Innenwelt ist durch ihre Außenwände begrenzt; durch Fenster sieht man höchstens ein Bild der Außenwelt, hinkommen kann man nicht. So gibt es nie Kameraprobleme in engen Räumen, ein Raum darf innen größer sein als außen („Tardis“), und beim Wechsel kann Speicher freigegeben werden. Häuser mit mehreren Räumen = mehrere verbundene Welten.
- **Kein HUD.** Radar, Gyroskop und linke Anzeige sind aus. Falls doch eines gebraucht wird: nur der Name der Figur und ihr Gesicht als kleines Icon – kein Astronauten-Symbol, kein „Modell“.
- **Kein Flugverkehr am Himmel**, kein sichtbarer X-Wing, solange nicht geflogen wird.
## 💡 1. Rahmenhandlung & Einstieg

- **Der Auftakt:** Der Detektiv erwacht nachts in seinem 3D-Kinderzimmer. Neben seinem Bett sitzt sein treuer Begleiter-Hund.
- **Die Zaubertür:** Durch die Zimmertür gelangt er an einen nächtlichen Tropenstrand vor eine gemütliche Hütte mit Lagerfeuer.
- **Das Mysterium:** Im Geheimland herrscht großes Chaos. Das Kurbel-Radio am Lagerfeuer knackt und gibt eine Durchsage durch (Hörspiel-Stimme):
  > „Achtung, Detektiv [Name]! Im Geheimland wurde Chaos angerichtet! Schnapp dir deine Kamera, folge den Hinweisen und löse das Rätsel!“

## 📸 2. Das Spuren- & Gameplay-Prinzip (Der 3-Klang)

Jeder Einsatzort folgt einer klaren, handlungsorientierten Struktur:

1. **Aktiv handeln & aufräumen (Action & Mini-Game):**
   - **Müllwagen:** Umgestürzte Mülltonnen leeren, Müll einsaugen und in 3 Fächer (Papier, Plastik, Bio) sortieren.
   - **Löschboot / Löschpumpe:** Wasserstrahl auf Brandherde richten (z. B. ein Waldfeuer löschen, das durch den Brennglas-Effekt einer von der Sonne gebündelten Glasscherbe entstanden ist).
   - **Mondrover:** Umgekipptes Fahrzeug wieder aufrichten und säubern.
2. **Spurensicherung (Die Polaroid-Kamera):** Mit dem Fadenkreuz der Polaroid-Kamera die Sachbeschädigung oder Bodenspur (Schrammen, Kratzer, Wühllöcher) anvisieren und ein Foto schießen. Das Bild wandert ins Ermittlungsbuch.
3. **Die organische Rätsel-Kette (von Ort zu Ort):** An jedem Einsatzort liegt ein verloren gegangener Gegenstand, der logisch zum nächsten Ziel führt (z. B. Satellitenschrott mit Eicheln → Mond-Station mit Eichhörnchen → Seegras am Mondrover → Ozean/Boot).

## 🕵️‍♂️ 3. Das Finale am Fotobrett: Die Foto-Analyse

- **Das Spurenbrett:** Der Detektiv kehrt an den Strand zurück und legt alle 6 geschossenen Polaroid-Fotos nebeneinander auf das Ermittler-Brett.
- **Die Überlagerung:** Er legt ein transparentes Pfoten-Messraster seines eigenen Hundes über die Schrammen und Abdrücke auf den 6 Bildern. Die Maße stimmen zu 100 % überein!
- **Die Auflösung:** Der Detektiv stellt den Hund zur Rede. Der Hund bellt verlegen, läuft hinter die Hütte und zieht stolz seinen vergrabenen Lieblingsknochen hervor. Auf der Suche nach seinem Knochen hat er versehentlich das Chaos angerichtet!

## 🎲 4. Der Täter-Generator (Wiederspielwert)

Damit das Spiel auch beim 2. oder 3. Durchlauf spannend bleibt, rotiert das System beim Neustart Täter und Motiv:

| Täter | Motiv | Spuren |
|---|---|---|
| **A – Der Hund** | sucht seinen vergrabenen Knochen | Wühl- & Scharrspuren |
| **B – Der Blaurabe** | hat seine geliebte, glitzernde Taschenuhr verloren und sucht verzweifelt danach | Federn, gelockerte Schrauben, Lametta |
| **C – Der Feldhamster** | sucht Vorräte für den Winter | Nagespuren an Kisten, Hamsterkäufe |

## 🏠 5. Belohnungssystem & Erwachen

- **Das Erwachen:** Der Detektiv schließt die Hüttentür mit dem Kristall-Schlüssel auf und erwacht wieder im 3D-Kinderzimmer.
- **Trophäen-Regal:** Auf dem Schreibtisch liegen die gesammelten Souvenirs und Polaroid-Fotos. Je öfter das Spiel gelöst wird, desto mehr Trophäen werden freigeschaltet (z. B. Goldener Knochen im Körbchen, Plüsch-Rabe auf der Lampe, Meister-Detektiv-Mütze für Hund und Spieler).

## 🎓 6. Lerneffekte

- **Kritisches Denken & Beweisführung:** Nicht den ersten Verdächtigen beschuldigen, sondern alle Fakten per Foto-Analyse prüfen.
- **Natur & Umwelt:** Mülltrennung begreifen, Waldbrand-Prävention (Brennglas-Effekt von Altglas verstehen) und aufräumen.
- **Empathie:** Verstehen, dass Missgeschicke aus Missverständnissen entstehen können und Verzeihen dazugehört.

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