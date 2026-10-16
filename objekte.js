// Das Geheimland – Objekt-Katalog und Grenzen (Live-Wunsch 16.10.2026). Laedt direkt nach story.js.
//
// Grundsatz: jedes Objekt wird EINMAL global als Typ definiert (story.typ) und erst dann in eine Welt gesetzt
// (story.setze). Egal in welcher Welt – es hat dort immer dieselben Eigenschaften:
//   - Grenze in seiner exakten Form: jedes Bauteil (Mesh) ist ein eigener Koerper in seinen eigenen Achsen. Quader
//     bleiben Quader, Zylinder Zylinder, Kugeln Kugeln; frei geformte Teile (GLB-Modelle, Palmwedel) werden laengs in
//     Scheiben zerlegt, damit z. B. ein dreieckiges Segel nicht als Rechteck sperrt. Das Ganze in 3D: unter hohen
//     Teilen geht man durch (Palmkrone; der Fuchs unter der Tischplatte), ueber ganz niedrige (unter STUFE) steigt man.
//   - Die Grenze haengt am Objekt selbst (an seiner matrixWorld): bewegt es sich (Boot, Orcas), wandert sie mit.
//   - Ausnahmen werden am Bauteil markiert: userData.begehbar (Boden, Teppich, Planken – man steht darauf),
//     userData.keinKoerper (Deko ohne eigene Masse: Fugen, Tapete, Buecher im Regal, Antenne), userData.deko
//     (Effekte, Tiere ohne Grenze: Schatten, Gischt, Moewen).
//   - Beim Setzen wird geprueft, ob dort schon etwas steht (oder Joshi/der Fuchs): dann am naechsten freien Platz
//     daneben – auf derselben Flaeche (opt.auf, z. B. die Tischplatte; sonst fester Boden bzw. Wasser je nach Typ).
//     Dasselbe gilt fuer Joshi und den Fuchs (story.freierPlatz).
//   - Verhaken gibt es nicht: wer schon in einer Grenze steckt, darf jeden Schritt machen, der ihn nicht tiefer
//     hineinbringt (Joshi, Fuchs, Schwimmen, Boot). Die Orcas schwimmen umeinander und um Joshi/das Boot herum.
// Joshi und der Fuchs sind Saeulen: Kugeln uebereinander von Fuss + STUFE bis zum Kopf.
//
// Neues Objekt:   story.typ('name', { bau(opt) { ...; return obj (Unterkante y = 0) oder Promise }, form?, untergrund?, beweglich? })
// Einbauen:       story.setze('name', welt, { x, z, y?, dreh?, auf?: Object3D, fest?: true })
//   form:       (leer) = jedes Bauteil einzeln; 'kreis' = ein Zylinder um das Ganze; 'quader' = ein Quader um das Ganze
//   untergrund: 'land' (Standard, fester Boden), 'wasser' oder 'egal'
//   fest:       genau an diese Stelle (gebaute Kulisse), kein Ausweichen
(function(){
'use strict';
const story = window.STORY;
const klemme = (v, a, b) => Math.max(a, Math.min(b, v));
const wd = (a, b) => { const d = b - a; return Math.atan2(Math.sin(d), Math.cos(d)); };

const STUFE = 0.2;                                   // m: so niedrige Dinge steigt man einfach drueber (Stegkante 0,14 m)
const SPRUNG = 0.25;                                 // m: im Sprung zaehlen die Fuesse so viel hoeher
const FIGUR = { r: 0.25, h: 1.2, stufe: STUFE };     // Joshi
const FUCHS = { r: 0.22, h: 0.55, stufe: 0.12 };     // der Fuchs (geht unter der Tischplatte durch)
const SCHWIMMER = { r: 0.35, h: 0.9, stufe: 0 };     // Joshi im Wasser (liegt, Koerpermitte = Position)
story.masse = { figur: FIGUR, fuchs: FUCHS };

// ---- Katalog ---------------------------------------------------------------------------------
const katalog = new Map();
function typ(name, def){
  if(katalog.has(name)) console.warn('Objekttyp doppelt definiert:', name);
  def.name = name; katalog.set(name, def); return def;
}
story.typ = typ; story.katalog = katalog;

const dinge = [];                                    // alles, was eine Grenze hat (gesetzt oder angemeldet)
story.dinge = dinge;
let bildNr = 0;

// Setzt ein Objekt des Typs name in die Welt weltN. Rueckgabe sofort: das Ding { typ, welt, obj, bereit }. Bei
// geladenen Modellen (GLB) kommt obj erst spaeter – bereit ist ein Promise darauf.
function setze(name, weltN, opt){
  opt = opt || {};
  const def = katalog.get(name);
  const d = { typ: name, welt: weltN, obj: null, koerper: [], bb: new THREE.Box3(), beweglich: !!(def && def.beweglich), aus: false };
  if(!def){ console.warn('Unbekannter Objekttyp – erst mit story.typ definieren:', name); d.bereit = Promise.resolve(d); return d; }
  const fertig = (obj) => {
    if(!obj) return d;
    (opt.in || story.welt(weltN)).add(obj);
    obj.rotation.y = opt.dreh || 0;
    d.obj = obj; obj.userData.ding = d;
    d.koerper = koerperAus(obj, def.form);
    platziere(d, def, opt);
    dinge.push(d); aktualisiere(d, true);
    if(def.danach) def.danach(d, opt);
    return d;
  };
  const r = def.bau(opt);
  if(r && typeof r.then === 'function') d.bereit = r.then(fertig);
  else { fertig(r); d.bereit = Promise.resolve(d); }
  return d;
}
story.setze = setze;
// Ein schon vorhandenes Objekt anmelden (z. B. die Orcas der Engine). opt: { welt ('*' = ueberall), form, beweglich }
function ding(obj, opt){
  opt = opt || {};
  const d = { typ: opt.typ || obj.name || '?', welt: opt.welt !== undefined ? opt.welt : story.etappe, obj, koerper: koerperAus(obj, opt.form),
    bb: new THREE.Box3(), beweglich: !!opt.beweglich, aus: false, orca: !!opt.orca };
  obj.userData.ding = d; dinge.push(d); aktualisiere(d, true);
  return d;
}
story.ding = ding;

// ---- Koerper aus den Bauteilen -----------------------------------------------------------------
function ausgenommen(o, root){
  for(let p = o; p; p = p.parent){ const u = p.userData; if(u.begehbar || u.keinKoerper || u.deko) return true; if(p === root) break; }
  return false;
}
function neuK(m, art, bb){
  const k = { m, art, box: bb.clone(), c: bb.getCenter(new THREE.Vector3()), inv: new THREE.Matrix4(), s: new THREE.Vector3(1, 1, 1), wb: new THREE.Box3() };
  const sz = bb.getSize(new THREE.Vector3());
  if(art === 'zyl'){ k.R = Math.max(sz.x, sz.z) / 2; k.hh = sz.y / 2; }
  if(art === 'kugel') k.R = Math.max(sz.x, sz.y, sz.z) / 2;
  return k;
}
const _b = new THREE.Box3(), _m4 = new THREE.Matrix4();
function koerperAus(root, form){
  root.updateMatrixWorld(true);
  if(form === 'kreis' || form === 'quader'){
    // eine Form um das ganze Objekt, in dessen eigenen Achsen
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), bb = new THREE.Box3();
    root.traverse(o => { if(!o.isMesh || ausgenommen(o, root)) return; o.geometry.computeBoundingBox();
      _m4.multiplyMatrices(inv, o.matrixWorld); bb.union(_b.copy(o.geometry.boundingBox).applyMatrix4(_m4)); });
    return bb.isEmpty() ? [] : [neuK(root, form === 'kreis' ? 'zyl' : 'box', bb)];
  }
  const liste = [];
  root.traverse(o => {
    if(!o.isMesh || ausgenommen(o, root)) return;
    const geo = o.geometry; if(!geo || !geo.attributes || !geo.attributes.position) return;
    geo.computeBoundingBox();
    const t = geo.type || '';
    if(/^Cylinder/.test(t)) liste.push(neuK(o, 'zyl', geo.boundingBox));
    else if(/^Sphere/.test(t)) liste.push(neuK(o, 'kugel', geo.boundingBox));
    else if(/^(Box|Plane|Circle|Shape|Ring|Cone|Torus)/.test(t)) liste.push(neuK(o, 'box', geo.boundingBox));
    else for(const b of scheiben(geo, o)) liste.push(neuK(o, 'box', b));
  });
  return liste;
}
// Frei geformtes Teil: laengs seiner laengsten Achse in Scheiben (~0,4 m), jede so gross wie das, was in ihr liegt.
// Die Dreiecke werden dafuer abgetastet (ein grosses Dreieck hat nur drei Ecken – die allein faenden die Mitte nicht).
const scheibenCache = new Map();
function scheiben(geo, mesh){
  const e = mesh.matrixWorld.elements, s = Math.max(Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10])) || 1;
  const bb = geo.boundingBox, sz = bb.getSize(new THREE.Vector3());
  const ax = sz.x >= sz.y && sz.x >= sz.z ? 'x' : (sz.y >= sz.z ? 'y' : 'z');
  const n = klemme(Math.ceil(sz[ax] * s / 0.4), 1, 24);
  const key = geo.uuid + ':' + n;
  if(scheibenCache.has(key)) return scheibenCache.get(key);
  if(n === 1){ const r = [bb.clone()]; scheibenCache.set(key, r); return r; }
  const boxen = Array.from({ length: n }, () => new THREE.Box3());
  const pos = geo.attributes.position, idx = geo.index, nTri = (idx ? idx.count : pos.count) / 3;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), p = new THREE.Vector3();
  const abst = sz[ax] / n / 2;                         // Tastabstand: halbe Scheibe
  for(let t = 0; t < nTri; t++){
    const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2);
    const kk = klemme(Math.ceil(Math.max(a.distanceTo(b), a.distanceTo(c), b.distanceTo(c)) / abst), 1, 24);
    for(let i = 0; i <= kk; i++) for(let j = 0; j <= kk - i; j++){
      p.copy(a).addScaledVector(b.clone().sub(a), i / kk).addScaledVector(c.clone().sub(a), j / kk);
      const sl = klemme(Math.floor((p[ax] - bb.min[ax]) / sz[ax] * n), 0, n - 1);
      boxen[sl].expandByPoint(p);
    }
  }
  const r = boxen.filter(x => !x.isEmpty());
  scheibenCache.set(key, r);
  return r;
}
function aktualisiereK(k){
  const mw = k.m.matrixWorld, e = mw.elements;
  k.inv.copy(mw).invert();
  k.s.set(Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10]));
  if(k.art === 'box') k.wb.copy(k.box).applyMatrix4(mw);
  else { const R = k.R, hh = k.art === 'zyl' ? k.hh : k.R;
    k.wb.min.set(k.c.x - R, k.c.y - hh, k.c.z - R); k.wb.max.set(k.c.x + R, k.c.y + hh, k.c.z + R); k.wb.applyMatrix4(mw); }
}
// Bewegliche Dinge einmal pro Bild nachfuehren, feste nur beim Anmelden
function aktualisiere(d, zwingen){
  if(!d.obj) return;
  if(!zwingen && (d.beweglich ? d.stand === bildNr : d.stand !== undefined)) return;
  d.stand = bildNr;
  if(d.beweglich || zwingen) d.obj.updateMatrixWorld(true);
  d.bb.makeEmpty();
  for(const k of d.koerper){ aktualisiereK(k); d.bb.union(k.wb); }
}
story.dingNeu = (d) => aktualisiere(d, true);      // nach dem Verschieben eines festen Dings
function aktiv(d){ return d.obj && d.obj.parent && !d.aus && (d.welt === '*' || d.welt === story.etappe) && locale === (d.ort || 'earth'); }

