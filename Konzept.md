# 🌙 KONZEPT: Das Geheimland

Ein interaktives 3D-Detektiv- und Aufräum-Abenteuer auf Basis von WebGL/Three.js – Teil von „Die Abenteuer von Joshi & Samu“.

**Spielen:** https://workflow42.github.io/das_geheimland/ · Repo: `workFLOw42/das_geheimland` · Stand: 21.10.2026 · Sprechtexte: [SPRECHTEXTE.md](SPRECHTEXTE.md)

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
| X 3 s halten (im Startbildschirm) | X | **Testzugang:** E1 Detektiv, E1 Segeln, E2, E2 Spuren, E2 Waldweg, E3, E3 Abflug – jeweils mit allem freigeschaltet, was davor im Spiel passiert wäre |
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
| **Eichhörnchen, Lama** (Fall 1) | Fußspur (Foto, Lupe) | Lama: zwei längliche Zehen je Huf · Eichhörnchen: lange Zehen, große Hinterpfoten in Sprüngen |
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
**Gebaut am 21.10.2026 (erster Teil, `waldinsel.js`):** Nach dem Globus steht Joshi gleich auf der Waldinsel – wie in *Trip to Japan* ohne Neuladen und ohne Startbildschirm (`story.e2Wechsel`, `story.etappeWechsel`): auf der Wiese zwischen Steg und Lichtung, Blick zum Tisch, der Fuchs neben ihm; das Segelboot liegt an einem Steg, der genauso gebaut ist wie zu Hause. Lädt man die Seite neu, geht es dort weiter (Spielstand: Etappe, Rucksack, Notizbuch-Seiten; zum Testen `index.html?etappe=2`). Licht gedämpft (Streulicht 0,62, Sonne 0,58, blasserer Winterhimmel, leichter Dunst), Schnee mit Struktur (Mulden, Windrippel, getaute Stellen). Tag (Tageshimmel der Engine mit Wolken, keine Sternbilder), Winterwiese mit Schneeflecken, rundherum ein verschneiter Nadelwald (gut 150 Tannen, einige mit Kugeln, Lichterketten zwischen den vorderen Bäumen). Auf der Lichtung: **Festtisch** mit zwei Bänken, karierter Decke, leeren Tellern, umgefallenen Bechern und Krümeln; rechts vorn das **Lagerfeuer**; links hinten der **Weihnachtsbaum** (Kugeln, Lichterkette, Stern, Geschenke). **Am Tisch:** Elch (steht am Kopfende), Hase und Eule auf der hinteren Bank, Reh dahinter, Hasenbaby, Meise und blauer Vogel auf dem Tisch – alle zum Strand gewandt, damit Joshi die Gesichter sieht; kommt er näher, drehen sie sich zu ihm. Mit X leuchten alle Tiere auf einmal; **Y beim Elch** (eigener Text) und **ein Y für alle anderen** – sie erzählen schnell nacheinander, jedes in seiner Stimme (Texte als Entwurf in SPRECHTEXTE.md). Das Lagerfeuer hat kein Y. Der Elch liegt am Kopfende im Schnee (sein Sitz-Clip hebt das Modell an – gemessen und allgemein ausgeglichen: Größe aus dem Stehen, Höhe aus der Haltung). **Tatortfoto (blauer Ring):** Haben alle Tiere erzählt, sagt die Erzählerin, Joshi solle sich am Tisch noch einmal umschauen; erst nach diesem X zeigt der Fuchs den Ring. Das Foto zeigt den Tisch senkrecht von oben in voller Länge, ohne Tiere und Fuchs, mit zwei deutlich verschiedenen Fußspuren auf der Decke (Lama: Hufe mit zwei länglichen Zehen im Wechselschritt, Eichhörnchen: lange Zehen in Sprüngen) und kommt ins Notizbuch (Ortssymbol: zwei Tannen). **Lupe (brauner Ring)** am Eingang des Waldwegs (ein brauner Erdweg mit Wegweiser wächst sanft aus der Schneewiese, führt zwischen hohen, dunklen Tannen eng und düster in den Wald und verschwindet dort im Schatten), freigeschaltet mit demselben X: unter der Lupe die Bananenschale mit einer Ameisenstraße, als Skizze ins Notizbuch. **Nach dem Foto** fragt Joshi nach den Spuren (Hase: „Meine Pfoten sind viel größer“, Eule: Krallen, Elch: nie gesehen – keiner war es, verraten wird nichts). **Nach der Lupe** fragt Joshi, von wem die Schale ist – die Eule tippt auf den Gorilla (mag Bananen, ist so schlecht gelaunt), der Elch sagt, er wohne am Ende des Weges; nach dem Foto läuft der Fuchs noch einmal zum braunen Ring; geht Joshi in den Waldweg, kommt der Globus („Die Höhle des Gorillas“) und vorerst „Fortsetzung folgt …“ (Etappe 3 ist noch nicht gebaut). **Skizze vom Steg (Etappe 1):** das Meer ist von Anfang an da (vorher sah man in den ersten Schichten unter Wasser), mit Bleistift-Wellen; die Spritzer des Wals fliegen hinter ihm her (er springt von links nach rechts). **Der Wald:** hinter dem Lagerplatz locker (die verschneiten Tannen bleiben zu sehen), links und rechts im Hintergrund dicht. Am Waldweg drei Reihen hoher, dunkler Tannen; ab der dritten Reihe wachsen Äste über den Weg und bilden ein Dach. Geht Joshi hinein, wird es langsam dunkler (Licht und Dunst), eine Eule ruft ab und zu, ganz leise knackt Holz – man muss mutig sein. Auf dem Globus ist die Waldinsel größer und bewaldet; der Punkt der Ankunft liegt am Strand, die Höhle des Gorillas im hinteren Drittel im Wald. *Noch offen:* Notizbuch-Hinweise (Spuren groß abzeichnen, „Das ist ja eine Bananenschale“).

