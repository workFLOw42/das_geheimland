// Das Geheimland – Joshis Ausruestung in der Huette (Live-Wunsch 16.10.2026). Laedt nach huette_innen.js.
// Im Regal steht das Notizbuch, auf dem Tisch liegen Lupe, Kompass, Taschenmesser, Stift und Kamera (alles Typen im
// Objekt-Katalog, objekte.js – jeder mit seiner Grenze und auf der Tischplatte, nie daneben auf dem Boden).
// Y am Regal: die Erzaehlerin sagt den Satz, das Buch kommt aus dem Regal, wird gross, dreht sich einmal um sich selbst
// und wandert klein nach unten rechts in den Rucksack. Y am Tisch: dasselbe nacheinander fuer jedes Ding auf dem Tisch.
// Gezeigt wird das in einer eigenen Bildebene ueber dem Spiel (eigene Kamera, eigenes Licht) – so liegt nichts im Weg.
// Das Taschenmesser klappt dabei auf und zu, der Kompass dreht seine Nadel (die Nadel auch auf dem Tisch).
// Modelle (Sketchfab, CC-BY-4.0, fuers Spiel verkleinert): Book – RealityScan (teddygbg), Pencil (farooq.smurf),
// Compass (EwanLejkowski), Pocket Knife (Riccardo Daniello), Magnifying Glass (Laura.Clarke), Canon AT-1 Retro Camera
// (AleixoAlonso), Backpack low-poly (dimaponomar2019).
(function(){
'use strict';
const story = window.STORY;
const klemme = (v, a, b) => Math.max(a, Math.min(b, v));
const weich = (k) => { k = klemme(k, 0, 1); return k * k * (3 - 2 * k); };

// ---- Katalog: Groesse (laengste Kante, m), Drehung des Modells, Animationen ------------------------------------
// dreh: Drehung des Modells in der Vorlage (x, y, z), damit es richtig liegt; zeigen: Haltung beim Einblenden
// (Neigung um x – flache Dinge kippen ihre Oberseite zum Betrachter); tisch / zeigenAnim: Clips auf dem Tisch / beim Zeigen
const SACHEN = {
  notizbuch: { glb: 'NOTIZBUCH_GLB', L: 0.24, beidseitig: true, zeigen: 0 },
  stift:     { glb: 'STIFT_GLB', L: 0.17, dreh: [0, 0, -Math.PI / 4], zeigen: 1.0 },
  kompass:   { glb: 'KOMPASS_GLB', L: 0.09, zeigen: 1.0, tisch: ['needleAction'], zeigenAnim: ['needleAction', 'rotating cylinderAction'] },
  messer:    { glb: 'MESSER_GLB', L: 0.11, dreh: [-Math.PI / 2, 0, 0], zeigen: 1.1, zeigenAnim: ['Blade Flip'], klappt: 'Blade Flip' },
  lupe:      { glb: 'LUPE_GLB', L: 0.21, zeigen: 1.0 },
  kamera:    { glb: 'KAMERA_GLB', L: 0.14, zeigen: 0.15, deckend: true },   // Modell steht auf alphaMode BLEND + doppelseitig: wirkte durchsichtig
  rucksack:  { glb: 'RUCKSACK_GLB', L: 0.45, dreh: [0, -Math.PI / 2, 0], zeigen: 0 },
  // notizbuch.js: der geschnitzte Holzfuchs (Wooden Fox Kit Figure, Yogensia, CC-BY-NC-SA-4.0) und der Schmetterling
  // (Ulysses Butterfly, eb78, CC-BY-SA-4.0) – keine Ausruestung, aber dieselben Vorlagen
  holzfuchs: { glb: 'HOLZFUCHS_GLB', L: 0.16, zeigen: 0.2, keinRucksack: true },
  schmetterling: { glb: 'SCHMETTERLING_GLB', L: 0.09, zeigen: 0, keinRucksack: true },
};
const TEXT = {
  notizbuch: ['Ah... ein Notizbuch. Das kann man immer gebrauchen.'],
  lupe:      ['Eine Lupe! Damit siehst du auch die kleinsten Spuren.'],
  kompass:   ['Ein Kompass. Mit ihm findest du immer den Weg.'],
  messer:    ['Dein Taschenmesser. Das ist praktisch für unterwegs.'],
  stift:     ['Und ein Stift. Damit kannst du alles aufschreiben.'],
  kamera:    ['Und deine Kamera! Damit machst du Fotos von allen Hinweisen.'],
};
const TEXT_KOMPLETT = ['Klasse. Du hast alles dabei, was man als Detektiv braucht.'];
// Lage auf dem Tisch (Tisch-Koordinaten, Platte 1,4 x 0,9 m; die Laterne steht bei x 0,35). Liegt dort schon etwas,
// rueckt story.setze es auf der Platte zur Seite. Reihenfolge = Reihenfolge beim Einblenden.
const TISCH = [
  { n: 'lupe',    x: -0.05, z: 0.22, dreh: -0.6 },
  { n: 'kompass', x: -0.15, z: -0.18, dreh: 0 },
  { n: 'messer',  x: -0.45, z: 0.15, dreh: 0.4 },
  { n: 'stift',   x: 0.12,  z: -0.25, dreh: 1.2 },
  { n: 'kamera',  x: -0.5,  z: -0.2, dreh: 0.35 },
];
const vorlagen = {};
function vorlage(n){
  if(vorlagen[n]) return vorlagen[n];
  const S = SACHEN[n];
  return vorlagen[n] = new Promise((fertig) => story.ladeGlb(window[S.glb], n, (gl) => {
    const m = gl.scene;
    if(S.dreh) m.rotation.set(S.dreh[0], S.dreh[1], S.dreh[2]);
    m.traverse(o => { if(o.isMesh){ o.castShadow = true; o.frustumCulled = false;
      for(const mt of (Array.isArray(o.material) ? o.material : [o.material])){ if(!mt) continue; mt.metalness = Math.min(mt.metalness || 0, 0.3); if(S.beidseitig) mt.side = THREE.DoubleSide;
      if(S.deckend){ mt.transparent = false; mt.opacity = 1; mt.alphaTest = 0.5; mt.depthWrite = true; mt.side = THREE.FrontSide; mt.needsUpdate = true; } } } });
    m.updateMatrixWorld(true);
    let bb = new THREE.Box3().setFromObject(m), sz = bb.getSize(new THREE.Vector3());
    m.scale.multiplyScalar(S.L / Math.max(sz.x, sz.y, sz.z));
    m.updateMatrixWorld(true); bb = new THREE.Box3().setFromObject(m);
    const c = bb.getCenter(new THREE.Vector3());
    m.position.set(m.position.x - c.x, m.position.y - bb.min.y, m.position.z - c.z);  // Mitte unten auf 0
    const g = new THREE.Group(); g.add(m); g.userData.clips = gl.animations || [];
    fertig(g);
  }));
}
story.kompassVorlage = () => vorlage('kompass');   // segeln.js: der Kompass rechts oben
// Kopie mit eigenem Skelett (wie SkeletonUtils.clone): object.clone() laesst SkinnedMeshes an den Knochen der Vorlage
// haengen – die Kopien (Schwarm, Lupe, Huette) lagen dann alle unsichtbar am Ursprung der Vorlage und bewegten sich nicht
function klonSkin(v){
  const g = v.clone(true), quelle = new Map(), ziel = new Map();
  const paare = (a, b) => { quelle.set(b, a); for(let i = 0; i < a.children.length; i++) paare(a.children[i], b.children[i]); };
  paare(v, g);
  g.traverse(o => { ziel.set(quelle.get(o), o); });
  g.traverse(o => { if(!o.isSkinnedMesh) return; const q = quelle.get(o), sk = q.skeleton;
    o.skeleton = sk.clone(); o.skeleton.bones = sk.bones.map(k => ziel.get(k)); o.bindMatrix.copy(q.bindMatrix);
    o.bind(o.skeleton, o.bindMatrix); });
  return g;
}
story.klonSkin = (o) => { let skin = false; o.traverse(m => { if(m.isSkinnedMesh) skin = true; }); return skin ? klonSkin(o) : o.clone(true); };
function klon(n){ return vorlage(n).then(v => { let skin = false; v.traverse(o => { if(o.isSkinnedMesh) skin = true; });
  const g = skin ? klonSkin(v) : v.clone(true); g.userData.clips = v.userData.clips; g.userData.sache = n; return g; }); }
for(const n of Object.keys(SACHEN)) story.typ(n, { bau: () => klon(n), untergrund: 'egal' });

// ---- Animationen der Dinge (Nadel, Klinge) ----------------------------------------------------------------------
const mixer = [];
function spiele(obj, namen, tempo){
  const clips = (obj.userData.clips || []).filter(c => namen.includes(c.name));
  if(!clips.length) return null;
  const mx = new THREE.AnimationMixer(obj);
  for(const c of clips) mx.clipAction(c).play();
  mx.timeScale = tempo || 1; mixer.push(mx); return mx;
}
// Messer auf- und zuklappen (Live-Wunsch 16.10.): der Clip "Blade Flip" laeuft zu -> auf -> zu; hier nur die erste
// Haelfte (KLAPP_AUF = Anteil, bei dem die Klinge ganz offen ist), gesteuert ueber einen Sollwert: k folgt soll (0 = zu,
// 1 = offen) mit KLAPP_T s und setzt die Clipzeit. EINE Steuerung fuer Einsammeln, Werkzeug (Schnitzen) und Inventar.
const KLAPP_AUF = 0.45, KLAPP_T = 0.7;
const klappen = [];
function klappe(obj, clipName){
  const c = (obj.userData.clips || []).find(q => q.name === clipName); if(!c) return null;
  const mx = new THREE.AnimationMixer(obj); mx.clipAction(c).play(); mx.setTime(0);
  const k = { mx, dauer: c.duration, soll: 0, k: 0 }; klappen.push(k); return k;
}
function klappeLos(k){ if(!k) return; k.mx.stopAllAction(); const i = klappen.indexOf(k); if(i >= 0) klappen.splice(i, 1); }
function updateKlappen(dt){ for(const k of klappen){ k.k += klemme(k.soll - k.k, -dt / KLAPP_T, dt / KLAPP_T); k.mx.setTime(weich(k.k) * KLAPP_AUF * k.dauer); } }
// Animation beim Zeigen: das Messer klappt (gesteuert), alles andere laeuft frei
function zeigeAnim(n, o){ const A = SACHEN[n].zeigenAnim; if(!A) return null;
  if(SACHEN[n].klappt) return { klapp: klappe(o, SACHEN[n].klappt) };
  return { mx: spiele(o, A, 1) }; }
// Erst zuklappen, dann einpacken (Live-Wunsch 16.10.): true, solange das Messer noch nicht ganz zu ist (soll = 0 gesetzt)
function nochOffen(a){ if(!a || !a.klapp) return false; a.klapp.soll = 0; return a.klapp.k > 0.01; }
function zeigeAnimLos(a){ if(!a) return; if(a.klapp) klappeLos(a.klapp); if(a.mx) stoppe(a.mx); }
function stoppe(mx){ if(!mx) return; mx.stopAllAction(); const i = mixer.indexOf(mx); if(i >= 0) mixer.splice(i, 1); }

// ---- Einbauen, sobald der Raum steht (huette_innen.js ruft story.raumGebaut) --------------------------------------
const zustand = story.ausruestung = { notizbuch: false, lupe: false, kompass: false, messer: false, stift: false, kamera: false, buch: null, tisch: [] };
const _v = new THREE.Vector3();
story.raumGebaut = function(innen){
  // Notizbuch im mittleren Fach (dort ist eine Luecke zwischen den Buechern), Ruecken zum Raum
  const brett = innen.regalBretter[1];
  brett.localToWorld(_v.set(0.61, 0, 0.02));
  zustand.buch = story.setze('notizbuch', 1, { x: _v.x, z: _v.z, auf: brett, in: innen.regal, dreh: -Math.PI / 2, fest: true });
  zustand.buch.bereit.then(() => { innen.interRegal.mats = null; });
  // Tisch: alles auf die Platte (auf), in die Tisch-Gruppe (in) – faellt etwas aufeinander, rueckt es auf der Platte weiter
  const reihe = [];
  for(const t of TISCH){
    innen.tisch.localToWorld(_v.set(t.x, 0, t.z));
    reihe.push(t);
  }
  // nacheinander setzen (jedes weicht den schon liegenden aus)
  let kette = Promise.resolve();
  for(const t of reihe){
    kette = kette.then(() => {
      innen.tisch.localToWorld(_v.set(t.x, 0, t.z));
      const d = story.setze(t.n, 1, { x: _v.x, z: _v.z, auf: innen.tischPlatte, in: innen.tischGruppe, dreh: t.dreh });
      zustand.tisch.push(d);
      return d.bereit.then(() => { const S = SACHEN[t.n]; if(S.tisch) d.mixer = spiele(d.obj, S.tisch, 0.6); });
    });
  }
  kette.then(() => { innen.interTisch.mats = null; });
  innen.interRegal.aktion = (o) => { o.erledigt = true; if(o.zeichen) o.zeichen.visible = false; zeige([zustand.buch]); };
  innen.interTisch.aktion = (o) => { o.erledigt = true; if(o.zeichen) o.zeichen.visible = false; zeige(zustand.tisch.slice()); };
};

// ---- Bildebene ueber dem Spiel ----------------------------------------------------------------------------------
const EBENE = { fov: 30, D: 5 };
let szene = null, kam = null, rucksack = null;
function ebene(){
  if(szene) return;
  szene = new THREE.Scene();
  kam = new THREE.PerspectiveCamera(EBENE.fov, innerWidth / innerHeight, 0.1, 50); kam.position.set(0, 0, EBENE.D); kam.lookAt(0, 0, 0);
  szene.add(new THREE.HemisphereLight(0xfff4e0, 0x404858, 1.05));
  const l = new THREE.DirectionalLight(0xffffff, 0.9); l.position.set(1.5, 2.5, 4); szene.add(l);
  rucksack = { pivot: new THREE.Group(), an: 0, ziel: 0, hops: 0, obj: null };
  rucksack.pivot.visible = false; szene.add(rucksack.pivot);
  klon('rucksack').then(o => { const bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3());
    o.position.sub(c); rucksack.pivot.add(o); rucksack.obj = o; });
}
// Bildschirm (NDC -1..1) -> Ebene (z = 0)
const hoeheEbene = () => 2 * EBENE.D * Math.tan(EBENE.fov / 2 * Math.PI / 180);
function ndcZuEbene(nx, ny, out){ const H = hoeheEbene(); return out.set(nx * H * innerWidth / innerHeight / 2, ny * H / 2, 0); }
const RUCKSACK_NDC = { x: 0.8, y: -0.66 }, RUCKSACK_GROSS = 0.62;
const GROSS = 1.25;               // so gross (Ebene, Bildhoehe 2,68) wird ein Ding beim Zeigen

// ---- Ein Ding zeigen: auftauchen (in der Welt) -> gross -> drehen -> klein in den Rucksack -------------------------
const T_AUF = 0.55, T_GROSS = 0.7, T_DREH = 1.5, T_WEG = 0.8, T_REIN = 0.22;
const flug = { liste: [], akt: null, fertig: null };
story.szeneLaeuft = () => !!flug.akt || !!(typeof raus !== 'undefined' && raus.akt) || !!(story.bildEbeneAktiv && story.bildEbeneAktiv());   // story.js: keine Gitarre, nicht laufen
function zeige(dinge){
  ebene();
  flug.liste.push(...dinge.filter(d => d && d.obj));
  rucksack.ziel = 1;
  if(!flug.akt) naechstes();
}
// Rucksack ausblenden, sobald nichts mehr hinein- oder herausfliegt – EINE Stelle fuer Einsammeln und alle Werkzeuge
// (Live-Wunsch 16.10.: schnell weg, nach RUCKSACK_WEG s)
const RUCKSACK_WEG = 0.4;
function rucksackWeg(){ story.spaeter(RUCKSACK_WEG, () => { if(!raus.akt && !flug.akt) rucksack.ziel = 0; }); }
function naechstes(){
  const d = flug.liste.shift();
  if(!d){
    flug.akt = null;
    // alles im Rucksack: Lob, dann der Funkspruch fuer den ersten Fall (story.js)
    if(!zustand.komplett && Object.keys(TEXT).every(n => zustand[n])){
      zustand.komplett = true;
      // Funkspruch erst, wenn auch draussen alles abgesucht und angesehen ist (story.fall1Pruefen)
      rucksackWeg();                                               // nicht erst nach dem Lob ausblenden
      story.sprich(TEXT_KOMPLETT, () => { if(story.fall1Pruefen) story.fall1Pruefen(); });
      return;
    }
    rucksackWeg(); return;
  }
  const n = d.obj.userData.sache;
  const f = flug.akt = { d, n, t: 0, phase: 'auf', gesagt: false, fertigAnim: false, fertigText: false };
  // Auftauchen: in der Welt ein Stueck hoch und zum Betrachter (aus dem Regal heraus, von der Platte hoch)
  const o = d.obj; f.start = o.position.clone();
  o.getWorldPosition(_v); const zu = new THREE.Vector3(camera.position.x - _v.x, 0, camera.position.z - _v.z);
  if(zu.lengthSq() > 1e-6) zu.normalize();
  f.weg = o.parent.worldToLocal(_v.clone().addScaledVector(zu, 0.28).add(new THREE.Vector3(0, 0.12, 0))).sub(f.start);
  story.sprich(TEXT[n] || [], () => { f.fertigText = true; pruefeWeiter(); });
}
function pruefeWeiter(){ const f = flug.akt; if(f && f.fertigAnim && f.fertigText) naechstes(); }
// Aus der Welt in die Ebene: gleiche Stelle und gleiche Groesse auf dem Bildschirm, gleiche Lage zur Kamera
function inDieEbene(f){
  const o = f.d.obj;
  o.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3());
  const qWelt = o.getWorldQuaternion(new THREE.Quaternion());
  const tief = Math.max(0.3, -c.clone().applyMatrix4(camera.matrixWorldInverse).z);
  const ndc = c.clone().project(camera);
  if(f.d.mixer){ stoppe(f.d.mixer); f.d.mixer = null; }
  story.entferne(f.d);
  zustand[f.n] = true;
  // Pivot in der Mitte des Dings
  o.position.set(0, 0, 0); o.quaternion.identity(); o.scale.set(1, 1, 1); o.updateMatrixWorld(true);
  const lb = new THREE.Box3().setFromObject(o);
  f.L = Math.max(...lb.getSize(new THREE.Vector3()).toArray());
  o.position.copy(lb.getCenter(new THREE.Vector3())).negate();
  o.traverse(m => { if(m.isMesh) m.castShadow = false; });
  const p = f.pivot = new THREE.Group(); p.add(o); szene.add(p);
  const s0 = Math.tan(EBENE.fov / 2 * Math.PI / 180) * EBENE.D / (Math.tan(camera.fov / 2 * Math.PI / 180) * tief);
  f.von = { pos: ndcZuEbene(ndc.x, ndc.y, new THREE.Vector3()), s: s0,
            q: camera.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qWelt) };
  f.zeigQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(SACHEN[f.n].zeigen || 0, 0, 0));
  f.mitte = new THREE.Vector3(0, 0.12, 0);
  f.sGross = GROSS / f.L;
  f.anim = zeigeAnim(f.n, o); if(f.anim && f.anim.klapp) f.anim.klapp.soll = 1;   // Messer: klappt beim Zeigen auf
  f.phase = 'gross'; f.t = 0;
  void sz;
}
const _q = new THREE.Quaternion(), _qy = new THREE.Quaternion(), _y = new THREE.Vector3(0, 1, 0), _r = new THREE.Vector3();
function updateFlug(dt){
  const f = flug.akt;
  if(!f) return;
  f.t += dt;
  const p = f.pivot;
  if(f.phase === 'auf'){
    const k = weich(f.t / T_AUF);
    if(f.d.obj.parent) f.d.obj.position.copy(f.start).addScaledVector(f.weg, k);
    if(f.t >= T_AUF) inDieEbene(f);
    return;
  }
  ndcZuEbene(RUCKSACK_NDC.x, RUCKSACK_NDC.y, _r);
  if(f.phase === 'gross'){
    const k = weich(f.t / T_GROSS);
    p.position.lerpVectors(f.von.pos, f.mitte, k);
    p.scale.setScalar(f.von.s + (f.sGross - f.von.s) * k);
    p.quaternion.slerpQuaternions(f.von.q, f.zeigQ, k);
    if(f.t >= T_GROSS){ f.phase = 'dreh'; f.t = 0; }
  } else if(f.phase === 'dreh'){
    const k = weich(f.t / T_DREH);
    _qy.setFromAxisAngle(_y, k * Math.PI * 2);
    p.quaternion.copy(_qy).multiply(f.zeigQ);
    p.position.copy(f.mitte); p.position.y += Math.sin(k * Math.PI) * 0.08;
    if(f.t >= T_DREH){ f.phase = 'weg'; f.t = 0; if(f.anim && f.anim.klapp) f.anim.klapp.soll = 0; }   // zuklappen, dann in den Rucksack (s. weg)
  } else if(f.phase === 'weg'){
    if(nochOffen(f.anim)) f.t = 0;                                // bleibt gross in der Mitte, bis das Messer zu ist
    const k = weich(f.t / T_WEG);
    const ziel = _q.set(0, 0, 0, 1);
    p.position.lerpVectors(f.mitte, _r.clone().add(new THREE.Vector3(0, 0.32, 0.2)), k);
    p.position.y += Math.sin(k * Math.PI) * 0.25;                // kleiner Bogen
    p.scale.setScalar(f.sGross + (0.16 / f.L - f.sGross) * k);
    p.quaternion.slerpQuaternions(f.zeigQ, ziel, k * 0.6);
    if(f.t >= T_WEG){ f.phase = 'rein'; f.t = 0; }
  } else if(f.phase === 'rein'){
    const k = weich(f.t / T_REIN);
    p.position.lerpVectors(_r.clone().add(new THREE.Vector3(0, 0.32, 0.2)), _r.clone().add(new THREE.Vector3(0, 0.05, 0.2)), k);
    p.scale.setScalar((0.16 / f.L) * (1 - k));
    if(f.t >= T_REIN){
      zeigeAnimLos(f.anim); szene.remove(p);                     // nicht entsorgen: Geometrie gehoert der Vorlage
      rucksack.hops = 1;                                          // der Rucksack huepft, wenn etwas hineinfaellt
      f.phase = 'fertig'; f.fertigAnim = true; pruefeWeiter();
    }
  }
}
function updateRucksack(dt){
  if(!rucksack) return;
  rucksack.an += klemme(rucksack.ziel - rucksack.an, -dt * 5, dt * 3);   // aus schneller als an
  const p = rucksack.pivot;
  p.visible = rucksack.an > 0.001;
  if(!p.visible) return;
  ndcZuEbene(RUCKSACK_NDC.x, RUCKSACK_NDC.y, p.position);
  rucksack.hops = Math.max(0, rucksack.hops - dt * 2.5);
  const hops = Math.sin((1 - rucksack.hops) * Math.PI) * rucksack.hops;
  const s = weich(rucksack.an) * (1 + hops * 0.18);
  if(rucksack.obj){ p.scale.setScalar(s * RUCKSACK_GROSS / SACHEN.rucksack.L); }
  p.rotation.set(0.25, -0.35 + Math.sin(performance.now() / 900) * 0.08, 0);
}

