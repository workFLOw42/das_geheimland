# 🌙 KONZEPT: Das Geheimland

Ein interaktives 3D-Detektiv- und Aufräum-Abenteuer auf Basis von WebGL/Three.js – Teil von „Die Abenteuer von Joshi & Samu“.

**Spielen:** https://workflow42.github.io/das_geheimland/ · Repo: `workFLOw42/das_geheimland` · Stand: 20.10.2026 · Sprechtexte: [SPRECHTEXTE.md](SPRECHTEXTE.md)

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
| Y | Y | an einem entdeckten Interaktionsobjekt: es erklärt sich (Erzählerin); auf einem farbigen Kreis: Foto, Skizze, Schnitzen, Lupe; am Steg: ins Boot |
| D-Pad ← | T | **Hinweis:** die Erzählerin sagt, was als Nächstes gut wäre (z. B. „Mit X kannst Du dich ganz genau umschauen und alles Wichtige entdecken.“) – immer nur für die Welt, in der Joshi gerade ist |
| D-Pad ↑ | H | **Pause** (alles steht, auch Ton und Stimme) |
| D-Pad ↓ | N | **Inventar:** der Rucksack mit allen Dingen; Stick wählt, A erklärt (das Notizbuch schlägt sich auf), B schließt |
| B (bei großem Bild) | B | Foto, Skizze, Holzfuchs, Lupe stehen groß im Bild, bis B gedrückt wird |
| rechter Stick | I J K L | Kamera umsehen |
| rechter Stick vor / zurück | E / Q | im Wasser abtauchen / auftauchen (wie das U-Boot im Flugspiel) |
| linker Stick | Pfeiltasten | **im Segelboot:** vor = Fahrt voraus, zurück = langsam rückwärts, seitlich = lenken (nur mit Fahrt) |

## 🦊 Joshi & Fuchs – Verhalten