- **Ort:** ein **Nadelwald mit wenig Schnee**. Nahe am Strand eine freie Stelle (wie auf Joshis Insel) mit **Lagerfeuer** und dem **Festtisch**; an den Bäumen um Tisch und Feuer etwas **Weihnachtsschmuck**, dazu ein **geschmückter Weihnachtsbaum**. Ankunft mit dem Segelboot, es ist **Tag**.
- **Am Tisch sitzen lauter Tiere** (Modelle sucht der Nutzer über Sketchfab). Sie sind traurig: Alles Essen für das große Weihnachtsessen ist weg. Der **Gorilla** sei in letzter Zeit auch immer so grummelig.
- **X (umschauen) → blauer Fotoring am Tisch.** Joshi fotografiert den Tisch: nur noch Reste. **Auf dem Foto sind zwei Fußspuren** – vom **Lama** und vom **Eichhörnchen**.
- **Ein Weg führt in den Wald.** An seinem Eingang der **braune Lupenring**: unter der Lupe ein **Stück Bananenschale** (vielleicht mit ein paar Fruchtfliegen).
- **Alle Hinweise gesammelt →** die Erzählerin: Das ist ein schwieriger Fall – vielleicht sollte man sich alle Hinweise noch einmal genau ansehen.
- **Im Notizbuch (Inventar):**
  - **beim Foto:** die Erzählerin weist auf die **zwei Fußspuren** hin → die **Zeichen-Animation** (Bleistift wie bei der Steg-Skizze) macht von beiden Spuren **große Zeichnungen**, die ebenfalls ins Notizbuch kommen.
  - **bei der Lupen-Skizze:** die Erzählerin: Das ist ja eine **Bananenschale**.
- **Die Tiere** kennen die Spuren nicht. Aber der Gorilla mag ja so gerne **Bananen**, ist überhaupt ganz verfressen und grummelig – er wohnt in der **Höhle auf der anderen Seite des Waldes**.
- **Joshi geht in den Wald →** Blende, **Globus** (Reise auf die andere Seite der Insel), Blende.

### Etappe 3 – beim Gorilla
**Gebaut am 21.10.2026 (draußen, `hoehle.js`):** Nach dem Globus vom Waldweg steht Joshi direkt hier (ohne Neuladen). Später Nachmittag, warmes tiefes Licht. Joshi steht am Ende des Waldwegs – dieselbe dunkle Gasse wie auf der Lichtung, ohne Schnee, sie läuft vor ihm sanft in die Wiese aus. Vor ihm ein richtig hoher Felsberg (Gipfel ~110 m) aus Low-Poly-Brocken mit wenig Schnee und etwas Moos, er zieht sich weit nach rechts; im Fuß der Höhleneingang mit Felsbogen und zwei Tannen. Links die **Wald-Schotterpiste** (Fahrspuren, Pfützen, dichter Wald zu beiden Seiten) mit der geparkten **Mustang** (Y: „Ohne den Gorilla kannst du nicht fliegen“). Aus der Höhle brummt der Gorilla ab und zu (Ton von Pixabay). Testzugänge „E3“ und „E3 Abflug“.