// ---- Etwas AUS dem Rucksack holen (Kamera, Stift – notizbuch.js) ------------------------------------------------------
// Umgekehrt wie das Einpacken: der Rucksack erscheint unten rechts, das Ding steigt klein heraus, wird gross, dreht sich
// einmal und bleibt kurz in der Mitte stehen; fertig() kommt, wenn es gross ist (dann zeigt notizbuch.js das Bild).
// Danach story.rucksackZurueck(n): das Ding wandert wieder klein in den Rucksack, der Rucksack verschwindet.
const raus = { akt: null };
story.ausRucksack = function(n, fertig){
  ebene();
  rucksack.ziel = 1;
  klon(n).then(o => {
    o.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(o), L = Math.max(...bb.getSize(new THREE.Vector3()).toArray());
    // ueber dem Bild (notizbuch.js zeigt es mit renderOrder 4, ohne Tiefentest) – sonst verschwaende der Stift darunter
    // three.js zeichnet erst alles Undurchsichtige, dann das Transparente – das Bild ist transparent, also muss das Ding es
    // auch sein (Deckkraft 1), damit renderOrder gilt (eigene Material-Kopien: die Vorlage bleibt, wie sie ist)
    o.position.sub(bb.getCenter(new THREE.Vector3())); o.traverse(m => { if(m.isMesh){ m.castShadow = false; m.renderOrder = 5;
      m.material = (Array.isArray(m.material) ? m.material : [m.material]).map(x => { const k = x.clone(); k.transparent = true; k.opacity = 1; return k; });
      if(m.material.length === 1) m.material = m.material[0]; } });
    const p = new THREE.Group(); p.add(o); szene.add(p);
    const anim = zeigeAnim(n, o);                                 // Messer: kommt zu heraus, klappt dann auf (s. 'auf'), zu bei B
    raus.akt = { n, p, L, t: 0, phase: 'raus', fertig, anim,
      q: new THREE.Quaternion().setFromEuler(new THREE.Euler(SACHEN[n].zeigen || 0, 0, 0)) };
  });
};
// Der Rucksack ist beim Einstecken immer zu sehen (Live-Befund 16.10.: beim Messer fiel er nicht auf)
story.rucksackZurueck = function(){ if(raus.akt){ rucksack.ziel = 1; if(raus.akt.anim && raus.akt.anim.klapp) raus.akt.anim.klapp.soll = 0; raus.akt.phase = 'rein'; raus.akt.t = 0; raus.akt.von = raus.akt.p.position.clone(); raus.akt.vonS = raus.akt.p.scale.x; } };
// notizbuch.js (Schnitzen, Lupe): ein Klon eines Modells, Mitte auf 0, laengste Kante = 1 (Rueckgabe: { g, L }) – und die
// Bildebene selbst (Szene, Hoehe der sichtbaren Ebene), um ihn dort zu zeigen
// Groesse eines Modells – bei animierten (SkinnedMesh) mit den Knochen gemessen: Box3.setFromObject sieht nur die rohe
// Geometrie, beim Schmetterling 14x zu klein (unter der Lupe riesig, im Schwarm und in der Huette falsch)
function echteBox(o){
  const bb = new THREE.Box3(), v = new THREE.Vector3(); let skin = false;
  o.traverse(m => { if(!m.isSkinnedMesh) return; skin = true; m.skeleton.update(); const p = m.geometry.attributes.position;
    for(let i = 0; i < p.count; i += 3){ v.fromBufferAttribute(p, i); m.boneTransform(i, v); bb.expandByPoint(v.applyMatrix4(m.matrixWorld)); } });
  return skin ? bb : new THREE.Box3().setFromObject(o);
}
story.modellKlon = (n) => klon(n).then(o => { o.updateMatrixWorld(true); const bb = echteBox(o), L = Math.max(...bb.getSize(new THREE.Vector3()).toArray());
  o.position.sub(bb.getCenter(new THREE.Vector3())); o.traverse(m => { if(m.isMesh){ m.castShadow = false; m.frustumCulled = false; } });
  const g = new THREE.Group(); g.add(o); g.userData.clips = o.userData.clips; g.userData.inner = o; return { g, L }; });
