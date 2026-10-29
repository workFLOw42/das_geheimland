// Das Geheimland – Etappe 4: im Observatorium des Lamas (Innenraum = eigene Welt, wie Huette und Hoehle). Laedt nach
// wueste.js, vor der Engine. Konzept Abschnitt 7, Etappe 4 "Im Observatorium" (Live-Wuensche 23.10.2026):
//   Groesser und hoeher als die Hoehle; die Decke eine echte Sternwarten-Kuppel (Rippen, Laufring, offener Spalt), durch den
//   Spalt sieht man den Nachthimmel – drinnen ist draussen NACHT (Sterne, Milchstrasse, Sternbilder), draussen wieder Tag.
//   In der Mitte das Teleskop auf einem Podest, an den Waenden hohe, volle Buecherregale (wie in Joshis Huette, nur
//   groesser und vintage), ein Schreibtisch mit Sternkarte und Globus, vorn rechts ein Tisch mit dem Paket, dahinter das Lama (Live-Wunsch 26.10.2026: das Lama statt des Hamsters).
// Ablauf:
//   1. Vor dem Suchblick passiert nichts. X -> das Lama leuchtet auf.
//   2. Y beim Lama: es bekommt die Schnur seines Pakets nicht auf, ist genervt – mit Hufen geht kein Knoten auf. Danach der
//      gruene Messer-Ring am Tisch (der Fuchs zeigt ihn).
//   3. Messer-Ring: Joshi schneidet die Schnur auf (Messer aus dem Rucksack), die Laschen springen auf. Das Lama dankt.
//   4. X (noch einmal umschauen) -> brauner Lupenring vor dem Tisch: Hufspuren im Staub (Skizze ins Notizbuch).
//   Weiter in Teil 2 unten: Spuren vergleichen, Packpapier, Mond-Bewohner, Schluessel, Abflug.
// Der Raum schwebt weit draussen (RAUM, BODEN_Y = 150 wie Huette und Hoehle) – von der Insel aus nicht zu sehen.
(function(){
'use strict';
const story = window.STORY;
const e4 = () => story.etappe === 4;

const RAUM = { x: -640, z: 620, R: 11, H: 5.5 };      // runder Saal, Wand 5,5 m, darueber die Kuppel (Tuer auf +z)
const KUPPEL_Y = 0.85;                                 // Kuppel flacher als eine Halbkugel: Scheitel 5,5 + 9,35 m
const SPALT = { b: 2.8, unten: 0.2 };                  // Kuppelspalt: Breite (m), reicht bis 20 % ueber den Kuppelfuss (zur Rueckseite -z)
const BODEN_Y = 150;
const TUER = { B: 1.8, H: 2.8 };
const PODEST = { x: RAUM.x, z: RAUM.z - 1.5, r: 2.0, h: 0.45 };
// Tisch rechts hinten, die Spur vorn am Eingang (Live-Wunsch 26.10.2026: vorher lagen Spur, Tisch und Lama so dicht, dass zwei Y
// nah beieinander standen). Vom Teleskop-Podest weit genug weg, dass sich die Y-Bereiche nicht beruehren.
const TISCH = { x: RAUM.x + 5.6, z: RAUM.z + 1.6, b: 1.8, t: 0.95, h: 0.78, dreh: -0.5 };
const PULT = { x: RAUM.x - 4.6, z: RAUM.z + 2.2, b: 2.1, t: 1.0, h: 0.8, dreh: 0.9 };       // Schreibtisch vorn links
const TELE_H = 3.6;                                    // Teleskop (Fuss bis Rohrende) in m
const LAMA_H = 1.7;                                    // m Hufe bis Ohren (Joshi 1,20 m; bei 1,5 m verschwand die Schnauze hinter dem Paket)
const oi = story.obsInnen = { drin: false, wechsel: null, sperre: 0, gruppe: null, stufe: 'x', lama: null, paket: null, t: 0, warDrin: false };
// stufe: 'x' (vor dem Suchblick) -> 'gesucht' -> 'schnur' (gesprochen, Messer-Ring da) -> 'offen' (Schnur ab, das Lama dankt)
// -> 'spur' (Spur unter der Lupe) -> spaeter: Vergleich, Konfrontation

// ---- Texte (Entwuerfe) ------------------------------------------------------------------------------------------------
const T = {
  ankunft: ['Wow! Was für ein großes Observatorium. Und durch die Kuppel siehst du die Sterne.', 'Da drüben am Tisch steht ein Lama.'],
  hinweisX: ['Schau dich im Observatorium genau um. Drück dafür X.'],
  hinweisLama: ['Geh doch mal zum Lama am Tisch.'],
  joshiHallo: ['Hallo Lama!'],
  lamaGenervt: ['Was ist denn? Siehst du nicht, dass ich zu tun habe?', 'Ich krieg die blöde Schnur von meinem Paket einfach nicht auf. Mit meinen Hufen geht das nicht!'],
  lamaNochmal: ['Mit Hufen kann man keine Knoten aufmachen. Die Schnur geht einfach nicht ab.'],
  hinweisSchnur: ['Am grünen Kreis steht das Paket. Schneid die Schnur mit deinem Taschenmesser auf.'],
  danke: ['Oh! Danke, das ist lieb von dir. Endlich ist mein Paket offen.'],
  lamaBeschaeftigt: ['Danke nochmal! Jetzt muss ich aber auspacken.'],
  hinweisUmschauen: ['Schau dich noch einmal ganz genau um. Drück dafür X.'],
  spur: ['Schau mal, Spuren im Staub. Die kommen in dein Notizbuch.'],
  hinweisSpur: ['Die Spur kommt dir bekannt vor, oder? Schau doch mal in dein Notizbuch.'],
  fuchsFund: ['Schau mal, dein Fuchs hat noch etwas gefunden.'],     // wie in Etappe 2 (waldinsel.js TEXT_FUCHS_FUND)
};
story.obsText = T;

// ---- Hilfen: Texturen aus Canvas -------------------------------------------------------------------------------------
let saat = 23; const rnd = () => (saat = (saat * 16807) % 2147483647) / 2147483647;
function leinwand(w, h, mal){ const c = document.createElement('canvas'); c.width = w; c.height = h; mal(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; }
// Grauer Bruchstein wie aussen (Comic): unregelmaessige Steine mit dunklen Fugen
const steinTex = () => leinwand(512, 256, (g, W, H) => {
  g.fillStyle = '#4a4c52'; g.fillRect(0, 0, W, H);
  for(let y = 0, r = 0; y < H; y += 32, r++) for(let x = -(r % 2) * 30; x < W; x += 60){
    const v = 92 + Math.floor(rnd() * 34); g.fillStyle = 'rgb(' + v + ',' + (v + 2) + ',' + (v + 8) + ')';
    g.beginPath(); g.roundRect ? g.roundRect(x + 3, y + 3, 54, 26, 6) : g.rect(x + 3, y + 3, 54, 26); g.fill();
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 6, y + 5, 46, 4); }
});
// Dielen: warmes, altes Holz, laengs
const dielenTex = () => leinwand(512, 512, (g, W, H) => {
  for(let x = 0, i = 0; x < W; x += 64, i++){ const v = [118, 104, 128, 110][i % 4]; g.fillStyle = 'rgb(' + v + ',' + Math.round(v * 0.68) + ',' + Math.round(v * 0.42) + ')'; g.fillRect(x, 0, 64, H);
    g.strokeStyle = 'rgba(40,24,12,.55)'; g.lineWidth = 3; g.strokeRect(x, -2, 64, H + 4);
    for(let k = 0; k < 7; k++){ g.strokeStyle = 'rgba(60,36,18,.25)'; g.lineWidth = 1.5; g.beginPath(); const yy = rnd() * H; g.moveTo(x + 4, yy); g.bezierCurveTo(x + 20, yy + 10, x + 40, yy - 10, x + 60, yy + 4); g.stroke(); }
    const fuge = (i * 157) % H; g.fillStyle = 'rgba(30,18,8,.6)'; g.fillRect(x, fuge, 64, 3); }
});
// Kuppel innen: dunkle Holzbretter
const kuppelTex = () => leinwand(512, 256, (g, W, H) => {
  g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, W, H);
  for(let x = 0; x < W; x += 32){ const v = 54 + Math.floor(rnd() * 14); g.fillStyle = 'rgb(' + v + ',' + Math.round(v * 0.72) + ',' + Math.round(v * 0.5) + ')'; g.fillRect(x + 1, 0, 30, H); }
});
const FENSTER = [Math.PI * 0.5, Math.PI * 0.78, Math.PI * 1.22, Math.PI * 1.5];   // Winkel der Bogenfenster an der Wand
// Nachthimmel fuer Fenster und Tuer: dunkelblau mit Sternen (Tuer: unten Palmen der Oase als Schattenriss)
function nachtTex(palmen){
  return leinwand(256, 320, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#060a1c'); gr.addColorStop(0.7, '#13204a'); gr.addColorStop(1, '#22325e');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for(let i = 0; i < 90; i++){ const r = rnd() < 0.12 ? 1.6 : 0.8; g.fillStyle = 'rgba(255,255,240,' + (0.5 + rnd() * 0.5) + ')'; g.beginPath(); g.arc(rnd() * W, rnd() * H * 0.85, r, 0, 7); g.fill(); }
    if(palmen){ g.fillStyle = '#05070c'; g.fillRect(0, H * 0.82, W, H * 0.18);
      for(const [x, h] of [[40, 120], [120, 150], [205, 110]]){ g.fillRect(x - 3, H * 0.82 - h, 6, h);
        for(let k = 0; k < 7; k++){ const a = -Math.PI / 2 + (k - 3) * 0.45; g.beginPath(); g.ellipse(x + Math.cos(a) * 26, H * 0.82 - h + Math.sin(a) * 12 + 8, 28, 6, a, 0, 7); g.fill(); } } }
  });
}

