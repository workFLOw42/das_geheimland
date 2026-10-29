// Das Geheimland – Etappe 5, das Ende auf dem Mond (Live-Wuensche 28.10.2026, Konzept Etappe 5 Schritte 14, 15, 18). Laedt nach
// mondfest.js. Nach dem Gruppenfoto im Saal:
//   - Der Holzscheit neben dem Weg wird aktiv (Messerring): Joshi hockt auf dem Mondboden und schnitzt einen kleinen Planeten
//     (Vorbild: der Planet des kleinen Prinzen) mit sich und Fuchsi obendrauf -> Skizze ins Notizbuch, das Modell ins Huettenregal.
//   - Neben dem X-Wing steht eine Rakete ("Rocket" von stevespencer): Y = einsteigen. Den X-Wing kann Joshi nicht mehr nehmen
//     (mit ihm fliegen die Aliens heim). Mit dem rechten Stick (Tastatur W) gibt Joshi Schub, bis der Balken voll ist – dann hebt
//     sie ab und fliegt von allein: die Kamera bleibt auf dem Mondboden und schaut ihr nach, Joshi sieht man im Bullauge.
//     Blende, Globus zu Joshis Insel (globus.js Ort 0) -> die Heimkehr (story.e6Heimkehr, noch offen).
(function(){
'use strict';
const story = window.STORY;
const e5 = () => story.etappe === 5;
const RAKETE = { quer: 13, vor: -6, h: 9 };              // neben dem X-Wing (quer zum Weg, m), Hoehe
const rk = { gebaut: false, obj: null, inter: null, drin: false, schub: 0, phase: null, t: 0, kam: null, y0: 0, flamme: null, balken: null };
story.heimflug = rk;
const T = {
  hSchub: ['Gib mit dem rechten Stick Schub, bis der Balken voll ist.'],   // nur ueber die Hinweis-Taste (Live-Wunsch 29.10.2026)
  los: ['Auf geht es nach Hause.'],
  xwing: ['Die Aliens haben mit dir getauscht. Du darfst gerne ihre schicke Rakete nehmen.'],
  hRaus: ['Schau dich draußen um. Drück X.'],
  planet: ['Toll! Ein kleiner Planet – mit dir und Fuchsi obendrauf.'],
};

// ---- Der kleine Planet aus Holz (Schnitzmodell; im Notizbuch als Skizze, in der Huette im Regal) ----------------------------
const PLATEAU = 0.8;   // Hoehe der Standflaeche oben auf dem Holzplaneten
function holz(farbe){ return new THREE.MeshLambertMaterial({ color: farbe, flatShading: true }); }
function planetBauen(){
  const g = new THREE.Group(), hell = holz(0xd2a06a), dunkel = holz(0x9a6a3c), mittel = holz(0xb98450);
  const ig = new THREE.IcosahedronGeometry(0.42, 1).toNonIndexed(), farben = [], tone = [[0.82, 0.63, 0.42], [0.72, 0.52, 0.32], [0.62, 0.43, 0.25], [0.88, 0.7, 0.48]];
  let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < ig.attributes.position.count; i += 3){ const c = tone[Math.floor(rnd() * tone.length)]; for(let k = 0; k < 3; k++) farben.push(...c); }
  ig.setAttribute('color', new THREE.Float32BufferAttribute(farben, 3));
  const kugel = new THREE.Mesh(ig, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })); kugel.position.y = 0.42; g.add(kugel);
  // Krater und ein kleiner Vulkan, eine Rose unter einer Glocke wie beim kleinen Prinzen (alles Holz)
  for(const [a, b, r] of [[0.6, 1.2, 0.07], [2.2, 0.8, 0.05], [4.0, 1.5, 0.06]]){ const k = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, 0.03, 8), dunkel);
    k.position.set(Math.sin(b) * Math.cos(a) * 0.42, 0.42 + Math.cos(b) * 0.42, Math.sin(b) * Math.sin(a) * 0.42); k.lookAt(0, 0.42, 0); k.rotateX(Math.PI / 2); g.add(k); }
  // oben eine kleine ebene Flaeche (Live-Wunsch 29.10.2026: die Figuren schwebten ueber der Kugel), Oberkante PLATEAU
  const plateau = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.23, 0.1, 9), hell); plateau.position.y = PLATEAU - 0.05; g.add(plateau);
  // oben: Joshi (Koerper, Kopf mit Locken) und daneben Fuchsi (Koerper, Kopf mit spitzer Schnauze, Ohren, buschiger Schwanz)
  const joshi = new THREE.Group(); joshi.position.set(-0.1, 0.8, 0); joshi.scale.setScalar(1.6); g.add(joshi);
  const bein = (x) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.1, 6), mittel); b.position.set(x, 0.05, 0); joshi.add(b); }; bein(-0.025); bein(0.025);
  const rumpf = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.12, 8), hell); rumpf.position.y = 0.16; joshi.add(rumpf);
  for(const x of [-0.06, 0.06]){ const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.1, 5), hell); arm.position.set(x, 0.16, 0); arm.rotation.z = x > 0 ? -0.3 : 0.3; joshi.add(arm); }
  const kopf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 1), hell); kopf.position.y = 0.26; joshi.add(kopf);
  for(let i = 0; i < 9; i++){ const a = i / 9 * Math.PI * 2, l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.018, 0), dunkel); l.position.set(Math.cos(a) * 0.035, 0.29 + (i % 3) * 0.008, Math.sin(a) * 0.035); joshi.add(l); }
  const fuchs = new THREE.Group(); fuchs.position.set(0.13, 0.81, 0.04); fuchs.rotation.y = -0.5; fuchs.scale.setScalar(1.6); g.add(fuchs);
  const fk = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mittel); fk.scale.set(1.5, 0.9, 0.9); fk.position.y = 0.05; fuchs.add(fk);
  const fh = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), mittel); fh.position.set(0.07, 0.09, 0); fuchs.add(fh);
  const sn = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.04, 6), mittel); sn.rotation.z = -Math.PI / 2; sn.position.set(0.105, 0.085, 0); fuchs.add(sn);
  for(const z of [-0.012, 0.012]){ const o = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.03, 4), dunkel); o.position.set(0.07, 0.125, z); fuchs.add(o); }
  const sw = new THREE.Mesh(new THREE.SphereGeometry(0.025, 7, 5), dunkel); sw.scale.set(2.2, 0.8, 0.8); sw.position.set(-0.08, 0.07, 0); sw.rotation.z = 0.5; fuchs.add(sw);
  // Live-Wunsch 29.10.2026: "wirklich" kleine Modelle von Joshi und Fuchsi – Kopien der echten Figuren in Holz (die einfachen Formen
  // oben bleiben nur, solange die Figuren noch nicht geladen sind)
  const echt = figurenInHolz(); if(echt){ g.remove(joshi); g.remove(fuchs); g.add(echt.joshi, echt.fuchs); }
  return g;
}
// eine Figur als Holzkopie: eigene Pose (Clip), Holzfarbe, auf hoehe m gebracht, Fuesse auf y = 0
const _hv = new THREE.Vector3();
function holzKopie(obj, acts, clipName, hoehe, farbe){
  const k = story.klonSkin(obj); k.position.set(0, 0, 0); k.rotation.set(0, 0, 0);
  const a = acts && acts[clipName]; if(a){ const mx = new THREE.AnimationMixer(k); mx.clipAction(a.getClip()).play(); mx.update(0.3); }
  k.traverse(m => { if(m.isMesh){ m.material = new THREE.MeshLambertMaterial({ color: farbe, skinning: !!m.isSkinnedMesh }); m.frustumCulled = false; m.castShadow = false; } });
  k.updateMatrixWorld(true); const bb = new THREE.Box3();
  k.traverse(m => { if(!m.isSkinnedMesh) return; const n = m.geometry.attributes.position.count; for(let i = 0; i < n; i += 5){ m.boneTransform(i, _hv); _hv.applyMatrix4(m.matrixWorld); bb.expandByPoint(_hv); } });
  if(bb.isEmpty()) bb.setFromObject(k);
  const s = hoehe / Math.max(0.01, bb.max.y - bb.min.y), c = bb.getCenter(new THREE.Vector3()), h = new THREE.Group();
  k.scale.multiplyScalar(s); k.position.set(-c.x * s, -bb.min.y * s, -c.z * s); h.add(k); return h;
}
function figurenInHolz(){
  const F = story.figur && story.figur.obj, X = story.fuchs && story.fuchs.obj; if(!F || !X || !story.klonSkin) return null;
  try {
    const joshi = holzKopie(F, story.figur.acts, 'idle', 0.42, 0xd2a06a); joshi.position.set(-0.06, PLATEAU, 0); joshi.rotation.y = 0.15;   // zum Betrachter (+z), leicht zu Fuchsi
    const fuchs = holzKopie(X, story.fuchs.acts, 'Fox_Idle', 0.2, 0xb07a46); fuchs.position.set(0.08, PLATEAU, 0.03); fuchs.rotation.y = Math.PI - 0.35;   // die Fuchs-Kopie schaut andersherum (Live-Befund: er schaute nach hinten)
    return { joshi, fuchs };
  } catch(e){ console.warn('Planet: Figuren in Holz', e); return null; }
}
story.e5PlanetModell = function(){ const p = planetBauen(); p.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(p), L = Math.max(...bb.getSize(new THREE.Vector3()).toArray());
  const c = bb.getCenter(new THREE.Vector3()); p.position.set(-c.x, -c.y, -c.z); const g = new THREE.Group(); g.add(p); return Promise.resolve({ g, L }); };   // mittig: die Skizze schaut auf die Mitte
