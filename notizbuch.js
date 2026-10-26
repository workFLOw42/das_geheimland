// Das Geheimland – Fotos und Skizzen fuers Notizbuch (Live-Wunsch 16.10.2026). Laedt nach ausruestung.js.
// An bestimmten Stellen geht ein Foto (blauer Kreis am Boden) oder eine Bleistiftskizze (roter Kreis) – jedes Bild ist
// vorgegeben (Blick, Ausschnitt, wo der Fuchs sitzt). Steht Joshi auf dem Kreis, erscheint ein Y. Mit Y:
//   Foto:   die Kamera kommt aus dem Rucksack -> in Inventargroesse ein Bild wie durch den Sucher -> Klick und Blitz ->
//           das Bild fliegt in den Rucksack und wird ins Notizbuch geklebt.
//   Skizze: der Stift kommt aus dem Rucksack -> eine leere Seite, auf die der Stift die Szene als Bleistiftzeichnung
//           kritzelt -> sie fliegt in den Rucksack und kommt ins Notizbuch.
// Jede Stelle geht nur einmal. Freigeschaltet werden sie mit dem Funkspruch des ersten Falls (Kamera und Stift sind
// dann im Rucksack). Das Notizbuch selbst (blaettern, B = zu) steckt in ausruestung.js; die Seiten liefert story.notizSeiten.
(function(){
'use strict';
const story = window.STORY;
const klemme = (v, a, b) => Math.max(a, Math.min(b, v));
const weich = (k) => { k = klemme(k, 0, 1); return k * k * (3 - 2 * k); };

// ---- Die Stellen (alles vorgegeben) -----------------------------------------------------------------------------
// kreis: wo Joshi stehen muss (x, z), r; blick: Kamera fuers Bild (Position, yaw/pitch wie die Engine-Kamera, fov);
// fuchs: wo der Fuchs dabei sitzt und dass er zur Kamera schaut; ohneJoshi: Joshi ist nicht im Bild.
// Blicke ausgemessen (C:/tmp/jfg/test/blicke.js) nach den Vorlagen des Nutzers: Foto = Huette mit beiden Palmen, Feuer und
// Funkgeraet, viel Sternenhimmel, unten etwas Strand, der Fuchs rechts neben der rechten Palme; Skizze = vom Strand ueber
// den Steg aufs Meer, das Boot rechts daneben, oben viel offener Himmel (dort springt spaeter ein Wal ueber das Boot).
// Der Kreis liegt dort, wo die Kamera steht (Joshi steht da und macht das Bild).
const STELLEN = [
  // Mond gut sichtbar oben rechts (Live-Wunsch; ausgemessen C:/tmp/jfg/test/mondblick.js) – die Kamera sucht vorher in
  // kleinen, langsamen Schwenks, der Fuchs laeuft ins Bild und setzt sich; erst dann KLICK (fotoSuchen)
  { id: 'huette_foto', art: 'foto', name: 'Deine Hütte', kreis: { x: -4.0, z: 96.5, r: 1.1 },
    blick: { x: -4.0, y: 2.6, z: 96.5, yaw: -0.34, pitch: 0.12, fov: 62 }, fuchs: { x: 4.6, z: 81.6 }, fuchsVon: { x: 9.5, z: 84.0 }, ohneJoshi: true,
    text: ['Klasse. Du hast ein gutes Auge fürs Fotografieren.'] },   // keine Hinweise, wo es hinkommt (Live-Wunsch)
  { id: 'steg_skizze', art: 'skizze', name: 'Der Steg', kreis: { x: -8.0, z: 88.0, r: 1.1 },
    blick: { x: -8.0, y: 2.6, z: 88.0, yaw: Math.PI + 0.38, pitch: 0.22, fov: 56 }, fuchs: null, ohneJoshi: true,
    // Live-Wunsch: ein Orca springt ueber das Boot – mitten im Bogen, etwas hinter dem Boot (vom Strand aus gesehen),
    // quer zum Blick, Nase leicht nach unten (er kommt gerade wieder herunter)
    wal: { dx: 1.0, dz: 1.5, hoch: 10.5, kurs: Math.PI / 2 + 0.3, nick: -0.3 },
    text: ['Wow. Du hast ein schönes Bild gezeichnet.'] },
  // Live-Wunsch 16.10.: links neben der Huette (ein Stueck weg) liegt von Anfang an ein Holzscheit im gruenen Kreis. Ist
  // freigeschaltet, holt Joshi ihn mit Y: Schwarzblende, und er sitzt am Lagerfeuer und schnitzt mit dem Messer einen
  // Fuchs. Der steht danach in der Huette auf einem Bord ueber dem Bett; im Notizbuch eine Skizze von ihm.
  { id: 'feuer_schnitzen', art: 'messer', name: 'Der Holzfuchs', kreis: { x: -5.5, z: 75.0, r: 1.0 }, modell: 'holzfuchs', ort: 'insel',
    scheit: true, arbeitsplatz: { x: -1.6, z: 81.6 },                // dort hockt er beim Schnitzen (neben dem Feuer)
    text: ['Toll! Ein kleiner Fuchs aus Holz.'] },
  // Rechts neben der Huette fliegt ein Schwarm Schmetterlinge; mit der Lupe sieht man einen ganz gross von oben. Danach
  // fliegt einer in der Huette herum; im Notizbuch eine Skizze von ihm.
  { id: 'schmetterling_lupe', art: 'lupe', name: 'Der Schmetterling', kreis: { x: 4.4, z: 74.0, r: 1.0 }, modell: 'schmetterling', ort: 'insel',
    text: ['Wie schön der Schmetterling ist! Seine Flügel leuchten ganz blau.'] },
  // ---- Etappe 2, Waldinsel (waldinsel.js; Live-Wunsch 21.10.2026) ----
  // Blauer Fotoring vor dem Festtisch: erst da, wenn alle Tiere erzaehlt haben (bedingung) UND Joshi sich danach noch einmal
  // umgeschaut hat (nachX – der Fuchs zeigt ihn dann). Das Foto ist das Tatortfoto (Live-Wunsch 21.10.2026): der Tisch fast
  // senkrecht von oben in voller Laenge, nur die Reste und die zwei Fussspuren auf der Decke (Lama und Eichhoernchen –
  // noch ohne es zu sagen, das kommt im Notizbuch). Tiere und Fuchs sind fuer das Bild weg (ausblenden), der Wald oben.
  { id: 'tisch_foto', art: 'foto', name: 'Der Festtisch', etappe: 2, ort: 'waldinsel', kreis: { x: 0, z: 71.3, r: 1.0 }, nachX: true,
    bedingung: () => !!(story.e2SpurFrei && story.e2SpurFrei()),
    blick: { x: 0, y: 4.0, z: 68.3, yaw: 0, pitch: -Math.PI / 2 + 0.08, fov: 58 }, fuchs: null, ohneJoshi: true, ohneFuchs: true,
    ausblenden: () => (story.e2FotoAusblenden ? story.e2FotoAusblenden() : []),
    text: ['Klasse. Jetzt hast du den Tisch auf deinem Foto.'] },   // ohne "später" (Live-Wunsch 26.10.2026: gleich danach kommt "Merk dir die Spuren gut ... später")
  // Brauner Lupenring am Eingang des Waldwegs (gleiche Freischaltung wie das Foto): dort liegt eine Bananenschale, unter der
  // Lupe krabbeln Ameisen darueber (Live-Wunsch 21.10.2026). Modell aus waldinsel.js (bau: selbst gebaut, animiere: Ameisen).
  { id: 'weg_lupe', art: 'lupe', name: 'Die Bananenschale', etappe: 2, ort: 'waldinsel', kreis: { x: 6.7, z: 56.9, r: 1.0 }, nachX: true,
    bedingung: () => !!(story.e2SpurFrei && story.e2SpurFrei()), modell: 'bananenschale',
    bau: () => story.e2Bananenschale(), animiere: (g, t) => story.e2SchaleAnimieren && story.e2SchaleAnimieren(g, t), liegt: true,
    text: ['Schau mal! Ein Stück Bananenschale. Und viele kleine Ameisen krabbeln darüber.'] },
  // ---- Etappe 3, in der Hoehle des Gorillas (hoehle_innen.js; innen: nur in der Hoehle) ----
  // Lupe: das zerbrochene Holzentchen neben dem Gorilla (erst nach dem Suchblick in der Hoehle)
  { id: 'entchen_lupe', art: 'lupe', name: 'Das kaputte Entchen', etappe: 3, innen: true, ort: 'hoehle', kreis: { x: 636.3, z: -619.0, r: 0.95 }, nachX: true,
    bedingung: () => !!(story.e3StelleFrei && story.e3StelleFrei('entchen_lupe')), modell: 'entchen_kaputt', seitlich: true,
    bau: () => story.kaputtesEntchen(), text: ['Oh, ein Holzentchen. Es ist zerbrochen.'] },
  // Schnitzen: der Holzscheit rechts vorn am Feuer – ein neues Entchen (der Ring erst nach dem Gespraech mit dem Gorilla)
  { id: 'entchen_schnitzen', art: 'messer', name: 'Das neue Entchen', etappe: 3, innen: true, ort: 'hoehle', kreis: { x: 643.6, z: -617.8, r: 0.95 }, nachX: true,
    bedingung: () => !!(story.e3StelleFrei && story.e3StelleFrei('entchen_schnitzen')), darf: () => !story.e3Darf || story.e3Darf('entchen_schnitzen'),
    modell: 'entchen', scheitHoehle: true, arbeitsplatz: { x: 641.6, z: -618.6 }, feuer: { x: 640, z: -620.5 }, regal: 'entchen',
    text: ['Toll! Ein neues Holzentchen.'] },
  // Lupe am Korb (Live-Wunsch 22.10.2026): hat der Gorilla Joshi den Korb hingeschoben, liegt davor ein brauner Ring – unter
  // der Lupe das rote Fell am Korbrand; ins Notizbuch kommt die Fell-Skizze (seite statt der Modellskizze). Kein nachX: der
  // Ring erscheint sofort (hoehle_innen.js fuchsZu), der Fuchs zeigt ihn.
  { id: 'fell_lupe', art: 'lupe', name: 'Rotes Fell', etappe: 3, innen: true, ort: 'hoehle', kreis: { x: 637.3, z: -618.0, r: 0.95 }, nachX: true,   // = KORB_HIN + 1,4 m nach vorn
    bedingung: () => !!(story.e3StelleFrei && story.e3StelleFrei('fell_lupe')), modell: 'fell', liegt: true,
    bau: () => story.e3FellModell(), seite: () => story.e3FellSeite(), text: ['Schau mal, am Korb klebt rotes Fell. Das kommt in dein Notizbuch.'] },
  // Foto: der Gorilla mit seinem Entchen, vor dem Ausgang (ganz am Schluss)
  { id: 'gorilla_foto', art: 'foto', name: 'Der Gorilla', etappe: 3, innen: true, ort: 'hoehle', kreis: { x: 640, z: -613.6, r: 0.95 },
    bedingung: () => !!(story.e3StelleFrei && story.e3StelleFrei('gorilla_foto')), vorher: () => story.e3FotoVorbereiten && story.e3FotoVorbereiten(),
    blick: { x: 640, y: 151.6, z: -613.4, yaw: Math.atan2(640 - 637.7, -613.4 + 622.4), pitch: -0.08, fov: 48 }, fuchs: { x: 639.2, z: -620.0 }, fuchsVon: { x: 643, z: -617 }, ohneJoshi: true,
    text: ['Klasse! Der Gorilla lacht wieder.'] },
  // ---- Etappe 4, im Observatorium des Lamas (observatorium_innen.js; innen: nur dort) ----
  // Messer am Paket: der Ring erst, wenn das Lama erzaehlt hat, dass es mit Hufen keinen Knoten aufbekommt (der Fuchs zeigt ihn).
  // Kreis = observatorium_innen.js MESSER_P. Live-Wunsch 26.10.2026: wie das Schnitzen – das Messer schneidet gross im Bild
  // durch ein Seil (seil: ohne Holzklotz, die Enden ausserhalb des Bilds), danach eine Skizze vom Seil im Notizbuch; das Paket
  // geht auf, wenn die Stelle fertig ist (observatorium_innen.js e4StelleFertig).
  { id: 'schnur_messer', art: 'messer', name: 'Die Schnur', etappe: 4, innen: true, ort: 'observatorium', kreis: { x: -634.71, z: 622.80, r: 0.9 }, nachX: true,
    bedingung: () => !!(story.obsStelleFrei && story.obsStelleFrei('schnur_messer')), seil: true, modell: 'seil',
    bau: () => story.obsSeilModell(), seite: () => story.obsSeilSkizze(), text: ['Schnipp! Die Schnur ist durch.'] },
  // Lupe: Hufspuren im Staub vorn am Eingang – erst nach dem Aufschneiden UND einem neuen Suchblick (X). Kreis =
  // observatorium_innen.js SPUR_P
  { id: 'lama_spur', art: 'lupe', name: 'Die Spur des Lamas', etappe: 4, innen: true, ort: 'observatorium', kreis: { x: -638.4, z: 626.2, r: 0.9 }, nachX: true,
    bedingung: () => !!(story.obsStelleFrei && story.obsStelleFrei('lama_spur')), modell: 'lama_spur', liegt: true,
    bau: () => story.obsSpurModell(), seite: () => story.obsSpurSeite(), text: ['Schau mal, Spuren im Staub. Die kommen in dein Notizbuch.'] },
  // Lupe am Packpapier (nach dem zweiten Gespraech; der Fuchs zeigt den Ring): Spuren mit langen Zehen und rotes Fell.
  // Kreis = observatorium_innen.js PAPIER_P
  { id: 'packpapier_lupe', art: 'lupe', name: 'Das Packpapier', etappe: 4, innen: true, ort: 'observatorium', kreis: { x: -635.53, z: 622.41, r: 0.9 }, nachX: true,
    bedingung: () => !!(story.obsStelleFrei && story.obsStelleFrei('packpapier_lupe')), modell: 'packpapier', liegt: true,
    bau: () => story.obsPapierModell(), seite: () => story.obsPapierSeite(), text: ['Schau mal! Auf dem Packpapier sind auch Spuren – mit langen Zehen. Und wieder rotes Fell!'] },
  // Foto beim Hinausgehen: das Lama an seinem Paket, links das Teleskop; der Fuchs laeuft von links ins Bild (wie bei Huette
  // und Gorilla – vorher stand sein Ziel am Bildrand, Live-Befund 26.10.2026)
  { id: 'lama_foto', art: 'foto', name: 'Das Lama', etappe: 4, innen: true, ort: 'observatorium', kreis: { x: -637.0, z: 626.0, r: 0.9 }, nachX: true,
    bedingung: () => !!(story.obsStelleFrei && story.obsStelleFrei('lama_foto')), vorher: () => story.obsFotoVorbereiten && story.obsFotoVorbereiten(),
    blick: { x: -637.0, y: 151.4, z: 626.0, yaw: -0.12, pitch: 0.06, fov: 58 }, fuchs: { x: -638.0, z: 621.2 }, fuchsVon: { x: -640.6, z: 623.0 }, ohneJoshi: true,
    text: ['Klasse! Das Lama vor seinem Teleskop.'] },
  // Skizze draussen vor dem Observatorium (erst nach dem Blick durchs Teleskop; Live-Wunsch 26.10.2026: vorher drinnen neben dem
  // Teleskop): das Observatorium in der Oase unter dem Nachthimmel mit dem Mond. Der Ring steht am Blickpunkt des Bildes.
  // Live-Wunsch 26.10.2026: naeher am Observatorium (vorher bei -1 / 22); Nacht und Mond nur waehrend der Aufnahme (beiAufnahme),
  // vorher blendete die Nacht sichtbar ein und wieder aus
  { id: 'obs_skizze', art: 'skizze', name: 'Das Observatorium', etappe: 4, ort: 'wueste', kreis: { x: -7, z: 9, r: 1.0 }, nachX: true,
    bedingung: () => !!(story.obsStelleFrei && story.obsStelleFrei('obs_skizze')), beiAufnahme: (an) => story.obsSkizzeAufnahme && story.obsSkizzeAufnahme(an),
    blick: { x: -7, y: 2.2, z: 9, yaw: 0.285, pitch: 0.25, fov: 64 }, fuchs: null, ohneJoshi: true,
    text: ['Wow. Das Observatorium unter dem Sternenhimmel – und oben der Mond.'] },
  // Draussen: der Holzscheit am Parkplatz (liegt von Anfang an, ohne Kreis) – ein Schluessel fuer das Raumschiff
  { id: 'schluessel_schnitzen', art: 'messer', name: 'Der Schlüssel', etappe: 4, ort: 'wueste', kreis: { x: -22.5, z: 9.5, r: 0.95 }, nachX: true,
    bedingung: () => !!(story.obsStelleFrei && story.obsStelleFrei('schluessel_schnitzen')), modell: 'schluessel', bau: () => story.obsSchluesselModell(),
    scheitDing: () => story.obsScheit && story.obsScheit(), scheitWeg: () => story.obsScheitWeg && story.obsScheitWeg(),
    arbeitsplatz: { x: -22.5, z: 10.9 }, feuer: { x: -22.5, z: 9.5 }, regal: 'schluessel',   // in Joshis Huette: ein grosser Schluessel im Regal
    text: ['Toll! Ein Schlüssel aus Holz. Ob er in das Raumschiff passt?'] },
];
// Stellen je Etappe: etappe fehlt = 1 (Joshis Insel). Frei ist eine Stelle der Heimatinsel mit der Detektiv-Phase
// (zustand.frei), eine spaetere, sobald ihre bedingung gilt; nachX: dazu noch mit dem Suchblick entdecken (kreiseFreischalten)
const etappeVon = (s) => s.etappe || 1;
const E1 = STELLEN.filter(s => etappeVon(s) === 1);
function stelleFrei(s){ return etappeVon(s) === story.etappe && (s.bedingung ? s.bedingung() : zustand.frei); }
function stelleSichtbar(s){ return stelleFrei(s) && !zustand.gemacht[s.id] && (!s.nachX || kreisZiel(s).frei); }
// waldinsel.js (Hinweis-Taste): 'zu' = noch nicht da, 'offen' = Ring zu sehen, 'fertig' = Foto gemacht
story.stelleZustand = function(id){ const s = STELLEN.find(q => q.id === id); if(!s) return null;
  return zustand.gemacht[id] ? 'fertig' : stelleSichtbar(s) ? 'offen' : 'zu'; };
// ---- Holzscheit: liegt von Anfang an links neben der Huette (Objekt mit Grenze) -----------------------------------------
function baueScheit(){
  const g = new THREE.Group();
  const rinde = new THREE.MeshLambertMaterial({ color: 0x6b4a2b }), schnitt = new THREE.MeshLambertMaterial({ color: 0xd8b07a });
  const stamm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.62, 12), rinde); stamm.rotation.z = Math.PI / 2; stamm.position.y = 0.14; g.add(stamm);
  for(const sx of [-1, 1]){ const f = new THREE.Mesh(new THREE.CircleGeometry(sx > 0 ? 0.13 : 0.15, 12), schnitt); f.rotation.y = sx * Math.PI / 2; f.position.set(sx * 0.311, 0.14, 0); f.userData.keinKoerper = true; g.add(f); }
  const ast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.12, 6), rinde); ast.position.set(0.08, 0.27, 0.05); ast.rotation.z = -0.5; g.add(ast);
  g.traverse(o => { if(o.isMesh) o.castShadow = true; });
  return g;
}
story.typ('holzscheit', { bau: baueScheit });
const scheit = { d: null };
function scheitSetzen(){
  if(scheit.d || !story.setze || !story.welt || story.etappe !== 1) return;
  const s = STELLEN.find(q => q.scheit); if(!s) return;
  scheit.d = story.setze('holzscheit', 1, { x: s.kreis.x, z: s.kreis.z, dreh: 0.6, fest: true });
}
// Was aus dem Rucksack kommt
const WERKZEUG = { foto: 'kamera', skizze: 'stift', messer: 'messer', lupe: 'lupe' };
// Farbe des Kreises je nach Gegenstand (Live-Wunsch 16.10.): Kamera blau, Stift rot, Taschenmesser gruen, Lupe braun
const KREIS_FARBE = { foto: 'rgba(70,150,255,A)', skizze: 'rgba(235,60,60,A)', messer: 'rgba(60,190,90,A)', lupe: 'rgba(150,100,55,A)' };
const zustand = story.notiz = { frei: false, gemacht: {}, seiten: [], aktiv: null };
story.notizSeiten = () => zustand.seiten;
story.notizSeiteDazu = (s) => { s.dreh = s.dreh || (zustand.seiten.length % 2 ? 0.03 : -0.025); zustand.seiten.push(s); };
// Nach dem Neuladen (story.js spielstand): die Seiten aus der letzten Etappe wieder einkleben (PNG -> Bild). Das Notizbuch
// malt mit drawImage und liest width/height – ein Image tut das wie das Canvas, sobald es geladen ist.
if(story.spielstand && story.spielstand.seiten) for(const s of story.spielstand.seiten){
  if(!s.bild) continue; const im = new Image(); im.src = s.bild;
  zustand.seiten.push({ art: s.art, name: s.name, ort: s.ort, dreh: s.dreh, bild: im });
}
story.notizFreischalten = () => { zustand.frei = true; if(typeof preloadOrca === 'function') preloadOrca(); };   // Wal fuer die Skizze

