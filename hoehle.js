// Das Geheimland – Etappe 3: beim Gorilla, draussen vor der Hoehle (Fall 1 "Das Weihnachtsessen", Konzept Abschnitt 7).
// Laedt nach waldinsel.js, vor der Engine. Aktiv nur, wenn story.etappe === 3 (nach dem Globus vom Waldweg; zum Testen
// Testzugang "E3").
// Die andere Seite der Waldinsel (Konzept): Joshi steht, von hinten gesehen, am Waldausgang. Vorn links die Piste mit der
// Mustang des Gorillas – sie fuehrt nach links weg (Live-Wunsch 22.10.2026), hinter Joshi bleibt der Wald dicht. Vor Joshi
// (naeher als zuerst) der Felsberg mit dem Hoehleneingang; der Berg
// zieht sich weit nach rechts, daneben ebenfalls Wald. Spaeter Nachmittag, wenig Schnee, etwas Moos am Fels (Live-Wunsch
// 21.10.2026). Aus der Hoehle brummt der Gorilla ab und zu traurig – zu sehen ist er erst drinnen (naechster Schritt:
// Innenraum = eigene Welt, wie die Huette).
// Gelaende: die Insel bei 0, 0 ist hier gross (INSEL_R), +z = Sueden: hinter Joshi der Wald, aus dem er kommt.
(function(){
'use strict';
const story = window.STORY;
const e3 = () => story.etappe === 3;

// ---- Ort -------------------------------------------------------------------------------------
const INSEL_R = 230;                                  // m Grasflaeche (Engine-Startinsel: 260)
// EINE Karte der Waldinsel (Live-Wunsch 22.10.2026): Etappe 2 (Lichtung, Strand, Steg) und Etappe 3 (Berg, Hoehle, Piste)
// liegen auf derselben grossen Insel. Die Lichtung bleibt an ihren Koordinaten; die grosse Insel (INSEL_R) liegt mit ihrer
// Mitte bei MITTE_Z, ihr Suedstrand faellt genau auf den Strand der Lichtung (z 98,6 – Steg und Boot stehen unveraendert).
// Alle Orte dieser Etappe sind daher um MITTE_Z verschoben (Z(z)); entworfen wurden sie um die Inselmitte.
const MITTE_Z = 98.6 - INSEL_R * 1.12, Z = (z) => z + MITTE_Z;
const E2_WALD = 86;                                   // m um die Lichtung: dort steht der Wald von Etappe 2 (waldinsel.js)
const START = { x: 0, z: Z(62), blick: { x: 0, z: Z(0) } };  // Waldausgang, Blick nach Norden (-z) auf den Berg
// Live-Wunsch 22.10.2026: der Berg naeher an Joshi (vorher 80 m bis zur Hoehle, jetzt ~46 m), der Eingang groesser
const HOEHLE = { x: 0, z: Z(16), B: 7.3, H: 6.0 };       // Eingang im Fuss des Bergs, Joshi gegenueber (22.10.: +30 %)
const BERG = { z: Z(-6), links: -22, rechts: 170, hoch: 72, gipfel: 112 };    // links endet er vor der Piste; Gipfel ueber der Hoehle, zieht weit nach rechts (+x)
// Piste quer vor Joshi nach links (Westen, -x): Schotterbahn laengs x zwischen Wiese und Bergfuss
const PISTE = { x: -118, z: Z(40), L: 190, B: 12 };      // von x -23 bis -213
// Mustang am Ostende der Piste (vorn links von Joshi gut zu sehen), Nase nach Westen: gestartet wird nach links, vom Berg
// weg, ueber den Wald zum Meer (~180 m Startstrecke)
const MUSTANG = { x: -32, z: Z(40) };
// Das Ziel (roter Punkt): Richtung Wueste, weit im Suedwesten; kommt entgegen, wenn man darauf zuhaelt (wie beim Segeln)
const FLUGZIEL = { x: -1400, z: 2600, r: 160 };     // am Suedende der Piste geparkt, Nase nach Norden (die Bahn hinauf)
const WALDRAND = { z: Z(66) };                           // der Wald hinter Joshi (aus ihm kommt er)
const MUSTANG_YAW = Math.PI / 2;                      // Engine: Nase bei yaw 0 = -z; nach Westen (-x) = yaw PI/2
// Das Ende des Waldwegs (Live-Wunsch 21.10.2026): derselbe Weg wie auf der Lichtung – dunkle Gasse, Aeste, Schatten, ohne
// Schnee –, hier von Sueden (tief im Wald) bis vor Joshi; vorn laeuft er sanft in die Wiese aus
// Die Linie beginnt vor Joshi (dort waechst er aus der Wiese, waldinsel.js baueWeg: Anfang = schmal und blass) und
// laeuft in den Wald, wo er im Schatten verschwindet.
// ... und endet genau am Ende des Waldwegs der Lichtung (waldinsel.js WEG_LINIE, letzter Punkt 8/-34): ein durchgehender Weg
const WEG3 = [{ x: 0, z: 52 }, { x: 0, z: 64 }, { x: 1, z: 78 }, { x: 2, z: 96 }, { x: -3, z: 118 }, { x: 8, z: -34 - MITTE_Z }].map(p => ({ x: p.x, z: Z(p.z) }));
// Zurueck zur Lichtung (nach dem Gorilla, der Weg ist hell): ab hier auf dem Waldweg die Schwarzblende (wie in die Hoehle)
// Live-Wunsch 23.10.2026 (zweimal): nicht laenger als der Hinweg (Lichtung: Wegeingang bis Ausloeser gemessen ~15,6 m) – hier ab dem
// Waldrand (WALDRAND z 66) 14 m, vorher 20 m (z 86) bzw. 38 m (z 104)
const WEG3_ZURUECK = { z: Z(80), r: 5 };
const WEG3_AUS = { anfang: 0.16, ende: 0.3 };
// Gasse und Aeste erst ~10 m hinter Joshi (Live-Pruefung: sonst hing die Kamera hinter ihm in den Aesten); Weglaenge ~92 m
const WEG3_GASSE = { von: 0.2, bis: 0.92 };
story.hoehle = { insel: INSEL_R, start: START, eingang: HOEHLE, piste: PISTE, mustang: MUSTANG };
story.etappeR = Object.assign(story.etappeR || {}, { 2: INSEL_R, 3: INSEL_R });   // insel.js: Radius je Etappe
story.etappeMitte = Object.assign(story.etappeMitte || {}, { 2: { x: 0, z: MITTE_Z }, 3: { x: 0, z: MITTE_Z } });   // ... und Mitte

const TEXT_ANKUNFT = ['Du bist auf der anderen Seite des Waldes. Da vorne im Berg ist eine Höhle.',
  'Dort wohnt bestimmt der Gorilla. Hörst du ihn?'];
const TEXT_HINWEIS = ['Geh doch mal zur Höhle im Berg. Dort wohnt der Gorilla.'];

// ---- Licht: spaeter Nachmittag (Live-Wunsch 21.10.2026) -----------------------------------------
// Sonne tief im Westen (links hinten, ueber der Piste), warm; Streulicht gedaempft, Himmel zum Abend hin warm-blass.
const LICHT = { hemi: 0.5, sonne: 0.78, sonnePos: new THREE.Vector3(-320, 120, -60), sonneFarbe: new THREE.Color(0xffc690),
  himmel: new THREE.Color(0xc9b7a6), nebel: new THREE.Color(0xc8b0a0), nebelNah: 90, nebelFern: 650 };

// ---- Katalog -----------------------------------------------------------------------------------
// Fels: unregelmaessiger Brocken (Ikosaeder, Ecken versetzt), grau; oben etwas Schnee, an den Seiten Moos (Vertexfarben:
// je Ecke nach Lage und Zufall). Ein Mesh je Brocken. Grenze: in Scheiben (objekte.js) – folgt der Form.
function steinFarben(geo, rnd, schneeAb, moos){
  const p = geo.attributes.position, n = p.count, col = new Float32Array(n * 3), v = new THREE.Vector3();
  const fels = [new THREE.Color(0x7d7a74), new THREE.Color(0x6b6a66), new THREE.Color(0x8a857c)], schnee = new THREE.Color(0xeef1f4);
  const mo = [new THREE.Color(0x58693e), new THREE.Color(0x4a5c36)], c = new THREE.Color();
  geo.computeBoundingBox(); const h = geo.boundingBox.max.y - geo.boundingBox.min.y;
  for(let i = 0; i < n; i += 3){                                   // je Dreieck (nicht indiziert) eine Farbe – Low-Poly-Facetten
    v.fromBufferAttribute(p, i); const k = (v.y - geo.boundingBox.min.y) / h, r = rnd();
    if(k > schneeAb && r < 0.75) c.copy(schnee);
    else if(k < 0.55 && r < moos) c.copy(mo[Math.floor(rnd() * 2)]);
    else c.copy(fels[Math.floor(rnd() * 3)]);
    for(let j = 0; j < 3; j++) col.set([c.r, c.g, c.b], (i + j) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
const felsMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
function baueBrocken(p){
  let s = p.seed || 1; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let geo = new THREE.IcosahedronGeometry(1, p.fein ? 2 : 1).toNonIndexed();
  const pos = geo.attributes.position, v = new THREE.Vector3(), merk = new Map();
  for(let i = 0; i < pos.count; i++){ v.fromBufferAttribute(pos, i);
    const key = v.x.toFixed(3) + ',' + v.y.toFixed(3) + ',' + v.z.toFixed(3);   // gleiche Ecke = gleicher Versatz (keine Risse)
    if(!merk.has(key)) merk.set(key, 0.78 + rnd() * 0.42);
    v.multiplyScalar(merk.get(key)); pos.setXYZ(i, v.x, Math.max(-0.35, v.y), v.z); }
  geo.scale(p.sx, p.sy, p.sz); geo.translate(0, p.sy * 0.35, 0); geo.computeVertexNormals();
  steinFarben(geo, rnd, p.schneeAb === undefined ? 0.72 : p.schneeAb, p.moos === undefined ? 0.22 : p.moos);
  const m = new THREE.Mesh(geo, felsMat); m.castShadow = true; m.receiveShadow = true;
  const g = new THREE.Group(); g.add(m); return g;
}
story.typ('felsbrocken', { bau: (p) => baueBrocken(p) });

// Hoehleneingang: Felsbogen (zwei Pfeiler, ein Sturz aus Brocken) um die Oeffnung. Live-Wunsch 22.10.2026: "von aussen
// muesste man etwas in der Hoehle sehen – das Feuer im Hintergrund und etwas Boden, das schwarze Loch ist kaum zu
// erkennen": hinter der Oeffnung eine kurze Roehre in den Berg (Felswaende, Erdboden, Decke), die ins Dunkle laeuft, ganz
// hinten ein warmer Feuerschein, der den Boden davor anleuchtet. Alles unbeleuchtet (Basic, Farbverlauf in der Textur) –
// das Licht der Szene (Abend, Sonne von hinten links) kaeme so nicht hinein.
const TIEF = 14;                                       // m Roehre hinter der Oeffnung
function verlaufTex(farbe, hell, dunkel, flecken){
  // laengs: vorn (v = 1) hell, hinten (v = 0) dunkel; quer leichte Flecken
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,' + (1 - dunkel) + ')'); gr.addColorStop(1, 'rgba(0,0,0,' + (1 - hell) + ')');
  g.fillStyle = farbe; g.fillRect(0, 0, 64, 256);
  let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < flecken; i++){ g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.08)'; g.fillRect(rnd() * 64, rnd() * 256, 2 + rnd() * 5, 2 + rnd() * 5); }
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  return new THREE.CanvasTexture(c);
}
function baueEingang(){
  const g = new THREE.Group(), B = HOEHLE.B, H = HOEHLE.H;
  const basic = (tex, extra) => Object.assign(new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }), extra || {});
  const fels = basic(verlaufTex('#5d574f', 0.85, 0.25, 260)), erde = basic(verlaufTex('#5a4a38', 0.9, 0.3, 400));
  // Boden: flache Flaeche von der Oeffnung nach hinten (-z), knapp ueber dem Gras
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(B * 0.95, TIEF), erde);
  boden.rotation.x = -Math.PI / 2; boden.position.set(0, 0.03, -TIEF / 2 - 0.4); boden.userData.keinKoerper = true; g.add(boden);
  // Waende und Decke: eine Halbroehre (Zylinder halb), die nach hinten enger wird
  const roehre = new THREE.CylinderGeometry(B / 2, B / 2 * 0.7, TIEF, 18, 1, true, -Math.PI / 2, Math.PI);
  roehre.rotateX(Math.PI / 2); roehre.scale(1, H / (B / 2), 1);
  const rm = new THREE.Mesh(roehre, fels); rm.position.set(0, 0, -TIEF / 2 - 0.4); rm.userData.keinKoerper = true; g.add(rm);
  // die UVs des Zylinders laufen laengs entlang v: vorn hell, hinten dunkel (wie beim Boden)
  // Rueckwand: dunkel
  const rueck = new THREE.Mesh(new THREE.CircleGeometry(B / 2 * 0.72, 18, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x0b0806 }));
  rueck.scale.y = H / (B / 2); rueck.position.set(0, 0, -TIEF - 0.35); rueck.userData.keinKoerper = true; g.add(rueck);
  // Feuerschein ganz hinten: warmer, weicher Fleck an der Rueckwand und ein Lichtkegel auf dem Boden davor
  const c = document.createElement('canvas'); c.width = c.height = 128; const cg = c.getContext('2d'), rg = cg.createRadialGradient(64, 64, 2, 64, 64, 64);
  rg.addColorStop(0, 'rgba(255,190,90,0.95)'); rg.addColorStop(0.3, 'rgba(255,140,40,0.55)'); rg.addColorStop(1, 'rgba(255,120,30,0)');
  cg.fillStyle = rg; cg.fillRect(0, 0, 128, 128); const glutTex = new THREE.CanvasTexture(c);
  const glut = new THREE.Mesh(new THREE.PlaneGeometry(B * 0.9, H * 0.8), new THREE.MeshBasicMaterial({ map: glutTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glut.position.set(-B * 0.12, H * 0.25, -TIEF - 0.2); glut.userData.keinKoerper = true; glut.renderOrder = 2; g.add(glut);
  const schein = new THREE.Mesh(new THREE.PlaneGeometry(B * 0.9, TIEF * 0.55), new THREE.MeshBasicMaterial({ map: glutTex, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending }));
  schein.rotation.x = -Math.PI / 2; schein.position.set(-B * 0.08, 0.05, -TIEF * 0.78); schein.userData.keinKoerper = true; schein.renderOrder = 2; g.add(schein);
  // drei kleine Flammen (flackern in updateE3)
  const fl = new THREE.Group(); fl.position.set(-B * 0.12, 0, -TIEF + 0.6); g.add(fl);
  for(let i = 0; i < 3; i++){ const f = new THREE.Mesh(new THREE.ConeGeometry(0.22 - i * 0.04, 0.8 - i * 0.15, 6), new THREE.MeshBasicMaterial({ color: i ? 0xffc85a : 0xff8a2a, transparent: true, opacity: 0.9 }));
    f.position.set((i - 1) * 0.22, 0.38, (i % 2) * 0.1); f.userData.keinKoerper = true; fl.add(f); }
  g.userData.flammen = fl; g.userData.glut = [glut, schein];
  // weicher Rand am Fels (vorn): Dunkel blendet nach aussen aus, damit die Roehre nicht wie ausgeschnitten wirkt
  const rc = document.createElement('canvas'); rc.width = 128; rc.height = 64; const rcg = rc.getContext('2d');
  const gr = rcg.createRadialGradient(64, 64, 34, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.75, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  rcg.fillStyle = gr; rcg.fillRect(0, 0, 128, 64);
  const rand = new THREE.Mesh(new THREE.PlaneGeometry(B * 1.5, H * 1.25), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(rc), transparent: true, depthWrite: false }));
  rand.position.set(0, H * 0.62, 0.15); rand.userData.keinKoerper = true; rand.renderOrder = 2; g.add(rand);
  hw.eingang = g;
  return g;
}
story.typ('hoehleneingang', { bau: () => baueEingang() });

// ---- Bauen -------------------------------------------------------------------------------------
const hw = { gebaut: false, t: 0, angekommen: false, brumm: 0, mustang: null };
function baue(){
  if(hw.gebaut) return; hw.gebaut = true;
  const w = story.welt(3);
  // Freiraum vor und ueber der Roehre am Eingang (Live-Befund 22.10.2026: die breiten Bergbrocken – bis 50 m, ihre Mitte
  // weit daneben – ragten ueber die Oeffnung): reicht ein Brocken der Bergreihen in diesen Kasten, wird er seitlich so
  // gekuerzt, dass sein Rand ausserhalb bleibt (die Brocken sind um ihre Mitte gebaut, Breite sx)
  const FREI = { x0: HOEHLE.x - HOEHLE.B / 2 - 1.5, x1: HOEHLE.x + HOEHLE.B / 2 + 1.5, z0: HOEHLE.z - TIEF - 4, z1: HOEHLE.z + 6 };
  const bergBrocken = (o) => {
    const halb = o.sx * 1.2, tief = o.sz * 1.2;                    // Brocken: Ecken bis ~1,2 x versetzt
    if(o.z + tief < FREI.z0 || o.z - tief > FREI.z1 || o.x + halb < FREI.x0 || o.x - halb > FREI.x1) return story.setze('felsbrocken', 3, o);
    if(o.x >= FREI.x0 && o.x <= FREI.x1) return null;              // Mitte im Freiraum: weg
    const rand = o.x < FREI.x0 ? FREI.x0 : FREI.x1, sx = Math.abs(o.x - rand) / 1.2;
    if(sx < 3) return null;
    return story.setze('felsbrocken', 3, Object.assign({}, o, { sx }));
  };
  // Berg: viele Brocken entlang des Rueckens, vorn kleiner (Fuss), hinten gross und hoch; um den Eingang ein Bogen
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 46; i++){
    const u = i / 45, x = BERG.links + u * (BERG.rechts - BERG.links) + (rnd() - 0.5) * 8;
    // Hoehe: ueber der Hoehle der Gipfel, nach rechts lang auslaufend, links steil endend
    const nahGipfel = Math.exp(-Math.pow((x - HOEHLE.x - 12) / 34, 2));
    const hoch = (BERG.hoch * (0.55 + 0.45 * Math.sin(Math.min(1, u * 1.3) * Math.PI * 0.9)) + (BERG.gipfel - BERG.hoch) * nahGipfel) * (0.85 + rnd() * 0.3);
    // hintere Reihe: gross und hoch (Schnee nur oben), mittlere Reihe als Flanke
    bergBrocken({ x, z: BERG.z - 22 - rnd() * 14, sx: 24 + rnd() * 12, sy: hoch, sz: 26 + rnd() * 10, seed: 100 + i, schneeAb: 0.7, moos: 0.1, fest: true });
    // mittlere Reihe: nicht ueber der Roehre hinter dem Eingang (baueEingang, TIEF m) – sonst verdeckte sie die Oeffnung
    bergBrocken({ x: x + (rnd() - 0.5) * 6, z: BERG.z - 2 - rnd() * 6, sx: 16 + rnd() * 8, sy: hoch * 0.5, sz: 16 + rnd() * 6, seed: 700 + i, schneeAb: 0.8, moos: 0.2, fest: true });
    // vordere Reihe: der Fuss, niedriger, mehr Moos – nicht vor dem Eingang
    bergBrocken({ x, z: BERG.z + 14 + rnd() * 6, sx: 9 + rnd() * 6, sy: 6 + rnd() * 8, sz: 9 + rnd() * 5, seed: 300 + i, schneeAb: 0.85, moos: 0.35, fest: true });
  }
  // Bogen um den Eingang: zwei Pfeiler und ein Sturz, darueber ein grosser Brocken
  story.setze('hoehleneingang', 3, { x: HOEHLE.x, z: HOEHLE.z, fest: true });
  // Masse am Bogen von 4,2 m Breite gemessen, mit der Breite mitgewachsen (kb: quer, kh: hoch)
  const kb = HOEHLE.B / 4.2, kh = HOEHLE.H / 3.4;
  // Brocken 14 (ueber der Roehre) sitzt auf ihrer Decke statt im Boden – sonst fuellte er die Roehre aus. 17/18: Fels links
  // und rechts der Roehre (ihre Seitenwaende sollen nicht frei in der Luft stehen)
  for(const [dx, dz, sx, sy, sz, sd] of [[-4.1, -1.2, 2.4, 5.5, 3.0, 11], [4.2, -1.1, 2.6, 5.8, 3.2, 12], [0, -1.8, 6.8, 2.4, 3.4, 13], [0, -9, 11, 10, 14, 14], [0, -20, 14, 30, 16, 19], [-6.0, -3, 4.5, 7, 5, 15], [6.2, -3.2, 4.8, 7.5, 5, 16], [-6.0, -10, 5, 8, 14, 17], [6.0, -10, 5, 8, 14, 18]])
    // seitliche Brocken (15–18) stehen ausserhalb der Oeffnung: Abstand ab ihrem Rand (HOEHLE.B / 2 + halbe Brockenbreite)
    story.setze('felsbrocken', 3, { x: HOEHLE.x + (sd >= 15 ? Math.sign(dx) * (HOEHLE.B / 2 + sx * 0.55 + Math.abs(dx) - 4.2) : dx * kb), z: HOEHLE.z + dz, y: ISLAND_Y + (sd === 13 ? HOEHLE.H - 0.6 : sd === 14 ? HOEHLE.H * 0.9 : sd === 19 ? HOEHLE.H * 1.1 : 0), sx: sx * (sd === 13 || sd === 14 ? kb : 1), sy: sy * (sd === 11 || sd === 12 ? kh : 1), sz, seed: sd, schneeAb: 0.75, moos: 0.3, fest: true });
  // ein paar lose Steine vor dem Eingang
  for(let i = 0; i < 9; i++){ const a = rnd() * Math.PI - Math.PI, r = 4 + rnd() * 6;
    if(Math.abs(Math.cos(a) * r * 1.4) < HOEHLE.B / 2 + 1) continue;   // vor dem Loch frei
    story.setze('felsbrocken', 3, { x: HOEHLE.x + Math.cos(a) * r * 1.4, z: HOEHLE.z + 4 + Math.abs(Math.sin(a)) * r, sx: 0.4 + rnd() * 0.7, sy: 0.3 + rnd() * 0.5, sz: 0.4 + rnd() * 0.6, seed: 500 + i, schneeAb: 0.7, moos: 0.4 }); }
  // Piste: Schotterbahn mit Randmarken
  w.add(bauePiste());
  // Wald: hinter Joshi (der Waldausgang, dicht – Live-Wunsch 22.10.2026), links hinter der Piste und um ihr Ende, rechts
  // neben dem Berg; zwei Tannen am Eingang
  const baeume = [];
  const frei = (x, z) => {
    if(abstandPiste(x, z) < PISTE.B / 2 + 4) return false;                                                // Piste mit Waldsaum (eigene Reihen)
    if(z < BERG.z + 22 && x > BERG.links - 6 && x < BERG.rechts + 6) return false;                         // Berg
    if(Math.hypot(x - START.x, z - START.z) < 9) return false;                                            // Joshis Platz
    if(z > START.z - 4 && Math.abs(x - START.x) < 9) return false;                                         // der Waldweg (eigene Gasse)
    if(Math.abs(x - START.x) < 7 && z < START.z && z > HOEHLE.z) return false;                             // Blick zur Hoehle frei
    if(x > -70 && x < 18 && z > HOEHLE.z + 8 && z < WALDRAND.z - 3) return false;                           // Wiese vor Joshi bis zur Mustang frei
    if(Math.hypot(x - MUSTANG.x, z - MUSTANG.z) < 14) return false;
    if(Math.hypot(x, z) < E2_WALD + 2) return false;                                                       // dort steht der Wald der Lichtung
    return true;
  };
  for(let i = 0; i < 9000 && baeume.length < 620; i++){
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * INSEL_R * 0.95, x = Math.cos(a) * r, z = MITTE_Z + Math.sin(a) * r;
    // nur dort, wo Wald sein soll: hinter Joshi (Sueden), links hinter der Piste, rechts neben/hinter dem Berg
    const wald = z > WALDRAND.z - 4 || x < -70 || (x < BERG.links - 4 && z < PISTE.z) || x > BERG.rechts - 30 || (x > 18 && z > BERG.z + 22 && z < PISTE.z);
    if(!wald || !frei(x, z)) continue;
    const eng = z > WALDRAND.z ? 2.3 : 3.6;                         // hinter Joshi dicht an dicht
    if(baeume.some(b => Math.hypot(b.x - x, b.z - z) < eng)) continue;
    baeume.push({ x, z });
    story.setze('tanne', 3, { x, z, h: 7 + rnd() * 7, farbe: Math.floor(rnd() * 3), dreh: rnd() * 6.3, dunkel: z > WALDRAND.z && Math.abs(x) < 20, schmal: z > WALDRAND.z && Math.abs(x) < 20, fest: true });
  }
  // Waldpiste: die Piste fuehrt in den Wald – je Seite zwei, drei dichte Reihen bis knapp an die Fluegelspitzen der Mustang
  // (Spannweite 11 m, Rollen ohne Anstossen). Am Ostende (bei der Mustang) offen: dort liegt sie an der Wiese, Joshi sieht
  // sie vom Waldausgang aus; zur Wiese hin (Sueden) erst weiter hinten
  const PIST_AB = PISTE.B / 2 + 3.2;
  for(let x = PISTE.x - PISTE.L / 2 + 4; x <= PISTE.x + PISTE.L / 2 - 4; x += 3.6) for(const seite of [-1, 1]) for(let reihe = 0; reihe < 3; reihe++){
    if(x > MUSTANG.x - 20) continue;                               // um die Mustang frei
    if(seite > 0 && x > -75) continue;                             // Suedseite: vorn Wiese
    const z = PISTE.z + seite * (PIST_AB + reihe * 3.3 + rnd() * 1.2), xx = x + (rnd() - 0.5) * 2 + reihe * 1.6;
    story.setze('tanne', 3, { x: xx, z, h: 9 + rnd() * 6, farbe: Math.floor(rnd() * 3), dreh: rnd() * 6.3, fest: true });
  }
  // der Waldausgang: der Waldrand selbst – eine dichte Reihe links und rechts vom Ausgang, quer (Joshi steht an der Luecke)
  for(let i = 0; i < 40; i++) for(const seite of [-1, 1]){
    const x = START.x + seite * (5 + i * 2.6 + rnd() * 1.0), z = WALDRAND.z - 2 + rnd() * 3;
    if(Math.abs(x - START.x) < 9) continue;                              // der Waldweg
    story.setze('tanne', 3, { x, z, h: 9 + rnd() * 5, farbe: Math.floor(rnd() * 3), dreh: rnd() * 6.3, fest: true });
  }
  // ganz hinten (Live-Wunsch 22.10.2026: "in Richtung Wald nicht das Meer sehen"): eine Waldkulisse rund um die Insel –
  // ein Band aus Tannensilhouetten kurz vor dem Ufer, dunkelgruen, im Dunst. Deko (keine Grenze), ein Zeichenaufruf.
  w.add(waldKulisse());
  if(story.waldweg) story.waldweg({ welt: 3, linie: WEG3, aus: WEG3_AUS, von: WEG3_GASSE.von, bis: WEG3_GASSE.bis, rnd,
    weit: (u) => Math.max(0, 1 - (u - WEG3_GASSE.von) / 0.12) * 1.6 });   // am Ausgang etwas weiter (Kamera)
  for(const [x, z] of [[HOEHLE.x - 9, HOEHLE.z + 5], [HOEHLE.x + 9.5, HOEHLE.z + 4.5]]) story.setze('tanne', 3, { x, z, h: 6.5, farbe: 1, fest: true });
  // Dunst im Waldweg hinter Joshi (wie am Eingang auf der Waldinsel): schon von der Wiese aus etwas neblig
  if(story.waldNebel) hw.nebel = story.waldNebel({ welt: 3, linie: WEG3, von: WEG3_GASSE.von + 0.04, bis: WEG3_GASSE.bis, farbe: 0xb9a596 });
  if(story.tannenZusammen) story.tannenZusammen(3);
  // (Hoehleneingang: kein Y – Joshi geht durch das schwarze Loch hinein, hoehle_innen.js)
}
function bauePiste(){
  const g = new THREE.Group(); g.userData.begehbar = true;
  const c = document.createElement('canvas'); c.width = 64; c.height = 512; const cg = c.getContext('2d');
  // Wald-Schotterpiste (Live-Hinweis 21.10.2026): grauer Schotter, zwei dunklere Fahrspuren, ein paar Pfuetzen, an den
  // Raendern Gras und Schnee, die weich in den Weg laufen
  cg.fillStyle = '#857a6c'; cg.fillRect(0, 0, 64, 512);
  let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 3200; i++){ cg.fillStyle = rnd() < 0.5 ? 'rgba(100,92,80,.6)' : 'rgba(165,156,140,.5)'; cg.fillRect(rnd() * 64, rnd() * 512, 1 + rnd() * 2, 1 + rnd() * 2); }
  for(const x of [18, 46]){ cg.fillStyle = 'rgba(80,70,58,.35)'; cg.fillRect(x - 4, 0, 8, 512); }               // Fahrspuren
  for(let i = 0; i < 6; i++){ cg.fillStyle = 'rgba(70,82,96,.55)'; cg.beginPath(); cg.ellipse(14 + rnd() * 36, rnd() * 512, 4 + rnd() * 5, 8 + rnd() * 14, 0, 0, 7); cg.fill(); }   // Pfuetzen
  for(const [x0, x1] of [[0, 9], [55, 64]]){ const gr = cg.createLinearGradient(x0, 0, x1, 0);                     // Gras/Schnee am Rand
    gr.addColorStop(x0 ? 0 : 1, 'rgba(120,128,96,0)'); gr.addColorStop(x0 ? 1 : 0, 'rgba(160,166,140,.9)'); cg.fillStyle = gr; cg.fillRect(x0, 0, x1 - x0, 512); }
  for(let i = 0; i < 70; i++){ cg.fillStyle = 'rgba(232,234,238,.45)'; cg.beginPath(); cg.ellipse(rnd() < 0.5 ? rnd() * 6 : 58 + rnd() * 6, rnd() * 512, 1 + rnd() * 2.5, 2 + rnd() * 5, 0, 0, 7); cg.fill(); }   // Schneereste am Rand
  const t = new THREE.CanvasTexture(c); t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 12);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(PISTE.B, PISTE.L), new THREE.MeshLambertMaterial({ map: t, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
  m.rotation.set(-Math.PI / 2, 0, Math.PI / 2); m.position.set(PISTE.x, ISLAND_Y + 0.03, PISTE.z); m.renderOrder = 2; g.add(m);   // laengs x
  return g;
}
// Waldkulisse: ein offener Zylinder (r kurz vor dem Ufer) mit einer Textur aus Tannenspitzen – unten dicht, oben gezackt
function waldKulisse(){
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128; const g = c.getContext('2d');
  let s = 77; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.fillStyle = '#1f3a2a'; g.fillRect(0, 70, 1024, 58);
  for(let x = -10; x < 1034; x += 9 + rnd() * 8){ const h = 40 + rnd() * 55, b = 9 + rnd() * 7; g.fillStyle = rnd() < 0.5 ? '#1f3a2a' : '#25432f';
    g.beginPath(); g.moveTo(x, 128 - h - 10); g.lineTo(x - b, 80); g.lineTo(x + b, 80); g.fill(); g.fillRect(x - b, 78, 2 * b, 50); }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(14, 1);
  // um die Inselmitte; zur Lichtung (Sueden, +z, Winkel 0) offen – dort steht der echte Wald der Lichtung und der Strand
  const R = INSEL_R * 0.93, H = 22, offen = 0.75;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 96, 1, true, offen, Math.PI * 2 - 2 * offen), new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide }));
  m.position.set(0, ISLAND_Y + H / 2 - 0.5, MITTE_Z); m.userData.deko = true; return m;
}
// Mustang = das Flugzeug der Engine (wie in Trip to Japan): aktuelles Modell, geparkt am Ostende der Piste, Joshi steht
// als Figur daneben (eva.planeAt). Einsteigen mit Y erst, wenn der Gorilla sie geliehen hat (e3MustangFrei) – vorher kein Y.
// Grenze (Live-Befund 22.10.2026: "ich kann durch das Flugzeug durchlaufen"): das Modell wird wie jedes Objekt angemeldet
// (objekte.js, in seiner Form) – nur solange Joshi zu Fuss ist; im Flug ist sie aus (sonst stiesse die Mustang an sich
// selbst). Nach jedem Neubau des Modells (Parken, Absturz) neu angemeldet.
function mustangParken(){
  if(typeof MODEL_NAMES === 'undefined') return;
  const idx = MODEL_NAMES.indexOf('Mustang'); if(idx < 0) return;
  currentModel = idx; buildModel('Mustang'); spec = PLANE_SPECS.Mustang || DEFAULT_SPEC;
  state.pos.set(MUSTANG.x, ISLAND_Y, MUSTANG.z);
  state.quat.setFromEuler(new THREE.Euler(0, MUSTANG_YAW, 0, 'YXZ'));
  state.vel.set(0, 0, 0); state.throttle = 0; state.onGround = true; state.crashed = false; state.falling = false;
  planeGroup.position.copy(state.pos); planeGroup.quaternion.copy(state.quat);
  if(eva) eva.planeAt = new THREE.Vector3(state.pos.x, state.pos.y, state.pos.z);
  hw.mustang = planeGroup; hw.mustangNeu = true;
}
function mustangGrenze(){
  if(hw.mustangNeu){
    let n = 0; modelHolder.traverse(o => { if(o.isMesh) n++; }); if(!n) return;   // Modell noch nicht geladen
    hw.mustangNeu = false;
    if(hw.mustangDing){ const i = story.dinge.indexOf(hw.mustangDing); if(i >= 0) story.dinge.splice(i, 1); }   // nur die Grenze, das Modell bleibt
    planeGroup.updateMatrixWorld(true);
    hw.mustangDing = story.ding(modelHolder, { welt: 3, typ: 'mustang', beweglich: true });
  }
  if(hw.mustangDing) hw.mustangDing.aus = !eva || !!(story.innen && story.innen.drin);
}
// Y ueber der Mustang, sobald Joshi nah genug ist (evaCanBoard) und sie geliehen ist – wie das Y am Boot
let yTex = null;
function yZeichen(){
  if(!yTex){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(64, 68, 56, 0, 7); g.fill();
    g.fillStyle = '#f5c518'; g.beginPath(); g.arc(64, 62, 54, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.stroke();
    g.fillStyle = '#1a1a1a'; g.font = 'bold 76px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Y', 64, 66);
    yTex = new THREE.CanvasTexture(c); }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: yTex, depthTest: false, transparent: true })); sp.scale.setScalar(0.8); sp.renderOrder = 999; sp.userData.deko = true; return sp;
}
function updateMustangY(){
  const zeigen = !!(eva && story.e3MustangFrei && !eva.boat && !(story.innen && story.innen.drin) && evaCanBoard() && !(story.pause && story.pause()));
  if(zeigen && !hw.y){ hw.y = yZeichen(); story.welt(3).add(hw.y); }
  if(!hw.y) return;
  hw.y.visible = zeigen;
  if(zeigen) hw.y.position.set(state.pos.x, ISLAND_Y + 4.4 + Math.sin(hw.t * 3) * 0.08, state.pos.z);
}

