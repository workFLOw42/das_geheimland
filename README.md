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

## 🙏 Danksagungen und Lizenzen

Dieses Spiel wäre ohne die großartige Arbeit vieler Künstlerinnen und Künstler nicht möglich. Herzlichen Dank!
Alle 3D-Modelle stammen von **[Sketchfab](https://sketchfab.com)**, alle Töne (soweit nicht anders angegeben) von
**[Pixabay](https://pixabay.com)** ([Pixabay-Lizenz](https://pixabay.com/service/license-summary/)).
NC-Lizenzen bedeuten: **nicht kommerziell** – das Spiel darf mit diesen Werken nicht verkauft werden.

### 3D-Modelle – eigens für das Geheimland

| Werk | Urheber/in | Lizenz | wofür |
|---|---|---|---|
| [Fox](https://sketchfab.com/3d-models/fox-39f97fe58f0b47ce80b6e02814001dd7) | **pxltiger** | CC-BY-4.0 | der Fuchs |
| [Stage Campfire](https://sketchfab.com/3d-models/stage-campfire-82f37f8bf0f645768e32ab7185df13ca) | **daedaljs** | CC-BY-4.0 | Lagerfeuer |
| [Sailboat](https://sketchfab.com/3d-models/sailboat-546a398c655943dab83d0d5356e44405) | **JinnMx** | CC-BY-4.0 | Segelboot |
| [Book – RealityScan](https://sketchfab.com/3d-models/book-realityscan-229c536a8d6b445f8a21cf73f6c6dce9) | **teddygbg** | CC-BY-4.0 | Notizbuch (verkleinert) |
| [Pencil](https://sketchfab.com/3d-models/pencil-9fe73cc296ae407e911d3e511f891b0e) | **farooq.smurf** | CC-BY-4.0 | Bleistift (verkleinert) |
| [Compass](https://sketchfab.com/3d-models/compass-5c47b26f85eb4659af66c10c568c1df3) | **EwanLejkowski** | CC-BY-4.0 | Kompass (verkleinert) |
| [Pocket Knife](https://sketchfab.com/3d-models/pocket-knife-a0e99464c68144b5b12dba5fa7d39c62) | **Riccardo Daniello** | CC-BY-4.0 | Taschenmesser (verkleinert) |
| [Magnifying Glass](https://sketchfab.com/3d-models/magnifying-glass-1ff86f28abc34a6e80ea07cea0d4723f) | **Laura.Clarke** | CC-BY-4.0 | Lupe (verkleinert) |
| [Canon AT-1 Retro Camera](https://sketchfab.com/3d-models/canon-at-1-retro-camera-9de66868d0f240e985da00c9480bfc82) | **AleixoAlonso** | CC-BY-4.0 | Fotokamera (verkleinert) |
| [Backpack low-poly](https://sketchfab.com/3d-models/backpack-low-poly-d7225bdd1d6c42d992485d72438cab28) | **dimaponomar2019** | CC-BY-4.0 | Rucksack (verkleinert) |
| [Wooden Fox Kit Figure](https://sketchfab.com/3d-models/wooden-fox-kit-figure-0391c2c8088c4db3924708e9a9c2bcd2) | **Yogensia** | CC-BY-NC-SA-4.0 | der geschnitzte Holzfuchs |
| [Ulysses Butterfly](https://sketchfab.com/3d-models/ulysses-butterfly-1155effb97564974aa0553db3d5eed57) | **eb78** | CC-BY-SA-4.0 | Schmetterlinge (Lupe) |
| [Wooden Duck Toy](https://sketchfab.com/3d-models/wooden-duck-toy-e85eccc41a1d40afa4c06819bae87654) | **Ujjwal Chauhan** | CC-BY-4.0 | das Holzentchen (verkleinert) |
| [Gorilla – Animated Low Poly](https://sketchfab.com/3d-models/gorilla-animated-low-poly-8b5ad2321e6e4b4689322b720012dbc6) | **WildPoly3D** | CC-BY-NC-4.0 | der Gorilla in der Höhle (nur die gebrauchten Clips) |
| [Rabbit – Animated Low Poly](https://sketchfab.com/3d-models/rabbit-animated-low-poly-5410724a8da1467986453b27058609a9) | **WildPoly3D** | CC-BY-NC-4.0 | Hase am Festtisch (Waldinsel) |
| [Rabbit Baby – Animated Low Poly](https://sketchfab.com/3d-models/rabbit-baby-animated-low-poly-624c8d09ea544c9585a87a2b11b039e5) | **WildPoly3D** | CC-BY-NC-4.0 | Hasenbaby am Festtisch |
| [Owl – Animated Low Poly](https://sketchfab.com/3d-models/owl-animated-low-poly-27f57eda1f5a41e6aa0ef2004f9a0fcd) | **WildPoly3D** | CC-BY-NC-4.0 | Eule am Festtisch |
| [Moose – Animated Low Poly](https://sketchfab.com/3d-models/moose-animated-low-poly-928a1731284d4466b684723ec1977b0f) | **WildPoly3D** | CC-BY-NC-4.0 | Elch am Festtisch |
| [Gazelle – Animated Low Poly](https://sketchfab.com/3d-models/gazelle-animated-low-poly-37a48d154e934f8fb3c4e03066dd881d) | **WildPoly3D** | CC-BY-NC-4.0 | als Reh am Festtisch |
| [Bird 3 – Animated Low Poly](https://sketchfab.com/3d-models/bird-3-animated-low-poly-2ed5c072ecaa480aad2bf205651dc028) | **WildPoly3D** | CC-BY-NC-4.0 | kleiner blauer Vogel |
| [Bird 4 – Animated Low Poly](https://sketchfab.com/3d-models/bird-4-animated-low-poly-c1746868085e4009ac1eea8df3d9ef18) | **WildPoly3D** | CC-BY-NC-4.0 | Meise |
| [Welcome to the Observatory](https://sketchfab.com/3d-models/welcome-to-the-observatory-258ad7a70f204856b2de319d2756383e) | **XelaDoesArt** | CC-BY-4.0 | Observatorium des Hamsters (Wüste, Etappe 4) |
| [Telescope (Realistic)](https://sketchfab.com/3d-models/telescope-realistic-b61ba4deb13a4833ae7cd340983823f1) | **Raphael Grimm** | CC-BY-4.0 | Teleskop im Observatorium (Texturen verkleinert) |
| [Hamster](https://sketchfab.com/3d-models/hamster-364b9958d9fa463f80b9ba99eb533d5a) | **josephineburns** | CC-BY-4.0 | der Hamster (im Spiel eingefärbt) |
| Sun, Mercury, Venus, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto ([Sketchfab](https://sketchfab.com/3d-models/sun-cd65c13799fd47a1aeb4c8ac018b2914)) | **Akshat** | CC-BY-4.0 | Sonne, Mond, Planeten und Pluto im Teleskop |
| [Key Wooden](https://sketchfab.com/3d-models/key-wooden-6448c643b4614815a10115861db8d05c) | **Sam** | CC-BY-4.0 | der geschnitzte Schlüssel für das Raumschiff des Hamsters |
| [Sea Turtle – Animated Low Poly](https://sketchfab.com/3d-models/sea-turtle-animated-low-poly-d2c766bc36724d5998b62f8b2150acb9) | **WildPoly3D** | CC-BY-NC-4.0 | Meeresschildkröte im See der Oase |
| [SeaTurtle Baby – Animated Low Poly](https://sketchfab.com/3d-models/seaturtle-baby-animated-low-poly-d6a5a74b67df418585c33ed37873531a) | **WildPoly3D** | CC-BY-NC-4.0 | Schildkröten-Baby im See der Oase |
| [Ring-Billed Gull](https://sketchfab.com/3d-models/ring-billed-gull-3df7913df7f34b90b152b05e12737c43) | **Oregon State University Ecampus** (osuecampus) | CC-BY-4.0 | sitzende Möwen |
| [Ring-Billed Gull – in Flight](https://sketchfab.com/3d-models/ring-billed-gull-in-flight-fba809cd4766411bb8c4236e9da606bc) | **Oregon State University Ecampus** (osuecampus) | CC-BY-4.0 | fliegende Möwen |

### 3D-Modelle – Fahrzeuge, Meer und Weltall

| Werk | Urheber/in | Lizenz | wofür |
|---|---|---|---|
| [P-51 Mustang](https://sketchfab.com/3d-models/p-51-mustang-36f0f3e71d2a4c18b479db1ae8f9e7a7) | **UlissesVinicios** | CC-BY-4.0 | Propellerflugzeug (Abflug Etappe 3) |
| [Parachute Simple](https://sketchfab.com/3d-models/parachute-simple-030a235d6f314a86bebc33f322c0e71c) | **TopNotch Assets** (Sketchfab-Konto Sxnneh) | CC-BY-4.0 | einfacher Fallschirm |
| [Fire Rescue Boat](https://sketchfab.com/3d-models/fire-rescue-boat-066ad028822c42eab411df40f5dc70d9) | **gogiart** (Sketchfab-Konto agt14032013) | CC-BY-4.0 | Feuerwehrboot |
| [Cruise Ship](https://sketchfab.com/3d-models/cruise-ship-bb782326932e4c179e34f3d6c8e36b86) | **farhad.Guli** | CC-BY-4.0 | Kreuzfahrtschiff |
| [Liberty ship](https://sketchfab.com/3d-models/liberty-ship-a1db8e8414464c5d8b11383e202fcf26) | **AlanTinka** | CC-BY-4.0 | Frachter |
| [Container Ship](https://sketchfab.com/3d-models/container-ship-aaa41cca946b4a08bc08cf692b7757be) | **RM02** | CC-BY-4.0 | Containerschiff |
| [Empty Ship](https://sketchfab.com/3d-models/empty-ship-f254f07be1324a138da32833b32486d8) | **Liaval** | CC-BY-4.0 | Großsegler |
| [Orthoceras – Steampunk Abyssal Cruiser](https://sketchfab.com/3d-models/orthoceras-steampunk-abyssal-cruiser-1d3278516cad4f28a9d2d46fe823304d) | **Red Kaiser** | CC-BY-NC-4.0 | U-Boot |
| [Mercedes Atego Fire Engine](https://sketchfab.com/3d-models/mercedes-atego-fire-engine-7e798389467d4e15a070459c016c52c8) | **Aeroux Games 3D** | CC-BY-4.0 | Feuerwehrauto |
| [T-65 X-wing Starfighter – Star Wars](https://sketchfab.com/3d-models/t-65-x-wing-starfighter-star-wars-993d2920342f46f7b92baf3aea1c3cf3) | **Quiznos323** | CC-BY-NC-SA-4.0 | X-Wing (Raumjäger) |
| [[Extracted] Minecraft Java Edition's Stars](https://sketchfab.com/3d-models/extracted-minecraft-java-editions-stars-c8868b7ffc4a473eb5cd9203a59e3650) | **AjaxGb** | CC-BY-4.0 | Sternenhimmel |
| [Sky Pano – Milkyway](https://sketchfab.com/3d-models/sky-pano-milkyway-0016725c047a4ea18cd0b5e5ef2fe441) | **MozillaHubs** (mozillareality) | CC-BY-NC-SA-4.0 | Milchstraße am Himmel |
| [Moon](https://sketchfab.com/3d-models/moon-4db2273f6dd943b8ad7fa5e3b1b2431a) | **Akshat** | CC-BY-4.0 | Mond |
| [Orca – Animated Low Poly](https://sketchfab.com/3d-models/orca-animated-low-poly-1033151e98dd4152a9c10cc91ff90586) | **WildPoly3D** | CC-BY-NC-4.0 | Orcas im Meer |
| [Low poly rainbow trout (Oncorhynchus mykiss)](https://sketchfab.com/3d-models/low-poly-rainbow-trout-oncorhynchus-mykiss-e2c052bd12fd492d9abf0a1c05cff175) | **Natural History Museum of Los Angeles County** | CC-BY-NC-SA-4.0 | Forellen / Fische |
| [Stingray – Animated Low Poly](https://sketchfab.com/3d-models/stingray-animated-low-poly-e3847b39eb9943b48df614e74e95a71f) | **WildPoly3D** | CC-BY-NC-4.0 | Rochen |
| [Furseal – Animated Low Poly](https://sketchfab.com/3d-models/furseal-animated-low-poly-c667fd35da0f4922a0f9321b9d250543) | **WildPoly3D** | CC-BY-NC-4.0 | Seelöwe |
| [Seal – Animated Low Poly](https://sketchfab.com/3d-models/seal-animated-low-poly-38b4c159b1b649cd9e65839b14d7de41) | **WildPoly3D** | CC-BY-NC-4.0 | Robbe |

### Musik

| Werk | Urheber/in | Lizenz | wofür |
|---|---|---|---|
| Punk Rock Guitar Loop (Pixabay-ID 278767) | **idoberg** (Pixabay) | Pixabay-Lizenz | Gitarre, wenn die Figur still steht |

### Geräusche

| Werk | Urheber/in | Lizenz | wofür |
|---|---|---|---|
| Searching the Radio Noise (Pixabay-ID 33807) | **freesound_community** (Pixabay) | Pixabay-Lizenz | Funkrauschen beim Funkspruch |
| Owl (humanatone, Pixabay-ID 102805) | **freesound_community** (Pixabay) | Pixabay-Lizenz | Eulenruf im Wald |
| Breaking Wood (Pixabay-ID 356120) | **Dragon Studio** (Pixabay) | Pixabay-Lizenz | Holzknacken im Wald |
| Silverback Gorilla Roar (Pixabay-ID 491076) | **flutie8211** (Pixabay) | Pixabay-Lizenz | Brummen aus der Gorilla-Höhle |
| Carving Wood (Pixabay-ID 546387) | **pineframestudios** (Pixabay) | Pixabay-Lizenz | Schnitzgeräusch |
| Birds Singing (Audio Tune, Pixabay-ID 165801) | **oliviaaydin** (Pixabay) | Pixabay-Lizenz | Vogelgezwitscher im hellen Waldweg |
| Prop Plane (Pixabay-ID 14513) | **freesound_community** (Pixabay) | Pixabay-Lizenz | Motor der Mustang |
| Car Crash Sound Effect (Pixabay-ID 376874) | **Dragon Studio** (Pixabay) | Pixabay-Lizenz | Absturz |
| Seagulls in Coastal Village (Pixabay-ID 486871) | **jonathanslattermusic** (Pixabay) | Pixabay-Lizenz | Möwen am Meer |
| Ocean Waves (Pixabay-ID 496030) | **magiaz** (Pixabay) | Pixabay-Lizenz | Meeresrauschen |
| Desert Wind 2 (Pixabay-ID 350417) | **tanweraman** (Pixabay) | Pixabay-Lizenz | leichter Wind in der Oase (Wüste) |

### Sonstiges

| Werk | Urheber/in | Lizenz | wofür |
|---|---|---|---|
| Spielfigur Joshi | eigenes Foto (T-Pose), freigestellt und als Comic-Figur gezeichnet mit **Google Gemini**, daraus ein 3D-Modell mit dem Bild-zu-3D-Dienst von **[MakerWorld](https://makerworld.com)** (Bambu Lab), fürs Animieren aufbereitet | eigene Figur (nach den Nutzungsbedingungen der Dienste) | die Spielfigur Joshi |
| [Mixamo](https://www.mixamo.com) (Auto-Rigging und Animationen) | **Adobe** | Mixamo-Nutzungsbedingungen (lizenzfrei nutzbar) | Skelett und Bewegungen der Spielfigur Joshi |
| [three.js](https://threejs.org) r128 inkl. GLTFLoader | **three.js authors** | MIT | 3D-Darstellung |
| Web Speech API (Stimmen des Browsers/Betriebssystems) | Browser-/OS-Hersteller | – | Sprachausgabe |