// ---- Kreise am Boden und das Y ------------------------------------------------------------------------------------
const marken = [];
function kreisTextur(farbe){
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 60, 128, 128, 126);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.55, farbe.replace('A', '0.25')); gr.addColorStop(0.8, farbe.replace('A', '0.85')); gr.addColorStop(1, farbe.replace('A', '0'));
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  g.lineWidth = 8; g.strokeStyle = farbe.replace('A', '0.95'); g.beginPath(); g.arc(128, 128, 98, 0, 7); g.stroke();
  return new THREE.CanvasTexture(c);
}
function markenBauen(){
  if(marken.length) return;
  for(const s of STELLEN){
    const farbe = KREIS_FARBE[s.art] || KREIS_FARBE.foto;
    const m = new THREE.Mesh(new THREE.CircleGeometry(s.kreis.r, 40), new THREE.MeshBasicMaterial({ map: kreisTextur(farbe), transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 2; m.userData.deko = true; m.visible = false;
    story.welt(etappeVon(s)).add(m);
    const y = gelbY(); y.visible = false; story.welt(etappeVon(s)).add(y);
    marken.push({ s, m, y, t: Math.random() * 6 });
  }
}
let yTex = null;
function gelbY(){
  if(!yTex){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(64, 68, 56, 0, 7); g.fill();
    g.fillStyle = '#f5c518'; g.beginPath(); g.arc(64, 62, 54, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.stroke();
    g.fillStyle = '#1a1a1a'; g.font = 'bold 76px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Y', 64, 66);
    yTex = new THREE.CanvasTexture(c); }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: yTex, depthTest: false, transparent: true })); sp.scale.setScalar(0.6); sp.renderOrder = 999; sp.userData.deko = true; return sp;
}
const drinnen = () => !!(story.innen && story.innen.drin);
const passtOrt = (s, drin) => !!s.innen === !!drin;          // Stellen mit innen gelten nur drinnen (Hoehle), sonst nur draussen
function aufKreis(s){
  if(!eva || story.etappe !== etappeVon(s) || !passtOrt(s, drinnen()) || (story.imBoot && story.imBoot()) || (story.schwimm && story.schwimm.aktiv)) return false;
  const p = eva.group.position; return Math.hypot(p.x - s.kreis.x, p.z - s.kreis.z) < s.kreis.r;
}
function updateMarken(dt){
  markenBauen();
  for(const k of marken){
    const offen = stelleSichtbar(k.s);
    k.m.visible = offen;
    if(!offen){ k.y.visible = false; continue; }
    k.t += dt;
    const yb = evaFootY(k.s.kreis.x, k.s.kreis.z);
    k.m.position.set(k.s.kreis.x, yb + 0.03, k.s.kreis.z);
    k.m.material.opacity = 0.75 + Math.sin(k.t * 2.6) * 0.2;        // leicht pulsieren, damit man ihn sieht
    // vom Fuchs angezeigt: kurz kraeftig aufblinken und etwas groesser
    if(k.blink > 0){ k.blink -= dt; const b = Math.abs(Math.sin(k.blink * 9)); k.m.material.opacity = 0.6 + 0.4 * b; k.m.scale.setScalar(1 + 0.25 * b); }
    else k.m.scale.setScalar(1);
    k.y.visible = aufKreis(k.s) && !zustand.aktiv;
    if(k.y.visible) k.y.position.set(k.s.kreis.x, yb + 2.0 + Math.sin(k.t * 3) * 0.07, k.s.kreis.z);
  }
}
// Suchblick (story.js fuchsSuche): offene Kreise in der Naehe – der Fuchs laeuft hin und zeigt sie an; sie blinken auf
// Global (story.js fuchsRundgang): X schaltet Markierungen im Umkreis frei; der Fuchs laeuft alle freigeschalteten ab,
// die er noch nicht markiert hat. Freigeschaltet sind sie ohnehin, sobald die Detektiv-Phase begonnen hat (detektivStart).
const kreisZiele = {};
function kreisZiel(s){
  return kreisZiele[s.id] || (kreisZiele[s.id] = { kreis: true, x: s.kreis.x, z: s.kreis.z, r: s.kreis.r, entdeckt: false, frei: false,
    blinken(){ const m = marken.find(q => q.s === s); if(m) m.blink = 1.6; } });
}
story.kreiseFreischalten = function(x, z, r, drin){
  if(muetze.x){ muetze.xan = 0; muetze.x.visible = false; }      // X gedrueckt: das blaue X sofort weg (Live-Wunsch 26.10.2026)
  if(story.e3Gesucht) story.e3Gesucht();                       // hoehle_innen.js: der Suchblick in der Hoehle zaehlt
  if(story.e4Gesucht) story.e4Gesucht();                       // observatorium_innen.js: ebenso im Observatorium
  for(const s of STELLEN) if(passtOrt(s, drin) && stelleFrei(s) && !zustand.gemacht[s.id] && Math.hypot(s.kreis.x - x, s.kreis.z - z) < r) kreisZiel(s).frei = true;
};
story.sucheKreise = function(drin){
  return STELLEN.filter(s => passtOrt(s, drin) && stelleFrei(s) && !zustand.gemacht[s.id] && kreisZiel(s).frei).map(kreisZiel);
};
// Y (story.js buttonY fragt hier zuerst): steht Joshi auf einem offenen Kreis -> los
// Steht Joshi in einem offenen Ring? Dann zeigt nur der Ring sein Y (story.js interNaechstes) – Y gehoert ohnehin zuerst dem Ring
// (fotoY). Live-Wunsch 26.10.2026: am Bananenkorb und am Lama-Tisch standen zwei Y nebeneinander.
story.imKreis = () => !zustand.aktiv && marken.some(q => stelleSichtbar(q.s) && aufKreis(q.s));
story.fotoY = function(){
  if(zustand.aktiv) return false;
  const k = marken.find(q => stelleSichtbar(q.s) && aufKreis(q.s));
  if(!k) return false;
  if(k.s.darf && !k.s.darf()) return true;                      // Y gehoert dem Kreis, es passiert aber noch nichts (ein Satz)
  starte(k.s);
  return true;
};