**In der Höhle (gebaut, `hoehle_innen.js`):** eine eigene Welt (runde Felshöhle, Feuer in der Mitte, Stroh, Steine, ein heller Ausgang). Man geht einfach durch das dunkle Loch hinein. **Vor dem Suchblick passiert nichts** (Live-Wunsch). Nach X: Gorilla, brauner Lupenring (zerbrochenes Holzentchen) und grüner Schnitzring am Holzscheit. Gorilla vor der Lupe: „Lass mich bitte in Ruhe.“ – Schnitzring vor dem Gespräch: noch nicht. Lupe → Skizze „Das kaputte Entchen“. Gorilla: Joshi fragt nach dem Entchen, der Gorilla erzählt (und dass er die Bananen genommen hat). Schnitzen → „Das neue Entchen“ (eine Kopie steht im Hüttenregal). Gorilla: Joshi schenkt es ihm – er trommelt vor Freude, hält das Entchen vor der Brust, gibt den Bananenkorb zurück; daran **rotes Fell** (Seite im Notizbuch). Joshi fragt nach dem Fell – frag das Lama; und er leiht Joshi sein Flugzeug. Blauer Fotoring am Ausgang: „Der Gorilla“. **Draußen** ist der Waldweg jetzt hell. Die Mustang (das Flugzeug der Engine) hat erst jetzt ein Y: einsteigen, von der Waldpiste nach Süden starten (weg vom Berg), Radar oben links mit dem roten Punkt (kommt entgegen). Am Ziel: Globus zur Wüste, „Fortsetzung folgt“. Kein Scheitern: nach einem Absturz steht Joshi wieder in der Mustang am Pistenanfang. *Gebaut:* ist der Gorilla wieder fröhlich, ist der Waldweg hell (der Schatten ist weg). *Für das Fliegen später:* die Mustang darf auf der ganzen Insel rollen (Engine `canLandHere`), aber `hitsBuilding` kennt alle Grenzen der Welt – beim Einsteigen muss die geparkte Mustang samt Grenze weg, sonst steht das Flugzeug „im Gebäude“.
**Draußen:** Joshi steht **von hinten gesehen am Waldausgang**. Links weg die **Piste** (Rollfeld) mit der **Mustang**, hinter der Piste Wald. Vor Joshi der **Berg mit dem Höhleneingang**; der Berg zieht sich weit nach rechts, daneben ebenfalls Wald. Die Mustang sieht man schon, **einsteigen geht aber noch nicht**.

**In der Höhle** (Innenraum = eigene Welt):
1. Der **Gorilla sitzt zusammengesunken am Lagerfeuer** (`sit`; oder liegt eingerollt, `sleep`). Spricht Joshi ihn an (Y), sagt er immer ganz traurig: „Lass mich bitte in Ruhe.“
2. **X (umschauen) →** der **braune Lupenring** und der **Holzscheit mit dem grünen Schnitzring**.
3. **Schnitzen geht noch nicht** – erst die Lupe: Joshi entdeckt ein **zerbrochenes Holzentchen** (Skizze vom kaputten Entchen ins Notizbuch).
4. **Jetzt kann Joshi mit dem Gorilla reden:** „Ist dein Entchen zerbrochen?“ – Der Gorilla: Ja, und seitdem ist er ganz dolle traurig, nichts kann ihn trösten – nicht mal die Bananen, die er vom eh schon verwüsteten Tisch genommen hat.
5. **Jetzt geht das Schnitzen:** Joshi schnitzt ein **neues Entchen** (Skizze im Notizbuch **unter** dem kaputten). Eine **Kopie** des Entchens steht danach in Joshis **Regal in seiner Hütte** (wie der Holzfuchs auf dem Bord).
6. **Joshi schenkt dem Gorilla das Entchen:** Er wird fröhlich (trommelt sich vor Freude auf die Brust, `ChestDrum`) und gibt den **Bananenkorb** zurück. Daran entdeckt Joshi **rotes Fell** (vom Eichhörnchen – das wird aber nicht verraten); das Fell **klebt dann im Notizbuch**.
7. **Joshi fragt**, ob der Gorilla weiß, von wem das Fell ist. Nein – aber Joshi könne ja mal das **Lama** fragen, das weiß immer alles und kennt jeden.
8. **Aus Dankbarkeit leiht der Gorilla Joshi sein Flugzeug** (die Mustang).
9. **Vor dem Ausgang** der **blaue Fotoring**: Joshi macht ein **Foto vom Gorilla**, wie er sein Holzentchen hält und lächelt.