story.ebene = () => { ebene(); return { szene, hoehe: hoeheEbene() }; };
story.spiele = (obj, namen, tempo) => spiele(obj, namen, tempo);
story.stoppe = (mx) => stoppe(mx);
// Der Stift zeichnet mit (notizbuch.js): Spitze an die Stelle (u, v = 0..1 auf dem Bild der Breite bw, Hoehe bh, Mitte 0,0)
story.stiftAn = function(u, v, bw, bh){ const r = raus.akt; if(!r) return; r.stift = { u, v, bw, bh }; };
// Schnitzen: das Messer rechts am Holzklotz, es schabt (dx, dy = kleine Bewegung) – Lupe: gross in der Mitte vor dem Bild
story.messerAn = function(dx, dy){ const r = raus.akt; if(!r) return; r.halt = { x: 0.55 + dx * 0.4, y: 0.05 + dy, s: 0.6, kipp: -0.6 + dx }; };
// Werkzeug wartet auf B (fuer alle gleich): klein und ruhig rechts neben dem Bild, nicht davor (r.stift aus, sonst
// zeichnete der Stift weiter)
story.werkzeugRuht = function(){ const r = raus.akt; if(!r) return; r.stift = null; r.halt = { x: 0.95, y: -0.3, s: 0.35, kipp: -0.4 }; };
story.lupeAn = function(){ const r = raus.akt; if(!r) return;
  if(!r.glas){ r.glas = true;
    // Das Glas (das flachste Teil des Modells) durchsichtig, damit man den Schmetterling darunter sieht
    let flach = null, d = Infinity; r.p.traverse(m => { if(!m.isMesh) return; m.geometry.computeBoundingBox(); const s = m.geometry.boundingBox.getSize(new THREE.Vector3()); const t = Math.min(s.x, s.y, s.z) / Math.max(s.x, s.y, s.z); if(t < d){ d = t; flach = m; } });
    if(flach){ flach.material = flach.material.clone(); flach.material.color && flach.material.color.set(0xd8f0ff); flach.material.map = null; flach.material.opacity = 0.22; flach.material.depthWrite = false; flach.renderOrder = 8; }
    r.glasMesh = flach;
    // aufrecht zur Kamera: das Glas liegt im Modell flach (Normale = kuerzeste Achse) -> diese Achse auf die Blickrichtung
    if(flach){ flach.geometry.computeBoundingBox(); const s = flach.geometry.boundingBox.getSize(new THREE.Vector3());
      const kurz = s.x <= s.y && s.x <= s.z ? new THREE.Vector3(1, 0, 0) : (s.y <= s.z ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1));
      kurz.transformDirection(flach.matrixWorld).applyQuaternion(r.p.quaternion.clone().invert());
      r.qAufrecht = new THREE.Quaternion().setFromUnitVectors(kurz.normalize(), new THREE.Vector3(0, 0, 1)); } }
  // Live-Wunsch 16.10.: das GLAS mittig im Bild und groesser – der Stiel darf links abgeschnitten sein. Dafuer wird die
  // ganze Lupe um den Versatz Glasmitte -> Bildmitte geschoben (r.glasVersatz, laufend nachgefuehrt)
  r.halt = { x: 0, y: 0.02, s: 1.7, kipp: 0, vorn: true, q: r.qAufrecht, glasMitte: true }; };