// ---- Das Bild aufnehmen (Foto: echte Szene aus dem vorgegebenen Blick; Skizze: daraus eine Bleistiftzeichnung) ----
const BILD_W = 1200, BILD_H = 800;
// Wassertropfen am springenden Skizzen-Wal: kleine runde Spritzer, locker um ihn herum (vor allem unter Bauch und Fluke –
// dort reisst er das Wasser mit), ein paar fallen schon herunter. Fester Zufall (immer dieselbe Skizze). Feine Kugeln:
// im Bleistiftbild kleine Kringel. Erste Fassung: zu gross, eckig und als Strang hinter dem Wal – sah aus wie Steine.
function walTropfen(wal){
  let s = 4711; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // flach weiss (ohne Licht): der Bleistift-Filter zeichnet Helligkeitskanten – so wird jeder Tropfen ein feiner Kringel; mit
  // Licht hatte er eine dunkle Schattenseite und sah aus wie ein Schmutzpunkt
  const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const geo = new THREE.SphereGeometry(1, 14, 10);
  wal.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(wal), c = bb.getCenter(new THREE.Vector3()), gr = bb.getSize(new THREE.Vector3());
  const L = Math.max(gr.x, gr.z), H = gr.y;
  const kopf = new THREE.Vector3(0, 0, 1).applyQuaternion(wal.quaternion); kopf.y = 0; kopf.normalize();
  const quer = new THREE.Vector3(-kopf.z, 0, kopf.x);
  // Live-Wunsch 21.10.2026: die Spritzer HINTER dem Wal – er hat sie beim Sprung aus dem Wasser mitgerissen: entlang seiner
  // Bahn hinter der Fluke, die zum Wasser hin abfaellt (der Wal kommt gerade wieder herunter). Dicht an der Fluke viele
  // kleine, weiter hinten weniger und groessere, die schon fallen.
  // Wo ist der Kopf? (Live-Pruefung: aus der Modellachse lag er falsch herum – die Spritzer standen VOR dem Wal.) Der Wal kommt
  // herunter (nick < 0): der Kopf ist das TIEFERE Ende. Beide Enden entlang 'kopf' messen und notfalls umdrehen.
  { let vorne = -Infinity, hinten = -Infinity; const v = new THREE.Vector3();
    wal.traverse(o => { if(!o.isSkinnedMesh) return; const n = o.geometry.attributes.position.count;
      for(let i = 0; i < n; i += 9){ o.boneTransform(i, v); v.applyMatrix4(o.matrixWorld); const d = (v.x - c.x) * kopf.x + (v.z - c.z) * kopf.z;
        if(d > L * 0.35) vorne = Math.max(vorne, -v.y); if(d < -L * 0.35) hinten = Math.max(hinten, -v.y); } });
    if(hinten > vorne){ kopf.negate(); quer.negate(); } }       // -y am groessten = am tiefsten: das ist der Kopf
  const fluke = new THREE.Vector3(c.x - kopf.x * L * 0.5, c.y + H * 0.15, c.z - kopf.z * L * 0.5);
  for(let i = 0; i < 34; i++){
    const k = Math.pow(rnd(), 0.8), hinten = 0.15 + k * 2.2;        // m hinter der Fluke (Vielfaches von L)
    const bahn = -hinten * hinten * 0.35 * H;                       // die Bahn faellt nach hinten ab (Parabel)
    const streu = 0.15 + k * 0.6, seit = (rnd() - 0.5) * L * 0.35 * streu, hoch = (rnd() - 0.5) * H * 0.9 * streu;
    const m = new THREE.Mesh(geo, mat); m.scale.setScalar(0.07 + rnd() * 0.08 + k * 0.05);
    m.position.set(fluke.x - kopf.x * hinten * L * 0.45 + quer.x * seit, fluke.y + bahn + hoch, fluke.z - kopf.z * hinten * L * 0.45 + quer.z * seit); g.add(m);
  }
  for(let i = 0; i < 8; i++){                                     // ein paar fallen schon herunter (unter der Bahn)
    const hinten = 0.6 + rnd() * 1.6, m = new THREE.Mesh(geo, mat); m.scale.setScalar(0.09 + rnd() * 0.07);
    m.position.set(fluke.x - kopf.x * hinten * L * 0.45 + quer.x * (rnd() - 0.5) * L * 0.3, fluke.y - H * (0.6 + hinten * 0.9 + rnd() * 0.8), fluke.z - kopf.z * hinten * L * 0.45 + quer.z * (rnd() - 0.5) * L * 0.3); g.add(m);
  }
  scene.add(g); g.updateMatrixWorld(true); wal.userData.tropfen = g;   // global-ok: nur fuer die Aufnahme
}function aufnehmen(s){
  // Skizze: Fernebene bei 1,5 km – Sterne, Sternbilder, Milchstrasse und Mond fallen weg (Linien und Punkte waeren auf dem
  // Papier stoerend geworden), Meer, Steg und Boot bleiben
  const kam = new THREE.PerspectiveCamera(s.blick.fov, BILD_W / BILD_H, 0.5, s.art === 'skizze' ? 1500 : 1600000);
  kam.position.set(s.blick.x, s.blick.y, s.blick.z); kam.rotation.set(s.blick.pitch, s.blick.yaw, 0, 'YXZ'); kam.updateMatrixWorld(true);
  // Joshi raus, Fuchs auf seinen Platz (danach alles zurueck)
  const f = story.fuchs, fp = f.obj ? f.obj.position.clone() : null, fyaw = f.yaw, frot = f.obj ? f.obj.rotation.y : 0;
  const joshiSichtbar = eva ? eva.group.visible : false, schatten = typeof ovalShadow !== 'undefined' ? ovalShadow.visible : false;
  if(s.ohneJoshi && eva){ eva.group.visible = false; if(typeof ovalShadow !== 'undefined') ovalShadow.visible = false; }
  if(s.fuchs && f.obj){ f.obj.position.set(s.fuchs.x, evaFootY(s.fuchs.x, s.fuchs.z), s.fuchs.z);
    const w = Math.atan2(s.blick.x - s.fuchs.x, s.blick.z - s.fuchs.z); f.obj.rotation.y = w; }
  else if(f.obj && (s.art === 'skizze' || s.ohneFuchs)){ f.obj.visible = false; }
  const wegFuerBild = ausblendenFuer(s);
  // Wal fuer die Skizze: ein Klon der Orca-Vorlage der Engine, kurz ueber das Boot gestellt (danach wieder weg)
  let wal = null;
  if(s.wal && typeof orcaTpl !== 'undefined' && orcaTpl && typeof cloneSkinned === 'function'){
    const b = story.stegZustand || { bx: story.boot.x, bz: story.boot.z };
    wal = cloneSkinned(orcaTpl);
    // Haltung: kommt gerade herunter (Sprung-Pose des Low-Poly-Orcas; ohne sie stuende er hochkant in der Ruhepose)
    if(typeof orcaHaltung === 'function') orcaHaltung(wal, 'jump_pose_down');
    wal.position.set(b.bx + s.wal.dx, s.wal.hoch, b.bz + s.wal.dz);
    wal.rotation.set(s.wal.nick, s.wal.kurs, 0, 'YXZ');
    scene.add(wal); wal.updateMatrixWorld(true);                    // global-ok: nur fuer die Aufnahme, gleich wieder entfernt
    walTropfen(wal);
  }
  // Live-Befund 19.10.2026: "die Skizze sieht immer ein wenig anders aus, je nachdem, was sonst in der Umgebung ist" – die
  // echten Orcas (seit heute mehr und nah am Steg, einer springt ueber das Boot) kamen mit ins Bild, als "zweiter Wal", mal
  // mit ihren Spritzern, mal ohne. Fuer die Aufnahme sind sie und ihre Spuren weg; der Skizzen-Wal hat eigene Tropfen.
  const orcasWeg = [];
  if(s.wal && typeof orcas !== 'undefined') for(const o of orcas) if(o.group && o.group.visible){ o.group.visible = false; orcasWeg.push(o.group); }
  const spurenZurueck = s.wal && story.spurenVerstecken ? story.spurenVerstecken() : null;
  // Markierungen (Kreise, Y) gehoeren nicht ins Bild (Live-Befund: der rote Kreis stand mit in der Skizze)
  const versteckt = [];
  for(const k of marken) for(const o of [k.m, k.y]) if(o.visible){ o.visible = false; versteckt.push(o); }
  if(story.interListe) for(const o of story.interListe) if(o.zeichen && o.zeichen.visible){ o.zeichen.visible = false; versteckt.push(o.zeichen); }
  mondZu(kam);                                                     // Mond und Milchstrasse zur Fotokamera
  if(s.beiAufnahme) s.beiAufnahme(true);                           // nur fuer die Aufnahme (observatorium_innen.js: Nacht und Mond)
  const bild = rendern(kam);
  // Skizze in Schichten (Live-Wunsch 16.10.): erst Strand und Steg, dann das Boot, dann das Meer, ein paar Sterne, der Wal
  // – je ein Bleistiftbild mit dem bisher Gezeichneten (kumulativ); das Kritzeln deckt sie nacheinander auf
  let schichten = null;
  if(s.art === 'skizze'){
    const St = story.stegZustand || {}, meer = typeof ground !== 'undefined' ? ground : null;
    const teile = [St.boot, St.schatten, St.gischt, meer, wal, wal && wal.userData.tropfen].filter(Boolean);
    const sichtbar = (an) => { for(const o of teile) o.visible = an.includes(o); };
    schichten = [];
    // Das Meer ist in JEDER Schicht da (Live-Befund 21.10.2026: ohne Meer sah man in den ersten Schichten unter Wasser –
    // Pfaehle bis zum Grund, Fische, Kanten am Meeresboden –, und die Meer-Schicht danach machte das Wasser wieder leer)
    // Wo ist Meer im Bild? Einmal ohne, einmal mit Meer (sonst alles gleich) – wo sich das Bild unterscheidet, liegt Wasser.
    // Dorthin kommen von Hand gezeichnete Wellen (Live-Wunsch 21.10.2026: "das Wasser ist so blank" – der Bleistift-Filter
    // sieht die flachen Wellen nicht)
    sichtbar([]); const ohneMeer = rendern(kam);
    sichtbar([meer]); const mitMeer = rendern(kam);
    const wellen = meerMaske(ohneMeer, mitMeer);
    schichten.push(wellenZeichnen(bleistift(mitMeer, false, 'nur'), wellen));                 // Strand, Steg, Meer
    sichtbar([St.boot, meer]);        schichten.push(wellenZeichnen(bleistift(rendern(kam), false, 'nur'), wellen, true));   // + Boot
    sichtbar([St.boot, meer]);        schichten.push(wellenZeichnen(bleistift(rendern(kam), false), wellen, true));          // + Sterne
    sichtbar(teile);                  schichten.push(wellenZeichnen(bleistift(rendern(kam), false), wellen, true));          // + Wal (alles)
    for(const o of teile) o.visible = true;
  }
  if(s.beiAufnahme) s.beiAufnahme(false);                          // im selben Augenblick zurueck – auf dem Bildschirm sieht man nichts
  for(const o of versteckt) o.visible = true;
  wegFuerBild();
  mondZu(camera);
  if(eva){ eva.group.visible = joshiSichtbar; if(typeof ovalShadow !== 'undefined') ovalShadow.visible = schatten; }
  if(f.obj){ if(fp) f.obj.position.copy(fp); f.yaw = fyaw; f.obj.rotation.y = frot; f.obj.visible = true; }
  if(wal){ scene.remove(wal); if(wal.userData.tropfen) scene.remove(wal.userData.tropfen); }
  for(const g of orcasWeg) g.visible = true;
  if(spurenZurueck) spurenZurueck();
  if(schichten){ ab.schichten = schichten; return schichten[schichten.length - 1]; }
  return polaroid(bild);
}
// ---- Foto: die Kamera sucht das Motiv (Live-Wunsch 16.10.) ------------------------------------------------------------
// Der Sucher zeigt ein Live-Bild aus einer Kamera, die in kleinen, langsamen Schritten schwenkt (ein Stueck nach links,
// nach rechts, ein Stueckchen hoch …) und sich am Ende auf den perfekten Blick einpendelt. Derweil laeuft der Fuchs von der
// Seite ins Bild, setzt sich auf seinen Platz und schaut in die Kamera. Erst wenn beides passt: KLICK.
const SCHWENKS = [[0.05, 0.015], [-0.04, -0.01], [0.025, 0.03], [0, 0]];   // kleine Abweichungen (yaw, pitch) vom Ziel
const T_SCHWENK = 1.4;                                              // s je Schwenk (langsam)
const foto = { kam: null, live: null, lc: null, fuchsAn: false };
function fotoVorbereiten(s){
  foto.kam = new THREE.PerspectiveCamera(s.blick.fov, BILD_W / BILD_H, 0.5, 1600000);
  foto.live = new THREE.WebGLRenderTarget(BILD_W / 2, BILD_H / 2);
  foto.lc = document.createElement('canvas'); foto.lc.width = BILD_W / 2; foto.lc.height = BILD_H / 2;
  // Fuchs an den Startplatz (rechts ausserhalb des Bildes) – er laeuft dann selbst zu seinem Platz
  const f = story.fuchs;
  if(s.fuchs && f.obj){ foto.fuchsAn = true;
    const v = s.fuchsVon || s.fuchs; f.obj.position.set(v.x, evaFootY(v.x, v.z), v.z);
    f.modus = 'foto'; f.sitzt = false; f.laeuft = false; f.sitzSeit = 0; f.such = null; f.ziel = null; }
}
function fotoAufraeumen(){
  if(foto.live){ foto.live.dispose(); foto.live = null; }
  const f = story.fuchs; if(foto.fuchsAn && f.obj){ f.modus = 'streifen'; f.warte = 2; f.sitzt = true; } foto.fuchsAn = false;
}
// Rueckgabe true: das Motiv passt (Kamera steht, Fuchs sitzt)
function fotoSuchen(dt, t){
  const s = ab.s, b = s.blick, k = foto.kam;
  // Kamera: von Schwenk zu Schwenk weich gleiten, zuletzt auf den Zielblick
  const n = Math.min(SCHWENKS.length - 1, Math.floor(t / T_SCHWENK)), u = weich((t - n * T_SCHWENK) / T_SCHWENK);
  const a = SCHWENKS[Math.max(0, n - 1)], z = SCHWENKS[n], von = n ? a : [0.06, -0.02];
  const dy = von[0] + (z[0] - von[0]) * u, dp = von[1] + (z[1] - von[1]) * u;
  k.position.set(b.x, b.y, b.z); k.rotation.set(b.pitch + dp, b.yaw + dy, 0, 'YXZ'); k.updateMatrixWorld(true);
  // Fuchs: langsam zu seinem Platz, dann sitzen und zur Kamera schauen
  let sitzt = true;
  const f = story.fuchs;
  if(foto.fuchsAn && f.obj && s.fuchs){
    const p = f.obj.position, dx = s.fuchs.x - p.x, dz = s.fuchs.z - p.z, d = Math.hypot(dx, dz);
    // (die Drehung setzt story.js aus fuchs.yaw)
    if(d > 0.06){ sitzt = false; const v = Math.min(d, 1.3 * dt); p.x += dx / d * v; p.z += dz / d * v; p.y = evaFootY(p.x, p.z);
      f.yaw = Math.atan2(dx, dz); if(story.fuchsAnim && !f.laeuft){ f.laeuft = true; story.fuchsAnim('gehen'); } }
    else { f.laeuft = false; const w = Math.atan2(b.x - p.x, b.z - p.z); f.yaw += Math.atan2(Math.sin(w - f.yaw), Math.cos(w - f.yaw)) * Math.min(1, dt * 4);
      if(!f.sitzt){ f.sitzt = true; f.sitzSeit = t; if(story.fuchsAnim) story.fuchsAnim('setzen'); }
      sitzt = t - (f.sitzSeit || t) > 1.0; }                         // kurz warten, bis er wirklich sitzt
  }
  // Live-Bild in den Sucher (halbe Aufloesung; Joshi und Markierungen nicht im Bild)
  sucherLive(s, k);
  return sitzt && t >= SCHWENKS.length * T_SCHWENK;
}
function sucherLive(s, kam){
  const joshi = eva ? eva.group.visible : false, sch = typeof ovalShadow !== 'undefined' ? ovalShadow.visible : false;
  if(eva){ eva.group.visible = false; if(typeof ovalShadow !== 'undefined') ovalShadow.visible = false; }
  const versteckt = []; for(const k of marken) for(const o of [k.m, k.y]) if(o.visible){ o.visible = false; versteckt.push(o); }
  if(story.interListe) for(const o of story.interListe) if(o.zeichen && o.zeichen.visible){ o.zeichen.visible = false; versteckt.push(o.zeichen); }
  const f = story.fuchs, fuchsWar = f.obj ? f.obj.visible : false; if(s.ohneFuchs && f.obj) f.obj.visible = false;
  const wegFuerBild = ausblendenFuer(s);
  mondZu(kam);
  const W = BILD_W / 2, H = BILD_H / 2, alt = renderer.getRenderTarget();
  renderer.setRenderTarget(foto.live); renderer.clear(); renderer.render(scene, kam); renderer.setRenderTarget(alt);
  for(const o of versteckt) o.visible = true;
  wegFuerBild(); if(s.ohneFuchs && f.obj) f.obj.visible = fuchsWar;
  if(eva){ eva.group.visible = joshi; if(typeof ovalShadow !== 'undefined') ovalShadow.visible = sch; }
  mondZu(camera);
  const px = new Uint8Array(W * H * 4); renderer.readRenderTargetPixels(foto.live, 0, 0, W, H, px);
  const g = foto.lc.getContext('2d'), id = g.createImageData(W, H);
  for(let y = 0; y < H; y++) id.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
  for(let i = 3; i < id.data.length; i += 4) id.data[i] = 255;
  g.putImageData(id, 0, 0);
  sucherMalen(foto.lc);
}
// Was fuer das Bild weg soll (s.ausblenden: Liste von Objekten, z. B. die Tiere am Tatort) – Rueckgabe: wieder zeigen
function ausblendenFuer(s){
  // dazu immer das blaue X ueber Joshi und die gelben Y der Ringe (Live-Befund 26.10.2026: draussen kam das X mit auf die Skizze)
  const weg = []; for(const o of [...(s.ausblenden ? s.ausblenden() : []), muetze.x, ...marken.map(k => k.y)]) if(o && o.visible){ o.visible = false; weg.push(o); }
  return () => { for(const o of weg) o.visible = true; };
}
// Der Mond steht unendlich weit weg und wird in story.js jedes Bild relativ zur Spielkamera gesetzt – fuer eine andere
// Kamera kurz dorthin (sonst stuende er im Foto an der falschen Stelle)
function mondZu(kam){ if(story.mondAn) story.mondAn(kam.position); }
// Szene aus der Kamera kam in ein Canvas (BILD_W x BILD_H)
function rendern(kam){
  const rt = new THREE.WebGLRenderTarget(BILD_W, BILD_H);
  const alt = renderer.getRenderTarget(); renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, kam); renderer.setRenderTarget(alt);
  const px = new Uint8Array(BILD_W * BILD_H * 4); renderer.readRenderTargetPixels(rt, 0, 0, BILD_W, BILD_H, px); rt.dispose();
  const c = document.createElement('canvas'); c.width = BILD_W; c.height = BILD_H; const g = c.getContext('2d'), id = g.createImageData(BILD_W, BILD_H);
  for(let y = 0; y < BILD_H; y++) id.data.set(px.subarray((BILD_H - 1 - y) * BILD_W * 4, (BILD_H - y) * BILD_W * 4), y * BILD_W * 4);
  for(let i = 3; i < id.data.length; i += 4) id.data[i] = 255;
  g.putImageData(id, 0, 0);
  return c;
}
// Foto: leicht warm, etwas Vignette (wie ein Sofortbild)
function polaroid(c){
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,200,140,0.07)'; g.fillRect(0, 0, c.width, c.height);
  const v = g.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.35, c.width / 2, c.height / 2, c.height * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = v; g.fillRect(0, 0, c.width, c.height);
  return c;
}
// Skizze: Kanten des Bilds als Bleistiftstriche auf Papier, ohne Farbe (Helligkeits-Kanten + feine Schraffur im Dunklen).
// Fuer die Skizze wird ohne Sterne, Sternbilder und Mond aufgenommen (sie waeren dunkle Punkte und Linien geworden) –
// stattdessen ein paar leichte Kreuzchen am Himmel.
// frei: Modell vor hellem Grund – keine Sterne; ohneSterne ('nur'): die Schichten vor den Sternen (Skizze in Schichten)
function bleistift(c, frei, ohneSterne){
  const W = c.width, H = c.height, g = c.getContext('2d'), src = g.getImageData(0, 0, W, H).data;
  const L = new Float32Array(W * H);
  for(let i = 0; i < W * H; i++) L[i] = (src[i * 4] * 0.3 + src[i * 4 + 1] * 0.59 + src[i * 4 + 2] * 0.11) / 255;
  const out = document.createElement('canvas'); out.width = W; out.height = H; const o = out.getContext('2d');
  o.fillStyle = '#f4ecd8'; o.fillRect(0, 0, W, H);                // Papier
  const id = o.getImageData(0, 0, W, H), d = id.data;
  let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let y = 1; y < H - 1; y++) for(let x = 1; x < W - 1; x++){
    const i = y * W + x;
    // Sobel-Kante
    const gx = -L[i - W - 1] - 2 * L[i - 1] - L[i + W - 1] + L[i - W + 1] + 2 * L[i + 1] + L[i + W + 1];
    const gy = -L[i - W - 1] - 2 * L[i - W] - L[i - W + 1] + L[i + W - 1] + 2 * L[i + W] + L[i + W + 1];
    let ton = Math.min(1, Math.hypot(gx, gy) * 2.2);
    if(ton < 0.12) ton = 0;                                         // feines Rauschen (Wellen, Gras) nicht als Strich
    // Schraffur nur auf den dunkelsten Flaechen (Bootsrumpf, Pfaehle), fein und leicht – das Meer bleibt fast frei
    const dunkel = 1 - L[i];
    if(dunkel > 0.82 && ((x + y) % 9 === 0)) ton = Math.max(ton, (dunkel - 0.82) * 1.4);
    ton = ton * (0.78 + rnd() * 0.22);
    const k = i * 4;
    d[k] = 244 - ton * 190; d[k + 1] = 236 - ton * 190; d[k + 2] = 216 - ton * 180;
  }
  o.putImageData(id, 0, 0);
  // ein paar Sterne als Kreuzchen am Himmel (sonst ist der Himmel leer)
  o.strokeStyle = 'rgba(60,55,50,.55)'; o.lineWidth = 1.5;
  if(!frei && !ohneSterne) for(let n = 0; n < 26; n++){ const x = rnd() * W, y = rnd() * H * 0.35; o.beginPath(); o.moveTo(x - 4, y); o.lineTo(x + 4, y); o.moveTo(x, y - 4); o.lineTo(x, y + 4); o.stroke(); }
  return out;                                                      // die Signatur kommt beim Kritzeln zuletzt dazu (mitSignatur)
}
// Meer-Maske: 1 dort, wo das Bild mit Meer anders aussieht als ohne (also Wasser zu sehen ist und nichts davor steht)
function meerMaske(ohne, mit){
  const W = ohne.width, H = ohne.height, a = ohne.getContext('2d').getImageData(0, 0, W, H).data, b = mit.getContext('2d').getImageData(0, 0, W, H).data;
  const m = new Uint8Array(W * H);
  for(let i = 0; i < W * H; i++){ const k = i * 4; if(Math.abs(a[k] - b[k]) + Math.abs(a[k + 1] - b[k + 1]) + Math.abs(a[k + 2] - b[k + 2]) > 30) m[i] = 1; }
  // obere Kante des Wassers je Spalte (Horizont): fuer die Groesse der Wellen
  let oben = H; for(let y = 0; y < H && oben === H; y++) for(let x = 0; x < W; x += 8) if(m[y * W + x]){ oben = y; break; }
  return { m, W, H, oben };
}
// Wellen wie mit dem Bleistift: kleine Boegen (zwei, drei Haekchen), zum Horizont hin kleiner, flacher und dichter, vorn
// groesser und lockerer; dazu ein paar lange, feine Glanzlinien. Fester Zufall: die Skizze sieht immer gleich aus. Nur in
// der Maske. gleich: dieselben Wellen auf die naechste Schicht (sie wurden schon gezeichnet, bleiben stehen)
function wellenZeichnen(c, w, gleich){
  if(!w) return c;
  const g = c.getContext('2d'), { m, W, H, oben } = w;
  let s = 77; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const drin = (x, y) => { x = Math.round(x); y = Math.round(y); return x >= 0 && y >= 0 && x < W && y < H && m[y * W + x] === 1; };
  g.lineCap = 'round'; g.lineJoin = 'round';
  // Glanzlinien: lang, sehr fein, waagerecht
  for(let i = 0; i < 40; i++){ const y = oben + Math.pow(rnd(), 1.6) * (H - oben), x = rnd() * W, tief = (y - oben) / Math.max(1, H - oben);
    const len = 30 + tief * 120; if(!drin(x, y) || !drin(x + len, y)) continue;
    g.strokeStyle = 'rgba(70,64,58,' + (0.18 + tief * 0.12) + ')'; g.lineWidth = 0.8 + tief * 0.6;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len / 2, y - 1.5, x + len, y + 0.5); g.stroke(); }
  // Wellenboegen: in Reihen, vorn groesser
  for(let i = 0; i < 520; i++){
    const tief = Math.pow(rnd(), 1.25), y = oben + 4 + tief * (H - oben - 8), x = rnd() * W;
    if(!drin(x, y)) continue;
    const b = 5 + tief * 22, h = 1.2 + tief * 4, n = 1 + Math.floor(rnd() * 3);     // Breite, Hoehe, Anzahl Haekchen
    if(!drin(x + b * n, y)) continue;
    g.strokeStyle = 'rgba(60,55,50,' + (0.32 + tief * 0.28) + ')'; g.lineWidth = 0.9 + tief * 1.0;
    g.beginPath(); g.moveTo(x, y);
    for(let k = 0; k < n; k++){ const x0 = x + k * b; g.quadraticCurveTo(x0 + b * 0.5, y - h * (0.8 + rnd() * 0.4), x0 + b, y); }
    g.stroke();
  }
  void gleich;
  return c;
}
// Kopie mit dem J (fuer das Notizbuch und das Ende des Kritzelns)
function mitSignatur(c){
  const out = document.createElement('canvas'); out.width = c.width; out.height = c.height; const o = out.getContext('2d');
  o.drawImage(c, 0, 0); let s = 9; signatur(o, c.width, c.height, () => (s = (s * 16807) % 2147483647) / 2147483647, 1);
  return out;
}
// Signatur (Live-Wunsch): ein handschriftliches J unten rechts – Querstrich oben, Bogen nach unten mit Haken nach links,
// als Bleistift: drei duenne, leicht versetzte Striche uebereinander (wird beim Kritzeln zuletzt "geschrieben")
// anteil 0..1: nur so viel vom J (zum "Schreiben" am Ende des Kritzelns); Rueckgabe: die Spitze (0..1 im Bild) fuer den Stift
function jPunkte(W, H){
  const x = W - 120, y = H - 150, s = 1.1, P = [];
  const bez = (a, b, c, d, n) => { for(let i = 1; i <= n; i++){ const t = i / n, u = 1 - t;
    P.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]); } };
  // Querstrich oben (leicht gebogen), dann Bogen nach unten mit Haken nach links
  const q0 = [x - 26 * s, y + 4], q1 = [x + 30 * s, y - 2]; P.push(q0); bez(q0, [x - 8 * s, y - 4], [x + 12 * s, y - 4], q1, 10);
  P.push(null);                                                     // Stift absetzen
  const b0 = [x + 8 * s, y - 2]; P.push(b0);
  bez(b0, [x + 10 * s, y + 40 * s], [x + 12 * s, y + 66 * s], [x - 6 * s, y + 74 * s], 16);
  bez([x - 6 * s, y + 74 * s], [x - 22 * s, y + 80 * s], [x - 34 * s, y + 62 * s], [x - 26 * s, y + 50 * s], 10);
  return P;
}
function signatur(o, W, H, rnd, anteil){
  const P = jPunkte(W, H), bis = Math.max(1, Math.floor(P.length * (anteil === undefined ? 1 : anteil)));
  o.lineCap = 'round'; o.lineJoin = 'round';
  let spitze = null;
  for(let n = 0; n < 3; n++){                                       // drei duenne, leicht versetzte Striche (Bleistift)
    let s2 = 5 + n; const j = () => ((s2 = (s2 * 16807) % 2147483647) / 2147483647 - 0.5) * 2.2;
    o.strokeStyle = 'rgba(55,50,45,' + (0.55 - n * 0.12) + ')'; o.lineWidth = 3.4 - n * 0.8;
    o.beginPath(); let neu = true;
    for(let i = 0; i < bis; i++){ const p = P[i]; if(!p){ neu = true; continue; }
      const px = p[0] + j(), py = p[1] + j(); if(neu){ o.moveTo(px, py); neu = false; } else o.lineTo(px, py); spitze = p; }
    o.stroke();
  }
  return spitze ? { x: spitze[0] / W, y: spitze[1] / H } : null;
}