// Schnitzen am Holzscheit (notizbuch.js 'mond_schnitzen'): erst nach dem Fest; Ring, Arbeitsplatz und Blick setzt diese Datei
story.e5Scheit = () => story.e5Zustand && story.e5Zustand.scheit;
story.e5ScheitWeg = () => { if(story.e5Zustand) story.e5Zustand.scheit = null; };
function schnitzRingSetzen(){
  const Z = story.e5Zustand, s = Z && Z.scheit; if(!s || !s.obj || rk.ring || !story.stelleSetzen) return; rk.ring = true;
  const p = s.obj.position, x = p.x + 1.1, z = p.z + 0.6;
  story.stelleSetzen('mond_schnitzen', x, z, null, { arbeitsplatz: { x: p.x + 1.0, z: p.z + 0.4 }, feuer: { x: p.x, z: p.z } });
}

// ---- Die Rakete ------------------------------------------------------------------------------------------------------------
function raketeBauen(){
  const Z = story.e5Zustand; if(rk.gebaut || !Z || !Z.ziel || !Z.tuer || !window.RAKETE_GLB || !story.ladeGlb) return; rk.gebaut = true;
  const T0 = Z.tuer.position, dx = Z.ziel.x - T0.x, dz = Z.ziel.z - T0.z, l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l;
  const x = Z.ziel.x - uz * RAKETE.quer + ux * RAKETE.vor, z = Z.ziel.z + ux * RAKETE.quer + uz * RAKETE.vor;
  const y = story.bodenGenau ? (story.bodenGenau(x, z) !== null ? story.bodenGenau(x, z) : Z.ziel.y) : Z.ziel.y;
  story.ladeGlb(window.RAKETE_GLB, 'Rakete', (gl) => {
    // ohne Nebel: beim Steigen verschwand sie sonst schon bald wie hinter einer Maske (Live-Befund 29.10.2026)
    const o = gl.scene; o.traverse(m => { if(m.isMesh){ m.frustumCulled = false; m.castShadow = true; for(const q of [].concat(m.material)) if(q) q.fog = false; } }); o.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), k = RAKETE.h / Math.max(0.01, sz.y), c = bb.getCenter(new THREE.Vector3());
    o.scale.multiplyScalar(k); o.position.set(-c.x * k, -bb.min.y * k, -c.z * k);
    const g = new THREE.Group(); g.add(o); g.position.set(x, y, z); g.rotation.y = Math.atan2(-ux, -uz); story.welt(5).add(g);
    rk.obj = g; rk.y0 = y; rk.r = Math.max(sz.x, sz.z) * k / 2;
    // Flamme unter der Rakete (beim Schub groesser, beim Start lang) und Joshi im Bullauge
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffa630, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    fl.rotation.x = Math.PI; fl.position.y = -1.2; fl.visible = false; fl.userData.deko = true; g.add(fl); rk.flamme = fl;
    // (Joshi im Bullauge entfaellt, Live-Wunsch 29.10.2026)
    // fest wie jedes Ding – auf dem Mond ueber objekte.js story.dingSperrt (Live-Befund 29.10.2026: man lief durch sie hindurch)
    if(story.ding){ const d = story.ding(g, { welt: 5, typ: 'rakete' }); if(d) d.ort = 'moon'; }
    const vx = Z.ziel.x - x, vz = Z.ziel.z - z, vl = Math.hypot(vx, vz) || 1, yx = x + vx / vl * (rk.r + 0.5), yz = z + vz / vl * (rk.r + 0.5);
    rk.inter = story.interaktion(g, { name: 'Rakete', welt: 5, x, z, r: rk.r + 0.6, yx, yz, yHoehe: y - ISLAND_Y + 2.4, aktion: einsteigen });   // Live-Befund 29.10.2026: Y war auf der Spitze   // global-ok: Engine
  });
}
function einsteigen(o){
  if(rk.drin || !eva) return; rk.drin = true; o.erledigt = true; if(o.zeichen) o.zeichen.visible = false;
  rk.phase = 'schub'; rk.schub = 0; rk.t = 0;
  eva.group.visible = false; if(story.fuchs && story.fuchs.obj) story.fuchs.obj.visible = false;
  rk.halte = eva.group.position.clone();
  // Kamera: vom Mondboden schraeg vor der Rakete, sie bleibt dort stehen
  const p = rk.obj.position, a = rk.obj.rotation.y + 0.7;
  rk.kam = new THREE.Vector3(p.x + Math.sin(a) * 11, p.y + 4.5, p.z + Math.cos(a) * 11); rk.kamWeit = new THREE.Vector3(p.x + Math.sin(a) * 24, p.y + 2.2, p.z + Math.cos(a) * 24);
  if(story.fuchs){ story.fuchs.aktiv = false; if(story.fuchs.obj) story.fuchs.obj.visible = false; }   // Joshi und Fuchsi sitzen drin
  story.sprich(T.los);                                                // der Schub-Hinweis nur ueber die Hinweis-Taste
}
// Schub: rechter Stick nach vorn (oben) oder W
function schubEingabe(){
  let v = 0; if(typeof keys !== 'undefined' && (keys['KeyW'] || keys['ArrowUp'])) v = 1;                          // global-ok: Engine
  for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])){ if(!gp) continue; const ay = gp.axes[3] || 0; if(ay < -0.3) v = Math.max(v, Math.min(1, -ay)); }
  return v;
}
const START_DAUER = 10, BLICK_BIS = 12;   // s vom Abheben bis zur Blende; so weit (m) folgt ihr der Blick
function raketeTakt(dt){
  if(!rk.drin || !rk.obj) return;
  rk.t += dt;
  // Joshi und Fuchsi sind in der Rakete – nicht mehr draussen zu sehen (jedes Bild: andere Teile blenden sie sonst wieder ein)
  if(eva && rk.halte){ eva.group.position.copy(rk.halte); eva.group.visible = false; if(typeof ovalShadow !== 'undefined' && ovalShadow) ovalShadow.visible = false; }   // global-ok: Engine
  if(story.fuchs && story.fuchs.obj){ story.fuchs.obj.visible = false; story.fuchs.aktiv = false; if(story.fuchs.schatten) story.fuchs.schatten.visible = false; }
  if(rk.phase === 'schub'){
    const v = schubEingabe(); rk.schub = Math.max(0, Math.min(1, rk.schub + (v > 0 ? v * dt * 0.45 : -dt * 0.15)));
    rk.flamme.visible = rk.schub > 0.05; rk.flamme.scale.set(0.4 + rk.schub * 0.6, 0.3 + rk.schub * 0.7, 0.4 + rk.schub * 0.6);
    rk.obj.position.x += (Math.random() - 0.5) * rk.schub * 0.02;                                       // sie zittert
    if(rk.schub >= 1){ rk.phase = 'start'; rk.t = 0; }
    if(rk.t > 1.5) rk.kam.lerp(rk.kamWeit, Math.min(1, dt * 0.25 * rk.schub));                         // mit dem Schub langsam zurueck
    return;
  }
  if(rk.phase === 'start'){
    rk.kam.lerp(rk.kamWeit, Math.min(1, dt * 1.5));
    const h = 0.5 * 2.6 * rk.t * rk.t; rk.obj.position.y = rk.y0 + h;   // nach START_DAUER s gut 160 m hoch
    rk.flamme.visible = true; rk.flamme.scale.set(1.1, 1.6 + Math.sin(rk.t * 30) * 0.15, 1.1);
    // nach Hause: der Spielstand merkt sich die Heimkehr (heimkehr.js), dann Globus zu Joshis Insel und neu laden (Etappe 1 im Heimkehr-Modus)
    if(rk.t > START_DAUER && !rk.weg){ rk.weg = true; story.heimkehrUnterwegs = true; if(story.spielstandMerken) story.spielstandMerken(1); if(story.standSetzen) story.standSetzen('heimkehr', true); if(story.globusReise) story.globusReise(0); }
  }
}
// Kamera: in der Rakete vom Mondboden aus auf sie (beim Start schwenkt sie mit nach oben)
function raketeKamera(){
  if(!rk.drin || !rk.kam || !rk.obj) return false;
  camera.position.copy(rk.kam); camera.up.set(0, 1, 0);                                                          // global-ok: Engine
  // der Blick folgt ihr nur bis BLICK_BIS m ueber dem Start (Live-Befund 29.10.2026: folgte er ganz, stand sie im Bild still) – danach
  // steigt sie oben aus dem Bild in den Sternenhimmel
  const by = Math.min(rk.obj.position.y, rk.y0 + BLICK_BIS);
  camera.lookAt(rk.obj.position.x, by + RAKETE.h * 0.55, rk.obj.position.z);                                     // global-ok: Engine
  return true;
}
story.e5Rakete = () => rk.drin;
story.figurVersteckt = () => !!(rk.drin && e5());          // story.js figurWache
// Schubanzeige links (segeln.js, wie bei allen Fahrzeugen): solange Joshi in der Rakete Schub gibt
story.raketeSchub = () => (e5() && rk.drin && rk.phase === 'schub') ? rk.schub : null;
// Am X-Wing nach dem Fest (Live-Wunsch 29.10.2026): die Aliens fliegen damit heim – Joshi nimmt ihre Rakete
function xwingSatz(){
  if(rk.xwing || typeof planeGroup === 'undefined' || !planeGroup || !story.interaktion) return; const p = planeGroup.position;   // global-ok: Engine
  rk.xwing = story.interaktion(planeGroup, { name: 'X-Wing', welt: 5, x: p.x, z: p.z + 3, r: 3.2, yx: p.x, yz: p.z, yHoehe: p.y - ISLAND_Y + 5.5, text: T.xwing });   // global-ok: Engine
  if(rk.xwing) rk.xwing.entdeckt = true;
}