**Draußen:** Jetzt kann Joshi in die **Mustang** einsteigen und von der Piste starten.

### Etappe 4 – zum Lama in die Wüste
- **Lama statt Hamster (Live-Wunsch 26.10.2026):** Das Hamster-Modell war technisch nicht schön – jetzt wohnt hier das **Lama** (`llama_-_animated_low_poly_by_WildPoly3D`, nur `idle` und `lookaround`). Es steht hinter dem Tisch mit dem Paket, bekommt die Schnur nicht auf, weil man **mit Hufen keinen Knoten aufmachen kann** (statt der Zahnschmerzen), und ist über den Festtisch **gestakst**. Spur überall: **zwei längliche Zehen je Huf** mit kleinen Nägeln vorn (Tatortfoto, Staub im Observatorium). Stimme `tierW`.
- **Umbau am 26.10.2026 (Live-Wünsche):** Tisch mit Paket und Lama rechts hinten im Saal, die Hufspur vorn am Eingang (vorher standen zwei Y zu dicht); im Ring zeigt sich nur das Y des Rings (überall, auch beim Bananenkorb, den der Gorilla jetzt 3 m weit schiebt). **Seil:** am Messer-Ring eine Szene wie beim Schnitzen – das Messer schneidet im weißen Oval durch ein Seil (Textur „Rope“ von xenosmashgames), danach „Die Schnur“ als Skizze im Notizbuch, dann geht das Paket auf. **Spurvergleich:** auf der Spurseite ein grünes A → das Buch blättert zum Tatortfoto, die neue Spur dreht sich und legt sich erst genau auf die Eichhörnchenspur (roter Rahmen), dann auf die Lamaspur (grüner Rahmen); zurück auf der Spurseite steht darunter das Lama als Skizze. **Foto** vorn am Eingang, der Fuchs läuft ins Bild. **Skizzenring** draußen vor dem Observatorium (für das Bild kurz Nacht). Draußen leuchtet beim Suchblick jetzt auch das Observatorium (Y vor der Tür); der X-Wing hat nur noch Grenzen unter dem Rumpf (von vorn erreichbar). Kein „Fortsetzung folgt“ mehr in der Wüste.
- **Warum Wüste:** Das Lama mag es warm und kalt, und es beobachtet gerne die Sterne und den Mond (die großen Sternwarten der Welt stehen in der Atacama-Wüste, wo Lamas zu Hause sind). Nirgends geht das besser als in der Wüste, weil es dort nachts nie Wolken gibt. Es wohnt **mitten in der Wüste in einer Oase mit Observatorium**.
- **Hinkommen nur mit dem Fallschirm:** Joshi startet beim Gorilla, fliegt Richtung **roter Punkt** → Blende, Globus, Blende → Joshi fliegt **noch ein Stück allein**. Dann die Erzählerin: Jetzt **mit B abspringen**, der **Autopilot bringt das Flugzeug zum Gorilla zurück**. Das wird nur **gesagt**, nicht gezeigt – der Rückflug wird nicht gebaut.
- **Freier Fall** wie in *Trip to Japan* (Fuji-Sprung), der **Fallschirm geht automatisch auf**, **Landung vor dem Observatorium**. Es ist **Tag**.
- **Die Oase** (Blick von der Landestelle):
  - **Ein kleiner See** von der Mitte bis an den rechten Rand, mit einem **kleinen Strand** und ein paar **Palmen** drumherum.
  - **Eine Wiese mit Palmen**, darauf das **Observatorium** (nicht zu riesig).
  - Daneben ein **Parkplatz mit einem X-Wing** – noch **nicht benutzbar** (vielleicht für eine spätere Etappe, z. B. zum Mond).
  - **Um die ganze Oase ein Ring aus Palmen**: Er markiert die Grenze zur Wüste mit Sand.