// ---- Ablauf: Gegenstand raus, Bild zeigen, Klick/Kritzeln, Bild in den Rucksack, ins Notizbuch ----------------------
const ab = { mesh: null, cv: null, tex: null, phase: null, t: 0, bild: null, s: null, blitz: null };
function starte(s){
  zustand.aktiv = s; zustand.verstaut = null;
  zustand.gemacht[s.id] = true;                                    // geht nur einmal
  ab.s = s;
  // eigene Aktion der Etappe (z. B. Schnur aufschneiden, observatorium_innen.js): sie meldet fertig(), dann ist Y wieder frei
  if(s.aktion){ s.aktion(() => { zustand.aktiv = null; }); return; }
  if(s.modell){ szeneStarten(s); return; }                         // Schnitzen, Lupe: 3D-Szene statt Bild
  // Foto: das Bild entsteht erst beim KLICK (vorher sucht die Kamera, und der Fuchs laeuft ins Bild); Skizze: gleich
  if(s.vorher) s.vorher();
  if(s.art === 'foto'){ ab.bild = null; fotoVorbereiten(s); } else ab.bild = aufnehmen(s);
  story.ausRucksack(WERKZEUG[s.art], () => { ab.phase = 'zeigen'; ab.t = 0; });
}
function anzeigeBauen(szene){
  if(ab.mesh) return;
  ab.cv = document.createElement('canvas'); ab.cv.width = BILD_W; ab.cv.height = BILD_H;
  ab.tex = new THREE.CanvasTexture(ab.cv);
  ab.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ab.tex, transparent: true, depthWrite: false, depthTest: false }));
  ab.mesh.renderOrder = 4; ab.mesh.visible = false; szene.add(ab.mesh);
  ab.blitz = document.createElement('div');
  ab.blitz.style.cssText = 'position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:45;transition:opacity .35s';
  document.body.appendChild(ab.blitz);
}
// Sucher: das Bild (Live-Bild beim Suchen) mit dunklem Rand, Fadenkreuz-Ecken und rotem Aufnahme-Punkt
function sucherMalen(quelle){
  const g = ab.cv.getContext('2d'), W = BILD_W, H = BILD_H;
  g.clearRect(0, 0, W, H); g.drawImage(quelle || ab.bild, 0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, 36); g.fillRect(0, H - 36, W, 36); g.fillRect(0, 0, 36, H); g.fillRect(W - 36, 0, 36, H);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 6;
  for(const [x, y, dx, dy] of [[70, 70, 1, 1], [W - 70, 70, -1, 1], [70, H - 70, 1, -1], [W - 70, H - 70, -1, -1]]){ g.beginPath(); g.moveTo(x, y + dy * 60); g.lineTo(x, y); g.lineTo(x + dx * 60, y); g.stroke(); }
  g.beginPath(); g.arc(W / 2, H / 2, 26, 0, 7); g.stroke();
  g.fillStyle = '#ff3b30'; g.beginPath(); g.arc(W - 90, 90, 14, 0, 7); g.fill();
  ab.tex.needsUpdate = true;
}
// Kritzeln: die Skizze von links oben nach rechts unten "aufdecken", mit Bleistiftspitze
// unter: das bisher Gezeichnete (Canvas oder null = leeres Papier), ueber: was jetzt dazukommt (in Zeilenbaendern, hin
// und her, wie gekritzelt), k = 0..1 Fortschritt; nur die Baender von y0 bis y1 (0..1), damit z. B. die Sterne oben bleiben
function kritzelMalen(k, unter, ueber, y0, y1){
  const g = ab.cv.getContext('2d'), W = BILD_W, H = BILD_H;
  if(unter) g.drawImage(unter, 0, 0); else { g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, W, H); }
  ueber = ueber || ab.bild; y0 = y0 || 0; y1 = y1 === undefined ? 1 : y1;
  const baender = 8, ganz = Math.floor(k * baender), rest = k * baender - ganz, bh = H * (y1 - y0) / baender, oben = H * y0;
  for(let b = 0; b < Math.min(baender, ganz + 1); b++){
    const w = b < ganz ? W : W * rest, x0 = b % 2 ? W - w : 0;
    g.drawImage(ueber, x0, oben + b * bh, w, bh + 1, x0, oben + b * bh, w, bh + 1);
  }
  ab.spitze = { x: (ganz % 2 ? W - W * rest : W * rest) / W, y: (oben + (Math.min(ganz, baender - 1) + 0.5) * bh) / H };
  ab.tex.needsUpdate = true;
}
// Fahrplan der Skizze in Schichten (Live-Wunsch 16.10.): Strand, Steg und Meer, Boot, Sterne – kurze Pause – Wal – kurze
// Pause – das J. [Dauer s, Pause danach s, Bereich y0..y1]
const SKIZZE_PLAN = [[2.0, 0.2, 0.35, 1.0], [1.2, 0.2, 0.3, 0.8], [0.8, 0.8, 0.0, 0.42], [1.2, 0.8, 0.12, 0.62]];
const T_SKIZZE = SKIZZE_PLAN.reduce((a, p) => a + p[0] + p[1], 0);
function skizzeMalen(t){
  const S = ab.schichten;
  if(!S){ kritzelMalen(weich(Math.min(1, t / T_KRITZEL))); return t >= T_KRITZEL; }
  let rest = t;
  for(let i = 0; i < SKIZZE_PLAN.length; i++){
    const [d, pause, y0, y1] = SKIZZE_PLAN[i];
    if(rest < d){ kritzelMalen(weich(rest / d), S[i - 1] || null, S[i], y0, y1); return false; }
    rest -= d;
    if(rest < pause){ kritzelMalen(1, S[i - 1] || null, S[i], y0, y1); return false; }   // kurz absetzen
    rest -= pause;
  }
  const g = ab.cv.getContext('2d'); g.drawImage(S[S.length - 1], 0, 0); ab.tex.needsUpdate = true;
  return true;
}
const T_ZEIGEN = 0.5, T_FOTO = 1.4, T_KRITZEL = 3.2, T_SIGNATUR = 1.0, T_WEG = 0.8;
// Das fertige Bild bleibt gross stehen, bis B gedrueckt wird (Live-Wunsch 16.10.) – B wird hier selbst gelesen (Taste B,
// Controller-Knopf 1); waehrend einer Szene knien Joshi und der Fuchs nicht (story.js evaActionB fragt szeneLaeuft)
const bTaste = { war: true, tipp: false };
addEventListener('keydown', (e) => { if((e.code === 'KeyB' || e.code === 'Escape') && !e.repeat) bTaste.tipp = true; }, true);
function bGedrueckt(){
  let b = !!(keys['KeyB'] || keys['Escape']);
  for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])) if(gp && gp.buttons[1] && gp.buttons[1].pressed) b = true;
  const neu = (b && !bTaste.war) || bTaste.tipp; bTaste.war = b; bTaste.tipp = false; return neu;
}
story.wartetAufB = () => ab.phase === 'halten';
// Ein Hinweis auf B, solange das Bild steht: kleines rundes "B" im Stil des Y unten in der Mitte
let bEl = null;
function bZeigen(an){
  if(!bEl){ bEl = document.createElement('div'); bEl.textContent = 'B';
    bEl.style.cssText = 'position:absolute;left:50%;bottom:7%;transform:translateX(-50%);width:64px;height:64px;border-radius:50%;background:#e8352b;'
      + 'border:5px solid #fff;box-shadow:0 4px 0 rgba(0,0,0,.35);color:#fff;font:900 36px/54px system-ui,sans-serif;text-align:center;pointer-events:none;z-index:46;display:none;';
    document.body.appendChild(bEl); }
  bEl.style.display = an ? 'block' : 'none';
}
story.bildEbeneAktiv = () => !!(ab.phase || zustand.aktiv);
// Vollbild (Live-Wunsch 23.10.2026): von Y bis das Ergebnis im Rucksack ist – danach laeuft nur noch die Ansage, Joshi darf
// laufen (Y und Weltwechsel bleiben bis zum Ende gesperrt: story.aktionLaeuft ueber bildEbeneAktiv)
story.notizVollbild = () => !!(ab.phase || sz.phase || (zustand.aktiv && zustand.verstaut !== zustand.aktiv));
story.bildEbene = function(dt, szene, pause){
  if(!pause){ scheitSetzen(); updateMarken(dt); updateDetektiv(); updateMuetze(dt); updateHuette(dt); updateSchwarm(dt); }
  updateSzene(dt, pause);
  if(!ab.phase) return;
  anzeigeBauen(szene);
  if(pause) return;
  ab.t += dt;
  const H = 2 * 5 * Math.tan(15 * Math.PI / 180), B = H * innerWidth / innerHeight;   // Bildebene (ausruestung.js EBENE)
  const w = B * 2 / 3, h = Math.min(H * 2 / 3, w * BILD_H / BILD_W);                   // so gross wie der Inventarrahmen
  const fw = h * BILD_W / BILD_H;
  ab.mesh.visible = true;
  if(ab.phase === 'zeigen'){                                       // erscheint (wie durch den Sucher bzw. leere Seite)
    const k = weich(ab.t / T_ZEIGEN);
    ab.mesh.position.set(0, 0, 1.2); ab.mesh.scale.set(fw * (0.8 + 0.2 * k), h * (0.8 + 0.2 * k), 1); ab.mesh.material.opacity = k;
    if(ab.s.art === 'foto') fotoSuchen(dt, 0); else kritzelMalen(0);
    if(ab.t >= T_ZEIGEN){ ab.phase = ab.s.art === 'foto' ? 'suchen' : 'kritzel'; ab.t = 0; }
  } else if(ab.phase === 'suchen'){                                // Kamera sucht, Fuchs laeuft ins Bild – bis alles passt
    if(fotoSuchen(dt, ab.t)){ ab.phase = 'foto'; ab.t = 0; }
  } else if(ab.phase === 'foto'){                                  // KLICK: das perfekte Bild
    if(!ab.klick){ ab.klick = true; klick(); ab.blitz.style.transition = 'none'; ab.blitz.style.opacity = '0.9';
      requestAnimationFrame(() => { ab.blitz.style.transition = 'opacity .45s'; ab.blitz.style.opacity = '0'; });
      ab.bild = aufnehmen(ab.s);                                   // jetzt in voller Groesse, aus dem perfekten Blick
      const g = ab.cv.getContext('2d'); g.drawImage(ab.bild, 0, 0, BILD_W, BILD_H); ab.tex.needsUpdate = true; }
    if(ab.t >= T_FOTO - 0.6){ ab.phase = 'halten'; ab.t = 0; fotoAufraeumen(); }
  } else if(ab.phase === 'kritzel'){
    // erst die Zeichnung (in Schichten), dann – immer zuletzt – das J (Live-Wunsch 16.10.)
    const tZeich = ab.schichten ? T_SKIZZE : T_KRITZEL;
    if(ab.t < tZeich){ skizzeMalen(ab.t); }
    else {
      skizzeMalen(tZeich + 1);
      const sp = signatur(ab.cv.getContext('2d'), BILD_W, BILD_H, null, Math.min(1, (ab.t - tZeich) / T_SIGNATUR)); ab.tex.needsUpdate = true;
      if(sp) ab.spitze = sp;
    }
    if(ab.spitze && story.stiftAn) story.stiftAn(ab.spitze.x, ab.spitze.y, fw, h);   // der Stift zeichnet sichtbar mit
    if(ab.t >= tZeich + T_SIGNATUR){ ab.phase = 'halten'; ab.t = 0; if(story.werkzeugRuht) story.werkzeugRuht(); }   // Stift ruht neben dem Bild bis B
  } else if(ab.phase === 'halten'){                                // steht gross, bis B gedrueckt wird
    bZeigen(ab.t > 0.4);
    if(ab.t > 0.4 && bGedrueckt()){ bZeigen(false); ab.phase = 'weg'; ab.t = 0; werkzeugBeiB(); if(ab.s.nachB) ab.s.nachB(); }
    else if(ab.t <= 0.4) bGedrueckt();                              // ein B, das schon gedrueckt war, nicht mitzaehlen
  } else if(ab.phase === 'weg'){                                   // klein in den Rucksack (unten rechts)
    const k = weich(ab.t / T_WEG), zx = B / 2 * 0.8, zy = -H / 2 * 0.66;
    ab.mesh.position.set(zx * k, zy * k + Math.sin(k * Math.PI) * 0.3, 1.2);
    ab.mesh.scale.set(fw * (1 - k * 0.95), h * (1 - k * 0.95), 1); ab.mesh.material.opacity = 1 - k * 0.3;
    if(ab.t >= T_WEG){
      ab.mesh.visible = false; ab.phase = null; ab.klick = false; zustand.verstaut = ab.s;   // im Rucksack: Joshi darf wieder laufen
      // ins Notizbuch: Skizzen mit dem J; dazu der Ort, an dem die Seite entstanden ist (Symbol neben der Seitenzahl)
      zustand.seiten.push({ art: ab.s.art, bild: ab.s.art === 'foto' ? ab.bild : mitSignatur(ab.bild), name: ab.s.name, ort: ab.s.ort || 'insel',
        dreh: (zustand.seiten.length % 2 ? 0.03 : -0.025) });
      const s = ab.s; let frei = false; const fertig = () => { if(frei) return; frei = true; if(zustand.aktiv === s) zustand.aktiv = null; pruefeFall1(); };
      story.sprich(s.text, fertig); setTimeout(fertig, SZENE_ENDE_WARTE * 1000);   // spaetestens dann frei (wie beim Schnitzen)
    }
  }
};
// ---- 3D-Szenen: Schnitzen und Lupe (Live-Wunsch 16.10.) -------------------------------------------------------------
// Schnitzen: das Messer kommt aus dem Rucksack, in der Mitte ein Holzklotz; das Messer schabt, Spaene fliegen, der Klotz
// wird kleiner und der Holzfuchs kommt heraus. Ist er fertig, geht das Messer zurueck, der Fuchs dreht sich gross, bis B.
// Lupe: die Lupe kommt heraus und steht gross im Bild, darunter (hinter dem Glas) der Schmetterling stark vergroessert
// von oben, mit schlagenden Fluegeln – bis B. Danach jeweils eine Bleistiftskizze des Modells (mit J) ins Notizbuch.
const sz = { phase: null, t: 0, s: null, gruppe: null, modell: null, L: 1, klotz: null, spaene: [], mx: null, skizze: null };
const T_SCHNITZ = 7.0;          // Live-Wunsch 16.10.: etwas laenger (vorher 4 s)
// Schnitzgeraeusch (Live-Wunsch 22.10.2026: "carving wood" von pineframestudios, Pixabay – schnitzen_snd.js): laeuft vom
// ersten Schnitt bis zum Ende des Schnitzens in Schleife (6,5 s Aufnahme, 7 s Schnitzen), am Ende 0,4 s ausgeblendet. Die
// Aufnahme ist sehr leise (Spitze 0,11) – deshalb kraeftig verstaerkt.
const SCHNITZ_VOL = 7, SCHNITZ_AUS = 0.4;
const schnitzTon = { buf: null, laedt: false, src: null, gain: null };
function schnitzTonLaden(){ if(schnitzTon.buf || schnitzTon.laedt || !window.SCHNITZEN_SND || typeof decodeSound !== 'function' || !audioCtx) return; schnitzTon.laedt = true;
  decodeSound(window.SCHNITZEN_SND).then(b => { schnitzTon.buf = b; }).catch(e => console.warn('Schnitz-Ton', e)); }