// ---- Brummen aus der Hoehle -------------------------------------------------------------------------------------
// Joshi naeher als BRUMM_R: alle 7-12 s. Der Ton: "silverback gorilla roar" von flutie8211 (Pixabay, gorilla_snd.js) –
// leise und etwas tiefer abgespielt, damit es traurig klingt und nicht wild; dumpf (Tiefpass), es kommt aus der Hoehle.
// Fehlt der Ton: selbst erzeugtes Brummen (zwei tiefe, fallende Toene).
const BRUMM_R = 40, BRUMM_VOL = 0.28;
let gorillaBuf = null, gorillaLaedt = false;
function gorillaLaden(){ if(gorillaBuf || gorillaLaedt || !window.GORILLA_SND || typeof decodeSound !== 'function' || !audioCtx) return; gorillaLaedt = true;
  decodeSound(window.GORILLA_SND).then(b => { gorillaBuf = b; }).catch(e => console.warn('Gorilla-Ton', e)); }
function brummen(){
  if(!soundOn || !audioCtx || audioCtx.state !== 'running') return;
  gorillaLaden();
  if(gorillaBuf){
    const q = audioCtx.createBufferSource(), g = audioCtx.createGain(), lp = audioCtx.createBiquadFilter();
    q.buffer = gorillaBuf; q.playbackRate.value = 0.78 + Math.random() * 0.08;
    lp.type = 'lowpass'; lp.frequency.value = 900;
    const p = eva && eva.group.position, d = p ? Math.hypot(p.x - HOEHLE.x, p.z - HOEHLE.z) : 20;
    g.gain.value = BRUMM_VOL * Math.max(0.35, 1 - d / BRUMM_R);       // naeher = lauter
    q.connect(lp).connect(g).connect(audioCtx.destination); q.start();
    return;
  }
  const t = audioCtx.currentTime, d = 1.8 + Math.random() * 0.6, g = audioCtx.createGain(), lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.7;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.35); g.gain.setValueAtTime(0.18, t + d - 0.6); g.gain.linearRampToValueAtTime(0, t + d);
  const f0 = 92 + Math.random() * 14;
  for(const [typ, k, v] of [['sawtooth', 1, 0.5], ['sine', 0.5, 1]]){
    const o = audioCtx.createOscillator(), og = audioCtx.createGain(); o.type = typ;
    o.frequency.setValueAtTime(f0 * k * 1.06, t); o.frequency.linearRampToValueAtTime(f0 * k * 0.86, t + d);   // faellt: traurig
    og.gain.value = v; o.connect(og).connect(lp); o.start(t); o.stop(t + d + 0.05);
  }
  lp.connect(g); g.connect(audioCtx.destination);
}
// Wieder draussen braucht es das Bruellen nicht mehr (Live-Wunsch 22.10.2026): nach dem ersten Besuch in der Hoehle ist Schluss
const warDrin = () => !!(story.hoehleInnen && story.hoehleInnen.warDrin);
function brummTakt(){ story.spaeter(7 + Math.random() * 5, () => { if(!e3() || warDrin()) return;
  const p = eva && eva.group.position; if(p && !(story.innen && story.innen.drin) && Math.hypot(p.x - HOEHLE.x, p.z - HOEHLE.z) < BRUMM_R) brummen(); brummTakt(); }); }