- **Gebaut am 23.10.2026 (Außenbereich, `wueste.js`):** Globus-Punkt in der Mitte der Wüsteninsel; nach dem Globus kreist die Mustang von selbst in 300 m Höhe über der Oase (rotes B über dem Flugzeug), Ansage, B → freier Fall, Schirm, Landung vor dem Observatorium. Wüsteninsel 650 m Sand, Oase in der Mitte: Wiese (46 m) mit Palmen, rechts ein See (8 m tief, mit Strand im Wüstensand; Joshi watet hinein, schwimmt und taucht bis zum Grund; Seegras, Schwämme und Korallen; darin nur Fische, eine Meeresschildkröte, zwei Seeloewen am Ufer, ein Schildkröten-Baby, das am Strand krabbelt, und ein Manta – kein Wal, keine Moewen), das Observatorium („Welcome to the Observatory“, 10 m) mit offener Tür (kein Y: hindurchlaufen → Blende, vorerst „Fortsetzung folgt“), ein Feldweg vom Palmenring bis zur Tür, Parkplatz mit X-Wing (Grenzen, noch nicht benutzbar, kein Y), Palmenring. Hinweis-Taste draußen: „Schau doch mal, ob du ins Observatorium kommst.“ Neu laden: `?etappe=4`. *Noch offen:* Dünen in der Wüste.
- **Gebaut am 23.10.2026 (Innenraum, `observatorium_innen.js`, erster Teil):** runder Saal (R 11 m, größer und höher als die Höhle), Steinwände mit Holzpfosten, darüber eine Sternwarten-Kuppel aus Brettern mit Rippen, Laufring und offenem Spalt (Holzläden links und rechts); drinnen ist draußen **Nacht** – durch den Spalt, die Bogenfenster und die Tür sieht man Sterne, Milchstraße und Sternbilder, draußen ist wieder Tag. In der Mitte das Messing-Teleskop („Telescope (Realistic)“ von Raphael Grimm) auf einem runden Podest mit Teppich, es schwenkt langsam. Sechs hohe Bücherregale voller Vintage-Bücher (Leder, Goldbänder, liegende Stapel, eine Leiter), ein Schreibtisch mit Sternkarte, Globus und Kerze; vorn rechts der Tisch mit dem Paket (Schnur mit Schleife, Post-Aufkleber), dahinter das Lama (seit 26.10.2026, vorher der Hamster). Ablauf bisher: X → das Lama leuchtet; Y → genervt, mit Hufen geht die Schnur nicht auf; grüner Messer-Ring am Tisch → Joshi schneidet die Schnur (keine Skizze), die Laschen springen auf, das Lama dankt; X → brauner Lupenring vor dem Tisch: Hufspuren im Staub (Skizze ins Notizbuch). *Noch offen:* Schritt 4–6 (B = Vergleichen, Konfrontation, die Geschichte vom Paket).
- **Gebaut am 23.10.2026 (Teil 2, `observatorium_innen.js`, `teleskop.js`, `globus.js`):** der ganze Ablauf unten bis zum Abflug: Spurvergleich im Notizbuch (die Spur gleitet von der rechten Seite über die Lamaspur auf dem Tatortfoto, grüner Rahmen), zweites Gespräch, Packpapier unter der Lupe (Eichhörnchenspur und rotes Fell), drittes Gespräch (Mond-Bewohner, Raumschiff ohne Schlüssel), Fotoring vorn links (das Lama am Paket, dahinter das Teleskop), Skizzenring neben dem Teleskop nach dem Blick hindurch (Oase unter dem Nachthimmel mit Mond), draußen der Holzscheit am Parkplatz mit dem Schnitzring (Schlüssel „Key Wooden“ von Sam, Skizze ins Notizbuch, ein großer im Hüttenregal: Bart nach unten, 30 Grad geneigt), Y am Raumschiff: Joshi fliegt den X-Wing selbst zum roten Punkt im Nord-Nord-Osten (ins freie Weltall geht es nicht), Globus: zoomt heraus, die Kugel wandert nach unten, oben im Nord-Nord-Osten der Mond, der Faden im Bogen hinauf; dann vorerst „Fortsetzung folgt“ (🌙). Etappe-4-Seiten im Notizbuch tragen ein Bleistift-Observatorium als Symbol. Neu überall: blaues X über Joshi, wenn Umschauen die richtige Aktion ist; grünes A am gewählten Ding (Inventar, Teleskop).
- **Etappe 5 – auf dem Mond (Live-Wunsch 23.10.2026, noch nicht gebaut):** nach dem Globus automatischer Landeanflug auf dem Mond, Landung neben der Mondbasis; Joshi und Fuchsi steigen mit Y aus, laufen zur Basis und gehen mit Y hinein (drinnen eigene Welt). Den X-Wing kann er erst wieder besteigen, wenn die Geschichte so weit ist. Kein freies Fliegen im Weltall.
- **Weiter im Observatorium (Live-Wunsch 23.10.2026, ersetzt die Schritte 4–6 unten):**
  1. Nach der Lupe (Spur im Staub, mit B geschlossen) sagt die Erzählerin: „Oh, noch eine Spur. Vielleicht können wir sie mit der Spur vom Tatort vergleichen.“
  2. Öffnet Joshi das Inventar und schaut sich im Notizbuch das Tatortfoto an, vergleichen sich die Spuren (die neue Spur legt sich über die Lamaspur auf dem Foto, sie passt).
  3. Dann noch einmal Y beim Lama: Joshi fragt, wie seine Spur dorthin kommt und was es gemacht hat. Das Lama erzählt: Der Tisch war schon verwüstet, niemand war da, der Uhu hat geschlafen (die Post hatte sein Paket aus Versehen auf die Insel gebracht).
  4. Danach ein brauner Lupenring am Tisch: dort liegt das Packpapier des Pakets. Unter der Lupe: die Spur des Eichhörnchens und wieder rotes Fell. Damit ist klar, dass das Lama nicht gelogen hat (sonst wären die Spuren nicht auf seinem Paket). Offen ist nur noch, wem die letzte Spur und das Fell gehören.
  5. Y beim Lama: es weiß es nicht – aber auf dem Mond wohnt seit Kurzem jemand, der hat es vielleicht von oben gesehen. Joshi darf gern durchs Teleskop schauen, man sieht den Bewohner gut (das Blinken: Morsezeichen „H A L L O“, je Buchstabe abwechselnd rot und blau – gebaut in `teleskop.js`). Und: den X-Wing draußen darf er nehmen – aber das Lama hat den Schlüssel verloren; wer einen findet, kann fliegen.
  6. Beim Hinausgehen am Eingang ein blauer Fotoring: Foto vom Lama vor dem Teleskop.
  7. Hat Joshi durchs Teleskop geschaut, daneben ein roter Skizzenring: Skizze vom Observatorium in der Oase mit dem Nachthimmel (Sternbilder) und dem Mond.
  8. Draußen liegt ein Holzscheit (schon von Anfang an, ohne Kreis); jetzt mit grünem Messerring: Joshi schnitzt einen Schlüssel („Wooden Key“ von Sam), damit lässt sich der X-Wing aufschließen – dann kann er zum Mond fliegen.
  - Das Teleskop selbst ist freiwillig (gebaut 23.10.2026, `teleskop.js`): Nachthimmel mit Sonne, Mond, Planeten, Pluto, Milchstraße und den vier Sternbildern; Steuerkreuz springt von Objekt zu Objekt (die Stimme sagt den Namen), A = groß mit Fakten, B = hinaus (auch mitten in der Erklärung). Test: `index.html?etappe=4&teleskop`.