function schnitzTonAn(){
  try { schnitzTonLaden(); } catch(e){ return; } if(schnitzTon.src || !schnitzTon.buf || !soundOn || !audioCtx || audioCtx.state !== 'running') return;
  const q = audioCtx.createBufferSource(), g = audioCtx.createGain(); q.buffer = schnitzTon.buf; q.loop = true;
  g.gain.value = 0; g.gain.linearRampToValueAtTime(SCHNITZ_VOL, audioCtx.currentTime + 0.15);
  q.connect(g); g.connect(audioCtx.destination); q.start(); schnitzTon.src = q; schnitzTon.gain = g;
}
function schnitzTonAus(){
  const q = schnitzTon.src, g = schnitzTon.gain; if(!q) return; schnitzTon.src = null; schnitzTon.gain = null;
  const t = audioCtx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + SCHNITZ_AUS);
  try { q.stop(t + SCHNITZ_AUS + 0.05); } catch(e){}
}
// Holzscheit: Schwarzblende, Joshi sitzt am Lagerfeuer (Arbeitsplatz), aufblenden – dann beginnt das Schnitzen
const feuerVon = (s) => s.feuer || story.insel.feuer;
function blendeZumArbeitsplatz(s, weiter){
  const el = document.createElement('div');
  el.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;transition:opacity .4s;pointer-events:none;z-index:44;';
  document.body.appendChild(el); requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => {
    const a = s.arbeitsplatz, F = feuerVon(s);
    if(eva){ eva.group.position.set(a.x, evaFootY(a.x, a.z), a.z); eva.yaw = Math.atan2(a.x - F.x, a.z - F.z); eva.group.rotation.y = eva.yaw;
      if(typeof evaOrbit !== 'undefined') evaOrbit = 0;
      // Kamera gleich hinter Joshi (sonst fliegt sie im Hellwerden quer ueber die Insel)
      camera.position.set(a.x + Math.sin(eva.yaw) * 4.5, evaFootY(a.x, a.z) + 2.2, a.z + Math.cos(eva.yaw) * 4.5); }
    const sd = s.scheitDing ? s.scheitDing() : s.scheitHoehle ? story.hoehleInnen && story.hoehleInnen.scheit : scheit.d;
    if(sd && sd.obj && story.entferne){ story.entferne(sd); if(s.scheitWeg) s.scheitWeg(); else if(s.scheitHoehle) story.hoehleInnen.scheit = null; else scheit.d = { weg: true }; }   // der Scheit ist jetzt in Joshis Haenden
    if(story.arbeiten) story.arbeiten(true, F);                    // hockt schon am Feuer, wenn es hell wird
    el.style.opacity = '0';
    // erst wenn die Blende ganz durch ist, beginnt das Schnitzen (Live-Wunsch 16.10.)
    setTimeout(() => { el.remove(); weiter(); }, 450);
  }, 450);
}
function szeneStarten(s){
  if((s.scheit || s.scheitHoehle || s.scheitDing) && !s.geblendet){ s.geblendet = true; blendeZumArbeitsplatz(s, () => szeneStarten(s)); return; }
  const E = story.ebene();
  (s.bau ? s.bau() : story.modellKlon(s.modell)).then(({ g, L }) => {
    sz.s = s; sz.modell = g; sz.L = L; sz.t = 0;
    sz.gruppe = new THREE.Group(); sz.gruppe.add(g); E.szene.add(sz.gruppe);
    // helle Flaeche dahinter (wie das Inventar), damit Holz, Fuchs und Schmetterling sich vom Spielbild abheben
    if(!sz.flaeche){
      const c = document.createElement('canvas'); c.width = c.height = 256; const fg = c.getContext('2d'), gr = fg.createRadialGradient(128, 128, 30, 128, 128, 128);
      gr.addColorStop(0, 'rgba(255,250,236,0.92)'); gr.addColorStop(0.7, 'rgba(255,250,236,0.75)'); gr.addColorStop(1, 'rgba(255,250,236,0)');
      fg.fillStyle = gr; fg.fillRect(0, 0, 256, 256);
      sz.flaeche = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
      sz.flaeche.renderOrder = 2;
    }
    E.szene.add(sz.flaeche); sz.flaeche.visible = false;
    g.traverse(m => { if(m.isMesh){ m.renderOrder = 6; m.material = m.material.clone(); m.material.transparent = true; } });
    sz.gruppe.visible = false;
    sz.skizze = s.seite ? s.seite() : modellSkizze(s);             // die Bleistiftskizze schon jetzt (aus dem fertigen Modell)
    if(s.seil && sz.skizze) sz.skizze = mitSignatur(sz.skizze);     // das Seil mit Joshis J (Live-Wunsch 26.10.2026), wie die anderen Skizzen
    if(s.art === 'messer' && !s.seil){
      // Holzklotz: heller Quader mit Maserung, in den das Messer schneidet
      const holz = document.createElement('canvas'); holz.width = holz.height = 128; const hg = holz.getContext('2d');
      hg.fillStyle = '#c99a62'; hg.fillRect(0, 0, 128, 128); hg.strokeStyle = 'rgba(120,80,40,.55)'; hg.lineWidth = 2;
      for(let y = 6; y < 128; y += 9){ hg.beginPath(); hg.moveTo(0, y); for(let x = 0; x <= 128; x += 16) hg.lineTo(x, y + Math.sin(x * 0.09 + y) * 2.5); hg.stroke(); }
      // Der Klotz wird nicht kleiner (Live-Wunsch 16.10.: "kleiner und groesser sieht nicht schoen aus"), sondern blendet
      // langsam aus – erst an den Raendern links und rechts, zuletzt in der Mitte: eine Alpha-Maske (alphaMap, gruen-Kanal),
      // die jedes Bild neu gemalt wird (klotzMaske). Der Fuchs steht dabei in voller Groesse darin und taucht langsam auf.
      const mc = document.createElement('canvas'); mc.width = 128; mc.height = 4;
      sz.maske = { c: mc, tex: new THREE.CanvasTexture(mc) };
      sz.klotz = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 0.45), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(holz), alphaMap: sz.maske.tex, transparent: true, depthWrite: false }));
      sz.klotz.renderOrder = 7; sz.gruppe.add(sz.klotz); klotzMaske(0);
    }
    // Fluegel schlagen langsam – unter der Lupe soll man sie offen und ganz sehen (Live-Wunsch 16.10.: Draufsicht)
    // Draufsicht mit offenen Fluegeln (Live-Wunsch 16.10.): der Fluegelschlag steht bei t = 0 (ganz offen), nur ein ganz
    // leichtes Atmen (updateSzene setzt die Zeit selbst) – im Schlag sah man ihn sonst von der Kante
    if(s.art === 'lupe' && g.userData.clips && g.userData.clips.length){ sz.falterMx = new THREE.AnimationMixer(g.userData.inner || g); sz.falterMx.clipAction(g.userData.clips[0]).play(); sz.falterMx.setTime(0); }
    if(s.art === 'messer' && !s.seil && story.arbeiten && !story.figur.arbeitet) story.arbeiten(true, feuerVon(s));   // hockt (falls noch nicht), Blick zum Feuer (am Paket steht er)
    // Live-Befund 19.10.2026: "die ganze Schnitz-Animation ist nicht mehr zu sehen, Joshi bleibt am Feuer hocken, das Spiel
    // haengt" – nach Y im gruenen Kreis, waehrend die Kreise gerade neu erschienen waren und Fuchsi zum Markieren lief. Die
    // Szene begann NUR im fertig() von ausRucksack (Messer raus und aufgeklappt); kam das nicht, hing sie fuer immer. Jetzt
    // beginnt sie spaetestens nach SZENE_WARTE s auch ohne (die Ursache war hier nicht nachstellbar).
    // nur EINMAL: die Lupe ist mit B schon nach 0,6 s fertig – war die Szene vor dem Timer vorbei, startete er sie ein zweites
    // Mal (Live-Befund 20.10.2026: nach B kam das weisse Oval leer wieder, nochmal B, Text noch einmal)
    let gestartet = false;
    const los = () => { if(gestartet || sz.phase || sz.s !== s) return; gestartet = true; sz.phase = s.art === 'messer' ? 'schnitzen' : 'lupe'; sz.t = 0; sz.gruppe.visible = true; };
    story.ausRucksack(WERKZEUG[s.art], los);
    setTimeout(los, SZENE_WARTE * 1000);
  }).catch(e => { console.warn('Szene', s.id, e); szeneAbbrechen(s); });
}
const SZENE_WARTE = 5;        // s: so lange darf das Werkzeug zum Herauskommen brauchen
const SZENE_ENDE_WARTE = 8;   // s: spaetestens dann ist die Szene vorbei, auch wenn die Ansage danach haengt
// Laedt das Modell nicht: Joshi steht wieder auf, die Stelle ist wieder frei (sonst hockte er am Feuer fest)
function szeneAbbrechen(s){
  if(story.arbeiten) story.arbeiten(false);
  zustand.gemacht[s.id] = false; zustand.aktiv = null; sz.phase = null;
}
// Bleistiftskizze eines Modells: einmal vor hellem Grund gerendert und durch denselben Bleistift-Filter (wie die Steg-Skizze)
// Maske des Klotzes bei Fortschritt k (0..1): von aussen nach innen weg, weicher Rand, die Mitte bleibt am laengsten
function klotzMaske(k){
  const m = sz.maske; if(!m) return; const g = m.c.getContext('2d'), W = m.c.width, id = g.createImageData(W, m.c.height);
  for(let x = 0; x < W; x++){
    const rand = Math.abs(x / (W - 1) * 2 - 1);                     // 0 Mitte .. 1 Rand
    const weg = k * 1.25 - (1 - rand) * 0.9;                        // Rand ist zuerst dran, die Mitte zuletzt
    const a = Math.round(255 * Math.max(0, Math.min(1, 1 - weg / 0.35)));
    for(let y = 0; y < m.c.height; y++){ const i = (y * W + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = a; id.data[i + 3] = 255; }
  }
  g.putImageData(id, 0, 0); m.tex.needsUpdate = true;
}
// Bleistift-Skizze eines Modells aus der Welt (observatorium_innen.js: das Lama unter seiner Spur): eine Kopie in der
// jetzigen Haltung vor hellem Grund, um yaw gedreht, so gross, dass sie ins Bild passt
story.modellBleistift = function(obj, yaw){
  const W = BILD_W, H = BILD_H, szn = new THREE.Scene(); szn.background = new THREE.Color(0xf4ecd8);
  szn.add(new THREE.HemisphereLight(0xffffff, 0x777777, 1.1)); const l = new THREE.DirectionalLight(0xffffff, 0.8); l.position.set(1, 2, 2); szn.add(l);
  const kopie = story.klonSkin(obj), h = new THREE.Group(); kopie.position.set(0, 0, 0); kopie.rotation.set(0, 0, 0); h.add(kopie); h.rotation.y = yaw || 0; szn.add(h); h.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(h), sz = bb.getSize(new THREE.Vector3()), c0 = bb.getCenter(new THREE.Vector3()), k = 1 / Math.max(sz.x, sz.y, sz.z);
  h.scale.setScalar(k); h.position.copy(c0).multiplyScalar(-k); h.updateMatrixWorld(true);
  const kam = new THREE.PerspectiveCamera(30, W / H, 0.01, 10); kam.position.set(0, 0.1, 2.3); kam.lookAt(0, 0, 0);
  const rt = new THREE.WebGLRenderTarget(W, H), alt = renderer.getRenderTarget();
  renderer.setRenderTarget(rt); renderer.clear(); renderer.render(szn, kam); renderer.setRenderTarget(alt);
  const px = new Uint8Array(W * H * 4); renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); rt.dispose();
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), id = g.createImageData(W, H);
  for(let y = 0; y < H; y++) id.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
  for(let i = 3; i < id.data.length; i += 4) id.data[i] = 255;
  g.putImageData(id, 0, 0); story.entsorgen && story.entsorgen(kopie);
  return bleistift(c, true);
};
// Eine Stelle nachschlagen (observatorium_innen.js braucht den Blick des Tatortfotos)
story.stelleInfo = (id) => STELLEN.find(q => q.id === id);
function modellSkizze(s){
  const W = BILD_W, H = BILD_H, szn = new THREE.Scene(); szn.background = new THREE.Color(0xf4ecd8);
  szn.add(new THREE.HemisphereLight(0xffffff, 0x777777, 1.1)); const l = new THREE.DirectionalLight(0xffffff, 0.8); l.position.set(1, 2, 2); szn.add(l);
  const kopie = story.klonSkin(sz.modell); kopie.scale.setScalar(1 / sz.L); szn.add(kopie); kopie.updateMatrixWorld(true);
  // Fuchs schraeg von vorn, Schmetterling von oben (wie unter der Lupe)
  // Holzfuchs: um 180 Grad gedreht (Live-Befund 16.10.: die Schnauze zeigte nach hinten)
  if(s.seitlich) kopie.rotation.set(0.35, 0.45, 0);
  else if(s.art === 'lupe') kopie.rotation.set(s.liegt ? Math.PI / 2 - 0.25 : Math.PI / 2, 0, 0); else kopie.rotation.set(0.15, -0.6 + Math.PI, 0);
  const kam = new THREE.PerspectiveCamera(30, W / H, 0.01, 10); kam.position.set(0, 0, 2.2); kam.lookAt(0, 0, 0);
  const rt = new THREE.WebGLRenderTarget(W, H), alt = renderer.getRenderTarget();
  renderer.setRenderTarget(rt); renderer.clear(); renderer.render(szn, kam); renderer.setRenderTarget(alt);
  const px = new Uint8Array(W * H * 4); renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); rt.dispose();
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), id = g.createImageData(W, H);
  for(let y = 0; y < H; y++) id.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
  for(let i = 3; i < id.data.length; i += 4) id.data[i] = 255;
  g.putImageData(id, 0, 0);
  return mitSignatur(bleistift(c, true));
}
const _sv = new THREE.Vector3();
function updateSzene(dt, pause){
  if(pause && schnitzTon.src) schnitzTonAus();                     // Pause/Inventar: Schnitzgeraeusch aus (kommt mit dem Weiterschnitzen wieder)
  if(!sz.phase || pause) return;
  if(sz.phase !== 'schnitzen' && schnitzTon.src) schnitzTonAus();
  if(sz.s && sz.s.art === 'messer') schnitzTonLaden();
  sz.t += dt;
  const E = story.ebene(), H = E.hoehe, gross = H * 0.42;
  const g = sz.modell, grp = sz.gruppe;
  // helle Flaeche hinter der Szene (blendet mit ein und aus)
  if(sz.flaeche){ const B0 = H * innerWidth / innerHeight, an = sz.phase === 'weg' ? 1 - weich(sz.t / T_WEG) : Math.min(1, sz.t / 0.4 + (sz.phase !== 'schnitzen' && sz.phase !== 'lupe' ? 1 : 0));
    sz.flaeche.visible = true; sz.flaeche.position.set(0, 0, -0.6); sz.flaeche.scale.set(Math.min(B0, H * 1.5) * 0.9, H * 0.9, 1); sz.flaeche.material.opacity = an; }
  if(sz.phase === 'schnitzen' && sz.s.seil){
    // Seil (Live-Wunsch 26.10.2026): quer durchs ganze Bild (die Enden liegen draussen), das Messer saegt in der Mitte; im
    // letzten Viertel ist es durch (die zwei Haelften gehen zur Seite) – ohne Spaene
    seilLage(g, grp, H);
    const k = weich(Math.max(0, (sz.t - T_SCHNITZ * 0.7) / (T_SCHNITZ * 0.3)));
    if(g.userData.seilAuf) g.userData.seilAuf(k);
    if(story.messerSchneidet) story.messerSchneidet(Math.sin(sz.t * 9) * 0.25, -0.02 + Math.cos(sz.t * 4.5) * 0.04 - k * 0.12);
    schnitzTonAn();
    if(sz.t >= T_SCHNITZ){ schnitzTonAus(); sz.phase = 'zeigen'; sz.t = 0; }
  } else if(sz.phase === 'schnitzen'){
    // Klotz wird kleiner, der Fuchs waechst aus ihm heraus; das Messer (raus.akt, ausruestung.js) schabt rechts daneben
    const k = weich(sz.t / T_SCHNITZ);
    // genau dort, wo das fertige Modell danach steht (Live-Wunsch 22.10.2026: vorher bei -0,25/-0,15, beim Zeigen 0/0 – es
    // sprang nach dem Schnitzen in die Mitte). Das Messer schabt am rechten Rand (story.messerAn)
    grp.position.set(0, 0, 0.4);
    const lin = Math.min(1, sz.t / T_SCHNITZ);
    sz.klotz.scale.set(gross * 1.25, gross * 0.8, gross * 0.6);
    klotzMaske(lin);
    g.scale.setScalar(gross / sz.L); g.rotation.set(0.15, -0.6 + Math.PI, 0);   // Schnauze nach vorn (Live-Befund 16.10.)
    // Fuchs erst, wenn die Ecken des Klotzes weg sind (Live-Wunsch 16.10.: vorher schimmerte sein heller Umriss schon
    // durch) – zu Beginn ist nur der Holzscheit zu sehen; ganz unsichtbar, solange die Deckkraft 0 ist
    const fa = weich((lin - 0.35) / 0.5);
    g.visible = fa > 0.01; g.traverse(m => { if(m.isMesh){ m.material.opacity = fa; m.material.depthWrite = fa > 0.95; } });
    if(story.messerAn) story.messerAn(Math.sin(sz.t * 9) * 0.3, 0.05 + Math.cos(sz.t * 4.5) * 0.08);
    schnitzTonAn();                                                // laeuft (einmal gestartet) bis zum Ende des Schnitzens
    // Spaene: kleine helle Holzstueckchen, die vom Klotz wegfliegen
    if(Math.random() < dt * 22) spahn(grp);
    if(sz.t >= T_SCHNITZ){ schnitzTonAus(); grp.remove(sz.klotz); sz.phase = 'zeigen'; sz.t = 0; g.visible = true; g.traverse(m => { if(m.isMesh){ m.material.opacity = 1; m.material.depthWrite = true; } }); }
  } else if(sz.phase === 'lupe'){
    // Die Lupe steht aufrecht gross im Bild (raus.akt, ausruestung.js lupeAn) – genau hinter ihrem Glas der Schmetterling,
    // von oben gesehen und stark vergroessert, mit schlagenden Fluegeln
    const gl = story.lupeGlas ? story.lupeGlas() : null;            // Mitte und Groesse des Glases in der Ebene
    if(gl) grp.position.set(gl.x, gl.y, gl.z - 0.5); else grp.position.set(0, 0.05, 0.2);
    g.scale.setScalar((gl ? gl.r * (sz.s.liegt || sz.s.seitlich ? 1.85 : 1.5) : gross) / sz.L);   // ganz im Glas (die flache Schale darf es fast fuellen)
    // von oben (Oberseite zur Kamera, Kopf nach oben), dreht sich nur ganz leicht
    // liegt (Bananenschale): Oberseite +y zur Kamera (+z) kippen, sonst wie der Schmetterling
    // seitlich (das kaputte Entchen): von der Seite, leicht von oben – Rumpf und abgebrochener Kopf nebeneinander
    if(sz.s.seitlich) g.rotation.set(0.35, 0.45 + Math.sin(sz.t * 0.5) * 0.12, 0);
    else if(sz.s.liegt) g.rotation.set(Math.PI / 2 - 0.25, Math.sin(sz.t * 0.5) * 0.12, 0); else g.rotation.set(Math.PI / 2, 0, Math.sin(sz.t * 0.5) * 0.12);
    if(sz.falterMx) sz.falterMx.setTime(0.03 * (1 - Math.cos(sz.t * 1.6)));
    if(sz.s.animiere) sz.s.animiere(g, sz.t);                      // eigene Bewegung (Ameisen auf der Bananenschale)
    if(story.lupeAn) story.lupeAn();
    if(sz.t > 0.6) bZeigen(true);
    if(sz.t > 0.6 && bGedrueckt()){ bZeigen(false); werkzeugBeiB(); sz.phase = 'weg'; sz.t = 0; }
    else if(sz.t <= 0.6) bGedrueckt();
  }
  if(sz.phase === 'zeigen'){                                       // fertiger Fuchs dreht sich gross, bis B (das Seil bleibt liegen)
    if(sz.s.seil){ seilLage(g, grp, H); if(g.userData.seilAuf) g.userData.seilAuf(1); }
    else { grp.position.set(0, 0, 0.4); g.scale.setScalar(gross / sz.L); g.rotation.set(0.15, -0.6 + Math.PI + sz.t * 0.7, 0); }
    if(sz.t > 0.4) bZeigen(true);
    if(sz.t < 0.1 && story.werkzeugRuht) story.werkzeugRuht();    // Messer ruht neben dem Fuchs bis B
    if(sz.t > 0.4 && bGedrueckt()){ bZeigen(false); werkzeugBeiB(); sz.phase = 'weg'; sz.t = 0; }
    else if(sz.t <= 0.4) bGedrueckt();
  }
  if(sz.phase === 'weg'){                                          // klein in den Rucksack (unten rechts); das Seil blendet nur aus
    const k = weich(sz.t / T_WEG), B = H * innerWidth / innerHeight;
    if(sz.s.seil) g.traverse(m => { if(m.isMesh) m.material.opacity = 1 - k; });
    else { grp.position.set(B / 2 * 0.8 * k, -H / 2 * 0.66 * k + Math.sin(k * Math.PI) * 0.3, 0.4);
    g.scale.setScalar(gross / sz.L * (1 - k * 0.92)); }
    for(const p of sz.spaene) grp.remove(p.m);
    if(sz.t >= T_WEG){
      E.szene.remove(grp); if(sz.mx) story.stoppe(sz.mx); sz.mx = sz.falterMx = null;
      const s = sz.s; sz.phase = null; sz.spaene = []; zustand.verstaut = s;          // im Rucksack: Joshi darf wieder laufen
      zustand.seiten.push({ art: 'skizze', bild: sz.skizze, name: s.name, ort: s.ort || 'insel', dreh: (zustand.seiten.length % 2 ? 0.03 : -0.025) });
      fertigInHuette(s);
      if(story.arbeiten) story.arbeiten(false);                    // steht wieder auf
      // frei wird es mit dem Ende der Ansage – spaetestens aber nach SZENE_ENDE_WARTE s (haengt sie, blieb sonst jede
      // weitere Stelle gesperrt, siehe fotoY: zustand.aktiv)
      let frei = false; const fertig = () => { if(frei) return; frei = true; if(zustand.aktiv === s) zustand.aktiv = null; pruefeFall1(); };
      story.sprich(s.text, fertig);
      setTimeout(fertig, SZENE_ENDE_WARTE * 1000);
    }
  }
  for(let i = sz.spaene.length - 1; i >= 0; i--){ const p = sz.spaene[i]; p.t += dt; p.v.y -= 2.2 * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.z += dt * 6;
    p.m.material.opacity = Math.max(0, 1 - p.t / 0.9); if(p.t > 0.9){ grp.remove(p.m); sz.spaene.splice(i, 1); } }
}
// Fuer ALLE Werkzeuge gleich (Live-Wunsch 16.10.): Kamera, Stift, Messer und Lupe bleiben im Bild, bis B gedrueckt wird;
// erst dann wandern sie zurueck in den Rucksack (der dafuer erscheint, ausruestung.js rucksackZurueck)
function werkzeugBeiB(){ if(story.rausAktiv && story.rausAktiv()) story.rucksackZurueck(); }
let spahnMat = null;
function spahn(grp){
  if(!spahnMat) spahnMat = new THREE.MeshBasicMaterial({ color: 0xe2c08c, transparent: true, side: THREE.DoubleSide });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.025), spahnMat.clone()); m.renderOrder = 7;
  m.position.set((Math.random() - 0.5) * 0.3, 0.12, 0.2); grp.add(m);
  sz.spaene.push({ m, t: 0, v: new THREE.Vector3((Math.random() - 0.5) * 1.4, 0.5 + Math.random() * 0.6, 0.3) });
}
story.szeneAktiv = () => !!sz.phase;