// Mitte und Radius des Lupenglases in der Bildebene (notizbuch.js legt den Schmetterling genau dahinter)
story.lupeGlas = function(){
  const r = raus.akt; if(!r || !r.glasMesh) return null;
  r.glasMesh.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(r.glasMesh), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3());
  return { x: c.x, y: c.y, z: c.z, r: Math.max(s.x, s.y) / 2 };
};
story.rausAktiv = () => !!raus.akt;
function updateRaus(dt){
  const r = raus.akt; if(!r) return;
  r.t += dt;
  ndcZuEbene(RUCKSACK_NDC.x, RUCKSACK_NDC.y, _r);
  const unten = _r.clone().add(new THREE.Vector3(0, 0.32, 0.2)), mitte = new THREE.Vector3(0, 0.12, 0.6), gross = GROSS / r.L, klein = 0.16 / r.L;
  if(r.phase === 'raus'){                                         // aus dem Rucksack hoch, gross werden, einmal drehen
    const k = weich(r.t / 1.1);
    r.p.position.lerpVectors(unten, mitte, k); r.p.position.y += Math.sin(k * Math.PI) * 0.25;
    r.p.scale.setScalar(klein + (gross - klein) * k);
    _qy.setFromAxisAngle(_y, k * Math.PI * 2); r.p.quaternion.copy(_qy).multiply(r.q);
    if(r.t >= 1.1){ rucksack.hops = 1; r.t = 0;
      // Live-Wunsch 16.10.: erst raus, dann gross in der Mitte aufklappen, dann erst schnitzen
      if(r.anim && r.anim.klapp){ r.phase = 'auf'; r.anim.klapp.soll = 1; }
      else { r.phase = 'warte'; const f = r.fertig; r.fertig = null; if(f) f(); } }
  } else if(r.phase === 'auf'){                                    // Messer klappt in der Mitte auf
    r.p.position.copy(mitte); r.p.scale.setScalar(gross); r.p.quaternion.copy(r.q);
    if(r.anim.klapp.k >= 0.99 && r.t > 0.3){ r.phase = 'warte'; r.t = 0; const f = r.fertig; r.fertig = null; if(f) f(); }
  } else if(r.phase === 'warte'){                                  // steht gross in der Mitte, waehrend das Bild kommt
    if(r.halt){
      // Messer am Klotz bzw. Lupe vorn in der Mitte (notizbuch.js setzt die Lage jedes Bild)
      const h = r.halt, ziel = new THREE.Vector3(h.x, h.y, h.vorn ? 1.6 : 0.9);
      if(h.glasMitte && r.glasMesh){                               // Glas (nicht der Griff) auf die Mitte
        r.glasMesh.updateMatrixWorld(true); const c = new THREE.Box3().setFromObject(r.glasMesh).getCenter(new THREE.Vector3());
        r.glasVersatz = (r.glasVersatz || new THREE.Vector3()).lerp(c.sub(r.p.position).setZ(0), 0.3);
        ziel.sub(r.glasVersatz);
      }
      r.p.position.lerp(ziel, 0.3); r.p.scale.setScalar(gross * h.s);
      if(h.q) r.p.quaternion.slerp(h.q, 0.2);                     // Lupe: aufrecht, das Glas zur Kamera
      else { _qy.setFromAxisAngle(_y, h.kipp); r.p.quaternion.copy(_qy).multiply(r.q); }
    } else if(r.stift){
      // Stift zeichnet: die Spitze (Modell: schraeg, Spitze unten links) folgt der Zeichenstelle, mit leichtem Zittern
      const S = r.stift, zx = (S.u - 0.5) * S.bw, zy = (0.5 - S.v) * S.bh;
      const ziel = new THREE.Vector3(zx + 0.32, zy + 0.32, 1.5);
      r.p.position.lerp(ziel, 0.35); r.p.position.x += Math.sin(r.t * 40) * 0.01; r.p.position.y += Math.cos(r.t * 33) * 0.01;
      r.p.scale.setScalar(gross * 0.55); r.p.quaternion.copy(r.q);
    } else {
      r.p.position.copy(mitte); r.p.scale.setScalar(gross * 0.7); r.p.position.x = -GROSS * 1.2;   // ruckt nach links zur Seite
      _qy.setFromAxisAngle(_y, Math.sin(r.t) * 0.3); r.p.quaternion.copy(_qy).multiply(r.q);
    }
  } else if(r.phase === 'rein'){                                   // zurueck in den Rucksack
    if(nochOffen(r.anim)) r.t = 0;                                // erst zuklappen (bleibt so lange, wo es ist)
    const k = weich(r.t / 0.9), von = r.von || new THREE.Vector3(-GROSS * 1.2, 0.12, 0.6), vonS = r.vonS || gross * 0.7;
    r.p.position.lerpVectors(von, unten, k); r.p.position.y += Math.sin(k * Math.PI) * 0.25;
    r.p.scale.setScalar(vonS + (klein - vonS) * k);
    if(r.t >= 0.9){ zeigeAnimLos(r.anim); szene.remove(r.p); raus.akt = null; rucksack.hops = 1; rucksackWeg(); }
  }
}