- **Im Observatorium** (Innenraum = eigene Welt):
  1. Joshi sieht das **Lama an seinem Paket**. Spricht Joshi es an (Y), sagt das Lama genervt, dass es die **Schnur nicht aufbekommt** – **mit Hufen geht kein Knoten auf**.
  2. **Taschenmesser:** Joshi schneidet die Schnur auf. Das Lama sagt danke.
  3. **X (umschauen) →** auf dem Boden der **braune Lupenring** mit einem **Fußabdruck**. Unter der Lupe: die **Spur des Lamas**.
  4. **B → Vergleichen:** Links erscheint ein **halbes Notizbuch** mit der **Spur des Eichhörnchens** (vom Tisch), rechts die **Lupe mit der frischen Spur**. Blättert Joshi nach links oder rechts, kommt im Notizbuch die **Spur des Lamas**. Die beiden Spuren **legen sich übereinander**, passen perfekt, und ein **grüner Rahmen leuchtet kurz auf**.
  5. **Jetzt kann Joshi das Lama noch einmal ansprechen** und es mit der **Spur** und dem **roten Fell** konfrontieren.
  6. **Das Lama:** Das Fell ist nicht seins – sieht man doch. Es war nur am Tisch, weil die **Post sein Paket aus Versehen auf die Insel geliefert** hat. Und weil der Tisch eh schon so verwüstet war, ist es einfach drübergestakst – wie sollte er sonst an sein Paket kommen?
