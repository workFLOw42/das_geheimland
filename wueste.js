// Das Geheimland – Etappe 4: die Wueste mit der Oase des Lamas (Konzept Abschnitt 7, Etappe 4). Laedt nach fallschirm.js.
// Live-Wunsch 23.10.2026: "Ankunftspunkt auf der Wuesteninsel muss in der Mitte sein" – die Oase liegt in der Mitte der grossen
// Wuesteninsel (globus.js: Ort 3 genau auf der Inselmitte).
// Ablauf: Am roten Punkt (Etappe 3, hoehle.js) kommt der Globus, danach fliegt Joshi in der Mustang noch ein Stueck allein
// uebers Meer auf die Wueste zu. Die Erzaehlerin: mit B abspringen, der Autopilot bringt das Flugzeug zum Gorilla zurueck (nur
// gesagt). Freier Fall, der Schirm geht von selbst auf (fallschirm.js), Landung vor dem Observatorium. Es ist Tag.
// (Live-Wunsch 23.10.2026: "eher ein Observatorium als ein Planetarium" – das Modell "Welcome to the Observatory" von
// XelaDoesArt, CC-BY-4.0: Steinhaus mit Kuppel und grossem Fernrohr)
// Die Oase (Blick von der Landestelle nach Norden, -z): ein kleiner See von der Mitte bis an den rechten Rand mit Strand und
// Palmen, links eine Wiese mit Palmen und dem Observatorium, daneben ein Parkplatz mit einem X-Wing (noch nicht benutzbar), um die
// ganze Oase ein Ring aus Palmen – dahinter Sand.
// Neu laden in Etappe 4 (?etappe=4): Joshi steht gleich an der Landestelle.
(function(){
'use strict';
const story = window.STORY;
const e4 = () => story.etappe === 4;

const WUESTE_R = 650;                                  // m Sand: die Insel der Engine (Zelle 0, 0), Mitte = Oase
const OASE_R = 46;                                     // m Wiese
const PALMRING_R = 50;                                 // m: Ring aus Palmen, Grenze zur Wueste
// See (Live-Wunsch 23.10.2026): ca. 8 m tief, Joshi laeuft einfach ueber die Uferlinie hinein (die ersten WAT m flach wie am
// Meer, story.js watGrund), schwimmt und taucht bis zum Grund. Darin nur Fische, zwei Seeloewen am Ufer und ein Manta
// Live-Wunsch 23.10.2026 ("das Flachwasser ist viel zu weit rein, wirkt wie ein tiefer Teller"): groesser (19 statt 16 m) und etwas
// weiter weg vom Observatorium; nur 2,5 m Flachwasser (0,5 m tief), dann steil bis zur Kante (6 m tief nach 7 m), zur Mitte gemaechlich
const SEE = { x: 17, z: -2, r: 19, strand: 3.5, tief: 8.3, wat: 2.5, watTief: 0.5, kante: 7, kanteTief: 6 };   // von der Mitte bis an den rechten Rand
const SEE_STEH = 0.75;                                 // m: so flach steht Joshi (watet), tiefer schwimmt er
const seeY = () => ISLAND_Y - 0.15;                       // Wasserspiegel (knapp unter der Wiese; ISLAND_Y gibt es erst mit der Engine)   // global-ok
const PLANETARIUM = { x: -12, z: -8, r: 5, lang: 10 };   // Observatorium: laengste Seite 10 m (Tuer gut 2,5 m hoch), Tuer nach +z
const PARKPLATZ = { x: -32, z: 2, b: 16, t: 12 };
// offene Tuer des Observatoriums (Lage auf der Schmalseite +z). Live-Befund 26.10.2026: genau auf das Tuerblatt des Modells gelegt
// (vorher 1,4 m breit, 10 cm zu weit rechts, ohne Schwelle) – gemessen an einer Nahaufnahme
const TUER = { dx: -1.1, b: 1.16, h: 2.66, unten: 0.07 };
const LANDUNG = { x: -6, z: 20 };                      // vor dem Observatorium
// Feldweg zur Tuer (Live-Wunsch 23.10.2026: "optisch wie die Schotterpiste aus Etappe 3"): vom Palmenring im Sueden ueber die
// Landestelle bis vor die Tuer des Observatoriums (Tuer bei z ~ -3: halbe Tiefe des Modells vor seiner Mitte)
const WEG = [{ x: -1, z: 53 }, { x: -3, z: 42 }, { x: -5.5, z: 31 }, { x: -6, z: 20 }, { x: -8, z: 9 }, { x: -11, z: 1 }, { x: -12, z: -2.6 }];
const WEG_B = 2.2;
// Ankunft (Live-Wunsch 23.10.2026): das Flugzeug kreist von selbst ueber der Oase, etwa 300 m hoch; Joshi springt, wann er will
const KREIS = { r: 220, y: 300, v: 60, neig: 0.42 };   // m Radius um die Oasenmitte, Hoehe, m/s, Querlage (rad)
story.etappeR = Object.assign(story.etappeR || {}, { 4: WUESTE_R });
story.etappeMitte = Object.assign(story.etappeMitte || {}, { 4: { x: 0, z: 0 } });
story.wuesteLoch = { x: SEE.x, z: SEE.z, r: SEE.r };   // insel.js: der Wuestenboden hat dort ein Loch (der See)
story.oase = { see: SEE, observatorium: PLANETARIUM, parkplatz: PARKPLATZ, landung: LANDUNG, r: OASE_R };

const TEXT_SPRINGEN = ['Du bist über dem Ziel angekommen. Du kannst jederzeit abspringen, wenn Du bereit bist.',
  'Das Flugzeug fliegt dann automatisch zum Gorilla zurück.'];
const TEXT_NOCHMAL = ['Drück B, dann springst du ab!'];
const TEXT_GELANDET = ['Super gelandet! Du bist am Observatorium angekommen. Hier wohnt das Lama.'];
const TEXT_HINWEIS = ['Schau doch mal, ob du ins Observatorium kommst.'];
const TEXT_SEE = ['Ein kleiner See mitten in der Wüste. Das Wasser ist ganz klar.'];
const TEXT_TUER = ['Die Tür ist offen. Ob jemand zu Hause ist? Geh doch einfach hinein.'];

// ---- Boden: Wuestensand statt Gras (insel.js nimmt ihn fuer die Insel der Etappe) -----------------------------------
let bodenMat = null;
story.wuesteKachel = 14;                               // m je Kachel
story.wuesteBoden = function(){
  if(bodenMat) return bodenMat;
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
  g.fillStyle = '#c29d5e'; g.fillRect(0, 0, N, N);   // dunkler als er wirkt: das Tageslicht der Engine hellt fast bis Weiss auf
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // Windrippel: weiche, leicht gewellte Streifen (kachelbar: ganze Wellen ueber die Breite)
  for(let y = 0; y < N; y += 7){ g.strokeStyle = 'rgba(160,120,60,' + (0.10 + rnd() * 0.08) + ')'; g.lineWidth = 2; g.beginPath();
    for(let x = 0; x <= N; x += 8) g.lineTo(x, y + Math.sin(x / N * Math.PI * 4 + y * 0.3) * 2.2); g.stroke(); }
  for(let i = 0; i < 1400; i++){ const h = rnd() < 0.5; g.fillStyle = h ? 'rgba(255,240,200,0.25)' : 'rgba(150,110,60,0.22)'; g.fillRect(rnd() * N, rnd() * N, 1.5, 1.5); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  bodenMat = new THREE.MeshLambertMaterial({ map: t });
  return bodenMat;
};

// ---- Oase bauen ------------------------------------------------------------------------------------------------------
const w4 = { gebaut: false, phase: null, t: 0, ansage: 0, xwing: null, landeplatz: false };
const deko = (m) => { m.userData.deko = true; return m; };
function flach(geo, farbe, y){ const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: farbe })); m.rotation.x = -Math.PI / 2; m.position.y = y; return deko(m); }
function baue(){
  if(w4.gebaut) return; w4.gebaut = true;
  const w = story.welt(4);
  // Wiese (Gras-Kachel der Engine), darauf der See mit Strand
  const ws = new THREE.Shape(); ws.absarc(0, 0, OASE_R, 0, Math.PI * 2, false);
  const loch = new THREE.Path(); loch.absarc(SEE.x, -SEE.z, SEE.r, 0, Math.PI * 2, true); ws.holes.push(loch);   // Form in x/-z (wird gekippt)
  const wg = new THREE.ShapeGeometry(ws, 72), uv = wg.attributes.uv, p = wg.attributes.position;
  for(let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / GRASS_TILE_M, p.getY(i) / GRASS_TILE_M);   // global-ok: Engine
  const wiese = new THREE.Mesh(wg, grassMat); wiese.rotation.x = -Math.PI / 2; wiese.position.y = ISLAND_Y + 0.015; w.add(deko(wiese));   // global-ok: Engine
  const rand = flach(new THREE.RingGeometry(OASE_R, OASE_R + 3, 72), 0xcdb070, ISLAND_Y + 0.012); w.add(rand);   // weicher Uebergang zum Sand
  // Strand: derselbe Sand wie die Wueste (Live-Wunsch 23.10.2026), gleiche Kachel in Weltkoordinaten – nahtlos
  const sg = new THREE.RingGeometry(SEE.r, SEE.r + SEE.strand, 64, 2), su = sg.attributes.uv, sp = sg.attributes.position;
  for(let i = 0; i < su.count; i++) su.setXY(i, (sp.getX(i) + SEE.x) / story.wuesteKachel, (sp.getY(i) - SEE.z) / story.wuesteKachel);
  const strand = new THREE.Mesh(sg, story.wuesteBoden()); strand.rotation.x = -Math.PI / 2; strand.position.set(SEE.x, ISLAND_Y + 0.025, SEE.z); w.add(deko(strand));
  // Seegrund: eine Schuessel in der Form von seeBoden (am Ufer flach, dann bis SEE.tief), Sand – etwas dunkler (unter Wasser war er zu hell)
  const rg = new THREE.RingGeometry(0.05, SEE.r + 0.3, 72, 28), rp = rg.attributes.position;
  for(let i = 0; i < rp.count; i++){ const x = rp.getX(i), y = rp.getY(i); rp.setXYZ(i, SEE.x + x, Math.min(ISLAND_Y - 0.02, seeBoden(SEE.x + x, SEE.z - y)), SEE.z - y); }
  rg.computeVertexNormals();
  w.add(deko(new THREE.Mesh(rg, new THREE.MeshLambertMaterial({ color: 0x9a8862, side: THREE.DoubleSide }))));
  const wasser = new THREE.Mesh(new THREE.CircleGeometry(SEE.r + 0.1, 64), new THREE.MeshLambertMaterial({ color: 0x3f97c4, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false }));
  wasser.rotation.x = -Math.PI / 2; wasser.position.set(SEE.x, seeY(), SEE.z); wasser.renderOrder = 3; w.add(deko(wasser));
  // Am Seegrund ein paar Pflanzen und Korallen (Live-Wunsch 23.10.2026) – die Bausteine der Engine (Seegras, Schwamm,
  // Korallenbusch), verkleinert, nur wo es tiefer als die Watzone ist. Geteilte Materialien der Engine: fremd (nicht entsorgen)
  let sk = 61; const rk = () => (sk = (sk * 16807) % 2147483647) / 2147483647;
  // nur wo es tiefer als 3 m ist, und so klein, dass alles mindestens 1 m unter der Oberflaeche bleibt (Live-Befund: im
  // flachen Teil ragten sie heraus)
  for(let i = 0, n = 0; i < 200 && n < 16; i++){
    const a = rk() * Math.PI * 2, r = rk() * (SEE.r - SEE.wat), x = SEE.x + Math.cos(a) * r, z = SEE.z + Math.sin(a) * r, t = seeTiefe(x, z);
    if(t < 3) continue;
    const art = rk(), o = art < 0.45 ? makeWeed(rk(), rk()) : art < 0.7 ? makeSponge(rk(), rk()) : makeCoralBush(rk(), rk());   // global-ok: Engine
    const h = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()).y || 1;
    o.scale.setScalar(Math.min(art < 0.45 ? 0.45 + rk() * 0.25 : 0.55 + rk() * 0.35, (t - 1) / h));
    o.position.set(x, seeBoden(x, z) - 0.05, z); o.rotation.y = rk() * 6.3;
    o.userData.fremd = true; w.add(deko(o)); n++;
  }
  story.interaktion(wasser, { name: 'See', welt: 4, x: SEE.x - (SEE.r + 1.5) * 0.7, z: SEE.z + (SEE.r + 1.5) * 0.7, r: 1.2, yHoehe: 1.2, einmal: true, text: TEXT_SEE });
  // Observatorium (Modell, fest an seinem Platz), Parkplatz mit X-Wing
  ladeObservatorium(w);
  baueParkplatz(w);
  baueWeg(w);
  // Palmen: um den See, auf der Wiese, und der Ring um die ganze Oase
  let s = 23; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const palme = (x, z, h) => story.setze('palme', 4, { x, z, h: h || 5.5 + rnd() * 3, neig: (rnd() - 0.5) * 0.4, dreh: rnd() * 6.3 });
  for(let i = 0; i < 9; i++){ const a = i / 9 * Math.PI * 2 + rnd() * 0.3; if(Math.sin(a) > 0.55 && Math.cos(a) < 0.3) continue;   // zur Landestelle hin frei
    palme(SEE.x + Math.cos(a) * (SEE.r + SEE.strand + 1.2), SEE.z + Math.sin(a) * (SEE.r + SEE.strand + 1.2)); }
  for(let i = 0, n = 0; i < 60 && n < 12; i++){
    const a = rnd() * Math.PI * 2, r = 8 + rnd() * (OASE_R - 14), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if(Math.hypot(x - SEE.x, z - SEE.z) < SEE.r + SEE.strand + 3) continue;
    if(abstandWeg(x, z) < WEG_B / 2 + 2.5) continue;                                         // nicht auf den Feldweg
    if(Math.hypot(x - PLANETARIUM.x, z - PLANETARIUM.z) < PLANETARIUM.r + 4) continue;
    if(Math.abs(x - PARKPLATZ.x) < PARKPLATZ.b / 2 + 3 && Math.abs(z - PARKPLATZ.z) < PARKPLATZ.t / 2 + 3) continue;
    if(Math.hypot(x - LANDUNG.x, z - LANDUNG.z) < 9 || abstandStrecke(x, z, LANDUNG, { x: PLANETARIUM.x, z: PLANETARIUM.z + PLANETARIUM.r }) < 5) continue;   // Landeplatz und Blick zur Tuer frei
    palme(x, z); n++;
  }
  const RING = 70;
  for(let i = 0; i < RING; i++){ const a = i / RING * Math.PI * 2 + (rnd() - 0.5) * 0.04, r = PALMRING_R + (rnd() - 0.5) * 2.4;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if(abstandWeg(x, z) < WEG_B / 2 + 1.8) continue;                                         // Luecke fuer den Feldweg
    palme(x, z, 6.5 + rnd() * 2.5); }
}
function abstandWeg(x, z){ let d = Infinity; for(let i = 0; i + 1 < WEG.length; i++) d = Math.min(d, abstandStrecke(x, z, WEG[i], WEG[i + 1])); return d; }
// Feldweg: ein Band entlang einer weichen Kurve durch WEG, Schotter wie die Piste in Etappe 3 (hoehle.js); die Raender laufen
// ins Gras aus. Ohne Fahrspuren und Pfuetzen (Live-Wunsch 23.10.2026: "in der Oase keine Pfuetzen und keine Fahrspuren")
function baueWeg(w){
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const cg = c.getContext('2d');
  cg.fillStyle = '#8a7e6c'; cg.fillRect(0, 0, 64, 256);
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 1800; i++){ cg.fillStyle = rnd() < 0.5 ? 'rgba(100,92,80,.6)' : 'rgba(170,160,140,.5)'; cg.fillRect(rnd() * 64, rnd() * 256, 1 + rnd() * 2, 1 + rnd() * 2); }
  for(const [x0, x1] of [[0, 12], [52, 64]]){ const gr = cg.createLinearGradient(x0, 0, x1, 0);                       // Gras am Rand
    gr.addColorStop(x0 ? 0 : 1, 'rgba(110,150,70,0)'); gr.addColorStop(x0 ? 1 : 0, 'rgba(110,150,70,.95)'); cg.fillStyle = gr; cg.fillRect(x0, 0, x1 - x0, 256); }
  const t = new THREE.CanvasTexture(c); t.wrapT = THREE.RepeatWrapping;
  const kurve = new THREE.CatmullRomCurve3(WEG.map(p => new THREE.Vector3(p.x, 0, p.z))), N = 80, L = kurve.getLength();
  const pos = [], uv = [], idx = [];
  for(let i = 0; i <= N; i++){
    const u = i / N, p = kurve.getPointAt(u), tg = kurve.getTangentAt(u), qx = -tg.z, qz = tg.x;
    for(const v of [-1, 1]){ pos.push(p.x + qx * v * WEG_B / 2, ISLAND_Y + 0.03, p.z + qz * v * WEG_B / 2); uv.push(v < 0 ? 0 : 1, u * L / 4); }
    if(i){ const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
  m.renderOrder = 2; w.add(deko(m));
}
function abstandStrecke(x, z, a, b){ const dx = b.x - a.x, dz = b.z - a.z, t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(x - a.x - dx * t, z - a.z - dz * t); }
// Observatorium (Live-Wunsch: "nicht zu riesig"): das Modell auf PLANETARIUM.lang m laengste Seite, Fuss auf den Boden,
// Mitte auf den Platz; die Tuer liegt im Modell auf der Schmalseite +z (zur Landestelle). Grenze in seiner Form (objekte.js).
// Blick durch die offene Tuer: ein dunkler, warmer Raum – Dielen, die schraeg nach hinten laufen, links ein Regal mit Buchruecken,
// rechts das Licht einer Kerze, oben ein Stueck Nachthimmel mit Sternen (drinnen ist es Nacht)
function innenBild(){
  const c = document.createElement('canvas'); c.width = 128; c.height = 288; const g = c.getContext('2d'), W = 128, H = 288;
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const hg = g.createLinearGradient(0, 0, 0, H); hg.addColorStop(0, '#0b0c1c'); hg.addColorStop(0.32, '#16110f'); hg.addColorStop(1, '#2c1d12'); g.fillStyle = hg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#1a2142'; g.fillRect(34, 14, 60, 44); g.fillStyle = '#e8eaff'; for(let i = 0; i < 14; i++) g.fillRect(36 + rnd() * 56, 16 + rnd() * 40, 1.5, 1.5);   // Nachthimmel durch den Spalt
  g.strokeStyle = 'rgba(90,60,35,.6)'; g.lineWidth = 2; for(let i = 0; i < 6; i++){ const y = 200 + i * 16; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y - 6); g.stroke(); }   // Dielen
  g.fillStyle = '#24170e'; g.fillRect(6, 92, 40, 120); for(let r = 0; r < 4; r++) for(let i = 0; i < 6; i++){ g.fillStyle = ['#5a2a24', '#2f4a3a', '#5a4a2a', '#2a3550'][(r + i) % 4]; g.fillRect(9 + i * 6, 98 + r * 28, 4, 22); }   // Regal
  const lg = g.createRadialGradient(98, 150, 2, 98, 150, 46); lg.addColorStop(0, 'rgba(255,200,120,.75)'); lg.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = lg; g.fillRect(40, 100, 88, 110);   // Kerzenlicht
  g.fillStyle = '#ffd27a'; g.fillRect(97, 146, 2, 5);
  const t = new THREE.CanvasTexture(c); return t;
}
function ladeObservatorium(w){
  if(!window.OBSERVATORIUM_GLB || !story.ladeGlb) return;
  story.ladeGlb(window.OBSERVATORIUM_GLB, 'Observatorium', (gl) => {
    const o = gl.scene; o.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3());
    o.scale.multiplyScalar(PLANETARIUM.lang / Math.max(sz.x, sz.z)); o.updateMatrixWorld(true);
    const b2 = new THREE.Box3().setFromObject(o), c = b2.getCenter(new THREE.Vector3());
    o.position.x -= c.x; o.position.z -= c.z; o.position.y -= b2.min.y;
    // Leuchten beim Anzeigen (Live-Befund 26.10.2026): das Modell hat eine fast schwarze Leucht-Textur (Helligkeit 6/255) bei weisser
    // Leuchtfarbe – das Aufleuchten (story.js setGlow faerbt die Leuchtfarbe) blieb damit unsichtbar. Ohne sie und mit schwarzer
    // Leuchtfarbe sieht es gleich aus, und es leuchtet wie alle anderen Dinge.
    o.traverse(m => { if(m.isMesh){ m.castShadow = true; m.frustumCulled = false;
      if(m.material && m.material.emissiveMap){ m.material.emissiveMap = null; m.material.emissive.set(0x000000); m.material.needsUpdate = true; } } });
    const g = new THREE.Group(); g.add(o); g.position.set(PLANETARIUM.x, ISLAND_Y, PLANETARIUM.z);
    w.add(g); w4.observatorium = g; g.updateMatrixWorld(true);   // vor story.ding: sonst lagen die Grenzen am Ursprung (sie werden nicht nachgefuehrt)
    if(story.ding) story.ding(g, { welt: 4, typ: 'observatorium' });
    // Die Tuer steht offen (Live-Wunsch 23.10.2026: kein Y – wer hindurchlaeuft, ist drinnen): eine dunkle Oeffnung vor dem
    // Tuerblatt des Modells; TUER_DX = wo die Tuer auf der Schmalseite sitzt (gemessen am gerenderten Modell)
    const vorn = new THREE.Box3().setFromObject(o).max.z;
    w4.tuer = { x: PLANETARIUM.x + TUER.dx, z: vorn };
    // In der Oeffnung eine Andeutung des Inneren statt Schwarz (Live-Wunsch 26.10.2026): Dielen, ein Bücherregal im Halbdunkel,
    // warmes Kerzenlicht, oben ein Stueck Nachthimmel – gemalt (der Saal selbst schwebt weit weg)
    const oe = new THREE.Mesh(new THREE.PlaneGeometry(TUER.b, TUER.h), new THREE.MeshBasicMaterial({ map: innenBild(), fog: false }));
    oe.position.set(w4.tuer.x, ISLAND_Y + TUER.unten + TUER.h / 2, vorn + 0.03); w.add(deko(oe));
    // Live-Wunsch 26.10.2026: draussen gab es mit X nur den See zu entdecken – jetzt auch das Observatorium (es leuchtet auf),
    // Y vor der Tuer: ein Satz der Erzaehlerin, hinein geht es weiter durch die Tuer
    story.interaktion(g, { name: 'Observatorium', welt: 4, x: w4.tuer.x, z: vorn + 1.8, r: 0.8, yx: w4.tuer.x, yz: vorn, yHoehe: TUER.h + 0.5, einmal: true, text: TEXT_TUER });
  });
}
// Parkplatz: Asphalt mit weissen Linien, darauf der X-Wing (die Park-Vorlage der Engine: xwingParkTpl, laedt beim Start)
function baueParkplatz(w){
  const P = PARKPLATZ;
  const a = flach(new THREE.PlaneGeometry(P.b, P.t), 0x55575c, ISLAND_Y + 0.02); a.position.x = P.x; a.position.z = P.z; w.add(a);
  for(const v of [-1, 1]){ const l = flach(new THREE.PlaneGeometry(P.b - 1, 0.18), 0xf2f2f2, ISLAND_Y + 0.03); l.position.x = P.x; l.position.z = P.z + v * (P.t / 2 - 0.6); w.add(l); }
  (function warte(){
    if(!w4.gebaut || w4.xwing) return;
    const tpl = typeof xwingParkTpl !== 'undefined' ? xwingParkTpl : null;   // global-ok: Engine (Park-Vorlage des X-Wing)
    if(!tpl){ story.spaeter(0.5, warte); return; }
    // Skelett-Figur (Fahrwerk-Haltung): mit cloneSkinned der Engine – clone(true) liess den Rumpf an den Knochen der Vorlage
    // haengen (gezeichnet neben dem See, nur der Droide stand auf dem Parkplatz)
    const x = typeof cloneSkinned === 'function' ? cloneSkinned(tpl) : tpl.clone(true);   // global-ok: Engine
    x.position.set(P.x, ISLAND_Y, P.z); x.rotation.y = Math.PI / 2 + 0.2;
    x.traverse(o => { if(o.isMesh) o.castShadow = true; });
    // Grenzen: die gemessenen der Engine (_grenzen, die Ruhepose liegt hochkant) – cloneSkinned nimmt sie nicht mit
    if(tpl._grenzen) x._grenzen = tpl._grenzen; if(tpl._clips) x._clips = tpl._clips;
    story.welt(4).add(x); w4.xwing = x; x.updateMatrixWorld(true);   // vor story.ding (feste Grenzen: Lage beim Anmelden)
    if(story.ding) story.ding(x, { welt: 4, typ: 'xwing' });   // noch nicht benutzbar: kein Y (Live-Wunsch 23.10.2026)
    // Der Rumpf haengt auf dem Fahrwerk bis 1,5 m hoch – Joshi (1,2 m) lief darunter hindurch. Darum unter jedem Rumpf-Kasten der
    // Engine-Grenzen (Mitte im Modell |x| < 1 m, nicht schon am Boden) ein unsichtbarer Block bis zum Boden, im Schiff angehaengt –
    // er dreht mit. Live-Befund 26.10.2026: vorher EIN Kasten in Weltachsen um alle hohen Teile; beim schraeg geparkten Schiff
    // 7,6 x 11 m bis zur Nasenspitze, man kam nur von der Seite heran. Jetzt bleiben Fluegel und Nase frei wie in Trip to Japan.
    // Laengs (z) reicht jeder Block bis zum naechsten, damit unter dem Rumpf keine Luecke bleibt.
    const rumpf = (x._grenzen || []).filter(b => Math.abs((b.min.x + b.max.x) / 2) < 1 && b.min.y > 0.5).sort((a, b) => a.min.z - b.min.z);
    rumpf.forEach((b, i) => {
      const z1 = i + 1 < rumpf.length ? Math.max(b.max.z, rumpf[i + 1].min.z) : b.max.z, h = b.min.y + 0.1;
      const blk = new THREE.Mesh(new THREE.BoxGeometry(b.max.x - b.min.x, h, Math.max(0.05, z1 - b.min.z)), new THREE.MeshBasicMaterial({ visible: false }));
      blk.position.set((b.min.x + b.max.x) / 2, h / 2, (b.min.z + z1) / 2); x.add(blk); blk.updateMatrixWorld(true);
      if(story.ding) story.ding(blk, { welt: 4, typ: 'xwing' }); });
  })();
}

