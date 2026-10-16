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
  kamera:    { glb: 'KAMERA_GLB', L: 0.14, zeigen: 0.15, deckend: true },   // Modell steht auf alphaMode BLEND + doppelseitig: wirkte durchsichtig
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
story.szeneLaeuft = () => !!flug.akt;                  // story.js: waehrenddessen keine Gitarre
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
      // Funkspruch erst, wenn auch draussen alles abgesucht und angesehen ist (story.fall1Pruefen)
      story.sprich(TEXT_KOMPLETT, () => { rucksack.ziel = 0; if(story.fall1Pruefen) story.fall1Pruefen(); });
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

// ---- Funkgeraet unten rechts, wenn ein Funkspruch kommt (Live-Wunsch 16.10.) -----------------------------------------
// An der Stelle des Rucksacks erscheint das Funkgeraet und wackelt und blinkt genau wie das echte am Lagerfeuer (story.js
// updateRadio) – so erkennt man einen Funkspruch immer sofort. Beide zugleich gibt es nicht: waehrend des Einsteckens
// kommt kein Funkspruch, das Inventar ist eine Pause, und in der Pause ist das Symbol aus.
const funk = { pivot: null, geraet: null, an: 0 };
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
    for(const d of inv.dinge){ szene.remove(d.p); szene.remove(d.glow); stoppe(d.mx); }
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
      const A = SACHEN[n].zeigenAnim;
      // Haltung wie beim Zeigen; das Notizbuch (hochkant) etwas gekippt, damit man den Deckel sieht
      const neig = n === 'notizbuch' ? 0.35 : (SACHEN[n].zeigen || 0);
      inv.dinge.push({ n, p, glow, L, i, mx: A ? spiele(o, A, 1) : null, q: new THREE.Quaternion().setFromEuler(new THREE.Euler(neig, 0, 0)) });
    }));
  }
  // Rucksack unten rechts dazu (Live-Wunsch 16.10.: "der Rucksack erscheint nicht unten rechts"); zu = wieder weg
  rucksack.ziel = an ? 1 : 0;
  return true;
}
// story.js (D-Pad runter / N): an = Spiel pausiert, aus = weiter
story.inventar = (an) => inventarAn(an === undefined ? !inv.an : an);
story.inventarOffen = () => inv.an;
const _iq = new THREE.Quaternion();
function updateInventar(dt){
  inv.k += klemme((inv.an ? 1 : 0) - inv.k, -dt * 4, dt * 4);
  if(inv.flaeche) inv.flaeche.visible = inv.k > 0.001;
  if(inv.k <= 0 && !inv.an){ for(const d of inv.dinge){ szene.remove(d.p); szene.remove(d.glow); stoppe(d.mx); } inv.dinge = []; return; }
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
    d.p.position.set(x, y, 0.3);
    d.p.scale.setScalar(s * gross / d.L);
    _iq.setFromAxisAngle(_y, inv.t * 0.9 + d.i * 1.1);            // langsam drehen, jedes etwas versetzt
    d.p.quaternion.copy(_iq).multiply(d.q);
    d.glow.position.set(x, y, -0.2);                              // hinter dem Ding
    d.glow.scale.setScalar(platz * 0.95 * s * (1 + Math.sin(inv.t * 1.6 + d.i) * 0.04));
    d.glow.material.opacity = 0.75 * s;
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
    else if(story.pauseArt && story.pauseArt() === 'inventar') for(const d of inv.dinge) if(d.mx) d.mx.update(dt);   // Messer klappt, Nadel dreht
    if(!szene && story.funkAktiv && story.funkAktiv()) ebene();   // Funkspruch, bevor je etwas eingesteckt wurde
    if(szene){
      // In der Pause steht alles – ausser dem Inventar selbst (das IST die Inventar-Pause): Rucksack und Dinge drehen weiter
      const inventarPause = p && story.pauseArt && story.pauseArt() === 'inventar';
      if(!p){ updateFlug(dt); updateRucksack(dt); updateInventar(dt); }
      else if(inventarPause || inv.k > 0){ updateRucksack(dt); updateInventar(dt); }
      updateFunkSymbol(dt);                                       // in der Pause blendet es aus
      if(flug.akt || rucksack.pivot.visible || inv.dinge.length || (inv.flaeche && inv.flaeche.visible) || (funk.pivot && funk.pivot.visible)){
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
