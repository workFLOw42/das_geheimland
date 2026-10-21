// Das Geheimland – Etappe 3: in der Hoehle des Gorillas (Innenraum = eigene Welt, wie die Huette). Laedt nach hoehle.js,
// vor der Engine. Konzept Abschnitt 7, Etappe 3 "In der Hoehle":
//   1. Der Gorilla sitzt zusammengesunken am Feuer. Vor dem Suchblick passiert NICHTS (Live-Wunsch 21.10.2026: "Joshi muss
//      innen erst X druecken") – kein Y, keine Ringe.
//   2. X -> der Gorilla, der braune Lupenring und der Holzscheit mit dem gruenen Schnitzring leuchten auf.
//      Y beim Gorilla (vor der Lupe): "Lass mich bitte in Ruhe." · Schnitzring (vor der Lupe): noch nicht.
//   3. Lupe: ein zerbrochenes Holzentchen (Skizze ins Notizbuch).
//   4. Y beim Gorilla: "Ist dein Entchen zerbrochen?" – ja, seitdem ist er so traurig, nicht mal die Bananen vom Tisch
//      haben geholfen.
//   5. Schnitzring: Joshi schnitzt ein neues Entchen (Skizze unter dem kaputten; eine Kopie steht spaeter im Huettenregal).
//   6. Y beim Gorilla: das Entchen schenken -> er trommelt vor Freude auf die Brust und gibt den Bananenkorb zurueck; daran
//      rotes Fell (klebt dann im Notizbuch).
//   7. Joshi fragt nach dem Fell: weiss er nicht – frag doch den Hamster. Und: er leiht Joshi sein Flugzeug.
//   8. Vor dem Ausgang der blaue Fotoring: Foto vom Gorilla mit seinem Entchen.
// Danach draussen (hoehle.js): der Weg ist hell, die Mustang hat ein Y, Abflug.
// Die Hoehle schwebt weit draussen (RAUM, BODEN_Y = 150 wie die Huette) – von der Insel aus nicht zu sehen.
(function(){
'use strict';
const story = window.STORY;
const e3 = () => story.etappe === 3;

const RAUM = { x: 640, z: -620, R: 8.5, H: 7 };       // runde Felshoehle, Ausgang auf +z
const BODEN_Y = 150;
const AUSGANG = { B: 3.2, H: 3.3 };                    // Oeffnung in der Wand bei +z
const FEUER = { x: RAUM.x, z: RAUM.z - 0.5 };
const GORILLA = { x: RAUM.x - 2.3, z: RAUM.z - 2.4, blick: null };   // sitzt links hinter dem Feuer, schaut ins Feuer
GORILLA.blick = Math.atan2(FEUER.x - GORILLA.x, FEUER.z - GORILLA.z);
const SCHEIT = { x: RAUM.x + 3.6, z: RAUM.z + 1.4 };   // rechts vorn, mit dem gruenen Ring
const LUPE_P = { x: RAUM.x - 3.7, z: RAUM.z + 0.2 };   // links neben dem Gorilla: das zerbrochene Entchen
const KORB = { x: RAUM.x - 3.2, z: RAUM.z - 4.6 };     // hinter dem Gorilla im Schatten (er gibt ihn spaeter zurueck)
const FOTO_P = { x: RAUM.x, z: RAUM.z + RAUM.R - 2.2 }; // vor dem Ausgang
const hi = story.hoehleInnen = { drin: false, wechsel: null, sperre: 0, gebaut: false, gruppe: null, gorilla: null, stufe: 'x',
  mixer: null, acts: {}, cur: null, korb: null, kaputt: null, entchen: null, t: 0 };
// stufe: 'x' (vor dem Suchblick) -> 'gesucht' -> 'lupe' (Entchen gesehen) -> 'erzaehlt' -> 'geschnitzt' -> 'froh' (geschenkt,
// Korb zurueck) -> 'fell' (Fell gesehen, Flugzeug geliehen) -> 'foto' (fertig)

// ---- Texte (Entwuerfe) ------------------------------------------------------------------------------------------------
const T = {
  ankunft: ['Hier ist es ganz schön dunkel. Und da sitzt der Gorilla am Feuer.'],
  hinweisX: ['Schau dich in der Höhle genau um. Drück dafür X.'],
  inRuhe: ['Lass mich bitte in Ruhe.'],
  nochNicht: ['Vielleicht siehst du dir vorher noch etwas anderes ganz genau an.'],
  entchenGesehen: ['Oh, ein Holzentchen. Es ist zerbrochen.'],
  joshiFragt: ['Ist dein Entchen zerbrochen?'],
  gorillaErzaehlt: ['Ja... Das war mein liebstes Spielzeug. Seitdem bin ich ganz dolle traurig.',
    'Nichts kann mich trösten. Nicht mal die Bananen, die ich vom Festtisch genommen habe. Der war ja eh schon ganz durcheinander.'],
  schnitzIdee: ['Vielleicht kannst du ihm ein neues Entchen schnitzen. Am grünen Kreis liegt ein Stück Holz.'],
  geschnitzt: ['Toll! Ein neues Holzentchen.'],
  schenken: ['Schau mal, ich habe dir ein neues Entchen geschnitzt.'],
  froh: ['Für mich? Oh, danke! Das ist ja wunderschön!'],
  korb: ['Hier, die Bananen gehören euch. Es tut mir leid, dass ich sie genommen habe.'],
  fell: ['Schau mal, am Korb klebt rotes Fell. Das kommt in dein Notizbuch.'],
  joshiFell: ['Weißt du, von wem das rote Fell ist?'],
  gorillaFell: ['Nein, das weiß ich nicht. Aber frag doch mal den Hamster. Der weiß immer alles und kennt jeden.',
    'Und weil du so lieb zu mir warst, leihe ich dir mein Flugzeug. Damit kommst du schnell zu ihm.'],
  fotoIdee: ['Mach doch noch ein Foto von deinem neuen Freund. Am Ausgang ist ein blauer Kreis.'],
  foto: ['Klasse! Der Gorilla lacht wieder.'],
  hinweisLupe: ['Neben dem Gorilla ist ein brauner Kreis. Schau dort ganz genau hin.'],
  hinweisGorilla: ['Sprich doch noch einmal mit dem Gorilla.'],
  hinweisSchnitz: ['Am grünen Kreis liegt ein Stück Holz. Schnitz ihm ein neues Entchen.'],
  hinweisFoto: ['Am Ausgang ist ein blauer Kreis. Mach ein Foto vom Gorilla.'],
  hinweisRaus: ['Geh hinaus zum Flugzeug. Der Gorilla hat es dir geliehen.'],
};
story.hoehleText = T;

// ---- Raum ------------------------------------------------------------------------------------------------------------
// Felswand: ein Zylinder (innen), dessen Ecken unregelmaessig nach aussen/innen versetzt sind; oben eine Kuppel. Boden aus
// Erde mit ein paar Steinen. Im Ausgang ein helles Bild (Nachmittag draussen) – hinkommen kann man nur durch die Oeffnung.
const felsMatI = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.BackSide });
function felsFarbe(geo, rnd){
  const p = geo.attributes.position, n = p.count, col = new Float32Array(n * 3);
  const f = [new THREE.Color(0x5e5952), new THREE.Color(0x4f4b45), new THREE.Color(0x6a645b)], moos = new THREE.Color(0x4a5a34), c = new THREE.Color();
  for(let i = 0; i < n; i += 3){ c.copy(rnd() < 0.08 ? moos : f[Math.floor(rnd() * 3)]); for(let j = 0; j < 3; j++) col.set([c.r, c.g, c.b], (i + j) * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
function baueRaum(){
  if(hi.gruppe) return;
  const g = new THREE.Group(), R = RAUM.R, H = RAUM.H;
  let s = 9; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // Wand mit Ausgang: Zylinder von a0..a1 (die Oeffnung bei +z ausgelassen), Ecken versetzt
  const offen = Math.asin(AUSGANG.B / 2 / R) + 0.04, a0 = Math.PI / 2 + offen, laenge = Math.PI * 2 - 2 * offen;
  let wand = new THREE.CylinderGeometry(R, R, H, 40, 6, true, a0, laenge).toNonIndexed();
  const v = new THREE.Vector3(), merk = new Map(), pos = wand.attributes.position;
  for(let i = 0; i < pos.count; i++){ v.fromBufferAttribute(pos, i); const key = v.x.toFixed(2) + ',' + v.y.toFixed(2) + ',' + v.z.toFixed(2);
    if(!merk.has(key)) merk.set(key, 0.92 + rnd() * 0.16); const k = merk.get(key); pos.setXYZ(i, v.x * k, v.y, v.z * k); }
  wand.translate(0, H / 2, 0); wand.computeVertexNormals(); felsFarbe(wand, rnd);
  const wm = new THREE.Mesh(wand, felsMatI); wm.userData.keinKoerper = true; g.add(wm);
  // Kuppel
  const kuppel = new THREE.SphereGeometry(R, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2).toNonIndexed();
  kuppel.scale(1, 0.55, 1); kuppel.translate(0, H, 0); kuppel.computeVertexNormals(); felsFarbe(kuppel, rnd);
  const kp = new THREE.Mesh(kuppel, felsMatI); kp.userData.keinKoerper = true; g.add(kp);
  // Wand ueber dem Ausgang (Sturz): ein Stueck Fels
  const sturz = new THREE.Mesh(new THREE.BoxGeometry(AUSGANG.B + 1.2, H - AUSGANG.H, 0.8), new THREE.MeshLambertMaterial({ color: 0x55504a }));
  sturz.position.set(0, AUSGANG.H + (H - AUSGANG.H) / 2, R - 0.3); sturz.userData.keinKoerper = true; g.add(sturz);
  // Boden: dunkle Erde mit Flecken
  const c = document.createElement('canvas'); c.width = c.height = 256; const cg = c.getContext('2d'); cg.fillStyle = '#4a3f33'; cg.fillRect(0, 0, 256, 256);
  for(let i = 0; i < 900; i++){ cg.fillStyle = rnd() < 0.5 ? 'rgba(70,60,48,.6)' : 'rgba(100,88,70,.45)'; cg.fillRect(rnd() * 256, rnd() * 256, 2 + rnd() * 4, 2 + rnd() * 4); }
  const bt = new THREE.CanvasTexture(c); bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.set(3, 3);
  const boden = new THREE.Mesh(new THREE.CircleGeometry(R + 0.5, 40), new THREE.MeshLambertMaterial({ map: bt }));
  boden.rotation.x = -Math.PI / 2; boden.position.y = 0.01; boden.userData.begehbar = true; g.add(boden);
  // Ausgang: helles Bild (draussen spaeter Nachmittag), ein Stueck hinter der Oeffnung; den Boden davor zieht ein heller
  // Lichtfleck in die Hoehle
  const aus = document.createElement('canvas'); aus.width = 128; aus.height = 128; const ag = aus.getContext('2d');
  const ah = ag.createLinearGradient(0, 0, 0, 128); ah.addColorStop(0, '#e8d6c2'); ah.addColorStop(0.62, '#f0e2d0'); ah.addColorStop(0.64, '#dfe6ea'); ah.addColorStop(1, '#cfd8de');
  ag.fillStyle = ah; ag.fillRect(0, 0, 128, 128);
  for(let i = 0; i < 9; i++){ const x = 6 + i * 14 + rnd() * 6, hh = 30 + rnd() * 26; ag.fillStyle = '#3f6a4a'; ag.beginPath(); ag.moveTo(x, 82 - hh); ag.lineTo(x - 7, 84); ag.lineTo(x + 7, 84); ag.fill(); }
  const bild = new THREE.Mesh(new THREE.PlaneGeometry(AUSGANG.B + 0.4, AUSGANG.H + 0.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(aus) }));
  bild.position.set(0, AUSGANG.H / 2, R + 1.2); bild.rotation.y = Math.PI; bild.userData.deko = true; g.add(bild);
  for(const sx of [-1, 1]){ const w = new THREE.Mesh(new THREE.BoxGeometry(0.6, AUSGANG.H + 0.4, 1.6), new THREE.MeshLambertMaterial({ color: 0x4f4a44 }));
    w.position.set(sx * (AUSGANG.B / 2 + 0.3), AUSGANG.H / 2, R + 0.4); w.userData.keinKoerper = true; g.add(w); }   // Laibung (Grenze: raumTiefe)
  const licht = document.createElement('canvas'); licht.width = licht.height = 64; const lg = licht.getContext('2d'), lr = lg.createRadialGradient(32, 32, 0, 32, 32, 32);
  lr.addColorStop(0, 'rgba(255,240,215,.38)'); lr.addColorStop(1, 'rgba(255,240,215,0)'); lg.fillStyle = lr; lg.fillRect(0, 0, 64, 64);
  const lf = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(licht), transparent: true, depthWrite: false }));
  lf.rotation.x = -Math.PI / 2; lf.position.set(0, 0.02, R - 1.4); lf.userData.deko = true; lf.renderOrder = 2; g.add(lf);
  // ein paar Steine und Stroh (sein Schlafplatz) an der Wand
  const stroh = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.25, 14), new THREE.MeshLambertMaterial({ color: 0xb59a5a })); stroh.position.set(-R + 2.4, 0.12, -1.8); g.add(stroh);
  for(let i = 0; i < 10; i++){ const a = rnd() * Math.PI * 2, r = R - 0.9 - rnd() * 0.6; if(Math.abs(a - Math.PI / 2) < 0.6) continue;
    const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + rnd() * 0.45, 0), new THREE.MeshLambertMaterial({ color: 0x5a554e, flatShading: true }));
    st.position.set(Math.cos(a) * r, 0.25, Math.sin(a) * r); st.rotation.set(rnd() * 3, rnd() * 3, 0); g.add(st); }
  // Licht: das Feuer (insel.js Typ 'lagerfeuer' bringt sein eigenes Licht), dazu ein schwaches, warmes Grundlicht und etwas
  // kuehles Licht vom Ausgang
  const grund = new THREE.PointLight(0xffd0a0, 0.35, 22, 1.2); grund.position.set(0, H - 1, 0); g.add(grund);
  const tag = new THREE.PointLight(0xe8eef4, 0.55, 12, 1.4); tag.position.set(0, 2.2, R - 1); g.add(tag);
  g.position.set(RAUM.x, BODEN_Y, RAUM.z);
  story.welt(3).add(g); hi.gruppe = g;
  story.ding(g, { welt: 3, typ: 'hoehle_innen' });   // nur Stroh und Steine an der Wand (die Wand selbst: raumTiefe)
  // Feuer, Scheit, Korb, zerbrochenes Entchen
  story.setze('lagerfeuer', 3, { x: FEUER.x, z: FEUER.z, y: BODEN_Y, fest: true }).bereit.then(d => { const L = story.interListe, i = L.findIndex(o => o.obj === d.obj); if(i >= 0) L.splice(i, 1); });
  story.setze('holzscheit', 3, { x: SCHEIT.x, z: SCHEIT.z, y: BODEN_Y, dreh: 0.4, fest: true }).bereit.then(d => { hi.scheit = d; });
  hi.korb = story.setze('bananenkorb', 3, { x: KORB.x, z: KORB.z, y: BODEN_Y, dreh: 0.5, fest: true }).obj;
  hi.kaputt = story.setze('entchen_kaputt', 3, { x: LUPE_P.x, z: LUPE_P.z, y: BODEN_Y, dreh: -0.8, fest: true });
  gorillaLaden();
}