// ---- Abfrage: wie tief steckt eine Kugel / Saeule in den Grenzen? ---------------------------------------------
const _l = new THREE.Vector3(), _q = new THREE.Vector3(), _p = new THREE.Vector3();
// > 0 = steckt drin (m), <= 0 = frei (Abstand)
function eindringen(k, p, r){
  _l.copy(p).applyMatrix4(k.inv);
  if(k.art === 'kugel') return r - (_l.distanceTo(k.c) - k.R) * Math.max(k.s.x, k.s.y, k.s.z);
  if(k.art === 'zyl'){
    const dx = _l.x - k.c.x, dy = _l.y - k.c.y, dz = _l.z - k.c.z, rad = Math.hypot(dx, dz);
    if(rad <= k.R && Math.abs(dy) <= k.hh) return r + Math.min((k.R - rad) * Math.max(k.s.x, k.s.z), (k.hh - Math.abs(dy)) * k.s.y);
    const f = rad > k.R ? k.R / rad : 1;
    _q.set(k.c.x + dx * f, k.c.y + klemme(dy, -k.hh, k.hh), k.c.z + dz * f).applyMatrix4(k.m.matrixWorld);
    return r - _q.distanceTo(p);
  }
  const b = k.box;
  const qx = klemme(_l.x, b.min.x, b.max.x), qy = klemme(_l.y, b.min.y, b.max.y), qz = klemme(_l.z, b.min.z, b.max.z);
  if(qx === _l.x && qy === _l.y && qz === _l.z)
    return r + Math.min((_l.x - b.min.x) * k.s.x, (b.max.x - _l.x) * k.s.x, (_l.y - b.min.y) * k.s.y, (b.max.y - _l.y) * k.s.y,
                        (_l.z - b.min.z) * k.s.z, (b.max.z - _l.z) * k.s.z);
  _q.set(qx, qy, qz).applyMatrix4(k.m.matrixWorld);
  return r - _q.distanceTo(p);
}
// Saeule bei (x, z): Kugeln mit Radius r von fuss + stufe bis fuss + h. Rueckgabe: tiefste Eindringung.
function tiefe(x, z, fuss, h, r, stufe, ausser){
  if(stufe === undefined) stufe = STUFE;
  const y0 = fuss + stufe + r, y1 = Math.max(y0, fuss + h - r);
  const n = Math.max(1, Math.ceil((y1 - y0) / 0.3) + 1);
  let t = -Infinity;
  for(const d of dinge){
    if(d === ausser || !aktiv(d)) continue;
    aktualisiere(d);
    const bb = d.bb;
    if(x < bb.min.x - r || x > bb.max.x + r || z < bb.min.z - r || z > bb.max.z + r || y1 + r < bb.min.y || y0 - r > bb.max.y) continue;
    for(const k of d.koerper){
      const w = k.wb;
      if(x < w.min.x - r || x > w.max.x + r || z < w.min.z - r || z > w.max.z + r) continue;
      for(let i = 0; i < n; i++){
        const y = n === 1 ? y0 : y0 + (y1 - y0) * i / (n - 1);
        if(y + r < w.min.y || y - r > w.max.y) continue;
        const e = eindringen(k, _p.set(x, y, z), r);
        if(e > t) t = e;
      }
    }
  }
  return t;
}
story.tiefe = tiefe;
story.fuchsTiefe = (x, z) => tiefe(x, z, evaFootY(x, z), FUCHS.h, FUCHS.r, FUCHS.stufe);
// Schwimmen: gesperrt, wenn der Schritt tiefer in eine Grenze fuehrt (Orcas, Pfaehle, Boot) oder in ein Schiff
story.schwimmGesperrt = function(von, x, z){
  const f = von.y - SCHWIMMER.h / 2;
  const t = tiefe(x, z, f, SCHWIMMER.h, SCHWIMMER.r, 0);
  if(t > 0 && t > tiefe(von.x, von.z, f, SCHWIMMER.h, SCHWIMMER.r, 0) + 1e-6) return true;
  return typeof hitsSeaShip === 'function' && hitsSeaShip(x, von.y, z) && !hitsSeaShip(von.x, von.y, von.z);
};