// ---- Der See: Wasser wie das Meer (Schwimmen, Waten, Tauchen der Figur und Unterwasser der Engine fragen dieselben Funktionen)
function imSee(x, z){ return Math.hypot(x - SEE.x, z - SEE.z) < SEE.r; }
function seeTiefe(x, z){
  const d = SEE.r - Math.hypot(x - SEE.x, z - SEE.z);                             // m vom Ufer
  if(d <= 0) return 0;
  const weich = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  if(d <= SEE.wat) return SEE.watTief * d / SEE.wat;                              // schmales Flachwasser am Ufer
  if(d <= SEE.kante) return SEE.watTief + (SEE.kanteTief - SEE.watTief) * weich((d - SEE.wat) / (SEE.kante - SEE.wat));   // steil hinab
  return SEE.kanteTief + (SEE.tief - SEE.kanteTief) * weich((d - SEE.kante) / (SEE.r - SEE.kante));                      // zur Mitte
}
function seeBoden(x, z){ return seeY() - seeTiefe(x, z); }
// Untergrund (Engine untergrundAt): Wueste und Strand am See Sand, Wiese und Feldweg Erde, Parkplatz Beton, der See Wasser (Engine)
if(story.untergrundHook) story.untergrundHook((x, z) => {
  if(story.etappe !== 4) return undefined;
  if(imSee(x, z)){ const t = seeTiefe(x, z); return t > 0.03 ? (t >= SEE_STEH ? undefined : 'wasser') : 'sand'; }   // tief: die Engine (Wasser/Unterwasser)
  const P = PARKPLATZ; if(Math.abs(x - P.x) < P.b / 2 && Math.abs(z - P.z) < P.t / 2) return 'beton';
  if(Math.hypot(x - SEE.x, z - SEE.z) < SEE.r + SEE.strand) return 'sand';
  if(Math.hypot(x, z) < OASE_R) return 'erde';
  return isOnLand(x, z) || isOnBeach(x, z) ? 'sand' : undefined;                   // global-ok: Engine
});
const hierSee = (x, z) => e4() && locale === 'earth' && imSee(x, z);
function hookWueste(){
  const landOrig = isOnLand, strandOrig = isOnBeach, offenOrig = isOpenWater, meerOrig = seaYAt, grundOrig = seabedY;   // global-ok: Engine
  isOnLand = function(x, z){ if(hierSee(x, z)) return false; return landOrig.apply(this, arguments); };
  isOnBeach = function(x, z){ if(hierSee(x, z)) return false; return strandOrig.apply(this, arguments); };
  // Flachwasser des Sees (bis SEE_STEH tief): fester Grund zum Waten, kein offenes Wasser – tiefer: schwimmen (die Watzone der
  // Meeresufer gilt hier nicht: story.watAus)
  isOpenWater = function(x, z){ if(hierSee(x, z)) return seeTiefe(x, z) >= SEE_STEH; return offenOrig.apply(this, arguments); };
  const solidOrig = evaSolid, fussOrig = evaFootY;                                // global-ok: Engine
  evaSolid = function(x, z){ if(hierSee(x, z)) return seeTiefe(x, z) < SEE_STEH; return solidOrig.apply(this, arguments); };
  evaFootY = function(x, z){ if(hierSee(x, z) && seeTiefe(x, z) < SEE_STEH) return seeBoden(x, z); return fussOrig.apply(this, arguments); };
  story.watAus = (x, z) => hierSee(x, z);
  seaYAt = function(x, z){ if(hierSee(x, z)) return seeY(); return meerOrig.apply(this, arguments); };
  seabedY = function(x, z){ if(hierSee(x, z)) return seeBoden(x, z); return grundOrig.apply(this, arguments); };
  // Wale, Schiffe, Rochen und Fische der Engine kommen nicht in den See (er gilt fuer sie als Fels, wie window.wasserSperre
  // es vorsieht); seine Tiere setzt diese Datei selbst (tiereBauen)
  const sperreVorher = window.wasserSperre;
  window.wasserSperre = function(x, y, z){ if(e4() && Math.hypot(x - SEE.x, z - SEE.z) < SEE.r + 3) return true; return sperreVorher ? sperreVorher(x, y, z) : false; };
  // In der Wueste keine Moewen und kein Meer (Ambiente der Engine), dafuer ein leichter Wuestenwind (Live-Wunsch 23.10.2026: "wie
  // bei Trip to Japan Etappe 2") – gleich laut wie dort das Meer (AMB_OCEAN_VOL), in der Hoehe leiser (AMB_MAX_Y)
  const ambOrig = updateAmbient;                                                  // global-ok: Engine
  updateAmbient = function(dt){ const r = ambOrig.apply(this, arguments);
    if(e4() && typeof ambGullGain !== 'undefined' && ambGullGain){ ambGullGain.gain.value = 0; if(ambOceanGain) ambOceanGain.gain.value = 0; }   // global-ok: Engine
    windUpdate(dt || 0);
    return r; };
  // Meeresboden-Raster der Engine aus (wie Trip to Japan in seinen Etappen ohne Meer): es folgt dem Spieler, ist grob und spannte
  // seine Dreiecke durch das Loch des Sees knapp unter dem Wasser – nur zu sehen, nicht fest (Live-Befund 23.10.2026)
  const bodenOrig = seaFloorNeeded;                                               // global-ok: Engine
  seaFloorNeeded = function(){ if(e4()){ if(typeof seabedMesh !== 'undefined' && seabedMesh) seabedMesh.visible = false; return false; } return bodenOrig.apply(this, arguments); };
  story.e4Hinweis = () => (story.innen && story.innen.drin) ? null : TEXT_HINWEIS;
  // B im Anflug: abspringen (fallschirm.js); sonst nichts (kein Schleudersitz der Engine, wie in Etappe 3)
  // Kreisen: der Autopilot fliegt, die Flugphysik ruht (der Fallschirm haengt sich selbst davor ein: fallschirm.js)
  const physOrig = stepPhysics;                                                   // global-ok: Engine
  stepPhysics = function(dt){ if(e4() && !eva && w4.phase === 'anflug' && locale === 'earth'){ if(!(story.pause && story.pause())) kreisen(dt); return; } return physOrig.apply(this, arguments); };
  const bOrig = buttonB;                                                          // global-ok: Engine
  buttonB = function(){
    if(e4() && !eva){ if(w4.phase === 'anflug' && w4.t > 0.8) abspringen(); return; }
    return bOrig.apply(this, arguments);
  };
  // die Mustang ist weg (Autopilot): Y bringt Joshi nicht zurueck hinein
  const boardOrig = evaCanBoard;                                                  // global-ok: Engine
  evaCanBoard = function(){ if(e4()) return false; return boardOrig.apply(this, arguments); };
  // Radar im Anflug (segeln.js zeichnet es wie in der Mustang in Etappe 3): Ziel = die Landestelle
  const anzeigeOrig = story.e3FlugAnzeige;
  story.e3FlugAnzeige = function(){
    if(e4() && !eva && w4.phase === 'anflug' && locale === 'earth'){ const e = new THREE.Euler().setFromQuaternion(state.quat, 'YXZ');   // global-ok: Engine
      return { x: state.pos.x, z: state.pos.z, kurs: e.y + Math.PI, ziel: { x: LANDUNG.x, z: LANDUNG.z, r: 40 } }; }
    return anzeigeOrig ? anzeigeOrig() : null;
  };
}
// ---- Wuestenwind ----------------------------------------------------------------------------------------------------
const wind = { src: null, gain: null, laedt: false };
function windUpdate(dt){
  if(!e4()){ if(wind.src){ try { wind.src.stop(); } catch(e){} wind.src = wind.gain = null; wind.laedt = false; } return; }
  if(typeof audioCtx === 'undefined' || !audioCtx || audioCtx.state !== 'running' || !window.WUESTENWIND_SND) return;   // global-ok: Engine
  if(!wind.laedt){ wind.laedt = true;
    decodeSound(window.WUESTENWIND_SND).then(buf => { normalizePeak(buf, 0.9);                                         // global-ok: Engine
      const s = audioCtx.createBufferSource(); s.buffer = buf; s.loop = true; const g = audioCtx.createGain(); g.gain.value = 0;
      s.connect(g).connect(audioCtx.destination); s.start(); wind.src = s; wind.gain = g; }).catch(e => console.warn('Wuestenwind:', e)); }
  if(!wind.gain) return;
  const y = eva ? eva.group.position.y : state.pos.y, hoehe = 1 - Math.max(0, Math.min(1, (y - ISLAND_Y) / AMB_MAX_Y));   // global-ok: Engine
  // drinnen (Observatorium) kein Wind (Live-Wunsch 26.10.2026) – dort schnell weg, draussen weich wieder da
  const drin = !!(story.innen && story.innen.drin), ziel = locale === 'earth' && soundOn && !drin ? AMB_OCEAN_VOL * hoehe : 0;   // global-ok: Engine
  wind.gain.gain.value += (ziel - wind.gain.gain.value) * Math.min(1, (drin ? 4 : 0.7) * dt);
}
// ---- Anflug und Sprung -----------------------------------------------------------------------------------------------
// Kreisen: der Autopilot fliegt einen Kreis um die Oase (gegen den Uhrzeigersinn von oben), leicht in die Kurve gelegt; die
// Flugphysik der Engine ruht solange (hookWueste: stepPhysics)
const _ke = new THREE.Euler(0, 0, 0, 'YXZ');
function kreisSetzen(){
  const a = w4.kreisA, x = Math.cos(a) * KREIS.r, z = Math.sin(a) * KREIS.r, vx = Math.sin(a) * KREIS.v, vz = -Math.cos(a) * KREIS.v;
  state.pos.set(x, KREIS.y, z); state.vel.set(vx, 0, vz);                          // global-ok: Engine
  state.quat.setFromEuler(_ke.set(0, Math.atan2(-vx, -vz), KREIS.neig, 'YXZ'));   // Nase in Flugrichtung, zur Mitte geneigt
  state.throttle = 0.6; state.onGround = false; state.crashed = false;
  planeGroup.position.copy(state.pos); planeGroup.quaternion.copy(state.quat);   // global-ok: Engine
}
function kreisen(dt){ w4.kreisA -= KREIS.v / KREIS.r * dt; kreisSetzen(); }
// B ueber dem Flugzeug (wie die Tasten-Hinweise im Spiel: rot, weisser Rand – notizbuch.js bZeigen, das Y der Objekte)
let bTex = null;
function bZeichen(){
  if(!bTex){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(64, 68, 56, 0, 7); g.fill();
    g.fillStyle = '#e8352b'; g.beginPath(); g.arc(64, 62, 54, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.stroke();
    g.fillStyle = '#ffffff'; g.font = 'bold 76px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('B', 64, 66);
    bTex = new THREE.CanvasTexture(c); }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, depthTest: false, transparent: true })); sp.scale.setScalar(2.4); sp.renderOrder = 999; return sp;
}
function bWeg(){ if(w4.b){ if(w4.b.parent) w4.b.parent.remove(w4.b); w4.b.material.dispose(); w4.b = null; } }
function anflug(){
  w4.kreisA = Math.PI / 2;                                                         // suedlich der Oase, auf der Seite der Landestelle
  kreisSetzen(); planeGroup.visible = true;                                         // global-ok: Engine
  if(typeof snapCamera === 'function') snapCamera();                             // global-ok: Engine
  bWeg(); w4.b = bZeichen(); w4.b.position.set(0, 4.2, 0); planeGroup.add(w4.b);  // global-ok: Engine (haengt am Flugzeug)
  w4.phase = 'anflug'; w4.t = 0; w4.ansage = 0;
}
function abspringen(){
  if(!story.fallschirmSprung) return;
  const b = w4.b; if(b && b.parent) b.parent.remove(b);                            // vorher ab: fallschirm.js kopiert das Flugzeug samt Kindern
  const ok = story.fallschirmSprung({ welt: 4, lande: { x: LANDUNG.x, z: LANDUNG.z }, anker: { x: LANDUNG.x, z: LANDUNG.z },
    fertig: () => { w4.phase = 'unten'; gelandet(); } });
  if(ok){ w4.phase = 'sprung'; bWeg(); if(window.speechSynthesis && story.stimmeStopp) story.stimmeStopp(); }
  else if(b) planeGroup.add(b);                                                     // global-ok: Engine (nicht gesprungen: B bleibt)
}
function blickZumPlanetarium(){
  if(!eva) return;
  const p = eva.group.position;
  eva.yaw = Math.atan2(p.x - PLANETARIUM.x, p.z - PLANETARIUM.z); eva.group.rotation.y = eva.yaw;
  if(typeof evaOrbit !== 'undefined'){ evaOrbit = 0; evaPitch = 0; }               // global-ok: Engine
}
function gelandet(){
  blickZumPlanetarium();
  const p = eva.group.position;
  if(story.fuchsAbsetzenAuf) story.fuchsAbsetzenAuf({ x: p.x + 1.3, z: p.z + 0.4, blick: eva.yaw + Math.PI, modus: 'streifen', sitzt: false, warte: 1 });
  story.spaeter(1.0, () => story.sprich(TEXT_GELANDET));
}
// ---- Tiere im See (Live-Wunsch 23.10.2026: "nur Fische und zwei Seeloewen und ein Manta"): die Vorlagen der Engine
// (strandGLB: Forelle, Seeloewe, Rochen), hier selbst gesetzt; das Strandleben der Engine ist in Etappe 4 aus
const tiere = { an: false, fische: [], loewen: [], manta: null, t: 0 };
const FISCHE = 9, MANTA = { r: 7.5, tief: 4.5, v: 1.1 };
// Meeresschildkroeten (Live-Wunsch 23.10.2026, je eine): die grosse schwimmt im See, das Baby krabbelt am Strand um den See
const KROETE = { lang: 1.3, r: 3.5, tief: 2.5, v: 0.55 }, BABY = { lang: 0.38, r: SEE.r + 1.4, v: 0.22, von: -1.5, bis: 1.4 };
function tiereBauen(){
  if(tiere.an) return;
  if(typeof strandGLB !== 'function') return;                                       // global-ok: Engine
  for(const [k, v] of [['forelle', 'FORELLE_GLB'], ['seeloewe', 'SEELOEWE_GLB'], ['rochen', 'ROCHEN_GLB']]) strandGLB(k, v);   // global-ok
  const T = strandleben.tpl;                                                        // global-ok: Engine
  if(!T.forelle || !T.seeloewe || !T.rochen) return;
  tiere.an = true; kroetenBauen();
  const w = story.welt(4);
  let s = 41; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const tier = (tpl, clip) => { const o = cloneSkinned(tpl); const mx = new THREE.AnimationMixer(o), c = strandClip(tpl, clip);   // global-ok: Engine
    if(c){ mx.clipAction(c).play(); mx.setTime(rnd() * c.duration); } w.add(o); return { o, mx, c }; };
  for(let i = 0; i < FISCHE; i++){ const f = tier(T.forelle, 'Trout_Swim');
    f.r = 3 + rnd() * (SEE.r - SEE.wat - 4); f.a = rnd() * 6.28; f.w = (0.18 + rnd() * 0.12) * (rnd() < 0.5 ? -1 : 1); f.h = 1.0 + rnd() * 2.5; tiere.fische.push(f); }
  // zwei Seeloewen am Ufer (zur Landestelle hin), Blick aufs Wasser – liegend, einer schlaeft
  for(const [a, clip] of [[2.25, 'sleep'], [2.7, 'idle']]){ const l = tier(T.seeloewe, clip), r = SEE.r + 1.7;
    const x = SEE.x + Math.cos(a) * r, z = SEE.z + Math.sin(a) * r, un = T.seeloewe.userData.unten, c = l.c;
    l.o.position.set(x, ISLAND_Y + (un && c && un[c.name] !== undefined ? Math.max(0, -un[c.name]) : 0), z);   // global-ok
    l.o.rotation.y = Math.atan2(-(SEE.x - x), -(SEE.z - z));                          // Nase -z der Vorlage: zum Wasser
    if(story.ding) story.ding(l.o, { welt: 4, beweglich: true, orca: true, typ: 'seeloewe' });
    tiere.loewen.push(l); }
  const m = tiere.manta = tier(T.rochen, 'Stingray_swim'); m.a = 0;
  if(story.ding) story.ding(m.o, { welt: 4, beweglich: true, orca: true, typ: 'rochen' });
}
// Eigene Vorlage wie strandGLB der Engine: Groesse in der Bewegungs-Haltung gemessen (mit Skinning), Nase nach -z. Alle Clips
// bereit (k.spiele: weich ueberblenden); lift = wie tief der Koerper beim Laufen unter den Ursprung reicht (an Land anheben)
function kroeteLaden(win, lang, clip, lauf, fertig){
  if(!window[win] || !story.ladeGlb) return;
  story.ladeGlb(window[win], win, (g) => {
    const o = g.scene; o.rotation.y = Math.PI;
    const clipVon = (n) => (g.animations || []).find(a => a.name.endsWith('|' + n)) || null;
    const mess = (n) => { const c = clipVon(n), mx = new THREE.AnimationMixer(o); if(c){ mx.clipAction(c).play(); mx.setTime(c.duration * 0.3); }
      const b = new THREE.Box3().setFromPoints(orcaPunkte(o)); mx.stopAllAction(); mx.uncacheRoot(o); return b; };   // global-ok: Engine
    const s = mess(clip).getSize(new THREE.Vector3());
    o.scale.multiplyScalar(lang / Math.max(0.001, s.x, s.z));
    // je Clip die tiefste Stelle ueber die ganze Animation (Live-Befund 23.10.2026: Babys mit dem Hinterteil im Boden)
    const liftJe = {};
    for(const c of g.animations || []){ const mx = new THREE.AnimationMixer(o); mx.clipAction(c).play(); let lo = Infinity;
      for(let i = 0; i < 10; i++){ mx.setTime(c.duration * i / 10); lo = Math.min(lo, new THREE.Box3().setFromPoints(orcaPunkte(o)).min.y); }   // global-ok: Engine
      mx.stopAllAction(); mx.uncacheRoot(o); liftJe[c.name.split('|').pop()] = Math.max(0, -lo); }
    const lift = liftJe[lauf] !== undefined ? liftJe[lauf] : Math.max(0, -mess(lauf).min.y);
    o.traverse(m => { if(m.isMesh){ m.castShadow = false; m.frustumCulled = false; } });
    const wrap = new THREE.Group(); wrap.add(o); story.welt(4).add(wrap);
    const mx = new THREE.AnimationMixer(o), acts = {};
    const k = { o: wrap, mx, lift, liftJe, a: 0, cur: null, x: 0, z: 0 };
    k.liftNun = () => (k.cur && k.liftJe[k.cur] !== undefined) ? k.liftJe[k.cur] : k.lift;
    k.spiele = (n, blend) => { if(k.cur === n) return; const c = clipVon(n); if(!c) return; const a = acts[n] || (acts[n] = mx.clipAction(c));
      const alt = k.cur && acts[k.cur]; a.reset().play(); if(alt) alt.crossFadeTo(a, blend || 0.5, false); k.cur = n; };
    k.spiele(clip);
    fertig(k);
  });
}
function dreheZu(o, ziel, max){ const d = Math.atan2(Math.sin(ziel - o.rotation.y), Math.cos(ziel - o.rotation.y)); o.rotation.y += Math.max(-max, Math.min(max, d)); }
// geht/schwimmt k um hoechstens v*dt auf (zx, zz) zu, dreht sich dorthin; true = angekommen
function hinZu(k, zx, zz, v, dt){
  const dx = zx - k.x, dz = zz - k.z, d = Math.hypot(dx, dz);
  if(d < 0.05) return true;
  const s = Math.min(d, v * dt); k.x += dx / d * s; k.z += dz / d * s;
  dreheZu(k.o, Math.atan2(-dx, -dz), 1.6 * dt);
  return d - s < 0.05;
}
// Hoehe: im tiefen Wasser schwimmend (tief m unter der Oberflaeche, ueber dem Grund), sonst auf dem Grund/Boden laufend
function kroeteY(k, schwimmt, tief){
  const imW = imSee(k.x, k.z);
  if(schwimmt && imW && seeTiefe(k.x, k.z) > 0.8) return Math.max(seeBoden(k.x, k.z) + 0.5, seeY() - tief);
  return (imW ? seeBoden(k.x, k.z) : ISLAND_Y) + k.liftNun();                            // global-ok: Engine
}
function kroetenBauen(){
  if(tiere.kroeten) return; tiere.kroeten = {};
  kroeteLaden('MEERESSCHILDKROETE_GLB', KROETE.lang, 'Turtle_swim', 'Turtle_walk', (k) => { k.a = 1.2; k.phase = 'kreis'; k.t = 0; k.y = seeY() - KROETE.tief; tiere.kroeten.gross = k;
    if(typeof spurQuelle === 'function') spurQuelle(k.o, { groesse: KROETE.lang });   // global-ok: Engine (Staub/Ringe)
    if(story.ding) story.ding(k.o, { welt: 4, beweglich: true, orca: true, typ: 'schildkroete' }); });
  kroeteLaden('MEERESSCHILDKROETE_BABY_GLB', BABY.lang, 'walk', 'walk', (k) => { k.a = 0; k.r = 1; tiere.kroeten.baby = k;
    if(typeof spurQuelle === 'function') spurQuelle(k.o, { groesse: BABY.lang });     // global-ok: Engine
    if(story.ding) story.ding(k.o, { welt: 4, beweglich: true, orca: true, typ: 'schildkroete' }); });
}
// Die grosse (Live-Wunsch 23.10.2026): schwimmt ihre Runden, kommt dann ans Ufer beim Baby, krabbelt aus dem Wasser zu ihm,
// bleibt kurz, laeuft zurueck und taucht wieder ab ("schwimmen, tauchen, schwimmen, aus dem Wasser kommen, zum Baby laufen,
// zurueck ins Wasser laufen"): im Kreis erst an der Oberflaeche, dann tief, dann wieder oben. Phasen: kreis -> hin (schwimmen ans Ufer) -> raus (laufen zum Baby) ->
// bei (Pause) -> zurueck (laufen ins Wasser) -> ab (zum Kreis) -> kreis
const KROETE_RUNDE = [26, 38], KROETE_BEI = 6, KROETE_LAUF = 0.32, KROETE_OBEN = 0.35, KROETE_TAUCH = 4.5;   // m unter der Oberflaeche
function grosseUpdate(g, b, dt){
  const c = { x: SEE.x, z: SEE.z };                                                  // um die tiefe Mitte (dort ~6 m zum Tauchen)
  const richtung = () => { const a = Math.atan2(b.z - SEE.z, b.x - SEE.x); return { x: Math.cos(a), z: Math.sin(a) }; };
  g.t += dt;
  if(g.phase === 'kreis'){
    g.a += KROETE.v / KROETE.r * dt; g.x = c.x + Math.cos(g.a) * KROETE.r; g.z = c.z + Math.sin(g.a) * KROETE.r;
    dreheZu(g.o, Math.atan2(Math.sin(g.a), -Math.cos(g.a)), 2 * dt); g.spiele('Turtle_swim');
    if(!g.dauer) g.dauer = KROETE_RUNDE[0] + Math.random() * (KROETE_RUNDE[1] - KROETE_RUNDE[0]);
    if(g.t > g.dauer && b){ const r = richtung(); g.ufer = { x: SEE.x + r.x * (SEE.r - 2.5), z: SEE.z + r.z * (SEE.r - 2.5) }; g.phase = 'hin'; g.t = 0; }
  } else if(g.phase === 'hin'){
    g.spiele('Turtle_swim'); if(hinZu(g, g.ufer.x, g.ufer.z, KROETE.v, dt)){ g.phase = 'raus'; g.t = 0; }
  } else if(g.phase === 'raus'){
    g.spiele('Turtle_walk'); const r = richtung(), zx = b.x - r.x * 1.1, zz = b.z - r.z * 1.1;
    if(hinZu(g, zx, zz, KROETE_LAUF, dt)){ g.phase = 'bei'; g.t = 0; }
  } else if(g.phase === 'bei'){
    g.spiele('Turtle_idle'); dreheZu(g.o, Math.atan2(-(b.x - g.x), -(b.z - g.z)), 1.5 * dt);
    if(g.t > KROETE_BEI){ g.phase = 'zurueck'; g.t = 0; }
  } else if(g.phase === 'zurueck'){
    g.spiele('Turtle_walk'); if(hinZu(g, g.ufer.x, g.ufer.z, KROETE_LAUF, dt)){ g.phase = 'ab'; g.t = 0; }
  } else if(g.phase === 'ab'){
    g.spiele('Turtle_swim'); const zx = c.x + Math.cos(g.a) * KROETE.r, zz = c.z + Math.sin(g.a) * KROETE.r;
    if(hinZu(g, zx, zz, KROETE.v, dt)){ g.phase = 'kreis'; g.t = 0; g.dauer = 0; }
  }
  // Hoehe weich: schwimmend unter der Oberflaeche, laufend auf Grund und Strand
  const schwimmt = g.phase === 'kreis' || g.phase === 'ab' || (g.phase === 'hin' && seeTiefe(g.x, g.z) > 1.2);
  const k = g.phase === 'kreis' && g.dauer ? g.t / g.dauer : 0;
  const tief = k > 0.3 && k < 0.72 ? KROETE_TAUCH : KROETE_OBEN;               // schwimmen – tauchen – schwimmen
  const ziel = kroeteY(g, schwimmt, tief + Math.sin(tiere.t * 0.5) * 0.15);
  g.y += (ziel - g.y) * Math.min(1, dt * 0.8);                                     // gemaechlich auf- und abtauchen
  g.o.position.set(g.x, g.y, g.z); g.mx.update(dt);
}
function kroetenUpdate(dt){
  const K = tiere.kroeten; if(!K) return;
  const g = K.gross, b = K.baby;
  // Baby: am Strand auf der Ostseite hin und her (BABY.von..bis), dreht am Ende um – nicht durch die Seeloewen (Westseite).
  // Ist die grosse bei ihm, haelt es an und schaut sie an.
  if(b){
    const besuch = g && (g.phase === 'bei' || (g.phase === 'raus' && Math.hypot(g.x - b.x, g.z - b.z) < 3));
    if(besuch){ b.spiele('idle'); dreheZu(b.o, Math.atan2(-(g.x - b.x), -(g.z - b.z)), 2 * dt); }
    else {
      b.spiele('walk'); b.a += b.r * BABY.v / BABY.r * dt;
      if(b.a > BABY.bis){ b.a = BABY.bis; b.r = -1; } else if(b.a < BABY.von){ b.a = BABY.von; b.r = 1; }
      b.x = SEE.x + Math.cos(b.a) * BABY.r; b.z = SEE.z + Math.sin(b.a) * BABY.r;
      dreheZu(b.o, Math.atan2(Math.sin(b.a) * b.r, -Math.cos(b.a) * b.r), 2 * dt);
    }
    b.o.position.set(b.x, ISLAND_Y + b.liftNun(), b.z); b.mx.update(dt);             // global-ok: Engine
  }
  if(g) grosseUpdate(g, b, dt);
}
function tiereUpdate(dt){
  kroetenUpdate(dt);
  if(!tiere.an) return;
  tiere.t += dt;
  for(const f of tiere.fische){ f.a += f.w * dt; const x = SEE.x + Math.cos(f.a) * f.r, z = SEE.z + Math.sin(f.a) * f.r;
    const vx = -Math.sin(f.a) * Math.sign(f.w), vz = Math.cos(f.a) * Math.sign(f.w);
    f.o.position.set(x, Math.max(seeBoden(x, z) + 0.5, seeY() - f.h) + Math.sin(tiere.t * 0.7 + f.r) * 0.15, z); f.o.rotation.y = Math.atan2(-vx, -vz); f.mx.update(dt); }
  for(const l of tiere.loewen) l.mx.update(dt);
  const m = tiere.manta; m.a += MANTA.v / MANTA.r * dt;
  const x = SEE.x + Math.cos(m.a) * MANTA.r, z = SEE.z + Math.sin(m.a) * MANTA.r;
  m.o.position.set(x, Math.max(seeBoden(x, z) + 0.8, seeY() - MANTA.tief) + Math.sin(tiere.t * 0.4) * 0.4, z);
  m.o.rotation.y = Math.atan2(Math.sin(m.a), -Math.cos(m.a)); m.mx.update(dt);
}
// ---- Durch die offene Tuer: Blende, ins Observatorium (observatorium_innen.js) -------------------------------------------
function tuerPruefen(){
  const T = w4.tuer; if(!T || !eva || w4.drin || eva.boat) return;
  const p = eva.group.position;
  if(Math.abs(p.x - T.x) > TUER.b / 2 || p.z > T.z + 0.9 || p.z < T.z - 1) return;
  if(story.aktionLaeuft && story.aktionLaeuft()){ p.z = T.z + 0.9; return; }      // waehrend einer Aktion ist die Tuer zu
  w4.drin = true;
  if(story.e4Rein) story.e4Rein();
}
function updateE4(dt){
  if(!e4()) return;
  baue();
  if(typeof strandleben !== 'undefined' && strandleben.an) strandleben.an = false;   // global-ok: Strandleben der Engine aus (eigene Tiere)
  tiereBauen(); tiereUpdate(dt || 0);
  tuerPruefen();
  if(w4.phase !== 'anflug' || eva) return;
  w4.t += dt;
  // Ansage gleich nach dem Globus; springt er nicht, nach einer Weile eine kurze Erinnerung (kein Zwang)
  if(!w4.ansage && w4.t > 1.2){ w4.ansage = w4.t; story.sprich(TEXT_SPRINGEN); }
  else if(w4.ansage && w4.t - w4.ansage > 40 && !(story.aktionLaeuft && story.aktionLaeuft())){ w4.ansage = w4.t; story.sprich(TEXT_NOCHMAL); }
}
// ---- Einstieg --------------------------------------------------------------------------------------------------------
// Vom Globus (Etappe 3, im Schwarzen): ohne Neuladen, Joshi fliegt weiter
story.e4Wechsel = function(){
  story.etappe = 4; story.ziel = null;
  if(story.etappeWechsel) story.etappeWechsel(4);
  baue(); anflug();
};
// Neu geladen in Etappe 4: gleich an der Landestelle
story.e4StartSzene = function(){
  baue(); w4.phase = 'unten';
  if(!eva) return;
  const { x, z } = story.freierPlatz(LANDUNG.x, LANDUNG.z, 'joshi');
  eva.group.position.set(x, evaFootY(x, z), z); eva.vy = 0;                       // global-ok: Engine
  eva.planeAt = new THREE.Vector3(LANDUNG.x, ISLAND_Y, LANDUNG.z);                // global-ok: Engine (unsichtbarer Anker)
  blickZumPlanetarium();
  const back = new THREE.Vector3(Math.sin(eva.yaw), 0, Math.cos(eva.yaw));
  camera.position.copy(eva.group.position).addScaledVector(back, 5).add(new THREE.Vector3(0, 2, 0));   // global-ok: Engine
  if(story.fuchsAbsetzenAuf) story.fuchsAbsetzenAuf({ x: x + 1.3, z: z + 0.4, blick: eva.yaw + Math.PI, modus: 'streifen', sitzt: false, warte: 1 });
};
story.e4Los = () => { story.spaeter(1.0, () => story.sprich(TEXT_GELANDET)); };
story.updateE4 = updateE4;
story.e4Zustand = w4;
story.e4Kroeten = () => tiere.kroeten;                                             // fuer Tests                                                              // fuer Tests

const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookWueste(); };
})();