- **Stehen:** Ruhehaltung (`idle`). Steht Joshi länger als 12 s still, holt er die **Gitarre** heraus; dazu läuft leise ein Gitarren-Loop. Jede Bewegung beendet beides sofort.
- **Fuchs streift:** frei und neugierig um Joshi herum – schnuppert, setzt sich kurz, hüpft vor Freude; entfernt sich Joshi, kommt er hinterher. Ins Wasser geht er nicht (wartet am Ufer).
- **Zu Beginn** sitzt der Fuchs am Strand und schaut aufs Meer, bis Joshi zu ihm kommt.
- **Hinknien (B):** Der Fuchs rennt herbei, spielt vor Joshi (3 × mit den Pfoten) und setzt sich dann **links neben ihn**; nach 10 s Sitzen spielt er wieder, solange Joshi kniet. Die Kamera schwenkt dabei zur Seite und tiefer, damit Joshi den Fuchs nicht verdeckt.
- **Gitarre:** Der Fuchs rennt herbei und **tanzt 10 s** quer vor Joshi in etwa 5 m Abstand (hin und her, Hopser mit halber Drehung, Schwanzschlag, zwei Saltos), dann setzt er sich **genau vor ihn** und schaut ihn an; nach 10 s Sitzen beginnt der Tanz von vorn, solange Joshi spielt. Die Kamera geht dabei weiter zurück und **kreist langsam um beide** (eine Runde in etwa 40 s); der rechte Stick übernimmt.
- **Körper:** Joshi und der Fuchs haben je einen Kollisionskreis – sie laufen nicht durcheinander hindurch; der Fuchs läuft um Joshi herum.
- **Schatten:** beide haben einen weichen, eher blassen Bodenschatten (Joshi 0,38 m Radius) – auch auf dem Steg. Beim Laufen auf Sand und Gras wirbelt an jedem sich hebenden Fuß ein kleines Staubwölkchen auf (nicht auf dem Steg, im Wasser oder in der Hütte).
- **Grenzen halten nie fest:** steckt Joshi einmal in einer Grenze (z. B. am Bagger-Bord oder am Tisch), ist jeder Schritt erlaubt, der ihn nicht tiefer hineinbringt – hinaus geht es immer.
- **Einheitliche Logik für alles Entdeckbare (16.10.2026):** Objekte und farbige Kreise haben drei Zustände – *unentdeckt* (X schaltet im Umkreis von 20 m frei, der Fuchs läuft hin, Pfote + Blinken = markiert), *offen* (entdeckt, aber noch ohne Y) und *erledigt* (einmal Y; das Funkgerät bleibt bedienbar). Für „offen“ gilt überall dasselbe: unten rechts erscheint die **Detektivmütze**, die Hinweis-Taste sagt „Klasse, Du hast alles entdeckt. Gehe zu jedem Objekt und schau, ob du was tun kannst.“, und der Fuchs zeigt die offenen Dinge noch einmal. Immer **pro Welt getrennt** (Hütte und draußen zählen jeweils für sich). Kniet Joshi mitten im Markieren, kommt der Fuchs, merkt sich den Rest und macht nach dem Aufstehen weiter.
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
- **Möwen:** zehn kreisen über der Insel, etwa 40 sitzen in kleinen Gruppen rund um den Strand (eine Handvoll gut 13 m neben dem Steg). Kommen Joshi oder der Fuchs zu nahe, wird aus der sitzenden eine **fliegende Möwe**: sie steigt weg, zieht einen Bogen über dem Meer, fliegt zurück und **landet wieder auf ihrem Platz**. Meeresrauschen und Möwengeschrei kommen aus der Engine.
- **Schwimmen und Waten** wie in *Trip to Japan*: am Strand flach, dann schwimmen; tauchen mit dem rechten Stick (vor = ab, zurück = auf).
- **Startbildschirm** „🌙 Das Geheimland“ mit großem „▶ Los geht's“ (schaltet Ton und Stimme frei).
- **Steg und Segelboot:** Vor der Hütte (in einer Linie mit Hütte, Lagerfeuer und Funkgerät) liegen kurz vor dem Wasser flache Planken auf dem Sand, die zum Steg auf Pfählen werden. Vom Steg kann man seitlich und am Ende ins Wasser fallen und schwimmen; im Wasser schwimmt man unter dem Steg durch (hinauf kommt man nur über die flachen Planken am Strand). Nur am Boot ist die Stegkante eine Grenze. Links daran liegt ein Segelboot, das mit den Wellen schaukelt. Im letzten Drittel des Stegs erscheint ein **Y**: Joshi und der Fuchs steigen ein – Joshi kniet hinten im Heck an der Pinne, der Fuchs sitzt vorn im Bug vor dem Mast und schaut aufs Meer; Mit dem linken Stick **fährt das Boot** (träge, lenkt nur mit Fahrt; nicht an Land, nicht ins flache Wasser, höchstens 260 m weit). Y im Boot = aussteigen, aber nur am Steg – weiter draußen sagt die Erzählerin „Fahr erst zurück zum Steg. Dann kannst du aussteigen.“ Im Boot steht kein Wasser (das Meer ist im Rumpf ausgeblendet), es liegt nur noch halb so schief wie das Modell. **Einsteigen geht erst, wenn das Abenteuer begonnen hat** (Ausrüstung aus der Hütte + Funkspruch angenommen); vorher sagt die Erzählerin „Du hast hier noch nicht alles entdeckt. Bitte schaue dich in Ruhe weiter um.“
- **Interaktionsobjekte:** draußen Lagerfeuer, Hütte und Funkgerät; in der Hütte Bücherregal und Tisch (Taschenmesser, Kompass, Lupe – am Tisch ein Objekt, später auch einzeln). Per Suchblick (X) entdecken, dann Y. Hier
- **Ausrüstung (Hütte):** Y am Regal → das Notizbuch, Y am Tisch → Lupe, Kompass, Taschenmesser, Stift, Kamera. Jedes Ding kommt groß ins Bild, dreht sich und fliegt in den **Rucksack** unten rechts (das Messer klappt dabei auf, bleibt offen und klappt zu, bevor es verschwindet). Der Kompass steht danach immer oben rechts.
- **Detektiv-Phase (vier farbige Kreise):** Ist draußen und in der Hütte alles entdeckt und angesehen, erklärt die Erzählerin draußen die farbigen Markierungen; der Fuchs läuft sie ab. **Blau – Foto der Hütte** (die Kamera sucht in kleinen Schwenks, der Fuchs läuft ins Bild und setzt sich, KLICK, der Mond oben rechts), **Rot – Skizze vom Steg** (Bleistift zeichnet in Schichten: Strand und Steg, Boot, Meer, Sterne, ein springender Wal, zuletzt das „J“), **Grün – Schnitzen** (Holzscheit links neben der Hütte; Blende ans Lagerfeuer, Joshi hockt, das Messer kommt zu heraus und klappt auf, der Klotz verschwindet von außen nach innen und wird zum Holzfuchs; danach steht er auf einem Bord über dem Bett), **Braun – Lupe** (Schmetterlingsschwarm rechts neben der Hütte; unter dem großen Glas ein blauer Schmetterling von oben; danach fliegt einer in der Hütte). Jedes Bild bleibt groß, bis B gedrückt wird, und kommt als Bleistiftskizze bzw. Foto ins **Notizbuch** (blättern im Inventar, nur das Blatt klappt um; neben der Seitenzahl ein Ortssymbol – die Insel ist selbst gezeichnet). Alle Werkzeuge gehen erst bei B zurück in den Rucksack.
- **Funkspruch Fall 1:** erst, wenn alle vier Kreise erledigt sind. Die Funkstimme ruft („Hallo Joshi, bist du da?“, alle 15 s „Joshi, bitte kommen.“), Y am Funkgerät: „Hallo Joshi... Bitte hilf' uns. Wir haben ein großes Problem. Bitte steig schnell in dein Segelboot und komme zu uns. Ich markiere unseren Standort auf deinem Radar.“ Unten rechts erscheint dabei das wackelnde Funkgerät.
- **Segeln zum Ziel:** im Boot oben links das Radar mit dem roten Punkt, darunter der Schubbalken. Das Ziel liegt weit draußen, damit man rund um die Insel frei fahren kann – hält man aber darauf zu, **kommt es entgegen** (direkt hingesteuert ~14 s). Schwimmend ist es nicht erreichbar. Am Ziel: Blende zum **Globus** (die Geheimland-Welt mit Joshis Insel), danach beginnt die Etappe neu (Reload).