// ---- Ankunft --------------------------------------------------------------------------------------------------
function setzeStart(){
  if(!eva) return;
  const { x, z } = story.freierPlatz(START.x, START.z, 'joshi');
  eva.group.position.set(x, evaFootY(x, z), z); eva.vy = 0;
  eva.yaw = Math.atan2(x - START.blick.x, z - START.blick.z); eva.group.rotation.y = eva.yaw;
  if(typeof evaOrbit !== 'undefined'){ evaOrbit = 0; evaPitch = 0; }
  eva.planeAt = new THREE.Vector3(MUSTANG.x, ISLAND_Y, MUSTANG.z);
  const back = new THREE.Vector3(Math.sin(eva.yaw), 0, Math.cos(eva.yaw));
  camera.position.copy(eva.group.position).addScaledVector(back, 5).add(new THREE.Vector3(0, 2, 0));
  if(story.fuchsAbsetzenAuf) story.fuchsAbsetzenAuf({ x: x + 1.3, z: z - 0.6, blick: eva.yaw + Math.PI, modus: 'streifen', sitzt: false, warte: 1 });
}
function los(){ if(hw.angekommen) return; hw.angekommen = true;
  story.spaeter(1.2, () => story.sprich(TEXT_ANKUNFT)); story.spaeter(4, () => brummen()); brummTakt(); }