- *(weiter offen)*

### Offen
- **Wie geht es nach dem Lama weiter** – wie kommt Joshi zum Eichhörnchen, und warum hat es das Essen genommen?
- **Auflösung, Weihnachtsessen am Ende, Trophäe.**
- **Modelle:** siehe **Modelle für Fall 1** unten; dazu Paket mit Schnur, Holzentchen (heil und zerbrochen), Bananenkorb, Weihnachtsbaum und -schmuck, Nadelbäume, Observatorium (gefunden: „Welcome to the Observatory“), Palmen (Oase). Vorhanden: X-Wing (Engine), Eichhörnchen (`squirrel_animation_by_blam`), Mustang (Engine), Lagerfeuer. Gebaut (aus Grundformen): Festtisch, Nadelbäume, Weihnachtsbaum und -schmuck.
- **Aus *Trip to Japan* übernehmbar** (gleiche Engine): Wüste mit Oase (dortige Etappe 2), Absprung, freier Fall und Fallschirm (Finale).

### Modelle für Fall 1
Geprüft am 20.10.2026 (Animationen, Größe, Aussehen gerendert). Alle liegen in `3d Modelle\Spiele`.

| Rolle | Modell | Animationen (Auswahl) | Hinweis |
|---|---|---|---|
| **Gorilla** (statt Bär, wohnt in der Höhle) | `gorilla_-_animated_low_poly_by_WildPoly3D` | `sit` (zusammengesunken, traurig), `sleep` (eingerollt), `Look`, **`ChestDrum`** (vor Freude auf die Brust trommeln), `eat`, `walk`, `climb` | passt sehr gut; grau mit hellem Bauch |
| ~~**Hamster**~~ (raus seit 26.10.2026, Modell technisch nicht schön) | `hamster_by_josephineburns` | `Hamster_run_loop`, `Hamster_Stand_Snify_anim` (schnüffeln, fürs Nagen), 2× Stehenbleiben – je ~1 s | **ganz weiß, ohne Material** – selbst färben (Rücken braun, Bauch/Backen creme, Ohren/Pfoten rosa; UV vorhanden). Sehr schlichte Form (verformter Würfel): erst im Observatorium testen, sonst Ersatz suchen |
| **Lama** (statt des Hamsters, 26.10.2026) | `llama_-_animated_low_poly_by_WildPoly3D` | `idle`, `lookaround`, `eat` (Kopf bis zum Boden – geht durch den Tisch, nicht benutzt), `sit`, `sleep`, `walk`, `trot`, `run`, `jump` | creme, lieb, 1.376 Dreiecke; im Spiel 1,7 m hoch (schaut über das Paket) |
| **Eichhörnchen** (Täter, rotes Fell) | `squirrel_-_animated_low_poly_by_WildPoly3D` oder das ältere `squirrel_animation_by_blam` | `Idle`, `lookaround`, `run`, `sleep`, `snow` | das WildPoly-Eichhörnchen ist **weiß-creme** → für das rote Fell **rot umfärben** |
| **Tiere am Festtisch** (Auswahl) | Hase, Hasenbaby, Eule, Elch, Ente, Reh (Gazelle), zwei kleine Vögel (`bird_3` blau-gelb, `bird_4` Meise), Waschbär | Hase: fressen, putzen, umschauen · Eule: Kopf drehen · Elch: sitzen · Ente: 15 Clips | passen in den Nadelwald |
| **nicht verwenden** | Tiger (leere Augen), Balu (`u_baloo`) und Simba (Disney-Figuren – das Spiel ist öffentlich) | | |

