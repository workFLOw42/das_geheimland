# Das Geheimland – Alle gesprochenen Sprechtexte

Stand: 14.10.2026 – im Code stehen die Texte der **Interaktionsobjekte** (aktiv) und die **Funk-Durchsage** (`story.js`, `DURCHSAGE` / `NACH_DURCHSAGE`, vorerst ausgeschaltet); der Rest ist Entwurf.

- Gesprochen wird über die Sprachausgabe des Browsers; mit Ton aus laufen dieselben Sätze als Untertitel.
- „…“ macht in der Sprachausgabe eine kurze Pause. `{Name}` wird zur Laufzeit eingesetzt (Name der Figur: **Joshi** – im Code die Konstante `NAME`).
- **Zielgruppe ein fast 6-jähriges Kind:** kurze Sätze, ein Gedanke pro Satz, keine Fremdwörter. Alles Wichtige muss gesprochen werden – lesen kann der Spieler noch nicht.
- Status: **im Code** = so eingebaut · **Entwurf** = Vorschlag, noch nicht im Spiel.

---

## 🎙️ Rollen & Stimmen

| Rolle im Code | Stimme | Wer spricht |
|---|---|---|
| *(keine)* | **weiblich** | Erzählerin |
| `radio` | **männlich**, etwas tiefer | Stimme über Funk (Kurbel-Funkgerät am Lagerfeuer) |

---

## Einstieg: Kinderzimmer *(Entwurf – Kinderzimmer noch nicht gebaut)*

**Stimme:** weiblich (Erzählerin)

Es ist mitten in der Nacht. Alles ist still.

{Name} kann nicht schlafen. Neben dem Bett sitzt sein Fuchs und spitzt die Ohren.

Da! Die Zimmertür leuchtet ganz geheimnisvoll …

Geh zur Tür!

---

## Ankunft am Strand *(Entwurf)*

**Stimme:** weiblich (Erzählerin)

Wow … ein Strand! Es ist Nacht, und der Himmel ist voller Sterne.

Das ist das Geheimland.

---

## Funk-Durchsage am Lagerfeuer *(im Code, ausgeschaltet)*

**Wann:** sobald Joshi das Buch aus dem Regal und Taschenmesser, Kompass und Lupe vom Tisch genommen hat, kommt der Funkspruch herein; Joshi nimmt ihn am Funkgerät mit **Y** an – dann folgt diese Durchsage, und das Abenteuer beginnt.

**Stimme:** `radio` – das Funkgerät wackelt und blinkt, solange es spricht.

*knack* … *rausch* …

Achtung, {Name}! Achtung!

Im Geheimland wurde Chaos angerichtet!

Schnapp dir deine Kamera, folge den Hinweisen und löse das Rätsel!

**Danach – Stimme:** weiblich (Erzählerin)

Das kam über Funk! Das Funkgerät steht am Lagerfeuer.

Dein Fuchs wartet schon am Strand auf dich.

---

## Interaktionsobjekte – Etappe 1 (Insel) *(im Code)*

**Stimme:** weiblich (Erzählerin). Gesprochen wird, wenn Joshi ein Objekt mit dem Suchblick (X) entdeckt hat, hingeht und **Y** drückt.

| Objekt | Art | Text |
|---|---|---|
| Lagerfeuer | Info – nur einmal | Das Lagerfeuer sorgt für Gemütlichkeit, Wärme und Licht. |
| Hütte | Info – nur einmal | Die Hütte ist dein Zuhause. Geh ruhig rein und schau dich um. |
| Funkgerät | bleibt | Mit dem Funkgerät können dich Andere erreichen, wenn sie deine Hilfe brauchen. – danach bei jedem Y nur ein kurzes **Funkrauschen** (3 s, sanft ausgeblendet, jedes Mal eine andere Stelle) |

**Info – nur einmal:** nach dem ersten Y (Text gehört) erscheint dort kein Y mehr.

**In der Hütte** *(im Code, noch ohne Text)*: **Bücherregal** und **Tisch** (Taschenmesser, Kompass und Lupe – hier als ein Objekt; später auch einzeln). Texte folgen.

**Segelboot am Steg, bevor das Abenteuer begonnen hat** *(im Code)* – Y im letzten Drittel des Stegs:

> Du hast hier noch nicht alles entdeckt. Bitte schaue dich in Ruhe weiter um.