// ---- Funkgeraet unten rechts, wenn ein Funkspruch kommt (Live-Wunsch 16.10.) -----------------------------------------
// An der Stelle des Rucksacks erscheint das Funkgeraet und wackelt und blinkt genau wie das echte am Lagerfeuer (story.js
// updateRadio) – so erkennt man einen Funkspruch immer sofort. Beide zugleich gibt es nicht: waehrend des Einsteckens
// kommt kein Funkspruch, das Inventar ist eine Pause, und in der Pause ist das Symbol aus.
const funk = { pivot: null, geraet: null, an: 0 };
// Platz unten rechts belegt (Rucksack, Funkgeraet, Einpacken/Auspacken)? Dann weicht die Detektivmuetze (notizbuch.js)
story.eckeBelegt = () => !!(flug.akt || raus.akt || (rucksack && (rucksack.ziel || rucksack.an > 0.01)) || funk.an > 0.01
  || (story.funkAktiv && story.funkAktiv()));
story.rucksackNdc = RUCKSACK_NDC;
function updateFunkSymbol(dt){
  const soll = story.funkAktiv && story.funkAktiv() && !(story.pause && story.pause()) ? 1 : 0;
  if(!funk.pivot){
    if(!soll || !story.baueFunkgeraet) return;
    const g = story.baueFunkgeraet(), r = g.userData.geraet;
    g.remove(r); r.position.set(0, 0, 0); r.userData.lampe = g.userData.lampe;     // nur das Geraet, ohne Kiste
    const bb = new THREE.Box3().setFromObject(r), c = bb.getCenter(new THREE.Vector3());
    const innen = new THREE.Group(); innen.add(r); r.position.sub(c);
    funk.pivot = new THREE.Group(); funk.pivot.add(innen); funk.geraet = r; funk.L = Math.max(...bb.getSize(new THREE.Vector3()).toArray());
    funk.pivot.visible = false; szene.add(funk.pivot);
  }
  funk.an += klemme(soll - funk.an, -dt * 3, dt * 3);
  funk.pivot.visible = funk.an > 0.001;
  if(!funk.pivot.visible) return;
  ndcZuEbene(RUCKSACK_NDC.x, RUCKSACK_NDC.y, funk.pivot.position);   // genau dort, wo sonst der Rucksack steht (nie beide zugleich)
  funk.pivot.scale.setScalar(weich(funk.an) * 0.42 / funk.L);
  funk.pivot.rotation.set(0.2, -0.45, 0);
  // dieselbe Bewegung wie am Feuer: wackeln, huepfen, Lampe blinkt
  const t = story.funkWackel ? story.funkWackel() : performance.now() / 1000, r = funk.geraet;
  r.rotation.z = Math.sin(t * 30) * 0.03;
  r.parent.position.y = Math.abs(Math.sin(t * 22)) * 0.01;
  if(r.userData.lampe) r.userData.lampe.visible = Math.sin(t * 10) > 0;
}