// ---- Modelle: Bananenkorb (aus Grundformen), zerbrochenes Entchen (aus dem Entchen-Modell) -----------------------------
function baueKorb(){
  const g = new THREE.Group(), geflecht = new THREE.MeshLambertMaterial({ color: 0x9a6b3a }), dunkel = new THREE.MeshLambertMaterial({ color: 0x6e4a26 });
  const k = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.32, 16, 1, true), new THREE.MeshLambertMaterial({ color: 0x9a6b3a, side: THREE.DoubleSide })); k.position.y = 0.16; g.add(k);
  const b = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), dunkel); b.rotation.x = -Math.PI / 2; b.position.y = 0.01; b.userData.keinKoerper = true; g.add(b);
  for(let i = 0; i < 4; i++){ const r = new THREE.Mesh(new THREE.TorusGeometry(0.31 + i * 0.035, 0.012, 4, 24), dunkel); r.rotation.x = Math.PI / 2; r.position.y = 0.05 + i * 0.08; r.userData.keinKoerper = true; g.add(r); }
  const henkel = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.025, 6, 20, Math.PI), geflecht); henkel.position.y = 0.32; henkel.userData.keinKoerper = true; g.add(henkel);
  // Bananen (gelbe Boegen) im Korb
  const gelb = new THREE.MeshLambertMaterial({ color: 0xf0cf3c });
  for(let i = 0; i < 5; i++){ const ba = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 10, 1.6), gelb); ba.position.set((i - 2) * 0.09, 0.3, (i % 2 - 0.5) * 0.12); ba.rotation.set(0.2, i * 0.6, 1.2 + i * 0.1); ba.userData.keinKoerper = true; g.add(ba); }
  // rotes Fell am Rand (ein paar rote Haare, nur aus der Naehe zu sehen)
  const rot = new THREE.MeshLambertMaterial({ color: 0xc0451c });
  const fell = new THREE.Group(); fell.position.set(0.38, 0.28, 0.12); fell.userData.keinKoerper = true; g.add(fell);
  for(let i = 0; i < 7; i++){ const h = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.12, 4), rot); h.position.set((i - 3) * 0.008, 0, (i % 2) * 0.01); h.rotation.set(0.4 + i * 0.12, 0, 0.9 - i * 0.08); fell.add(h); }
  g.userData.fell = fell; fell.visible = false;                   // kommt erst mit dem Korb in Sicht (stufe 'froh')
  return g;
}
story.typ('bananenkorb', { bau: () => baueKorb() });
// zerbrochenes Entchen: das Modell, oberhalb der Hals-Hoehe abgeschnitten (Kopf daneben, gekippt), ein paar Splitter
const HALS = 0.5;                                     // Anteil der Hoehe, an dem der Hals bricht
function entchenTeile(){
  return story.modellKlon('entchen').then(({ g, L }) => {
    const ganz = new THREE.Group(); ganz.add(g); g.scale.setScalar(0.32 / L); ganz.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(ganz); g.position.y -= bb.min.y; ganz.updateMatrixWorld(true);
    const bb2 = new THREE.Box3().setFromObject(ganz), hals = bb2.min.y + (bb2.max.y - bb2.min.y) * HALS;
    return { ganz, hals };
  });
}
function clipNach(obj, hals, oben){
  // Material mit Schnittebene: oben = nur der Teil ueber dem Hals, sonst nur darunter
  obj.traverse(m => { if(!m.isMesh) return; m.material = m.material.clone();
    m.material.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, oben ? 1 : -1, 0), oben ? -hals : hals)]; m.material.clipShadows = true; });
}
function baueKaputt(){
  return entchenTeile().then(({ ganz, hals }) => {
    const g = new THREE.Group();
    const rumpf = ganz.clone(true); clipNach(rumpf, hals, false); g.add(rumpf);
    const kopf = ganz.clone(true); clipNach(kopf, hals, true);
    // Kopf abgelegt: um den Bruch gekippt, neben dem Rumpf
    const k = new THREE.Group(); k.add(kopf); kopf.position.y = -hals; k.position.set(0.24, 0.06, 0.1); k.rotation.set(0.2, 0.9, 1.35); g.add(k);
    const holz = new THREE.MeshLambertMaterial({ color: 0xc89a62 });
    for(let i = 0; i < 4; i++){ const sp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.008, 0.012), holz); sp.position.set(0.1 + i * 0.03, 0.005, -0.06 + i * 0.03); sp.rotation.y = i; sp.userData.keinKoerper = true; g.add(sp); }
    g.userData.welt = true; return g;
  });
}
story.typ('entchen_kaputt', { bau: () => baueKaputt() });
// Lupe/Skizze (notizbuch.js): das zerbrochene Entchen gross, Schnitzen: das heile Entchen
story.kaputtesEntchen = () => baueKaputt().then(g => { const bb = new THREE.Box3().setFromObject(g), L = Math.max(...bb.getSize(new THREE.Vector3()).toArray()); return { g, L }; });