// ---- Takt und Einhaengen ---------------------------------------------------------------------------------------------------
// Testzugang ?etappe=5&abflug (story.js): nach der Landung aussteigen; das Fest ist gefeiert (Foto, Aliens, Musik), die Basis erledigt
function abflugTest(){
  if(rk.testFertig || !(story.spielstand && story.spielstand.mondEnde)) return;
  const Z = story.e5Zustand; if(!Z || (Z.phase !== 'gelandet' && Z.phase !== 'zuFuss')) return;
  if(!eva){ if(typeof evaExit === 'function') evaExit(); return; }                          // global-ok: Engine
  const F = story.mondfest, B = story.mondbasis; if(!F || !B) return; rk.testFertig = true;
  B.stufe = 'fest'; B.warDrin = true; Object.assign(F, { foto: true, alienGeredet: true, gespielt: true, endeGesagt: true, alienSkizze: true });
  if(story.ausruestung) story.ausruestung.bananen = false;
}
function takt(dt){
  if(!e5()) return;
  abflugTest();
  const fest = story.e5FestFertig && story.e5FestFertig(), drin = story.mondbasis && story.mondbasis.drin;
  if(fest && !drin){ raketeBauen(); schnitzRingSetzen(); if(eva) xwingSatz(); }
  raketeTakt(dt);
}
// Hinweis-Taste draussen nach dem Fest
const hinweisVorher = story.e5Hinweis;
story.e5Hinweis = function(){
  if(e5() && rk.drin && rk.phase === 'schub') return T.hSchub;
  if(e5() && story.e5FestFertig && story.e5FestFertig() && !(story.mondbasis && story.mondbasis.drin) && rk.inter && !rk.inter.entdeckt && !rk.inter.frei) return T.hRaus;
  return hinweisVorher ? hinweisVorher() : null;
};
story.e5StelleFrei5 = (id) => id === 'mond_schnitzen' && !!(story.e5FestFertig && story.e5FestFertig());
function hook(){
  const camOrig = updateCamera;                                                                                    // global-ok: Engine
  updateCamera = function(){ if(e5() && raketeKamera()) return; return camOrig.apply(this, arguments); };
  const loopOrig = loop; let tv = 0;                                                                               // global-ok: Engine
  loop = function(){ const t = performance.now(), dt = tv ? Math.min(0.1, (t - tv) / 1000) : 0; tv = t; if(!(story.pause && story.pause())) takt(dt); return loopOrig.apply(this, arguments); };
}
const startVorher = window.STORY_START;
window.STORY_START = function(){ hook(); if(startVorher) return startVorher.apply(this, arguments); };
})();