// ---- Raum ------------------------------------------------------------------------------------------------------------
const mats = {};
function material(){
  if(mats.holz) return mats;
  mats.holz = new THREE.MeshLambertMaterial({ color: 0x7a4a2a });
  mats.dunkel = new THREE.MeshLambertMaterial({ color: 0x4a2c18 });
  mats.messing = new THREE.MeshLambertMaterial({ color: 0xc9a046, emissive: 0x221500 });
  mats.papier = new THREE.MeshLambertMaterial({ color: 0xe9dcb8 });
  mats.gold = new THREE.MeshLambertMaterial({ color: 0xd8b257, emissive: 0x1a1000 });
  return mats;
}
function baueRaum(){
  if(oi.gruppe) return;
  const M = material(), g = new THREE.Group(), R = RAUM.R, H = RAUM.H;
  // Wand mit Tuer: Zylinder von a0..a1 (bei three.js liegt Winkel 0 auf +z – dort die Tuer)
  const offen = Math.asin(TUER.B / 2 / R) + 0.02;
  const st = steinTex(); st.wrapS = st.wrapT = THREE.RepeatWrapping; st.repeat.set(14, 3.2);
  const wand = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 64, 1, true, offen, Math.PI * 2 - 2 * offen), new THREE.MeshLambertMaterial({ map: st, side: THREE.BackSide }));
  wand.position.y = H / 2; wand.userData.keinKoerper = true; g.add(wand);
  // ueber der Tuer: Sturz aus Stein, Tuerrahmen aus Holz
  const sturz = new THREE.Mesh(new THREE.BoxGeometry(TUER.B + 1.0, H - TUER.H, 0.6), new THREE.MeshLambertMaterial({ color: 0x5c5e66 }));
  sturz.position.set(0, TUER.H + (H - TUER.H) / 2, R - 0.1); sturz.userData.keinKoerper = true; g.add(sturz);
  for(const sx of [-1, 1]){ const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, TUER.H, 0.7), M.holz); p.position.set(sx * (TUER.B / 2 + 0.15), TUER.H / 2, R); p.userData.keinKoerper = true; g.add(p); }
  const oben = new THREE.Mesh(new THREE.BoxGeometry(TUER.B + 0.6, 0.3, 0.7), M.holz); oben.position.set(0, TUER.H + 0.15, R); oben.userData.keinKoerper = true; g.add(oben);
  // draussen die Oase bei Nacht (ein Bild ein Stueck hinter der Oeffnung – hinkommen kann man nur durch die Tuer)
  // groesser und naeher an der Wand, ohne Nebel (Live-Befund 26.10.2026: an den Raendern schimmerte es – zwischen Wandausschnitt und
  // Rahmen sah man am Bild vorbei ins Leere); die runde Wand verdeckt den Ueberstand
  // seit dem Abend als Kasten (story.tuerKasten: auch schraeg sieht man nicht mehr daran vorbei), vorn in Pfosten und Sturz
  const draussen = story.tuerKasten(nachtTex(true), TUER.B + 0.04, TUER.H + 0.03, 1.6);
  draussen.position.set(0, 0, R - 0.3); g.add(draussen);
  // Holzpfosten an der Wand (wie die Balken aussen) und ein Gesims oben, auf dem die Kuppel ruht
  // Live-Befund 29.10.2026: zwei Pfosten lagen mitten ueber den beiden hinteren Fenstern – sie stehen jetzt dicht neben den beiden
  // mittleren Regalen (die Fenster sind dafuer nach aussen gerueckt): Pfosten, Regal, Fenster, Pfosten ... symmetrisch zur Rueckwand
  for(let i = 0; i < 16; i++){ let a = (i + 0.5) / 16 * Math.PI * 2; if(Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.35) continue;
    if(Math.abs(a - Math.PI * 0.8125) < 0.01) a = Math.PI * 0.87; else if(Math.abs(a - Math.PI * 1.1875) < 0.01) a = Math.PI * 1.13;
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, H, 0.3), M.holz); p.position.set(Math.sin(a) * (R - 0.15), H / 2, Math.cos(a) * (R - 0.15)); p.rotation.y = a; p.userData.keinKoerper = true; g.add(p); }
  const gesims = new THREE.Mesh(new THREE.TorusGeometry(R - 0.2, 0.22, 8, 80), M.dunkel); gesims.rotation.x = Math.PI / 2; gesims.position.y = H; gesims.userData.keinKoerper = true; g.add(gesims);
  // Kuppel: Bretter innen, mit offenem Spalt zur Rueckseite (-z) ueber den Scheitel; dort sieht man den Nachthimmel der Engine
  baueKuppel(g);
  // Boden: Dielen, in der Mitte ein runder Teppich unter dem Podest
  const dt = dielenTex(); dt.wrapS = dt.wrapT = THREE.RepeatWrapping; dt.repeat.set(5, 5);
  const boden = new THREE.Mesh(new THREE.CircleGeometry(R + 0.3, 64), new THREE.MeshLambertMaterial({ map: dt }));
  boden.rotation.x = -Math.PI / 2; boden.position.y = 0.01; boden.userData.begehbar = true; g.add(boden);
  const teppich = new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), new THREE.MeshLambertMaterial({ map: leinwand(512, 512, (c, W) => {
    c.fillStyle = '#6e2420'; c.fillRect(0, 0, W, W);
    for(const [r, f] of [[250, '#3d1a1a'], [235, '#c8a058'], [222, '#6e2420'], [150, '#2f4a5a'], [138, '#c8a058'], [126, '#6e2420'], [60, '#c8a058']]){ c.fillStyle = f; c.beginPath(); c.arc(256, 256, r, 0, 7); c.fill(); }
    c.strokeStyle = '#c8a058'; c.lineWidth = 4; for(let i = 0; i < 16; i++){ const a = i / 16 * Math.PI * 2; c.beginPath(); c.moveTo(256 + Math.cos(a) * 140, 256 + Math.sin(a) * 140); c.lineTo(256 + Math.cos(a) * 220, 256 + Math.sin(a) * 220); c.stroke(); }
  }) }));
  teppich.rotation.x = -Math.PI / 2; teppich.position.set(PODEST.x - RAUM.x, 0.02, PODEST.z - RAUM.z); teppich.userData.begehbar = true; g.add(teppich);
  // Bogenfenster mit Nachthimmel zwischen den Regalen
  const nt = nachtTex(false);
  for(const a of FENSTER){
    const f = new THREE.Group(); f.position.set(Math.sin(a) * (R - 0.08), 2.4, Math.cos(a) * (R - 0.08)); f.rotation.y = a + Math.PI;
    const glas = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.0), new THREE.MeshBasicMaterial({ map: nt })); f.add(glas);
    const bogen = new THREE.Mesh(new THREE.CircleGeometry(0.65, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ map: nt })); bogen.position.y = 1.0; f.add(bogen);
    for(const [w, h, x, y] of [[0.12, 2.1, -0.7, 0], [0.12, 2.1, 0.7, 0], [1.5, 0.12, 0, -1.05], [0.06, 2.0, 0, 0], [1.3, 0.06, 0, 0.2]]){ const r = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), M.dunkel); r.position.set(x, y, 0.03); f.add(r); }
    f.traverse(o => { o.userData.keinKoerper = true; }); g.add(f);
  }
  // Licht: warme Lampen (Wand), etwas kuehles Licht vom Spalt
  const grund = new THREE.PointLight(0xffd9a8, 0.9, 30, 1.1); grund.position.set(0, H - 0.5, 1); g.add(grund);
  const mond = new THREE.PointLight(0xa8bfff, 0.5, 26, 1.2); mond.position.set(0, H + 6, -4); g.add(mond);
  for(const a of [Math.PI * 0.42, Math.PI * 1.58, Math.PI]){ const l = new THREE.Group(); l.position.set(Math.sin(a) * (R - 0.4), 3.1, Math.cos(a) * (R - 0.4));
    const glas = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.32, 8), new THREE.MeshBasicMaterial({ color: 0xffd28a })); l.add(glas);
    const kappe = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.14, 8), M.messing); kappe.position.y = 0.22; l.add(kappe);
    const p = new THREE.PointLight(0xffc27a, 0.45, 9, 1.4); l.add(p); l.traverse(o => { o.userData.keinKoerper = true; }); g.add(l); }
  g.position.set(RAUM.x, BODEN_Y, RAUM.z);
  story.welt(4).add(g); oi.gruppe = g;
  // Einrichtung: Podest mit Teleskop, Regale, Schreibtisch, Tisch mit Paket und Lama
  baueRegale(); baueSchreibtisch(); baueTisch(); bauePodest();
  lamaLaden();
}
// Kuppel: Schalen-Dreiecke einer Kugel (flacher, KUPPEL_Y), ohne die im Spalt; Rippen und Spaltkanten aus Messing-Holz
// Grund der Schale ueber dem Spalt: oben (v = 1, Scheitel) tiefes Nachtblau, zum Fuss etwas heller, ein Hauch Milchstrasse. Die Sterne
// selbst sind Punkte (sternPunkte) – gemalt verschmierten sie zum Scheitel hin zu Strichen
function sternPunkte(r){
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, pos = [], farbe = [];
  for(let i = 0; i < 700; i++){ const a = rnd() * Math.PI * 2, e = Math.asin(rnd()), h = 0.45 + 0.55 * rnd();
    pos.push(Math.sin(a) * Math.cos(e) * r, Math.sin(e) * r * KUPPEL_Y, Math.cos(a) * Math.cos(e) * r); farbe.push(h, h, h * (0.88 + 0.12 * rnd())); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(farbe, 3));
  const m = new THREE.Points(geo, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, fog: false }));
  m.userData.deko = true; m.userData.keinKoerper = true; return m;
}
function sternSchaleTex(){
  const W = 2048, Hh = 512, c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d');
  const hg = g.createLinearGradient(0, 0, 0, Hh); hg.addColorStop(0, '#040817'); hg.addColorStop(1, '#14244c'); g.fillStyle = hg; g.fillRect(0, 0, W, Hh);
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 40; i++){ const x = rnd() * W, y = Hh * (0.25 + 0.5 * rnd()), r = 60 + rnd() * 90, m = g.createRadialGradient(x, y, 0, x, y, r);
    m.addColorStop(0, 'rgba(170,180,230,.07)'); m.addColorStop(1, 'rgba(170,180,230,0)'); g.fillStyle = m; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; return t;
}
function baueKuppel(g){
  const R = RAUM.R, H = RAUM.H, M = material();
  const kugel = new THREE.SphereGeometry(R, 64, 20, 0, Math.PI * 2, 0, Math.PI / 2).toNonIndexed();
  kugel.scale(1, KUPPEL_Y, 1);
  const p = kugel.attributes.position, uv = kugel.attributes.uv, pos = [], uvs = [];
  const imSpalt = (x, y, z) => Math.abs(x) < SPALT.b / 2 && z < SPALT.b && y > R * KUPPEL_Y * SPALT.unten;
  const LADEN = 0.9, weg = (x, y, z) => Math.abs(x) < SPALT.b / 2 + LADEN * 0.75 && z < SPALT.b + 0.5 && y > R * KUPPEL_Y * SPALT.unten - 0.35;
  for(let t = 0; t < p.count; t += 3){
    let cx = 0, cy = 0, cz = 0; for(let v = 0; v < 3; v++){ cx += p.getX(t + v) / 3; cy += p.getY(t + v) / 3; cz += p.getZ(t + v) / 3; }
    if(weg(cx, cy, cz)) continue;
    for(let v = 0; v < 3; v++){ pos.push(p.getX(t + v), p.getY(t + v), p.getZ(t + v)); uvs.push(uv.getX(t + v), uv.getY(t + v)); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.computeVertexNormals();
  const kt = kuppelTex(); kt.wrapS = kt.wrapT = THREE.RepeatWrapping; kt.repeat.set(10, 3);
  const kuppel = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: kt, side: THREE.BackSide })); kuppel.position.y = H; kuppel.userData.keinKoerper = true; g.add(kuppel);
  // Ueber dem Spalt ein gemalter Sternenhimmel (Live-Wunsch 26.10.2026, wie die Kaesten hinter den Tueren): eine Schale knapp ueber der
  // Kuppel – zu sehen nur durch den Spalt, unabhaengig vom Himmel der Engine
  const himmel = new THREE.Mesh(new THREE.SphereGeometry(R + 0.6, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ map: sternSchaleTex(), fog: false, side: THREE.BackSide }));
  himmel.scale.y = KUPPEL_Y; himmel.position.y = H; himmel.userData.deko = true; himmel.userData.keinKoerper = true; g.add(himmel);
  const sterne = sternPunkte(R + 0.5); sterne.position.y = H; g.add(sterne);
  // Rippen: Meridiane der Kuppel (nicht durch den Spalt), dazu zwei Ringe
  const punkt = (a, e, r) => new THREE.Vector3(Math.sin(a) * Math.cos(e) * r, H + Math.sin(e) * r * KUPPEL_Y, Math.cos(a) * Math.cos(e) * r);
  for(let i = 0; i < 16; i++){
    const a = i / 16 * Math.PI * 2, pts = [];
    for(let k = 0; k <= 24; k++){ const e = k / 24 * Math.PI / 2 * 0.97, q = punkt(a, e, R - 0.12); if(imSpalt(q.x, q.y - H, q.z)) break; pts.push(q); }
    if(pts.length < 2) continue;
    const rippe = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.09, 5, false), M.dunkel); rippe.userData.keinKoerper = true; g.add(rippe);
  }
  for(const [e, d] of [[0.42, 0.08], [0.9, 0.07]]){ const r = Math.cos(e) * (R - 0.15), ring = new THREE.Mesh(new THREE.TorusGeometry(r, d, 6, 72), M.dunkel);
    ring.rotation.x = Math.PI / 2; ring.position.y = H + Math.sin(e) * (R - 0.15) * KUPPEL_Y; ring.userData.keinKoerper = true; g.add(ring); }
  // Spaltkanten: zwei Leisten aus Messing laengs des Spalts
  for(const sx of [-1, 1]){
    const pts = [];
    for(let k = 0; k <= 30; k++){ const z = SPALT.b - k / 30 * (SPALT.b + R), x = sx * SPALT.b / 2, rr = R - 0.1, y2 = (rr * rr - x * x - z * z); if(y2 <= 0) continue;
      const y = Math.sqrt(y2) * KUPPEL_Y; if(y < R * KUPPEL_Y * SPALT.unten) continue; pts.push(new THREE.Vector3(x, H + y, z)); }
    if(pts.length > 1){ const l = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.11, 6, false), M.messing); l.userData.keinKoerper = true; g.add(l); }
  }
  // Spaltlaeden (Live-Pruefung: die herausgenommenen Dreiecke liessen gezackte Kanten): beiderseits ein Laden aus Brettern auf der
  // Kuppelflaeche, oben und unten je ein Querbalken – der Spalt hat gerade Kanten, die Zacken liegen darunter
  const rr = R - 0.07, yLim = R * KUPPEL_Y * SPALT.unten, aussen = SPALT.b / 2 + LADEN;
  const aufKuppel = (x, z) => { const q = rr * rr - x * x - z * z; return q > 0 ? Math.sqrt(q) * KUPPEL_Y : 0; };
  const zBei = (x, y) => -Math.sqrt(Math.max(0, rr * rr - x * x - (y / KUPPEL_Y) * (y / KUPPEL_Y)));   // Rueckseite: z zur Hoehe y
  const lm = new THREE.MeshLambertMaterial({ map: kt, side: THREE.DoubleSide, color: 0xc8a888 });
  const flaeche = (f, nu, nv) => { const pos = [], idx = []; for(let i = 0; i <= nu; i++) for(let j = 0; j <= nv; j++){ const p = f(i / nu, j / nv); pos.push(p.x, H + p.y, p.z); }
    for(let i = 0; i < nu; i++) for(let j = 0; j < nv; j++){ const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const uvs = []; for(let i = 0; i <= nu; i++) for(let j = 0; j <= nv; j++) uvs.push(j / nv, i / nu * 6); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    const m = new THREE.Mesh(geo, lm); m.userData.keinKoerper = true; g.add(m); };
  for(const sx of [-1, 1]) flaeche((u, v) => { const x = sx * (SPALT.b / 2 + v * LADEN), z0 = SPALT.b + 0.9, z1 = zBei(x, yLim - 0.6), z = z0 + (z1 - z0) * u;
    return new THREE.Vector3(x, aufKuppel(x, z), z); }, 48, 3);
  flaeche((u, v) => { const x = -aussen + v * 2 * aussen, z = SPALT.b - 0.3 + u * 1.3; return new THREE.Vector3(x, aufKuppel(x, z), z); }, 4, 8);          // oben (vorn)
  flaeche((u, v) => { const x = -aussen + v * 2 * aussen, y = yLim - 0.6 + u * 0.95, z = zBei(x, y); return new THREE.Vector3(x, y, z); }, 4, 8);           // unten (hinten)
  // Laufring am Kuppelfuss (Rollen, auf denen sich die Kuppel dreht)
  const lauf = new THREE.Mesh(new THREE.TorusGeometry(R - 0.25, 0.12, 6, 80), M.messing); lauf.rotation.x = Math.PI / 2; lauf.position.y = H + 0.25; lauf.userData.keinKoerper = true; g.add(lauf);
}
// ---- Regale (wie in Joshis Huette, gross und vintage) ---------------------------------------------------------------
const BUCH_VINTAGE = [0x6b1f1f, 0x2f4a2e, 0x5a3a22, 0x1f2f4f, 0x7a5a2a, 0x4a2f4a, 0x8a3a1f, 0x3a3a2a, 0x6a4a3a, 0x2a3f3f];
function baueRegal(breit, hoch, faecher){
  const M = material(), r = new THREE.Group(), tief = 0.45, fh = (hoch - 0.3) / faecher;
  for(let i = 0; i <= faecher; i++){ const b = new THREE.Mesh(new THREE.BoxGeometry(breit, 0.06, tief), M.holz); b.position.y = 0.15 + i * fh; r.add(b); }
  for(const sx of [-1, 1]){ const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, hoch, tief), M.dunkel); s.position.set(sx * breit / 2, hoch / 2, 0); r.add(s); }
  const rueck = new THREE.Mesh(new THREE.BoxGeometry(breit, hoch, 0.03), M.dunkel); rueck.position.set(0, hoch / 2, -tief / 2); rueck.userData.keinKoerper = true; r.add(rueck);
  const krone = new THREE.Mesh(new THREE.BoxGeometry(breit + 0.24, 0.16, tief + 0.12), M.dunkel); krone.position.y = hoch + 0.08; r.add(krone);
  const sockel = new THREE.Mesh(new THREE.BoxGeometry(breit + 0.12, 0.15, tief + 0.06), M.dunkel); sockel.position.y = 0.075; r.add(sockel);
  // Buecher: dicht, verschieden hoch und breit, Lederfarben mit Goldbaendern; ab und zu ein Stapel liegend oder eins schraeg
  const buecher = new THREE.Group(); buecher.userData.keinKoerper = true; r.add(buecher);
  for(let f = 0; f < faecher; f++){
    const y0 = 0.15 + f * fh + 0.03, hmax = fh - 0.08; let x = -breit / 2 + 0.07;
    while(x < breit / 2 - 0.1){
      if(rnd() < 0.07){                                            // liegender Stapel
        const n = 2 + Math.floor(rnd() * 3), w = 0.22 + rnd() * 0.08; if(x + w > breit / 2 - 0.07) break;
        for(let k = 0; k < n; k++){ const d = 0.04 + rnd() * 0.02, b = new THREE.Mesh(new THREE.BoxGeometry(w, d, 0.28), new THREE.MeshLambertMaterial({ color: BUCH_VINTAGE[Math.floor(rnd() * BUCH_VINTAGE.length)] }));
          b.position.set(x + w / 2, y0 + d / 2 + k * (d + 0.002), 0.02); b.rotation.y = (rnd() - 0.5) * 0.15; buecher.add(b); }
        x += w + 0.02; continue; }
      const b = 0.035 + rnd() * 0.05, h = hmax * (0.62 + rnd() * 0.36), t = 0.25 + rnd() * 0.08;
      const buch = new THREE.Group();
      buch.add(new THREE.Mesh(new THREE.BoxGeometry(b, h, t), new THREE.MeshLambertMaterial({ color: BUCH_VINTAGE[Math.floor(rnd() * BUCH_VINTAGE.length)] })));
      for(const yy of [0.3, -0.3]){ const s = new THREE.Mesh(new THREE.BoxGeometry(b * 1.02, 0.014, 0.004), M.gold); s.position.set(0, h * yy, t / 2 + 0.002); buch.add(s); }
      const schraeg = rnd() < 0.08;
      buch.position.set(x + b / 2, y0 + h / 2, 0.03);
      if(schraeg){ buch.rotation.z = -0.28; buch.position.x += 0.05; buch.position.y -= 0.015; }
      buecher.add(buch); x += b + 0.004 + (schraeg ? 0.07 : 0);
    }
  }
  r.traverse(o => { if(o.isMesh) o.castShadow = true; });
  return r;
}
function baueRegale(){
  const R = RAUM.R;
  // links und rechts je zwei hohe Regale an der runden Wand (zur Mitte gedreht), zwischen den Fenstern
  for(const a of [Math.PI * 0.3, Math.PI * 0.66, Math.PI * 0.92, Math.PI * 1.08, Math.PI * 1.34, Math.PI * 1.7]){
    const reg = baueRegal(2.6, 4.8, 8), rr = R - 0.55;
    const x = RAUM.x + Math.sin(a) * rr, z = RAUM.z + Math.cos(a) * rr;
    reg.position.set(x, BODEN_Y, z); reg.rotation.y = a + Math.PI;
    story.welt(4).add(reg); reg.updateMatrixWorld(true); story.ding(reg, { welt: 4, typ: 'regal_obs', form: 'quader' });
  }
  // Leiter am rechten hinteren Regal
  const M = material(), a = Math.PI * 0.92, L = new THREE.Group();
  for(const sx of [-0.25, 0.25]){ const h = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.6, 0.06), M.holz); h.position.set(sx, 1.8, 0); L.add(h); }
  for(let i = 0; i < 9; i++){ const s = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.05), M.holz); s.position.set(0, 0.3 + i * 0.38, 0); L.add(s); }
  L.position.set(RAUM.x + Math.sin(a) * (R - 1.25), BODEN_Y, RAUM.z + Math.cos(a) * (R - 1.25)); L.rotation.y = a + Math.PI; L.rotation.x = -0.18;
  L.traverse(o => { o.userData.keinKoerper = true; }); story.welt(4).add(L);
}
// ---- Schreibtisch mit Sternkarte, Globus, Kerze ------------------------------------------------------------------
function tischGestell(b, t, h){
  const M = material(), g = new THREE.Group();
  const platte = new THREE.Mesh(new THREE.BoxGeometry(b, 0.07, t), M.holz); platte.position.y = h - 0.035; g.add(platte);
  for(const sx of [-1, 1]) for(const sz of [-1, 1]){ const bein = new THREE.Mesh(new THREE.BoxGeometry(0.09, h - 0.07, 0.09), M.dunkel); bein.position.set(sx * (b / 2 - 0.1), (h - 0.07) / 2, sz * (t / 2 - 0.1)); g.add(bein); }
  const zarge = new THREE.Mesh(new THREE.BoxGeometry(b - 0.2, 0.12, t - 0.2), M.dunkel); zarge.position.y = h - 0.13; g.add(zarge);
  return g;
}
function baueSchreibtisch(){
  const M = material(), g = tischGestell(PULT.b, PULT.t, PULT.h);
  const karte = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.62), new THREE.MeshLambertMaterial({ map: leinwand(512, 360, (c, W, H) => {
    c.fillStyle = '#e6d5ad'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(80,60,30,.5)'; c.lineWidth = 2;
    c.beginPath(); c.arc(W / 2, H / 2, 160, 0, 7); c.stroke(); for(let i = 0; i < 12; i++){ const a = i / 12 * Math.PI * 2; c.beginPath(); c.moveTo(W / 2, H / 2); c.lineTo(W / 2 + Math.cos(a) * 160, H / 2 + Math.sin(a) * 160); c.stroke(); }
    c.fillStyle = '#2a2418'; for(let i = 0; i < 60; i++){ const a = rnd() * 7, r = rnd() * 150; c.beginPath(); c.arc(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r, rnd() < 0.2 ? 3 : 1.5, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(40,30,20,.8)'; c.beginPath(); c.moveTo(200, 120); c.lineTo(240, 150); c.lineTo(290, 140); c.lineTo(320, 190); c.stroke();
  }) }));
  karte.rotation.x = -Math.PI / 2; karte.position.set(-0.2, PULT.h + 0.003, 0.05); karte.rotation.z = 0.12; karte.userData.keinKoerper = true; g.add(karte);
  // Globus (Messing-Gestell)
  const globus = new THREE.Group(); globus.position.set(0.68, PULT.h, -0.15);
  const fuss = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.04, 16), M.messing); fuss.position.y = 0.02; globus.add(fuss);
  const stab = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6), M.messing); stab.position.y = 0.12; globus.add(stab);
  const kugel = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), new THREE.MeshLambertMaterial({ map: leinwand(256, 128, (c, W, H) => {
    c.fillStyle = '#5a8aa0'; c.fillRect(0, 0, W, H); c.fillStyle = '#c8b27a'; for(let i = 0; i < 9; i++){ c.beginPath(); c.ellipse(rnd() * W, 20 + rnd() * 90, 14 + rnd() * 26, 8 + rnd() * 18, rnd() * 3, 0, 7); c.fill(); } }) }));
  kugel.position.y = 0.38; kugel.rotation.z = 0.4; globus.add(kugel);
  const meridian = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.008, 5, 32), M.messing); meridian.position.y = 0.38; meridian.rotation.y = Math.PI / 2; meridian.rotation.x = 0.4; globus.add(meridian);
  globus.traverse(o => { o.userData.keinKoerper = true; }); g.add(globus);
  // Kerzenleuchter mit warmem Licht, ein Stapel Buecher, ein Tintenfass mit Feder
  const leuchter = new THREE.Group(); leuchter.position.set(-0.75, PULT.h, -0.25);
  const lf = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.03, 12), M.messing); lf.position.y = 0.015; leuchter.add(lf);
  const kerze = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 10), new THREE.MeshLambertMaterial({ color: 0xf2ead2 })); kerze.position.y = 0.13; leuchter.add(kerze);
  const flamme = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd27a })); flamme.scale.y = 1.8; flamme.position.y = 0.26; leuchter.add(flamme);
  const kl = new THREE.PointLight(0xffb060, 0.5, 5, 1.6); kl.position.y = 0.3; leuchter.add(kl);
  leuchter.traverse(o => { o.userData.keinKoerper = true; }); g.add(leuchter);
  for(let k = 0; k < 3; k++){ const b = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.24), new THREE.MeshLambertMaterial({ color: BUCH_VINTAGE[k * 3] })); b.position.set(0.15 + k * 0.01, PULT.h + 0.03 + k * 0.062, -0.32); b.rotation.y = k * 0.2; b.userData.keinKoerper = true; g.add(b); }
  const stuhl = new THREE.Group(); stuhl.position.set(0, 0, 0.85);
  const sitz = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), M.holz); sitz.position.y = 0.48; stuhl.add(sitz);
  for(const sx of [-0.21, 0.21]) for(const sz of [-0.21, 0.21]){ const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.05), M.dunkel); b.position.set(sx, 0.24, sz); stuhl.add(b); }
  const lehne = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.05), M.dunkel); lehne.position.set(0, 0.78, 0.23); stuhl.add(lehne);
  g.add(stuhl);
  g.position.set(PULT.x, BODEN_Y, PULT.z); g.rotation.y = PULT.dreh;
  story.welt(4).add(g); g.updateMatrixWorld(true); story.ding(g, { welt: 4, typ: 'schreibtisch_obs' });
  // Funkgeraet (Live-Wunsch 26.10.2026): einfach auf dem Schreibtisch, links vorn neben Sternkarte und Kerze (ohne Kiste)
  if(story.funkgeraetSetzen) story.funkgeraetSetzen({ welt: 4, innen: true, eltern: g, lokal: { x: -0.78, y: PULT.h, z: 0.2 }, dreh: 0.25 });
}
// ---- Tisch mit dem Paket (das Lama kommt in lamaLaden dazu) ----------------------------------------------------------
const PAKET = { b: 0.5, t: 0.36, h: 0.32 };
function baueTisch(){
  const g = tischGestell(TISCH.b, TISCH.t, TISCH.h);
  g.position.set(TISCH.x, BODEN_Y, TISCH.z); g.rotation.y = TISCH.dreh;
  story.welt(4).add(g); g.updateMatrixWorld(true); story.ding(g, { welt: 4, typ: 'tisch_obs', form: 'quader' });
  oi.tisch = g;
  // Paket: Pappe mit Klebeband, Adressaufkleber und Marken; Schnur ueber Kreuz mit Schleife oben; zwei Laschen oben
  const P = new THREE.Group(); P.position.set(0.3, TISCH.h, 0.02); P.rotation.y = 0.25;
  const pappe = new THREE.MeshLambertMaterial({ map: leinwand(256, 256, (c, W, H) => {
    c.fillStyle = '#b88a52'; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(90,60,30,.15)'; for(let i = 0; i < 40; i++) c.fillRect(rnd() * W, 0, 1, H);
    c.fillStyle = '#efe6cf'; c.fillRect(60, 80, 130, 80); c.strokeStyle = '#776'; c.lineWidth = 3; for(let i = 0; i < 4; i++){ c.beginPath(); c.moveTo(72, 100 + i * 16); c.lineTo(172, 100 + i * 16); c.stroke(); }
    c.fillStyle = '#c0392b'; c.fillRect(200, 20, 34, 40); c.fillStyle = '#2e6da4'; c.fillRect(160, 20, 34, 40);
    c.font = 'bold 22px sans-serif'; c.fillStyle = '#e8c000'; c.fillText('POST', 20, 40); }) });
  const koerper = new THREE.Mesh(new THREE.BoxGeometry(PAKET.b, PAKET.h - 0.02, PAKET.t), pappe); koerper.position.y = (PAKET.h - 0.02) / 2; P.add(koerper);
  const laschen = [];
  for(const sz of [-1, 1]){ const l = new THREE.Group(); l.position.set(0, PAKET.h - 0.02, sz * PAKET.t / 2);
    const m = new THREE.Mesh(new THREE.BoxGeometry(PAKET.b, 0.01, PAKET.t / 2), pappe); m.position.z = -sz * PAKET.t / 4; l.add(m); P.add(l); laschen.push({ l, sz }); }
  const innen = new THREE.Mesh(new THREE.BoxGeometry(PAKET.b - 0.02, 0.005, PAKET.t - 0.02), new THREE.MeshLambertMaterial({ color: 0x2a1c10 })); innen.position.y = PAKET.h - 0.035; P.add(innen);
  // Schnur: zwei Baender ueber Kreuz, Knoten und Schleife oben
  const schnur = new THREE.Group(), sm = new THREE.MeshLambertMaterial({ color: 0xe8dcc0 }), d = 0.012;
  const band = (b, h, t, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(b, h, t), sm); m.position.set(x, y, z); schnur.add(m); };
  band(PAKET.b + 0.01, d, d, 0, PAKET.h, 0); band(d, d, PAKET.t + 0.01, 0, PAKET.h, 0);
  for(const sx of [-1, 1]) band(d, PAKET.h, d, sx * (PAKET.b / 2 + 0.004), PAKET.h / 2, 0);
  for(const sz of [-1, 1]) band(d, PAKET.h, d, 0, PAKET.h / 2, sz * (PAKET.t / 2 + 0.004));
  for(const sx of [-1, 1]){ const s = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.006, 5, 16), sm); s.position.set(sx * 0.045, PAKET.h + 0.03, 0); s.rotation.set(Math.PI / 2 - 0.5, 0, sx * 0.4); schnur.add(s); }
  P.add(schnur);
  P.traverse(o => { if(o.isMesh){ o.castShadow = true; o.userData.keinKoerper = true; } });
  g.add(P);
  oi.paket = { g: P, schnur, laschen, auf: 0, offen: false };
  seilTex();                                                          // fuer die Szene am Messer-Ring schon jetzt laden
  // Hufspuren im Staub vor dem Tisch (Lupenring): das Lama ist aus der Wueste hereingelaufen
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshLambertMaterial({ map: spurTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  sp.rotation.x = -Math.PI / 2; sp.position.set(SPUR_P.x, BODEN_Y + 0.025, SPUR_P.z); sp.renderOrder = 1; sp.userData.deko = true;
  sp.rotation.z = Math.atan2(TISCH.x - SPUR_P.x, TISCH.z - SPUR_P.z) + Math.PI;   // die Hufe zeigen zum Tisch
  story.welt(4).add(sp);
}
// Punkte in Tisch-Koordinaten (x laengs der Platte, z nach vorn) -> Welt. Die Ringe stehen auch in notizbuch.js STELLEN
// (als Zahlen, dort ist diese Datei noch nicht geladen) – beim Verschieben beide anpassen.
function tischPunkt(lx, lz){ const c = Math.cos(TISCH.dreh), s = Math.sin(TISCH.dreh); return { x: TISCH.x + lx * c + lz * s, z: TISCH.z - lx * s + lz * c }; }
const MESSER_P = tischPunkt(0.3, 1.2);                      // vor dem Paket (-634,71 / 622,80)
const SPUR_P = { x: RAUM.x + 1.6, z: RAUM.z + 6.2 };        // vorn am Eingang, auf dem Weg des Lamas von der Tuer zum Tisch
const LAMA_P = tischPunkt(0.6, -0.95);                      // hinter dem Tisch, das Paket schraeg vor der Nase (Joshi steht vorn am Messer-Ring)
// Lamaspur (Live-Wunsch 26.10.2026): zwei laengliche Zehen nebeneinander, vorn leicht gespreizt, mit kleinen Naegeln an der
// Spitze – im Wechselschritt (wie die Spur auf dem Festtisch, waldinsel.js huf), sandfarben
function huf(g, x, y, dreh, s, farbe){
  g.save(); g.translate(x, y); g.rotate(dreh); g.fillStyle = farbe;
  for(const sx of [-1, 1]){
    g.beginPath(); g.ellipse(sx * s * 0.17, s * 0.04, s * 0.14, s * 0.34, sx * 0.12, 0, 7); g.fill();                 // Zehe
    g.beginPath(); g.ellipse(sx * s * 0.22, -s * 0.36, s * 0.06, s * 0.07, sx * 0.12, 0, 7); g.fill(); }             // Nagel
  g.restore();
}
function spurBild(W, farbe, grund){
  const c = document.createElement('canvas'); c.width = c.height = W; const g = c.getContext('2d');
  if(grund){ g.fillStyle = grund; g.fillRect(0, 0, W, W); }
  for(let i = 0; i < 6; i++){ const t = i / 5, seite = i % 2 ? 1 : -1;
    huf(g, W * (0.5 + seite * 0.051), W * (0.88 - t * 0.76), 0, W * 0.114, farbe); }   // wie auf der Tischdecke: seitlich 0,09 / 1,33, Huf 0,2 / 1,33 der Weglaenge
  return c;
}
function spurTex(){ return new THREE.CanvasTexture(spurBild(512, 'rgba(196,164,108,0.85)')); }
// Unter der Lupe: dieselbe Spur auf dunklen Dielen, gross (liegt flach, Oberseite +y)
function spurModell(){
  const t = leinwand(512, 512, (g, W) => { g.drawImage(dielenTex().image, 0, 0, W, W); g.drawImage(spurBild(W, 'rgba(214,182,124,0.95)'), 0, 0); });
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.15, 48), new THREE.MeshLambertMaterial({ map: t }));   // rund: passt in die Linse
  m.rotation.x = -Math.PI / 2;
  const g = new THREE.Group(); g.add(m);
  return Promise.resolve({ g, L: 0.3 });
}
story.obsSpurModell = spurModell;
// Skizze im Notizbuch: Bleistift auf Papier (notizbuch.js seite)
story.obsSpurSeite = function(){
  const W = 1200, H = 800, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, W, H);
  const s = spurBild(640, 'rgba(70,64,58,0.85)'); g.drawImage(s, (W - 640) / 2, (H - 640) / 2);
  g.strokeStyle = 'rgba(60,55,50,.5)'; g.lineWidth = 3; g.strokeRect((W - 680) / 2, (H - 680) / 2, 680, 680);
  return c;
};
// ---- Podest mit Teleskop ------------------------------------------------------------------------------------------
function bauePodest(){
  const M = material(), g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.CylinderGeometry(PODEST.r, PODEST.r + 0.1, PODEST.h, 40), M.holz); p.position.y = PODEST.h / 2; g.add(p);
  const kante = new THREE.Mesh(new THREE.TorusGeometry(PODEST.r, 0.05, 6, 48), M.messing); kante.rotation.x = Math.PI / 2; kante.position.y = PODEST.h; kante.userData.keinKoerper = true; g.add(kante);
  for(let i = 0; i < 3; i++){ const a = Math.PI / 2 + (i - 1) * 0.28, st = new THREE.Mesh(new THREE.BoxGeometry(0.7, PODEST.h / 3, 0.35), M.dunkel);
    st.position.set(Math.sin(a) * (PODEST.r + 0.18), PODEST.h / 6 + 0.0, Math.cos(a) * (PODEST.r + 0.18)); st.rotation.y = a; st.userData.keinKoerper = true; g.add(st); }
  g.position.set(PODEST.x, BODEN_Y, PODEST.z);
  story.welt(4).add(g); g.updateMatrixWorld(true); story.ding(g, { welt: 4, typ: 'podest_obs', form: 'kreis' });
  oi.podest = g;
  teleskopLaden(g);
}
const TELE_DREH = -Math.PI / 2;                        // Rohr zum Kuppelspalt (-z): im Modell zeigt es nach -x
function teleskopLaden(podest){
  if(!window.TELESKOP_GLB || !story.ladeGlb) return;
  story.ladeGlb(window.TELESKOP_GLB, 'Teleskop', (gl) => {
    const o = gl.scene; o.traverse(m => { if(m.isMesh){ m.frustumCulled = false; m.castShadow = true; } });
    o.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), k = TELE_H / Math.max(0.01, sz.y), c = bb.getCenter(new THREE.Vector3());
    o.scale.multiplyScalar(k); o.position.set(-c.x * k, -bb.min.y * k, -c.z * k);
    const h = new THREE.Group(); h.add(o); h.position.y = PODEST.h; h.rotation.y = TELE_DREH; h.userData.keinKoerper = true;
    podest.add(h); oi.teleskop = h;
    if(gl.animations.length){ oi.teleMx = new THREE.AnimationMixer(o); const a = oi.teleMx.clipAction(gl.animations[0]); a.timeScale = 0.35; a.play(); }
  });
}