// ---- Fertige Dinge in der Huette: der Holzfuchs auf einem Bord ueber dem Bett, ein Schmetterling fliegt herum ----------
// (Raum-Koordinaten wie huette_innen.js: Bett an der linken Wand x -4,5, Kopfteil zur Rueckwand). Der Raum wird erst beim
// Betreten gebaut – darum werden die Dinge gemerkt und gesetzt, sobald er steht.
const huette = { fuchs: false, schmetterling: false, gesetzt: {}, falter: null, mixer: null };
// Seil im weissen Oval (wie beim Schnitzen): so lang wie das Oval, die Enden laufen darin aus (observatorium_innen.js seilBauen)
function seilLage(g, grp, H){ const B = H * innerWidth / innerHeight, oval = Math.min(B, H * 1.5) * 0.9; grp.position.set(0, -H * 0.04, 0.4); g.scale.setScalar(oval * 0.95 / sz.L); g.rotation.set(0.35, 0, -0.06); g.visible = true; }
function fertigInHuette(s){ if(s.regal === 'entchen') huette.entchen = true; else if(s.regal === 'schluessel') huette.schluessel = true; else if(s.art === 'messer' && !s.seil) huette.fuchs = true;
  if(s.art === 'lupe' && etappeVon(s) === 1) huette.schmetterling = true; huetteSetzen(); }