- **Stil:** Die WildPoly3D-Tiere sind einfarbiges Low-Poly ohne Texturen (Farbe am Material) – einheitlich und lieb; Umfärben ist leicht.
- **Lizenzen:** WildPoly3D und Giraffe CC-BY-NC-4.0 · Natural History Museum of Los Angeles County CC-BY-NC-SA-4.0 · das Lama ist ebenfalls von WildPoly3D. Beim Einbauen in die Quellenliste.
- **Noch zu besorgen/bauen:** Holzentchen (heil und zerbrochen), Bananenkorb und Bananenschale, Paket mit Schnur. *(Observatorium: „Welcome to the Observatory“ von XelaDoesArt, eingebaut 23.10.2026.)* *(Festtisch, Nadelbäume, Weihnachtsbaum und -schmuck: gebaut am 21.10.2026 in `waldinsel.js`.)*

## 🎓 8. Lerneffekte

- **Genau hinschauen & Beweise prüfen:** nicht raten, sondern die Spur mit allen Verdächtigen vergleichen.
- **Werkzeuge sinnvoll einsetzen:** Welches Werkzeug hilft hier?
- **Natur & Wissen:** Tierspuren, Federn, Fell; Sterne, Kompass und Himmelsrichtungen; Umwelt (z. B. Müll trennen).
- **Empathie:** Wer etwas angestellt hat, hatte einen Grund; helfen und verzeihen gehört dazu.

## 🗺️ Nächste Schritte

1. ~~Ausrüstung, Funkspruch, Kamera und Notizbuch~~ – gebaut (16.10.2026).
2. **Fall 1 „Das Weihnachtsessen“ fertig planen** (Abschnitt 7): nach dem Lama: das Eichhörnchen und sein Grund, Auflösung.
3. **Fehlende Tiermodelle** für die gewählten Gruppen über Sketchfab besorgen (Abschnitt 6).
4. **Bausteine bauen:** Spur sichern, Verdächtige mit Helfer-Aufgabe, Pfote abzeichnen, Vergleichen im Notizbuch.
5. ~~**Erste Detektiv-Etappe** nach dem Segeln~~ – begonnen am 21.10.2026: Waldinsel mit Festtisch und Tieren; als Nächstes Foto- und Lupenring, Notizbuch-Hinweise, Waldweg.
6. Später: Werkzeug selbst wählen, Kinderzimmer als Rahmen, weitere Fälle.

## 📚 Quellen

Mixamo (Rigging, Animationen) · „Fox“ von pxltiger (CC-BY-4.0) · „Wooden Fox Kit Figure“ von Yogensia (CC-BY-NC-SA-4.0) · „Ulysses Butterfly“ von eb78 (CC-BY-SA-4.0) · Ausrüstung siehe README · „Stage Campfire“ von daedaljs (CC-BY-4.0) · „Ring-Billed Gull“ von Oregon State University Ecampus (CC-BY-4.0) · Orca, Seelöwe und Robbe (Low Poly, animiert) von WildPoly3D (CC-BY-NC-4.0) · „Low Poly Rainbow Trout“ vom Natural History Museum of Los Angeles County (CC-BY-NC-SA-4.0) · „T-65 X-Wing Starfighter“ von Quiznos323 (CC-BY-NC-SA-4.0) · Hase, Hasenbaby, Eule, Elch, Gazelle (als Reh) und zwei kleine Vögel (Low Poly, animiert) von WildPoly3D (CC-BY-NC-4.0) · Gitarren-Loop von idoberg (Pixabay) · „Wooden Duck Toy“ von Ujjwal Chauhan (Sketchfab) · Gorilla („silverback gorilla roar“) von flutie8211 · Eulenruf („owl“) von freesound_community und Holzknacken („breaking wood“) von Dragon Studio (Pixabay) · „Welcome to the Observatory“ von XelaDoesArt (CC-BY-4.0) · Meeresschildkröte und Schildkröten-Baby (Low Poly, animiert) von WildPoly3D (CC-BY-NC-4.0) · Modelle/Töne der Flugspiel-Engine. Modelle liegen in `3d Modelle\Spiele`, Töne in `Software\Musik`.

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
