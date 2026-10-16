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
  messer:    { glb: 'MESSER_GLB', L: 0.11, dreh: [-Math.PI / 2, 0, 0], zeigen: 1.1, zeigenAnim: ['Blade Flip'] },
  lupe:      { glb: 'LUPE_GLB', L: 0.21, zeigen: 1.0 },
  kamera:    { glb: 'KAMERA_GLB', L: 0.14, zeigen: 0.15 },
  rucksack:  { glb: 'RUCKSACK_GLB', L: 0.45, dreh: [0, -Math.PI / 2, 0], zeigen: 0 },
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
      for(const mt of (Array.isArray(o.material) ? o.material : [o.material])){ if(!mt) continue; mt.metalness = Math.min(mt.metalness || 0, 0.3); if(S.beidseitig) mt.side = THREE.DoubleSide; } } });
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
function klon(n){ return vorlage(n).then(v => { const g = v.clone(true); g.userData.clips = v.userData.clips; g.userData.sache = n; return g; }); }
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
function zeige(dinge){
  ebene();
  flug.liste.push(...dinge.filter(d => d && d.obj));
  rucksack.ziel = 1;
  if(!flug.akt) naechstes();
}
function naechstes(){
  const d = flug.liste.shift();
  if(!d){
    flug.akt = null;
    // alles im Rucksack: Lob, dann der Funkspruch fuer den ersten Fall (story.js)
    if(!zustand.komplett && Object.keys(TEXT).every(n => zustand[n])){
      zustand.komplett = true;
      story.sprich(TEXT_KOMPLETT, () => { rucksack.ziel = 0; if(story.fall1Funk) story.fall1Funk(); });
      return;
    }
    story.spaeter(1.6, () => { if(!flug.akt) rucksack.ziel = 0; }); return;
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
  const A = SACHEN[f.n].zeigenAnim; if(A) f.mx = spiele(o, A, 1);
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
    if(f.t >= T_DREH){ f.phase = 'weg'; f.t = 0; }
  } else if(f.phase === 'weg'){
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
      stoppe(f.mx); szene.remove(p);                             // nicht entsorgen: Geometrie gehoert der Vorlage
      rucksack.hops = 1;                                          // der Rucksack huepft, wenn etwas hineinfaellt
      f.phase = 'fertig'; f.fertigAnim = true; pruefeWeiter();
    }
  }
}
function updateRucksack(dt){
  if(!rucksack) return;
  rucksack.an += klemme(rucksack.ziel - rucksack.an, -dt * 3, dt * 3);
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

// ---- Einhaengen: jedes Bild nach dem Spielbild die Ebene zeichnen -------------------------------------------------
function hookAusruestung(){
  const loopOrig = loop;
  let tVor = performance.now();
  loop = function(){
    const jetzt = performance.now(), dt = Math.min(0.1, (jetzt - tVor) / 1000); tVor = jetzt;
    const r = loopOrig.apply(this, arguments);
    for(const mx of mixer) mx.update(dt);
    if(szene){
      updateFlug(dt); updateRucksack(dt);
      if(flug.akt || rucksack.pivot.visible){
        kam.aspect = innerWidth / innerHeight; kam.updateProjectionMatrix();
        const ac = renderer.autoClear; renderer.autoClear = false; renderer.clearDepth();
        renderer.render(szene, kam); renderer.autoClear = ac;
      }
    }
    return r;
  };
  // Modelle vorab laden (sonst stockt es beim Betreten der Huette)
  story.spaeter(2, () => { for(const n of Object.keys(SACHEN)) vorlage(n); });
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookAusruestung(); };
})();
