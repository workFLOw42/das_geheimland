# Das Geheimland – Alle gesprochenen Sprechtexte

Stand: 21.10.2026 – alles mit **im Code** ist so im Spiel; **Entwurf** = Vorschlag, noch nicht im Spiel; **Platzhalter** = steht im Code, wird ersetzt, sobald der echte Text da ist.

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
| `tierM` | männlich, tief | Elch, Eule (Waldinsel) | – |
| `tierW` | weiblich, etwas höher | Hase, Reh | – |
| `tierK` | weiblich, hoch und etwas schneller | Hasenbaby, Meise, blauer Vogel | – |

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
| alles entdeckt, aber noch nicht an allem Y gedrückt – der Fuchs läuft die offenen Dinge nochmal ab | Klasse, Du hast alles entdeckt. Gehe zu jedem Objekt und schau, ob du was tun kannst. |
| schon alles entdeckt und alles erledigt | Hier hast Du schon alles entdeckt. |
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
| Y am Funkgerät | Hallo {Name}... Bitte hilf' uns. Wir haben ein großes Problem. Bitte steig schnell in dein Segelboot und komme zu uns. Ich markiere unseren Standort auf deinem Radar. | im Code (vom Nutzer, 16.10.) |

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
| Foto der Hütte (blauer Kreis am Strand vor der Hütte) | Klasse. Du hast ein gutes Auge fürs Fotografieren. | im Code |
| Skizze vom Steg (roter Kreis am Strand links vom Steg) – Steg, Boot und ein Wal, der darüber springt | Wow. Du hast ein schönes Bild gezeichnet. | im Code |

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
| alles entdeckt, aber noch nicht an allem Y gedrückt (die Detektivmütze erscheint dort auch) | Klasse, Du hast alles entdeckt. Gehe zu jedem Objekt und schau, ob du was tun kannst. |
| alles entdeckt und erledigt | Hier hast Du schon alles entdeckt. |

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

## Etappe 2 – Die Waldinsel, am Festtisch *(im Code, alles **Entwurf** – bitte prüfen)*

Fall 1 „Das Weihnachtsessen“. Nach dem Globus steht Joshi gleich auf der Waldinsel (kein Neuladen), das Segelboot liegt am Steg. Es ist Tag, ein verschneiter Nadelwald; auf der Lichtung stehen Festtisch, Lagerfeuer (ohne Y) und Weihnachtsbaum. Die Tiere sitzen am Tisch und sind traurig. Erst **X** (alle Tiere leuchten auf einmal), dann **Y beim Elch** und **ein Y für alle anderen** – die erzählen dann schnell nacheinander, jedes in seiner Stimme.