// ---- Inventar (D-Pad runter / N, Live-Wunsch 16.10.) ---------------------------------------------------------------
// Inventar an = Spiel pausiert (story.js), Inventar aus = weiter. In der Bildmitte eine halbtransparente weisse Flaeche
// (2/3 des Bildschirms), darauf alle eingesammelten Dinge – hoechstens INV_PRO_ZEILE pro Zeile, mittig, jedes mit einem
// dezenten warmen Schein dahinter und langsam drehend (wie beim Einstecken). Waehrend des Einsteckens geht es nicht auf.
const INV_PRO_ZEILE = 3;
const INV_REIHE = ['notizbuch', 'lupe', 'kompass', 'messer', 'stift', 'kamera'];
const inv = { an: false, k: 0, dinge: [], t: 0, flaeche: null, glowTex: null };
// Die Flaeche ist ein Mesh in der Bildebene selbst (ein DOM-Element laege ueber oder unter allen Dingen, nicht dazwischen).
// Reihenfolge: Flaeche (renderOrder -1) -> Schein (0, ohne Tiefentest) -> die Dinge (normal, mit Tiefe).
function flaecheBauen(){
  if(inv.flaeche) return;
  // weiche Ecken: Canvas-Textur mit abgerundetem Rechteck
  const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d');
  const r = 46; g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(r, 0); g.arcTo(512, 0, 512, 512, r); g.arcTo(512, 512, 0, 512, r); g.arcTo(0, 512, 0, 0, r); g.arcTo(0, 0, 512, 0, r); g.fill();
  inv.flaeche = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.55, depthWrite: false }));
  inv.flaeche.renderOrder = -1; inv.flaeche.visible = false; szene.add(inv.flaeche);
  // Schein: weiches, warmes Leuchten (radialer Verlauf), hinter jedem Ding
  const h = document.createElement('canvas'); h.width = h.height = 128; const hg = h.getContext('2d'), gr = hg.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,236,170,0.85)'); gr.addColorStop(0.45, 'rgba(255,220,140,0.35)'); gr.addColorStop(1, 'rgba(255,220,140,0)');
  hg.fillStyle = gr; hg.fillRect(0, 0, 128, 128); inv.glowTex = new THREE.CanvasTexture(h);
}
function inventarAn(an){
  ebene(); flaecheBauen();
  if(an && flug.akt) return false;                               // erst fertig einstecken
  inv.an = an;
  if(an){
    for(const d of inv.dinge){ szene.remove(d.p); szene.remove(d.glow); zeigeAnimLos(d.anim); }
    inv.dinge = [];
    const da = INV_REIHE.filter(n => zustand[n]);
    inv.anzahl = da.length;
    da.forEach((n, i) => klon(n).then(o => {
      if(!inv.an) return;
      o.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(o), L = Math.max(...bb.getSize(new THREE.Vector3()).toArray());
      o.position.sub(bb.getCenter(new THREE.Vector3()));
      o.traverse(m => { if(m.isMesh) m.castShadow = false; });
      const p = new THREE.Group(); p.add(o); szene.add(p);
      o.traverse(m => { if(m.isMesh) m.renderOrder = 1; });
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: inv.glowTex, transparent: true, depthWrite: false, depthTest: false }));
      glow.renderOrder = 0; szene.add(glow);
      // Haltung wie beim Zeigen; das Notizbuch (hochkant) etwas gekippt, damit man den Deckel sieht
      const neig = n === 'notizbuch' ? 0.35 : (SACHEN[n].zeigen || 0);
      inv.dinge.push({ n, p, glow, L, i, anim: zeigeAnim(n, o), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(neig, 0, 0)) });
    }));
  }
  // Rucksack unten rechts dazu (Live-Wunsch 16.10.: "der Rucksack erscheint nicht unten rechts"); zu = wieder weg
  rucksack.ziel = an ? 1 : 0;
  return true;
}
// story.js (D-Pad runter / N): an = Spiel pausiert, aus = weiter
story.inventar = (an) => inventarAn(an === undefined ? !inv.an : an);
story.inventarOffen = () => inv.an;
// ---- Auswahl im Inventar (Live-Wunsch 16.10.) ---------------------------------------------------------------------
// Linker Stick / Pfeiltasten: links, rechts, hoch, runter durchs Raster; die Auswahl wird etwas groesser und leuchtet
// leicht. A (Enter/Leertaste) = auswaehlen: Notizbuch -> aufschlagen (wenn schon etwas drin ist), sonst die Erklaerung wie
// beim Einpacken. B = Inventar zu (wie D-Pad runter). Gelesen wird hier selbst – die Engine steht in der Pause.
inv.wahl = 0;
const eingabe = { x: 0, y: 0, a: false, b: false, sperre: 0 };
// Tastatur zusaetzlich ueber keydown sammeln: ein kurzes Antippen faellt sonst zwischen zwei Bilder und geht verloren
const tipp = { x: 0, y: 0, a: false, b: false };
addEventListener('keydown', (e) => {
  if(!(story.pauseArt && story.pauseArt() === 'inventar') || e.repeat) return;
  if(e.code === 'ArrowLeft') tipp.x = -1; else if(e.code === 'ArrowRight') tipp.x = 1;
  else if(e.code === 'ArrowUp') tipp.y = -1; else if(e.code === 'ArrowDown') tipp.y = 1;
  else if(e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') tipp.a = true;
  else if(e.code === 'KeyB' || e.code === 'Backspace' || e.code === 'Escape') tipp.b = true;
}, true);
function liesEingabe(){
  let x = 0, y = 0, a = false, b = false;
  if(keys['ArrowLeft']) x -= 1; if(keys['ArrowRight']) x += 1; if(keys['ArrowUp']) y -= 1; if(keys['ArrowDown']) y += 1;
  if(keys['Enter'] || keys['Space'] || keys['NumpadEnter']) a = true; if(keys['KeyB'] || keys['Backspace'] || keys['Escape']) b = true;
  for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])){ if(!gp) continue;
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0; if(Math.abs(ax) > 0.5) x = Math.sign(ax); if(Math.abs(ay) > 0.5) y = Math.sign(ay);
    if(gp.buttons[14] && gp.buttons[14].pressed) x = -1; if(gp.buttons[15] && gp.buttons[15].pressed) x = 1;
    if(gp.buttons[12] && gp.buttons[12].pressed) y = -1;
    if(gp.buttons[0] && gp.buttons[0].pressed) a = true; if(gp.buttons[1] && gp.buttons[1].pressed) b = true; }
  return { x, y, a, b };
}
// Kanten erkennen (ein Druck = ein Schritt), Stick mit Wiederholung nach 0,35 s
function eingabeKanten(dt){
  const e = liesEingabe(), out = { x: 0, y: 0, a: (e.a && !eingabe.a) || tipp.a, b: (e.b && !eingabe.b) || tipp.b };
  if(tipp.x || tipp.y){ out.x = tipp.x; out.y = tipp.y; eingabe.sperre = 0.35; }
  const getippt = !!(tipp.x || tipp.y); tipp.x = tipp.y = 0; tipp.a = tipp.b = false;
  if(getippt){ eingabe.x = e.x; eingabe.y = e.y; eingabe.a = e.a; eingabe.b = e.b; return out; }
  const dir = e.x || e.y;
  if(!dir){ eingabe.sperre = 0; }
  else if(eingabe.sperre <= 0 || (e.x !== eingabe.x || e.y !== eingabe.y)){ out.x = e.x; out.y = e.y; eingabe.sperre = eingabe.x === e.x && eingabe.y === e.y ? 0.18 : 0.35; }
  else eingabe.sperre -= dt;
  eingabe.x = e.x; eingabe.y = e.y; eingabe.a = e.a; eingabe.b = e.b;
  return out;
}
function inventarSteuern(dt){
  const k = eingabeKanten(dt);
  if(buch.offen){ buchSteuern(k); return; }
  if(k.b){ inventarSchliessen(); return; }                       // B geht immer, auch waehrend einer Erklaerung
  // Der Stick bleibt immer frei (Live-Befund: waehrend einer Erklaerung reagierte er nicht). Waehlt man um oder drueckt A
  // erneut, endet die laufende Erklaerung, und die neue kommt sofort.
  const n = inv.anzahl || 0; if(!n) return;
  const zeilen = Math.ceil(n / INV_PRO_ZEILE);
  let z = Math.floor(inv.wahl / INV_PRO_ZEILE), s = inv.wahl % INV_PRO_ZEILE;
  if(k.x){ s = (s + k.x + INV_PRO_ZEILE) % INV_PRO_ZEILE; }
  if(k.y){ z = (z + k.y + zeilen) % zeilen; }
  const vorher = inv.wahl;
  inv.wahl = Math.min(n - 1, z * INV_PRO_ZEILE + s);
  if(inv.wahl !== vorher && inv.sprichtWahl && story.stimmeStopp){ story.stimmeStopp(); inv.sprichtWahl = false; }
  if(k.a){
    const d = inv.dinge.find(q => q.i === inv.wahl); if(!d) return;
    if(d.n === 'notizbuch' && story.notizSeiten && story.notizSeiten().length){ if(story.stimmeStopp) story.stimmeStopp(); inv.sprichtWahl = false; buchOeffnen(); return; }
    if(inv.sprichtWahl && story.stimmeStopp) story.stimmeStopp();
    inv.sprichtWahl = true;
    story.sprich(TEXT_INVENTAR[d.n] || TEXT[d.n] || [], () => { inv.sprichtWahl = false; }, 'inventar');
  }
}
// Im Inventar ohne das "Und" vom Einpacken (Live-Wunsch 16.10.) – dort steht jeder Satz fuer sich
const TEXT_INVENTAR = {
  stift:  ['Ein Stift. Damit kannst du alles aufschreiben.'],
  kamera: ['Deine Kamera! Damit machst du Fotos von allen Hinweisen.'],
};
function inventarSchliessen(){ inv.sprichtWahl = false; buch.offen = false; if(story.inventarZu) story.inventarZu(); }

