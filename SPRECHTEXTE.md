# Das Geheimland – Alle gesprochenen Sprechtexte

Stand: 16.10.2026 – alles mit **im Code** ist so im Spiel; **Entwurf** = Vorschlag, noch nicht im Spiel; **Platzhalter** = steht im Code, wird ersetzt, sobald der echte Text da ist.

- Gesprochen wird über die Sprachausgabe des Browsers. **Keine Untertitel** (der Spieler kann noch nicht lesen), der Ton ist immer an. „Joshi“ wird als **„Joschi“** ausgesprochen (geschrieben bleibt Joshi).
- „…“ macht in der Sprachausgabe eine kurze Pause. `{Name}` wird zur Laufzeit eingesetzt (Name der Figur: **Joshi** – im Code die Konstante `NAME`).
- **Zielgruppe ein fast 6-jähriges Kind:** kurze Sätze, ein Gedanke pro Satz, keine Fremdwörter. Alles Wichtige muss gesprochen werden – lesen kann der Spieler noch nicht.
- **Pause** (D-Pad ↑) und **Inventar** (D-Pad ↓) halten jede Ansage an genau der Stelle an; danach spricht sie weiter.
- Während eine Erklärung läuft, ist das **Y** über dem Objekt ausgeblendet; es kommt danach wieder.

---

## 🎙️ Rollen & Stimmen

| Rolle im Code | Stimme | Wer spricht | Funkrauschen |
|---|---|---|---|
| *(keine)* | **weiblich** | Erzählerin | – |
| `funkRahmen` | **weiblich** | Erzählerin, am Funkgerät | 1 s davor und danach |
| `radio` | **männlich** (Chrome: Microsoft Stefan) | Stimme über Funk | 1 s davor und danach |

Kommt ein Funkspruch (`radio`), erscheint unten rechts (dort, wo sonst der Rucksack steht) das **Funkgerät** und wackelt und blinkt wie das echte am Lagerfeuer. Im Funk wird **nie „over“** gesagt.

---

## Etappe 1 – Die Insel

### Interaktionsobjekte *(im Code)*

**Stimme:** Erzählerin. Gesprochen wird, wenn Joshi ein Objekt mit dem Suchblick (X) entdeckt hat, hingeht und **Y** drückt.

| Objekt | Art | Text |
|---|---|---|
| Lagerfeuer | Info – nur einmal | Das Lagerfeuer sorgt für Gemütlichkeit, Wärme und Licht. |
| Hütte | Info – nur einmal | Die Hütte ist dein Zuhause. Geh ruhig rein und schau dich um. |
| Funkgerät | bleibt (Rolle `funkRahmen`) | Mit dem Funkgerät können dich Andere erreichen, wenn sie deine Hilfe brauchen. – danach bei jedem Y nur ein kurzes **Funkrauschen** (3 s, sanft ausgeblendet, jedes Mal eine andere Stelle) |

**Info – nur einmal:** nach dem ersten Y (Text gehört) erscheint dort kein Y mehr.

### Suchblick ohne Neues *(im Code)*

Drückt Joshi X und es gibt in der Nähe nichts (mehr) zu finden:

| Situation | Text |
|---|---|
| schon alles entdeckt | Hier hast Du schon alles entdeckt. |
| hier gibt es gar nichts | Hier scheint es nichts Interessantes zu geben. |

### In der Hütte: die Ausrüstung *(im Code)*

Mit **Y** kommt das Ding aus dem Regal bzw. vom Tisch, wird groß, dreht sich einmal und wandert klein unten rechts in den Rucksack. Am Tisch nacheinander, je mit eigenem Satz.

| Objekt | Text | Status |
|---|---|---|
| Bücherregal – Notizbuch | Ah... ein Notizbuch. Das kann man immer gebrauchen. | im Code (vom Nutzer) |
| Tisch – Lupe | Eine Lupe! Damit siehst du auch die kleinsten Spuren. | im Code, *Entwurf* |
| Tisch – Kompass | Ein Kompass. Mit ihm findest du immer den Weg. | im Code, *Entwurf* |
| Tisch – Taschenmesser | Dein Taschenmesser. Das ist praktisch für unterwegs. | im Code, *Entwurf* |
| Tisch – Stift | Und ein Stift. Damit kannst du alles aufschreiben. | im Code, *Entwurf* |
| Tisch – Kamera | Und deine Kamera! Damit machst du Fotos von allen Hinweisen. | im Code, *Entwurf* |
| alles im Rucksack | Klasse. Du hast alles dabei, was man als Detektiv braucht. | im Code (vom Nutzer) |

### Funkspruch für den ersten Fall *(im Code)*

Kommt direkt nach „Klasse. Du hast alles dabei …“. **Stimme:** `radio` (männlich), je 1 s Funkrauschen davor und danach; das Funkgerät am Lagerfeuer rauscht, wackelt und blinkt, und unten rechts erscheint das Funkgerät.

