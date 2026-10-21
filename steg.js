// Das Geheimland – Steg und Segelboot am Strand (Etappe 1 und 2). Laedt nach insel.js, vor der Engine.
// Live-Wunsch 21.10.2026: auf der Waldinsel (Etappe 2) liegt das Boot an einem Steg, der genauso gebaut ist wie zu Hause –
// darum baut diese Datei Steg und Boot in der Welt der aktuellen Etappe (gleiche Insel-Lage bei 0, 0, gleiche Masse).
// Der Steg liegt genau vor der Huette (in einer Linie mit Huette, Lagerfeuer und Funkgeraet): kurz vor dem Wasser
// zuerst flache Planken auf dem Sand, ab dem Ufer ein Steg auf Pfaehlen aufs Meer hinaus. Er hat Grenzen (man faellt
// nicht seitlich oder vorn hinunter; vom Strand aus kommt man drauf und wieder runter). Daran liegt links (vom Strand
// aufs Meer gesehen = -x) das Segelboot (Sailboat by JinnMx, CC-BY-4.0), Bug aufs Meer.
// Im letzten Drittel des Stegs erscheint ein Y: einsteigen -> kurze Blende -> Joshi sitzt (kniend) im Boot, der Fuchs
// vorn im Bug und schaut aufs Meer. Y im Boot: wieder aussteigen auf den Steg.
// Einsteigen erst, wenn das Abenteuer begonnen hat (story.abenteuerLos: Ausruestung aus der Huette genommen UND
// Funkspruch angenommen – kommt noch). Vorher sagt die Erzaehlerin TEXT_NOCH_NICHT.
(function(){
'use strict';
const story = window.STORY;

const STEG = {
  x: 0, B: 2.2,
  zSand: 95.8,          // Beginn: flache Planken auf dem Sand
  zUfer: 98.6,          // Wasserlinie (Sandrand der Insel, ISEL_R * 1,12) – ab hier auf Pfaehlen
  zEnde: 120,           // Ende draussen
  H: 0.75,              // Hoehe der Planken ueber dem Meeresspiegel (Rampe vom Sand hoch)
};
const BOOT = { x: STEG.x - STEG.B / 2 - 1.5, z: 115, laenge: 6.2 };
const EINSTIEG_AB = STEG.zUfer + (STEG.zEnde - STEG.zUfer) * 2 / 3;   // letztes Drittel des Stegs (auf Pfaehlen)
const TEXT_NOCH_NICHT = ['Du hast hier noch nicht alles entdeckt. Bitte schaue dich in Ruhe weiter um.'];
const RAND = 0.35;      // m: so weit vom Stegrand bleibt die Figur (Koerper) – man faellt nicht hinunter
story.steg = STEG; story.boot = BOOT;
// bx/bz/yaw: wo das Boot gerade ist (es faehrt, siehe updateFahrt), v = Fahrt (m/s)
const s = { gruppe: null, boot: null, bootInnen: null, imBoot: false, t: 0, wechsel: null, sperre: 0, zeichen: null,
  bx: BOOT.x, bz: BOOT.z, yaw: 0, v: 0, eingabe: null, koerper: null };
const FAHRT_MAX = 3.2, FAHRT_RUECK = 0.8;   // m/s vorwaerts / rueckwaerts
const DREH_MAX = 0.55;                      // rad/s in voller Fahrt (im Stand dreht es kaum)
// Kurvenneigung (Live-Wunsch 19.10.2026, wie die Boote in Trip to Japan): leicht in die Kurve, aus Drehrate mal Fahrtanteil
// (Fliehkraft) – im Stand gedreht legt sich nichts. Kommt zur Querlage aus den Wellen dazu.
const KURVE_ROLL_MAX = 0.16;                // rad (~9 Grad; Live-Wunsch 19.10.2026: bei 6 Grad nur zu erahnen – etwas mehr)
const KURVE_ROLL_PRO = 0.45;                // rad je rad/s (DREH_MAX 0,55 rad/s volle Fahrt -> 0,25, gekappt)
const KURVE_ROLL_FOLGT = 2.2;               // 1/s
const FAHRT_WEIT = 260;                     // m: so weit faehrt es vom Steg weg (dahinter laedt die Engine keine Inseln)
const ANLEGEN = 9;                          // m: so nah am Liegeplatz kann man aussteigen
// Live-Wunsch 18.10.2026 ("der Bereich am Steg, an dem man aussteigen kann, darf grosszuegiger werden"): zusaetzlich
// ueberall entlang des Stegs – seitlich und vor seinem Ende – bis ANLEGEN_KANTE von den Planken weg. Nicht mitten auf
// dem Wasser: weiter draussen bleibt "Fahr erst zurueck zum Steg". Ausgestiegen wird wie bisher auf dem Steg neben dem
// Liegeplatz (das Boot legt dort an).
const ANLEGEN_KANTE = 6;
function amSteg(){
  if(Math.hypot(s.bx - BOOT.x, s.bz - BOOT.z) < ANLEGEN) return true;
  const dx = Math.max(0, Math.abs(s.bx - STEG.x) - STEG.B / 2), dz = Math.max(0, s.bz - STEG.zEnde, STEG.zUfer - s.bz);
  return Math.hypot(dx, dz) < ANLEGEN_KANTE;
}
const TEXT_ZURUECK = ['Fahr erst zurück zum Steg. Dann kannst du aussteigen.'];
story.stegZustand = s;

// ---- Boden und Grenzen -----------------------------------------------------------------------
// Auf dem Steg (auch auf den Sandplanken) gilt die Plankenhoehe; die Raender sind Grenze (nur Richtung Strand frei).
function aufSteg(x, z){ return Math.abs(x - STEG.x) < STEG.B / 2 && z >= STEG.zSand && z <= STEG.zEnde; }
function stegY(z){
  // auf dem Sand flach (knapp ueber dem Sand), ab dem Ufer ueber 3 m auf Stegh hoehe ansteigend, dann eben
  const sand = ISLAND_Y + 0.06;
  if(z <= STEG.zUfer) return sand;
  const k = Math.min(1, (z - STEG.zUfer) / 3);
  return sand + (STEG.H - sand) * k;
}
// Gilt fuer (x, z) der Steg als Boden? Nur fuer den, der OBEN ist (Live-Wunsch 15.10.: man soll seitlich und am Ende
// ins Wasser fallen und schwimmen koennen – wer im Wasser ist, schwimmt UNTER dem Steg durch und klettert nicht
// hinauf; nur die flache Rampe am Ufer kann man vom Wasser aus betreten).
const STUFE = 0.45;     // m: so hoch kann die Figur hinaufsteigen
// y: Hoehe dessen, der fragt – fuer Joshis eigene Schritte (story.schrittVon) seine Hoehe; der Fuchs & Co. stehen
// immer oben.
function stegGilt(x, z, y){
  if(!aufSteg(x, z)) return false;
  if(!eva || z <= STEG.zUfer) return true;
  if(story.schwimm && story.schwimm.aktiv) return false;
  if(y === undefined){ const von = story.schrittVon && story.schrittVon(); if(!von) return true; y = von.y; }
  return y > stegY(z) - STUFE;
}
// Darf die Figur nach (x, z)? Auf dem Steg frei; nur entlang des Boots ist die linke Kante eine Grenze (dort liegt
// das Boot, hinein kommt man mit Y).
function stegFrei(x, z){
  if(!stegGilt(x, z)) return null;                              // nicht auf dem Steg: andere Regeln
  if(z > s.bz - BOOT.laenge / 2 - 0.3 && z < s.bz + BOOT.laenge / 2 + 0.3 && x < STEG.x - STEG.B / 2 + RAND && s.bx === BOOT.x) return false;
  return true;
}
function amBoot(x, z){ return Math.abs(x - BOOT.x) < 1.6 && Math.abs(z - BOOT.z) < BOOT.laenge / 2 + 0.4; }
function hookSteg(){
  const solidOrig = evaSolid, fussOrig = evaFootY, wasserOrig = isOpenWater, insWasserOrig = evaEnterDinghy;
  evaSolid = function(x, z){
    if(locale === 'earth'){ const f = stegFrei(x, z); if(f !== null) return f; }
    return solidOrig.apply(this, arguments);
  };
  evaFootY = function(x, z){ if(locale === 'earth' && stegGilt(x, z)) return stegY(z); return fussOrig.apply(this, arguments); };
  isOpenWater = function(x, z){ if(locale === 'earth' && stegGilt(x, z)) return false; return wasserOrig.apply(this, arguments); };
  // Vom Steg ins Wasser: die Engine sucht an der Kante bis 9 m voraus nach Wasser und setzte die Figur sonst hinter
  // das Boot. Vom Steg aus also nur direkt neben der Kante (1,5 m) und nie am Boot vorbei.
  evaEnterDinghy = function(x, z){
    if(eva && locale === 'earth' && stegGilt(eva.group.position.x, eva.group.position.z, eva.group.position.y)){
      const p = eva.group.position;
      if(Math.hypot(x - p.x, z - p.z) > 1.5 || amBoot(x, z)) return;
    }
    return insWasserOrig.apply(this, arguments);
  };
  // Seitlich vom Steg ins flache Wasser (Watzone am Ufer): die Engine setzte die Figur sofort 0,7 m tiefer auf den
  // Grund – stattdessen faellt sie sichtbar hinunter (Schwerkraft der Engine).
  // Nur am Steg (die Huettentuer setzt die Figur 150 m tiefer – das ist kein Sturz).
  const updOrig = updateEva;
  updateEva = function(dt){
    const p = eva && eva.group.position;
    const amSteg = p && locale === 'earth' && !s.imBoot && Math.abs(p.x - STEG.x) < STEG.B / 2 + 1 && p.z > STEG.zUfer && p.z < STEG.zEnde + 1;
    const vorher = amSteg ? p.y : null;
    const r = updOrig.apply(this, arguments);
    if(vorher !== null && eva && eva.onGround && vorher - eva.group.position.y > 0.2 && vorher - eva.group.position.y < 2 && !(story.schwimm && story.schwimm.aktiv)){
      eva.group.position.y = vorher; eva.onGround = false; eva.vy = 0;
    }
    return r;
  };
}
story.stegBoden = (x, z) => (locale === 'earth' && eva && stegGilt(x, z, eva.group.position.y)) ? stegY(z) : null;

// ---- Bauen -----------------------------------------------------------------------------------
// Gezeichneter Meeresgrund unter (x, z): Strahl nach unten auf den Boden der Engine (seabedMesh). Er ist ein grobes Raster,
// zwischen den Gitterpunkten liegt er anders als seabedY – am Steg gemessen 2..4 m tiefer. Ohne Treffer (Boden noch nicht
// gebaut): seabedY.
const PFAHL_EIN = 0.3;          // m, so tief steckt ein Pfahl im Grund
const _pfRay = new THREE.Raycaster(), _pfAb = new THREE.Vector3(0, -1, 0), _pfVon = new THREE.Vector3();
function pfahlGrund(x, z){
  seabedMesh.updateMatrixWorld(true);                           // global-ok: Boden der Engine
  _pfRay.set(_pfVon.set(x, -0.2, z), _pfAb); _pfRay.far = 400;
  const h = _pfRay.intersectObject(seabedMesh, false)[0];       // global-ok
  return h ? h.point.y : seabedY(x, z);                         // global-ok
}
function baue(){
  if(s.gruppe) return;
  const w = story.welt(story.etappe), g = new THREE.Group();
  const planke = new THREE.MeshLambertMaterial({ color: 0x9a7348 }), planke2 = new THREE.MeshLambertMaterial({ color: 0x8a6640 });
  const dunkel = new THREE.MeshLambertMaterial({ color: 0x5b3e24 });
  // Planken quer, leicht unregelmaessig; auf dem Sand flach, dann die Rampe hinauf
  let i = 0;
  for(let z = STEG.zSand; z < STEG.zEnde - 0.01; z += 0.32, i++){
    const p = new THREE.Mesh(new THREE.BoxGeometry(STEG.B - (i % 4 === 1 ? 0.06 : 0), 0.06, 0.28), i % 3 ? planke : planke2);
    const zm = z + 0.14;
    p.position.set(STEG.x + Math.sin(i * 2.3) * 0.02, stegY(zm) - 0.03, zm);
    p.rotation.y = Math.sin(i * 7.1) * 0.012;
    // Rampe: Planke kippen wie die Steigung
    if(zm > STEG.zUfer && zm < STEG.zUfer + 3) p.rotation.x = -Math.atan2(STEG.H - ISLAND_Y, 3);
    p.userData.begehbar = true; g.add(p);
  }
  // Laengstraeger unter dem Pfahlteil
  const L = STEG.zEnde - STEG.zUfer;
  for(const sx of [-1, 1]){
    const tr = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, L - 2.6), dunkel); tr.position.set(STEG.x + sx * (STEG.B / 2 - 0.15), STEG.H - 0.14, STEG.zUfer + 2.6 + (L - 2.6) / 2); g.add(tr);
  }
  // Pfaehle (ab dem Ufer, alle 3 m) bis in den Grund, ein Stueck ueber die Planken (Geländerpfosten). Live-Befund 19.10.:
  // mit fester Laenge (4,6 m, Ende bei -3,45 m) hingen sie im Wasser – der sichtbare Meeresgrund der Engine ist ein grobes
  // Raster (125 m) und liegt am Steg bei -5,8 .. -6,6 m, tiefer als seabedY an der Stelle. Darum misst jeder Pfahl beim
  // Aufbau senkrecht nach unten bis zum GEZEICHNETEN Grund (pfahlGrund) und steckt PFAHL_EIN darin.
  const oben = STEG.H + 0.4;                                     // Pfahlkopf (Geländerpfosten)
  for(let z = STEG.zUfer + 2; z <= STEG.zEnde + 0.01; z += 3){
    for(const sx of [-1, 1]){
      const px = STEG.x + sx * (STEG.B / 2 - 0.04), pz = Math.min(z, STEG.zEnde - 0.15);
      const unten = pfahlGrund(px, pz) - PFAHL_EIN, lang = oben - unten;
      // nach unten etwas dicker (0,11 oben -> 0,13 bei 4,6 m wie bisher, mit der Laenge mitwachsend)
      const pf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11 + 0.02 * lang / 4.6, lang, 8), dunkel);
      pf.position.set(px, (oben + unten) / 2, pz); g.add(pf);
    }
  }
  // niedrige Kante an beiden Seiten des Pfahlteils (zeigt die Grenze) und vorn am Ende
  for(const sx of [-1, 1]){
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, L - 3.2), dunkel); k.position.set(STEG.x + sx * (STEG.B / 2 - 0.05), STEG.H + 0.07, STEG.zUfer + 3.2 + (L - 3.2) / 2); g.add(k);
  }
  const vorn = new THREE.Mesh(new THREE.BoxGeometry(STEG.B, 0.14, 0.1), dunkel); vorn.position.set(STEG.x, STEG.H + 0.07, STEG.zEnde - 0.05); g.add(vorn);
  // Poller am Bootsplatz (linke Seite)
  for(const z of [BOOT.z - 2.2, BOOT.z + 2.2]){ const po = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.42, 10), dunkel); po.position.set(STEG.x - STEG.B / 2 + 0.2, STEG.H + 0.21, z); g.add(po); }
  g.traverse(o => { if(o.isMesh) o.castShadow = true; });
  w.add(g); s.gruppe = g;
  // Pfaehle, Traeger, Kanten (0,14 m: man steigt drueber und kann seitlich ins Wasser), Poller: Grenzen in ihrer Form
  story.ding(g, { welt: story.etappe, typ: 'steg' });
  ladeBoot(w);
}
function ladeBoot(w){
  story.ladeGlb(window.SEGELBOOT_GLB, 'Segelboot', (gl) => {
    const m = gl.scene; m.updateMatrixWorld(true);
    // Rumpf = Mesh "DarkBlue" (z -5,5..4,95 im Modell, Bug bei -z; die Segel ragen bei +z ueber das Heck)
    let rumpf = null; m.traverse(o => { if(o.isMesh){ o.frustumCulled = false; o.castShadow = true; if(/DarkBlue/.test(o.name)) rumpf = o; } });
    const bb = new THREE.Box3().setFromObject(rumpf || m), sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
    const k = BOOT.laenge / sz.z;
    m.scale.multiplyScalar(k);
    // Wasserlinie: das blaue Unterwasserschiff (im Modell bis y ~0,8) soll unter Wasser sein (Live-Hinweis: Blau am Ruder =
    // Wasserlinie), der hoelzerne Bootsboden (y 0,96) aber darueber bleiben – sonst stuende das Meer im Boot
    // Wasserlinie (ausgemessen): blauer Rumpf bis y 0,74 an der Seite, 0,94 am Ruder; tiefste Stelle innen = weisse
    // Innenwand bei 0,46. Bei 0,35 bleibt das Meer unter dem Bootsinneren (kein Wasser im Boot, auch auf dem Wellenberg),
    // und es ist noch etwas Blau zu sehen – an der Seite und am Ruder (Live-Hinweis).
    const WASSERLINIE = 0.35;
    m.position.set(-c.x * k, -WASSERLINIE * k, -c.z * k);
    // Farben nachts: Segel und Rumpf etwas aufhellen (fast schwarz), matt
    m.traverse(o => { if(o.isMesh && o.material){ for(const mt of (Array.isArray(o.material) ? o.material : [o.material])){ mt.metalness = 0;
      if(mt.color){ const h = {}; mt.color.getHSL(h); if(h.l < 0.2) mt.color.setHSL(h.h, h.s, 0.26); } } } });
    const innen = new THREE.Group(); innen.add(m);
    // Live-Befund: der Bug des Modells liegt bei +z (nicht -z) – ungedreht zeigt er schon aufs Meer (+z in der Welt).
    // (Mit der 180-Grad-Drehung schaute das Boot zum Strand.)
    innen.rotation.y = 0;
    // Das Modell selbst liegt um rund 14 Grad schief (ausgemessen: Bordwand links 0,4 m tiefer als rechts) – Live-Wunsch:
    // nur noch die Haelfte davon, eine leichte Kraengung ist beim Segelboot schoen
    innen.rotation.z = -0.12;
    const g = new THREE.Group(); g.add(innen); g.position.set(BOOT.x, 0, BOOT.z);
    // leichter Schatten im Wasser (wie Joshi und der Fuchs): weiches Oval in Rumpfgroesse, knapp ueber der Oberflaeche
    const sc = document.createElement('canvas'); sc.width = sc.height = 64; const sx = sc.getContext('2d'), gr = sx.createRadialGradient(32, 32, 4, 32, 32, 32);
    gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 64, 64);
    const schatten = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false, fog: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    schatten.rotation.x = -Math.PI / 2; schatten.scale.set(3.4, BOOT.laenge * 1.15, 1); schatten.renderOrder = 1;
    schatten.userData.deko = true; w.add(schatten); s.schatten = schatten;
    // Helle Gischt entlang der Wasserlinie (Live-Wunsch: mehr Kontrast zum dunklen Meer): ein schmaler, weicher Ring in
    // Rumpfform auf der Wasseroberflaeche, innen hell, aussen auslaufend; Tiefentest an (der Rumpf verdeckt ihn vorn)
    // Ring als eigene Geometrie (innen leer, aussen weich): Ellipse in Rumpfgroesse, 48 Segmente, innerer und aeusserer
    // Rand; Vertexfarben fuer das Auslaufen (innen weiss, aussen transparent)
    const N = 48, rx0 = 1.18, rz0 = BOOT.laenge * 0.5, breit = 0.55;
    const pos = [], col = [], idx = [];
    for(let i = 0; i <= N; i++){
      const a = i / N * Math.PI * 2, c = Math.cos(a), s2 = Math.sin(a);
      const spitz = 1 - 0.18 * Math.max(0, s2);                    // vorn (Bug, +z) etwas spitzer
      pos.push(c * rx0 * spitz, 0, s2 * rz0, c * (rx0 + breit) * spitz, 0, s2 * (rz0 + breit));
      col.push(0.92, 0.96, 1, 0.92, 0.96, 1);
      if(i < N){ const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const alpha = []; for(let i = 0; i <= N; i++) alpha.push(0.9, 0);  // innen deckend, aussen auslaufend
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setAttribute('alpha', new THREE.Float32BufferAttribute(alpha, 1)); geo.setIndex(idx);
    const gmat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
      uniforms: Object.assign({ staerke: { value: 0.8 } }, hullUniforms),                          // global-ok: Engine (offene Ruempfe)
      vertexShader: 'attribute float alpha; varying float va; varying vec3 vc; varying vec3 vW; attribute vec3 color; void main(){ va = alpha; vc = color; vW = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: HULL_GLSL + 'uniform float staerke; varying float va; varying vec3 vc; varying vec3 vW; void main(){ if(hullCut(vW)) discard; gl_FragColor = vec4(vc, va * staerke); }' });
    const gischt = new THREE.Mesh(geo, gmat); gischt.renderOrder = 2; gischt.frustumCulled = false;
    gischt.userData.deko = true; w.add(gischt); s.gischt = gischt;
    w.add(g); s.boot = g; s.bootInnen = innen;
    // Plaetze im Boot (Live-Skizze): Fuchs vorn im Bug vor dem Mast (Modell z ~ 3,0), Joshi im Heck (Modell z ~ -2,6).
    // Bootskoordinate = (Modell-z - Rumpfmitte) * k
    s.platzFuchs = (3.0 - c.z) * k; s.platzJoshi = (-2.6 - c.z) * k;
    s.deckY = (0.62 - WASSERLINIE) * k;                            // Bootsboden innen (zwischen Innenwand 0,46 und Holz 0,96)
    // Grenze: Rumpf, Mast, Segel in ihrer Form (frei geformt -> in Scheiben), haengt am Boot und faehrt mit. Hinein nur mit Y.
    g.position.y = seaYAt(BOOT.x, BOOT.z);
    s.koerper = story.ding(g, { welt: story.etappe, typ: 'segelboot', beweglich: true });
    meerImBootAus();
  });
}
// Kein Wasser im Boot (Live-Wunsch): das Meer wird im Umriss des Rumpfs nicht gezeichnet. Das macht die Engine fuer alle
// offenen Boote (measureOpenHull / setOpenHull im Flugspiel, seit 19.10.2026): sie vermisst den Rumpf beim Laden in
// mehreren Hoehen und nimmt je Meerespunkt den Umriss in der Hoehe, in der das Wasser dort gerade am Rumpf steht – mit
// Wellen, Kraengung und Kurvenneigung. Hier: Rumpf vermessen (Wasserlinie = y 0 der Bootsgruppe), Schatten dazunehmen.
function meerImBootAus(){
  const g = s.boot;
  g.userData.hull = measureOpenHull(g, { wl: 0, meshes: /DarkBlue|Wood|Board|Flor/ });   // global-ok: Engine
  setOpenHull(g);                                               // global-ok: Engine
  if(s.schatten) addHullCutout(s.schatten.material);            // global-ok: Engine
}

// ---- Einsteigen / Aussteigen (Y) ----------------------------------------------------------------
function amEinstieg(){
  if(!eva || s.imBoot || eva.boat || story.figur.kniet) return false;
  const p = eva.group.position;
  return aufSteg(p.x, p.z) && p.z > EINSTIEG_AB;
}
let yTex = null;
function yZeichen(){
  if(!yTex){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(64, 68, 56, 0, 7); g.fill();
    g.fillStyle = '#f5c518'; g.beginPath(); g.arc(64, 62, 54, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.stroke();
    g.fillStyle = '#1a1a1a'; g.font = 'bold 76px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Y', 64, 66);
    yTex = new THREE.CanvasTexture(c); }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: yTex, depthTest: false, transparent: true })); sp.scale.setScalar(0.6); sp.renderOrder = 999; return sp;
}
let blendeEl = null;
function blende(wert){
  if(!blendeEl){ blendeEl = document.createElement('div'); blendeEl.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:25;'; document.body.appendChild(blendeEl); }
  blendeEl.style.opacity = String(wert);
}
function wechsle(ziel){ if(!s.wechsel && s.boot) s.wechsel = { t: 0, ziel, gesetzt: false }; }
function setzeUm(ziel){
  const g = eva.group, f = story.figur;
  state.throttle = 0;                                           // Boot steht beim Ein- und Aussteigen still
  if(ziel === 'boot'){
    s.imBoot = true;
    // Joshi kniet mittschiffs, Blick zum Bug (aufs Meer = +z -> Engine-yaw PI)
    f.kniet = true; f.aktion = null;
    if(f.acts && f.acts.kneel){ f.cur = 'x'; story.figurAnim ? story.figurAnim('kneel', 0.01, 1) : 0; }
    eva.yaw = Math.PI; g.rotation.y = eva.yaw;
    story.fuchsInsBoot && story.fuchsInsBoot(true);
  } else {
    s.imBoot = false;
    f.kniet = false;
    // angelegt: das Boot liegt wieder an seinem Platz am Steg
    s.bx = BOOT.x; s.bz = BOOT.z; s.yaw = 0; s.v = 0;
    const { x, z } = story.freierPlatz(STEG.x, BOOT.z, 'joshi');
    g.position.set(x, stegY(z), z);
    eva.yaw = 0; g.rotation.y = eva.yaw;                          // Blick zum Strand
    story.fuchsInsBoot && story.fuchsInsBoot(false);
  }
  evaOrbit = 0; evaPitch = 0;
  s.sperre = 0.8;
}
function hookBoot(){
  const yOrig = buttonY;
  buttonY = function(){
    if(s.wechsel || (story.pause && story.pause())) return;        // in Pause und Inventar kein Ein-/Aussteigen
    if(s.imBoot){
      if(amSteg()){ wechsle('steg'); return; }
      if(!s.hinweis){ s.hinweis = true; story.sprich(TEXT_ZURUECK, () => { s.hinweis = false; }); }
      return;
    }
    if(amEinstieg()){
      if(story.abenteuerLos){ wechsle('boot'); return; }
      if(!s.hinweis){ s.hinweis = true; story.sprich(TEXT_NOCH_NICHT, () => { s.hinweis = false; }); }
      return;
    }
    return yOrig.apply(this, arguments);
  };
  // Kamera im Boot: genau hinter dem Heck (Live-Befund 16.10.: vorher hinten LINKS versetzt, das sah schief aus), hoch
  // genug, um ueber Joshi und das Segel hinweg zum Bug aufs Meer zu sehen. LB/RB schwenken zur Seite.
  const camOrig = updateCamera, _k = new THREE.Vector3(), _z = new THREE.Vector3();
  updateCamera = function(){
    if(!(s.imBoot && eva && s.boot)) return camOrig.apply(this, arguments);
    // Der rechte Stick gibt im Boot Schub (wie in allen Fahrzeugen) – umsehen geht mit LB/RB: Blick von links/rechts
    // (sideView der Engine), losgelassen gleitet die Kamera zurueck hinter das Boot
    const seite = sideView ? sideView * Math.PI / 2 : 0;           // Live-Befund 19.10.: mit -sideView waren LB/RB vertauscht
    evaOrbit += (seite - evaOrbit) * Math.min(1, 4 * dtCam);
    const yaw = story.bootYaw() + evaOrbit;                       // Bug-Richtung der Welt (Winkel ab +z)
    const b = s.boot.position;
    _z.set(b.x + Math.sin(yaw) * 3.0, b.y + 1.0, b.z + Math.cos(yaw) * 3.0);       // Blickpunkt: vorn im Boot
    _k.set(b.x - Math.sin(yaw) * 7.8, b.y + 3.8, b.z - Math.cos(yaw) * 7.8);         // mittig hinter dem Heck (18.10.: ein Stueck weiter zurueck, +20 %)
    camera.position.lerp(_k, Math.min(1, 3 * dtCam)); camera.up.set(0, 1, 0); camera.lookAt(_z);
  };
  // Im Boot: Joshi sitzt, der linke Stick faehrt das Boot (vor/zurueck, lenken) – siehe updateFahrt
  const updEvaOrig = updateEva;
  updateEva = function(dt, inp){ if(s.imBoot && eva){ s.eingabe = inp; return; } return updEvaOrig.apply(this, arguments); };
}
// ---- Fahren (Live-Frage 15.10.: "kann das Boot wirklich losfahren?") ---------------------------------------------
// Schub mit dem rechten Stick (bleibt stehen, siehe bootSchub), X Vollgas, A rueckwaerts; linker Stick seitlich = lenken (lenkt nur mit Fahrt, wie ein
// Segelboot). Nicht an Land, nicht in die flache Watzone am Strand, nicht in den Steg. Steckt es schon fest, darf es
// immer hinaus (Lehre aus dem Bagger: Grenzen duerfen nie festhalten).
// Die Engine zaehlt in isOpenWater auch Bauwerke (hitsBuilding) – dazu gehoerte die Grenze des Boots selbst: es
// blockierte sich (gemessen). Waehrend der Pruefung ist sie deshalb aus.
function bootFrei(x, z, yaw){
  if(s.koerper) s.koerper.aus = true;
  try { return bootFreiRoh(x, z, yaw) && bootTiefe(x, z, yaw) <= 0; } finally { if(s.koerper) s.koerper.aus = false; }
}
// Wie tief steckt der Rumpf an dieser Stelle in anderen Dingen (Orcas, Pfaehle)? Geprueft am Rumpfumriss, Tiefgang bis
// 1,5 m unter Wasser, 2 m darueber (objekte.js). Ein Orca, der ganz abgetaucht ist, liegt darunter.
function bootTiefe(x, z, yaw){
  const fx = Math.sin(yaw), fz = Math.cos(yaw), L = BOOT.laenge / 2;
  let t = -Infinity;
  for(const [v, q] of [[L * 0.8, 0], [-L * 0.8, 0], [0, 0.7], [0, -0.7], [L * 0.4, 0], [-L * 0.4, 0]]){
    const px = x + fx * v + fz * q, pz = z + fz * v - fx * q;
    t = Math.max(t, story.tiefe(px, pz, -1.5, 3.5, 0.35, 0));
  }
  return t;
}
function bootFreiRoh(x, z, yaw){
  const fx = Math.sin(yaw), fz = Math.cos(yaw), L = BOOT.laenge / 2;
  for(const [v, q] of [[L, 0], [-L, 0], [0, 1.0], [0, -1.0], [L * 0.6, 0.8], [L * 0.6, -0.8], [-L * 0.6, 0.8], [-L * 0.6, -0.8]]){
    const px = x + fx * v + fz * q, pz = z + fz * v - fx * q;
    if(!isOpenWater(px, pz) || story.watGrund(px, pz) !== null) return false;
    if(Math.abs(px - STEG.x) < STEG.B / 2 + 0.3 && pz > STEG.zSand && pz < STEG.zEnde + 0.4) return false;   // Steg + Pfaehle
  }
  return Math.hypot(x - BOOT.x, z - BOOT.z) < FAHRT_WEIT;
}
// Steuerung wie in allen Fahrzeugen der Engine (Live-Wunsch 16.10.): der SCHUB (state.throttle) wird mit dem rechten
// Stick (W/S) in 10-%-Stufen gestellt und bleibt stehen; X (Shift) = Vollgas, A (C) halten = rueckwaerts/Bremse; der
// linke Stick lenkt. Die Engine setzt state.throttle in readInput, story.js laesst es im Boot stehen (bootSchub).
// X = Vollgas setzt das Boot selbst (boostDruck der Engine hat X-Wing-Sonderwege).
function bootSchub(){
  if(keys['ShiftLeft'] || keys['ShiftRight']) return 1;
  if(gamepadIndex !== null){ const gp = navigator.getGamepads()[gamepadIndex]; if(gp && gp.buttons[2] && gp.buttons[2].pressed) return 1; }
  return Math.max(-0.2, Math.min(1, state.throttle || 0));
}
story.bootSchub = bootSchub;
function updateFahrt(dt){
  const inp = s.eingabe || {}; s.eingabe = null;
  const lenk = inp.yaw || 0, schub = bootSchub();
  const soll = schub >= 0 ? schub * FAHRT_MAX : schub / 0.2 * FAHRT_RUECK;
  s.v += (soll - s.v) * Math.min(1, dt * (Math.abs(soll) > Math.abs(s.v) ? 0.7 : 1.2));   // traege anfahren, etwas schneller bremsen
  s.yaw -= lenk * DREH_MAX * Math.min(1, Math.abs(s.v) / 1.5 + 0.15) * Math.sign(s.v || 1) * dt;
  const nx = s.bx + Math.sin(s.yaw) * s.v * dt, nz = s.bz + Math.cos(s.yaw) * s.v * dt;
  // steckt es schon fest (z. B. am Liegeplatz knapp an der Watzone), darf es nur WEG von der Insel (Mitte 0,0); steckt es
  // in einem Ding (ein Orca ist herangeschwommen), darf es jede Fahrt, die nicht tiefer hineinfuehrt – nie verhaken
  let raus = false;
  if(!bootFrei(s.bx, s.bz, s.yaw)){
    if(s.koerper) s.koerper.aus = true;
    try {
      const tJetzt = bootTiefe(s.bx, s.bz, s.yaw);
      if(tJetzt > 0) raus = bootFreiRoh(nx, nz, s.yaw) && bootTiefe(nx, nz, s.yaw) <= tJetzt + 1e-6;
      else raus = Math.hypot(nx, nz) > Math.hypot(s.bx, s.bz);
    } finally { if(s.koerper) s.koerper.aus = false; }
  }
  if(bootFrei(nx, nz, s.yaw) || raus){ s.bx = nx; s.bz = nz; }
  else s.v *= 0.3;                                              // angestossen: fast stehen bleiben
}
story.bootFrei = bootFrei;
story.updateSteg = function(dt){
  if(story.etappe !== 1 && story.etappe !== 2) return;
  baue();
  s.t += dt;
  // Boot schaukelt mit der Duenung
  // Boot schwimmt auf der Duenung, schaukelt nur leicht (es lag sichtbar schief)
  // Schatten auf der Welle – wie der Ovalschatten der Engine beim Feuerwehrboot: auf den HOECHSTEN Wellenpunkt unter
  // seiner Flaeche (Mitte + Bug/Heck + Seiten), nicht auf die Mitte – sonst tauchte der Rand ein bzw. lief Schatten und
  // Boot mit den Wellen auseinander (Lehre aus dem Flugspiel). Mit Tiefentest verdeckt der Rumpf seinen Schatten.
  if(s.imBoot && !s.wechsel) updateFahrt(dt);
  if(s.schatten){ const L = BOOT.laenge * 0.55; let hoch = -1e9;
    for(const [dx, dz] of [[0, 0], [0, L], [0, -L], [1.5, 0], [-1.5, 0], [1.1, L * 0.6], [-1.1, L * 0.6], [1.1, -L * 0.6], [-1.1, -L * 0.6]]) hoch = Math.max(hoch, seaYAt(s.bx + dx, s.bz + dz));
    s.schatten.position.set(s.bx + 0.15, hoch + 0.03, s.bz); s.schatten.rotation.z = s.yaw;
    if(s.gischt){ s.gischt.position.set(s.bx, hoch + 0.05, s.bz); s.gischt.rotation.y = s.yaw;
      s.gischt.material.uniforms.staerke.value = 0.7 + Math.sin(s.t * 2.3) * 0.15 + Math.min(0.3, Math.abs(s.v) * 0.1); } }   // in Fahrt etwas mehr Gischt
  if(s.boot){ const b = s.boot;
    // Live-Befund 16.10.: bei Wellengang lief rechts Wasser ins Boot. Das Boot sass mit der MITTE auf der Welle und
    // schaukelte nur ein wenig – die Welle selbst ist aber schraeg: lag sie rechts hoeher, stieg sie ueber den Rand. Jetzt
    // folgt das Boot der Wasserflaeche: Hoehe = Mittel aus Bug/Heck/Seiten (nie tiefer als die Mitte), Neigung laengs aus
    // Bug - Heck, quer aus rechts - links (gedaempft, damit es nicht zittert).
    const fx = Math.sin(s.yaw), fz = Math.cos(s.yaw), L = BOOT.laenge * 0.4, Q = 0.8;
    const yB = seaYAt(s.bx + fx * L, s.bz + fz * L), yH = seaYAt(s.bx - fx * L, s.bz - fz * L);
    const yR = seaYAt(s.bx - fz * Q, s.bz + fx * Q), yL = seaYAt(s.bx + fz * Q, s.bz - fx * Q), yM = seaYAt(s.bx, s.bz);
    const nick = Math.atan2(yH - yB, 2 * L), roll = Math.atan2(yR - yL, 2 * Q);
    const k = Math.min(1, dt * 4);
    s.nick = (s.nick || 0) + (nick - (s.nick || 0)) * k; s.roll = (s.roll || 0) + (roll - (s.roll || 0)) * k;
    // Kurvenneigung: Drehrate aus dem Kurs (s.yaw), mal Fahrtanteil, in die Kurve hinein. Das Vorzeichen ist hier ANDERS als in
    // Trip to Japan: der Bug zeigt auf +z (dort -z), damit dreht sich die Rollrichtung um – mit dem Vorzeichen von dort legte
    // es sich nach aussen (gemessen, C:/tmp/jfg/test/segel_neigen2.js).
    if(s.yawVor === undefined || dt <= 0) s.yawVor = s.yaw;
    let dy = s.yaw - s.yawVor; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); s.yawVor = s.yaw;
    const fahrt = Math.min(1, Math.abs(s.v) / FAHRT_MAX);
    const kurveZiel = dt > 0 ? Math.max(-KURVE_ROLL_MAX, Math.min(KURVE_ROLL_MAX, -dy / dt * KURVE_ROLL_PRO * fahrt)) : 0;
    s.kurve = (s.kurve || 0) + (kurveZiel - (s.kurve || 0)) * Math.min(1, KURVE_ROLL_FOLGT * dt);
    b.position.set(s.bx, Math.max(yM, (yB + yH + yR + yL) / 4), s.bz);
    b.rotation.set(s.nick + Math.sin(s.t * 0.6 + 1) * 0.006, s.yaw, s.roll + s.kurve + Math.sin(s.t * 0.9) * 0.008, 'YXZ'); b.updateMatrixWorld(true);
  }
  // im Boot: Joshi mittschiffs (etwas hinter der Mitte), sitzt auf den Bodenbrettern und schaukelt mit
  if(s.imBoot && eva && s.boot){
    // Joshi kniet hinten im Heck, zwischen hinterer Bank und Ruder (Live-Skizze; Modell z ~ -2,6), auf dem Bootsboden
    const p = new THREE.Vector3(0, s.deckY + 0.05, s.platzJoshi).applyMatrix4(s.boot.matrixWorld);
    eva.group.position.copy(p); eva.vy = 0; eva.onGround = true;
    eva.yaw = story.bootYaw() + Math.PI;                       // Blick zum Bug (Engine: Nase -Z)
    eva.group.rotation.set(s.boot.rotation.x, eva.yaw, s.boot.rotation.z);
  }
  // Wechsel mit Blende
  if(s.wechsel){
    const w = s.wechsel; w.t += dt;
    if(w.t < 0.35) blende(w.t / 0.35);
    else { if(!w.gesetzt){ w.gesetzt = true; setzeUm(w.ziel); } blende(Math.max(0, 1 - (w.t - 0.35) / 0.45)); if(w.t > 0.8){ s.wechsel = null; blende(0); } }
  }
  if(s.sperre > 0) s.sperre -= dt;
  // Y am Einstieg (bzw. im Boot zum Aussteigen)
  const zeigen = !s.wechsel && (amEinstieg() || s.imBoot);
  if(zeigen && !s.zeichen){ s.zeichen = yZeichen(); story.welt(story.etappe).add(s.zeichen); }
  if(s.zeichen){
    s.zeichen.visible = zeigen;
    // im Boot: das Y zum Aussteigen nur, wenn das Boot am Steg liegt UND (fast) steht – beim Fahren kein Y (Live-Wunsch)
    if(s.imBoot && (!amSteg() || Math.abs(s.v) > 0.3)) s.zeichen.visible = false;
    if(zeigen){ const p = s.imBoot ? eva.group.position : new THREE.Vector3(BOOT.x, STEG.H, BOOT.z);
      s.zeichen.position.set(p.x, (s.imBoot ? p.y + 1.6 : STEG.H + 2.4) + Math.sin(s.t * 3) * 0.07, p.z); }
  }
};
story.imBoot = () => s.imBoot;
// Etappenwechsel ohne Neuladen (story.js etappeWechsel): Steg, Boot, Schatten, Gischt und Y in die Welt der neuen Etappe
// (gleiche Lage – die Inseln liegen beide bei 0, 0), die Grenzen gelten dort. Das Boot liegt angelegt am Steg; sass Joshi
// darin, steigt er sofort aus (die neue Etappe setzt ihn danach auf seinen Startplatz).
story.etappeWechselHooks.push(function(n){
  const w = story.welt(n);
  for(const o of [s.gruppe, s.boot, s.schatten, s.gischt, s.zeichen]) if(o) w.add(o);
  for(const d of story.dinge) if(d.obj === s.gruppe || d.obj === s.boot) d.welt = n;
  s.wechsel = null; blende(0); state.throttle = 0;
  if(s.imBoot && eva) setzeUm('steg');
  s.bx = BOOT.x; s.bz = BOOT.z; s.yaw = 0; s.v = 0;
});
// Etappe 2 (waldinsel.js): Joshi und der Fuchs sitzen nach der Ankunft noch im Boot am Steg – vor dem Start dorthin setzen,
// mit "Los geht's" steigen sie aus (wie Y am Steg). Das Boot steht dabei schon an seinem Liegeplatz.
story.imBootStarten = function(){ baue(); if(!eva || s.imBoot) return; setzeUm('boot'); s.sperre = 0; };
story.stegAussteigen = function(){ if(s.imBoot && !s.wechsel) wechsle('steg'); };
// Bordwand an der Laengsstelle vor (m, Heck -L/2 .. Bug +L/2): x links (seite -1) bzw. rechts (+1). Live-Befund 17.10.:
// der Rumpf ist unsymmetrisch (links -0,97, rechts +0,78 m) – die Gischt startete rechts bei +0,8 m fest und lag damit IM
// Boot (segeln.js nimmt jetzt diese Wand). Ohne oben: auf der Wasserlinie, aus der Vermessung der Engine (measureOpenHull,
// Zeile auf Hoehe 0). oben = true: die BORDKANTE (Draufsicht, breiteste Stelle bis Relinghoehe) – der Rumpf ist oben
// deutlich breiter als an der Wasserlinie; was nur ausserhalb der Wasserlinie liegt, sieht man von oben/hinten noch "im
// Boot" (Live-Bild 17.10.). RUMPF_OBEN: ausgemessen (C:/tmp/jfg/test/rumpf3.js), je Scheibe das Maximum der Nachbarn.
const RUMPF_OBEN = [[-0.14, 0.16], [-0.68, 0.60], [-1.10, 1.04], [-1.10, 1.04], [-1.17, 1.14], [-1.20, 1.18], [-1.20, 1.18], [-1.20, 1.18],
                    [-1.17, 1.16], [-1.17, 1.16], [-1.11, 1.10], [-1.03, 0.97], [-1.03, 0.97], [-0.82, 0.76], [-0.82, 0.76], [-0.49, 0.40]];