## 🕵️ 1. Das Spielprinzip: Joshi ist Detektiv

**Neu gefasst am 20.10.2026.** Die frühere Fall-Idee (Chaos im Geheimland, Fotobrett, der Fuchs als Täter, Täter-Generator) war nicht schlüssig und ist ersetzt.

- **Ein Fall = eine Geschichte über mehrere Etappen.** Jede Etappe ist eine kleine Reise an einen anderen Ort (mit Segelboot, Flugzeug, U-Boot, Rakete …). Am Ende einer Etappe weiß Joshi etwas Neues, das ihn zum nächsten Ort führt.
- **Zu Weihnachten gibt es einen Fall.** Das Spiel ist so gebaut, dass später **weitere Fälle** dazukommen können: neuer Anruf, neue Orte, neue Verdächtige. Insel, Hütte, Fuchs, Notizbuch und Werkzeuge bleiben.
- **Detektivarbeit heißt: die Werkzeuge benutzen.** Hinweise bekommt Joshi nicht geschenkt, er erarbeitet sie mit seiner Ausrüstung (siehe Abschnitt 3).
- **Kein Bösewicht, nie Scheitern.** Wer es war, hatte einen Grund (Hunger, Angst, etwas verloren). Joshi hilft ihm, und alles wird wieder gut. Falsche Wahl = der Fuchs schüttelt den Kopf (*Sit_No*), die Erzählerin gibt einen Tipp, man versucht es noch einmal.

## 🏝️ 2. Der Rahmen: die Insel ist das Detektivbüro

Jeder Fall läuft im selben Rahmen ab – wie in einer Kinderserie. Nach dem ersten Fall weiß das Kind, wie es geht.

1. **Die Insel** (Etappe 1, gebaut) ist Joshis Zuhause und Büro: Hütte mit Ausrüstung, Lagerfeuer, **Funkgerät**, Steg mit Segelboot.
2. **Der Anruf:** Über das Funkgerät meldet sich jemand mit einem Problem (Stimme, kein Text). Das ist der Start jedes Falls.
3. **Die Reise:** Etappe für Etappe von Ort zu Ort. Der Globus zeigt zwischen den Etappen, wo Joshi im Geheimland ist.
4. **An jedem Ort:** Spur sichern → Verdächtige besuchen → vergleichen → Hinweis zum nächsten Ort (Abschnitt 4).
5. **Die Auflösung:** Joshi findet heraus, wer es war und warum – und hilft.
6. **Die Trophäe:** Ein Andenken an den Fall kommt ins **Regal der Hütte** (Platz ist schon da). Danach ist das Funkgerät still, bis der nächste Fall kommt.