// ---- Lama (WildPoly3D, "Llama – Animated Low Poly", CC-BY-NC-4.0; Live-Wunsch 26.10.2026 statt des Hamsters) ------------
// Steht hinter dem Tisch, das Paket vor der Nase (Kopf im Modell +z). Nur idle, lookaround und walk (models/lama.glb, gekuerzt mit
// C:\tmp\gt\tiere.mjs): im Fress-Clip ginge der Kopf bis 0,4 m hinunter – durch den Tisch. Vertexfarben mit Lambert wie die
// Tiere der Waldinsel (waldinsel.js tierLaden), Groesse in der Stehhaltung gemessen.
const LA = { stehen: 'idle', umschauen: 'lookaround', laufen: 'walk' };
const LAMA_DREH_MAX = 0.8;                                  // so weit dreht es sich zu Joshi (rad) – sonst schwenkte das Hinterteil in den Tisch
function lamaLaden(){
  if(oi.lama || oi.laedt || !window.LAMA_GLB) return; oi.laedt = true;
  story.ladeGlb(window.LAMA_GLB, 'Lama', (gl) => {
    const o = gl.scene;
    o.traverse(m => { if(m.isMesh){ m.frustumCulled = false; m.castShadow = true;
      const alt = m.material; m.material = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0xffffff, skinning: !!m.isSkinnedMesh }); if(alt.dispose) alt.dispose(); } });
    const mx0 = new THREE.AnimationMixer(o), st = gl.animations.find(a => a.name === LA.stehen), v = new THREE.Vector3(), bb = new THREE.Box3();
    if(st){ mx0.clipAction(st).play(); mx0.update(0.05); } o.updateMatrixWorld(true);
    o.traverse(m => { if(!m.isSkinnedMesh) return; for(let i = 0; i < m.geometry.attributes.position.count; i += 3){ m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); bb.expandByPoint(v); } });
    const k = LAMA_H / Math.max(0.01, bb.max.y - bb.min.y), c = bb.getCenter(new THREE.Vector3());
    o.scale.multiplyScalar(k); o.position.set(-c.x * k, -bb.min.y * k, -c.z * k);
    mx0.stopAllAction(); mx0.uncacheRoot(o);
    const h = new THREE.Group(); h.add(o); h.name = 'Lama'; h.userData.agent = true;
    const pk = new THREE.Vector3(); oi.paket.g.getWorldPosition(pk);
    h.position.set(LAMA_P.x, BODEN_Y, LAMA_P.z);
    h.rotation.y = Math.atan2(pk.x - h.position.x, pk.z - h.position.z);
    story.welt(4).add(h); oi.lama = h; oi.lamaBlick = h.rotation.y; if(oi.innenSicht === false) innenZeigen(false);
    // Saeule als Grenze (Joshi laeuft nicht durch das Lama), wie die Tiere am Festtisch
    const saeule = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, LAMA_H, 10), new THREE.MeshBasicMaterial({ visible: false }));
    saeule.position.y = LAMA_H / 2; h.add(saeule); h.updateMatrixWorld(true);
    story.ding(saeule, { welt: 4, typ: 'tier:lama' });
    oi.mixer = new THREE.AnimationMixer(o); oi.acts = {};
    for(const [n, name] of Object.entries(LA)){ const a = gl.animations.find(x => x.name === name); if(a) oi.acts[n] = oi.mixer.clipAction(a); }
    lamaAnim('stehen');
    // Interaktion (innen: nur im Observatorium). Erst der Suchblick (X) schaltet es frei, wie alles.
    oi.inter = story.interaktion(h, { name: 'Lama', welt: 4, innen: true, x: TISCH.x, z: TISCH.z, r: 0.8, yx: h.position.x, yz: h.position.z, yHoehe: LAMA_H + 0.3, rolle: 'lama', aktion: lamaY });
  });
}
function lamaAnim(n){
  const a = oi.acts[n]; if(!a || oi.cur === n) return;
  const alt = oi.cur && oi.acts[oi.cur]; a.reset(); a.play(); if(alt) a.crossFadeFrom(alt, 0.3, false); oi.cur = n;
}