| Wann | Text | Status |
|---|---|---|
| erster Ruf | Hallo {Name}, bist du da? | im Code |
| danach alle 15 s, bis Joshi am Funkgerät Y drückt | {Name}, bitte kommen. | im Code |
| Y am Funkgerät | Wir haben ein großes Problem und brauchen bitte deine Hilfe. | **Platzhalter** – die Erklärung des Problems kommt noch |

Danach ist das **Segelboot** frei.

### Segelboot *(im Code)*

| Situation | Stimme | Text |
|---|---|---|
| Y am Steg, bevor das Abenteuer begonnen hat | Erzählerin | Du hast hier noch nicht alles entdeckt. Bitte schaue dich in Ruhe weiter um. |
| Y im Boot, weit weg vom Steg | Erzählerin | Fahr erst zurück zum Steg. Dann kannst du aussteigen. |
| am Ziel (die Blende zum Globus kommt sofort, der Satz im Globus) | Erzählerin | Du bist angekommen! – **Platzhalter** |

### Fotos und Skizzen fürs Notizbuch *(im Code)*

Nach dem Funkspruch: ein **blauer Kreis** (Foto) und ein **roter Kreis** (Skizze) am Boden; auf dem Kreis erscheint ein Y. Mit Y kommt die Kamera bzw. der Stift aus dem Rucksack, das Bild erscheint (Sucher mit Klick und Blitz bzw. Bleistift, der die Skizze kritzelt, Signatur „J“ unten rechts) und fliegt ins Notizbuch. Jede Stelle geht nur einmal. Später: **grüner Kreis** = Taschenmesser, **brauner Kreis** = Lupe.

| Stelle | Text (Erzählerin) | Status |
|---|---|---|
| Foto der Hütte (blauer Kreis am Strand vor der Hütte) | Klick! Ein schönes Foto von deiner Hütte. Es klebt jetzt in deinem Notizbuch. | im Code, *Entwurf* |
| Skizze vom Steg (roter Kreis am Strand links vom Steg) – Steg, Boot und ein Wal, der darüber springt | Du zeichnest den Steg, dein Segelboot und einen Wal, der darüber springt, in dein Notizbuch. | im Code, *Entwurf* |

**Inventar:** linker Stick wählt aus (die Auswahl wird etwas größer und leuchtet leicht), **A** = auswählen: das **Notizbuch** schlägt sich auf der zuletzt beklebten Seite auf (blättern mit links/rechts, **B** = zu, zurück ins Inventar), bei allen anderen Dingen kommt ihre Erklärung (wie beim Einpacken). **B** im Inventar = Inventar zu.

### Hinweise auf D-Pad links / Taste T *(im Code)*

**Stimme:** Erzählerin – wie die kleinen Infos in *Trip to Japan*, nur gesprochen. Was sie sagt, hängt davon ab, wo Joshi ist und wie weit er ist (von oben nach unten: das Erste, was passt).

| Wann | Text |
|---|---|
| im Segelboot (mit Ziel) | Steuere das Boot einfach auf den roten Punkt des Radars zu. |
| das Funkgerät ruft | Schau doch mal zum Funkgerät. Jemand möchte mit dir sprechen und braucht vielleicht deine Hilfe. |
| noch nie umgeschaut (die ersten zwei Male) | Mit X kannst Du dich ganz genau umschauen und alles Wichtige entdecken. Probier es gleich mal am Lagerfeuer aus. |
| Satz oben kam schon zweimal, trotzdem nicht umgeschaut | Stelle dich vor das Lagerfeuer und drücke X zum Umschauen. |
| draußen schon umgeschaut, in der Hütte noch nicht | Schau dir doch mal deine Hütte von innen ganz genau an. |
| überall umgeschaut, aber noch nicht alles entdeckt | (wie „noch nie umgeschaut“) |
| alles entdeckt | Hier hast Du schon alles entdeckt. |

---

## Zwischen den Etappen: der Globus *(im Code)*

Schwarzblende → die Welt des Geheimlands (eigene Kugel mit Meer und Inseln, keine Erde) → ein roter Faden wächst von Joshis Insel (Haus) zum nächsten Ort (vorerst ein Punkt), an der Spitze Joshis Gesicht → Schwarzblende → Neustart der Etappe.

Gesprochen wird dabei nur der Satz vom Ziel (siehe Segelboot). Die Ortsnamen unten im Bild (**Joshis Insel**, **Fall 1**) sind Platzhalter.

---

## Funk-Durchsage *(im Code, ausgeschaltet – ersetzt durch den Funkspruch für den ersten Fall)*

Die erste Fassung (`story.js`, `DURCHSAGE` / `NACH_DURCHSAGE`) bleibt stehen, wird aber nicht abgespielt.