- **Ausrüstung (gebaut):** Notizbuch aus dem Regal, vom Tisch Lupe, Kompass, Taschenmesser, Stift und Kamera – alles im Rucksack.
- **Kinderzimmer (später, kein Muss):** Joshi schläft ein und wacht im Geheimland auf; am Ende eines Falls wacht er im Kinderzimmer auf, und die Trophäe steht dort im Regal.

## 🧰 3. Der Werkzeug-Baukasten

Jedes Werkzeug hat eine klare Aufgabe. Foto, Skizze, Schnitzen und Lupe gibt es schon in Etappe 1 (als 3D-Szenen bzw. Bilder ins Notizbuch).

| Werkzeug | Was Joshi damit tut | Was er dadurch erfährt / erreicht |
|---|---|---|
| **Kamera** | den Tatort fotografieren | Die Spur ist festgehalten (z. B. ein Abdruck im Sand) und kommt ins Notizbuch |
| **Lupe** | ganz genau hinschauen | Winziges wird sichtbar: ein Haar, eine Feder, Honigtropfen, eine Ameisenstraße |
| **Stift** | etwas abzeichnen, z. B. die Pfote eines Verdächtigen | eine Skizze im Notizbuch zum Vergleichen |
| **Notizbuch** | Spur und Skizzen nebeneinander anschauen | Welche Skizze passt zur Spur? |
| **Taschenmesser** | Seil, Dornen oder Ranken durchschneiden | ein Weg, eine Kiste oder ein festsitzendes Tier ist frei |
| **Taschenmesser (schnitzen)** | ein Geschenk schnitzen | ein Tier freut sich, zeigt seine Pfote oder verrät etwas |
| **Kompass** | einer Richtung folgen | „Die Ameisen laufen nach Norden“ → dort geht es weiter |

- **Später: das Werkzeug selbst wählen.** In Etappe 1 geben die farbigen Kreise das Werkzeug vor (blau = Foto, rot = Skizze, grün = Schnitzen, braun = Lupe). In späteren Fällen kann Joshi mit Y an einer Stelle den Rucksack öffnen und das passende Werkzeug **selbst wählen**; die Hinweis-Taste hilft in Stufen („Vielleicht hilft dir etwas, das ganz genau hinschaut.“ → „Nimm die Lupe.“). *(noch offen, ab wann)*

## 🐾 4. Ein Ort im Fall: eine Spur, bis zu drei Verdächtige

So läuft eine Detektiv-Etappe ab:

1. **Spur sichern:** Am Tatort gibt es **eine** Spur. Joshi sichert sie mit Kamera oder Lupe; sie kommt ins Notizbuch.
2. **Verdächtige besuchen:** In der Nähe sind **bis zu drei ähnliche Tiere**. Jedes zeigt seine Pfote (oder Feder, Haar …) erst, wenn Joshi ihm hilft – mit einem Werkzeug oder einer kleinen Herausforderung (Abschnitt 5). Dann zeichnet Joshi sie ab.
3. **Vergleichen:** Im Notizbuch liegt die Spur neben den Skizzen; das Kind wählt die passende. Falsch → der Fuchs schüttelt den Kopf, die Erzählerin gibt einen Tipp („Zähl mal die Zehen.“).
4. **Ergebnis:** Der Treffer bringt den Hinweis zum nächsten Ort (oder die Auflösung). Den anderen hat Joshi trotzdem geholfen.

- **Ähnliche Tiere** machen das Vergleichen zum Rätsel – bei drei ganz verschiedenen Tieren könnte man raten. Der Anfang darf leichter sein (zwei Verdächtige), später sind es drei.
- **Jede Etappe hat ihre eigene Tiergruppe und ihre eigene Art Spur** – so wird es nicht langweilig, und jedes Werkzeug kommt dran.
- **Ein klares Merkmal pro Gruppe**, das ein knapp Sechsjähriger sofort sieht:

| Tiergruppe (lieb, nicht gefährlich) | Spur | Woran man sie unterscheidet |
|---|---|---|
| **Puma, Tiger, Löwe** | ein Haar (Lupe) | Tiger orange mit schwarzem Streifen · Löwe langes goldenes Mähnenhaar · Puma kurz, einfarbig hellbraun |
| **drei Vögel** | eine Feder (Lupe oder Foto) | Farbe, z. B. Elster schwarz-weiß · Blaumeise blau-gelb · Rotkehlchen orange-rot |
| **Eichhörnchen, Hamster, Maus** | Spur im Staub (Foto) | Schwanzspur: Maus dünner Strich · Eichhörnchen buschiger Wisch · Hamster keine; oder die Pfotengröße |
| **Wolf, Labrador, Shiba** (Modelle vorhanden) | Pfotenabdruck (Foto) | nur die Größe: groß · mittel · klein |
| etwas Klebendes | Honig, Farbe, Schlamm (Lupe) | klebt nur an einer der Pfoten |