// ---- Ablauf ---------------------------------------------------------------------------------------------------------
function lamaY(o){
  if(o.spricht) return; o.spricht = true;
  const fertig = () => { o.spricht = false; };
  oi.zuJoshi = true;                                                // dreht sich zu Joshi, solange er spricht
  const zurueck = () => { oi.zuJoshi = false; fertig(); };
  if(oi.stufe === 'gesucht'){ oi.stufe = 'schnur';
    story.sprich(T.joshiHallo, null, 'joshi');
    story.sprich(T.lamaGenervt, () => { zurueck(); fuchsZu('schnur_messer'); }, 'lama'); return; }
  if(oi.stufe === 'schnur'){ story.sprich(T.lamaNochmal, zurueck, 'lama'); return; }
  if(lamaY2(o, zurueck)) return;                                   // Teil 2: nach dem Vergleich, nach dem Packpapier
  story.sprich(T.lamaBeschaeftigt, zurueck, 'lama');
}
// Messer-Ring (notizbuch.js STELLEN 'schnur_messer', Live-Wunsch 26.10.2026): eine Szene wie das Schnitzen – das Messer
// schneidet gross im Bild durch ein Seil (obsSeilModell), danach eine Skizze vom Seil. Ist die Stelle fertig (e4StelleFertig),
// ist die Schnur am Paket ab, die Laschen springen auf, und das Lama dankt.
function schnurAuf(){
  schnipp(); oi.paket.schnur.visible = false; oi.paket.offen = true; oi.stufe = 'offen';
  story.spaeter(0.6, () => { oi.zuJoshi = true; story.sprich(T.danke, () => { oi.zuJoshi = false; }, 'lama'); });
}
// Das Seil: gerade, mit der Textur von "Rope" (xenosmashgames, CC-BY-4.0, seil_tex.js), laenge 1 in zwei Haelften. seilAuf(k):
// 0 = ganz, 1 = durchgeschnitten (die Haelften gehen auseinander; Live-Wunsch 26.10.2026: ohne Fasern, ohne Spaene). Live-Wunsch 26.10.2026:
// das Seil liegt im weissen Oval wie beim Schnitzen und laeuft an beiden Enden darin aus – je Haelfte ein eigenes Bild, die
// Textur laengs gekachelt, das aeussere Ende wird durchsichtig (so sieht man keine Enden).
let seilBild = null;
function seilTex(){ if(!seilBild && window.SEIL_TEX){ seilBild = new Image(); seilBild.src = window.SEIL_TEX; } return seilBild; }
const SEIL_R = 0.028;
function seilHaelfteTex(oben){                                      // oben: das aeussere Ende liegt oben im Bild (v = 1)
  const W = 256, H = Math.round(W * 0.5 / (2 * Math.PI * SEIL_R)), c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const b = seilTex(); if(b && b.complete && b.naturalWidth) for(let y = 0; y < H; y += W) g.drawImage(b, 0, y, W, W); else { g.fillStyle = '#b08a5a'; g.fillRect(0, 0, W, H); }
  g.globalCompositeOperation = 'destination-in'; const gr = g.createLinearGradient(0, 0, 0, H);
  if(oben){ gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.55, 'rgba(0,0,0,1)'); } else { gr.addColorStop(0.45, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); }
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  return new THREE.CanvasTexture(c);
}
function seilBauen(){
  const g = new THREE.Group(), haelften = [];
  for(const sx of [-1, 1]){
    // rotation.z = PI/2 legt das obere Ende (+y, v = 1) nach -x: links ist das aeussere Ende oben im Bild, rechts unten
    const mat = new THREE.MeshLambertMaterial({ map: seilHaelfteTex(sx < 0), transparent: true });
    const h = new THREE.Group(), m = new THREE.Mesh(new THREE.CylinderGeometry(SEIL_R, SEIL_R, 0.5, 18, 1, false), mat);
    m.rotation.z = Math.PI / 2; m.position.x = sx * 0.25; h.add(m);
    g.add(h); haelften.push({ h, sx });
  }
  g.userData.seilAuf = (k) => { for(const q of haelften){ q.h.position.x = q.sx * 0.05 * k; q.h.rotation.z = -q.sx * 0.08 * k; } };
  g.userData.seilAuf(0);
  return g;
}
story.obsSeilModell = () => Promise.resolve({ g: seilBauen(), L: 1 });
// Skizze: das durchgeschnittene Seil (Bleistift, wie die Lama-Skizze) – geschwungen (Live-Wunsch 26.10.2026), zwei Haelften mit
// einer Luecke in der Mitte, die Enden laufen wie in der Szene aus
story.obsSeilSkizze = function(){
  const g = new THREE.Group(), welle = (x) => Math.sin(x * 5.5) * 0.06 + Math.sin(x * 2.3 + 1) * 0.03;
  for(const sx of [-1, 1]){
    const pts = []; for(let i = 0; i <= 24; i++){ const x = sx * (0.04 + i / 24 * 0.46); pts.push(new THREE.Vector3(x, welle(x), Math.cos(x * 4) * 0.04)); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, SEIL_R, 12, false), new THREE.MeshLambertMaterial({ color: 0xb08a5a }));
    g.add(m);
  }
  g.rotation.set(0.45, 0, -0.05);
  return story.modellBleistift ? story.modellBleistift(g, 0) : null;
};
// kurzes Schnipp (gefiltertes Rauschen)
function schnipp(){
  if(!soundOn || !audioCtx || audioCtx.state !== 'running') return;
  const n = Math.floor(audioCtx.sampleRate * 0.09), b = audioCtx.createBuffer(1, n, audioCtx.sampleRate), d = b.getChannelData(0);
  for(let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  const q = audioCtx.createBufferSource(); q.buffer = b; const f = audioCtx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2500;
  const gn = audioCtx.createGain(); gn.gain.value = 0.35; q.connect(f); f.connect(gn); gn.connect(audioCtx.destination); q.start();
}
// Hinausgehen (Live-Wunsch 26.10.2026, wie in Etappe 2): ist draussen etwas Neues frei (Skizzenring, Holzscheit am Parkplatz), sagt die
// Erzaehlerin "Schau mal, dein Fuchs hat noch etwas gefunden", und der Fuchs laeuft alle noch offenen Ringe draussen ab
const DRAUSSEN = ['obs_skizze', 'schluessel_schnitzen'];
function draussenZeigen(){
  const fertig = (id) => story.stelleZustand && story.stelleZustand(id) === 'fertig';
  const offen = DRAUSSEN.filter(id => story.obsStelleFrei && story.obsStelleFrei(id) && !fertig(id));
  const neu = offen.filter(id => !(oi.gezeigt || (oi.gezeigt = {}))[id]);
  if(!neu.length) return;
  oi.skizzeZeigen = false;
  story.spaeter(1.2, () => {
    if(oi.drin || !eva || !story.fuchsRundgang) return;
    const ks = offen.map(id => story.kreisZielVon && story.kreisZielVon(id)).filter(Boolean); if(!ks.length) return;
    for(const id of neu) oi.gezeigt[id] = true;
    ks.forEach(k => { k.frei = true; });
    story.sprich(T.fuchsFund);
    story.spaeter(0.6, () => { if(!oi.drin && eva) story.fuchsRundgang(eva.group.position.x, eva.group.position.z, false, 0, true, q => ks.includes(q)); });
  });
}
function fuchsZu(id){
  const k = story.kreisZielVon && story.kreisZielVon(id); if(!k) return;
  k.frei = true;
  if(!eva || !story.fuchsRundgang) return;
  story.spaeter(0.6, () => story.fuchsRundgang(eva.group.position.x, eva.group.position.z, true, 0, true, q => q === k));
}
// notizbuch.js: Stellen und ihre Bedingungen
const AB = (...st) => st.includes(oi.stufe);
story.obsStelleFrei = function(id){
  if(id === 'schnur_messer') return oi.stufe === 'schnur';
  if(id === 'lama_spur') return oi.stufe === 'offen' || oi.stufe === 'spur';
  if(id === 'packpapier_lupe') return AB('erzaehlt', 'papier', 'fertig', 'schluessel');
  if(id === 'lama_foto') return AB('fertig', 'schluessel');
  if(id === 'obs_skizze') return AB('fertig', 'schluessel') && !!story.teleskopGeschaut;
  if(id === 'schluessel_schnitzen') return AB('fertig', 'schluessel');
  return false;
};
story.e4StelleFertig = function(id){
  if(id === 'schnur_messer' && oi.stufe === 'schnur') schnurAuf();
  if(id === 'lama_spur' && oi.stufe === 'offen'){ oi.stufe = 'spur'; story.spaeter(0.4, () => story.sprich(story.obsText.nochEineSpur)); }
  if(id === 'packpapier_lupe' && oi.stufe === 'erzaehlt'){ oi.stufe = 'papier'; story.spaeter(0.4, () => story.sprich(story.obsText.papierFertig)); }
  if(id === 'schluessel_schnitzen' && oi.stufe === 'fertig') oi.stufe = 'schluessel';
};
story.e4Gesucht = function(){ if(oi.drin && oi.stufe === 'x') oi.stufe = 'gesucht'; };
story.e4HinweisInnen = function(){
  const T2 = story.obsText;
  if(!oi.drin) return oi.stufe === 'fertig' ? T2.hinweisScheit : oi.stufe === 'schluessel' ? T2.hinweisFliegen : null;   // draussen (sonst wueste.js)
  if(oi.stufe === 'spur') return T2.hinweisVergleich;
  if(oi.stufe === 'verglichen') return T2.hinweisFragen;
  if(oi.stufe === 'erzaehlt') return T2.hinweisPapier;
  if(oi.stufe === 'papier') return T2.hinweisWem;
  if(oi.stufe === 'fertig') return T2.hinweisFertig;
  if(oi.stufe === 'schluessel') return T2.hinweisFliegen;
  if(oi.stufe === 'x') return T.hinweisX;
  if(oi.stufe === 'gesucht') return T.hinweisLama;
  if(oi.stufe === 'schnur') return T.hinweisSchnur;
  if(oi.stufe === 'offen') return T.hinweisUmschauen;
  return T.hinweisSpur;
};
story.obsPositionen = { MESSER_P, SPUR_P, TISCH, RAUM };
// Durch das Teleskop schauen (teleskop.js, Live-Wunsch 23.10.2026): freiwillig, erst wenn alle Aufgaben der Etappe erledigt
// sind (stufe 'fertig'). Dann meldet sich das Teleskop als Interaktionsobjekt – wie alles erst nach dem Suchblick (X).
// Test: index.html?etappe=4&teleskop (story.teleskopTest) – frei von Anfang an, und gleich nach dem Hineingehen offen.
function teleskopFrei(){ return oi.stufe === 'fertig' || !!story.teleskopTest; }
function teleskopMelden(){
  if(oi.teleInter || !oi.podest || !teleskopFrei() || !story.teleskopAuf) return;
  oi.teleInter = story.interaktion(oi.podest, { name: 'Teleskop', welt: 4, innen: true, x: PODEST.x, z: PODEST.z, r: PODEST.r, yHoehe: 3.4,
    aktion: () => story.teleskopAuf() });
  oi.teleInter.entdeckt = true;                                     // das Lama hat es angeboten
}


// ==== Teil 2 (Live-Wunsch 23.10.2026): Spuren vergleichen, Packpapier, Mond-Bewohner, Foto, Skizze, Schluessel, Abflug ====
// Stufen weiter: 'spur' (Lupe im Staub) -> 'verglichen' (im Notizbuch auf dem Tatortfoto) -> 'erzaehlt' (das Lama erzaehlt
// vom verwuesteten Tisch) -> 'papier' (Lupe am Packpapier: Eichhoernchenspur und rotes Fell) -> 'fertig' (das Lama erzaehlt
// vom Mond-Bewohner und vom X-Wing ohne Schluessel; Teleskop, Foto- und Skizzenring, draussen der Schnitzring am Holzscheit)
// -> 'schluessel' (Schluessel geschnitzt) -> Joshi fliegt den X-Wing selbst zum roten Punkt -> Globus zum Mond.
const T2 = {
  nochEineSpur: ['Vergleich sie doch mal mit der Spur vom Tatort.'],   // direkt nach "Schau mal, Spuren im Staub" (keine Wiederholung)
  hinweisVergleich: ['Schau in deinem Rucksack ins Notizbuch. Bei der neuen Spur drückst du A.'],
  vergleichStart: ['Schau mal genau hin ...'],
  vergleichFalsch: ['Diese Spuren stimmen nicht mit denen aus dem Observatorium überein.'],   // Live-Wunsch 26.10.2026
  vergleichPasst: ['Aber diese hier passen ganz genau! Das Lama war also am Festtisch der Tiere.', 'Frag es doch mal, was es dort gemacht hat.'],
  hinweisFragen: ['Sprich noch einmal mit dem Lama.'],
  joshiSpur: ['Lama, deine Spur ist auf dem Festtisch der Tiere! Wie kommt sie dahin? Was hast du dort gemacht?'],   // nicht "unserem" (Live-Wunsch 26.10.2026)
  lamaTisch: ['Ach das! Die Post hat mein Paket aus Versehen auf die Waldinsel gebracht.',
    'Als ich es abholen wollte, war der Tisch schon ganz verwüstet. Niemand war da, nur der Uhu hat geschlafen.',
    'Da bin ich einfach über den Tisch gestakst. Wie sollte ich denn sonst an mein Paket kommen?'],
  hinweisPapier: ['Am Tisch ist ein brauner Kreis. Schau dir das Packpapier ganz genau an.'],
  papierFertig: ['Dann hat das Lama nicht geflunkert. Die Spuren mit den langen Zehen auf seinem Paket sind von jemand anderem.', 'Aber wem gehören sie – und das gestreifte Fell?'],
  hinweisWem: ['Frag doch das Lama, wem die Spuren gehören könnten.'],
  joshiWem: ['Weißt du, wem die Spuren mit den langen Zehen und das gestreifte Fell gehören?'],
  lamaMond: ['Nein, das weiß ich leider nicht.', 'Aber auf dem Mond wohnt seit Kurzem jemand. Der hat bestimmt alles von oben gesehen!',
    'Schau ruhig mal durch mein Teleskop. Man sieht ihn gut, er blinkt immer so lustig.',
    'Und wenn du zu ihm willst: Draußen steht mein Raumschiff. Das darfst du gerne nehmen.',
    'Aber ich habe leider den Schlüssel verloren ...'],
  lamaSchluessel: ['Hast du schon einen Schlüssel für mein Raumschiff?'],
  lamaGluck: ['Viel Glück auf dem Mond!'],
  hinweisFertig: ['Schau doch mal durch das Teleskop. Oder geh hinaus zum Raumschiff.'],
  hinweisScheit: ['Neben dem Raumschiff liegt ein Holzscheit. Vielleicht kannst du daraus einen Schlüssel schnitzen.'],
  hinweisFliegen: ['Du hast einen Schlüssel! Steig in das Raumschiff und flieg zum Mond.'],
  xwingZu: ['Das Raumschiff ist abgeschlossen. Du brauchst einen Schlüssel.'],
  xwingAuf: ['Klick! Der Schlüssel passt. Auf geht es zum Mond!'],
};
Object.assign(story.obsText, T2);

// Packpapier auf dem Tisch (nach dem Aufschneiden): ein Bogen braunes Papier neben dem Paket, leicht zerknittert
const PAPIER_P = tischPunkt(-0.6, 1.25);                  // Lupenring davor (-635,53 / 622,41)
function papierTex(spuren){
  return leinwand(512, 512, (g, W) => {
    g.fillStyle = '#a8794a'; g.fillRect(0, 0, W, W);
    for(let i = 0; i < 60; i++){ g.strokeStyle = 'rgba(70,45,20,' + (0.08 + rnd() * 0.1) + ')'; g.lineWidth = 1 + rnd() * 2; g.beginPath(); g.moveTo(rnd() * W, rnd() * W); g.lineTo(rnd() * W, rnd() * W); g.stroke(); }
    g.fillStyle = 'rgba(255,240,210,.12)'; for(let i = 0; i < 20; i++) g.fillRect(rnd() * W, rnd() * W, 40 + rnd() * 80, 2);
    if(!spuren) return;
    // Eichhoernchen: grosse Hinterpfoten (fuenf lange Zehen) paarweise vorn, kleine Vorderpfoten dahinter – in zwei Spruengen
    const pf = (x, y, s, zehen, lang) => { g.save(); g.translate(x, y); g.fillStyle = 'rgba(40,24,10,.9)';
      g.beginPath(); g.ellipse(0, s * 0.18, s * 0.3, s * 0.26, 0, 0, 7); g.fill();
      for(let i = 0; i < zehen; i++){ const a = (i / (zehen - 1) - 0.5) * 1.8; g.beginPath(); g.ellipse(Math.sin(a) * s * 0.42, -Math.cos(a) * s * 0.36 - (lang ? s * 0.12 : 0), s * (lang ? 0.08 : 0.1), s * (lang ? 0.17 : 0.1), a, 0, 7); g.fill(); }
      g.restore(); };
    for(const y0 of [140, 360]){ for(const sx of [-1, 1]){ pf(256 + sx * 52, y0, 70, 5, true); pf(256 + sx * 24, y0 + 90, 40, 4, false); } }
    // Fell, weiss und rotbraun (wie das Eichhoernchen)
    for(let i = 0; i < 26; i++){ const x = 360 + rnd() * 90, y = 230 + rnd() * 80, a = -0.8 + rnd() * 0.6, L = 40 + rnd() * 50;
      g.strokeStyle = i % 3 ? 'rgba(168,80,42,.95)' : 'rgba(242,239,232,.95)'; g.lineWidth = 2 + rnd() * 2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 8, y + Math.sin(a) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  });
}
function papierBauen(){
  if(oi.papier || !oi.tisch) return;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.42, 4, 3), new THREE.MeshLambertMaterial({ map: papierTex(false), side: THREE.DoubleSide }));
  const p = m.geometry.attributes.position; for(let i = 0; i < p.count; i++) p.setZ(i, (rnd() - 0.5) * 0.015);   // zerknittert
  m.geometry.computeVertexNormals(); m.rotation.x = -Math.PI / 2; m.rotation.z = 0.4; m.position.set(-0.55, TISCH.h + 0.008, 0.12);
  m.userData.keinKoerper = true; oi.tisch.add(m); oi.papier = m;
}
// Lupe: das Packpapier mit den Spuren und dem Fell (liegt flach), Skizze ins Notizbuch
story.obsPapierModell = function(){
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.15, 48), new THREE.MeshLambertMaterial({ map: papierTex(true) }));
  m.rotation.x = -Math.PI / 2; const g = new THREE.Group(); g.add(m); return Promise.resolve({ g, L: 0.3 });
};
story.obsPapierSeite = function(){
  const W = 1200, H = 800, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, W, H);
  const bild = papierTex(true).image, k = document.createElement('canvas'); k.width = k.height = 512; const kg = k.getContext('2d');
  kg.drawImage(bild, 0, 0); const id = kg.getImageData(0, 0, 512, 512), d = id.data;
  // Fell rot lassen; die weissen Haare grau wie beim Bananenkorb (hoehle_innen.js fellBild – Live-Befund 29.10.2026: sie fehlten,
  // das Helle wurde mit dem Papier durchsichtig); der Rest Bleistift
  for(let i = 0; i < d.length; i += 4){ const r = d[i], gg = d[i + 1], b = d[i + 2], rot = r > 140 && r > gg * 1.6, hell = r > 200 && gg > 190 && b > 170;
    if(rot) continue; if(hell){ d[i] = 120; d[i + 1] = 110; d[i + 2] = 100; d[i + 3] = 165; continue; }
    const v = (r + gg + b) / 3, dunkel = v < 90; d[i] = d[i + 1] = d[i + 2] = dunkel ? 70 : 244; d[i + 3] = dunkel ? 230 : 0; }
  kg.putImageData(id, 0, 0); g.drawImage(k, (W - 600) / 2, (H - 600) / 2, 600, 600);
  g.strokeStyle = 'rgba(60,55,50,.5)'; g.lineWidth = 3; g.strokeRect((W - 640) / 2, (H - 640) / 2, 640, 640);
  return c;
};