**Stimme:** `radio`

*knack* … *rausch* …

Achtung, {Name}! Achtung!

Im Geheimland wurde Chaos angerichtet!

Schnapp dir deine Kamera, folge den Hinweisen und löse das Rätsel!

**Danach – Stimme:** Erzählerin

Das kam über Funk! Das Funkgerät steht am Lagerfeuer.

Dein Fuchs wartet schon am Strand auf dich.

---

## Einstieg: Kinderzimmer *(Entwurf – Kinderzimmer noch nicht gebaut)*

**Stimme:** Erzählerin

Es ist mitten in der Nacht. Alles ist still.

{Name} kann nicht schlafen. Neben dem Bett sitzt sein Fuchs und spitzt die Ohren.

Da! Die Zimmertür leuchtet ganz geheimnisvoll …

Geh zur Tür!

---

## Ankunft am Strand *(Entwurf)*

**Stimme:** Erzählerin

Wow … ein Strand! Es ist Nacht, und der Himmel ist voller Sterne.

Das ist das Geheimland.

---

## Hinweise zur Steuerung *(Entwurf – kurz, einmal beim ersten Mal)*

**Stimme:** Erzählerin

| Situation | Text |
|---|---|
| erstes Mal am Strand | Mit dem Stick läufst du. Drück ihn weit, dann rennst du! |
| nach einer Weile | Drück A, dann springst du! |
| Fuchs sitzt nah | Drück B, dann kniest du dich hin – dein Fuchs kommt zum Spielen. |
| erstes Mal an einem wichtigen Ort | Drück X und schau dich um – vielleicht findet dein Fuchs etwas! |
| Y erscheint | Siehst du das Y? Drück Y! |
| vor der Hütte | Geh durch die Tür in die Hütte! |
| erstes Mal im Segelboot | Mit dem rechten Stick gibst du Gas. Mit dem linken lenkst du. |
| erstes Mal Inventar | In deinem Rucksack siehst du alles, was du dabei hast. Drück noch mal nach unten, dann geht es weiter. |

---

## Sternbilder *(Entwurf – Wissens-Thema, z. B. wenn man lange in den Himmel schaut)*

**Stimme:** Erzählerin – das jeweilige Sternbild leuchtet dabei kurz heller.

| Sternbild | Text |
|---|---|
| Großer Bär | Siehst du die sieben hellen Sterne? Das ist der Große Wagen. Er gehört zu einem großen Bären aus Sternen! |
| Kleiner Bär | Und da ist der Kleine Bär. Ganz vorn sitzt der Polarstern. Er zeigt immer nach Norden. |
| Kassiopeia | Dieses Sternbild sieht aus wie ein W. Es heißt Kassiopeia. |
| Orion | Da drüben steht der Himmelsjäger Orion. Siehst du die drei Sterne in einer Reihe? Das ist sein Gürtel. |

---

## Spurensicherung *(Entwurf – kommt mit der Kamera)*

**Stimme:** Erzählerin

| Situation | Text |
|---|---|
| Spur entdeckt | Schau mal! Da ist eine Spur. Mach ein Foto davon! |
| Foto gemacht | Klick! Das Foto kommt in dein Notizbuch. |
| Fuchs bestätigt (nickt) | Dein Fuchs nickt. Da bist du auf der richtigen Spur! |
| Fuchs schüttelt den Kopf | Hm … dein Fuchs schüttelt den Kopf. Such lieber noch woanders. |

---

## Offene Texte

- ~~**Name der Figur**~~ – entschieden: **Joshi** (14.10.2026).
- ~~**Buch aus dem Bücherregal**~~ – Notizbuch, Satz vom Nutzer (16.10.2026).
- ~~**Taschenmesser, Kompass, Lupe**~~ – Sätze stehen als *Entwurf* im Code (dazu Stift und Kamera) – bitte bestätigen oder ändern.
- ~~**Funkspruch kommt herein**~~ – „Hallo Joshi, bist du da?“ / „Joshi, bitte kommen.“ (vom Nutzer, 16.10.2026).
- **Fall 1 – das Problem:** was die Funkstimme nach dem Annehmen erklärt (jetzt Platzhalter „Wir haben ein großes Problem …“).
- **Fall 1 – am Ziel:** was dort passiert und gesagt wird (jetzt Platzhalter „Du bist angekommen!“).
- **Orte auf dem Globus:** Name und Symbol des zweiten Orts (jetzt „Fall 1“ mit Standardpunkt).
- **Einsatzorte** (Müllwagen, Löschboot, Mondrover) und **Rätsel-Kette** – folgen mit den Orten.
- **Finale am Fotobrett** und **Auflösung** – folgen, wenn der Täter feststeht (siehe Konzept.md).
- **Erwachen im Kinderzimmer** und **Trophäen** – folgen.