- **Joshis Fuchs ist nie verdächtig** – er hilft schnüffeln (X) und zeigt mit *Sit_Yes* / *Sit_No*, ob es passt.
- **Spuren und Skizzen sind gezeichnete Bilder** (wie die Steg-Skizze), nicht das 3D-Modell: Das Merkmal wird dort deutlich gezeichnet. Die Modelle brauchen keine detaillierten Pfoten.

## 🚀 5. Reisen und Herausforderungen

Die Etappen sollen sich verschieden anfühlen. Die Engine (Flugspiel) bringt dafür schon vieles mit: Fliegen, Weltraum, Mond mit **Mondbasis**, Mars, U-Boot, Boote, Schwimmen und Tauchen.

- **Reisen:** segeln, fliegen, **ins All zum Mond und in die Mondbasis hinein** (Innenraum = eigene Welt), mit dem U-Boot in die Tiefe …
- **Herausforderungen, die einen Hinweis bringen** (bei Erfolg; sonst einfach noch einmal):
  - **mit einem Tier um die Wette schwimmen** (Sieg → das Tier verrät etwas oder zeigt seine Pfote)
  - **tauchen**, um etwas vom Grund zu holen
  - mit dem Messer jemanden befreien; etwas schnitzen und verschenken
  - einer Spur mit dem Kompass folgen
  - Fahrzeug-Aufgaben aus früheren Ideen: **Müllwagen** (Tonnen leeren, sortieren – Modell `garbage_truck_by_Lung_ong.glb` vorhanden), **Löschboot** (Feuer löschen), **Mondrover** (umgekippt, wieder aufrichten)
- Alles ohne Zeitdruck und ohne Lesen (Erzählerin, Funk, Symbole, Pfeile). Wettrennen sind gegen ein Tier, nicht gegen die Uhr.

## 🧸 6. Neue Tiere (Modelle)

- **Vorhanden** in `3d Modelle\Spiele`: Wolf, Labrador, Shiba, Eichhörnchen, Panda, Schildkröte, Kamel, Krokodil, Möwe, Schmetterling, Fuchs (Joshis Begleiter).
- **Weitere über Sketchfab** – darauf achten:
  - **Animationen müssen dabei sein** (Mixamo geht nur bei menschenähnlichen Figuren): mindestens Stehen und Laufen, schön sind Sitzen / Freuen (für „zeigt seine Pfote“, „bedankt sich“).
  - **Stil „lieb“:** Cartoon oder Low-Poly, nicht fotorealistisch – passend zu Joshi und dem Fuchs.
  - **Größe:** möglichst unter ~30.000 Dreiecke, Texturen bis 2K, als GLB.
  - **Lizenz:** CC-BY oder CC-BY-NC; Name und Autor für die Quellenliste notieren.

## 🎄 7. Fall 1 (Weihnachten): „Das Weihnachtsessen“

*Entwurf vom 20.10.2026 – Etappe 2 bis 4 vom Nutzer so beschrieben; offene Punkte stehen unten.*

**Worum es geht:** Auf einer Waldinsel wollen die Tiere ein großes Weihnachtsessen feiern – aber das ganze Essen ist weg.