// ---- Notizbuch (Live-Wunsch 16.10.) -------------------------------------------------------------------------------
// Im Inventar das Notizbuch mit A: es wird gross und schlaegt sich auf der zuletzt beklebten Seite auf (Doppelseite: links
// die Seite, rechts die naechste). Links/rechts blaettert, B schlaegt es zu – man ist wieder im Inventar. Die Seiten
// (Foto, Skizze ...) liefert notizbuch.js als Canvas (story.notizSeiten). Gezeichnet auf eine Ebene in der Bildebene.
const buch = { offen: false, k: 0, mesh: null, cv: null, seite: 0, blatt: 0 };
function buchBauen(){
  if(buch.mesh) return;
  buch.cv = document.createElement('canvas'); buch.cv.width = 1600; buch.cv.height = 1000;
  buch.tex = new THREE.CanvasTexture(buch.cv);
  buch.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: buch.tex, transparent: true, depthWrite: false }));
  buch.mesh.renderOrder = 3; buch.mesh.visible = false; szene.add(buch.mesh);
}
function buchOeffnen(){
  buchBauen();
  const seiten = story.notizSeiten();
  buch.offen = true; buch.um = null; buch.seite = Math.max(0, seiten.length - 1);    // zuletzt beklebte Seite
  buch.seite -= buch.seite % 2;                                      // Doppelseiten: gerade Nummer links
  buchMalen();
}
function buchSteuern(k){
  const n = story.notizSeiten().length;
  if(k.b){ buch.offen = false; return; }                             // zu: zurueck ins Inventar
  if(buch.um) return;                                                 // erst fertig umblaettern
  if(k.x > 0 && buch.seite + 2 < n) blaettern(1);
  if(k.x < 0 && buch.seite > 0) blaettern(-1);
}
// Umblaettern (Live-Wunsch 16.10.: nicht das ganze Buch wackeln lassen, nur die Seite): die neue Doppelseite liegt schon
// darunter, ein Blatt klappt um die Bindung herum – erst die alte Seite (schmaler werdend, dunkler), dann die
// Rueckseite = neue Seite auf der anderen Seite (breiter werdend). Gemalt aus zwei Canvas-Bildern (alt/neu).
const T_BLATT = 0.55;
function blaettern(r){
  if(!buch.alt){ buch.alt = document.createElement('canvas'); buch.alt.width = buch.cv.width; buch.alt.height = buch.cv.height;
    buch.neu = document.createElement('canvas'); buch.neu.width = buch.cv.width; buch.neu.height = buch.cv.height; }
  buch.alt.getContext('2d').clearRect(0, 0, buch.alt.width, buch.alt.height); buch.alt.getContext('2d').drawImage(buch.cv, 0, 0);
  buch.seite += 2 * r; buchMalen();
  buch.neu.getContext('2d').clearRect(0, 0, buch.neu.width, buch.neu.height); buch.neu.getContext('2d').drawImage(buch.cv, 0, 0);
  buch.um = { r, t: 0 }; blattMalen();
}
function blattMalen(){
  const u = buch.um, c = buch.cv.getContext('2d'), W = buch.cv.width, H = buch.cv.height, M = W / 2, k = weich(Math.min(1, u.t / T_BLATT));
  c.clearRect(0, 0, W, H);
  // unten: links bzw. rechts schon die neue Seite, auf der anderen Seite noch die alte (bis das Blatt dort ankommt)
  const vorn = u.r > 0;                                               // vorwaerts: das rechte Blatt klappt nach links
  c.drawImage(buch.neu, 0, 0);
  if(vorn) c.drawImage(buch.alt, 0, 0, M, H, 0, 0, M, H); else c.drawImage(buch.alt, M, 0, M, H, M, 0, M, H);
  // das Blatt: erste Haelfte die alte Seite (schmaler), zweite Haelfte die neue (breiter), immer an der Bindung
  const erste = k < 0.5, b = Math.abs(Math.cos(k * Math.PI)), dunkel = 0.35 * (1 - b);
  let sx, dx;
  if(vorn){ if(erste){ sx = M; dx = M; } else { sx = 0; dx = M - b * M; } }
  else { if(erste){ sx = 0; dx = M - b * M; } else { sx = M; dx = M; } }
  const quelle = erste ? buch.alt : buch.neu, bw = Math.max(1, b * M);
  c.drawImage(quelle, sx, 0, M, H, dx, 0, bw, H);
  c.fillStyle = 'rgba(40,20,10,' + dunkel.toFixed(3) + ')'; c.fillRect(dx, 54, bw, H - 108);
  // Schatten an der Bindung, wo das Blatt aufsteht
  const sg = c.createLinearGradient(M - 40, 0, M + 40, 0); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(0.5, 'rgba(0,0,0,' + (0.25 * (1 - b)).toFixed(3) + ')'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = sg; c.fillRect(M - 40, 54, 80, H - 108);
  buch.tex.needsUpdate = true;
}
// Doppelseite malen: Einband, zwei Papierseiten, Bindung, eingeklebte Bilder mit Klebestreifen, Seitenzahlen
function buchMalen(){
  const c = buch.cv.getContext('2d'), W = 1600, H = 1000, seiten = story.notizSeiten();
  c.clearRect(0, 0, W, H);
  // Einband (dunkles Leder) mit runden Ecken
  const rund = (x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  c.fillStyle = '#5a2e1a'; rund(20, 20, W - 40, H - 40, 34); c.fill();
  c.strokeStyle = '#3a1c0f'; c.lineWidth = 6; c.stroke();
  // Papier: zwei Seiten
  for(const [x, links] of [[60, true], [W / 2 + 6, false]]){
    const g = c.createLinearGradient(x, 0, x + W / 2 - 66, 0);
    g.addColorStop(links ? 0 : 1, '#f3ead2'); g.addColorStop(links ? 0.92 : 0.08, '#efe4c8'); g.addColorStop(links ? 1 : 0, '#d9caa6');
    c.fillStyle = g; c.fillRect(x, 54, W / 2 - 66, H - 108);
    // feine Linien wie im Schreibheft
    c.strokeStyle = 'rgba(120,140,170,.18)'; c.lineWidth = 2;
    for(let y = 120; y < H - 70; y += 46){ c.beginPath(); c.moveTo(x + 30, y); c.lineTo(x + W / 2 - 96, y); c.stroke(); }
  }
  // Bindung in der Mitte
  const bg = c.createLinearGradient(W / 2 - 30, 0, W / 2 + 30, 0); bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(0.5, 'rgba(0,0,0,.35)'); bg.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = bg; c.fillRect(W / 2 - 30, 54, 60, H - 108);
  // Inhalt: links Seite buch.seite, rechts buch.seite + 1
  for(const [i, x] of [[buch.seite, 60], [buch.seite + 1, W / 2 + 6]]){
    const s = seiten[i]; if(!s) continue;
    const bw = W / 2 - 66, bh = H - 108, pad = 70;
    const ar = s.bild.width / s.bild.height; let w = bw - pad * 2, h = w / ar; if(h > bh - pad * 2 - 60){ h = bh - pad * 2 - 60; w = h * ar; }
    const bx = x + (bw - w) / 2, by = 54 + pad + 10;
    c.save(); c.translate(bx + w / 2, by + h / 2); c.rotate(s.dreh || 0);
    if(s.art === 'foto'){ c.fillStyle = '#ffffff'; c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 18; c.shadowOffsetY = 6; c.fillRect(-w / 2 - 18, -h / 2 - 18, w + 36, h + 80); c.shadowColor = 'transparent'; }
    c.drawImage(s.bild, -w / 2, -h / 2, w, h);
    // Klebestreifen an zwei Ecken
    c.fillStyle = 'rgba(255,248,210,.75)';
    for(const [ex, ey, r] of [[-w / 2, -h / 2 - 10, -0.6], [w / 2, -h / 2 - 10, 0.6]]){ c.save(); c.translate(ex, ey); c.rotate(r); c.fillRect(-46, -14, 92, 28); c.restore(); }
    c.restore();
    // Seitenzahl und Ortssymbol (wo die Seite entstanden ist) zusammen mittig auf der Seite und mit Abstand zum Rand
    // (Live-Befund 16.10.: das Symbol ragte unten bis an den Rand, die Zahl stand links daneben aus der Mitte)
    c.fillStyle = 'rgba(80,60,40,.7)'; c.font = '600 30px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
    const zahl = String(i + 1), zw = c.measureText(zahl).width, sym = s.ort ? 52 : 0, luft = sym ? 14 : 0;
    const x0 = x + bw / 2 - (zw + luft + sym) / 2, ym = H - 104;
    c.fillText(zahl, x0, ym + 2); c.textBaseline = 'alphabetic';
    if(sym) ortSymbol(c, s.ort, x0 + zw + luft + sym / 2, ym, sym);
  }
  // Pfeile, wenn man weiterblaettern kann
  c.fillStyle = 'rgba(255,230,160,.9)';
  const pfeil = (x, r) => { c.beginPath(); c.moveTo(x, H / 2 - 34); c.lineTo(x + 34 * r, H / 2); c.lineTo(x, H / 2 + 34); c.closePath(); c.fill(); };
  if(buch.seite > 0) pfeil(52, -1);
  if(buch.seite + 2 < seiten.length) pfeil(W - 52, 1);
  buch.tex.needsUpdate = true;
}
// ---- Symbol fuer Joshis Insel (Live-Wunsch 16.10.: farbig auf dem Globus, als Bleistift-Miniskizze im Notizbuch) ----
// Selbst gezeichnet (nach dem Motiv einer Vorlage, nicht kopiert): Sand und Wasser, zwei Palmen, Strohhuette auf Stelzen.
// art 'farbe' = ausgemalt mit Umriss, 'stift' = nur Bleistiftlinien (leicht versetzt nachgezogen). (cx, cy) = Mitte, g = Groesse.
story.inselIcon = function(c, cx, cy, g, art){
  const k = g / 200, stift = art === 'stift';
  c.save(); c.translate(cx - 100 * k, cy - 105 * k); c.scale(k, k); c.lineCap = 'round'; c.lineJoin = 'round';
  const durchgaenge = stift ? 2 : 1;
  for(let d = 0; d < durchgaenge; d++){
    const v = stift ? (d ? 1.2 : -0.6) : 0;                         // Bleistift: zweiter Strich leicht versetzt
    c.save(); c.translate(v, -v * 0.5);
    const tinte = stift ? 'rgba(60,52,44,' + (d ? 0.45 : 0.8) + ')' : '#4a3424';
    c.lineWidth = stift ? (d ? 1.6 : 2.4) : 2.5; c.strokeStyle = tinte;
    const form = (pfad, fuell) => { c.beginPath(); pfad(); if(!stift && fuell){ c.fillStyle = fuell; c.fill(); } c.stroke(); };
    // Wasser und Sand
    form(() => c.ellipse(100, 168, 92, 22, 0, 0, Math.PI * 2), '#5cc6e0');
    form(() => c.ellipse(100, 160, 70, 14, 0, 0, Math.PI * 2), '#f2d48b');
    if(!stift){ c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; for(const [x, y] of [[22, 172], [160, 176], [140, 182]]){ c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 7, y - 4, x + 14, y); c.stroke(); } c.strokeStyle = tinte; c.lineWidth = 2.5; }
    else for(let x = 52; x < 150; x += 9){ c.beginPath(); c.moveTo(x, 163); c.lineTo(x + 5, 157); c.stroke(); }   // Sand schraffiert
    // Palmen: Stamm als zwei Linien (Bleistift) bzw. dicker brauner Strich mit Ringen
    for(const [x0, xm, ym, x1, y1] of [[76, 64, 112, 88, 66], [94, 104, 104, 124, 50]]){
      if(stift){ for(const o of [-4, 4]){ c.beginPath(); c.moveTo(x0 + o, 158); c.quadraticCurveTo(xm + o, ym, x1 + o * 0.6, y1); c.stroke(); } }
      else { c.save(); c.strokeStyle = '#4a3424'; c.lineWidth = 11; c.beginPath(); c.moveTo(x0, 158); c.quadraticCurveTo(xm, ym, x1, y1); c.stroke();
        c.strokeStyle = '#a0683a'; c.lineWidth = 7.5; c.stroke(); c.restore(); }
      // Wedel: sechs Blaetter um die Krone
      for(let i = 0; i < 6; i++){
        const w = -Math.PI * 0.95 + i * Math.PI * 0.38, L = 30 + (i % 2) * 6, ex = x1 + Math.cos(w) * L, ey = y1 + Math.sin(w) * L * 0.75 + 10;
        const mx = x1 + Math.cos(w) * L * 0.5, my = y1 + Math.sin(w) * L * 0.5 - 8;
        form(() => { c.moveTo(x1, y1); c.quadraticCurveTo(mx - 6, my - 4, ex, ey); c.quadraticCurveTo(mx + 6, my + 6, x1, y1); }, i % 2 ? '#3f9a45' : '#5cb85c');
        if(stift){ c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(mx, my, ex, ey); c.stroke(); }   // Mittelrippe
      }
    }
    // Huette auf Stelzen: Stelzen, Wand, Tuer, Strohdach
    for(const x of [118, 132, 146, 160]){ c.beginPath(); c.moveTo(x, 146); c.lineTo(x, 160); c.stroke(); }
    form(() => c.rect(114, 118, 50, 28), '#c98f52');
    form(() => c.rect(130, 126, 16, 20), '#3a2416');
    form(() => { c.moveTo(104, 122); c.quadraticCurveTo(138, 84, 140, 84); c.quadraticCurveTo(142, 84, 174, 122); c.closePath(); }, '#ebc35e');
    if(stift) for(let x = 112; x < 168; x += 7){ c.beginPath(); c.moveTo(x, 120); c.lineTo(x + (140 - x) * 0.3, 104); c.stroke(); }   // Strohstriche
    c.restore();
  }
  c.restore();
};
// Ortssymbol neben der Seitenzahl, wie mit dem Bleistift gezeichnet: Insel = die Insel mit Huette und Palmen
// (weitere Orte bekommen hier ihr Symbol, sobald sie feststehen)
// (x, y) = Mitte, g = Groesse
function ortSymbol(c, ort, x, y, g){
  if(ort === 'insel') story.inselIcon(c, x, y, g, 'stift');
}
function updateBuch(dt){
  if(!buch.mesh) return;
  buch.k += klemme((buch.offen ? 1 : 0) - buch.k, -dt * 4, dt * 4);
  buch.mesh.visible = buch.k > 0.001;
  if(!buch.mesh.visible) return;
  const H = hoeheEbene(), B = H * innerWidth / innerHeight, s = weich(buch.k);
  const w = Math.min(B * 0.86, H * 0.86 * 1.6);
  if(buch.um){ buch.um.t += dt; if(buch.um.t >= T_BLATT){ buch.um = null; buchMalen(); } else blattMalen(); }   // nur das Blatt bewegt sich
  buch.mesh.position.set(0, 0, 1);
  buch.mesh.scale.set(w * s, w / 1.6 * s, 1);
  buch.mesh.material.opacity = s;
}
const _iq = new THREE.Quaternion();
function updateInventar(dt){
  inv.k += klemme((inv.an ? 1 : 0) - inv.k, -dt * 4, dt * 4);
  if(inv.flaeche) inv.flaeche.visible = inv.k > 0.001;
  if(inv.k <= 0 && !inv.an){ for(const d of inv.dinge){ szene.remove(d.p); szene.remove(d.glow); zeigeAnimLos(d.anim); } inv.dinge = []; return; }
  inv.t += dt;
  const s = weich(inv.k), H = hoeheEbene(), B = H * innerWidth / innerHeight;
  // Flaeche: 2/3 der Bildbreite und -hoehe, mittig
  const fb = B * 2 / 3, fh = H * 2 / 3;
  inv.flaeche.position.set(0, 0, -0.5); inv.flaeche.scale.set(fb * (0.9 + 0.1 * s), fh * (0.9 + 0.1 * s), 1);
  inv.flaeche.material.opacity = 0.55 * s;
  // Raster: so viele Zeilen wie noetig, je Zeile mittig; Platzgroesse so, dass alles in die Flaeche passt
  const n = inv.anzahl || inv.dinge.length, zeilen = Math.max(1, Math.ceil(n / INV_PRO_ZEILE));
  const platz = Math.min(fb / INV_PRO_ZEILE, fh / zeilen) * 0.92, gross = platz * 0.62;
  for(const d of inv.dinge){
    const zeile = Math.floor(d.i / INV_PRO_ZEILE), spalte = d.i % INV_PRO_ZEILE, inZeile = Math.min(INV_PRO_ZEILE, n - zeile * INV_PRO_ZEILE);
    const x = (spalte - (inZeile - 1) / 2) * platz, y = ((zeilen - 1) / 2 - zeile) * platz;
    // Auswahl: weich etwas groesser (25 %) und mit leichtem Schein; alle anderen nur ein ganz dezenter Schein
    const gewaehlt = d.i === inv.wahl && !buch.offen;
    d.w = (d.w || 0) + ((gewaehlt ? 1 : 0) - (d.w || 0)) * Math.min(1, dt * 8);
    if(d.anim && d.anim.klapp) d.anim.klapp.soll = gewaehlt ? 1 : 0;   // Messer: ausgewaehlt auf, sonst zu
    d.p.position.set(x, y, 0.3);
    // Live-Wunsch: die Auswahl etwas groesser (40 %); ohne Auswahl nur ein Hauch von Schein, mit Auswahl deutlich – vorher
    // war der normale Schein so stark, dass man keinen Unterschied sah
    d.p.scale.setScalar(s * gross / d.L * (1 + 0.4 * d.w) * (buch.offen ? 1 - buch.k : 1));
    _iq.setFromAxisAngle(_y, inv.t * 0.9 + d.i * 1.1);            // langsam drehen, jedes etwas versetzt
    d.p.quaternion.copy(_iq).multiply(d.q);
    d.glow.position.set(x, y, -0.2);                              // hinter dem Ding
    d.glow.scale.setScalar(platz * (0.6 + 0.5 * d.w) * s * (1 + Math.sin(inv.t * 1.6 + d.i) * 0.04));
    d.glow.material.opacity = (0.05 + 0.8 * d.w) * s * (buch.offen ? 1 - buch.k : 1);
  }
}

// ---- Einhaengen: jedes Bild nach dem Spielbild die Ebene zeichnen -------------------------------------------------
function hookAusruestung(){
  const loopOrig = loop;
  let tVor = performance.now();
  loop = function(){
    const jetzt = performance.now(), dt = Math.min(0.1, (jetzt - tVor) / 1000); tVor = jetzt;
    const r = loopOrig.apply(this, arguments);
    const p = story.pause && story.pause();                       // Pause: alles steht, gezeichnet wird weiter
    if(!p) for(const mx of mixer) mx.update(dt);
    else if(story.pauseArt && story.pauseArt() === 'inventar') for(const d of inv.dinge) if(d.anim && d.anim.mx) d.anim.mx.update(dt);   // Nadel dreht
    updateKlappen(p && !(story.pauseArt && story.pauseArt() === 'inventar') ? 0 : dt);   // Messer klappt (auch im Inventar)
    // Funkspruch oder offene Foto-/Skizzenstelle, bevor je etwas eingesteckt wurde: die Bildebene gleich anlegen
    // (notizbuch.js braucht sie ab dem Start: Detektivmuetze, Markierungen, Schwarm)
    if(!szene && story.gestartet) ebene();
    if(szene){
      // In der Pause steht alles – ausser dem Inventar selbst (das IST die Inventar-Pause): Rucksack und Dinge drehen weiter
      const inventarPause = p && story.pauseArt && story.pauseArt() === 'inventar';
      if(!p){ updateFlug(dt); updateRucksack(dt); updateInventar(dt); updateRaus(dt); }
      else if(inventarPause || inv.k > 0){ updateRucksack(dt); updateInventar(dt); }
      if(inventarPause && inv.an) inventarSteuern(dt);            // Auswahl, A, B, Notizbuch blaettern
      updateBuch(dt);
      if(story.bildEbene) story.bildEbene(dt, szene, p);          // notizbuch.js: Foto/Skizze zeigen und einkleben
      updateFunkSymbol(dt);                                       // in der Pause blendet es aus
      if(flug.akt || rucksack.pivot.visible || inv.dinge.length || (inv.flaeche && inv.flaeche.visible) || (funk.pivot && funk.pivot.visible)
         || (buch.mesh && buch.mesh.visible) || raus.akt || (story.bildEbeneAktiv && story.bildEbeneAktiv())){
        kam.aspect = innerWidth / innerHeight; kam.updateProjectionMatrix();
        const ac = renderer.autoClear; renderer.autoClear = false; renderer.clearDepth();
        renderer.render(szene, kam); renderer.autoClear = ac;
      }
    }
    return r;
  };
  // Modelle vorab laden – schon waehrend des Startbildschirms (story.js wartet damit auf den Knopf), sonst stockt es beim
  // Betreten der Huette
  story.ausruestungVorladen = () => { for(const n of Object.keys(SACHEN)) vorlage(n); };
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookAusruestung(); };
})();