| Wann / wer | Stimme | Text |
|---|---|---|
| Ankunft (nach dem Aussteigen) | Erzählerin | Du bist auf der Waldinsel angekommen. |
| Hinweis-Taste, bevor alle Tiere erzählt haben | Erzählerin | Schau mal, da vorne am Tisch sitzen die Tiere. · Sie sehen ganz traurig aus. Geh doch mal hin und hör dir an, was passiert ist. |
| Elch (Kopfende) | `tierM` | Oh, hallo Joshi. Schön, dass du da bist. · Wir wollten heute ein großes Weihnachtsessen feiern. Alle zusammen, hier am Tisch. · Aber als wir kamen, war alles weg. Das ganze Essen! |
| Hase | `tierW` | Ich hatte so viele Möhren mitgebracht. Und jetzt ist keine einzige mehr da. |
| Hasenbaby | `tierK` | Ich hab so großen Hunger. |
| Reh | `tierW` | Wer macht denn so etwas? Der ganze Tisch ist durcheinander. |
| Eule | `tierM` | Hu-huu. Ich habe die ganze Nacht aufgepasst. Aber gesehen habe ich niemanden. |
| Meise | `tierK` | Piep, piep! Kannst du uns helfen? Du bist doch ein Detektiv. |
| blauer Vogel | `tierK` | Piep! Nicht mal ein Krümel ist übrig geblieben. |
| Weihnachtsbaum | Erzählerin | Ein wunderschön geschmückter Weihnachtsbaum. |
| Hinweis-Taste (D-Pad ←) | Erzählerin | Geh doch mal zum Tisch. Dort sitzen die Tiere. Mit X kannst du sie entdecken. |
| alle Tiere gehört | – | *(keine Ansage: die beiden Ringe erscheinen, der Fuchs zeigt sie)* |
| Hinweis-Taste, solange ein Ring noch offen ist | Erzählerin | Hm... Wer das Essen genommen hat, hat vielleicht eine Spur hinterlassen. · Schau dich am Tisch doch noch einmal ganz genau um. |
| Hinweis-Taste, Ring noch nicht da | Erzählerin | Schau dich am Tisch noch einmal ganz genau um. Drück dafür X. |
| Hinweis-Taste, Ring zu sehen (der Fuchs zeigt den blauen Ring) | Erzählerin | Stell dich in den blauen Kreis vor dem Tisch und drück Y. Dann machst du ein Foto. |
| Foto vom Tisch (blauer Ring) | Erzählerin | Klasse. Jetzt hast du den Tisch auf deinem Foto. |
| nach dem Foto – Joshi fragt | `joshi` | Da sind ja Spuren auf dem Tisch! Wem gehören die denn? |
| … der Hase | `tierW` | Meine sind das nicht. Meine Pfoten sehen ganz anders aus. |
| … die Eule | `tierM` | Und ich habe Krallen, keine Pfoten. Hu-huu. |
| … der Elch | `tierM` | Solche Spuren habe ich hier im Wald noch nie gesehen. |
| … die Erzählerin | Erzählerin | Merk dir die Spuren gut. Vielleicht findest du später heraus, wem sie gehören. |
| … falls die Lupe noch offen ist (der Fuchs läuft von selbst zum braunen Ring und zeigt ihn) | Erzählerin | Schau mal, dein Fuchs hat noch etwas gefunden. |
| Hinweis-Taste, nur noch die Lupe offen (der Fuchs zeigt den braunen Ring) | Erzählerin | Am Weg in den Wald ist ein brauner Kreis. Stell dich hinein und drück Y. Dann schaust du ganz genau hin. |
| Lupe am Waldweg (brauner Ring) | Erzählerin | Schau mal! Ein Stück Bananenschale. Und viele kleine Ameisen krabbeln darüber. |
| nach der Lupe – Joshi fragt | `joshi` (helle Kinderstimme) | Von wem die Bananenschale wohl ist? |
| … die Eule | `tierM` | Hu-huu! Bestimmt vom Gorilla. Der mag doch so gerne Bananen. · Und überhaupt ist er in letzter Zeit so schlecht gelaunt. |
| … der Elch | `tierM` | Der Gorilla wohnt in einer Höhle am Ende von diesem Weg. Auf der anderen Seite des Waldes. |
| … die Erzählerin (Foto schon gemacht) | Erzählerin | Vielleicht weiß der Gorilla etwas. Folge doch dem Weg in den Wald. |
| … die Erzählerin (Foto fehlt noch) | Erzählerin | Vorher machst du aber noch ein Foto vom Tisch. Stell dich in den blauen Kreis. |
| Hinweis-Taste danach | Erzählerin | Folge dem Weg in den Wald. Dort wohnt der Gorilla. |
| zu früh im Wald | Erzählerin | Hier geht ein Weg in den Wald. Schau dich vorher noch genau auf der Lichtung um. |
| nach dem Globus (Ende des bisher Gebauten) | Erzählerin | Joshi ist auf dem Weg zum Gorilla. Wie es weitergeht, erfährst du bald. |

**Tatortfoto:** Erst wenn alle Tiere erzählt haben **und** Joshi sich danach noch einmal mit X umschaut, zeigt der Fuchs den blauen Ring vor dem Tisch. Das Foto zeigt den Tisch senkrecht von oben in voller Länge – ohne Tiere und Fuchs, nur die Reste und zwei Fußspuren: links Hufe mit zwei länglichen Zehen im Wechselschritt (Lama), rechts lange Zehen in Sprüngen (Eichhörnchen). Wem sie gehören, sagt noch niemand.

**Lupe am Waldweg:** Der braune Ring liegt am Eingang des Waldwegs (Wegweiser) und erscheint mit demselben X wie der Fotoring. Unter der Lupe: die Bananenschale von oben, Ameisen krabbeln in einer Reihe darüber; als Skizze ins Notizbuch.

**Ende von Etappe 2:** Nach dem Foto fragt Joshi nach den Spuren – keiner am Tisch war es, verraten wird nichts. Der Gorilla wird erst nach der Lupe erwähnt (Joshi fragt, Eule und Elch antworten). Der Weg ist frei, wenn beide Gespräche vorbei sind (Reihenfolge egal). Ist auch das Foto gemacht, ist der Weg frei (nach dem Foto läuft der Fuchs noch einmal zum braunen Ring, falls der offen ist). Geht Joshi in den Waldweg hinein, kommt der Globus („Die Höhle des Gorillas“) und danach ein schwarzes Bild „Fortsetzung folgt …“ – Etappe 3 ist noch nicht gebaut.