// ---- Spuren vergleichen im Notizbuch (Live-Wunsch 26.10.2026) -------------------------------------------------------
// Liegt die neue Seite "Die Spur des Lamas" offen, steht darauf ein gruenes A. A -> das Buch blaettert von selbst zum
// Tatortfoto ("Der Festtisch"); die frisch gezeichnete Spur kommt von rechts heruebergeflogen, dreht sich und legt sich genau
// auf die Spur des Eichhoernchens (passt nicht: roter Rahmen), dann genau auf die des Lamas (passt: gruener Rahmen). Wohin sie
// muss, kommt aus der Kamera des Tatortfotos (notizbuch.js tisch_foto) und den Wegen der Spuren auf dem Tisch (waldinsel.js
// e2SpurWege) – die Staubspur hat dieselben Abstaende wie die auf der Decke. Danach blaettert es zurueck: unter der Spur steht
// jetzt das Lama als Skizze, auf derselben Seite.
// ausruestung.js ruft story.buchA (A im offenen Buch), story.buchSperre, story.buchTick (jedes Bild) und story.buchUeber (malt).
const SPURSEITE = 'Die Spur des Lamas', FOTOSEITE = 'Der Festtisch';
const VG = { flug: 1.6, rot: 3.4, gruen: 2.2, weg: 0.6 };   // rot 3,4 s: der laengere Satz dazu (26.10.2026) soll ausgesprochen sein, bevor es weiterwandert
let spurOverlay = null;
const seitenIndex = (name) => story.notizSeiten().findIndex(s => s.name === name);
story.buchSperre = () => !!(oi.vergleich && !oi.vergleich.fertig);
story.buchA = function(lage){
  if(!e4() || oi.stufe !== 'spur' || oi.vergleich || !lage || !lage.some(q => q.s && q.s.name === SPURSEITE) || seitenIndex(FOTOSEITE) < 0) return false;
  oi.vergleich = { phase: 'hin', t: 0 };
  if(story.gehaltenVergessen){ story.gehaltenVergessen(T2.nochEineSpur); story.gehaltenVergessen(T2.hinweisVergleich); }   // nicht nach dem Inventar wiederholen
  story.sprich(T2.vergleichStart, null, 'inventar'); return true;
};
// Lage einer Spur auf dem Foto: Mitte, Drehung (Spur laeuft im Bild "nach oben"), Laenge – als Anteil der Fotobreite/-hoehe
const _vk = new THREE.PerspectiveCamera(), _vp = new THREE.Vector3();
function spurAufFoto(weg){
  const S = story.stelleInfo && story.stelleInfo('tisch_foto'), W = story.e2SpurWege; if(!S || !W) return null;
  const b = S.blick; _vk.fov = b.fov; _vk.aspect = 1.5; _vk.near = 0.5; _vk.far = 100; _vk.updateProjectionMatrix();
  _vk.position.set(b.x, b.y, b.z); _vk.rotation.set(b.pitch, b.yaw, 0, 'YXZ'); _vk.updateMatrixWorld(true);
  const y = (typeof ISLAND_Y === 'number' ? ISLAND_Y : 0) + W.tisch.H + 0.02;                                             // global-ok: Engine
  const p = weg.map(q => { _vp.set(W.tisch.x + q.x, y, W.tisch.z + q.z).project(_vk); return { u: (_vp.x + 1) / 2, v: (1 - _vp.y) / 2 }; });
  return { u: (p[0].u + p[1].u) / 2, v: (p[0].v + p[1].v) / 2, du: p[1].u - p[0].u, dv: p[1].v - p[0].v };
}
story.spurAufFoto = spurAufFoto;                                     // mondbasis_innen.js: die Spur im Labor auf dem Tatortfoto
// Laufende Animation (jedes Bild bei offenem Buch): erst zum Foto blaettern, dann vergleichen, dann zurueck zur Spurseite
story.buchTick = function(dt, lage){
  if(!e4() || !lage) return false;
  const V = oi.vergleich;
  if(!V) return oi.stufe === 'spur' && lage.some(q => q.s && q.s.name === SPURSEITE);   // nur das A pulsiert
  if(V.fertig) return false;
  if(V.phase === 'hin'){ if(story.buchZuSeite(seitenIndex(FOTOSEITE))){ V.phase = 'vergleich'; V.t = 0; } return true; }
  if(V.phase === 'vergleich'){
    const t0 = V.t; V.t += dt;
    const am = (a) => t0 < a && V.t >= a;
    if(am(VG.flug)) story.sprich(T2.vergleichFalsch, null, 'inventar');
    if(am(VG.flug + VG.rot + VG.flug)) story.sprich(T2.vergleichPasst, null, 'inventar');
    if(V.t > VG.flug * 2 + VG.rot + VG.gruen + VG.weg){ V.phase = 'zurueck'; lamaAufSpurseite(); }
    return true;
  }
  if(V.phase === 'zurueck'){ if(story.buchZuSeite(seitenIndex(SPURSEITE))){ V.fertig = true; oi.stufe = 'verglichen'; fuchsZumLama(); } return true; }
  return false;
};
story.buchUeber = function(c, lage){
  if(!e4() || !lage) return;
  const V = oi.vergleich;
  // gruenes A auf der Spurseite (pulsiert), solange noch nicht verglichen
  if(!V && oi.stufe === 'spur'){ const f = lage.find(q => q.s && q.s.name === SPURSEITE); if(!f || !story.knopfTextur) return;
    const a = story.knopfTextur('A').image, g = 90 * (1 + Math.sin(oi.t * 5) * 0.08);
    c.drawImage(a, f.x + f.w / 2 - g / 2, f.y + f.h + 6, g, g); return; }
  if(!V || V.fertig || V.phase !== 'vergleich') return;
  const f = lage.find(q => q.s && q.s.name === FOTOSEITE); if(!f) return;
  const W2 = story.e2SpurWege, falsch = W2 && spurAufFoto(W2.hoernchen), richtig = W2 && spurAufFoto(W2.lama); if(!falsch || !richtig) return;
  if(!spurOverlay) spurOverlay = spurBild(256, 'rgba(45,28,12,1)');
  // Ziel in Seiten-Pixeln (Mitte des Fotos = 0, 0): Mitte, Drehung, Groesse (die Spur nimmt 0,76 ihres Bildes ein)
  const ziel = (s) => { const dx = s.du * f.w, dy = s.dv * f.h; return { x: (s.u - 0.5) * f.w, y: (s.v - 0.5) * f.h, r: Math.atan2(dx, -dy), g: Math.hypot(dx, dy) / 0.76 }; };
  const start = { x: f.w * 1.35, y: 0, r: 0, g: f.w * 0.42 }, A = ziel(falsch), B = ziel(richtig);
  const mix = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, r: a.r + (b.r - a.r) * k, g: a.g + (b.g - a.g) * k });
  const w = (k) => k * k * (3 - 2 * k), t = V.t, T1 = VG.flug, T2_ = T1 + VG.rot, T3 = T2_ + VG.flug, T4 = T3 + VG.gruen;
  let p, rahmen = null, alpha = 0.95;
  if(t < T1) p = mix(start, A, w(t / T1));
  else if(t < T2_){ p = A; rahmen = '#e8352b'; }
  else if(t < T3) p = mix(A, B, w((t - T2_) / VG.flug));
  else { p = B; rahmen = '#2ecc40'; if(t > T4) alpha = 0.95 * Math.max(0, 1 - (t - T4) / VG.weg); }
  c.save(); c.translate(f.x + f.w / 2, f.y + f.h / 2); c.rotate(f.dreh || 0);
  c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = alpha;
  c.shadowColor = 'rgba(255,250,235,1)'; c.shadowBlur = 14;                                   // heller Schein: hebt sich vom Foto ab
  c.drawImage(spurOverlay, -p.g / 2, -p.g / 2, p.g, p.g); c.shadowBlur = 0;
  if(rahmen){ const b = 0.55 + 0.45 * Math.abs(Math.sin(t * 7)); c.globalAlpha = alpha * b; c.strokeStyle = rahmen; c.lineWidth = 10;
    c.strokeRect(-p.g * 0.2, -p.g * 0.44, p.g * 0.4, p.g * 0.88); }                          // eng um die Spur (sie ist schmal und lang)
  c.restore(); c.restore();
};
// Nach dem Vergleich (Live-Wunsch 26.10.2026): der Fuchs laeuft zum Lama und zeigt es (es leuchtet auf) – sobald das Buch zu ist
function fuchsZumLama(){
  if(!oi.inter || !eva || !story.fuchsRundgang) return;
  story.fuchsRundgang(eva.group.position.x, eva.group.position.z, true, 0, true, q => q === oi.inter);
}
// Unter die Spur auf derselben Seite: das Lama als Bleistift-Skizze (aus dem Modell im Observatorium, schraeg von vorn)
function lamaAufSpurseite(){
  const s = story.notizSeiten()[seitenIndex(SPURSEITE)]; if(!s || s.mitLama || !oi.lama || !story.modellBleistift) return;
  const lama = story.modellBleistift(oi.lama, -0.7), alt = s.bild, W = alt.width, H = alt.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H * 2 - 40; const g = c.getContext('2d');
  g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(alt, 0, 0); g.drawImage(lama, 0, H - 40, W, H);
  s.bild = c; s.mitLama = true;
}

