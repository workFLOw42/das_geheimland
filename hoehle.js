// Das Geheimland – Etappe 3: beim Gorilla, draussen vor der Hoehle (Fall 1 "Das Weihnachtsessen", Konzept Abschnitt 7).
// Laedt nach waldinsel.js, vor der Engine. Aktiv nur, wenn story.etappe === 3 (nach dem Globus vom Waldweg; zum Testen
// Testzugang "E3").
// Die andere Seite der Waldinsel (Konzept): Joshi steht, von hinten gesehen, am Waldausgang. Links die Piste mit der Mustang
// des Gorillas (einsteigen geht noch nicht), hinter der Piste Wald. Vor Joshi der Felsberg mit dem Hoehleneingang; der Berg
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
const START = { x: 0, z: 62, blick: { x: 0, z: 0 } };  // Waldausgang, Blick nach Norden (-z) auf den Berg
const HOEHLE = { x: 0, z: -18, B: 4.2, H: 3.4 };      // Eingang im Fuss des Bergs, Joshi gegenueber
const BERG = { z: -40, links: -22, rechts: 170, hoch: 72, gipfel: 112 };   // links endet er vor der Piste; Gipfel ueber der Hoehle   // Bergruecken: Fuss bei z -10..-25, zieht weit nach rechts (+x)
const PISTE = { x: -42, z: 45, L: 290, B: 12 };        // Wald-Schotterpiste (die Mustang darf auf der ganzen Insel rollen)        // Schotterbahn links, laengs z (von Sueden nach Norden)
// Mustang am Nordende der Piste, Nase nach Sueden: gestartet wird WEG vom Berg (110 m hoch), ueber den Wald zum Meer.
// Vom Waldausgang aus links zu sehen (Sichtlinie durch die Luecke im Waldsaum).
const MUSTANG = { x: -42, z: 30 };                     // vom Waldausgang aus links zu sehen; ~160 m Startstrecke nach Sueden
// Das Ziel (roter Punkt): Richtung Wueste, weit im Suedwesten; kommt entgegen, wenn man darauf zuhaelt (wie beim Segeln)
const FLUGZIEL = { x: -1400, z: 2600, r: 160 };     // am Suedende der Piste geparkt, Nase nach Norden (die Bahn hinauf)
const WALDRAND = { z: 66 };                           // der Wald hinter Joshi (aus ihm kommt er)
// Das Ende des Waldwegs (Live-Wunsch 21.10.2026): derselbe Weg wie auf der Lichtung – dunkle Gasse, Aeste, Schatten, ohne
// Schnee –, hier von Sueden (tief im Wald) bis vor Joshi; vorn laeuft er sanft in die Wiese aus
// Die Linie beginnt vor Joshi (dort waechst er aus der Wiese, waldinsel.js baueWeg: Anfang = schmal und blass) und
// laeuft in den Wald, wo er im Schatten verschwindet.
const WEG3 = [{ x: 0, z: 52 }, { x: 0, z: 64 }, { x: 1, z: 78 }, { x: 2, z: 96 }, { x: -3, z: 118 }, { x: 2, z: 140 }];
const WEG3_AUS = { anfang: 0.16, ende: 0.3 };
// Gasse und Aeste erst ~10 m hinter Joshi (Live-Pruefung: sonst hing die Kamera hinter ihm in den Aesten); Weglaenge ~92 m
const WEG3_GASSE = { von: 0.2, bis: 0.92 };
story.hoehle = { insel: INSEL_R, start: START, eingang: HOEHLE, piste: PISTE, mustang: MUSTANG };
story.etappeR = Object.assign(story.etappeR || {}, { 3: INSEL_R });   // insel.js: Radius je Etappe

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