### Etappe 1 – Joshis Insel (gebaut)
Ausrüstung, Detektiv-Kreise, Funkspruch („Hallo Joshi... Bitte hilf' uns. Wir haben ein großes Problem. …“), Segeln zum Ziel. Der Anrufer sind die Tiere der Waldinsel.

### Etappe 2 – die Waldinsel, am Festtisch (bei Tag)
- **Ort:** ein **Nadelwald mit wenig Schnee**. Nahe am Strand eine freie Stelle (wie auf Joshis Insel) mit **Lagerfeuer** und dem **Festtisch**; an den Bäumen um Tisch und Feuer etwas **Weihnachtsschmuck**, dazu ein **geschmückter Weihnachtsbaum**. Ankunft mit dem Segelboot, es ist **Tag**.
- **Am Tisch sitzen lauter Tiere** (Modelle sucht der Nutzer über Sketchfab). Sie sind traurig: Alles Essen für das große Weihnachtsessen ist weg. Der **Bär** sei in letzter Zeit auch immer so grummelig.
- **X (umschauen) → blauer Fotoring am Tisch.** Joshi fotografiert den Tisch: nur noch Reste. **Auf dem Foto sind zwei Fußspuren** – vom **Hamster** und vom **Eichhörnchen**.
- **Ein Weg führt in den Wald.** An seinem Eingang der **braune Lupenring**: unter der Lupe eine **Ameisenstraße und etwas Honig**.
- **Alle Hinweise gesammelt →** die Erzählerin: Das ist ein schwieriger Fall – vielleicht sollte man sich alle Hinweise noch einmal genau ansehen.
- **Im Notizbuch (Inventar):**
  - **beim Foto:** die Erzählerin weist auf die **zwei Fußspuren** hin → die **Zeichen-Animation** (Bleistift wie bei der Steg-Skizze) macht von beiden Spuren **große Zeichnungen**, die ebenfalls ins Notizbuch kommen.
  - **bei der Lupen-Skizze:** die Erzählerin: Das sieht aus wie **Honig**.
- **Die Tiere** kennen die Spuren nicht. Aber der Bär mag ja gerne Honig, ist überhaupt ganz verfressen und grummelig – er wohnt in der **Höhle auf der anderen Seite des Waldes**.
- **Joshi geht in den Wald →** Blende, **Globus** (Reise auf die andere Seite der Insel), Blende.

### Etappe 3 – beim Bären
**Draußen:** Joshi steht **von hinten gesehen am Waldausgang**. Links weg die **Piste** (Rollfeld) mit der **Mustang**, hinter der Piste Wald. Vor Joshi der **Berg mit dem Höhleneingang**; der Berg zieht sich weit nach rechts, daneben ebenfalls Wald. Die Mustang sieht man schon, **einsteigen geht aber noch nicht**.

**In der Höhle** (Innenraum = eigene Welt):
1. Der **Bär liegt am Lagerfeuer**. Spricht Joshi ihn an (Y), sagt er immer ganz traurig: „Lass mich bitte in Ruhe.“
2. **X (umschauen) →** der **braune Lupenring** und der **Holzscheit mit dem grünen Schnitzring**.
3. **Schnitzen geht noch nicht** – erst die Lupe: Joshi entdeckt ein **zerbrochenes Holzentchen** (Skizze vom kaputten Entchen ins Notizbuch).
4. **Jetzt kann Joshi mit dem Bären reden:** „Ist dein Entchen zerbrochen?“ – Der Bär: Ja, und seitdem ist er ganz dolle traurig, nichts kann ihn trösten – nicht mal der Honig, den er vom eh schon verwüsteten Tisch genommen hat.
5. **Jetzt geht das Schnitzen:** Joshi schnitzt ein **neues Entchen** (Skizze im Notizbuch **unter** dem kaputten). Eine **Kopie** des Entchens steht danach in Joshis **Regal in seiner Hütte** (wie der Holzfuchs auf dem Bord).
6. **Joshi schenkt dem Bären das Entchen:** Er wird fröhlich und gibt den **Honigtopf** zurück. Daran entdeckt Joshi **rotes Fell** (vom Eichhörnchen – das wird aber nicht verraten); das Fell **klebt dann im Notizbuch**.
7. **Joshi fragt**, ob der Bär weiß, von wem das Fell ist. Nein – aber Joshi könne ja mal den **Hamster** fragen, der weiß immer alles und kennt jeden.
8. **Aus Dankbarkeit leiht der Bär Joshi sein Flugzeug** (die Mustang).
9. **Vor dem Ausgang** der **blaue Fotoring**: Joshi macht ein **Foto vom Bären**, wie er sein Holzentchen hält und lächelt.

**Draußen:** Jetzt kann Joshi in die **Mustang** einsteigen und von der Piste starten.

### Etappe 4 – zum Hamster in die Wüste
- **Warum Wüste:** Der Hamster mag es warm und kalt, und er beobachtet gerne die Sterne und den Mond. Nirgends geht das besser als in der Wüste, weil es dort nachts nie Wolken gibt. Er wohnt **mitten in der Wüste in einer Oase mit Planetarium**.
- **Hinkommen nur mit dem Fallschirm:** Joshi startet beim Bären, fliegt Richtung **roter Punkt** → Blende, Globus, Blende → Joshi fliegt **noch ein Stück allein**. Dann die Erzählerin: Jetzt **mit B abspringen**, der **Autopilot bringt das Flugzeug zum Bären zurück**. Das wird nur **gesagt**, nicht gezeigt – der Rückflug wird nicht gebaut.
- **Freier Fall** wie in *Trip to Japan* (Fuji-Sprung), der **Fallschirm geht automatisch auf**, **Landung vor dem Planetarium**. Es ist **Tag**.
- **Die Oase** (Blick von der Landestelle):
  - **Ein kleiner See** von der Mitte bis an den rechten Rand, mit einem **kleinen Strand** und ein paar **Palmen** drumherum.
  - **Eine Wiese mit Palmen**, darauf das **Planetarium** (nicht zu riesig).
  - Daneben ein **Parkplatz mit einem X-Wing** – noch **nicht benutzbar** (vielleicht für eine spätere Etappe, z. B. zum Mond).
  - **Um die ganze Oase ein Ring aus Palmen**: Er markiert die Grenze zur Wüste mit Sand.
- *(weiter offen)*

### Offen
- **Wie geht es beim Hamster weiter** – und wie wird das Eichhörnchen überführt? Warum hat es das Essen genommen?
- **Warum ist die Spur des Hamsters am Tisch**, wenn er in der Wüste wohnt (war er zu Besuch? bringt er Joshi darauf)?
- **Auflösung, Weihnachtsessen am Ende, Trophäe.**
- **Modelle:** Tiere am Tisch (Sketchfab), Bär (liegen, traurig, fröhlich), Hamster, Holzentchen (heil und zerbrochen), Honigtopf, Weihnachtsbaum und -schmuck, Nadelbäume, Planetarium, Palmen (Oase). Vorhanden: X-Wing (Engine), Eichhörnchen (`squirrel_animation_by_blam`), Mustang (Engine), Lagerfeuer.
- **Aus *Trip to Japan* übernehmbar** (gleiche Engine): Wüste mit Oase (dortige Etappe 2), Absprung, freier Fall und Fallschirm (Finale).

## 🎓 8. Lerneffekte

- **Genau hinschauen & Beweise prüfen:** nicht raten, sondern die Spur mit allen Verdächtigen vergleichen.
- **Werkzeuge sinnvoll einsetzen:** Welches Werkzeug hilft hier?
- **Natur & Wissen:** Tierspuren, Federn, Fell; Sterne, Kompass und Himmelsrichtungen; Umwelt (z. B. Müll trennen).
- **Empathie:** Wer etwas angestellt hat, hatte einen Grund; helfen und verzeihen gehört dazu.

## 🗺️ Nächste Schritte

1. ~~Ausrüstung, Funkspruch, Kamera und Notizbuch~~ – gebaut (16.10.2026).
2. **Fall 1 „Das Weihnachtsessen“ fertig planen** (Abschnitt 7): beim Hamster in der Wüste, das Eichhörnchen und sein Grund, Auflösung.
3. **Fehlende Tiermodelle** für die gewählten Gruppen über Sketchfab besorgen (Abschnitt 6).
4. **Bausteine bauen:** Spur sichern, Verdächtige mit Helfer-Aufgabe, Pfote abzeichnen, Vergleichen im Notizbuch.
5. **Erste Detektiv-Etappe** nach dem Segeln (ersetzt die Blende zum Globus mit Neustart).
6. Später: Werkzeug selbst wählen, Kinderzimmer als Rahmen, weitere Fälle.

## 📚 Quellen

Mixamo (Rigging, Animationen) · „Fox“ von pxltiger (CC-BY-4.0) · „Wooden Fox Kit Figure“ von Yogensia (CC-BY-NC-SA-4.0) · „Ulysses Butterfly“ von eb78 (CC-BY-SA-4.0) · Ausrüstung siehe README · „Stage Campfire“ von daedaljs (CC-BY-4.0) · „Ring-Billed Gull“ von Oregon State University Ecampus (CC-BY-4.0) · Gitarren-Loop von idoberg (Pixabay) · Modelle/Töne der Flugspiel-Engine. Modelle liegen in `3d Modelle\Spiele`, Töne in `Software\Musik`.

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