// ---- Gespraeche mit dem Lama (nach der Schnur) ------------------------------------------------------------------------
function lamaY2(o, zurueck){
  if(oi.stufe === 'verglichen'){ oi.stufe = 'erzaehlt';
    story.sprich(T2.joshiSpur, null, 'joshi'); story.sprich(T2.lamaTisch, () => { zurueck(); papierBauen(); fuchsZu('packpapier_lupe'); }, 'lama'); return true; }
  if(oi.stufe === 'papier'){ oi.stufe = 'fertig';
    story.sprich(T2.joshiWem, null, 'joshi');
    story.sprich(T2.lamaMond, () => { zurueck(); if(oi.teleInter){ oi.teleInter.entdeckt = true; } fuchsZu('lama_foto'); }, 'lama'); return true; }
  if(oi.stufe === 'fertig'){ story.sprich(T2.lamaSchluessel, zurueck, 'lama'); return true; }
  if(oi.stufe === 'schluessel'){ story.sprich(T2.lamaGluck, zurueck, 'lama'); return true; }
  return false;
}
// Foto: das Lama, links das Teleskop (blauer Ring beim Hinausgehen, vorn zwischen Tuer und Tisch). Live-Wunsch 26.10.2026: das
// Lama laeuft dafuer in die freie Flaeche zwischen Tisch und Teleskop (um die Tischecke herum), schaut in die Kamera und geht
// nach dem Foto wieder an sein Paket (lamaGang).
const LAMA_UM = { x: RAUM.x + 5.8, z: RAUM.z - 0.1 }, LAMA_FOTO = { x: RAUM.x + 3.2, z: RAUM.z };   // um die Tischecke / zum Foto
story.obsFotoVorbereiten = function(){ oi.fotoBlick = { x: -637.0, z: 626.0, bis: oi.t + 8 };      // = Fotoring (notizbuch.js lama_foto)
  if(oi.lama && !oi.gang) oi.gang = { weg: [LAMA_P, LAMA_UM, LAMA_FOTO], i: 1, zurueck: false }; };