// Hoehleneingang: Felsbogen (zwei Pfeiler, ein Sturz aus Brocken) um ein dunkles Loch, das in den Berg fuehrt (schwarze,
// unbeleuchtete Flaeche mit weichem Rand – drinnen sieht man nichts). Davor zwei kleine Tannen und Steine.
function baueEingang(){
  const g = new THREE.Group(), B = HOEHLE.B, H = HOEHLE.H;
  // Loch: Halbellipse, nach innen gewoelbt (ein Stueck Rohr, innen schwarz)
  // die Oeffnung: eine schwarze Halbellipse knapp vor dem Fels (der Bogen liegt drumherum) – dahinter ist nichts zu sehen
  const rueck = new THREE.Mesh(new THREE.CircleGeometry(B / 2, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x050403 }));
  rueck.scale.y = H / (B / 2); rueck.position.z = -0.6; rueck.userData.keinKoerper = true; rueck.renderOrder = 1; g.add(rueck);
  // weicher Uebergang am Rand (Dunkel blendet nach aussen aus)
  const c = document.createElement('canvas'); c.width = 128; c.height = 64; const cg = c.getContext('2d');
  const gr = cg.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.7, 'rgba(0,0,0,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  cg.fillStyle = gr; cg.fillRect(0, 0, 128, 64);
  const rand = new THREE.Mesh(new THREE.PlaneGeometry(B * 1.5, H * 1.25), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  rand.position.set(0, H * 0.62, 0.15); rand.userData.keinKoerper = true; rand.renderOrder = 2; g.add(rand);
  return g;
}
story.typ('hoehleneingang', { bau: () => baueEingang() });