// ---- Setzen: freier Platz, auf derselben Flaeche ------------------------------------------------------------
const _f = new THREE.Box3();
const ueber = (a, b) => a.min.x < b.max.x - 0.01 && a.max.x > b.min.x + 0.01 && a.min.y < b.max.y - 0.01 && a.max.y > b.min.y + 0.01 &&
                        a.min.z < b.max.z - 0.01 && a.max.z > b.min.z + 0.01;
function istIn(o, wurzel){ for(let p = o; p; p = p.parent) if(p === wurzel) return true; return false; }
function agenten(){
  const a = [];
  if(eva && eva.group){ const p = eva.group.position; a.push({ x: p.x, y: p.y, z: p.z, r: FIGUR.r, h: FIGUR.h }); }
  const f = story.fuchs;
  if(f && f.obj && f.obj.parent && f.aktiv){ const p = f.obj.position; a.push({ x: p.x, y: p.y, z: p.z, r: FUCHS.r, h: FUCHS.h }); }
  return a;
}
function bodenY(def, x, z, opt){
  if(opt.auf) return _f.setFromObject(opt.auf).max.y;
  if(opt.y !== undefined) return opt.y;
  if(def.untergrund === 'wasser') return 0;
  return evaFootY(x, z);
}
function untergrundOk(def, x, z){
  if(def.untergrund === 'egal') return true;
  if(def.untergrund === 'wasser') return isOpenWater(x, z);
  return evaSolid(x, z);
}
function stelleFrei(d, def, opt, x, z){
  const obj = d.obj;
  obj.position.set(x, bodenY(def, x, z, opt), z);
  obj.updateMatrixWorld(true);
  d.bb.makeEmpty(); for(const k of d.koerper){ aktualisiereK(k); d.bb.union(k.wb); }
  if(opt.fest) return true;
  if(opt.auf){ const f = _f.setFromObject(opt.auf);
    if(d.bb.min.x < f.min.x - 1e-3 || d.bb.max.x > f.max.x + 1e-3 || d.bb.min.z < f.min.z - 1e-3 || d.bb.max.z > f.max.z + 1e-3) return false; }
  else if(!untergrundOk(def, x, z)) return false;
  for(const e of dinge){
    if(!e.obj || !e.obj.parent || e.aus || (e.welt !== d.welt && e.welt !== '*')) continue;
    aktualisiere(e);
    if(!ueber(e.bb, d.bb)) continue;
    for(const k of e.koerper){
      if(opt.auf && istIn(k.m, opt.auf)) continue;              // die Ablage selbst traegt es nur
      if(!ueber(k.wb, d.bb)) continue;
      for(const m of d.koerper) if(ueber(k.wb, m.wb)) return false;
    }
  }
  if(d.welt === story.etappe) for(const a of agenten()){
    const b = d.bb;
    if(b.max.y > a.y + STUFE && b.min.y < a.y + a.h && b.min.x - a.r < a.x && b.max.x + a.r > a.x && b.min.z - a.r < a.z && b.max.z + a.r > a.z) return false;
  }
  return true;
}
function platziere(d, def, opt){
  const x0 = opt.x || 0, z0 = opt.z || 0;
  if(stelleFrei(d, def, opt, x0, z0)) return;
  // Ringe um den Wunschplatz, Schrittweite nach der Groesse des Objekts
  const sz = d.bb.getSize(new THREE.Vector3()), gross = Math.hypot(sz.x, sz.z) / 2;
  const schritt = klemme(gross / 3, 0.03, 0.5), weit = opt.weit || Math.max(3, gross * 4);
  let versuche = 0;
  for(let r = schritt; r <= weit && versuche < 900; r += schritt){
    const n = Math.max(8, Math.ceil(2 * Math.PI * r / schritt));
    for(let i = 0; i < n; i++, versuche++){
      const a = i / n * Math.PI * 2 + r;
      if(stelleFrei(d, def, opt, x0 + Math.cos(a) * r, z0 + Math.sin(a) * r)) return;
    }
  }
  console.warn('Kein freier Platz fuer', d.typ, '– bleibt an der gewuenschten Stelle');
  stelleFrei(d, def, Object.assign({}, opt, { fest: true }), x0, z0);
}
// Freier Platz fuer Joshi ('joshi') oder den Fuchs ('fuchs') bei (x, z): fester Boden, keine Grenze, nicht im anderen
story.freierPlatz = function(x, z, wer){
  const fuchs = wer === 'fuchs', M = fuchs ? FUCHS : FIGUR;
  const anderer = fuchs ? (eva && eva.group ? eva.group.position : null)
                        : (story.fuchs && story.fuchs.obj && story.fuchs.aktiv && story.fuchs.obj.parent ? story.fuchs.obj.position : null);
  const hits = story.hitsOhneDinge || hitsBuilding;
  const ok = (px, pz) => {
    if(!evaSolid(px, pz)) return false;
    if(fuchs && story.watGrund(px, pz) !== null) return false;
    const fy = evaFootY(px, pz);
    if(hits(px, fy + (fuchs ? 0.5 : 1), pz, false)) return false;
    if(tiefe(px, pz, fy, M.h, M.r, M.stufe) > 0) return false;
    if(anderer && Math.hypot(px - anderer.x, pz - anderer.z) < FIGUR.r + FUCHS.r + 0.1) return false;
    return true;
  };
  if(ok(x, z)) return { x, z };
  for(let r = 0.15; r <= 4; r += 0.15) for(let i = 0; i < 16; i++){
    const a = i / 16 * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
    if(ok(px, pz)) return { x: px, z: pz };
  }
  return { x, z };
};
// Pruefung fuer Tests: Bauteile einer Welt ohne Grenze und ohne Markierung (sollte leer sein)
story.pruefeWelt = function(n){
  const g = story.welt(n), erfasst = new Set(), offen = [];
  for(const d of dinge) if(d.obj) d.obj.traverse(o => erfasst.add(o));
  g.traverse(o => { if(!o.isMesh || erfasst.has(o)) return;
    for(let p = o; p; p = p.parent){ const u = p.userData; if(u.begehbar || u.keinKoerper || u.deko || u.agent) return; }
    offen.push((o.name || o.geometry.type) + ' @' + o.getWorldPosition(new THREE.Vector3()).toArray().map(v => v.toFixed(1)).join(',')); });
  return offen;
};
// Welt entsorgt -> ihre Dinge mit
const entsOrig = story.weltEntsorgen;
story.weltEntsorgen = function(n){ for(let i = dinge.length - 1; i >= 0; i--) if(dinge[i].welt === n) dinge.splice(i, 1); return entsOrig.apply(this, arguments); };