const LAMA_V = 1.3;                                          // m/s
function lamaGang(dt){
  const G = oi.gang, h = oi.lama, p = h.position;
  if(G.i >= G.weg.length){                                    // angekommen
    if(G.zurueck){ oi.gang = null; return false; }            // wieder am Paket: weiter wie gewohnt (dreht zum Paket zurueck)
    if(oi.fotoBlick){ const f = oi.fotoBlick; let dw = Math.atan2(f.x - p.x, f.z - p.z) - h.rotation.y; dw = Math.atan2(Math.sin(dw), Math.cos(dw));
      h.rotation.y += dw * Math.min(1, dt * 4); lamaAnim('stehen'); return true; }
    G.weg = G.weg.slice().reverse(); G.i = 1; G.zurueck = true;   // Foto vorbei: zurueck
  }
  const z = G.weg[G.i], dx = z.x - p.x, dz = z.z - p.z, d = Math.hypot(dx, dz), s = LAMA_V * dt;
  if(d <= s){ p.x = z.x; p.z = z.z; G.i++; }
  else { p.x += dx / d * s; p.z += dz / d * s; let dw = Math.atan2(dx, dz) - h.rotation.y; dw = Math.atan2(Math.sin(dw), Math.cos(dw)); h.rotation.y += dw * Math.min(1, dt * 6); }
  lamaAnim('laufen'); return true;
}
// Skizze: das Observatorium in der Oase unter dem Nachthimmel mit dem Mond. Seit 26.10.2026 steht der rote Ring draussen vor
// dem Observatorium (Live-Wunsch: eine Skizze der Oase zeichnet man nicht drinnen). Nur fuer die Aufnahme selbst (notizbuch.js
// beiAufnahme, im selben Augenblick): Nacht und der Mond als grosse Scheibe am Himmel – auf dem Bildschirm bleibt es Tag.
let skizzenMond = null;
story.obsSkizzeAufnahme = function(an){
  if(an){
    himmel(true);
    skizzenMond = new THREE.Mesh(new THREE.CircleGeometry(16, 40), new THREE.MeshBasicMaterial({ color: 0xe8e4d4, fog: false }));
    const cam = new THREE.Vector3(-7, 2.2, 9), dir = new THREE.Vector3(-0.37, 0.62, -0.69).normalize();   // = Blick der Skizze, etwas links
    skizzenMond.position.copy(cam).addScaledVector(dir, 420); skizzenMond.lookAt(cam); skizzenMond.userData.deko = true; scene.add(skizzenMond);   // global-ok
  } else {
    himmel(!!oi.drin);
    if(skizzenMond){ scene.remove(skizzenMond); skizzenMond.geometry.dispose(); skizzenMond.material.dispose(); skizzenMond = null; }   // global-ok
  }
};
// Teleskop zu (teleskop.js): danach ist der Skizzenring draussen frei; der Fuchs zeigt ihn, sobald Joshi hinausgeht
story.teleskopDanach = function(){ if(!e4() || !oi.drin || oi.stufe === 'x') return; const k = story.kreisZielVon && story.kreisZielVon('obs_skizze'); if(k){ k.frei = true; oi.skizzeZeigen = true; } };

// ---- Draussen: Holzscheit (von Anfang an, ohne Kreis), Schnitzring, Raumschiff mit Schluessel, Abflug -------------------
const SCHEIT_P = { x: -22.5, z: 9.5 };                    // am Parkplatz (notizbuch.js STELLEN schluessel_schnitzen)
function scheitSetzen(){
  if(oi.scheit || oi.scheitWeg || !story.setze || !story.welt) return;
  oi.scheit = story.setze('holzscheit', 4, { x: SCHEIT_P.x, z: SCHEIT_P.z, dreh: 0.8, fest: true });
}
story.obsScheit = () => oi.scheit;
story.obsScheitWeg = () => { oi.scheitWeg = true; oi.scheit = null; };
let schluesselVorlage = null;
story.obsSchluesselModell = function(){
  return new Promise((ok, no) => {
    const fertig = () => { const g = schluesselVorlage.clone(true); g.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(g), L = Math.max(...bb.getSize(new THREE.Vector3()).toArray()); ok({ g, L }); };
    if(schluesselVorlage) return fertig();
    if(!window.SCHLUESSEL_GLB || !story.ladeGlb) return no(new Error('Schluessel fehlt'));
    story.ladeGlb(window.SCHLUESSEL_GLB, 'Schluessel', (gl) => {
      const o = gl.scene; o.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3()); o.position.sub(c);
      const h = new THREE.Group(); h.add(o); h.rotation.x = -Math.PI / 2;                     // laengs (z) -> hochkant (y): Bart unten
      // Bart nach unten (Live-Wunsch: im Regal 'mit dem Schluessel nach unten'): der breite Griffring gehoert nach oben – sonst umdrehen
      const aussen = new THREE.Group(); aussen.add(h); aussen.updateMatrixWorld(true);
      const v = new THREE.Vector3(), bb2 = new THREE.Box3().setFromObject(aussen), mitte = (bb2.min.y + bb2.max.y) / 2; let oben = 0, unten = 0;
      aussen.traverse(m => { if(!m.isMesh) return; const p = m.geometry.attributes.position; for(let i = 0; i < p.count; i += 2){ v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
        const w = Math.abs(v.x); if(v.y > mitte) oben = Math.max(oben, w); else unten = Math.max(unten, w); } });
      if(unten > oben) h.rotation.x = Math.PI / 2;
      schluesselVorlage = aussen; fertig();
    });
  });
};
// Raumschiff (der geparkte X-Wing, wueste.js): Y erst, wenn das Lama davon erzaehlt hat
function xwingMelden(){
  const Z = story.e4Zustand; if(oi.xwInter || !Z || !Z.xwing || !(oi.stufe === 'fertig' || oi.stufe === 'schluessel')) return;
  const P = story.oase && story.oase.parkplatz; if(!P) return;
  // r 6: das Y kommt bis 7,6 m um die Mitte (story.js INTER_Y_R) – auch vorn vor der Nase (6,25 m), nicht nur seitlich
  oi.xwInter = story.interaktion(Z.xwing, { name: 'Raumschiff', welt: 4, x: P.x, z: P.z, r: 6, yHoehe: 4.2, aktion: xwingY });
  oi.xwInter.entdeckt = true;                                       // das Lama hat davon erzaehlt
}
function xwingY(o){
  if(o.spricht) return;
  if(oi.stufe !== 'schluessel'){ o.spricht = true; story.sprich(story.obsText.xwingZu, () => { o.spricht = false; }); return; }
  o.spricht = true; story.sprich(story.obsText.xwingAuf, () => { o.spricht = false; xwEinsteigen(); });
}
// Abflug (Live-Wunsch 23.10.2026): Joshi fliegt selbst. Das Flugzeug der Engine wird zum X-Wing – genau dort, wo der geparkte
// stand (der verschwindet samt Grenzen) –, Joshi und Fuchsi sitzen drin. Oben links das Radar mit dem roten Punkt im
// Nord-Nord-Osten (kommt entgegen, wenn er darauf zuhaelt – wie die Mustang in Etappe 3). Am Punkt: Schwarzblende, der Globus
// zieht den Faden zum Mond (globus.js), danach (spaeter) der Landeanflug auf dem Mond. Ins freie Weltall geht es nicht:
// steigt er so hoch, kommt ebenfalls der Globus. Kracht er, steht er wieder im X-Wing auf dem Parkplatz. Aussteigen erst am Mond.
const XW_ZIEL = { x: -32 + 650, z: 2 - 1550, r: 160 };   // Nord-Nord-Ost (Nord = -z, Ost = +x)
const xf = { an: false, ende: false, ziel: null, gesagt: false };
story.obsFlug = xf;
function xwParken(){
  const Z = story.e4Zustand, x = Z && Z.xwing, idx = typeof MODEL_NAMES !== 'undefined' ? MODEL_NAMES.indexOf('XWing') : -1;   // global-ok: Engine
  if(!x || idx < 0) return false;
  currentModel = idx; buildModel('XWing'); spec = PLANE_SPECS.XWing || DEFAULT_SPEC;                                          // global-ok: Engine
  state.pos.set(x.position.x, ISLAND_Y, x.position.z); state.quat.setFromEuler(new THREE.Euler(0, x.rotation.y, 0, 'YXZ'));   // global-ok: Engine
  state.vel.set(0, 0, 0); state.throttle = 0; state.onGround = true; state.crashed = false; state.falling = false;
  planeGroup.position.copy(state.pos); planeGroup.quaternion.copy(state.quat);                                               // global-ok: Engine
  return true;
}
function xwEinsteigen(){
  const Z = story.e4Zustand; if(!eva || xf.an || !xwParken()) return;
  Z.xwing.visible = false;                                         // der geparkte ist jetzt das Flugzeug
  for(const d of story.dinge) if(d.obj === Z.xwing || (d.typ && /xwing/i.test(d.typ))) d.aus = true;
  eva.planeAt = state.pos.clone(); evaBoard();                     // global-ok: Engine (Joshi steigt ein, Fuchsi fliegt mit)
  xf.an = true; xf.ende = false; xf.gesagt = false; xf.ziel = Object.assign({}, XW_ZIEL);
  story.sprich(['Los geht es! Gib Gas, steig hoch und flieg zum roten Punkt auf dem Radar.']);
}
function xfEnde(){ if(xf.ende) return; xf.ende = true; state.throttle = 0; if(story.globusReise) story.globusReise(4, story.e5Wechsel ? () => story.e5Wechsel() : null); }   // Ort 4 = der Mond (globus.js), weiter in mond.js
function xfSchritt(dt){
  if(!xf.an || xf.ende || eva) return;
  if(locale !== 'earth'){ xfEnde(); return; }
  const z = xf.ziel, dx = z.x - state.pos.x, dz = z.z - state.pos.z, d = Math.hypot(dx, dz);
  const vor = new THREE.Vector3(0, 0, -1).applyQuaternion(state.quat), cos = (vor.x * dx + vor.z * dz) / Math.max(1, d) / Math.max(0.01, Math.hypot(vor.x, vor.z));
  if(!state.onGround && cos > 0.75 && d > z.r * 1.5){ const w = Math.min(state.vel.length() * 1.2 * dt, d - z.r); z.x -= dx / d * w; z.z -= dz / d * w; }
  if(d < z.r && !state.onGround) xfEnde();
}
// Radar (segeln.js zeigt es, wenn story.e3FlugAnzeige etwas liefert): auch im X-Wing der Etappe 4
const _xe = new THREE.Euler();
const anzOrig = story.e3FlugAnzeige;
story.e3FlugAnzeige = function(){
  const a = anzOrig ? anzOrig.apply(this, arguments) : null; if(a) return a;
  if(!e4() || !xf.an || xf.ende || eva || locale !== 'earth') return null;
  _xe.setFromQuaternion(state.quat, 'YXZ');
  return { x: state.pos.x, z: state.pos.z, kurs: _xe.y + Math.PI, ziel: xf.ziel };
};
function hookFlug4(){
  const spaceOrig = enterSpace;                                                     // global-ok: Engine
  enterSpace = function(){ if(e4() && xf.an){ xfEnde(); return; } return spaceOrig.apply(this, arguments); };
  const resetOrig = resetPlane;                                                     // global-ok: Engine
  resetPlane = function(){ if(!(e4() && xf.an && !xf.ende)) return resetOrig.apply(this, arguments);
    // wie die Engine nach einem Absturz aufraeumen (Live-Befund 26.10.2026: Loeschboot und Sirene blieben, die Sirene hoerte nie auf)
    if(typeof clearRescue === 'function') clearRescue(); state.crashTimer = 0;                    // global-ok: Engine
    xwParken(); story.sprich(['Hoppla! Versuch es gleich noch einmal.']); if(typeof snapCamera === 'function') snapCamera(); };
  const exitOrig = evaExit;                                                         // global-ok: Engine
  evaExit = function(){ if(e4() && xf.an) return; return exitOrig.apply(this, arguments); };   // erst auf dem Mond aussteigen
}

// Teil 2: jedes Bild (auch draussen)
function teil2Schritt(dt){
  if(!e4()) return;
  if(oi.paket && oi.paket.offen) papierBauen();
  if(story.e4Zustand && story.e4Zustand.gebaut) scheitSetzen();
  xwingMelden(); xfSchritt(dt);
  // Foto: das Lama schaut zur Kamera
  if(oi.fotoBlick && oi.t > oi.fotoBlick.bis) oi.fotoBlick = null;
}