function huetteSetzen(){
  const I = story.innen; if(!I || !I.gruppe) return;               // Raum noch nicht gebaut: beim Betreten (updateHuette)
  const R = I.gruppe;
  if(huette.fuchs && !huette.gesetzt.fuchs){
    huette.gesetzt.fuchs = true;
    // Wandbord ueber dem Bett (linke Wand), darauf der Holzfuchs, schraeg zum Raum
    const holz = new THREE.MeshLambertMaterial({ color: 0x8a5a33 }), dunkel = new THREE.MeshLambertMaterial({ color: 0x5b3a1f });
    const bord = new THREE.Group(); bord.position.set(-4.5 + 0.18, 1.45, -2.2); R.add(bord);
    bord.add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.8), holz));
    for(const zz of [-0.3, 0.3]){ const k = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), dunkel); k.position.set(-0.13, -0.09, zz); k.rotation.z = -0.5; bord.add(k); }
    story.modellKlon('holzfuchs').then(({ g, L }) => {
      g.scale.setScalar(0.24 / L); g.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(g); g.position.set(0.02, 0.0175 - bb.min.y, 0); g.rotation.y = Math.PI / 2 + 0.5;
      bord.add(g);
    });
    if(story.ding) story.ding(bord, { welt: 1, typ: 'bord_holzfuchs' });
  }
  // das geschnitzte Entchen (Etappe 3): als Kopie ins Regal, mittleres Fach rechts (Live-Wunsch: Trophaeen-Platz)
  if(huette.entchen && !huette.gesetzt.entchen && I.regalBretter){
    huette.gesetzt.entchen = true;
    story.modellKlon('entchen').then(({ g, L }) => { g.scale.setScalar(0.22 / L); const b = I.regalBretter[1];
      g.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(g); g.position.set(-0.6, 0.025 - bb.min.y, 0.02); g.rotation.y = -0.4; b.add(g); });
  }
  // Der geschnitzte Schluessel (Etappe 4, Live-Wunsch 23.10.2026): groesser als das Original, im Regal auf dem obersten Brett,
  // der Bart nach unten, um 30 Grad zur Seite geneigt (an die Buecher gelehnt)
  if(huette.schluessel && !huette.gesetzt.schluessel && I.regalBretter && story.obsSchluesselModell){
    huette.gesetzt.schluessel = true;
    story.obsSchluesselModell().then(({ g, L }) => { const b = I.regalBretter[2]; g.scale.setScalar(0.35 / L); g.rotation.z = Math.PI / 6;
      g.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(g); g.position.set(-0.72, 0.025 - bb.min.y, 0.09); b.add(g); });
  }
  if(huette.schmetterling && !huette.gesetzt.schmetterling){
    huette.gesetzt.schmetterling = true;
    story.modellKlon('schmetterling').then(({ g, L }) => {
      g.scale.setScalar(FALTER_L / L); g.userData.deko = true; R.add(g); huette.falter = { g, t: 0, ziel: null, sitzt: 0, v: new THREE.Vector3() };
      if(g.userData.clips && g.userData.clips.length){ huette.mixer = new THREE.AnimationMixer(g.userData.inner || g); huette.mixer.clipAction(g.userData.clips[0]).play(); }
      g.position.set(0, 1.6, 0);
    });
  }
}
// Schmetterling in der Huette: fliegt zu einem zufaelligen Punkt im Raum, setzt sich ab und zu (Regal, Tisch, Bett, Fenster),
// sitzt ein paar Sekunden mit langsam schlagenden Fluegeln, fliegt wieder los
const SITZPLAETZE = [[0.3, 1.86, -3.2], [3.1, 0.82, -0.6], [-3.5, 0.52, -1.6], [-2.2, 2.3, -3.45], [4.3, 1.15, 1.6], [-4.3, 1.5, -2.2]];
function updateHuette(dt){
  huetteSetzen();
  const f = huette.falter; if(!f) return;
  f.t += dt;
  if(huette.mixer) huette.mixer.update(dt * (f.sitzt > 0 ? 0.25 : 1.6));   // sitzt: Fluegel langsam, fliegt: schnell
  const p = f.g.position;
  if(f.sitzt > 0){ f.sitzt -= dt; if(f.sitzt <= 0) f.ziel = null; return; }
  if(!f.ziel){
    const sitzen = Math.random() < 0.4;
    f.ziel = sitzen ? new THREE.Vector3(...SITZPLAETZE[Math.floor(Math.random() * SITZPLAETZE.length)])
                    : new THREE.Vector3((Math.random() - 0.5) * 7, 0.8 + Math.random() * 1.9, (Math.random() - 0.5) * 5.4);
    f.zielSitzen = sitzen;
  }
  const d = _sv.copy(f.ziel).sub(p), l = d.length();
  if(l < 0.08){ if(f.zielSitzen) f.sitzt = 3 + Math.random() * 4; else f.ziel = null; return; }
  // flatternd: Richtung zum Ziel plus ein kleines Auf und Ab
  f.v.lerp(d.multiplyScalar(1.1 / l), Math.min(1, dt * 3));
  p.addScaledVector(f.v, dt); p.y += Math.sin(f.t * 9) * 0.004;
  f.g.rotation.y = Math.atan2(f.v.x, f.v.z) + FALTER_KOPF;
}

// ---- Schwarm draussen rechts neben der Huette (an der Lupen-Stelle) --------------------------------------------------
// Wie der Holzscheit von Anfang an da (Live-Wunsch 16.10.), bedienbar erst nach der Freischaltung. Je Falter FALTER_L m
// Spannweite (Live-Wunsch: 20 cm, 10 cm waren nicht zu sehen), in Augenhoehe um die Lupen-Stelle.
const FALTER_L = 0.2;
const FALTER_KOPF = Math.PI;    // der Kopf des Modells zeigt nach -z (Live-Befund 16.10.: sie flogen rueckwaerts)
const schwarm = { teile: [], gebaut: false };
function updateSchwarm(dt){
  if(!schwarm.gebaut){
    if(!story.gestartet || !story.welt) return;
    schwarm.gebaut = true;
    const s = STELLEN.find(q => q.art === 'lupe' && etappeVon(q) === 1);
    for(let i = 0; i < 7; i++) story.modellKlon('schmetterling').then(({ g, L }) => {
      g.scale.setScalar(FALTER_L / L); g.userData.deko = true; story.welt(1).add(g);
      let mx = null; if(g.userData.clips && g.userData.clips.length){ mx = new THREE.AnimationMixer(g.userData.inner || g); mx.clipAction(g.userData.clips[0]).play(); mx.setTime(Math.random()); }
      schwarm.teile.push({ g, mx, a: Math.random() * 6.3, r: 0.6 + Math.random() * 1.1, h: 0.6 + Math.random() * 1.0, w: (Math.random() < 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.6), cx: s.kreis.x, cz: s.kreis.z });
    });
  }
  for(const t of schwarm.teile){
    t.a += t.w * dt; if(t.mx) t.mx.update(dt * 1.6);
    const x = t.cx + Math.cos(t.a) * t.r, z = t.cz + Math.sin(t.a) * t.r * 0.8, y = 0.3 + t.h + Math.sin(t.a * 2.3) * 0.25;
    t.g.position.set(x, y, z); t.g.rotation.y = Math.atan2(-Math.sin(t.a) * t.w, Math.cos(t.a) * t.w * 0.8) + FALTER_KOPF;
    t.g.visible = story.etappe === 1;
  }
}