// ---- Orcas: Grenze, ueber Joshi/das Boot springen, die Schule begleitet eine Weile -----------------------------
// Live-Wunsch 16.10.: Schwimmt Joshi oder faehrt das Segelboot auf sie zu, springen die Springer darueber; die
// schwimmenden bleiben eine Weile in der Naehe (Kreis um Joshi/das Boot) und tauchen dann ab. Hindurch geht nicht
// (sie sind Dinge mit Grenze), und sie schwimmen umeinander herum.
const ORCA_BEGLEIT_R = 13;      // m: Kreis um Joshi bzw. das Boot
const ORCA_BEGLEIT_T = 25;      // s, dann taucht sie ab
const ORCA_KUEHL = 60;          // s Pause bis zum naechsten Begleiten / Sprung (Springer: 20 s)
const ORCA_MEIDE = 9;           // m: naeher kommt kein Orca an Joshi/das Boot heran (ausser im Sprung darueber)
const ORCA_ABSTAND = 11;        // m zwischen zwei Orcas an der Oberflaeche
const ORCA_DREH = 0.7;          // rad/s
const ORCA_UEBER = 3;           // m zusaetzliche Hoehe im Sprung ueber das Boot (wegen des Masts)
const ziel = { x: 0, z: 0, vx: 0, vz: 0, da: false, boot: false };
function zielNachfuehren(dt){
  let p = null, boot = false;
  if(eva && locale === 'earth'){
    const s = story.stegZustand;
    if(story.imBoot && story.imBoot() && s){ p = { x: s.bx, z: s.bz }; boot = true; }
    else if(story.schwimm && story.schwimm.aktiv) p = { x: eva.group.position.x, z: eva.group.position.z };
  }
  if(!p){ ziel.da = false; return; }
  if(ziel.da && dt > 1e-4){
    const k = Math.min(1, dt * 2);
    ziel.vx += (klemme((p.x - ziel.x) / dt, -6, 6) - ziel.vx) * k; ziel.vz += (klemme((p.z - ziel.z) / dt, -6, 6) - ziel.vz) * k;
  } else { ziel.vx = 0; ziel.vz = 0; }
  ziel.x = p.x; ziel.z = p.z; ziel.da = true; ziel.boot = boot;
}
function orcaVorher(dt){
  zielNachfuehren(dt);
  const tSchwimm = ORCA_JUMP_CYCLE - ORCA_RUNUP_T - ORCA_JUMP_T - ORCA_UNDER_T;   // davor schwimmt der Springer
  const vh = ORCA_JUMP_V * Math.cos(ORCA_JUMP_A);
  const tScheitel = ORCA_RUNUP_T + ORCA_JUMP_T / 2, wegScheitel = ORCA_SPD * ORCA_RUNUP_T + vh * ORCA_JUMP_T / 2;
  const w = 2 * Math.PI / ORCA_PERIOD;
  for(const o of orcas){
    if(!o.group || !o.placed || o.deep) continue;
    const st = o.jfg || (o.jfg = { modus: null, t: 0, kuehl: Math.random() * 8, seite: 1, ueber: 0 });
    st.kuehl -= dt;
    let soll = null, rate = ORCA_DREH;
    const dx = ziel.x - o.x, dz = ziel.z - o.z, d = Math.hypot(dx, dz) || 1e-3;
    if(o.jumper){
      if(st.modus === 'sprung'){
        if(o.t < tSchwimm - 0.5){ st.modus = null; st.kuehl = 20; }   // Zyklus herum: wieder schwimmen
        else {
          // Im Anlauf noch auf das Ziel nachzielen (es faehrt weiter), danach geradeaus. Die Engine laesst den Kurs
          // jedes Bild leicht wandern (Sinus, bis 0,1 rad/s – ueber 7 s Sprung bis zu 20 m daneben): vorab abziehen.
          const tj = o.t - tSchwimm;
          if(tj < ORCA_RUNUP_T - 0.3 && ziel.da){
            const rest = tScheitel - tj, ex = ziel.x + ziel.vx * rest - o.x, ez = ziel.z + ziel.vz * rest - o.z;
            st.kurs += klemme(wd(st.kurs, Math.atan2(-ex, -ez)), -0.5 * dt, 0.5 * dt);
          }
          o.heading = st.kurs - Math.sin(seaTime * 0.11 + o.x * 0.002) * 0.10 * dt;
          continue;
        }
      }
      if(ziel.da && st.kuehl <= 0 && d < 110 && o.t < tSchwimm){
        st.modus = 'anflug';
        o.t = Math.min(o.t, tSchwimm - 1);                            // nicht von selbst springen
        // dorthin, wo das Ziel zum Scheitel des Sprungs sein wird
        const ex = ziel.x + ziel.vx * tScheitel - o.x, ez = ziel.z + ziel.vz * tScheitel - o.z, e = Math.hypot(ex, ez);
        if(e < wegScheitel - 6) soll = Math.atan2(ex, ez);           // zu nah: erst Abstand gewinnen
        else {
          soll = Math.atan2(-ex, -ez);
          if(Math.abs(wd(o.heading, soll)) < 0.12 && e <= wegScheitel + 3){
            o.t = tSchwimm; st.modus = 'sprung'; st.kurs = soll; st.ueber = ziel.boot ? ORCA_UEBER : 0; continue;
          }
        }
      } else if(st.modus === 'anflug') st.modus = null;
    } else {
      // Schule: nur oben (Phase am Scheitel) anfangen, sonst schnappte sie aus 7 m Tiefe hoch
      const p = 0.5 - 0.5 * Math.cos(o.t * w + o.x * 0.01);
      if(st.modus !== 'begleit' && ziel.da && st.kuehl <= 0 && d < 90 && p < 0.08){
        st.modus = 'begleit'; st.t = ORCA_BEGLEIT_T * (0.8 + Math.random() * 0.5); st.seite = Math.random() < 0.5 ? 1 : -1;
      }
      if(st.modus === 'begleit'){
        st.t -= dt;
        if(!ziel.da || st.t <= 0 || d > 120){ st.modus = null; st.kuehl = ORCA_KUEHL; }   // abtauchen: die Phase laeuft weiter
        else {
          const ux = -dx / d, uz = -dz / d;                          // vom Ziel zum Orca
          const k = klemme((ORCA_BEGLEIT_R - d) / ORCA_BEGLEIT_R, -1, 1) * 1.5;
          const rx = -uz * st.seite + ux * k, rz = ux * st.seite + uz * k;
          soll = Math.atan2(-rx, -rz);
          // oben bleiben: Phase so stellen, dass die Engine nach ihrem o.t += dt genau die Oberflaeche rechnet
          const t = (-o.x * 0.01) / w - dt;
          o.t = ((t % ORCA_PERIOD) + ORCA_PERIOD) % ORCA_PERIOD;
        }
      }
    }
    // Ausweichen: Joshi/das Boot nie rammen ...
    if(ziel.da && d < ORCA_MEIDE){ soll = Math.atan2(dx, dz); rate = 1.4; }
    if(soll !== null) o.heading += klemme(wd(o.heading, soll), -rate * dt, rate * dt);
    // ... und umeinander herum (nur wer an der Oberflaeche ist; die Tiefsee-Tiere ziehen weit darunter)
    const fx = -Math.sin(o.heading), fz = -Math.cos(o.heading);
    for(const q of orcas){
      if(q === o || !q.group || q.deep) continue;
      const ax = q.x - o.x, az = q.z - o.z;
      if(Math.hypot(ax, az) < ORCA_ABSTAND && ax * fx + az * fz > 0) o.heading += (fz * ax - fx * az > 0 ? -1 : 1) * 1.0 * dt;
    }
  }
}
function orcaNachher(){
  const tSchwimm = ORCA_JUMP_CYCLE - ORCA_RUNUP_T - ORCA_JUMP_T - ORCA_UNDER_T;
  for(const o of orcas){
    if(!o.group) continue;
    const st = o.jfg;
    if(st && st.modus === 'sprung' && st.ueber){
      const tf = o.t - tSchwimm - ORCA_RUNUP_T;
      if(tf > 0 && tf < ORCA_JUMP_T) o.group.position.y += st.ueber * Math.sin(Math.PI * tf / ORCA_JUMP_T);
    }
    if(!o.group.userData.ding) ding(o.group, { welt: '*', beweglich: true, orca: true, typ: 'orca' });
  }
  for(let i = dinge.length - 1; i >= 0; i--) if(dinge[i].orca && !dinge[i].obj.parent) dinge.splice(i, 1);   // clearOrcas
}