// ---- Hinein / hinaus (wie die Hoehle: Blende, eigene Welt; drinnen Nacht, draussen Tag) -------------------------------
const HUELLE = 15, KOERPER = 0.32;
function imRaum(x, z){ return Math.hypot(x - RAUM.x, z - RAUM.z) < RAUM.R + HUELLE; }
// Live-Befund 26.10.2026: der Saal schwebt in 150 m Hoehe – mit dem X-Wing sah man die Kuppel in der Luft und flog dagegen
// (seine Waende galten in jeder Hoehe). Darum ist er nur zu sehen, solange Joshi drin ist; alle seine Teile liegen bei
// BODEN_Y im Umkreis (Saal, Regale, Tisch, Podest, Lama, Spur) – und ohne Joshi drinnen gibt es dort keine Grenzen (hookObs).
// Saal vorwaermen (Live-Befund 26.10.2026: das Betreten ruckelte trotz Vorbauen – drinnen ist Nacht, mit anderem Himmel und
// Nebel, dafuer braucht three.js eigene Shader; die gemalten Texturen werden erst beim ersten Bild hochgeladen). Darum einmal:
// Nacht, vier Blicke durch den Saal in einen unsichtbaren Puffer, wieder Tag – alles im selben Augenblick, zu sehen ist nichts.
function saalVorwaermen(){
  try {
    const sd = typeof starDome !== 'undefined' && starDome, rt = new THREE.WebGLRenderTarget(256, 256), k = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);   // global-ok: Engine
    const alt = renderer.getRenderTarget(); himmel(true); if(sd) sd.visible = true;                                         // global-ok: Engine
    for(const a of [0, 1.57, 3.14, 4.71]){ k.position.set(RAUM.x, BODEN_Y + 1.6, RAUM.z); k.rotation.set(0.15, a, 0, 'YXZ'); k.updateMatrixWorld(true); renderer.setRenderTarget(rt); renderer.render(scene, k); }   // global-ok: Engine
    // dazu der Nachthimmel der Engine (Sterne, Milchstrasse, Mond): er wird erst ein Bild spaeter sichtbar – kurz alles Unsichtbare
    // der Szene zeigen und einmal uebersetzen (gemessen: die letzten vier Shader beim Betreten gehoerten genau dazu)
    const aus = []; scene.traverse(o => { if(!o.visible && !o.isLight){ aus.push(o); } }); for(const o of aus) o.visible = true;   // global-ok: Engine
    renderer.setRenderTarget(rt); renderer.render(scene, k); renderer.compile(scene, k); for(const o of aus) o.visible = false;   // global-ok: Engine
    renderer.setRenderTarget(alt); rt.dispose(); himmel(!!oi.drin);                                                        // global-ok: Engine
  } catch(e){ console.warn('Saal vorwaermen:', e); }
}
// Nur die sichtbaren Teile, nicht die Lichter (Live-Befund 26.10.2026: das Betreten ruckelte weiter – mit dem Saal verschwand die
// Kerzen-Lampe, die Zahl der Lichter aenderte sich, und three.js uebersetzte beim Hineingehen jedes Material neu; die Lampe hat
// nur 5 m Reichweite und wirkt draussen nicht)
function innenZeigen(an){
  oi.innenSicht = an;
  for(const o of story.welt(4).children){ const p = o.position; if(p.y > BODEN_Y - 5 && Math.hypot(p.x - RAUM.x, p.z - RAUM.z) < RAUM.R + HUELLE)
    story.sichtTeile(o, an); }
}
function raumTiefe(x, z){
  const lx = x - RAUM.x, lz = z - RAUM.z, d = Math.hypot(lx, lz);
  if(lz > 0 && Math.abs(lx) < TUER.B / 2 - 0.25 && !(story.aktionLaeuft && story.aktionLaeuft())) return lz > RAUM.R + 1.0 ? lz - (RAUM.R + 1.0) : 0;
  return Math.max(0, d - (RAUM.R - KOERPER - 0.3));
}
function raumFrei(x, z){ const t = raumTiefe(x, z); if(t <= 0) return true; const von = story.schrittVon && story.schrittVon(); return !!von && t <= raumTiefe(von.x, von.z) + 1e-6; }
let blendeEl = null;
function blende(w){ if(!blendeEl){ blendeEl = document.createElement('div'); blendeEl.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:25;'; document.body.appendChild(blendeEl); } blendeEl.style.opacity = String(w); }
function himmel(nacht){
  setSky(nacht ? 'night' : 'day');                                                     // global-ok: Engine
  story.nacht = !!nacht;
  if(typeof starDome !== 'undefined' && starDome) starDome.visible = !!nacht;          // global-ok: Engine
}
function setzeUm(ziel){
  const g = eva.group;
  if(ziel === 'innen'){
    baueRaum(); innenZeigen(true); himmel(true);
    // in der Schwarzblende vorwaermen (Saal, Nachthimmel): Shader und Texturen jetzt, nicht beim ersten Hinsehen (story.js Vorbereiten)
    if(!oi.gewaermt){ oi.gewaermt = true; saalVorwaermen(); innenZeigen(true); himmel(true); }   // saalVorwaermen stellt am Ende den Himmel nach oi.drin (noch false)
    const x = RAUM.x - 0.6, z = RAUM.z + RAUM.R - 3.4;
    g.position.set(x, BODEN_Y, z); eva.yaw = 0.25;                                        // Blick in den Saal, leicht nach rechts (Tisch, Lama)
    oi.drin = true; story.innen.drin = true; story.innen.wo = 'observatorium';
    if(!oi.warDrin){ oi.warDrin = true; story.einleitung(1.0, T.ankunft); }   // das X erst danach
    // die Tuer draussen (wueste.js, "Observatorium") ist damit gefunden – sonst verlangte das Spiel beim Hinausgehen noch X
    // (Live-Befund 26.10.2026: wer gleich hineinlief, sollte draussen X druecken, obwohl die Ringe schon da waren)
    for(const o of story.interListe || []) if(o.welt === 4 && o.name === 'Observatorium' && !o.innen) o.erledigt = true;
    if(story.teleskopTest && story.teleskopAuf) story.spaeter(2.5, () => { if(oi.drin) story.teleskopAuf(); });
  } else {
    himmel(false); innenZeigen(false);
    // (Live-Wunsch 29.10.2026, gilt fuer jedes Gebaeude: so weit draussen, dass die Kamera hinter Joshi nicht im Gebaeude haengt)
    const Z = story.e4Zustand, T0 = Z && Z.tuer, p = T0 ? story.freierPlatz(T0.x, T0.z + 6.8, 'joshi') : { x: 0, z: 0 };
    g.position.set(p.x, evaFootY(p.x, p.z), p.z); eva.yaw = Math.PI;                      // vom Observatorium weg
    oi.drin = false; story.innen.drin = false; story.innen.wo = null;
    if(Z) Z.drin = false;
    story.spaeter(0.1, () => { if(typeof szeneVorwaermen === 'function' && !oi.drin) szeneVorwaermen(); });
    draussenZeigen();
  }
  g.rotation.y = eva.yaw; evaOrbit = 0; evaPitch = 0;
  const back = new THREE.Vector3(Math.sin(eva.yaw), 0, Math.cos(eva.yaw));
  camera.position.copy(g.position).addScaledVector(back, 4).add(new THREE.Vector3(0, 2, 0));
  oi.kamSofort = oi.drin; oi.sperre = 1.0;
  if(story.fuchsZu) story.fuchsZu(ziel);
}
story.e4Rein = () => { if(!oi.wechsel) oi.wechsel = { t: 0, ziel: 'innen', gesetzt: false }; };
function updateWechsel(dt){
  if(!eva) return;
  if(oi.wechsel){ const w = oi.wechsel; w.t += dt;
    if(w.t < 0.35) blende(w.t / 0.35);
    else { if(!w.gesetzt){ w.gesetzt = true; setzeUm(w.ziel); } blende(Math.max(0, 1 - (w.t - 0.35) / 0.45)); if(w.t > 0.8){ oi.wechsel = null; blende(0); } }
    return; }
  if(oi.sperre > 0){ oi.sperre -= dt; return; }
  if(!oi.drin) return;
  const p = eva.group.position;
  if(!imRaum(p.x, p.z) || p.y < BODEN_Y - 1){ setzeUm('innen'); return; }
  if(p.z - RAUM.z > RAUM.R - 0.1 && Math.abs(p.x - RAUM.x) < TUER.B / 2 && !(story.aktionLaeuft && story.aktionLaeuft())) oi.wechsel = { t: 0, ziel: 'aussen', gesetzt: false };
}

// ---- Jedes Bild ------------------------------------------------------------------------------------------------
story.updateObsInnen = function(dt){
  if(!e4()) return;
  oi.t += dt;
  // Live-Befund 26.10.2026: das erste Betreten ruckelte (Saal, Regale mit gemalten Buchruecken, Teleskop und Lama wurden erst
  // dann gebaut, ihre Shader erst dann uebersetzt). Darum schon draussen kurz nach der Ankunft bauen (der Saal schwebt weit
  // weg, von der Oase aus nicht zu sehen) und die Shader vorab uebersetzen.
  // Live-Wunsch 29.10.2026: nicht alles auf einmal (die Landung mit dem Fallschirm hing) – nach der Landung, auf dem Weg zur Tuer,
  // nach und nach (story.vorbereiten): Saal bauen, seine Teile vorwaermen, zuletzt der Nachthimmel (saalVorwaermen)
  if(!oi.vorbereitet && !oi.drin && eva && oi.t > 4 && story.e4Zustand && story.e4Zustand.gebaut && story.vorbereiten){ oi.vorbereitet = true;
    story.vorbereiten(() => { baueRaum(); if(!oi.drin) innenZeigen(false); }, 'saal');
  }
  updateWechsel(dt);
  teil2Schritt(dt);
  if(!oi.drin) return;
  if(oi.mixer) oi.mixer.update(dt);
  if(oi.teleMx) oi.teleMx.update(dt);
  teleskopMelden();
  // Paket: nach dem Schnitt springen die Laschen auf
  const P = oi.paket;
  if(P && P.offen && P.auf < 1){ P.auf = Math.min(1, P.auf + dt * 2.2); const e = 1 - Math.pow(1 - P.auf, 3);
    for(const { l, sz } of P.laschen) l.rotation.x = sz * e * 2.1; }
  // Lama: schaut beim Reden (und fuers Foto) zu Joshi – hoechstens LAMA_DREH_MAX –, sonst wieder zum Paket; zwischendurch
  // schaut es sich um (lookaround, 6,4 s)
  if(oi.lama && oi.gang && lamaGang(dt)){ /* laeuft zum Foto bzw. zurueck */ }
  else if(oi.lama && eva){
    const h = oi.lama, p = eva.group.position, ziel = oi.fotoBlick || (oi.zuJoshi ? p : null);
    let soll = oi.lamaBlick;
    if(ziel){ let d = Math.atan2(ziel.x - h.position.x, ziel.z - h.position.z) - oi.lamaBlick; d = Math.atan2(Math.sin(d), Math.cos(d)); soll += Math.max(-LAMA_DREH_MAX, Math.min(LAMA_DREH_MAX, d)); }
    let dw = soll - h.rotation.y; dw = Math.atan2(Math.sin(dw), Math.cos(dw)); h.rotation.y += dw * Math.min(1, dt * 3);
    if(ziel){ lamaAnim('stehen'); oi.umschauT = 4; }
    else if((oi.umschauT = (oi.umschauT === undefined ? 6 : oi.umschauT) - dt) <= 0){
      lamaAnim(oi.cur === 'umschauen' ? 'stehen' : 'umschauen'); oi.umschauT = oi.cur === 'umschauen' ? 6.4 : 6 + Math.random() * 6; }
  }
};

// ---- Hooks: Boden, Grenzen, Kamera im Observatorium ------------------------------------------------------------------
function hookObs(){
  const solidOrig = evaSolid, fussOrig = evaFootY, hitsOrig = hitsBuilding, wasserOrig = isOpenWater, dinghyOrig = evaEnterDinghy;
  // Drinnen kein Meer und keine Orcas (Live-Befund 26.10.2026, CPU-Profil: das Betreten ruckelte, weil die Engine um den weit draussen
  // schwebenden Saal das Meer neu rechnete und dort Orcas aufbaute – drinnen sieht man beides nicht)
  const seaOrig = updateSea, orcaOrig = updateOrcas;                                                // global-ok: Engine
  updateSea = function(){ if(e4() && oi.drin) return; return seaOrig.apply(this, arguments); };       // global-ok: Engine
  updateOrcas = function(){ if(e4() && oi.drin) return; return orcaOrig.apply(this, arguments); };   // global-ok: Engine
  evaSolid = function(x, z){ if(e4() && locale === 'earth' && imRaum(x, z)) return raumFrei(x, z); return solidOrig.apply(this, arguments); };
  evaFootY = function(x, z){ if(e4() && locale === 'earth' && imRaum(x, z)) return BODEN_Y; return fussOrig.apply(this, arguments); };
  // ohne Joshi drinnen gibt es am Saal nichts, woran ein Flugzeug haengen bleibt (auch nicht Tisch, Regale, Lama: innenZeigen)
  hitsBuilding = function(x, y, z){ if(e4() && locale === 'earth' && imRaum(x, z)){ if(!oi.drin) return false; if(!raumFrei(x, z)) return true; } return hitsOrig.apply(this, arguments); };
  isOpenWater = function(x, z){ if(e4() && locale === 'earth' && imRaum(x, z)) return false; return wasserOrig.apply(this, arguments); };
  evaEnterDinghy = function(){ if(oi.drin) return; return dinghyOrig.apply(this, arguments); };
  // Kamera: wie in der Hoehle, an der runden Wand geklemmt (der Saal ist groesser: weiter weg und etwas hoeher)
  const camOrig = updateCamera, _soll = new THREE.Vector3();
  updateCamera = function(){
    if(!(oi.drin && eva)) return camOrig.apply(this, arguments);
    if(Math.abs(lookX) > 0.01) evaOrbit -= lookX * EVA_LOOK_SPEED * dtCam; else evaOrbit += (0 - evaOrbit) * Math.min(1, EVA_LOOK_RETURN * dtCam);
    // nach oben schauen (Live-Wunsch 26.10.2026: durch den Kuppelspalt die Sterne) – wie draussen mit dem rechten Stick hoch/runter
    if(Math.abs(lookY) > 0.01) evaPitch = Math.max(-0.2, Math.min(1.2, evaPitch + lookY * EVA_LOOK_SPEED * 0.6 * dtCam));   // global-ok: Engine
    else evaPitch += (0 - evaPitch) * Math.min(1, EVA_LOOK_RETURN * dtCam);
    const hoch = Math.max(0, Math.sin(evaPitch));
    const p = eva.group.position, yaw = eva.yaw + evaOrbit, max = RAUM.R - 0.9;
    let best = null;
    for(const dw of [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4]){
      for(const L of [4.6, 4.0, 3.4, 2.8]){ const cx = p.x + Math.sin(yaw + dw) * L, cz = p.z + Math.cos(yaw + dw) * L;
        if(Math.hypot(cx - RAUM.x, cz - RAUM.z) <= max){ best = { cx, cz, L }; break; } }
      if(best) break;
    }
    if(!best){ const dx = p.x - RAUM.x, dz = p.z - RAUM.z, d = Math.hypot(dx, dz) || 1; best = { cx: RAUM.x - dx / d * 2.5, cz: RAUM.z - dz / d * 2.5, L: 2.8 }; }
    _soll.set(best.cx, BODEN_Y + 1.7 + best.L * 0.22 - hoch * 1.5, best.cz);
    if(oi.kamSofort){ camera.position.copy(_soll); oi.kamSofort = false; } else camera.position.lerp(_soll, Math.min(1, 6 * dtCam));
    camera.up.set(0, 1, 0); camera.lookAt(p.x, p.y + 0.9 + hoch * 8, p.z);
  };
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookObs(); hookFlug4(); };
})();