**Suchblick ohne Neues** *(im Code)* – drückt Joshi X und es gibt in der Nähe nichts (mehr) zu finden:

| Situation | Text |
|---|---|
| schon alles entdeckt | Hier hast Du schon alles entdeckt. |
| hier gibt es gar nichts | Hier scheint es nichts Interessantes zu geben. |

---

## Hinweise auf D-Pad links / Taste T *(im Code)*

**Stimme:** weiblich (Erzählerin) – wie die kleinen Infos in *Trip to Japan*, nur gesprochen. Was sie sagt, hängt davon ab, wie weit Joshi ist:

| Reihenfolge | Wann | Text |
|---|---|---|
| 1 | noch nie umgeschaut (die ersten zwei Male) | Mit X schaust Du dich um. |
| 2 | Satz 1 kam schon zweimal, trotzdem nicht umgeschaut | Stelle dich vor das Lagerfeuer und drücke X zum Umschauen. |
| 3 | draußen schon umgeschaut, in der Hütte noch nicht | Schau dir doch mal deine Hütte von innen ganz genau an. |
| 4 | überall umgeschaut, aber noch nicht alles entdeckt | Mit X schaust Du dich um. |
| – | alles entdeckt | Hier hast Du schon alles entdeckt. *(vorläufig – weitere Hinweise folgen, z. B. zum Buch und zum Funkspruch)* |

---

## Hinweise zur Steuerung *(Entwurf – kurz, einmal beim ersten Mal)*

**Stimme:** weiblich (Erzählerin)

| Situation | Text |
|---|---|
| erstes Mal am Strand | Mit dem Stick läufst du. Drück ihn weit, dann rennst du! |
| nach einer Weile | Drück A, dann springst du! |
| Fuchs sitzt nah | Drück B, dann kniest du dich hin – dein Fuchs kommt zum Spielen. |
| erstes Mal an einem wichtigen Ort | Drück X und schau dich um – vielleicht findet dein Fuchs etwas! |
| Y erscheint | Siehst du das Y? Drück Y! |
| vor der Hütte | Geh durch die Tür in die Hütte! |

---

## Sternbilder *(Entwurf – Wissens-Thema, z. B. wenn man lange in den Himmel schaut)*

**Stimme:** weiblich (Erzählerin) – das jeweilige Sternbild leuchtet dabei kurz heller.

| Sternbild | Text |
|---|---|
| Großer Bär | Siehst du die sieben hellen Sterne? Das ist der Große Wagen. Er gehört zu einem großen Bären aus Sternen! |
| Kleiner Bär | Und da ist der Kleine Bär. Ganz vorn sitzt der Polarstern. Er zeigt immer nach Norden. |
| Kassiopeia | Dieses Sternbild sieht aus wie ein W. Es heißt Kassiopeia. |
| Orion | Da drüben steht der Himmelsjäger Orion. Siehst du die drei Sterne in einer Reihe? Das ist sein Gürtel. |

---

## Spurensicherung *(Entwurf – kommt mit der Polaroid-Kamera)*

**Stimme:** weiblich (Erzählerin)

| Situation | Text |
|---|---|
| Spur entdeckt | Schau mal! Da ist eine Spur. Mach ein Foto davon! |
| Foto gemacht | Klick! Das Foto kommt in dein Ermittlungsbuch. |
| Fuchs bestätigt (nickt) | Dein Fuchs nickt. Da bist du auf der richtigen Spur! |
| Fuchs schüttelt den Kopf | Hm … dein Fuchs schüttelt den Kopf. Such lieber noch woanders. |

---

## Offene Texte

- ~~**Name der Figur**~~ – entschieden: **Joshi** (14.10.2026).
- **Buch aus dem Bücherregal** – welches Buch und was die Erzählerin dazu sagt, kommt noch.
- **Taschenmesser, Kompass, Lupe** – Texte beim Nehmen (am Tisch).
- **Funkspruch kommt herein** – Hinweis, dass sich das Funkgerät meldet (z. B. „Hörst du das? Das Funkgerät!“).
- **Einsatzorte** (Müllwagen, Löschboot, Mondrover) und **Rätsel-Kette** – folgen mit den Orten.
- **Finale am Fotobrett** und **Auflösung** – folgen, wenn der Täter feststeht (siehe Konzept.md).
- **Erwachen im Kinderzimmer** und **Trophäen** – folgen.