// ---- Jedes Bild: Zaehler, Schiffe schieben Schwimmer und Boot beiseite --------------------------------------------
const _sb = { x: 0, z: 0 };
story.updateObjekte = function(dt){
  bildNr++;
  if(locale !== 'earth' || typeof pushOutOfSeaShip !== 'function') return;
  // Ein Rumpf schiebt hinaus, statt dass man in ihm feststeckt (wie die Engine es fuer ihre Boote macht)
  if(eva && story.schwimm && story.schwimm.aktiv) pushOutOfSeaShip(eva.group.position, null, dt);
  const s = story.stegZustand;
  if(s && s.boot && s.imBoot){ _sb.x = s.bx; _sb.z = s.bz; pushOutOfSeaShip(_sb, null, dt); s.bx = _sb.x; s.bz = _sb.z; }
};

// ---- Einhaengen: als AEUSSERSTE Huelle um hitsBuilding (nach allen anderen Hooks, also zum Start) ----------------
function hookAussen(){
  const hitsOrig = hitsBuilding;
  story.hitsOhneDinge = function(){ return hitsOrig.apply(this, arguments); };
  hitsBuilding = function(x, y, z){
    if(locale === 'earth' && dinge.length){
      const von = story.schrittVon && story.schrittVon();
      if(von){
        // Joshis eigener Schritt: die Engine fragt 1 m ueber den Fuessen. Wer schon drinsteckt, darf hinaus.
        const luft = story.figurInLuft && story.figurInLuft() ? SPRUNG : 0;
        const t = tiefe(x, z, y - 1 + luft, FIGUR.h, FIGUR.r, FIGUR.stufe);
        if(t > 0 && t > tiefe(von.x, von.z, evaFootY(von.x, von.z) + luft, FIGUR.h, FIGUR.r, FIGUR.stufe) + 1e-6) return true;
      } else if(tiefe(x, z, y - 1, FIGUR.h, FIGUR.r) > 0) return true;     // alle anderen (Kamera, Engine): Saeule um y
    }
    return hitsOrig.apply(this, arguments);
  };
  const orcaOrig = updateOrcas;
  updateOrcas = function(dt){
    if(locale === 'earth' && orcas.length) orcaVorher(dt);
    const r = orcaOrig.apply(this, arguments);
    orcaNachher();
    return r;
  };
}
const startVorher = window.STORY_START;
window.STORY_START = function(){ hookAussen(); if(startVorher) return startVorher.apply(this, arguments); };
})();