// (danach einmal vorwaermen – sonst ruckelte es beim ersten Einsteigen in die Mustang: Engine szeneVorwaermen)
story.e3StartSzene = function(){ story.e3Besucht = true; if(story.standSetzen) story.standSetzen('e3Besucht', true); baue(); if(story.e2Bauen) story.e2Bauen(); mustangParken(); setzeStart(); story.spaeter(0.3, () => { if(typeof szeneVorwaermen === 'function') szeneVorwaermen(); }); };
story.e3Los = los;
// Vom Waldweg der Waldinsel (globus.js, im Schwarzen): umschalten ohne Neuladen
story.e3Wechsel = function(){
  story.etappe = 3; story.ziel = null; story.e3Besucht = true; if(story.standSetzen) story.standSetzen('e3Besucht', true);
  if(story.etappeWechsel) story.etappeWechsel(3);
  hookTag(); baue(); if(story.e2Bauen) story.e2Bauen(); mustangParken(); setzeStart(); los();
};
story.e3Hinweis = () => TEXT_HINWEIS;                     // hoehle_innen.js ersetzt das (drinnen/draussen, je nach Stand)

// ---- Abflug mit der Mustang (Live-Wunsch: Etappe 3 endet mit dem Flug zum roten Punkt) ---------------------------------
// Ist sie geliehen: Y daneben = einsteigen (Engine evaBoard). Joshi startet selbst (Schub: rechter Stick / W wie im
// Flugspiel). Oben links das Radar mit dem roten Punkt (das Ziel kommt entgegen, wenn er darauf zuhaelt). Am Ziel: Globus
// Richtung Wueste (Etappe 4, folgt). Kein Scheitern: kracht er (Baum, Boden), steht er nach der Loeschsequenz der Engine
// wieder in der Mustang am Pistenanfang.
const TEXT_EINSTEIGEN = ['Steig ein. Mit dem rechten Stick gibst du Gas, mit dem linken lenkst du.'];
const TEXT_FLIEGEN = ['Super, du fliegst! Flieg zum roten Punkt auf dem Radar.'];
const TEXT_NOCHMAL = ['Hoppla! Versuch es gleich noch einmal.'];
const flug = { an: false, gesagt: false, ziel: null, ende: false };
story.e3Fliegt = () => !eva && e3();
story.hoehleFlugZiel = () => flug.ziel;                     // Test
// Radar und Schubbalken wie im Segelboot (Live-Befund 22.10.2026: "sieht nicht so aus wie normal") – segeln.js zeichnet sie,
// hier nur, was sie zeigen: Lage, Kurs (ab +z, Nase der Engine = -z) und das Ziel
const _fe = new THREE.Euler();
story.e3FlugAnzeige = function(){
  if(!e3() || eva || locale !== 'earth' || flug.ende || !story.e3MustangFrei || !flug.ziel) return null;
  _fe.setFromQuaternion(state.quat, 'YXZ');
  return { x: state.pos.x, z: state.pos.z, kurs: _fe.y + Math.PI, ziel: flug.ziel };
};
function updateFlug(dt){
  const fliegt = !eva && locale === 'earth' && !flug.ende;
  if(!fliegt) return;
  if(!flug.ziel) flug.ziel = Object.assign({}, FLUGZIEL);
  if(!flug.gesagt && !state.onGround){ flug.gesagt = true; story.sprich(TEXT_FLIEGEN); }
  // Ziel kommt entgegen (wie das Segelziel): nur wenn die Nase darauf zeigt
  const z = flug.ziel, dx = z.x - state.pos.x, dz = z.z - state.pos.z, d = Math.hypot(dx, dz);
  const vor = new THREE.Vector3(0, 0, -1).applyQuaternion(state.quat), cos = (vor.x * dx + vor.z * dz) / Math.max(1, d) / Math.max(0.01, Math.hypot(vor.x, vor.z));
  const v = state.vel.length();
  if(!state.onGround && cos > 0.75 && d > z.r * 1.5){ const w = Math.min(v * 1.2 * dt, d - z.r); z.x -= dx / d * w; z.z -= dz / d * w; }
  if(d < z.r && !state.onGround){ flug.ende = true; state.throttle = 0; if(story.globusReise) story.globusReise(3, story.e4Wechsel ? () => story.e4Wechsel() : null); }   // Ort 3 = die Wueste (globus.js); weiter ohne Neuladen (wueste.js)
}
function hookFlug(){
  // B im Flug: in Etappe 3 nichts (kein Schleudersitz der Engine – der fuehrerlose Flieger stuerzte ab, und der Pilot blieb
  // am Schirm stehen, waehrend resetPlane ihn wieder in die Mustang setzte). Der Fallschirmsprung kommt in Etappe 4
  // (Konzept: zum Hamster) ueber fallschirm.js (story.fallschirmSprung).
  const bOrig = buttonB;
  buttonB = function(){ if(e3() && !eva) return; return bOrig.apply(this, arguments); };
  // der schmale Schubbalken der Engine (rechts) gehoert nicht ins Geheimland – segeln.js zeigt den eigenen unter dem Radar
  schubBalken = function(){};
  // Einsteigen: erst, wenn der Gorilla die Mustang geliehen hat (vorher passiert bei Y nichts)
  const boardOrig = evaCanBoard;
  evaCanBoard = function(){ if(e3() && !story.e3MustangFrei) return false; return boardOrig.apply(this, arguments); };
  const einOrig = evaBoard;
  evaBoard = function(){ const r = einOrig.apply(this, arguments); if(e3()){ story.sprich(TEXT_EINSTEIGEN); state.throttle = 0; } return r; };
  // in E3 ist die Mustang immer zu sehen (story.js blendet das Flugzeug sonst aus, solange man laeuft – der X-Wing-Anker)
  // Absturz: nach der Loeschsequenz zurueck in die Mustang am Pistenanfang (nicht an den Engine-Startplatz)
  const resetOrig = resetPlane;
  resetPlane = function(){
    if(!e3()) return resetOrig.apply(this, arguments);
    state.crashed = false; state.falling = false; mustangParken(); story.sprich(TEXT_NOCHMAL); snapCamera();
  };
  // Aussteigen geht nur auf der Piste am Boden (sonst saesse Joshi mitten im Wald); im Flug nie
  const exitOrig = evaExit;
  evaExit = function(){ if(e3() && (!state.onGround || abstandPiste(state.pos.x, state.pos.z) > PISTE.B)) return; return exitOrig.apply(this, arguments); };
}
function abstandPiste(x, z){ return Math.max(0, Math.abs(x - PISTE.x) - PISTE.L / 2) + Math.max(0, Math.abs(z - PISTE.z) - PISTE.B / 2); }   // laengs x