// ---- Bauen -------------------------------------------------------------------------------------
const hw = { gebaut: false, t: 0, angekommen: false, brumm: 0, mustang: null };
function baue(){
  if(hw.gebaut) return; hw.gebaut = true;
  const w = story.welt(3);
  // Berg: viele Brocken entlang des Rueckens, vorn kleiner (Fuss), hinten gross und hoch; um den Eingang ein Bogen
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 46; i++){
    const u = i / 45, x = BERG.links + u * (BERG.rechts - BERG.links) + (rnd() - 0.5) * 8;
    // Hoehe: ueber der Hoehle der Gipfel, nach rechts lang auslaufend, links steil endend
    const nahGipfel = Math.exp(-Math.pow((x - HOEHLE.x - 12) / 34, 2));
    const hoch = (BERG.hoch * (0.55 + 0.45 * Math.sin(Math.min(1, u * 1.3) * Math.PI * 0.9)) + (BERG.gipfel - BERG.hoch) * nahGipfel) * (0.85 + rnd() * 0.3);
    // hintere Reihe: gross und hoch (Schnee nur oben), mittlere Reihe als Flanke
    story.setze('felsbrocken', 3, { x, z: BERG.z - 22 - rnd() * 14, sx: 24 + rnd() * 12, sy: hoch, sz: 26 + rnd() * 10, seed: 100 + i, schneeAb: 0.7, moos: 0.1, fest: true });
    story.setze('felsbrocken', 3, { x: x + (rnd() - 0.5) * 6, z: BERG.z - 2 - rnd() * 6, sx: 16 + rnd() * 8, sy: hoch * 0.5, sz: 16 + rnd() * 6, seed: 700 + i, schneeAb: 0.8, moos: 0.2, fest: true });
    // vordere Reihe: der Fuss, niedriger, mehr Moos – nicht vor dem Eingang
    if(Math.abs(x - HOEHLE.x) > 9) story.setze('felsbrocken', 3, { x, z: BERG.z + 14 + rnd() * 6, sx: 9 + rnd() * 6, sy: 6 + rnd() * 8, sz: 9 + rnd() * 5, seed: 300 + i, schneeAb: 0.85, moos: 0.35, fest: true });
  }
  // Bogen um den Eingang: zwei Pfeiler und ein Sturz, darueber ein grosser Brocken
  story.setze('hoehleneingang', 3, { x: HOEHLE.x, z: HOEHLE.z, fest: true });
  for(const [dx, dz, sx, sy, sz, sd] of [[-4.1, -1.2, 2.4, 5.5, 3.0, 11], [4.2, -1.1, 2.6, 5.8, 3.2, 12], [0, -1.8, 6.8, 2.4, 3.4, 13], [0.4, -9, 11, 10, 7, 14], [-7.2, -3, 4.5, 7, 5, 15], [7.5, -3.2, 4.8, 7.5, 5, 16]])
    story.setze('felsbrocken', 3, { x: HOEHLE.x + dx, z: HOEHLE.z + dz, y: ISLAND_Y + (sd === 13 ? HOEHLE.H - 0.6 : 0), sx, sy, sz, seed: sd, schneeAb: 0.75, moos: 0.3, fest: true });
  // ein paar lose Steine vor dem Eingang
  for(let i = 0; i < 9; i++){ const a = rnd() * Math.PI - Math.PI, r = 4 + rnd() * 6;
    if(Math.abs(Math.cos(a) * r * 1.4) < 3) continue;              // vor dem Loch frei
    story.setze('felsbrocken', 3, { x: HOEHLE.x + Math.cos(a) * r * 1.4, z: HOEHLE.z + 4 + Math.abs(Math.sin(a)) * r, sx: 0.4 + rnd() * 0.7, sy: 0.3 + rnd() * 0.5, sz: 0.4 + rnd() * 0.6, seed: 500 + i, schneeAb: 0.7, moos: 0.4 }); }
  // Piste: Schotterbahn mit Randmarken
  w.add(bauePiste());
  // Wald: hinter Joshi (der Waldausgang), hinter der Piste links, rechts neben dem Berg; zwei Tannen am Eingang
  const baeume = [];
  const frei = (x, z) => {
    if(Math.abs(x - PISTE.x) < PISTE.B / 2 + 13 && Math.abs(z - PISTE.z) < PISTE.L / 2 + 10) return false;   // Piste mit Waldsaum (eigene Reihen)
    if(z < BERG.z + 22 && x > BERG.links - 6 && x < BERG.rechts + 6) return false;                         // Berg
    if(Math.hypot(x - START.x, z - START.z) < 9) return false;                                            // Joshis Platz
    if(z > START.z - 4 && Math.abs(x - START.x) < 9) return false;                                         // der Waldweg (eigene Gasse)
    if(Math.abs(x - START.x) < 7 && z < START.z && z > HOEHLE.z) return false;                             // Blick zur Hoehle frei
    if(x > PISTE.x - 2 && x < START.x && z > HOEHLE.z + 10 && z < WALDRAND.z + 2) return false;            // Wiese bis zur Piste frei
    if(Math.hypot(x - MUSTANG.x, z - MUSTANG.z) < 14) return false;
    return true;
  };
  for(let i = 0; i < 6000 && baeume.length < 380; i++){
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * INSEL_R * 0.95, x = Math.cos(a) * r, z = Math.sin(a) * r;
    // nur dort, wo Wald sein soll: hinter Joshi (Sueden), links hinter der Piste, rechts neben/hinter dem Berg
    const wald = z > WALDRAND.z - 4 || x < PISTE.x - PISTE.B / 2 - 10 || x > BERG.rechts - 30 || (x > 18 && z > BERG.z + 22 && z < 40);
    if(!wald || !frei(x, z)) continue;
    const eng = z > WALDRAND.z ? 3.0 : 3.8;
    if(baeume.some(b => Math.hypot(b.x - x, b.z - z) < eng)) continue;
    baeume.push({ x, z });
    story.setze('tanne', 3, { x, z, h: 7 + rnd() * 7, farbe: Math.floor(rnd() * 3), dreh: rnd() * 6.3, dunkel: z > WALDRAND.z && Math.abs(x) < 20, schmal: z > WALDRAND.z && Math.abs(x) < 20, fest: true });
  }
  // Waldpiste (Live-Hinweis 21.10.2026): die Piste fuehrt durch den Wald – je Seite zwei, drei dichte Reihen bis knapp an
  // die Fluegelspitzen der Mustang (Spannweite 11 m, Rollen ohne Anstossen); zur Wiese hin (rechts) mit einer Luecke auf
  // Hoehe der Mustang, damit Joshi sie vom Waldausgang aus sieht
  const PIST_AB = PISTE.B / 2 + 3.2, zz0 = (z) => z;
  for(let z = PISTE.z - PISTE.L / 2 + 4; z <= PISTE.z + PISTE.L / 2 - 4; z += 3.6) for(const seite of [-1, 1]) for(let reihe = 0; reihe < 3; reihe++){
    if(seite > 0){ const zs = START.z + (MUSTANG.z - START.z) * ((PISTE.x + PIST_AB - START.x) / (MUSTANG.x - START.x));   // Sichtlinie am Waldsaum
      if(Math.abs(zz0(z) - zs) < 14 || Math.abs(z - MUSTANG.z) < 10) continue; }   // die Luecke zur Mustang
    const x = PISTE.x + seite * (PIST_AB + reihe * 3.3 + rnd() * 1.2), zz = z + (rnd() - 0.5) * 2 + reihe * 1.6;
    if(z < BERG.z + 22 && x > BERG.links - 6) continue;
    story.setze('tanne', 3, { x, z: zz, h: 9 + rnd() * 6, farbe: Math.floor(rnd() * 3), dreh: rnd() * 6.3, fest: true });
  }
  // der Waldausgang: dichte dunkle Tannen links und rechts hinter Joshi (er kommt aus dem dunklen Wald)
  // und der Waldrand selbst: eine dichte Reihe links und rechts vom Ausgang, quer (Joshi steht an der Luecke)
  for(let i = 0; i < 26; i++) for(const seite of [-1, 1]){
    const x = START.x + seite * (5 + i * 3.4 + rnd() * 1.2), z = WALDRAND.z - 2 + rnd() * 3;
    if(seite < 0 && x > PISTE.x - PISTE.B && x < START.x - 9) continue;   // links: Blick auf Piste und Mustang frei
    if(Math.abs(x - START.x) < 9) continue;                              // der Waldweg
    story.setze('tanne', 3, { x, z, h: 9 + rnd() * 5, farbe: Math.floor(rnd() * 3), dreh: rnd() * 6.3, fest: true });
  }
  if(story.waldweg) story.waldweg({ welt: 3, linie: WEG3, aus: WEG3_AUS, von: WEG3_GASSE.von, bis: WEG3_GASSE.bis, rnd,
    weit: (u) => Math.max(0, 1 - (u - WEG3_GASSE.von) / 0.12) * 1.6 });   // am Ausgang etwas weiter (Kamera)
  for(const [x, z] of [[HOEHLE.x - 7.5, HOEHLE.z + 5], [HOEHLE.x + 8, HOEHLE.z + 4.5]]) story.setze('tanne', 3, { x, z, h: 6.5, farbe: 1, fest: true });
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
  m.rotation.x = -Math.PI / 2; m.position.set(PISTE.x, ISLAND_Y + 0.03, PISTE.z); m.renderOrder = 2; g.add(m);
  return g;
}
// Mustang = das Flugzeug der Engine (wie in Trip to Japan): aktuelles Modell, geparkt am Nordende der Piste, Joshi steht
// als Figur daneben (eva.planeAt). Einsteigen mit Y erst, wenn der Gorilla sie geliehen hat (e3MustangFrei) – vorher kein Y
// (Live-Wunsch 21.10.2026). Keine eigene Grenze: die Engine selbst haelt Joshi am Flugzeug nicht auf (wie den X-Wing).
function mustangParken(){
  if(typeof MODEL_NAMES === 'undefined') return;
  const idx = MODEL_NAMES.indexOf('Mustang'); if(idx < 0) return;
  currentModel = idx; buildModel('Mustang'); spec = PLANE_SPECS.Mustang || DEFAULT_SPEC;
  state.pos.set(MUSTANG.x, ISLAND_Y, MUSTANG.z);
  state.quat.setFromEuler(new THREE.Euler(0, Math.PI, 0, 'YXZ'));   // Nase der Engine bei yaw 0 = -z; nach Sueden (+z) = yaw PI
  state.vel.set(0, 0, 0); state.throttle = 0; state.onGround = true; state.crashed = false; state.falling = false;
  planeGroup.position.copy(state.pos); planeGroup.quaternion.copy(state.quat);
  if(eva) eva.planeAt = new THREE.Vector3(state.pos.x, state.pos.y, state.pos.z);
  hw.mustang = planeGroup;
}
function mustangSetzen(){}

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
function brummTakt(){ story.spaeter(7 + Math.random() * 5, () => { if(!e3()) return;
  const p = eva && eva.group.position; if(p && Math.hypot(p.x - HOEHLE.x, p.z - HOEHLE.z) < BRUMM_R) brummen(); brummTakt(); }); }

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
story.e3StartSzene = function(){ baue(); mustangParken(); setzeStart(); };
story.e3Los = los;
// Vom Waldweg der Waldinsel (globus.js, im Schwarzen): umschalten ohne Neuladen
story.e3Wechsel = function(){
  story.etappe = 3; story.ziel = null;
  if(story.etappeWechsel) story.etappeWechsel(3);
  hookTag(); baue(); mustangParken(); setzeStart(); los();
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
const flug = { an: false, gesagt: false, radar: null, ctx: null, ziel: null, ende: false };
story.e3Fliegt = () => !eva && e3();
story.hoehleFlugZiel = () => flug.ziel;                     // Test
function radarBauen(){
  if(flug.radar) return;
  const c = document.createElement('canvas'); c.width = c.height = 260; c.dataset.etappeHud = '1';
  c.style.cssText = 'position:absolute;left:18px;top:18px;width:130px;height:130px;pointer-events:none;z-index:14;display:none;';
  document.body.appendChild(c); flug.radar = c; flug.ctx = c.getContext('2d');
}
function radarMalen(){
  const g = flug.ctx, W = 260, R = 120, s = state.pos, z = flug.ziel; g.clearRect(0, 0, W, W);
  g.fillStyle = 'rgba(10,30,20,.72)'; g.beginPath(); g.arc(W / 2, W / 2, R, 0, 7); g.fill();
  g.strokeStyle = 'rgba(120,255,160,.45)'; g.lineWidth = 3; for(const r of [R, R * 0.66, R * 0.33]){ g.beginPath(); g.arc(W / 2, W / 2, r, 0, 7); g.stroke(); }
  // Flugrichtung nach oben: Ziel relativ zur Nase
  const e = new THREE.Euler().setFromQuaternion(state.quat, 'YXZ'), yaw = e.y;   // Nase -z bei yaw 0
  const dx = z.x - s.x, dz = z.z - s.z, d = Math.hypot(dx, dz);
  const lx = dx * Math.cos(yaw) - dz * Math.sin(yaw), lz = dx * Math.sin(yaw) + dz * Math.cos(yaw);   // in Nasenkoordinaten (-z vorn)
  const k = Math.min(1, d / 3000) * (R - 14) / Math.max(1, d);
  g.fillStyle = '#ff3b30'; g.beginPath(); g.arc(W / 2 + lx * k, W / 2 + lz * k, 13, 0, 7); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(W / 2, W / 2 - 16); g.lineTo(W / 2 - 11, W / 2 + 12); g.lineTo(W / 2 + 11, W / 2 + 12); g.fill();   // das Flugzeug
}
function updateFlug(dt){
  radarBauen();
  const fliegt = !eva && locale === 'earth' && !flug.ende;
  flug.radar.style.display = fliegt && story.e3MustangFrei ? 'block' : 'none';
  if(!fliegt) return;
  if(!flug.ziel) flug.ziel = Object.assign({}, FLUGZIEL);
  if(!flug.gesagt && !state.onGround){ flug.gesagt = true; story.sprich(TEXT_FLIEGEN); }
  // Ziel kommt entgegen (wie das Segelziel): nur wenn die Nase darauf zeigt
  const z = flug.ziel, dx = z.x - state.pos.x, dz = z.z - state.pos.z, d = Math.hypot(dx, dz);
  const vor = new THREE.Vector3(0, 0, -1).applyQuaternion(state.quat), cos = (vor.x * dx + vor.z * dz) / Math.max(1, d) / Math.max(0.01, Math.hypot(vor.x, vor.z));
  const v = state.vel.length();
  if(!state.onGround && cos > 0.75 && d > z.r * 1.5){ const w = Math.min(v * 1.2 * dt, d - z.r); z.x -= dx / d * w; z.z -= dz / d * w; }
  radarMalen();
  if(d < z.r && !state.onGround){ flug.ende = true; flug.radar.style.display = 'none'; state.throttle = 0; if(story.globusReise) story.globusReise(3); }   // Ort 3 = die Wueste (globus.js)
}
function hookFlug(){
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
const abstandPiste = (x, z) => Math.max(0, Math.abs(x - PISTE.x) - PISTE.B / 2) + Math.max(0, Math.abs(z - PISTE.z) - PISTE.L / 2);

// ---- Der Waldweg wird hell, wenn der Gorilla wieder froh ist (Live-Idee 21.10.2026) ----------------------------------------
// Draussen nach dem Gorilla: Schatten weg, Licht wie auf der Wiese; die Gasse bleibt, ist aber freundlich
story.e3Draussen = function(){
  if(!story.e3MustangFrei || hw.hell) return; hw.hell = true;
  story.welt(3).traverse(o => { if(o.isMesh && o.renderOrder === 3 && o.material && o.material.map && o.material.transparent) o.visible = false; });   // der Wegschatten
  story.spaeter(1.0, () => story.sprich(['Schau mal, der Wald ist gar nicht mehr dunkel. Jetzt geh zum Flugzeug.']));
};

// ---- Jedes Bild ------------------------------------------------------------------------------------------------
story.updateE3 = function(dt){
  if(!e3()) return;
  baue(); hw.t += dt;
  if(story.gestartet) gorillaLaden();
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
