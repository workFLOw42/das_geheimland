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
//   auf:        Ablage (Mesh, z. B. die Tischplatte): es liegt darauf und rueckt auf ihr zur Seite, nie auf den Boden
//   in:         Gruppe, in die es gehaengt wird (Standard: die Welt); x, z bleiben trotzdem Weltkoordinaten
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
// Live-Befund 19.10.2026 (in Trip to Japan: beim Absprung aus der C-400 fror das Bild ein):
// userData.ding zeigt mit d.obj auf das Objekt selbst zurueck – ein Kreis. three.js kopiert userData beim clone() per
// JSON.stringify, und das lief in "Maximum call stack size exceeded" (finale.js abspringen: planeGroup.clone). Darum steht
// ding NICHT aufzaehlbar in userData: lesen geht wie bisher (obj.userData.ding), JSON und clone() sehen es nicht.
function dingSetzen(obj, d){ Object.defineProperty(obj.userData, 'ding', { value: d, writable: true, configurable: true, enumerable: false }); }function setze(name, weltN, opt){
  opt = opt || {};
  const def = katalog.get(name);
  const d = { typ: name, welt: weltN, obj: null, koerper: [], bb: new THREE.Box3(), beweglich: !!(def && def.beweglich), aus: false };
  if(!def){ console.warn('Unbekannter Objekttyp – erst mit story.typ definieren:', name); d.bereit = Promise.resolve(d); return d; }
  const fertig = (obj) => {
    if(!obj) return d;
    (opt.in || story.welt(weltN)).add(obj);
    obj.rotation.y = opt.dreh || 0;
    d.obj = obj; dingSetzen(obj, d);
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
  dingSetzen(obj, d); dinge.push(d); aktualisiere(d, true);
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
  // Fertig gemessene Grenzen (Engine: xwGrenzenMessen, _grenzen) – fuer Modelle, deren Rohgeometrie nicht die sichtbare
  // Form ist. Der X-Wing T-65 ist ein SkinnedMesh mit hochkant liegender Ruhepose: aus seiner Geometrie stand die Grenze
  // senkrecht in der Luft, man lief durch ihn hindurch (Live-Befund 20.10.2026). Seine Meshes zaehlen dann nicht.
  const gemessen = [];
  root.traverse(o => { if(o._grenzen && o._grenzen.length) gemessen.push(o); });
  for(const g of gemessen) for(const b of g._grenzen) liste.push(neuK(g, 'box', b));
  const unterGemessen = (o) => { for(let q = o; q; q = q.parent) if(gemessen.includes(q)) return true; return false; };
  root.traverse(o => {
    if(!o.isMesh || ausgenommen(o, root) || (gemessen.length && unterGemessen(o))) return;
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
story.dingNeu = (d) => aktualisiere(d, true);
// Ding aus der Welt nehmen (z. B. in den Rucksack gesteckt): Grenze weg, Objekt bleibt dem Aufrufer
story.entferne = function(d){ const i = dinge.indexOf(d); if(i >= 0) dinge.splice(i, 1); if(d.obj && d.obj.parent) d.obj.parent.remove(d.obj); };      // nach dem Verschieben eines festen Dings
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
const _w = new THREE.Vector3();
function stelleFrei(d, def, opt, x, z){
  const obj = d.obj;
  // x, z (und die Hoehe) sind Weltkoordinaten – liegt das Objekt in einer Untergruppe (opt.in, z. B. auf dem Tisch im
  // Raum), wird in deren Koordinaten umgerechnet
  _w.set(x, bodenY(def, x, z, opt), z);
  obj.parent.updateMatrixWorld(true); obj.position.copy(obj.parent.worldToLocal(_w));
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
    if(fuchs && story.watGrund(px, pz) !== null && !(story.aufSteg && story.aufSteg(px, pz))) return false;   // oben auf dem Steg gilt die Watzone darunter nicht
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
// Live-Wunsch 19.10.: "ich bemerke keine" (gemessen: die 3 Tiefsee-Tiere der Engine ziehen auf -11 m fuers U-Boot, das es
// hier nicht gibt; von den 3 anderen sprang einer, und alle schwammen 150-200 m hinter den Steg) – mehr Orcas, alle an der
// Oberflaeche, feste Springer, und sie bleiben in Sichtweite. Dazu springt ab und zu einer ueber das Boot am Steg (wie in
// der Skizze), wenn Joshi in der Naehe ist.
const ORCA_EXTRA = 3;           // zu den 6 der Engine
const ORCA_SPRINGER = 4;        // so viele davon springen (fest, die Engine wuerfelt beim Umsetzen neu)
// (Abstand zum Ufer: seit 22.10.2026 nach der Wassertiefe der Engine – wasserTiefe, ORCA_TIEF_MIN –, nicht mehr nach einem
// Radius um die Inselmitte; der passte nur zu einer Inselgroesse)
const ORCA_REVIER = 80;         // m: weiter weg von Joshi/dem Boot schwimmt er zurueck
const STEG_NAH = 50;            // m: so nah muss Joshi am liegenden Boot sein
const STEG_ERST = 15, STEG_PAUSE = 60;   // s bis zum ersten Sprung, danach 60-90 s
const STEG_KURS = Math.PI / 2 + 0.2;     // quer zum Blick vom Strand wie in der Skizze (dort + 0,3; so beginnt der Anlauf
                                         // 60 m vor dem Boot noch im Wasser und nicht am Ufer)
const STEG_SCHEITEL = { dx: 1.0, dz: 1.5 };   // Scheitel etwas hinter dem Boot (vom Strand aus)
const stegSprung = { t: STEG_ERST };
story.stegSprungT = () => +stegSprung.t.toFixed(1);   // Test: Countdown bis zum naechsten Sprung ueber das Boot
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
// ---- Begleitwal beim Segeln (Live-Wunsch 22.10.2026) -----------------------------------------------------------------
// Er schwimmt leicht vor Joshi (BOOT_BEGLEIT_VOR) auf der Seite des Bootes, auf der bis zum Bildrand mehr Platz ist
// (BOOT_BEGLEIT_SEITE daneben). Lenkt Joshi auf ihn zu, taucht er ab und auf der anderen Seite wieder auf.
const BOOT_BEGLEIT_T = 60, BOOT_BEGLEIT_VOR = 9, BOOT_BEGLEIT_SEITE = 13;   // s, m vor dem Bug, m neben dem Kurs
const BOOT_HOLEN = 4;            // s im Boot, dann wird ein Begleiter geholt
const bootHolen = { t: 0 };
const _bv = new THREE.Vector3(), _cr = new THREE.Vector3();
function bootBegleit(o, st, dt, p, w){
  const B = story.stegZustand, bfx = Math.sin(B.yaw), bfz = Math.cos(B.yaw);
  // Seite: das Boot steht im Bild links -> mehr Platz rechts (Hysterese: nur alle 3 s und nicht, wenn es mittig steht)
  st.seiteT = (st.seiteT || 0) - dt;
  if(!st.seiteW || (st.seiteT <= 0 && !st.taucht)){
    _bv.set(B.bx, seaYAt(B.bx, B.bz), B.bz).project(camera); _cr.setFromMatrixColumn(camera.matrixWorld, 0);   // global-ok: Engine
    let sx = _cr.x, sz = _cr.z; const df = sx * bfx + sz * bfz; sx -= df * bfx; sz -= df * bfz; const l = Math.hypot(sx, sz) || 1;
    const s = st.seiteW && Math.abs(_bv.x) < 0.1 ? st.seiteS : (_bv.x < 0 ? 1 : -1);
    st.seiteS = s; st.seiteW = [sx / l * s, sz / l * s]; st.seiteT = 3;
  }
  // faehrt Joshi auf ihn zu: abtauchen, die Seite wechseln
  const rx = o.x - B.bx, rz = o.z - B.bz, rd = Math.hypot(rx, rz) || 1;
  if(!st.taucht && rd < 24 && Math.abs(B.v) > 0.4 && (rx * bfx + rz * bfz) / rd > Math.cos(0.5)){ st.taucht = 0.001; st.seiteS = -st.seiteS; st.seiteW = [-st.seiteW[0], -st.seiteW[1]]; st.seiteT = 6; }
  // Platz neben dem Boot – ist es dort zu flach, die andere Seite; sind beide zu flach, bleibt er unten (taucht wieder auf,
  // sobald es tief genug ist)
  let tx = B.bx + bfx * BOOT_BEGLEIT_VOR + st.seiteW[0] * BOOT_BEGLEIT_SEITE, tz = B.bz + bfz * BOOT_BEGLEIT_VOR + st.seiteW[1] * BOOT_BEGLEIT_SEITE;
  if(wasserTiefe(tx, tz) < ORCA_TIEF_MIN){
    const ux = B.bx + bfx * BOOT_BEGLEIT_VOR - st.seiteW[0] * BOOT_BEGLEIT_SEITE, uz = B.bz + bfz * BOOT_BEGLEIT_VOR - st.seiteW[1] * BOOT_BEGLEIT_SEITE;
    if(wasserTiefe(ux, uz) >= ORCA_TIEF_MIN){ st.seiteS = -st.seiteS; st.seiteW = [-st.seiteW[0], -st.seiteW[1]]; st.seiteT = 4; tx = ux; tz = uz; }
    else if(!st.taucht) st.taucht = 0.001;
  }
  const ex = tx - o.x, ez = tz - o.z, ed = Math.hypot(ex, ez);
  // mithalten: die Engine schwimmt mit ORCA_SPD (wie das Boot); liegt der Platz voraus, etwas schneller – unter Wasser mehr
  const vor = ex * -Math.sin(o.heading) + ez * -Math.cos(o.heading), plus = klemme(vor * 0.3, 0, st.taucht ? 4 : 2);
  o.x += -Math.sin(o.heading) * plus * dt; o.z += -Math.cos(o.heading) * plus * dt;
  // Tiefe: an der Oberflaeche – ausser beim Abtauchen: zuegig hinunter (Phase schneller), dann frei wieder auf (ORCA_PERIOD);
  // wieder oben erst, wo es tief genug ist. Solange er unten ist, faehrt das Boot ueber ihn hinweg (Grenze aus)
  if(st.taucht){ st.taucht += dt; if(p < 0.6) o.t += dt * 2.5;
    if(st.taucht > 3 && p < 0.06 && wasserTiefe(o.x, o.z) >= ORCA_TIEF_MIN) st.taucht = 0; }
  else { const t = (-o.x * 0.01) / w - dt; o.t = ((t % ORCA_PERIOD) + ORCA_PERIOD) % ORCA_PERIOD; }
  const dg = o.group && o.group.userData.ding; if(dg) dg.aus = !!st.taucht && p > 0.25;
  return ed > 4 ? Math.atan2(-ex, -ez) : Math.atan2(-bfx, -bfz);   // zum Platz, dort mit dem Kurs des Bootes
}
// Das Segelboot an die Engine melden (Tiere weichen ihm aus, booteAufDemWasser): nur wenn Joshi drin sitzt
window.spielBoote = function(){ const B = story.stegZustand; if(!B || !B.imBoot || locale !== 'earth') return null;   // global-ok: Engine
  return [{ x: B.bx, z: B.bz, fx: Math.sin(B.yaw), fz: Math.cos(B.yaw), v: Math.abs(B.v) }]; };
function orcaVorher(dt){
  zielNachfuehren(dt);
  const tSchwimm = ORCA_JUMP_CYCLE - ORCA_RUNUP_T - ORCA_JUMP_T - ORCA_UNDER_T;   // davor schwimmt der Springer
  const vh = ORCA_JUMP_V * Math.cos(ORCA_JUMP_A);
  const tScheitel = ORCA_RUNUP_T + ORCA_JUMP_T / 2, wegScheitel = ORCA_SPD * ORCA_RUNUP_T + vh * ORCA_JUMP_T / 2;
  const w = 2 * Math.PI / ORCA_PERIOD;
  const tUnter = tSchwimm + ORCA_RUNUP_T + ORCA_JUMP_T;                          // ab hier unter Wasser
  const B = story.stegZustand, jo = eva && !(story.innen && story.innen.drin) ? eva.group.position : null;
  const stegBereit = !!(jo && B && B.boot && !B.imBoot && Math.hypot(jo.x - B.bx, jo.z - B.bz) < STEG_NAH);
  if(stegBereit) stegSprung.t -= dt; else stegSprung.t = Math.max(stegSprung.t, STEG_ERST);
  if(stegBereit && stegSprung.t <= 0 && !orcas.some(o => o.jfg && o.jfg.modus === 'steg')){
    // Ein Springer, der gerade tief unter Wasser ist (4-6 m, nachts unsichtbar), wird an den Anfang der Bahn gesetzt: noch
    // 1,5 s auftauchen, 7 s an der Oberflaeche heranschwimmen (Heckwelle), Anlauf, Sprung – Scheitel genau ueber dem Boot.
    const o = orcas.find(q => q.group && q.placed && q.jumper && q.jfg && !q.jfg.modus && q.t > tUnter + 0.3 * ORCA_UNDER_T && q.t < tUnter + 0.75 * ORCA_UNDER_T);
    if(o){
      o.t = tUnter + 0.75 * ORCA_UNDER_T;
      const fx = -Math.sin(STEG_KURS), fz = -Math.cos(STEG_KURS);
      const weg = ORCA_SPD * (ORCA_JUMP_CYCLE - o.t + tSchwimm) + wegScheitel;
      o.x = B.bx + STEG_SCHEITEL.dx - fx * weg; o.z = B.bz + STEG_SCHEITEL.dz - fz * weg; o.heading = STEG_KURS; o.spur = null;
      Object.assign(o.jfg, { modus: 'steg', kurs: STEG_KURS, ueber: ORCA_UEBER, flog: false });
      o.sprungGeplant = true;                                       // Engine orcaSprungFrei: dieser Sprung ist gewollt (ueber das Boot am Steg)
      stegSprung.t = STEG_PAUSE + Math.random() * 30;
    }
  }
  // Im Boot schnell einen Begleiter (Live-Befund 22.10.2026: er kam erst nach 15-20 s von weit her): sitzt Joshi BOOT_HOLEN s im
  // Boot und keiner begleitet ihn, wird ein Wal der Schule, der gerade tief unten ist, unter Wasser neben das Boot gesetzt – er
  // taucht dort auf
  bootHolen.t = ziel.da && ziel.boot ? bootHolen.t + dt : 0;
  if(bootHolen.t > BOOT_HOLEN && !orcas.some(q => q.jfg && q.jfg.modus === 'begleit')){
    const kand = orcas.find(q => q.group && q.placed && !q.jumper && !q.deep && q.jfg && !q.jfg.modus && (0.5 - 0.5 * Math.cos(q.t * w + q.x * 0.01)) > 0.6);
    const B = story.stegZustand;
    if(kand && B){ const bfx = Math.sin(B.yaw), bfz = Math.cos(B.yaw);
      for(const s of [1, -1]){ const x = B.bx + bfx * 14 + bfz * 18 * s, z = B.bz + bfz * 14 - bfx * 18 * s;   // vor dem Boot: bis er oben ist, ist es heran
        if(wasserTiefe(x, z) < ORCA_TIEF_MIN + 3) continue;
        const ph = kand.t * w + kand.x * 0.01; kand.x = x; kand.z = z; kand.t = (ph - kand.x * 0.01) / w;   // gleiche Phase (bleibt unten)
        kand.heading = Math.atan2(-bfx, -bfz); kand.jfg.kuehl = 0; bootHolen.t = 0; break; } }
  }
  for(const o of orcas){
    if(!o.group || !o.placed || o.deep) continue;
    const st = o.jfg || (o.jfg = { modus: null, t: 0, kuehl: Math.random() * 8, seite: 1, ueber: 0 });
    st.kuehl -= dt;
    if(st.modus === 'steg'){
      // Kurs halten (die Engine laesst ihn sonst wandern, siehe unten bei 'sprung'); nach dem Eintauchen wieder frei
      if(o.t > tSchwimm + ORCA_RUNUP_T && o.t < tUnter) st.flog = true;
      else if(st.flog && o.t >= tUnter){ st.modus = null; st.kuehl = 20; o.sprungGeplant = false; }
      o.heading = st.kurs - Math.sin(seaTime * 0.11 + o.x * 0.002) * 0.10 * dt;
      continue;
    }
    let soll = null, rate = ORCA_DREH;
    const dx = ziel.x - o.x, dz = ziel.z - o.z, d = Math.hypot(dx, dz) || 1e-3;
    // frei springend (Engine-Sprung, nicht ueber Joshi/das Boot): vom Anlauf bis zum Auftauchen den Kurs nicht anfassen –
    // die Engine hat die Strecke vorher geprueft (orcaSprungFrei), ein Drehen mitten im Sprung sah komisch aus
    if(o.jumper && o.t >= tSchwimm && st.modus !== 'sprung'){ continue; }
    if(o.jumper){
      if(st.modus === 'sprung'){
        if(o.t < tSchwimm - 0.5){ st.modus = null; st.kuehl = 20; o.sprungGeplant = false; }   // Zyklus herum: wieder schwimmen
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
          // springen nur, wenn Anlauf, Flug und Landung passen (Engine orcaSprungFrei: Landung in mindestens ORCA_TIEF_MIN)
          if(Math.abs(wd(o.heading, soll)) < 0.12 && e <= wegScheitel + 3 && orcaSprungFrei(o)){
            o.t = tSchwimm; st.modus = 'sprung'; st.kurs = soll; st.ueber = ziel.boot ? ORCA_UEBER : 0; o.sprungGeplant = true; continue;
          }
        }
      } else if(st.modus === 'anflug') st.modus = null;
    } else {
      // Schule: nur oben (Phase am Scheitel) anfangen, sonst schnappte sie aus 7 m Tiefe hoch
      const p = 0.5 - 0.5 * Math.cos(o.t * w + o.x * 0.01);
      // im Segelboot begleitet ihn nur EIN Wal (bootBegleit); beim Schwimmen wie bisher die Schule
      if(st.modus !== 'begleit' && ziel.da && st.kuehl <= 0 && d < 90 && p < 0.08 && !(ziel.boot && orcas.some(q => q.jfg && q.jfg.modus === 'begleit'))){
        st.modus = 'begleit'; st.t = (ziel.boot ? BOOT_BEGLEIT_T : ORCA_BEGLEIT_T) * (0.8 + Math.random() * 0.5); st.seite = Math.random() < 0.5 ? 1 : -1; st.taucht = 0; st.seiteW = null;
      }
      if(st.modus === 'begleit'){
        st.t -= dt;
        if(!ziel.da || st.t <= 0 || d > 120){ st.modus = null; st.kuehl = ORCA_KUEHL; }   // abtauchen: die Phase laeuft weiter
        else if(ziel.boot){ soll = bootBegleit(o, st, dt, p, w); rate = 1.2; }
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
    if(st.modus === 'begleit' && ziel.boot) o.sprungGeplant = true;   // die Engine laesst ihn (kein Ausweichen vor dem Boot)
    else if(o.sprungGeplant && !st.modus) o.sprungGeplant = false;
    // ... und in Sichtweite bleiben: nicht ans Ufer, nicht weit weg von Joshi bzw. dem Boot
    if(soll === null && jo){
      const px = ziel.da ? ziel.x : jo.x, pz = ziel.da ? ziel.z : jo.z;
      // vor zu flachem Wasser (wasserTiefe) dreht die Engine selbst ab; hier nur: nicht zu weit weg von Joshi bzw. dem Boot
      if(Math.hypot(px - o.x, pz - o.z) > ORCA_REVIER) soll = Math.atan2(o.x - px, o.z - pz);
    }
    // nie ins Flache lenken (Live-Befund 22.10.2026: Begleiter und Anflug zogen die Orcas zu Joshi ans Ufer): fuehrt der
    // gewuenschte Kurs ins Flache, lenkt hier keiner – die Engine dreht dann selbst ab
    if(soll !== null && !(st.modus === 'begleit' && ziel.boot) && wasserTiefe(o.x - Math.sin(soll) * 25, o.z - Math.cos(soll) * 25) < ORCA_TIEF_MIN){ soll = null; if(st.modus === 'begleit' || st.modus === 'anflug'){ st.modus = null; st.kuehl = 8; } }
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
// Die Herde der Engine (gerade gesetzt) um ORCA_EXTRA ergaenzen und die Rollen fest verteilen
function mehrOrcas(){
  const F = worldFocus();
  for(let i = 0; i < ORCA_EXTRA; i++){
    const o = { group: null, mixer: null, x: 0, z: 0, heading: 0, t: 0, jumper: false, y: 0, pitch: 0, placed: false,
                deep: false, band: 0, deepY: 0, jfgExtra: true };
    o.placed = placeOrca(o, F.x, F.z);
    if(o.placed) buildOrcaBody(o);
    orcas.push(o);
  }
  orcas.forEach((o, i) => {
    o.jfgSpringer = i % 2 === 0 && i / 2 < ORCA_SPRINGER;
    o.deep = false; o.jumper = o.jfgSpringer; o.t = Math.random() * (o.jumper ? ORCA_JUMP_CYCLE : ORCA_PERIOD);
  });
}
function orcaNachher(){
  const tSchwimm = ORCA_JUMP_CYCLE - ORCA_RUNUP_T - ORCA_JUMP_T - ORCA_UNDER_T;
  if(orcas.length && !orcas.some(o => o.jfgExtra)) mehrOrcas();                   // auch nach clearOrcas (neue Herde)
  for(const o of orcas){
    if(o.jfgSpringer !== undefined){ o.deep = false; o.jumper = o.jfgSpringer; }   // placeOrca wuerfelt beim Umsetzen neu
    if(!o.group) continue;
    const st = o.jfg;
    if(st && (st.modus === 'sprung' || st.modus === 'steg') && st.ueber){
      const tf = o.t - tSchwimm - ORCA_RUNUP_T;
      if(tf > 0 && tf < ORCA_JUMP_T) o.group.position.y += st.ueber * Math.sin(Math.PI * tf / ORCA_JUMP_T);
    }
    if(!o.group.userData.ding) ding(o.group, { welt: '*', beweglich: true, orca: true, typ: 'orca' });
  }
  for(let i = dinge.length - 1; i >= 0; i--) if(dinge[i].orca && !dinge[i].obj.parent) dinge.splice(i, 1);   // clearOrcas
}

// ---- Jedes Bild: Zaehler, Schiffe schieben Schwimmer und Boot beiseite --------------------------------------------
const _sb = { x: 0, y: 0, z: 0 };                       // Segelboot an der Oberflaeche (Hoehe fuer die 3D-Form der Schiffe)
// ---- Meer nur, wenn man auf dem Meer ist (Live-Befund 22.10.2026, Waldinsel) ---------------------------------------------
// Gemessen auf der Waldinsel: 10 grosse Schiffe 1,5-2,4 km draussen = 211.000 Dreiecke (40 % von allem), dazu 437 Objekte der
// Unterwasser-Zellen – waehrend Joshi an Land steht. Und ein U-Boot-Turm ragte hinter den Baeumen auf, als stuende er im Wald.
// Jetzt: die Schiffe nur, wenn Joshi segelt, schwimmt oder fliegt, und nie naeher als SCHIFF_ABSTAND am Inselrand; die
// Unterwasser-Zellen nur beim Schwimmen und im Boot. Gerechnet werden beide weiter (nur nicht gezeichnet).
const SCHIFF_ABSTAND = 400;
function meerSichtbar(){
  const aufSee = !eva || (story.imBoot && story.imBoot()) || !!(story.schwimm && story.schwimm.aktiv);
  const imWasser = (story.imBoot && story.imBoot()) || !!(story.schwimm && story.schwimm.aktiv);
  const i = islandInfo(0, 0), rand = i ? i.radius * BEACH_FACTOR : 0;         // global-ok: Engine
  for(const sh of seaShips){ if(!sh.group) continue;                         // global-ok: Engine
    const weit = !i || Math.hypot(sh.x - i.wx, sh.z - i.wz) - rand > SCHIFF_ABSTAND + (sh.hl || 0);
    const soll = aufSee && weit; if(sh.group.visible !== soll) sh.group.visible = soll; }
  if(typeof uwCells !== 'undefined') for(const [, u] of uwCells){ const g = u && (u.isObject3D ? u : u.group); if(g && g.visible !== imWasser) g.visible = imWasser; }   // global-ok: Engine
}
story.updateObjekte = function(dt){
  bildNr++;
  if(locale === 'earth') meerSichtbar();
  if(locale !== 'earth' || typeof pushOutOfSeaShip !== 'function') return;
  // Ein Rumpf schiebt hinaus, statt dass man in ihm feststeckt (wie die Engine es fuer ihre Boote macht)
  if(eva && story.schwimm && story.schwimm.aktiv) pushOutOfSeaShip(eva.group.position, null, dt);
  const s = story.stegZustand;
  if(s && s.boot && s.imBoot){ _sb.x = s.bx; _sb.z = s.bz; pushOutOfSeaShip(_sb, null, dt); s.bx = _sb.x; s.bz = _sb.z; }
};

// ---- Einhaengen: als AEUSSERSTE Huelle um hitsBuilding (nach allen anderen Hooks, also zum Start) ----------------
// Auf dem Mond fragt die Engine hitsBuilding beim Laufen nicht (updateEva: nur in der Erdwelt) – dort sperren die Dinge ueber
// evaSolid (mond.js), mit derselben Regel wie unten: nur Joshis eigener Schritt, wer schon drinsteckt, darf hinaus
// (Live-Befund 29.10.2026: durch den Holzscheit auf dem Mond lief man hindurch)
story.dingSperrt = function(x, z){
  if(!dinge.length) return false; const von = story.schrittVon && story.schrittVon(); if(!von) return false;
  const luft = story.figurInLuft && story.figurInLuft() ? SPRUNG : 0, f0 = Math.max(evaFootY(von.x, von.z), von.y) + luft;
  const t = tiefe(x, z, f0, FIGUR.h, FIGUR.r, FIGUR.stufe);
  return t > 0 && t > tiefe(von.x, von.z, f0, FIGUR.h, FIGUR.r, FIGUR.stufe) + 1e-6;
};
function hookAussen(){
  const hitsOrig = hitsBuilding;
  story.hitsOhneDinge = function(){ return hitsOrig.apply(this, arguments); };
  hitsBuilding = function(x, y, z){
    if(locale === 'earth' && dinge.length){
      const von = story.schrittVon && story.schrittVon();
      if(von){
        // Joshis eigener Schritt: die Engine fragt 1 m ueber den Fuessen. Wer schon drinsteckt, darf hinaus.
        const luft = story.figurInLuft && story.figurInLuft() ? SPRUNG : 0;
        // Fusshoehe: die hoehere von "da, wo er steht" und "Boden dort". An einer Kante (Steg) liegt der Boden dahinter
        // tief im Wasser – von dort gesehen waere der Traeger unter dem Steg eine Wand, und er bliebe oben haengen
        // (Live-Regression: vom Steg seitlich ins Wasser ging nicht mehr). Er steht aber oben und tritt ueber die Kante.
        const fuss = Math.max(y - 1, von.y) + luft;
        const t = tiefe(x, z, fuss, FIGUR.h, FIGUR.r, FIGUR.stufe);
        if(t > 0 && t > tiefe(von.x, von.z, Math.max(evaFootY(von.x, von.z), von.y) + luft, FIGUR.h, FIGUR.r, FIGUR.stufe) + 1e-6) return true;
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
  // Strandleben der Engine (Seeloewen am Strand, Forellen im Flachwasser): Seeloewen bekommen wie die Orcas eine Grenze, die mit
  // ihnen wandert (Joshi laeuft nicht durch sie hindurch), Forellen sind Deko (sie schwimmen weg, wie die Moewen fliegen).
  if(typeof updateStrandleben === 'function'){
    const strandOrig = updateStrandleben;
    updateStrandleben = function(dt){
      const r = strandOrig.apply(this, arguments);
      for(const t of strandleben.loewen) if(!t.obj.userData.ding) ding(t.obj, { welt: '*', beweglich: true, orca: true, typ: t.art });
      // Rochen: ebenso eine Grenze (Live-Wunsch 22.10.2026: man schwimmt nicht durch die Tiere hindurch) – aus, solange er
      // nicht zu sehen ist (die Engine blendet ihn aus, bevor sie ihn neu setzt; sonst sperrte er an der alten Stelle)
      for(const r of strandleben.rochen){ if(!r.obj.userData.ding) ding(r.obj, { welt: '*', beweglich: true, orca: true, typ: 'rochen' });
        const dr = r.obj.userData.ding; if(dr) dr.aus = !r.obj.visible; }
      for(const g of strandleben.forellen) for(const f of g.fische) f.obj.userData.deko = true;
      for(let i = dinge.length - 1; i >= 0; i--) if(dinge[i].orca && !dinge[i].obj.parent) dinge.splice(i, 1);   // clearStrandleben
      return r;
    };
  }
}
const startVorher = window.STORY_START;
window.STORY_START = function(){ hookAussen(); if(startVorher) return startVorher.apply(this, arguments); };
})();