// ---- Der Waldweg wird hell, wenn der Gorilla wieder froh ist (Live-Idee 21.10.2026) ----------------------------------------
// Draussen nach dem Gorilla: Schatten und Dunst weg, Licht wie auf der Wiese; die Gasse bleibt, ist aber freundlich. Ohne
// Ansage (Live-Wunsch 22.10.2026: weder zum Weg noch zum Flugzeug – er ist einfach heller)
story.e3Draussen = function(){
  if(!story.e3MustangFrei || hw.hell) return; hw.hell = true;
  story.welt(3).traverse(o => { if(o.isMesh && o.renderOrder === 3 && o.material && o.material.map && o.material.transparent) o.visible = false; });   // der Wegschatten
  if(hw.nebel) hw.nebel.aus();
};

// ---- Jedes Bild ------------------------------------------------------------------------------------------------
// ---- Lichtung <-> Hoehle auf derselben Insel (Live-Wunsch 22.10.2026) -------------------------------------------------
// Wie in die Hoehle oder aus der Huette: kurze Schwarzblende, dann ist Joshi am anderen Ort. Hin beim ersten Mal ueber den
// Globus (waldinsel.js -> globusReise -> e3Wechsel), danach nur die Blende. Zurueck zur Lichtung, wenn der Weg hell ist
// (nach dem Gorilla): am Ende des Waldwegs (WEG3_ZURUECK).
const iw = { t: 0, ziel: 0, gesetzt: false, an: false, el: null };
function inselBlende(w){ if(!iw.el){ iw.el = document.createElement('div'); iw.el.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:25;'; document.body.appendChild(iw.el); } iw.el.style.opacity = String(w); }
story.waldinselWechsel = function(ziel){ if(iw.an || !eva) return; Object.assign(iw, { t: 0, ziel, gesetzt: false, an: true }); };
story.waldinselWechselt = () => iw.an;
(function wechselTakt(){
  requestAnimationFrame(wechselTakt);
  if(!iw.an) return;
  const jetzt = performance.now(); iw.dt = Math.min(0.1, (jetzt - (iw.vor || jetzt)) / 1000); iw.vor = jetzt; iw.t += iw.dt;
  if(iw.t < 0.35){ inselBlende(iw.t / 0.35); return; }
  if(!iw.gesetzt){ iw.gesetzt = true;
    if(iw.ziel === 3){ if(story.e2Voegel) story.e2Voegel(false); story.etappe = 3; story.ziel = null; setzeStart(); }
    else if(story.e2Zurueck) story.e2Zurueck(); }
  inselBlende(Math.max(0, 1 - (iw.t - 0.35) / 0.45));
  if(iw.t > 0.8){ iw.an = false; iw.vor = 0; inselBlende(0); }
})();
// Abstand zum Waldweg dieser Etappe
story.e3Erde = (x, z) => abstandWeg3(x, z) < 1.8 || abstandPiste(x, z) < 0.5;   // Waldweg und Schotterpiste: Erde (Staub, waldinsel.js)
function abstandWeg3(x, z){ let d = Infinity; for(let i = 0; i + 1 < WEG3.length; i++){ const a = WEG3[i], b = WEG3[i + 1], dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz;
  const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2)); d = Math.min(d, Math.hypot(x - a.x - dx * t, z - a.z - dz * t)); } return d; }