*Noch nicht im Spiel:* Hinweise im Notizbuch (die zwei Spuren werden groß abgezeichnet, „Das ist ja eine Bananenschale“).

---

## Etappe 3 – Vor der Höhle des Gorillas *(im Code, alles **Entwurf**)*

| Wann / wer | Stimme | Text |
|---|---|---|
| Ankunft (nach dem Globus) | Erzählerin | Du bist auf der anderen Seite des Waldes. Dort vorn in der Höhle wohnt der Gorilla. · Du kannst ihn schon hören. |
| Hinweis-Taste | Erzählerin | Geh doch mal zur Höhle im Berg. Dort wohnt der Gorilla. |

Aus der Höhle kommt ab und zu ein trauriges Brummen (Ton, keine Stimme) – nur bis Joshi einmal drin war. Die Mustang hat vor dem Gorilla kein Y.

### In der Höhle *(im Code, alles **Entwurf**)*

| Wann / wer | Stimme | Text |
|---|---|---|
| hinein | Erzählerin | Hier ist es ganz schön dunkel. Und da sitzt der Gorilla am Feuer. |
| Y beim Gorilla (nach X ist nur er da) | `tierM` | Lass mich bitte in Ruhe. *(danach erscheint der braune Lupenring, der Fuchs zeigt ihn; das sagt er bei jedem Y bis zur Lupe)* |
| Y beim Gorilla nach seiner Geschichte, vor dem Schnitzen | `tierM` | Ich bin soooo traurig ohne mein Entchen. |
| Y am Schnitzring zu früh | Erzählerin | Vielleicht siehst du dir vorher noch etwas anderes ganz genau an. |
| Lupe | Erzählerin | Oh, ein Holzentchen. Es ist zerbrochen. |
| Y beim Gorilla – Joshi | `joshi` | Ist dein Entchen zerbrochen? |
| … Gorilla | `tierM` | Ja... Das war mein liebstes Spielzeug. Seitdem bin ich ganz dolle traurig. · Nichts kann mich trösten. Nicht mal die vielen Bananen. |
| (danach erscheint der grüne Schnitzring, der Fuchs zeigt ihn – ohne Ansage) | | |
| Hinweis-Taste dann | Erzählerin | Am grünen Kreis liegt ein Stück Holz. Schnitz ihm ein neues Entchen. |
| Schnitzen | Erzählerin | Toll! Ein neues Holzentchen. *(das kaputte Entchen ist danach weg)* |
| Y beim Gorilla – Joshi | `joshi` | Schau mal, ich habe dir ein neues Entchen geschnitzt. |
| … Gorilla (trommelt vor Freude) | `tierM` | Für mich? Oh, danke! Das ist ja wunderschön! · Es tut mir leid, dass ich die Bananen genommen habe. Ich wollte eigentlich nur die anderen Tiere besuchen, aber der Uhu hat geschlafen und alle anderen Tiere waren nicht da. Der Tisch war verwüstet und nur noch die Bananen standen rum. Deshalb hab ich sie einfach mitgenommen. Bitte nimm sie wieder mit. |
| (er schiebt den Korb hin, daran der braune Lupenring – der Fuchs zeigt ihn) · Hinweis-Taste | Erzählerin | Am Korb ist ein brauner Kreis. Schau dort ganz genau hin. |
| Y beim Gorilla, nachdem er den Korb hingeschoben hat | `tierM` | Danke, ich bin so glücklich. |
| Lupe am Korb | Erzählerin | Schau mal, am Korb klebt rotes Fell. Das kommt in dein Notizbuch. *(der Bananenkorb ist danach im Inventar)* |
| Inventar: Bananenkorb (A) | Erzählerin | Das sind die Bananen, die der Gorilla vom Tisch genommen hat. |

### Zurück an der Lichtung (freiwillig, mit dem Bananenkorb im Inventar)

Nach der Höhle führt der Waldweg mit einer Schwarzblende zurück zur Lichtung (und wieder zur Höhle). Der Wald ist dann hell: Vogelgezwitscher (oliviaaydin, Pixabay), kein Uhu, kein Knacken, kein Nebel. Über dem Tisch ein Y, solange der Korb im Inventar ist; danach steht er auf dem Tisch.