function rumpfWasserlinie(){
  const h = s.boot && s.boot.userData.hull; if(!h) return RUMPF_OBEN.map(r => [r[0] * 0.8, r[1] * 0.8]);
  const j = Math.round(-h.y0 / h.dh), T = [];                    // Zeile auf Hoehe 0 (Wasserlinie)
  for(let k = 0; k < HULL_NS; k++){ const n = (j * HULL_NS + k) * 2; T.push([h.lr[n], h.lr[n + 1]]); }   // global-ok: Engine
  return T;
}
story.bordwand = function(vor, seite, oben){
  const T = oben ? RUMPF_OBEN : rumpfWasserlinie();
  const N = T.length, f = klemmeS((vor / BOOT.laenge + 0.5) * N - 0.5, 0, N - 1), i = Math.min(N - 2, Math.floor(f)), t = f - i;
  const j = seite < 0 ? 0 : 1; return T[i][j] + (T[i + 1][j] - T[i][j]) * t;
};
const klemmeS = (v, a, b) => Math.max(a, Math.min(b, v));
story.bootPunkt = (vor, seit, hoch) => s.boot ? new THREE.Vector3(seit || 0, s.deckY + (hoch || 0), vor || 0).applyMatrix4(s.boot.matrixWorld) : null;
// Bug-Richtung in der Welt als Winkel ab +z (wie fuchs.yaw): vorn im Boot = lokale +z-Achse der Bootsgruppe
const _bv = new THREE.Vector3();
story.bootYaw = () => { if(!s.boot) return 0; _bv.set(0, 0, 1).transformDirection(s.boot.matrixWorld); return Math.atan2(_bv.x, _bv.z); };
story.aufSteg = aufSteg;

const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookSteg(); hookBoot(); };
})();