function waldwegZurueck(){
  if(!eva || eva.boat || iw.an || (story.innen && story.innen.drin)) return;
  const p = eva.group.position, amWeg = abstandWeg3(p.x, p.z) < 5;
  // nicht in den Wald der Lichtung hinueber (er ist von hier aus nicht gebaut zu sehen): nur ueber den Waldweg
  if(p.z > WALDRAND.z + 6 && !amWeg){ p.z = WALDRAND.z + 6; }
  if(hw.hell && amWeg && p.z > WEG3_ZURUECK.z){
    if(story.aktionLaeuft && story.aktionLaeuft()) p.z = WEG3_ZURUECK.z;       // waehrend einer Aktion: nicht weiter (wie eine Wand)
    else story.waldinselWechsel(2); }
}
story.updateE3 = function(dt){
  if(!e3()) return;
  baue(); hw.t += dt;
  waldwegZurueck();
  if(story.gestartet) gorillaLaden();
  if(hw.eingang && hw.eingang.userData.flammen){ const t = hw.t, fl = hw.eingang.userData.flammen;
    fl.children.forEach((f, i) => { f.scale.y = 0.8 + 0.35 * Math.abs(Math.sin(t * (7 + i * 2.3) + i)); f.rotation.z = Math.sin(t * 5 + i) * 0.12; });
    for(const m of hw.eingang.userData.glut) m.material.opacity = (m.material.opacity > 0.7 ? 0.9 : 0.5) + Math.sin(t * 9) * 0.05 + Math.sin(t * 3.3) * 0.04; }
  mustangGrenze(); updateMustangY();
  updateFlug(dt);
};

// ---- Hooks -------------------------------------------------------------------------------------------------------
function hookTag(){ if(!e3()) return; setSky('day'); story.nacht = false; if(typeof starDome !== 'undefined' && starDome) starDome.visible = false; }
function hookLicht(){
  const orig = updateSpaceBlend;
  updateSpaceBlend = function(){
    const r = orig.apply(this, arguments);
    if(e3() && locale === 'earth' && spaceBlend < 0.05){
      hemiLight.intensity = LICHT.hemi; sun.intensity = LICHT.sonne; sun.color.copy(LICHT.sonneFarbe);
      if(eva) sun.position.copy(eva.group.position).add(LICHT.sonnePos);
      scene.background.copy(LICHT.himmel); scene.fog.color.copy(LICHT.nebel); scene.fog.near = LICHT.nebelNah; scene.fog.far = LICHT.nebelFern;
    }
    return r;
  };
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookTag(); hookLicht(); hookFlug(); };
})();
