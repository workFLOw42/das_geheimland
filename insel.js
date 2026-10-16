// Das Geheimland – Etappe 1: die kleine Insel. Laedt nach story.js, vor der Engine.
// Statt der Engine-Startinsel (Radius 260 m, Bahn, Haeuser, Hafen, Rakete, Vorfeld) eine kleine Insel
// (Radius ISEL_R, ~2/3 kleiner): Gras, Sandrand, ein paar Palmen. Am Suedstrand die Huette (begehbar,
// man sieht durch Tuer und Fenster hinein), davor zwei Palmen, dazwischen das Lagerfeuer, dahinter
// Strand und Meer. Moewen fliegen herum, ein paar sitzen am Strand. Meer und Moewengeschrei kommen
// aus der Engine (ambient.js), sobald der Ton an ist.
(function(){
'use strict';
const story = window.STORY;

const ISEL_R = 88;                 // m Grasflaeche (Engine-Startinsel: 260); Sand bis ISEL_R * 1,12
// Alles in Weltkoordinaten (die Engine-Startinsel liegt bei 0, 0). "Sueden" = +z = Blick aufs Meer.
const HUETTE = { x: 0, z: ISEL_R - 14, B: 4.2, T: 3.6, H: 2.4, yaw: 0 };   // Tuer auf +z (zum Meer)
const FEUER = { x: 0, z: HUETTE.z + HUETTE.T / 2 + 5 };
const PALMEN_VORN = [{ x: -3.6, z: FEUER.z + 0.3, h: 6.5, neig: 0.18 }, { x: 3.6, z: FEUER.z - 0.2, h: 7.2, neig: -0.14 }];
const WAND_D = 0.12;               // m Wandstaerke
const TUER_B = 1.0, TUER_H = 1.9;

story.insel = { R: ISEL_R, huette: HUETTE, feuer: FEUER };

// ---- Die Engine auf die kleine Insel umstellen -----------------------------------------------
function hookInsel(){
  const infoOrig = _islandInfoCalc;
  // hookWelt (story.js) laesst nur Zelle 0,0 zu – hier nur noch den Radius verkleinern
  _islandInfoCalc = function(cx, cz){
    const i = infoOrig.apply(this, arguments);
    if(i && cx === 0 && cz === 0) i.radius = ISEL_R;
    return i;
  };
  // Keine Bauten der Engine auf der Insel: Haeuser, Hafen, Rakete, Vorfeld, geparkter X-Wing
  islandBuildings = function(){ return []; };
  rocketLocal = function(){ return null; };
  xwingLocal = function(){ return null; };
  // Gebaut wird nur Sand + Gras (die Engine-Version legt Bahn, Hafen, Rakete usw. dazu)
  buildIsland = function(cx, cz){
    const info = islandInfo(cx, cz);
    if(!info) return null;
    const g = new THREE.Group();
    const sand = new THREE.Mesh(new THREE.CircleGeometry(info.radius * BEACH_FACTOR, 48), sandMat);
    sand.rotation.x = -Math.PI / 2; sand.position.y = ISLAND_Y - 0.05; g.add(sand);
    const geo = new THREE.CircleGeometry(info.radius, 48);
    const uv = geo.attributes.uv, p = geo.attributes.position;
    for(let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + info.wx) / GRASS_TILE_M, (p.getY(i) + info.wz) / GRASS_TILE_M);
    // Die Gras-Kachel der Engine hat Blumen – nur im Inneren; zum Rand hin wird es sandig (Vertex-Farben)
    const gras = new THREE.Mesh(geo, grassMat);
    gras.rotation.x = -Math.PI / 2; gras.position.y = ISLAND_Y; g.add(gras);
    g.position.set(info.wx, 0, info.wz);
    return g;
  };
  // Landebahn gibt es keine (sonst hielte die Engine Stellen fuer Bahn und ziehe die Flieger dorthin)
  isOnRunway = function(){ return false; };
  // KI-Verkehr: keine Landeziele auf der kleinen Insel
  for(const n of ['aiFindRunwayIsland', 'aiFindCargoTarget', 'aiFindDistantIsland']){
    const orig = window[n]; if(typeof orig !== 'function') continue;
    window[n] = function(){ return null; };
  }
  // Huette, Palmen, Feuer, Funkgeraet: Grenzen in ihrer exakten Form ueber den Objekt-Katalog (objekte.js)
  _islandCache.clear(); _subBerthCache.clear(); _xwpCache.clear(); _parkCache.clear();
}

// ---- Bauen -----------------------------------------------------------------------------------
const insel = { gebaut: false, feuerMixer: null, licht: null, t: 0 };
function baueInsel(){
  if(insel.gebaut) return; insel.gebaut = true;
  const w = story.welt(1);
  // Feste Kulisse zuerst (fest: genau an ihren Platz), danach Palmen und Funkgeraet (die weichen aus, wenn dort schon
  // etwas steht)
  const h = story.setze('huette', 1, { x: HUETTE.x, z: HUETTE.z, y: ISLAND_Y, dreh: HUETTE.yaw, fest: true }).obj;
  story.setze('lagerfeuer', 1, { x: FEUER.x, z: FEUER.z, fest: true });
  story.interaktion(h, { name: 'Hütte', x: HUETTE.x, z: HUETTE.z, r: 2.3, yHoehe: 4.6, einmal: true,     // Info
    // war Joshi schon drin, faellt "Geh ruhig rein ..." weg (Live-Wunsch 16.10.)
    text: () => story.innen && story.innen.warDrin ? ['Die Hütte ist dein Zuhause.'] : ['Die Hütte ist dein Zuhause. Geh ruhig rein und schau dich um.'] });
  for(const p of PALMEN_VORN) setzePalme(p);
  // weitere Palmen verteilt (nicht vor der Huette)
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 16; i++){
    const a = rnd() * Math.PI * 2, r = ISEL_R * (0.35 + rnd() * 0.6);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if(Math.hypot(x - FEUER.x, z - FEUER.z) < 18 || Math.hypot(x - HUETTE.x, z - HUETTE.z) < 10) continue;
    setzePalme({ x, z, h: 5.5 + rnd() * 3, neig: (rnd() - 0.5) * 0.4, dreh: rnd() * 6.3 });
  }
  story.lagerAm = { x: FEUER.x, z: FEUER.z };
}
// ---- Katalog: Huette, Palme, Lagerfeuer (objekte.js) ----------------------------------------------------------
story.typ('huette', { bau: () => baueHuette() });
story.typ('palme', { bau: (p) => baePalme(p) });
story.typ('lagerfeuer', { bau: () => ladeFeuer(), danach: feuerDanach });
// Huette 4,2 x 3,6 m aus Holz: Waende mit Tueroeffnung vorn, Fenster vorn links/rechts und an
// beiden Seiten (offen – man sieht hinein), Strohdach, innen Bett, Tisch und Laterne.
function baueHuette(){
  const g = new THREE.Group();
  const holz = new THREE.MeshLambertMaterial({ color: 0x9a6a3c });
  const dunkel = new THREE.MeshLambertMaterial({ color: 0x5b3a1f });
  const boden = new THREE.MeshLambertMaterial({ color: 0x7a5530 });
  const B = HUETTE.B, T = HUETTE.T, H = HUETTE.H, D = WAND_D;
  // Wand aus Brettern mit rechteckigen Oeffnungen: von links nach rechts (u), Oeffnungen [u0, u1, y0, y1]
  function wand(laenge, oeffnungen){
    const wg = new THREE.Group();
    // Raster aus Streifen: zuerst senkrechte Stuecke zwischen den Oeffnungen, dann darueber/darunter
    const xs = [-laenge / 2];
    for(const o of oeffnungen){ xs.push(o[0], o[1]); }
    xs.push(laenge / 2);
    for(let i = 0; i < xs.length - 1; i++){
      const a = xs[i], b = xs[i + 1];
      if(b - a < 0.001) continue;
      const o = oeffnungen.find(q => Math.abs(q[0] - a) < 1e-6 && Math.abs(q[1] - b) < 1e-6);
      const stueck = (y0, y1) => {
        if(y1 - y0 < 0.001) return;
        const m = new THREE.Mesh(new THREE.BoxGeometry(b - a, y1 - y0, D), holz);
        m.position.set((a + b) / 2, (y0 + y1) / 2, 0); wg.add(m);
      };
      if(o){ stueck(0, o[2]); stueck(o[3], H); }
      else stueck(0, H);
    }
    // Brettfugen (dunkle Linien) fuer den Holz-Look, aussen und innen – nur auf der Wand, nicht quer
    // durch Tuer- und Fensteroeffnungen (sah im Eingang wie Latten aus)
    for(let y = 0.3; y < H; y += 0.3){
      for(let i = 0; i < xs.length - 1; i++){
        const a = xs[i], b = xs[i + 1];
        const o = oeffnungen.find(q => Math.abs(q[0] - a) < 1e-6 && Math.abs(q[1] - b) < 1e-6);
        if(b - a < 0.001 || (o && y > o[2] && y < o[3])) continue;
        for(const sgn of [1, -1]){
          const f = new THREE.Mesh(new THREE.BoxGeometry(b - a, 0.025, 0.01), dunkel);
          f.position.set((a + b) / 2, y, sgn * (D / 2 + 0.004)); f.userData.keinKoerper = true; wg.add(f);   // Fuge: liegt auf der Wand
        }
      }
    }
    // Fensterrahmen
    for(const o of oeffnungen){
      if(o[2] < 0.01) continue;              // Tuer: eigener Rahmen
      const rw = 0.07;
      for(const [w2, h2, x2, y2] of [[o[1] - o[0] + rw * 2, rw, (o[0] + o[1]) / 2, o[2] - rw / 2], [o[1] - o[0] + rw * 2, rw, (o[0] + o[1]) / 2, o[3] + rw / 2],
                                    [rw, o[3] - o[2], o[0] - rw / 2, (o[2] + o[3]) / 2], [rw, o[3] - o[2], o[1] + rw / 2, (o[2] + o[3]) / 2],
                                    [rw * 0.6, o[3] - o[2], (o[0] + o[1]) / 2, (o[2] + o[3]) / 2]]){
        const r = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, D + 0.06), dunkel); r.position.set(x2, y2, 0); wg.add(r);
      }
    }
    return wg;
  }
  // Innenseiten tapezieren (wie im Innenraum), damit man es von aussen durch Tuer und Fenster sieht. Die Wand-
  // gruppe zeigt mit +z nach aussen; die Innenseite liegt bei -D/2. Gleiche Oeffnungen wie die Wand.
  const tapM = new THREE.MeshLambertMaterial({ map: story.tex.tapete() });
  const verkM = new THREE.MeshLambertMaterial({ map: story.tex.verkleidung() });
  const SOCKEL = 0.8;
  function innenTapete(laenge, oeffnungen){
    const tg = new THREE.Group(); tg.userData.keinKoerper = true;     // Tapete liegt auf der Wand
    const xs = [-laenge / 2 + 0.08];
    for(const o of oeffnungen){ xs.push(o[0], o[1]); }
    xs.push(laenge / 2 - 0.08);
    for(let i = 0; i < xs.length - 1; i++){
      const a = xs[i], b = xs[i + 1]; if(b - a < 0.001) continue;
      const o = oeffnungen.find(q => Math.abs(q[0] - a) < 1e-6 && Math.abs(q[1] - b) < 1e-6);
      const flaeche = (y0, y1) => {
        for(const [m, u0, u1] of [[verkM, y0, Math.min(y1, SOCKEL)], [tapM, Math.max(y0, SOCKEL), y1]]){
          if(u1 - u0 < 0.001) continue;
          const mat = m.clone(); mat.map = m.map.clone(); mat.map.needsUpdate = true;
          mat.map.repeat.set((b - a) / 1.6, m === tapM ? (u1 - u0) / 1.6 : 1);
          const f = new THREE.Mesh(new THREE.PlaneGeometry(b - a, u1 - u0), mat);
          f.position.set((a + b) / 2, (u0 + u1) / 2, -D / 2 - 0.004); f.rotation.y = Math.PI; tg.add(f);
        }
      };
      if(o){ flaeche(0.06, o[2]); flaeche(o[3], H); } else flaeche(0.06, H);
    }
    return tg;
  }
  const FEN = (u) => [u - 0.35, u + 0.35, 0.95, 1.6];
  // Vorderwand (+z): Fenster links, Tuer Mitte, Fenster rechts
  const OEF_VORN = [FEN(-1.4), [-TUER_B / 2, TUER_B / 2, 0, TUER_H], FEN(1.4)];
  // Innenseite jeder Wandgruppe ist -z (dort liegt die Tapete): die Rueckwand (-T/2) ist um 180 Grad gedreht, die
  // Vorderwand (+T/2) bleibt ungedreht – ihre -z-Seite zeigt nach innen. Oeffnungen sind symmetrisch.
  const vorn = wand(B, OEF_VORN); vorn.add(innenTapete(B, OEF_VORN));
  vorn.position.z = T / 2; g.add(vorn);
  // Tuerrahmen
  for(const [w2, h2, x2, y2] of [[0.1, TUER_H, -TUER_B / 2 - 0.05, TUER_H / 2], [0.1, TUER_H, TUER_B / 2 + 0.05, TUER_H / 2], [TUER_B + 0.2, 0.1, 0, TUER_H + 0.05]]){
    const r = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, D + 0.08), dunkel); r.position.set(x2, y2, T / 2); g.add(r);
  }
  // Tuer: steht nach innen offen (Scharnier links)
  const tuer = new THREE.Mesh(new THREE.BoxGeometry(TUER_B - 0.08, TUER_H - 0.06, 0.05), dunkel);
  tuer.geometry.translate((TUER_B - 0.08) / 2, 0, 0);
  tuer.position.set(-TUER_B / 2 + 0.04, TUER_H / 2, T / 2 - 0.05); tuer.rotation.y = -1.7; g.add(tuer);
  // Rueckwand ohne Oeffnung, Seiten mit je einem Fenster
  const hinten = wand(B, []); hinten.add(innenTapete(B, [])); hinten.position.z = -T / 2; hinten.rotation.y = Math.PI; g.add(hinten);   // -z zeigt nach innen
  for(const sx of [-1, 1]){
    const seite = wand(T, [FEN(0)]); seite.add(innenTapete(T, [FEN(0)]));
    seite.rotation.y = sx * Math.PI / 2; seite.position.x = sx * B / 2; g.add(seite);     // +z der Wand zeigt nach aussen
  }
  // Holzboden (leicht erhoeht) und Eckpfosten
  const bodenTex = story.tex.dielen(); bodenTex.repeat.set(B / 2.5, T / 2.5);
  const bo = new THREE.Mesh(new THREE.BoxGeometry(B, 0.06, T), new THREE.MeshLambertMaterial({ map: bodenTex })); bo.position.y = 0.03; bo.userData.begehbar = true; g.add(bo);
  const tep = story.tex.teppichMesh(1.5, 1.0); tep.position.set(0.5, 0.065, 0.5); tep.userData.begehbar = true; g.add(tep);   // kleiner Strassenteppich
  for(const sx of [-1, 1]) for(const sz of [-1, 1]){
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, H + 0.05, 0.16), dunkel); p.position.set(sx * B / 2, H / 2, sz * T / 2); g.add(p);
  }
  g.add(strohdach(B + 1.0, T + 1.1, H));
  // Innen: Bett, Tisch, Laterne (leuchtet warm – man sieht es durch Fenster und Tuer)
  const decke = new THREE.MeshLambertMaterial({ color: 0x3f6fb5 });
  const bett = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.35, 2.0), holz); bett.position.set(-B / 2 + 0.65, 0.18, -0.4); g.add(bett);
  const dk = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 1.4), decke); dk.position.set(-B / 2 + 0.65, 0.39, -0.1); g.add(dk);
  const kissen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.35), new THREE.MeshLambertMaterial({ color: 0xf2efe6 })); kissen.position.set(-B / 2 + 0.65, 0.42, -1.2); g.add(kissen);
  const tisch = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.6), holz); tisch.position.set(B / 2 - 0.75, 0.75, -T / 2 + 0.55); g.add(tisch);
  for(const sx of [-1, 1]) for(const sz of [-1, 1]){
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.05), dunkel); b.position.set(B / 2 - 0.75 + sx * 0.38, 0.36, -T / 2 + 0.55 + sz * 0.24); g.add(b);
  }
  const lat = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22, 8), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
  lat.position.set(B / 2 - 0.75, 0.9, -T / 2 + 0.55); g.add(lat);
  const ll = new THREE.PointLight(0xffb85a, 1.4, 7, 1.5); ll.position.set(B / 2 - 0.75, 1.3, -T / 2 + 0.55); g.add(ll);
  g.traverse(o => { if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// Strohdach: Satteldach (First laengs x) aus vielen leicht versetzten Strohlagen
function strohdach(B, T, H){
  const g = new THREE.Group();
  const farben = [0xc9a85c, 0xd6b76a, 0xb8954c, 0xcfae62];
  const hoch = 1.5, lagen = 7;
  const flankeL = Math.hypot(T / 2, hoch), neig = Math.atan2(hoch, T / 2);
  for(const sz of [-1, 1]){
    for(let i = 0; i < lagen; i++){
      const k = i / lagen;
      const m = new THREE.Mesh(new THREE.BoxGeometry(B + (i % 2) * 0.08, 0.14, flankeL / lagen + 0.18),
        new THREE.MeshLambertMaterial({ color: farben[(i + (sz > 0 ? 0 : 2)) % farben.length] }));
      // Position entlang der Flanke: von der Traufe (k = 0) zum First
      const d = (k + 0.5 / lagen) * flankeL;
      m.position.set(0, H + 0.05 + Math.sin(neig) * d, sz * (T / 2 - Math.cos(neig) * d));
      m.rotation.x = sz * neig;
      // Fransen an der Traufe: unterste Lage etwas tiefer und laenger
      if(i === 0){ m.scale.set(1.02, 1.3, 1.25); m.position.y -= 0.06; }
      g.add(m);
    }
  }
  // Giebeldreiecke aus Holz, damit man nicht unter das Dach in den Himmel schaut
  const giebel = new THREE.Shape(); giebel.moveTo(-T / 2 + 0.5, 0); giebel.lineTo(T / 2 - 0.5, 0); giebel.lineTo(0, hoch - 0.25); giebel.lineTo(-T / 2 + 0.5, 0);
  const gm = new THREE.MeshLambertMaterial({ color: 0x8a5a33, side: THREE.DoubleSide });
  for(const sx of [-1, 1]){
    const gg = new THREE.Mesh(new THREE.ShapeGeometry(giebel), gm);
    gg.rotation.y = Math.PI / 2; gg.position.set(sx * (B / 2 - 0.5), H, 0); g.add(gg);
  }
  // Firstbuendel
  const first = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, B + 0.1, 8), new THREE.MeshLambertMaterial({ color: 0xa8873e }));
  first.rotation.z = Math.PI / 2; first.position.y = H + hoch + 0.02; g.add(first);
  return g;
}
// Palme aus Grundformen: gebogener Stamm (Segmente), Wedel als gebogene Blaetter, Kokosnuesse
const stammMat = new THREE.MeshLambertMaterial({ color: 0x8b6a45 });
const ringMat = new THREE.MeshLambertMaterial({ color: 0x6e5236 });
const blattMat = new THREE.MeshLambertMaterial({ color: 0x3f8f3a, side: THREE.DoubleSide });
const blattMat2 = new THREE.MeshLambertMaterial({ color: 0x2f7a33, side: THREE.DoubleSide });
const nussMat = new THREE.MeshLambertMaterial({ color: 0x5a3d22 });
function setzePalme(p){ return story.setze('palme', 1, p); }
// Bauplan einer Palme (Fuss bei 0, 0, 0). Grenze: jedes Stammsegment als schraeger Zylinder, die Wedel in Scheiben,
// die Nuesse als Kugeln – unter der Krone kann man durchgehen.
function baePalme(p){
  const g = new THREE.Group();
  const n = 9, h = p.h, neig = p.neig || 0;
  let top = new THREE.Vector3();
  for(let i = 0; i < n; i++){
    const k0 = i / n, k1 = (i + 1) / n;
    const a = new THREE.Vector3(Math.sin(neig) * h * k0 * k0, h * k0, 0);
    const b = new THREE.Vector3(Math.sin(neig) * h * k1 * k1, h * k1, 0);
    const len = a.distanceTo(b), r = 0.22 - 0.09 * k0;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r, len, 7), i % 2 ? stammMat : ringMat);
    seg.position.copy(a).add(b).multiplyScalar(0.5);
    seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    g.add(seg); top = b;
  }
  const krone = new THREE.Group(); krone.position.copy(top); g.add(krone);
  const nBl = 9;
  for(let i = 0; i < nBl; i++){
    const bl = palmblatt(2.6 + (i % 3) * 0.35, i % 2 ? blattMat : blattMat2);
    bl.rotation.y = i / nBl * Math.PI * 2 + (i % 2) * 0.2;
    krone.add(bl);
  }
  for(let i = 0; i < 4; i++){
    const nu = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), nussMat);
    nu.position.set(Math.cos(i * 1.7) * 0.22, -0.2, Math.sin(i * 1.7) * 0.22); krone.add(nu);
  }
  if(p.dreh === undefined) p.dreh = p.x < 0 ? Math.PI : 0;              // vorn: beide neigen nach aussen
  g.traverse(o => { if(o.isMesh) o.castShadow = true; });
  return g;
}
// Ein Wedel: schmaler, nach aussen haengender Streifen (gebogene Flaeche mit Zacken)
function palmblatt(L, mat){
  const seg = 10, geo = new THREE.BufferGeometry(), pos = [], idx = [];
  for(let i = 0; i <= seg; i++){
    const k = i / seg, x = k * L, y = 0.5 * Math.sin(k * Math.PI * 0.7) - k * k * 1.3;
    const b = 0.42 * Math.sin(Math.PI * Math.min(1, k * 1.15)) + 0.04;
    const zack = (i % 2 ? 0.12 : 0);
    pos.push(x, y, -b - zack, x, y + 0.05, 0, x, y, b + zack);
  }
  for(let i = 0; i < seg; i++){
    const a = i * 3, c = a + 3;
    idx.push(a, c, a + 1, a + 1, c, c + 1, a + 1, c + 1, a + 2, a + 2, c + 1, c + 2);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}
// Lagerfeuer (Stage Campfire by daedaljs, CC-BY-4.0), animiert, mit flackerndem Licht
// Bauplan: Modell mittig, Unterkante auf 0 (Promise – das GLB wird erst geladen). Grenze: Steine, Holz und Flamme
// je in Scheiben (die Flamme zaehlt mit: man laeuft nicht durchs Feuer).
function ladeFeuer(){
  return new Promise((fertig) => story.ladeGlb(window.LAGERFEUER_GLB, 'Lagerfeuer', (gl) => {
    const m = gl.scene; m.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(m), sz = bb.getSize(new THREE.Vector3());
    const k = 1.4 / Math.max(sz.x, sz.z); m.scale.multiplyScalar(k);
    m.position.set(-(bb.min.x + bb.max.x) / 2 * k, -bb.min.y * k, -(bb.min.z + bb.max.z) / 2 * k);
    m.traverse(o => { if(o.isMesh){ o.frustumCulled = false;
      if(o.material && o.material.name === 'fire.001'){ o.material.emissive = new THREE.Color(0xff7a20); o.material.emissiveIntensity = 1.2; } } });
    const g = new THREE.Group(); g.add(m); g.userData.clips = gl.animations;
    fertig(g);
  }));
}
function feuerDanach(d){
  const m = d.obj, p = m.position, w = m.parent;
  story.interaktion(m, { name: 'Lagerfeuer', x: p.x, z: p.z, r: 0.7, yHoehe: 1.5, einmal: true,   // Info
    text: ['Das Lagerfeuer sorgt für Gemütlichkeit, Wärme und Licht.'] });
  const clips = m.userData.clips || [];
  if(clips.length){ insel.feuerMixer = new THREE.AnimationMixer(m); for(const a of clips) insel.feuerMixer.clipAction(a).play(); }
  insel.licht = new THREE.PointLight(0xff8a30, 1.3, 22, 1.8);
  insel.licht.position.set(p.x, p.y + 1.4, p.z); w.add(insel.licht);
}

// ---- Moewen: fliegen ueber der Insel, ein paar sitzen am Strand -------------------------------
// Ring-Billed Gull (+ in Flight) by Oregon State University Ecampus, CC-BY-4.0 (moewe_glb.js aus Spiel_SFG).
// Kopf im Modell auf +Z. Messen in der gehaeuteten Haltung wie in SFG (etappe4.js / tiere.js).
const moewen = { sitz: [], flug: [], flugV: null, rnd: null, w: null };
// eine Handvoll naeher am Steg (Live-Wunsch 16.10.: "aber nicht zu nah") – rechts vom Steg, ~12 m daneben am Strand
const STEG_GRUPPE = Math.PI / 2 - 0.14;
function moeweVorlage(gltf, mass, achse){
  const obj = gltf.scene;
  obj.traverse(o => { if(o.isMesh){ o.frustumCulled = false; o.castShadow = false; } });
  const mx = new THREE.AnimationMixer(obj); if(gltf.animations[0]) mx.clipAction(gltf.animations[0]).play(); mx.update(0.01);
  obj.updateMatrixWorld(true);
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  obj.traverse(m => { if(!m.isSkinnedMesh) return; const n = m.geometry.attributes.position.count;
    for(let i = 0; i < n; i += 5){ m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); bb.expandByPoint(v); } });
  const sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
  const k = mass / (achse === 'x' ? sz.x : sz.z);
  obj.scale.multiplyScalar(k);
  obj.position.set(-c.x * k, -bb.min.y * k, -c.z * k);
  mx.stopAllAction(); mx.uncacheRoot(obj);
  const tpl = new THREE.Group(); tpl.add(obj);
  return { tpl, clip: gltf.animations[0] };
}
function moeweKlon(v, w, rnd){
  const k = cloneSkinned(v.tpl); k.userData.deko = true; w.add(k);   // Moewen: Deko, sie fliegen auf
  let mixer = null;
  if(v.clip){ mixer = new THREE.AnimationMixer(k); mixer.clipAction(v.clip).play(); mixer.setTime(rnd() * v.clip.duration); mixer.timeScale = 0.8 + rnd() * 0.4; }
  return { k, mixer };
}
function ladeMoewen(w){
  let s = 31; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  moewen.rnd = rnd; moewen.w = w;
  story.ladeGlb(window.MOEWE_SITZ_GLB, 'Moewe', (g) => {
    const v = moeweVorlage(g, 0.55, 'z');
    // kleine Gruppen rund um den Sandstreifen, Blick aufs Meer (Live-Wunsch 16.10.: mehr – vorher drei Gruppen, man sah
    // meist nur zwei Moewen); nicht am Steg (Winkel PI/2)
    for(const a0 of [Math.PI / 2 + 0.55, Math.PI / 2 - 0.7, -0.4, Math.PI / 2 + 1.3, Math.PI / 2 - 1.45, Math.PI, -1.25, 2.6, -2.3, STEG_GRUPPE]){
      const steg = a0 === STEG_GRUPPE;
      const n = steg ? 5 : 3 + Math.floor(rnd() * 3);
      for(let i = 0; i < n; i++){
        const a = a0 + (rnd() - 0.5) * (steg ? 0.06 : 0.12), r = ISEL_R * (1.03 + rnd() * 0.06);
        const o = moeweKlon(v, w, rnd);
        o.k.position.set(Math.cos(a) * r, ISLAND_Y, Math.sin(a) * r);
        o.k.rotation.y = Math.atan2(Math.cos(a), Math.sin(a)) + (rnd() - 0.5) * 1.4;   // Kopf (+Z) nach aussen
        o.k.scale.multiplyScalar(0.9 + rnd() * 0.2);
        o.a = a; o.r = r;
        moewen.sitz.push(o);
      }
    }
  });
  story.ladeGlb(window.MOEWE_FLUG_GLB, 'Moewe fliegend', (g) => {
    const v = moeweVorlage(g, 1.3, 'x');
    moewen.flugV = v;                                               // auch fuer die auffliegenden Sitzmoewen
    for(let i = 0; i < 10; i++){
      const o = moeweKlon(v, w, rnd);
      const dreh = rnd() < 0.5 ? 1 : -1, r = 25 + rnd() * 70;
      o.kreis = { r, y: 14 + rnd() * 18, w: dreh * (6 + rnd() * 3) / r, a: rnd() * Math.PI * 2, hub: 1 + rnd() * 2, t: rnd() * 10,
        mx: (rnd() - 0.5) * 40, mz: (rnd() - 0.2) * 60 };
      moewen.flug.push(o);
    }
  });
}
function moeweAuf(o, fig){
  if(!o.flieg && moewen.flugV) o.flieg = moeweKlon(moewen.flugV, moewen.w, moewen.rnd);
  if(!o.flieg) return;                                              // fliegendes Modell noch nicht geladen
  o.weg = 'auf'; o.t = 0; o.vy = 3; o.v = 6;
  o.yaw = Math.atan2(o.k.position.x - fig.x, o.k.position.z - fig.z) + (Math.random() - 0.5) * 0.8;
  o.dreh = (Math.random() < 0.5 ? 1 : -1) * (0.25 + Math.random() * 0.15);   // rad/s im Bogen
  o.tKreis = 10 + Math.random() * 6;
}
const MOEWE_HOCH = 9;          // m ueber dem Strand im Bogen
function moeweFliegt(o, dt, fig){
  o.t += dt; const p = o.k.position, platz = { x: Math.cos(o.a) * o.r, z: Math.sin(o.a) * o.r };
  let neig = 0, kipp = 0;
  if(o.weg === 'auf'){
    o.vy = Math.max(0.8, o.vy - dt * 0.6); p.y += o.vy * dt; neig = -0.25;
    if(o.t > 6){ o.weg = 'kreis'; o.t = 0; }
  } else if(o.weg === 'kreis'){
    o.yaw += o.dreh * dt; kipp = Math.sign(o.dreh) * 0.35;
    p.y += (ISLAND_Y + MOEWE_HOCH - p.y) * Math.min(1, dt * 0.5);
    if(o.t > o.tKreis){ o.weg = 'anflug'; o.t = 0; }
  } else if(o.weg === 'anflug'){
    const dx = platz.x - p.x, dz = platz.z - p.z, d = Math.hypot(dx, dz);
    // weich auf den Platz eindrehen, Hoehe mit dem Abstand abbauen, zuletzt langsamer
    let soll = Math.atan2(dx, dz) - o.yaw; soll = Math.atan2(Math.sin(soll), Math.cos(soll));
    o.yaw += klemmeM(soll, -1.2 * dt, 1.2 * dt); kipp = klemmeM(soll, -0.4, 0.4);
    o.v = Math.max(2, Math.min(6, d * 0.4));
    const hoch = ISLAND_Y + Math.min(MOEWE_HOCH, d * 0.25);
    p.y += (hoch - p.y) * Math.min(1, dt * 1.5); neig = 0.15;
    if(d < 0.4){ p.set(platz.x, ISLAND_Y, platz.z); o.weg = 0; o.k.rotation.y = o.yaw; return; }   // gelandet
  }
  p.x += Math.sin(o.yaw) * o.v * dt; p.z += Math.cos(o.yaw) * o.v * dt;
  o.k.rotation.y = o.yaw;
  const f = o.flieg.k; f.position.copy(p); f.position.y += 0.15; f.rotation.set(neig, o.yaw, kipp, 'YXZ');
  if(o.flieg.mixer) o.flieg.mixer.update(dt * (o.weg === 'anflug' && o.v < 3 ? 0.7 : 1.3));
}
const klemmeM = (v, a, b) => Math.max(a, Math.min(b, v));
// Sitzende fliegen auf, wenn man ihnen zu nahe kommt, und landen spaeter wieder an ihrem Platz. Beim Auffliegen wird aus
// der sitzenden die FLIEGENDE Moewe (Live-Wunsch 16.10.: sie flogen in Sitzhaltung davon) – je eine eigene, beim ersten
// Auffliegen gebaut; die sitzende ist so lange unsichtbar
function updateMoewen(dt){
  const cp = camera.position;
  const fig = eva ? eva.group.position : null;
  // auch Fuchsi scheucht sie auf (Live-Wunsch 16.10.) – nur draussen (in der Huette ist er in einer anderen Welt)
  const fu = story.fuchs && story.fuchs.obj && story.fuchs.obj.visible && !(story.innen && story.innen.drin) ? story.fuchs.obj.position : null;
  for(const o of moewen.sitz){
    if(o.mixer) o.mixer.update(dt);
    const dJ = fig ? Math.hypot(fig.x - o.k.position.x, fig.z - o.k.position.z) : 1e9;
    const dF = fu ? Math.hypot(fu.x - o.k.position.x, fu.z - o.k.position.z) : 1e9;
    const nah = dJ < 3.5 || dF < 3.0, von = dF < dJ ? fu : fig;  // weg von dem, der naeher ist
    // Live-Wunsch 16.10.: nicht nach einer Weile wieder am Platz auftauchen, sondern zurueckfliegen und landen. Ablauf:
    // 'auf' (weg und hoch) -> 'kreis' (Bogen ueber dem Meer) -> 'anflug' (zum Platz, sinkt) -> landet = wieder sitzend.
    // Kommt Joshi beim Anflug wieder zu nah, fliegt sie erneut auf.
    if(nah && (!o.weg || o.weg === 'anflug')) moeweAuf(o, von);
    if(o.weg) moeweFliegt(o, dt, fig);
    const fliegt = !!(o.weg && o.flieg);
    o.k.visible = locale === 'earth' && !fliegt;
    if(o.flieg) o.flieg.k.visible = locale === 'earth' && fliegt;
  }
  for(const o of moewen.flug){
    const kr = o.kreis;
    kr.a += kr.w * dt; kr.t += dt;
    o.k.position.set(kr.mx + Math.cos(kr.a) * kr.r, kr.y + Math.sin(kr.t * 0.7) * kr.hub, kr.mz + Math.sin(kr.a) * kr.r);
    const vx = -Math.sin(kr.a) * kr.w, vz = Math.cos(kr.a) * kr.w;
    o.k.rotation.set(0, Math.atan2(vx, vz), 0);
    o.k.rotateZ(Math.sign(kr.w) * 0.35);
    o.k.visible = locale === 'earth';
    if(o.mixer && Math.hypot(o.k.position.x - cp.x, o.k.position.z - cp.z) < 200) o.mixer.update(dt);
  }
}

// ---- Etappe 1 im Bild -------------------------------------------------------------------------
story.updateE1 = function(dt){
  if(story.etappe !== 1) return;
  insel.t += dt;
  if(insel.feuerMixer) insel.feuerMixer.update(dt);
  if(insel.licht) insel.licht.intensity = 1.2 + Math.sin(insel.t * 13) * 0.18 + Math.sin(insel.t * 7.3) * 0.12;
  updateMoewen(dt);
};
story.baueInsel = function(){ baueInsel(); ladeMoewen(story.welt(1)); };

const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookInsel(); };
})();