| Wann | Stimme | Text |
|---|---|---|
| Y bei den Tieren | Joshi | Ich weiß jetzt, wer die Bananen genommen hat. Es war der Gorilla. · Er war ganz doll traurig, weil sein Holzentchen kaputt war. Und niemand war da, mit dem er reden konnte. · Er lässt sich bei euch entschuldigen. Hier sind eure Bananen. |
| … Hase | `tierW` | Oh nein, der arme Gorilla! Das wussten wir ja gar nicht. |
| … Eule | `tierM` | Hu-huu. Wir hätten mal nach ihm sehen sollen. |
| … Elch | `tierM` | Wie schön, dass die Bananen wieder da sind! |
| … Hase | `tierW` | Wir gehen ihn gleich mal besuchen. |
| … Joshi | `joshi` | Weißt du, von wem das rote Fell ist? |
| … Gorilla | `tierM` | Nein, das weiß ich nicht. Aber frag doch mal das Lama. Das weiß immer alles und kennt jeden. · Und weil du so lieb zu mir warst, leihe ich dir mein Flugzeug. Damit kommst du schnell zu ihm. |
| (danach erscheint der blaue Fotoring, der Fuchs zeigt ihn – ohne Ansage) | | |
| Foto | Erzählerin | Klasse! Der Gorilla lacht wieder. *(„Geh hinaus zum Flugzeug …“ nur über die Hilfe-Taste)* |
| Y beim Gorilla danach | `tierM` | Danke, Joshi! Viel Glück beim Lama. |
| Hinweis-Taste | Erzählerin | je nach Stand: X drücken · „Geh doch mal zum Gorilla.“ · brauner Kreis · mit dem Gorilla sprechen · schnitzen · Lupe am Korb · Foto · zum Flugzeug |

### Abflug

| Wann | Stimme | Text |
|---|---|---|
| wieder draußen | – | *(keine Ansage: der Waldweg ist einfach hell und ohne Nebel; über der Mustang ein Y)* |
| einsteigen | Erzählerin | Steig ein. Mit dem rechten Stick gibst du Gas, mit dem linken lenkst du. |
| in der Luft | Erzählerin | Super, du fliegst! Flieg zum roten Punkt auf dem Radar. |
| nach einem Absturz | Erzählerin | Hoppla! Versuch es gleich noch einmal. |
| nach dem Globus | – | *(weiter in Etappe 4: Joshi fliegt allein auf die Wüste zu)* |

## Etappe 4 – Die Wüste mit der Oase des Lamas *(im Code, alles **Entwurf**)*

| Wann | Stimme | Text |
|---|---|---|
| nach dem Globus, das Flugzeug kreist über der Oase (über ihm ein rotes B) | Erzählerin | Du bist über dem Ziel angekommen. Du kannst jederzeit abspringen, wenn Du bereit bist. Das Flugzeug fliegt dann automatisch zum Gorilla zurück. |
| noch nicht gesprungen (nach 40 s) | Erzählerin | Drück B, dann springst du ab! |
| gelandet (und nach dem Neuladen) | Erzählerin | Super gelandet! Du bist am Observatorium angekommen. Hier wohnt das Lama. |
| Hinweis-Taste draußen | Erzählerin | Schau doch mal, ob du ins Observatorium kommst. |
| Y am See | Erzählerin | Ein kleiner See mitten in der Wüste. Das Wasser ist ganz klar. |
| Y vor der Tür des Observatoriums | Erzählerin | Die Tür ist offen. Ob jemand zu Hause ist? Geh doch einfach hinein. |
| durch die offene Tür | – | *(Blende, drinnen das Observatorium)* |

### Im Observatorium – beim Lama *(observatorium_innen.js; seit 26.10.2026 das Lama statt des Hamsters)*