// ---- Gorilla -----------------------------------------------------------------------------------------------------------
// WildPoly3D (gorilla_glb.js): sit ~1,65 m (gemessen), steht ~1,8 m. Lambert + Vertexfarben (skinning: true, sonst Ruhepose).
const GA = { sitzen: 'Gorilla_sit', freuen: 'Gorilla_ChestDrum', stehen: 'Gorilla_idle', schauen: 'Gorilla_Look' };
function gorillaLaden(){
  if(hi.gorilla || hi.laedt) return; hi.laedt = true;
  story.ladeGlb(window.GORILLA_GLB, 'Gorilla', (gl) => {
    const o = gl.scene;
    o.traverse(m => { if(m.isMesh){ m.frustumCulled = false; m.castShadow = true; const alt = m.material;
      m.material = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0xffffff, skinning: !!m.isSkinnedMesh }); if(alt.dispose) alt.dispose(); } });
    const mx = new THREE.AnimationMixer(o), stehen = gl.animations.find(a => a.name === GA.stehen), v = new THREE.Vector3();
    if(stehen){ mx.clipAction(stehen).play(); mx.update(0.05); } o.updateMatrixWorld(true);
    const bb = new THREE.Box3(); o.traverse(m => { if(!m.isSkinnedMesh) return; for(let i = 0; i < m.geometry.attributes.position.count; i += 3){ m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); bb.expandByPoint(v); } });
    const k = 1.8 / Math.max(0.01, bb.max.y - bb.min.y); o.scale.multiplyScalar(k);
    const c = bb.getCenter(new THREE.Vector3()); o.position.set(-c.x * k, -bb.min.y * k, -c.z * k);
    mx.stopAllAction(); mx.uncacheRoot(o);
    const h = new THREE.Group(); h.add(o); h.name = 'Gorilla'; h.userData.agent = true;
    h.position.set(GORILLA.x, BODEN_Y, GORILLA.z); h.rotation.y = GORILLA.blick;
    story.welt(3).add(h); h.updateMatrixWorld(true);
    const saeule = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.7, 10), new THREE.MeshBasicMaterial({ visible: false })); saeule.position.y = 0.85; h.add(saeule);
    story.ding(saeule, { welt: 3, typ: 'gorilla' });
    hi.gorilla = h; hi.mixer = new THREE.AnimationMixer(o);
    for(const [n, name] of Object.entries(GA)){ const a = gl.animations.find(x => x.name === name); if(a) hi.acts[n] = hi.mixer.clipAction(a); }
    gorillaAnim('sitzen');
    // Interaktion (innen: true – nur in der Hoehle). Erst der Suchblick (X) schaltet ihn frei, wie alles.
    const vorn = { x: GORILLA.x + Math.sin(GORILLA.blick) * 1.25, z: GORILLA.z + Math.cos(GORILLA.blick) * 1.25 };
    hi.inter = story.interaktion(h, { name: 'Gorilla', welt: 3, innen: true, x: vorn.x, z: vorn.z, r: 0.9, yx: GORILLA.x, yz: GORILLA.z, yHoehe: 2.3, rolle: 'tierM', aktion: gorillaY });
  });
}
function gorillaAnim(n, einmal){
  const a = hi.acts[n]; if(!a || hi.cur === n) return;
  const alt = hi.cur && hi.acts[hi.cur];
  a.reset(); a.setLoop(einmal ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = !!einmal; a.play();
  if(alt) a.crossFadeFrom(alt, 0.4, false);
  hi.cur = n;
}

// ---- Ablauf: Y beim Gorilla, je nach Stufe --------------------------------------------------------------------------
function sprichDann(saetze, rolle, fertig){ story.sprich(saetze, fertig, rolle); }
function gorillaY(o){
  if(o.spricht) return; o.spricht = true;
  const fertig = () => { o.spricht = false; };
  if(hi.stufe === 'gesucht'){ sprichDann(T.inRuhe, 'tierM', fertig); return; }
  if(hi.stufe === 'lupe'){
    hi.stufe = 'erzaehlt';
    sprichDann(T.joshiFragt, 'joshi'); gorillaAnim('schauen');
    sprichDann(T.gorillaErzaehlt, 'tierM', () => { gorillaAnim('sitzen'); sprichDann(T.schnitzIdee, undefined, fertig); fuchsZu('entchen_schnitzen'); });
    return;
  }
  if(hi.stufe === 'erzaehlt'){ sprichDann(T.hinweisSchnitz, undefined, fertig); return; }
  if(hi.stufe === 'geschnitzt'){
    hi.stufe = 'froh';
    sprichDann(T.schenken, 'joshi');
    story.spaeter(1.5, () => { entchenZeigen(); });
    sprichDann(T.froh, 'tierM', () => { gorillaAnim('freuen', true); story.spaeter(2.4, () => gorillaAnim('stehen'));
      korbZurueck(); sprichDann(T.korb, 'tierM', () => {
        if(hi.korb && hi.korb.userData.fell) hi.korb.userData.fell.visible = true;
        sprichDann(T.fell, undefined, () => { fellInsNotizbuch(); hi.stufe = 'fell';
          sprichDann(T.joshiFell, 'joshi'); sprichDann(T.gorillaFell, 'tierM', () => {
            story.e3MustangFrei = true;                            // hoehle.js: Y an der Mustang, der Weg wird hell
            sprichDann(T.fotoIdee, undefined, fertig); fuchsZu('gorilla_foto'); }); }); }); });
    return;
  }
  if(hi.stufe === 'fell' || hi.stufe === 'foto'){ sprichDann(['Danke, ' + 'Joshi! Viel Glück beim Hamster.'], 'tierM', fertig); return; }
  sprichDann(T.inRuhe, 'tierM', fertig);
}
// Das neue Entchen (das geschnitzte) haelt er dann in den Haenden – vor ihm auf dem Boden, gut zu sehen
function entchenZeigen(){
  if(hi.entchen) return;
  // als Kind des Gorillas: vor seiner Brust, ein Stueck groesser (es soll auf dem Foto klar zu sehen sein)
  story.modellKlon('entchen').then(({ g, L }) => { g.scale.setScalar(0.5 / L); g.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(g), c = bb.getCenter(new THREE.Vector3()); g.position.set(-c.x, 1.0 - c.y, 0.85 - c.z); g.rotation.y = Math.PI / 2;   // vor der Brust, klar vor dem Koerper
    g.userData.deko = true; hi.gorilla.add(g); hi.entchen = g; });
}
// Den Korb schiebt er zu Joshi hin: er rueckt ein Stueck nach vorn (sichtbar)
function korbZurueck(){
  const d = story.dinge.find(q => q.obj === hi.korb); if(!d) return;
  hi.korbWeg = { t: 0, von: hi.korb.position.clone(), nach: new THREE.Vector3(GORILLA.x + 0.4, BODEN_Y, GORILLA.z + 1.8) };
}
// Fell ins Notizbuch: Bleistift-Skizze (rote Haare auf Papier, gezeichnet) – Seite "Rotes Fell"
function fellInsNotizbuch(){
  const W = 1200, H = 800, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, W, H);
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.lineCap = 'round';
  for(let i = 0; i < 46; i++){ const x = 470 + rnd() * 260, y = 300 + rnd() * 200, a = -0.9 + rnd() * 0.5, L = 110 + rnd() * 150;
    g.strokeStyle = i % 3 ? 'rgba(196,74,30,.85)' : 'rgba(150,50,20,.8)'; g.lineWidth = 2 + rnd() * 2.5;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 18, y + Math.sin(a) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  // Bleistift-Rahmen: Klebeband-Umriss wie ein Fundstueck
  g.strokeStyle = 'rgba(60,55,50,.55)'; g.lineWidth = 3; g.strokeRect(400, 220, 420, 360);
  if(story.notizSeiteDazu) story.notizSeiteDazu({ art: 'skizze', bild: c, name: 'Rotes Fell', ort: 'waldinsel' });
}
function fuchsZu(id){
  const k = story.kreisZielVon && story.kreisZielVon(id); if(!k || !eva || !story.fuchsRundgang) return;
  story.spaeter(0.6, () => story.fuchsRundgang(eva.group.position.x, eva.group.position.z, true, 0, true, q => q === k));
}

// notizbuch.js: nach jeder fertigen Stelle
story.e3StelleFertig = function(id){
  if(id === 'entchen_lupe' && hi.stufe === 'gesucht'){ hi.stufe = 'lupe'; story.spaeter(0.8, () => story.sprich(T.hinweisGorilla)); }
  if(id === 'entchen_schnitzen' && hi.stufe === 'erzaehlt'){ hi.stufe = 'geschnitzt'; story.spaeter(0.8, () => story.sprich(T.hinweisGorilla)); }
  if(id === 'gorilla_foto'){ hi.stufe = 'foto'; story.spaeter(0.6, () => story.sprich(T.hinweisRaus)); }
};
// Bedingungen der Stellen (notizbuch.js STELLEN): erst nach dem Suchblick; Schnitzen erst nach dem Gespraech; Foto am Schluss
story.e3StelleFrei = function(id){
  if(id === 'entchen_lupe') return hi.stufe !== 'x';
  if(id === 'entchen_schnitzen') return hi.stufe !== 'x';           // sichtbar ab dem Suchblick, Y erst nach dem Gespraech (e3Darf)
  if(id === 'gorilla_foto') return hi.stufe === 'fell' || hi.stufe === 'foto';
  return false;
};
story.e3Darf = function(id){                                       // Y am Kreis: darf es schon? (sonst ein Satz)
  if(id === 'entchen_schnitzen' && hi.stufe !== 'erzaehlt'){ story.sprich(T.nochNicht); return false; }
  return true;
};
// Foto vom Gorilla: er steht, das Entchen in der Hand (vor ihm), schaut zur Kamera und lacht (ChestDrum ist zu wild – stehen)
story.e3FotoVorbereiten = function(){ if(!hi.gorilla) return; story.fotoLaeuft = true;
  hi.gorilla.rotation.y = Math.atan2(FOTO_P.x - GORILLA.x, FOTO_P.z - GORILLA.z); gorillaAnim('stehen');
  if(hi.korb){ hi.korbWeg = null; hi.korb.position.set(GORILLA.x + 1.1, BODEN_Y, GORILLA.z + 0.4); }
  story.spaeter(8, () => { story.fotoLaeuft = false; }); };
story.e3Hinweis = function(){
  if(hi.drin){
    if(hi.stufe === 'x') return T.hinweisX;
    if(hi.stufe === 'gesucht') return T.hinweisLupe;
    if(hi.stufe === 'lupe') return T.hinweisGorilla;
    if(hi.stufe === 'erzaehlt') return T.hinweisSchnitz;
    if(hi.stufe === 'geschnitzt') return T.hinweisGorilla;
    if(hi.stufe === 'fell') return T.hinweisFoto;
    return T.hinweisRaus;
  }
  return hi.stufe === 'foto' || story.e3MustangFrei ? ['Steig in das Flugzeug. Der Gorilla hat es dir geliehen.'] : ['Geh doch mal zur Höhle im Berg. Dort wohnt der Gorilla.'];
};
// Suchblick in der Hoehle (story.js fuchsRundgang ruft vor dem Freischalten): ab jetzt passiert etwas
story.e3Gesucht = function(){ if(hi.drin && hi.stufe === 'x') hi.stufe = 'gesucht'; };

// Testzugang "E3 Abflug" (story.js): alles in der Hoehle erledigt, Joshi draussen am Waldausgang
story.testE3 = function(){
  baueRaum();
  const warte = () => { if(!hi.gorilla){ story.spaeter(0.3, warte); return; }
    hi.stufe = 'gesucht';
    let k = Promise.resolve();
    for(const id of ['entchen_lupe', 'entchen_schnitzen']) k = k.then(() => story.testStelle ? story.testStelle(id) : null);
    k.then(() => { hi.stufe = 'froh'; entchenZeigen(); gorillaAnim('stehen'); if(hi.korb && hi.korb.userData.fell) hi.korb.userData.fell.visible = true;
      korbZurueck(); fellInsNotizbuch(); hi.stufe = 'fell'; story.e3MustangFrei = true; hi.warDrin = true;
      return story.testStelle ? story.testStelle('gorilla_foto') : null; })
     .then(() => { hi.stufe = 'foto'; if(story.e3Draussen) story.e3Draussen(); });
  };
  warte();
};
// ---- Hinein / hinaus (wie die Huette: Blende, eigene Welt) -----------------------------------------------------------
const HUELLE = 15, KOERPER = 0.32;
function imRaum(x, z){ return Math.hypot(x - RAUM.x, z - RAUM.z) < RAUM.R + HUELLE; }
function raumTiefe(x, z){
  const lx = x - RAUM.x, lz = z - RAUM.z, d = Math.hypot(lx, lz);
  // im Durchgang (bei +z, so breit wie der Ausgang) frei bis ein Stueck hinaus – dort loest updateWechsel den Wechsel aus
  if(lz > 0 && Math.abs(lx) < AUSGANG.B / 2 - 0.25) return lz > RAUM.R + 1.0 ? lz - (RAUM.R + 1.0) : 0;
  return Math.max(0, d - (RAUM.R - KOERPER - 0.3));
}
function raumFrei(x, z){ const t = raumTiefe(x, z); if(t <= 0) return true; const von = story.schrittVon && story.schrittVon(); return !!von && t <= raumTiefe(von.x, von.z) + 1e-6; }
let blendeEl = null;
function blende(w){ if(!blendeEl){ blendeEl = document.createElement('div'); blendeEl.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:25;'; document.body.appendChild(blendeEl); } blendeEl.style.opacity = String(w); }
function setzeUm(ziel){
  const g = eva.group;
  if(ziel === 'innen'){
    baueRaum();
    const x = RAUM.x, z = RAUM.z + RAUM.R - 3.6;              // ein Stueck in der Hoehle: hinter ihm hat die Kamera Platz
    g.position.set(x, BODEN_Y, z); eva.yaw = 0;                 // Blick in die Hoehle (-z): Feuer und Gorilla
    hi.drin = true; story.innen.drin = true; story.innen.wo = 'hoehle';
    if(!hi.warDrin){ hi.warDrin = true; story.spaeter(1.0, () => story.sprich(T.ankunft)); }
  } else {
    const H = story.hoehle.eingang, { x, z } = story.freierPlatz(H.x, H.z + 4.5, 'joshi');
    g.position.set(x, evaFootY(x, z), z); eva.yaw = Math.PI;      // Blick vom Berg weg (Wiese, Piste)
    hi.drin = false; story.innen.drin = false; story.innen.wo = null;
    if(story.e3Draussen) story.e3Draussen();
  }
  g.rotation.y = eva.yaw; evaOrbit = 0; evaPitch = 0;
  const back = new THREE.Vector3(Math.sin(eva.yaw), 0, Math.cos(eva.yaw));
  camera.position.copy(g.position).addScaledVector(back, hi.drin ? 3.6 : 5).add(new THREE.Vector3(0, 2, 0));
  hi.kamSofort = hi.drin; hi.sperre = 1.0;
  if(hi.drin){ const yaw = eva.yaw; camera.position.set(g.position.x + Math.sin(yaw) * 3.0, BODEN_Y + 2.3, g.position.z + Math.cos(yaw) * 3.0); camera.lookAt(g.position.x, BODEN_Y + 0.8, g.position.z); }
  if(story.fuchsZu) story.fuchsZu(ziel);
}
story.e3InDieHoehle = () => { if(!hi.wechsel) hi.wechsel = { t: 0, ziel: 'innen', gesetzt: false }; };
function updateWechsel(dt){
  if(!eva) return;
  if(hi.wechsel){ const w = hi.wechsel; w.t += dt;
    if(w.t < 0.35) blende(w.t / 0.35);
    else { if(!w.gesetzt){ w.gesetzt = true; setzeUm(w.ziel); } blende(Math.max(0, 1 - (w.t - 0.35) / 0.45)); if(w.t > 0.8){ hi.wechsel = null; blende(0); } }
    return; }
  if(hi.sperre > 0){ hi.sperre -= dt; return; }
  const p = eva.group.position;
  if(hi.drin){
    if(!imRaum(p.x, p.z) || p.y < BODEN_Y - 1){ setzeUm('innen'); return; }
    if(p.z - RAUM.z > RAUM.R - 0.1 && Math.abs(p.x - RAUM.x) < AUSGANG.B / 2) hi.wechsel = { t: 0, ziel: 'aussen', gesetzt: false };
  } else {
    const H = story.hoehle.eingang;                                // durch das schwarze Loch hinein
    // schon an der dunklen Oeffnung (vor dem Felsbogen, der Joshi sonst kurz davor aufhielt – gemessen bei z -16,9)
    if(Math.abs(p.x - H.x) < H.B / 2 - 0.4 && p.z < H.z + 2.4 && p.z > H.z - 1.5) hi.wechsel = { t: 0, ziel: 'innen', gesetzt: false };
  }
}

// ---- Jedes Bild ------------------------------------------------------------------------------------------------
story.updateHoehleInnen = function(dt){
  if(!e3()) return;
  hi.t += dt;
  updateWechsel(dt);
  if(hi.mixer) hi.mixer.update(dt);
  if(hi.korbWeg){ const w = hi.korbWeg; w.t += dt; const k = Math.min(1, w.t / 1.2), e = k * k * (3 - 2 * k);
    hi.korb.position.lerpVectors(w.von, w.nach, e); hi.korb.position.y = BODEN_Y + Math.sin(k * Math.PI) * 0.25;
    if(k >= 1){ hi.korbWeg = null; const d = story.dinge.find(q => q.obj === hi.korb); if(d && story.dingNeu) story.dingNeu(d); } }
  // Gorilla schaut traurig ins Feuer; froh: zu Joshi
  if(hi.gorilla && eva && hi.drin && (hi.stufe === 'froh' || hi.stufe === 'fell') && !story.fotoLaeuft){
    const p = eva.group.position, soll = Math.atan2(p.x - GORILLA.x, p.z - GORILLA.z); let dw = soll - hi.gorilla.rotation.y; dw = Math.atan2(Math.sin(dw), Math.cos(dw));
    hi.gorilla.rotation.y += dw * Math.min(1, dt * 2); }
};

// ---- Hooks: Boden, Grenzen, Kamera in der Hoehle -------------------------------------------------------------------
function hookHoehle(){
  const solidOrig = evaSolid, fussOrig = evaFootY, hitsOrig = hitsBuilding, wasserOrig = isOpenWater, dinghyOrig = evaEnterDinghy;
  evaSolid = function(x, z){ if(e3() && locale === 'earth' && imRaum(x, z)) return raumFrei(x, z); return solidOrig.apply(this, arguments); };
  evaFootY = function(x, z){ if(e3() && locale === 'earth' && imRaum(x, z)) return BODEN_Y; return fussOrig.apply(this, arguments); };
  hitsBuilding = function(x, y, z){ if(e3() && locale === 'earth' && imRaum(x, z) && !raumFrei(x, z)) return true; return hitsOrig.apply(this, arguments); };
  isOpenWater = function(x, z){ if(e3() && locale === 'earth' && imRaum(x, z)) return false; return wasserOrig.apply(this, arguments); };
  evaEnterDinghy = function(){ if(hi.drin) return; return dinghyOrig.apply(this, arguments); };
  // Kamera: wie in der Huette, an der runden Wand geklemmt
  const camOrig = updateCamera, _soll = new THREE.Vector3();
  updateCamera = function(){
    if(!(hi.drin && eva)) return camOrig.apply(this, arguments);
    if(Math.abs(lookX) > 0.01) evaOrbit -= lookX * EVA_LOOK_SPEED * dtCam; else evaOrbit += (0 - evaOrbit) * Math.min(1, EVA_LOOK_RETURN * dtCam);
    const p = eva.group.position, yaw = eva.yaw + evaOrbit;
    // hinter Joshi; stoesst sie an die Wand, rueckt sie an der Wand entlang zur Seite (Live-Pruefung: an der Wand geklemmt
    // stand sie fast auf ihm und schaute steil herunter) – mindestens 2,6 m Abstand, nie steiler als ~35 Grad
    const max = RAUM.R - 0.8;
    let best = null;
    for(const dw of [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4]){
      for(const L of [4.2, 3.6, 3.0, 2.6]){
        const cx = p.x + Math.sin(yaw + dw) * L, cz = p.z + Math.cos(yaw + dw) * L;
        if(Math.hypot(cx - RAUM.x, cz - RAUM.z) <= max){ best = { cx, cz, L }; break; }
      }
      if(best) break;
    }
    if(!best){ const dx = p.x - RAUM.x, dz = p.z - RAUM.z, d = Math.hypot(dx, dz) || 1; best = { cx: RAUM.x - dx / d * 2.5, cz: RAUM.z - dz / d * 2.5, L: 2.6 }; }   // zur Mitte hin
    _soll.set(best.cx, BODEN_Y + 1.6 + best.L * 0.22, best.cz);
    if(hi.kamSofort){ camera.position.copy(_soll); hi.kamSofort = false; } else camera.position.lerp(_soll, Math.min(1, 6 * dtCam));
    camera.up.set(0, 1, 0); camera.lookAt(p.x, p.y + 0.8, p.z);
  };
  // drinnen: kein Meer, keine Moewen
  const ambOrig = updateAmbient;
  updateAmbient = function(){ const r = ambOrig.apply(this, arguments); if(hi.drin && ambGullGain && ambOceanGain){ ambGullGain.gain.value = 0; ambOceanGain.gain.value *= 0.15; } return r; };
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookHoehle(); };
})();