// Klick-Geraeusch der Kamera (selbst erzeugt: kurzes Knacken + Verschluss)
function klick(){
  if(typeof audioCtx === 'undefined' || !audioCtx || audioCtx.state !== 'running') return;
  const t = audioCtx.currentTime, sr = audioCtx.sampleRate, n = Math.floor(sr * 0.12), buf = audioCtx.createBuffer(1, n, sr), d = buf.getChannelData(0);
  for(let i = 0; i < n; i++){ const k = i / n; d[i] = (Math.random() * 2 - 1) * Math.exp(-k * 18) * (i < sr * 0.004 ? 1 : 0.5) + (k > 0.5 && k < 0.56 ? (Math.random() * 2 - 1) * 0.6 : 0); }
  const q = audioCtx.createBufferSource(); q.buffer = buf; const g = audioCtx.createGain(); g.gain.value = 0.5;
  q.connect(g).connect(audioCtx.destination); q.start(t);
}
// Freischalten: mit dem Funkspruch des ersten Falls (Kamera und Stift sind dann im Rucksack)
// ---- Spielablauf auf der Heimatinsel (Live-Wunsch 16.10.) ------------------------------------------------------------
// 1. Alles mit X entdeckt, an allem einmal Y, die Huette ausgeraeumt (story.js fall1Bereit) -> detektivStart: sobald Joshi
//    wieder draussen ist, erklaert die Erzaehlerin die Markierungen, und die vier Kreise erscheinen.
// 2. Sind alle vier erledigt (Foto, Steg-Skizze, Schnitzen, Lupe), kommt der Funkspruch des ersten Falls.
// Der Hinweis (D-Pad links) sagt in dieser Phase: "Schau dich ganz genau um, um alles zu entdecken."
const DETEKTIV_TEXT = ['Super! Jetzt bist du ein richtiger Detektiv. Wenn du dich genau umschaust, kannst du noch viel mehr entdecken.',
  'Es gibt kleine Markierungen in verschiedenen Farben. Wenn du in einer Markierung stehst und Y drückst, passiert etwas.',
  'Probier es doch gleich mal aus!'];
const detektiv = { wartet: false, erklaert: false };
story.detektivStart = function(){ if(detektiv.erklaert || detektiv.wartet) return; detektiv.wartet = true; };
story.detektivPhase = () => story.etappe === 1 && detektiv.erklaert && !E1.every(s => zustand.gemacht[s.id]);
function updateDetektiv(){
  if(!detektiv.wartet || detektiv.erklaert) return;
  if(!eva || (story.innen && (story.innen.drin || story.innen.wechsel)) || story.figur.aktion) return;   // erst wieder draussen
  if(story.stimmeFrei && !story.stimmeFrei()) return;              // keine laufende Ansage unterbrechen
  detektiv.erklaert = true;
  story.notizFreischalten();
  for(const s of E1) kreisZiel(s).frei = true;                    // alle vier sind jetzt frei ...
  story.sprich(DETEKTIV_TEXT);
  // ... und der Fuchs laeuft sie gleich ab und markiert sie (Live-Wunsch 16.10.) – ohne dass Joshi X druecken muss
  story.spaeter(1.2, () => { if(story.fuchsRundgang && eva) story.fuchsRundgang(eva.group.position.x, eva.group.position.z, false, 0); });
}
// ---- Testzugaenge (story.js Startbildschirm, 3 s X) -----------------------------------------------------------------
// detektiv: die Detektiv-Phase laeuft (Markierungen erklaert, alle vier frei – ohne Ansage). fertig: zusaetzlich alle vier
// Bilder gemacht – echt aufgenommen wie im Spiel (Huettenfoto, Steg-Skizze) bzw. die Modellskizze (Holzfuchs,
// Schmetterling), im Notizbuch, die Dinge in der Huette. Rueckgabe: Promise, wenn alles fertig ist.
story.testE1 = function(stufe){
  detektiv.wartet = true; detektiv.erklaert = true;
  story.notizFreischalten();
  for(const s of E1) kreisZiel(s).frei = true;
  if(stufe !== 'fertig') return Promise.resolve();
  let kette = Promise.resolve();
  for(const s of E1) kette = kette.then(() => stelleErledigen(s));
  return kette.then(() => { if(scheit.d && scheit.d.obj && story.entferne){ story.entferne(scheit.d); scheit.d = { weg: true }; } });
};
// Eine Stelle wie im Spiel erledigen, ohne Szene: Bild echt aufnehmen (bzw. Modellskizze), ins Notizbuch, gemacht
function stelleErledigen(s){
  zustand.gemacht[s.id] = true;
  const dreh = zustand.seiten.length % 2 ? 0.03 : -0.025;
  if(!s.modell){ const vorher = ab.s; ab.s = s; const b = aufnehmen(s); ab.schichten = null; ab.s = vorher;
    zustand.seiten.push({ art: s.art, bild: s.art === 'foto' ? b : mitSignatur(b), name: s.name, ort: s.ort || 'insel', dreh }); return Promise.resolve(); }
  return (s.bau ? s.bau() : story.modellKlon(s.modell)).then(({ g, L }) => { sz.modell = g; sz.L = L;
    zustand.seiten.push({ art: 'skizze', bild: s.seite ? s.seite() : modellSkizze(s), name: s.name, ort: s.ort || 'insel', dreh }); sz.modell = null; fertigInHuette(s); });
}
// Test (waldinsel.js): Stelle id freischalten (wie nach dem Suchblick) bzw. erledigen
story.kreisZielVon = (id) => { const s = STELLEN.find(q => q.id === id); return s ? kreisZiel(s) : null; };
story.testStelleFrei = (id) => { const s = STELLEN.find(q => q.id === id); if(s){ const k = kreisZiel(s); k.frei = true; k.entdeckt = true; } };
story.testStelle = (id) => { const s = STELLEN.find(q => q.id === id); return s ? stelleErledigen(s) : Promise.resolve(); };
// ---- Detektivmuetze unten rechts: es gibt in der Naehe etwas zu entdecken (Live-Wunsch 16.10.) -----------------------
// Ein unentdecktes Objekt (Suchblick X) oder eine offene Markierung in MUETZE_R m -> die Muetze erscheint (sanft, leicht
// wippend). Gezeichnet: braune Sherlock-Muetze mit Schild vorn und hinten und einer Schleife. Genau auf dem Platz von
// Rucksack/Funkgeraet (Live-Wunsch 16.10.) – ist einer davon zu sehen, weicht die Muetze (story.eckeBelegt); in Pause und
// Inventar aus (data-etappe-hud). Groesse mit der Bildhoehe, etwas groesser als vorher (118 px).
const MUETZE_R = 12, MUETZE_RUHE = 1.2;
const muetze = { el: null, an: 0, t: 0 };
function muetzeBild(){
  const c = document.createElement('canvas'); c.width = 220; c.height = 160; const g = c.getContext('2d');
  g.lineJoin = 'round'; g.lineWidth = 6; g.strokeStyle = '#2e1d10';
  g.save(); g.translate(110, 140); g.scale(1, 13 / 96); const sg = g.createRadialGradient(0, 0, 0, 0, 0, 96);   // Schatten: weich auslaufend
  sg.addColorStop(0, 'rgba(0,0,0,.34)'); sg.addColorStop(0.55, 'rgba(0,0,0,.18)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sg; g.beginPath(); g.arc(0, 0, 96, 0, 7); g.fill(); g.restore();
  // Schild vorn und hinten
  for(const [x, r] of [[34, -0.35], [186, 0.35]]){ g.save(); g.translate(x, 108); g.rotate(r); g.fillStyle = '#7a5530'; g.beginPath(); g.ellipse(0, 0, 38, 13, 0, 0, 7); g.fill(); g.stroke(); g.restore(); }
  // Kappe mit Karomuster
  g.save(); g.beginPath(); g.moveTo(40, 108); g.bezierCurveTo(44, 26, 176, 26, 180, 108); g.closePath();
  g.fillStyle = '#a0723f'; g.fill(); g.clip();
  g.strokeStyle = 'rgba(70,40,20,.55)'; g.lineWidth = 3;
  for(let x = 10; x < 220; x += 18){ g.beginPath(); g.moveTo(x, 20); g.lineTo(x - 20, 120); g.stroke(); }
  for(let y = 30; y < 120; y += 16){ g.beginPath(); g.moveTo(30, y); g.lineTo(190, y + 6); g.stroke(); }
  g.restore();
  g.lineWidth = 6; g.strokeStyle = '#2e1d10'; g.beginPath(); g.moveTo(40, 108); g.bezierCurveTo(44, 26, 176, 26, 180, 108); g.stroke();
  // Klappen-Band und Schleife oben
  g.fillStyle = '#5b3a1f'; g.beginPath(); g.ellipse(110, 36, 18, 9, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(110, 36); g.quadraticCurveTo(92, 18, 82, 30); g.moveTo(110, 36); g.quadraticCurveTo(128, 18, 138, 30); g.stroke();
  return c.toDataURL();
}
function updateMuetze(dt){
  if(!muetze.el){
    muetze.el = document.createElement('img'); muetze.el.src = muetzeBild(); muetze.el.dataset.etappeHud = '1';
    const n = story.rucksackNdc || { x: 0.8, y: -0.66 };          // Mittelpunkt wie der Rucksack (NDC -> CSS-Prozent)
    muetze.el.style.cssText = 'position:absolute;left:' + ((n.x + 1) * 50).toFixed(1) + '%;bottom:' + ((n.y + 1) * 50).toFixed(1) + '%;'
      + 'width:18vh;margin-left:-9vh;margin-bottom:-10.5vh;pointer-events:none;z-index:15;opacity:0;transition:none;';
    document.body.appendChild(muetze.el);
  }
  muetze.t += dt;
  // erst nach MUETZE_RUHE s Ruhe (Live-Befund 26.10.2026: nach einer Animation oder der Ankunft blitzte das X kurz auf, bis die naechste
  // Ansage begann – sie kommt oft mit kurzer Verzoegerung)
  muetze.ruhe = (zustand.aktiv || (story.redetGerade && story.redetGerade()) || (story.aktionLaeuft && story.aktionLaeuft())) ? 0 : (muetze.ruhe || 0) + dt;
  const soll = story.gestartet && eva && muetze.ruhe > MUETZE_RUHE && !(story.eckeBelegt && story.eckeBelegt()) && etwasInDerNaehe() ? 1 : 0;
  muetze.an += klemme(soll - muetze.an, -dt * 3, dt * 3);
  muetze.el.style.opacity = muetze.an.toFixed(2);
  muetze.el.style.transform = 'translateY(' + (Math.sin(muetze.t * 2.4) * 4).toFixed(1) + 'px) rotate(' + (Math.sin(muetze.t * 1.7) * 3).toFixed(1) + 'deg)';
  // Blaues X (Live-Wunsch 23.10.2026): mit der Muetze ueber Joshi, ein Stueck vor ihm – aber nur, wenn Umschauen (X) gerade die
  // richtige Aktion ist: in der Naehe ist noch etwas unentdeckt (ein Objekt vor dem Suchblick, ein Ring, der erst mit X kommt).
  // Ist alles entdeckt und fehlt nur noch Y, bleibt das X weg.
  if(!muetze.x && story.knopfTextur){ muetze.x = new THREE.Sprite(new THREE.SpriteMaterial({ map: story.knopfTextur('X'), transparent: true, depthTest: false, depthWrite: false }));
    muetze.x.renderOrder = 999; muetze.x.scale.setScalar(0.5); muetze.x.userData.deko = true; scene.add(muetze.x); }      // global-ok: folgt Joshi in jeder Welt
  if(muetze.x){
    muetze.xan = (muetze.xan || 0) + klemme((soll && xRichtig() ? 1 : 0) - (muetze.xan || 0), -dt * 3, dt * 3);
    if(zustand.aktiv) muetze.xan = 0;                              // waehrend Foto oder Skizze weg
    muetze.x.visible = muetze.xan > 0.02 && !!eva;
    if(muetze.x.visible){ const p = eva.group.position, y = eva.yaw;
      muetze.x.position.set(p.x - Math.sin(y) * 0.55, p.y + 1.85 + Math.sin(muetze.t * 3) * 0.06, p.z - Math.cos(y) * 0.55);
      muetze.x.material.opacity = muetze.xan; }
  }
}
function xRichtig(){
  if(!eva || (story.imBoot && story.imBoot())) return false;
  const p = eva.group.position, drin = !!(story.innen && story.innen.drin);
  if(story.interListe) for(const o of story.interListe){
    // frei = beim Umschauen schon dabei gewesen (story.js fuchsRundgang) – auch wenn der Fuchs es noch nicht angezeigt hat oder sein
    // Rundgang abbrach: dann ist X nicht mehr das Richtige (Live-Wunsch 26.10.2026: das X blieb nach dem Umschauen stehen)
    if(o.welt !== story.etappe || o.innen !== drin || o.erledigt || o.entdeckt || o.frei) continue;
    if(Math.hypot(o.x - p.x, o.z - p.z) < MUETZE_R) return true;
  }
  for(const s of STELLEN) if(passtOrt(s, drin) && stelleFrei(s) && !zustand.gemacht[s.id] && s.nachX && !kreisZiel(s).frei
    && Math.hypot(s.kreis.x - p.x, s.kreis.z - p.z) < MUETZE_R) return true;
  return false;
}
function etwasInDerNaehe(){
  if(story.imBoot && story.imBoot()) return false;
  const p = eva.group.position, drin = !!(story.innen && story.innen.drin);
  if(story.interListe) for(const o of story.interListe){
    if(o.welt !== story.etappe || o.innen !== drin || o.erledigt) continue;
    // noch mit X zu entdecken – oder entdeckt, aber noch ohne Y (einheitliche Logik, story.js objektOffen)
    if((!o.entdeckt || (story.objektOffen && story.objektOffen(o))) && Math.hypot(o.x - p.x, o.z - p.z) < MUETZE_R) return true;
  }
  for(const s of STELLEN) if(passtOrt(s, drin) && stelleSichtbar(s) && Math.hypot(s.kreis.x - p.x, s.kreis.z - p.z) < MUETZE_R) return true;
  // ... und Ringe, die erst mit X kommen (Live-Befund 26.10.2026: nach dem Aufschneiden des Pakets kam weder Hut noch X, obwohl es
  // nur mit Umschauen weitergeht – die Spur im Staub). Dieselbe Regel wie beim blauen X (xRichtig).
  for(const s of STELLEN) if(passtOrt(s, drin) && stelleFrei(s) && !zustand.gemacht[s.id] && s.nachX && !kreisZiel(s).frei
    && Math.hypot(s.kreis.x - p.x, s.kreis.z - p.z) < MUETZE_R) return true;
  return false;
}
// Alle vier Markierungen erledigt -> Funkspruch (nach einer kurzen Pause, damit er nicht in die letzte Ansage faellt)
function pruefeFall1(){
  if(story.etappe === 2 && story.e2StelleFertig) story.e2StelleFertig();   // waldinsel.js: Foto + Lupe fertig -> Gorilla
  if(story.etappe === 3 && story.e3StelleFertig){ for(const s of STELLEN) if(etappeVon(s) === 3 && zustand.gemacht[s.id] && !s.gemeldet){ s.gemeldet = true; story.e3StelleFertig(s.id); } }
  if(story.etappe === 4 && story.e4StelleFertig){ for(const s of STELLEN) if(etappeVon(s) === 4 && zustand.gemacht[s.id] && !s.gemeldet && !zustand.aktiv){ s.gemeldet = true; story.e4StelleFertig(s.id); } }
  if(story.etappe !== 1 || !detektiv.erklaert || !E1.every(s => zustand.gemacht[s.id]) || !story.fall1Funk) return;
  story.spaeter(2.0, () => story.fall1Funk());
}
})();