| Wann / wer | Stimme | Text |
|---|---|---|
| hineingekommen | Erzählerin | Wow! Was für ein großes Observatorium. Und durch die Kuppel siehst du die Sterne. · Da drüben am Tisch steht ein Lama. |
| Hinweis vor dem Umschauen | Erzählerin | Schau dich im Observatorium genau um. Drück dafür X. |
| Hinweis nach dem Umschauen | Erzählerin | Geh doch mal zum Lama am Tisch. |
| Y beim Lama – Joshi | `joshi` | Hallo Lama! |
| … Lama | `tierW` | Was ist denn? Siehst du nicht, dass ich zu tun habe? · Ich krieg die blöde Schnur von meinem Paket einfach nicht auf. Mit meinen Hufen geht das nicht! |
| Y beim Lama noch einmal | `tierW` | Mit Hufen kann man keine Knoten aufmachen. Die Schnur geht einfach nicht ab. |
| Hinweis Messer | Erzählerin | Am grünen Kreis steht das Paket. Schneid die Schnur mit deinem Taschenmesser auf. |
| Messer-Ring: Seil durchgeschnitten (Skizze ins Notizbuch) | Erzählerin | Schnipp! Die Schnur ist durch. |
| Schnur ab – Lama | `tierW` | Oh! Danke, das ist lieb von dir. Endlich ist mein Paket offen. |
| Y danach | `tierW` | Danke nochmal! Jetzt muss ich aber auspacken. |
| Lupe: Spur im Staub | Erzählerin | Schau mal, Spuren im Staub. Die kommen in dein Notizbuch. · Vergleich sie doch mal mit der Spur vom Tatort. |
| Hinweis-Taste nach der Lupe | Erzählerin | Schau in deinem Rucksack ins Notizbuch. Bei der neuen Spur drückst du A. |
| A auf der Spurseite im Notizbuch | Erzählerin | Schau mal genau hin ... |
| … Spur liegt auf der Eichhörnchenspur (roter Rahmen) | Erzählerin | Diese Spuren stimmen nicht mit denen aus dem Observatorium überein. |
| … Spur liegt auf der Lamaspur (grüner Rahmen) | Erzählerin | Aber diese hier passen ganz genau! Das Lama war also am Festtisch der Tiere. · Frag es doch mal, was es dort gemacht hat. |
| Y beim Lama – Joshi | `joshi` | Lama, deine Spur ist auf dem Festtisch der Tiere! Wie kommt sie dahin? Was hast du dort gemacht? |
| … Lama | `tierW` | Ach das! Die Post hat mein Paket aus Versehen auf die Waldinsel gebracht. · Als ich es abholen wollte, war der Tisch schon ganz verwüstet. Niemand war da, nur der Uhu hat geschlafen. · Da bin ich einfach über den Tisch gestakst. Wie sollte ich denn sonst an mein Paket kommen? |
| Lupe am Packpapier | Erzählerin | Schau mal! Auf dem Packpapier sind auch Spuren – mit langen Zehen. Und wieder rotes Fell! · Dann hat das Lama nicht geflunkert. Die Spuren mit den langen Zehen auf seinem Paket sind von jemand anderem. · Aber wem gehören sie – und das rote Fell? |
| Y beim Lama – Joshi | `joshi` | Weißt du, wem die Spuren mit den langen Zehen und das rote Fell gehören? |
| … Lama | `tierW` | Nein, das weiß ich leider nicht. · Aber auf dem Mond wohnt seit Kurzem jemand. Der hat bestimmt alles von oben gesehen! · Schau ruhig mal durch mein Teleskop. Man sieht ihn gut, er blinkt immer so lustig. · Und wenn du zu ihm willst: Draußen steht mein Raumschiff. Das darfst du gerne nehmen. · Aber ich habe leider den Schlüssel verloren ... |
| Y danach / mit Schlüssel | `tierW` | Hast du schon einen Schlüssel für mein Raumschiff? / Viel Glück auf dem Mond! |
| Foto beim Hinausgehen | Erzählerin | Klasse! Das Lama vor seinem Teleskop. |

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
- ~~**Fall 1 – das Problem:**~~ – „Hallo Joshi... Bitte hilf' uns. Wir haben ein großes Problem. Bitte steig schnell in dein Segelboot und komme zu uns. Ich markiere unseren Standort auf deinem Radar.“ (vom Nutzer, 16.10.2026).
- **Fall 1 – am Ziel:** im Globus noch „Du bist angekommen!“, danach die Waldinsel (Etappe 2, Texte oben als Entwurf).
- **Orte auf dem Globus:** der zweite Ort heißt jetzt „Die Waldinsel“ (noch mit Standardpunkt statt eines Symbols).
- **Der Weihnachtsfall** (Konzept.md, Abschnitt 7): Anrufer, die Etappen mit Orten und Verdächtigen, Texte der Tiere, Tipps beim Vergleichen („Zähl mal die Zehen.“), Auflösung.
- **Werkzeug-Hinweise** in Stufen, falls Joshi das Werkzeug später selbst wählt („Vielleicht hilft dir etwas, das ganz genau hinschaut.“ → „Nimm die Lupe.“).
- **Erwachen im Kinderzimmer** und **Trophäen** – folgen.
